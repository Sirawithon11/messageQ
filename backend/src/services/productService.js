const pool = require('../db');
const { NotFoundError } = require('../errors');

async function getAllProducts() {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
  return rows;
}

async function getProductById(id) {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  if (rows.length === 0) throw new NotFoundError(`Product ${id} not found`);
  return rows[0];
}

async function createProduct({ name, description, price, stock, image_url }) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, description, price, stock, image_url)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, description, price, stock, image_url]
  );
  return rows[0];
}

async function updateProduct(id, { name, description, price, stock, image_url }) {
  const { rows } = await pool.query(
    `UPDATE products
     SET name=$1, description=$2, price=$3, stock=$4, image_url=$5, updated_at=NOW()
     WHERE id=$6 RETURNING *`,
    [name, description, price, stock, image_url, id]
  );
  if (rows.length === 0) throw new NotFoundError(`Product ${id} not found`);
  return rows[0];
}

async function deleteProduct(id) {
  const { rows } = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [id]);
  if (rows.length === 0) throw new NotFoundError(`Product ${id} not found`);
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
