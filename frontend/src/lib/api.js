import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

export const getProducts = () => api.get('/api/products').then(r => r.data);
export const getProduct = (id) => api.get(`/api/products/${id}`).then(r => r.data);
export const createProduct = (data) => api.post('/api/products', data).then(r => r.data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data).then(r => r.data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`).then(r => r.data);
export const createOrder = (data) => api.post('/api/orders', data).then(r => r.data);
