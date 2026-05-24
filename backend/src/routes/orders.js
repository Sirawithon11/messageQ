const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const handle = require('../utils/handler');

router.get('/', handle(async () => ({
  body: await orderService.getAllOrders(),
})));

router.post('/', handle(async (req) => {
  const { customer_name, customer_email, items } = req.body;
  if (!customer_name || !customer_email || !items || items.length === 0)
    return { status: 400, body: { error: 'customer_name, customer_email, and items are required' } };
  return { status: 201, body: await orderService.createOrder({ customer_name, customer_email, items }) };
}));

module.exports = router;
