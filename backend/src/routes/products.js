const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const handle = require('../utils/handler');

router.get('/', handle(async () => ({
  body: await productService.getAllProducts(),
})));

router.get('/:id', handle(async (req) => ({
  body: await productService.getProductById(req.params.id),
})));

router.post('/', handle(async (req) => {
  const { name, description, price, stock, image_url } = req.body;
  if (!name || price === undefined || stock === undefined)
    return { status: 400, body: { error: 'name, price, and stock are required' } };
  return { status: 201, body: await productService.createProduct({ name, description, price, stock, image_url }) };
}));

router.put('/:id', handle(async (req) => {
  const { name, description, price, stock, image_url } = req.body;
  if (!name || price === undefined || stock === undefined)
    return { status: 400, body: { error: 'name, price, and stock are required' } };
  return { body: await productService.updateProduct(req.params.id, { name, description, price, stock, image_url }) };
}));

router.delete('/:id', handle(async (req) => {
  await productService.deleteProduct(req.params.id);
  return { body: { message: 'Product deleted' } };
}));

module.exports = router;
