const pool = require('../db');
const { ValidationError } = require('../errors');
const { getIO } = require('../websocket');

async function getAllOrders() {
  const { rows } = await pool.query(`
    SELECT o.*, json_agg(json_build_object(
      'product_id', oi.product_id,
      'name', p.name,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price
    )) AS items
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `);
  return rows;
}

async function createOrder({ customer_name, customer_email, items }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let total_price = 0;
    const enrichedItems = [];

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT * FROM products WHERE id=$1 FOR UPDATE',
        [item.product_id]
      );
      if (rows.length === 0) throw new ValidationError(`Product ${item.product_id} not found`);
      const product = rows[0];
      if (product.stock < item.quantity)
        throw new ValidationError(`Insufficient stock for "${product.name}"`);

      total_price += product.price * item.quantity;
      enrichedItems.push({ product, quantity: item.quantity });
    }

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (customer_name, customer_email, total_price)
       VALUES ($1, $2, $3) RETURNING *`,
      [customer_name, customer_email, total_price]
    );
    const order = orderRows[0];

    for (const { product, quantity } of enrichedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, product.id, quantity, product.price]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [quantity, product.id]
      );
    }

    await client.query('COMMIT');

    const stockUpdates = enrichedItems.map(({ product, quantity }) => ({
      id: product.id,
      stock: product.stock - quantity,
    }));

    getIO().emit('stock:update', stockUpdates);

    return {
      ...order,
      items: enrichedItems.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        unit_price: i.product.price,
      })),
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getAllOrders, createOrder };
