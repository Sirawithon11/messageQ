import { useState, useEffect, useCallback } from 'react';
import ProductTable from '../components/ProductTable';
import ProductForm from '../components/ProductForm';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../lib/api';

export default function ManagePage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // null = add mode, object = edit mode
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchProducts = useCallback(async () => {
    try {
      setFetchError('');
      const data = await getProducts();
      setProducts(data);
    } catch {
      setFetchError('Failed to load products. Is the backend running?');
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditing(product);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (editing) {
        await updateProduct(editing.id, data);
        showToast('Product updated successfully.');
      } else {
        await createProduct(data);
        showToast('Product added successfully.');
      }
      await fetchProducts();
      handleCancel();
    } catch (err) {
      showToast(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteProduct(confirmDelete.id);
      showToast('Product deleted.');
      await fetchProducts();
    } catch {
      showToast('Failed to delete product.');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove products from your store.</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + Add Product
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-md">
          {toast}
        </div>
      )}

      {fetchError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {fetchError}
        </div>
      )}

      {/* Slide-in form panel */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editing ? `Edit: ${editing.name}` : 'New Product'}
          </h2>
          <ProductForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={(p) => setConfirmDelete(p)}
        />
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">{confirmDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
