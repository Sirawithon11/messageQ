import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts, createOrder } from '../lib/api';
import { useStockSocket } from '../hooks/useStockSocket';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]); // [{ product, quantity }]
  const [fetchError, setFetchError] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [orderForm, setOrderForm] = useState({ customer_name: '', customer_email: '' });
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      const initQty = {};
      data.forEach((p) => { initQty[p.id] = 1; });
      setQuantities(initQty);
    } catch {
      setFetchError('Failed to load products. Is the backend running?');
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useStockSocket(useCallback((updates) => {
    setProducts((prev) =>
      prev.map((p) => {
        const update = updates.find((u) => u.id === p.id);
        return update ? { ...p, stock: update.stock } : p;
      })
    );
  }, []));

  const handleAddToCart = (product, qty) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
            : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    setShowCart(true);
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleOrder = async (e) => {
    e.preventDefault();
    setOrdering(true);
    setOrderError('');
    try {
      const result = await createOrder({
        customer_name: orderForm.customer_name,
        customer_email: orderForm.customer_email,
        items: cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      setOrderSuccess(result);
      setCart([]);
      setOrderForm({ customer_name: '', customer_email: '' });
      await fetchProducts();
    } catch (err) {
      setOrderError(err.response?.data?.error || 'Order failed. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and buy products.</p>
        </div>
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative bg-white border border-gray-200 shadow-sm hover:shadow-md text-gray-800 text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-shadow"
        >
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-700 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {fetchError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {fetchError}
        </div>
      )}

      {/* Order success banner */}
      {orderSuccess && (
        <div className="mb-6 px-6 py-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="font-semibold text-green-800 mb-1">Order placed successfully!</p>
          <p className="text-sm text-green-700">
            Order #{orderSuccess.id} for {orderSuccess.customer_name} — Total: ${parseFloat(orderSuccess.total_price).toFixed(2)}
          </p>
          <button
            onClick={() => setOrderSuccess(null)}
            className="mt-2 text-xs text-green-600 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Product grid */}
        <div className="flex-1">
          {products.length === 0 && !fetchError ? (
            <p className="text-gray-400 text-sm py-16 text-center">No products available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  qty={quantities[p.id] || 1}
                  onQtyChange={(v) => setQuantities((q) => ({ ...q, [p.id]: v }))}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cart sidebar */}
        {showCart && (
          <aside className="w-80 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
              </div>

              {cart.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Cart is empty.</p>
              ) : (
                <>
                  <ul className="space-y-3 mb-4">
                    {cart.map((item) => (
                      <li key={item.product.id} className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × ${parseFloat(item.product.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-semibold text-blue-700">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-100 pt-3 mb-4 flex justify-between text-sm font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>

                  {/* Checkout form */}
                  <form onSubmit={handleOrder} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={orderForm.customer_name}
                        onChange={(e) => setOrderForm((f) => ({ ...f, customer_name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={orderForm.customer_email}
                        onChange={(e) => setOrderForm((f) => ({ ...f, customer_email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    {orderError && (
                      <p className="text-xs text-red-600">{orderError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={ordering}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-md text-sm disabled:opacity-50"
                    >
                      {ordering ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
