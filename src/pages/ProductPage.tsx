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

type TabType = 'overview' | 'specs' | 'reviews' | 'shipping';

function getAbbreviation(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map(w => w[0]?.toUpperCase() || '').join('');
}

export default function ProductPage({ productId, cart, onAddToCart, onNavigate }: ProductPageProps) {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [related, setRelated] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    setLoading(true);
    setActiveTab('overview');
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

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📋' },
    { key: 'specs', label: 'Specifications', icon: '📐' },
    { key: 'reviews', label: 'Reviews', icon: '⭐' },
    { key: 'shipping', label: 'Shipping', icon: '🚚' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => onNavigate('home')} className="hover:text-amber-600 transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => onNavigate('shop')} className="hover:text-amber-600 transition-colors">Shop</button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>
      </div>

      {/* Product Hero - Alibaba Style */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square flex items-center justify-center group">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover product-image-zoom"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
                    <div className="text-center">
                      <div className="text-6xl font-black text-amber-700/30 tracking-widest">
                        {getAbbreviation(product.name)}
                      </div>
                    </div>
                  </div>
                )}
                {product.badge && (
                  <div className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ${
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
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                    -{discount}%
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Brand */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">{product.brand}</span>
                <span className="text-gray-300">|</span>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full capitalize">{product.category}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="flex text-yellow-400">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className="text-lg">{s <= Math.floor(product.rating) ? '★' : s - 0.5 <= product.rating ? '⭑' : '☆'}</span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Verified</span>
              </div>

              {/* Price Block */}
              <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-amber-600">KES {product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">KES {product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                {discount > 0 && (
                  <div className="text-xs text-amber-700 mt-1 font-medium">
                    You save KES {(product.originalPrice! - product.price).toLocaleString()} ({discount}% off)
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>

              {/* Size */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500 font-medium">Size:</span>
                <span className="bg-gray-100 text-gray-700 text-sm font-bold px-3 py-1 rounded-lg">{product.size}</span>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 mb-5">
                <div className={`w-2.5 h-2.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-semibold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                {product.inStock && (
                  <span className="text-xs text-gray-400">— Ready to ship</span>
                )}
              </div>

              {/* Add to Cart */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => { if (product.inStock) onAddToCart(product.id); }}
                  disabled={!product.inStock}
                  className={`flex-1 py-4 rounded-xl text-base font-bold transition-all ${
                    product.inStock
                      ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg hover:shadow-amber-200 hover:-translate-y-0.5'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {cartCount > 0 ? `✓ In Cart (${cartCount})` : '🛒 Add to Cart'}
                </button>
                {cartCount > 0 && (
                  <button
                    onClick={() => onNavigate('cart')}
                    className="px-6 py-4 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors"
                  >
                    View Cart →
                  </button>
                )}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-100">
                {[
                  { icon: '🚀', text: 'Same-day delivery in Mombasa' },
                  { icon: '📱', text: 'Pay via M-Pesa (Pochi)' },
                  { icon: '✅', text: '100% Authentic' },
                  { icon: '↩️', text: '7-day easy returns' },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-lg">{f.icon}</span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section - Alibaba Style */}
      <div className="bg-white sticky top-[72px] z-20 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all relative ${
                  activeTab === tab.key
                    ? 'text-amber-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-black text-gray-900 mb-4">Product Description</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

              {/* Fragrance Notes */}
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                  <span className="text-lg">🌿</span> Fragrance Pyramid
                </h3>
                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <div className="text-xs font-bold text-amber-600 uppercase mb-2">Top Notes</div>
                    <div className="flex flex-wrap gap-2">
                      {product.notes.top.map(n => (
                        <span key={n} className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-full border border-amber-100 font-medium">{n}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-600 uppercase mb-2">Heart Notes</div>
                    <div className="flex flex-wrap gap-2">
                      {product.notes.middle.map(n => (
                        <span key={n} className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-full border border-amber-100 font-medium">{n}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-600 uppercase mb-2">Base Notes</div>
                    <div className="flex flex-wrap gap-2">
                      {product.notes.base.map(n => (
                        <span key={n} className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-full border border-amber-100 font-medium">{n}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === 'specs' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="text-lg font-black text-gray-900">Specifications</h2>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {[
                    ['Brand', product.brand],
                    ['Product Name', product.name],
                    ['Category', product.category.charAt(0).toUpperCase() + product.category.slice(1)],
                    ['Size', product.size],
                    ['Rating', `${product.rating} / 5.0 (${product.reviews} reviews)`],
                    ['Availability', product.inStock ? '✓ In Stock' : '✗ Out of Stock'],
                    ['Top Notes', product.notes.top.join(', ')],
                    ['Heart Notes', product.notes.middle.join(', ')],
                    ['Base Notes', product.notes.base.join(', ')],
                  ].map(([label, value]) => (
                    <tr key={label} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-500 font-medium w-1/3 bg-gray-50/50">{label}</td>
                      <td className="px-6 py-3 text-gray-900 font-semibold">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-gray-900">Customer Reviews</h2>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400 text-lg">
                    {[1,2,3,4,5].map(s => (
                      <span key={s}>{s <= Math.floor(product.rating) ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{product.rating}</span>
                  <span className="text-gray-400 text-sm">({product.reviews})</span>
                </div>
              </div>

              {/* Sample reviews */}
              <div className="space-y-4">
                {[
                  { name: 'Amina J.', location: 'Nyali, Mombasa', rating: 5, text: 'Absolutely love this fragrance! Long-lasting and the scent is exactly as described. Perfect for the Coast climate.', date: '2 weeks ago' },
                  { name: 'Brian K.', location: 'Mombasa CBD', rating: 5, text: 'Great quality for the price. The fragrance notes are accurate and it lasts all day. Will definitely reorder.', date: '1 month ago' },
                  { name: 'Fatuma M.', location: 'Likoni', rating: 4, text: 'Beautiful scent, though I wish it came in a larger size. The packaging was excellent and delivery was fast.', date: '3 weeks ago' },
                ].map((review, i) => (
                  <div key={i} className="border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">
                          {review.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{review.name}</div>
                          <div className="text-[10px] text-gray-400">📍 {review.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </div>
                        <div className="text-[10px] text-gray-400">{review.date}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="space-y-4">
              {/* Delivery Zones */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-lg">🗺️</span> Delivery Zones
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { zone: 'Mombasa CBD', time: '1-2 hrs', fee: 'FREE over KES 3k / KES 150' },
                    { zone: 'Nyali & Bamburi', time: '2-3 hrs', fee: 'KES 200' },
                    { zone: 'Likoni & South Coast', time: '2-4 hrs', fee: 'KES 250' },
                    { zone: 'Kisauni & Bombolulu', time: '2-3 hrs', fee: 'KES 200' },
                    { zone: 'Mtwapa', time: '3-4 hrs', fee: 'KES 300' },
                    { zone: 'Diani & Ukunda', time: 'Next day', fee: 'KES 400' },
                  ].map(z => (
                    <div key={z.zone} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <span className="text-lg">📍</span>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">{z.zone}</div>
                        <div className="text-[11px] text-gray-500">⏱ {z.time}</div>
                        <div className="text-[11px] text-amber-700 font-medium">💰 {z.fee}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-lg">💳</span> Payment Methods
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📱</span>
                      <span className="font-bold text-green-800 text-sm">Pochi la Biashara</span>
                    </div>
                    <p className="text-xs text-green-700">Send payment directly to our Pochi number. Quick and easy!</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💵</span>
                      <span className="font-bold text-blue-800 text-sm">Cash on Delivery</span>
                    </div>
                    <p className="text-xs text-blue-700">Pay when your order arrives. Have exact change ready.</p>
                  </div>
                </div>
              </div>

              {/* Returns */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-lg">↩️</span> Return Policy
                </h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• <strong>7-day exchange policy:</strong> Not satisfied with your scent? Exchange for another fragrance within 7 days.</p>
                  <p>• Product must be unused and in original packaging.</p>
                  <p>• Contact us on <a href="https://wa.me/254723424962" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline font-medium">WhatsApp</a> (0723424962) to initiate an exchange.</p>
                  <p>• Delivery fees for exchanges are borne by the customer.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
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
