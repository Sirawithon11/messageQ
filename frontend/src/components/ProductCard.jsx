import Image from 'next/image';

export default function ProductCard({ product, qty, onQtyChange, onAdd }) {
  const outOfStock = product.stock === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="relative w-full h-44 bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-4xl">
          </div>
        )}
        {outOfStock && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-blue-700 font-bold text-base">${parseFloat(product.price).toFixed(2)}</span>
          <span className="text-xs text-gray-400">{product.stock} left</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="number"
            min={1}
            max={product.stock}
            value={qty}
            onChange={(e) => onQtyChange(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
            disabled={outOfStock}
            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={() => onAdd(product, qty)}
            disabled={outOfStock}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold py-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
