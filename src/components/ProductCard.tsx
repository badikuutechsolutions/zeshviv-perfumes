import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  onViewProduct: (productId: number) => void;
  cartCount?: number;
}

const badgeStyles: Record<string, string> = {
  bestseller: 'bg-amber-500 text-white',
  new: 'bg-green-500 text-white',
  sale: 'bg-red-500 text-white',
  hot: 'bg-orange-500 text-white',
};

const badgeLabels: Record<string, string> = {
  bestseller: '⭐ BESTSELLER',
  new: '✨ NEW',
  sale: '🔥 SALE',
  hot: '🌶️ HOT',
};

export default function ProductCard({ product, onAddToCart, onViewProduct, cartCount = 0 }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
      {/* Product image area */}
      <div
        className="relative cursor-pointer overflow-hidden h-52 bg-linear-to-br from-amber-50 to-orange-50"
        onClick={() => onViewProduct(product.id)}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover product-image-zoom"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-7xl transform group-hover:scale-110 transition-transform duration-300">
              {product.emoji}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStyles[product.badge]}`}>
              {badgeLabels[product.badge]}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              -{discount}% OFF
            </span>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">OUT OF STOCK</span>
          </div>
        )}

        {/* Quick add */}
        <button
          onClick={(e) => { e.stopPropagation(); if (product.inStock) onAddToCart(product.id); }}
          disabled={!product.inStock}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all ${
            product.inStock
              ? 'bg-amber-500 hover:bg-amber-600 text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          +
        </button>
      </div>

      {/* Product info */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">{product.brand}</div>
        <h3
          className="text-sm font-semibold text-gray-800 mt-0.5 cursor-pointer hover:text-amber-600 line-clamp-1"
          onClick={() => onViewProduct(product.id)}
        >
          {product.name}
        </h3>
        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 flex-1">{product.description}</p>

        {/* Size & rating */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{product.size}</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-[11px] text-gray-600 font-medium">{product.rating}</span>
            <span className="text-[10px] text-gray-400">({product.reviews})</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-black text-gray-900">KES {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">KES {product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={() => { if (product.inStock) onAddToCart(product.id); }}
          disabled={!product.inStock}
          className={`mt-3 w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
            product.inStock
              ? cartCount > 0
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {!product.inStock ? 'Out of Stock' : cartCount > 0 ? `✓ In Cart (${cartCount})` : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
}
