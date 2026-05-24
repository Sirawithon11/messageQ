import { useState, useEffect } from 'react';

const empty = { name: '', description: '', price: '', stock: '', image_url: '' };

export default function ProductForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(initial ? { ...initial, price: initial.price, stock: initial.stock } : empty);
  }, [initial]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) });
  };

  const field = (label, key, type = 'text', props = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={props.required ?? true}
        {...props}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field('Product Name', 'name')}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {field('Price ($)', 'price', 'number', { min: 0, step: '0.01' })}
      {field('Stock', 'stock', 'number', { min: 0, step: '1' })}
      {field('Image URL', 'image_url', 'url', { required: false })}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 rounded-md text-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : initial ? 'Update Product' : 'Add Product'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-md text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
