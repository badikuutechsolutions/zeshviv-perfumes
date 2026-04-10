import { useState, useEffect } from 'react';
import { fetchProductById, fetchRelatedProducts } from '../services/products';
import { Product as ProductType, CartItem } from '../types';
import ProductCard from '../components/ProductCard';

interface ProductPageProps {
  productId: number;
  cart: CartItem[];
  onAddToCart: (productId: number) => void;
  onNavigate: (page: string, productId?: number) => void;
}

export default function ProductPage({ productId, cart, onAddToCart, onNavigate }: ProductPageProps) {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [related, setRelated] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchProductById(productId),
      fetchProductById(productId).then(p => {
        if (p) return fetchRelatedProducts(productId, p.category, p.brand);
        return [];
      }),
    ])
      .then(([p, r]) => {
        setProduct(p);
        setRelated(r);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">💎</div>
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Product not found</h2>
          <button onClick={() => onNavigate('shop')} className="bg-amber-500 text-white px-4 py-2 rounded-lg">Back to Shop</button>
        </div>
      </div>
    );
  }

  const cartItem = cart.find(i => i.productId === product.id);
  const cartCount = cartItem?.quantity ?? 0;

  const getCartCount = (id: number) => cart.find(i => i.productId === id)?.quantity ?? 0;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => onNavigate('home')} className="hover:text-amber-600">Home</button>
          <span>/</span>
          <button onClick={() => onNavigate('shop')} className="hover:text-amber-600">Shop</button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Product image */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-12 min-h-64 relative">
              <div className="text-9xl">{product.emoji}</div>
              {product.badge && (
                <div className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${
                  product.badge === 'bestseller' ? 'bg-amber-500 text-white' :
                  product.badge === 'new' ? 'bg-green-500 text-white' :
                  product.badge === 'sale' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                }`}>
                  {product.badge === 'bestseller' ? '⭐ BESTSELLER' :
                   product.badge === 'new' ? '✨ NEW' :
                   product.badge === 'sale' ? '🔥 SALE' : '🌶️ HOT'}
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-black w-12 h-12 rounded-full flex items-center justify-center">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Product details */}
            <div className="p-6 md:p-8">
              <div className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">{product.brand}</div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className="text-sm">{s <= Math.floor(product.rating) ? '★' : s - 0.5 <= product.rating ? '⭑' : '☆'}</span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-black text-gray-900">KES {product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">KES {product.originalPrice.toLocaleString()}</span>
                    <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Save KES {(product.originalPrice - product.price).toLocaleString()}</span>
                  </>
                )}
              </div>

              {/* Size */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600 font-medium">Size:</span>
                <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">{product.size}</span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>

              {/* Fragrance notes */}
              <div className="bg-amber-50 rounded-xl p-4 mb-5 border border-amber-100">
                <h3 className="font-bold text-gray-800 text-sm mb-3">🌿 Fragrance Notes</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Top Notes</div>
                    {product.notes.top.map(n => <div key={n} className="text-xs text-gray-700 bg-white px-2 py-1 rounded-md mb-1 border border-amber-100">{n}</div>)}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Heart Notes</div>
                    {product.notes.middle.map(n => <div key={n} className="text-xs text-gray-700 bg-white px-2 py-1 rounded-md mb-1 border border-amber-100">{n}</div>)}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Base Notes</div>
                    {product.notes.base.map(n => <div key={n} className="text-xs text-gray-700 bg-white px-2 py-1 rounded-md mb-1 border border-amber-100">{n}</div>)}
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-semibold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? 'In Stock — Ready to ship' : 'Out of Stock'}
                </span>
              </div>

              {/* Add to cart */}
              <div className="flex gap-3">
                <button
                  onClick={() => { if (product.inStock) onAddToCart(product.id); }}
                  disabled={!product.inStock}
                  className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all ${
                    product.inStock
                      ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg hover:shadow-amber-200 hover:-translate-y-0.5'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {cartCount > 0 ? `✓ In Cart (${cartCount}) — Add More` : '🛒 Add to Cart'}
                </button>
                {cartCount > 0 && (
                  <button
                    onClick={() => onNavigate('cart')}
                    className="px-4 py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors"
                  >
                    View Cart →
                  </button>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                {[
                  { icon: '🚀', text: 'Same-day delivery in Mombasa' },
                  { icon: '📱', text: 'Pay via M-Pesa' },
                  { icon: '✅', text: '100% Authentic' },
                  { icon: '↩️', text: '7-day easy returns' },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{f.icon}</span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-black text-gray-900 mb-4">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                  onViewProduct={(id) => onNavigate('product', id)}
                  cartCount={getCartCount(p.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
