# WebSocket Flow — Real-time Stock Updates

When any user places an order, every browser viewing the shop sees the stock change instantly — no page refresh needed.

---

## Overview

```
Browser A (places order)        Backend                  Browser B, C (viewing shop)
        |                           |                              |
        |--- POST /api/orders ----->|                              |
        |                     COMMIT to DB                        |
        |                     emit('stock:update') -------------->|
        |<-- 201 response ----------|              setProducts()  |
        |                           |          (UI updates live)  |
```

---

## Part 1 — WebSocket Server Setup: `backend/src/websocket.js`

```js
let io;  // module-level singleton

function init(server) {
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => { ... });
}

function getIO() {
  return io;  // any file can call getIO().emit(...)
}
```

`io` is created once when the server starts. `getIO()` lets any service file broadcast without needing to pass `io` as a parameter.

---

## Part 2 — Attach to HTTP Server: `backend/src/index.js`

```js
const server = http.createServer(app);  // wrap Express in raw HTTP server
initWS(server);                          // attach Socket.io to same server
server.listen(PORT);                    // one port handles both HTTP and WS
```

Socket.io requires a raw `http.Server` because WebSocket connections start as an HTTP Upgrade request. That is why `app.listen()` was replaced with `http.createServer(app)` + `server.listen()`.

---

## Part 3 — Emit After Order: `backend/src/services/orderService.js`

```js
await client.query('COMMIT');  // DB saved successfully first

const stockUpdates = enrichedItems.map(({ product, quantity }) => ({
  id: product.id,
  stock: product.stock - quantity,  // e.g. 10 - 3 = 7
}));

getIO().emit('stock:update', stockUpdates);
// broadcasts [{ id: 1, stock: 7 }, { id: 3, stock: 0 }] to all clients
```

`emit` is called **only after a successful COMMIT**. If the transaction fails, execution goes to `ROLLBACK` + `throw`, so no incorrect data is ever broadcast.

---

## Part 4 — Frontend Hook: `frontend/src/hooks/useStockSocket.js`

```js
export function useStockSocket(onStockUpdate) {
  useEffect(() => {
    const socket = io('http://localhost:4000');  // open persistent WS connection
    socket.on('stock:update', onStockUpdate);    // register listener
    return () => { socket.disconnect(); };       // cleanup on unmount
  }, [onStockUpdate]);
}
```

`useEffect` runs when the component mounts, keeping the connection alive while the user is on the page. The cleanup function disconnects automatically when they leave.

---

## Part 5 — Update UI in Real-time: `frontend/src/pages/shop.jsx`

```js
useStockSocket(useCallback((updates) => {
  setProducts((prev) =>
    prev.map((p) => {
      const update = updates.find((u) => u.id === p.id);
      return update ? { ...p, stock: update.stock } : p;
    })
  );
}, []));
```

When `stock:update` arrives, only the `stock` field is patched in the existing state — no full refetch. React re-renders the affected `ProductCard`, which disables the "Add to Cart" button and shows the "Out of Stock" badge when `stock === 0`.

`useCallback(..., [])` prevents the function reference from changing on every render, which would otherwise reconnect the socket repeatedly.

---

## Full Data Flow

```
[Server starts]
  index.js
    └─ http.createServer(app)
    └─ initWS(server)  →  websocket.js creates io instance

[Browser opens /shop]
  shop.jsx mounts
    └─ useStockSocket()
         └─ useEffect: io.connect(localhost:4000)
              └─ socket.on('stock:update', callback)  ← waiting

[User A clicks Place Order]
  POST /api/orders
    └─ orderService.createOrder()
         ├─ BEGIN
         ├─ SELECT stock FOR UPDATE  ← row lock
         ├─ INSERT orders + order_items
         ├─ UPDATE products SET stock = stock - qty
         ├─ COMMIT
         └─ getIO().emit('stock:update', [...])  ← broadcast

[Every browser on /shop receives the event]
  socket.on('stock:update') fires
    └─ setProducts(prev => patch stock values)
         └─ React re-renders ProductCard
              └─ stock === 0  →  button disabled + "Out of Stock" badge
```

---

## WebSocket Event

| Event          | Direction        | Payload                           |
|----------------|------------------|-----------------------------------|
| `stock:update` | Server → Clients | `[{ id: number, stock: number }]` |

---

## Database Schema

### `products`

| Column        | Type           | Description               |
|---------------|----------------|---------------------------|
| `id`          | SERIAL PK      | Auto-increment ID         |
| `name`        | VARCHAR(255)   | Product name              |
| `description` | TEXT           | Product description       |
| `price`       | DECIMAL(10,2)  | Price                     |
| `stock`       | INTEGER        | Available quantity        |
| `image_url`   | TEXT           | Product image URL         |
| `created_at`  | TIMESTAMP      | Created datetime          |
| `updated_at`  | TIMESTAMP      | Last updated datetime     |

### `orders`

| Column           | Type          | Description          |
|------------------|---------------|----------------------|
| `id`             | SERIAL PK     | Auto-increment ID    |
| `customer_name`  | VARCHAR(255)  | Customer name        |
| `customer_email` | VARCHAR(255)  | Customer email       |
| `total_price`    | DECIMAL(10,2) | Total order price    |
| `created_at`     | TIMESTAMP     | Order datetime       |

### `order_items`

| Column       | Type          | Description                              |
|--------------|---------------|------------------------------------------|
| `id`         | SERIAL PK     | Auto-increment ID                        |
| `order_id`   | INTEGER FK    | References `orders(id)` ON DELETE CASCADE |
| `product_id` | INTEGER FK    | References `products(id)` ON DELETE SET NULL |
| `quantity`   | INTEGER       | Quantity ordered                         |
| `unit_price` | DECIMAL(10,2) | Price at time of order                   |
