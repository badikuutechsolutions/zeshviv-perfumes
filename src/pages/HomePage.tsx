import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/products';
import { Product as ProductType, CartItem } from '../types';
import ProductCard from '../components/ProductCard';

interface HomePageProps {
  cart: CartItem[];
  onAddToCart: (productId: number) => void;
  onNavigate: (page: string, productId?: number) => void;
}

export default function HomePage({ cart, onAddToCart, onNavigate }: HomePageProps) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const bestsellers = products.filter(p => p.badge === 'bestseller' || p.badge === 'hot');
  const newArrivals = products.filter(p => p.badge === 'new');
  const onSale = products.filter(p => p.badge === 'sale');

  const getCartCount = (productId: number) =>
    cart.find(i => i.productId === productId)?.quantity ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">💎</div>
          <p className="text-gray-500">Loading ZeshViv Perfumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-amber-950 to-gray-900 text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(/images/hero-perfume.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              🌴 Mombasa's #1 Online Perfume Store
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
              Discover Your
              <span className="text-amber-400"> Perfect Scent</span>
              <br />Delivered to Your Door
            </h1>
            <p className="text-gray-300 text-base md:text-lg mb-6 leading-relaxed">
              Shop premium perfumes from Swahili Scents, Khaleeji Collection & more.
              Pay with M-Pesa. Same-day delivery across Mombasa. 🛵
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('shop')}
                className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5"
              >
                🛍️ Shop Now
              </button>
              <button
                onClick={() => onNavigate('viability')}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-6 py-3 rounded-xl transition-all"
              >
                📊 Business Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative border-t border-white/10 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { label: 'Products', value: '50+', icon: '💎' },
                { label: 'Happy Customers', value: '2,400+', icon: '😍' },
                { label: 'Delivery Time', value: '2-4 hrs', icon: '🛵' },
                { label: 'Payment', value: 'M-Pesa', icon: '📱' },
              ].map(stat => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="text-lg font-black text-amber-400">{stat.value}</span>
                  <span className="text-xs text-gray-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flash sale banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="animate-pulse">🔥</span>
            <span>FLASH SALE — Up to 30% off selected perfumes!</span>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs bg-white text-red-600 font-bold px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
          >
            Shop Sale →
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Feature tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🚀', title: 'Fast Delivery', desc: 'Same-day delivery in Mombasa' },
            { icon: '📱', title: 'M-Pesa Payment', desc: 'Pay easily & securely' },
            { icon: '↩️', title: 'Easy Returns', desc: '7-day return policy' },
            { icon: '✅', title: '100% Authentic', desc: 'Genuine products only' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-bold text-gray-800 text-sm">{f.title}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Bestsellers */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">🔥 Bestsellers</h2>
              <p className="text-sm text-gray-500">Most loved by our Mombasa customers</p>
            </div>
            <button onClick={() => onNavigate('shop')} className="text-amber-600 text-sm font-semibold hover:text-amber-700">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestsellers.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onViewProduct={(id) => onNavigate('product', id)}
                cartCount={getCartCount(p.id)}
              />
            ))}
          </div>
        </section>

        {/* Banner */}
        <div
          className="rounded-2xl overflow-hidden relative h-40 md:h-56 flex items-center"
          style={{
            backgroundImage: 'url(/images/perfume-banner.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 to-transparent" />
          <div className="relative px-8">
            <p className="text-amber-300 text-sm font-semibold mb-1">✨ New Collection</p>
            <h3 className="text-white text-2xl md:text-3xl font-black mb-3">Khaleeji Luxuries</h3>
            <button
              onClick={() => onNavigate('shop')}
              className="bg-amber-500 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-amber-400 transition-colors"
            >
              Explore Collection →
            </button>
          </div>
        </div>

        {/* New Arrivals */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">✨ New Arrivals</h2>
              <p className="text-sm text-gray-500">Fresh additions to our collection</p>
            </div>
            <button onClick={() => onNavigate('shop')} className="text-amber-600 text-sm font-semibold hover:text-amber-700">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onViewProduct={(id) => onNavigate('product', id)}
                cartCount={getCartCount(p.id)}
              />
            ))}
          </div>
        </section>

        {/* On Sale */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">🏷️ On Sale</h2>
              <p className="text-sm text-gray-500">Great deals — limited time only!</p>
            </div>
            <button onClick={() => onNavigate('shop')} className="text-amber-600 text-sm font-semibold hover:text-amber-700">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {onSale.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onViewProduct={(id) => onNavigate('product', id)}
                cartCount={getCartCount(p.id)}
              />
            ))}
          </div>
        </section>

        {/* Delivery zones */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-4">🗺️ Delivery Zones — Mombasa</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { zone: 'Mombasa CBD', time: '1-2 hrs', fee: 'FREE over KES 3k / KES 150' },
              { zone: 'Nyali & Bamburi', time: '2-3 hrs', fee: 'KES 200' },
              { zone: 'Likoni & South Coast', time: '2-4 hrs', fee: 'KES 250' },
              { zone: 'Kisauni & Bombolulu', time: '2-3 hrs', fee: 'KES 200' },
              { zone: 'Mtwapa', time: '3-4 hrs', fee: 'KES 300' },
              { zone: 'Diani & Ukunda', time: 'Next day', fee: 'KES 400' },
            ].map(z => (
              <div key={z.zone} className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
                <span className="text-lg">📍</span>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{z.zone}</div>
                  <div className="text-[11px] text-gray-500">⏱ {z.time}</div>
                  <div className="text-[11px] text-amber-700 font-medium">💰 {z.fee}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-xl font-black text-gray-900 mb-4">💬 What Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Amina J.', location: 'Nyali', text: 'Ordered Oud Al Shams at 10am, delivered by 1pm! Smells amazing. Will definitely order again 🔥', stars: 5 },
              { name: 'Brian K.', location: 'Mombasa CBD', text: 'Paid via M-Pesa, so easy. The Sultan Noir is perfect for evening events. Package was well-sealed.', stars: 5 },
              { name: 'Fatuma M.', location: 'Likoni', text: 'Rose Malindi is exactly what I wanted. Affordable too. ZeshViv is now my go-to perfume shop!', stars: 4 },
            ].map(t => (
              <div key={t.name} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex text-yellow-400 text-sm mb-2">
                  {'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}
                </div>
                <p className="text-gray-600 text-sm italic mb-3">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                    <div className="text-[11px] text-gray-500">📍 {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg">💎</div>
                <span className="text-white font-black">ZeshViv<span className="text-amber-500"> Perfumes</span></span>
              </div>
              <p className="text-sm leading-relaxed">Mombasa's premium online perfume store. Quality scents, fast delivery, M-Pesa payments.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Quick Links</h4>
              <ul className="space-y-1.5 text-sm">
                <li><button onClick={() => onNavigate('shop')} className="hover:text-amber-400 transition-colors">All Perfumes</button></li>
                <li><button onClick={() => onNavigate('shop')} className="hover:text-amber-400 transition-colors">Men's Fragrances</button></li>
                <li><button onClick={() => onNavigate('shop')} className="hover:text-amber-400 transition-colors">Women's Fragrances</button></li>
                <li><button onClick={() => onNavigate('viability')} className="hover:text-amber-400 transition-colors">Business Viability</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Contact Us</h4>
              <ul className="space-y-1.5 text-sm">
                <li>📞 0712 345 678</li>
                <li>📧 hello@zeshviv.co.ke</li>
                <li>📍 Mombasa, Kenya</li>
                <li>⏰ Open 8am – 9pm daily</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">We Accept</h4>
              <div className="flex flex-col gap-2">
                <div className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-fit">📱 M-Pesa</div>
                <div className="bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-fit">💵 Cash on Delivery</div>
              </div>
              <div className="mt-4">
                <h4 className="text-white font-bold mb-2 text-sm">Follow Us</h4>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors">📘</div>
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors">📷</div>
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors">💬</div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 text-center text-xs">
            © 2025 ZeshViv Perfumes. All rights reserved. | Made with ❤️ in Mombasa, Kenya
          </div>
        </div>
      </footer>
    </div>
  );
}
