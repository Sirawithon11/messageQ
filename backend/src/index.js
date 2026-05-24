require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { init: initWS } = require('./websocket');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

initWS(server);

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

server.listen(PORT, () => console.log(`Backend running on http://${process.env.Backend || 'localhost'}:${PORT}`));
