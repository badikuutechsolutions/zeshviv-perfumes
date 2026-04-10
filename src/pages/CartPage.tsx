import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/products';
import { fetchStoreSettings } from '../services/settings';
import { Product, CartItem } from '../types';

interface CartPageProps {
  cart: CartItem[];
  onUpdateCart: (productId: number, quantity: number) => void;
  onNavigate: (page: string) => void;
}

function getAbbreviation(name: string): string {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map(w => w[0]?.toUpperCase() || '').join('');
}

export default function CartPage({ cart, onUpdateCart, onNavigate }: CartPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [freeThreshold, setFreeThreshold] = useState(3000);
  const [defaultFee, setDefaultFee] = useState(200);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchStoreSettings()])
      .then(([prods, settings]) => {
        setProducts(prods);
        setFreeThreshold(settings.freeDeliveryThreshold);
        setDefaultFee(settings.defaultDeliveryFee);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cartProducts = cart
    .map(item => ({
      item,
      product: products.find(p => p.id === item.productId),
    }))
    .filter(cp => cp.product) as { item: CartItem; product: Product }[];

  const subtotal = cartProducts.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0);
  const deliveryFee = subtotal >= freeThreshold ? 0 : defaultFee;
  const total = subtotal + deliveryFee;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🛒</div>
          <p className="text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Discover amazing perfumes and add them to your cart!</p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            🛍️ Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => onNavigate('home')} className="hover:text-amber-600">Home</button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Shopping Cart</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-gray-900 mb-6">🛒 Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {cartProducts.map(({ item, product }) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
                {/* Product icon */}
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0 cursor-pointer overflow-hidden bg-gray-100"
                  onClick={() => onNavigate('product', product.id)}
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
                      <span className="text-lg font-black text-amber-700/40">{getAbbreviation(product.name)}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-amber-600 font-semibold">{product.brand}</div>
                  <h3 className="font-bold text-gray-800 text-sm mt-0.5 truncate">{product.name}</h3>
                  <div className="text-xs text-gray-500 mt-0.5">{product.size}</div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => onUpdateCart(product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateCart(product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-black text-gray-900">KES {(product.price * item.quantity).toLocaleString()}</div>
                      {item.quantity > 1 && (
                        <div className="text-xs text-gray-400">KES {product.price.toLocaleString()} each</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => onUpdateCart(product.id, 0)}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Continue shopping */}
            <button
              onClick={() => onNavigate('shop')}
              className="text-amber-600 hover:text-amber-700 text-sm font-semibold flex items-center gap-1.5"
            >
              ← Continue Shopping
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-36">
              <h2 className="font-black text-gray-900 mb-4">📋 Order Summary</h2>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                    {deliveryFee === 0 ? 'FREE 🎉' : `KES ${deliveryFee}`}
                  </span>
                </div>
                {subtotal < freeThreshold && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-xs text-amber-700">
                    💡 Add KES {(freeThreshold - subtotal).toLocaleString()} more for FREE delivery!
                  </div>
                )}
              </div>

              <div className="border-t pt-3 mb-5">
                <div className="flex justify-between">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-xl text-amber-600">KES {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkout')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white font-black py-3.5 rounded-xl text-base transition-all shadow-lg hover:shadow-amber-200 hover:-translate-y-0.5"
              >
                🚀 Proceed to Checkout
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>📱</span>
                <span>Pay with M-Pesa or Cash on Delivery</span>
              </div>

              {/* Trust badges */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: '🔒', text: 'Secure' },
                  { icon: '✅', text: 'Authentic' },
                  { icon: '🚀', text: 'Fast' },
                ].map(b => (
                  <div key={b.text} className="bg-gray-50 rounded-lg py-2 text-xs text-gray-600">
                    <div className="text-base">{b.icon}</div>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
