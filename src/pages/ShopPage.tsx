import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/products';
import { Product as ProductType, CartItem } from '../types';
import ProductCard from '../components/ProductCard';

interface ShopPageProps {
  cart: CartItem[];
  onAddToCart: (productId: number) => void;
  onNavigate: (page: string, productId?: number) => void;
}

const sortOptions = [
  { value: 'popular', label: '🔥 Most Popular' },
  { value: 'price-asc', label: '💰 Price: Low to High' },
  { value: 'price-desc', label: '💎 Price: High to Low' },
  { value: 'rating', label: '⭐ Highest Rated' },
  { value: 'new', label: '✨ Newest First' },
];

export default function ShopPage({ cart, onAddToCart, onNavigate }: ShopPageProps) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getCartCount = (productId: number) =>
    cart.find(i => i.productId === productId)?.quantity ?? 0;

  const filtered = products
    .filter(p => {
      if (category !== 'all') {
        if (category === 'budget') return p.price < 2000;
        if (category === 'luxury') return p.price >= 3000;
        if (p.category !== category) return false;
      }
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'new') return (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0);
      return b.reviews - a.reviews;
    });

  const categories = [
    { value: 'all', label: '🔥 All' },
    { value: 'men', label: '👨 Men' },
    { value: 'women', label: '👩 Women' },
    { value: 'unisex', label: '⚡ Unisex' },
    { value: 'budget', label: '💰 Under 2K' },
    { value: 'luxury', label: '👑 Luxury' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🛍️</div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <button onClick={() => onNavigate('home')} className="hover:text-amber-600">Home</button>
            <span>/</span>
            <span className="text-gray-800 font-medium">All Perfumes</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-gray-900">All Perfumes</h1>
            <span className="text-sm text-gray-500">{filtered.length} products found</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar filters - desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm sticky top-36">
              <h3 className="font-bold text-gray-900 mb-3">🎯 Filters</h3>

              {/* Search */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
                />
              </div>

              {/* Categories */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
                <div className="space-y-1">
                  {categories.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        category === c.value
                          ? 'bg-amber-500 text-white font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Price Range: KES {priceRange[0].toLocaleString()} – {priceRange[1].toLocaleString()}
                </label>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>KES 0</span>
                  <span>KES 5,000</span>
                </div>
              </div>

              <button
                onClick={() => { setCategory('all'); setPriceRange([0, 5000]); setSearch(''); }}
                className="w-full text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Mobile filters & sort bar */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:border-amber-400"
              >
                ⚙️ Filters
              </button>

              {/* Category pills - mobile/tablet */}
              <div className="flex gap-2 overflow-x-auto flex-1 lg:hidden scrollbar-hide">
                {categories.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      category === c.value
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="ml-auto">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 text-gray-700"
                >
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile filter panel */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm">
                <div className="mb-3">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search perfumes..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Max Price: KES {priceRange[1].toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5000}
                    step={100}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([0, Number(e.target.value)])}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Products grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No perfumes found</h3>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search term</p>
                <button
                  onClick={() => { setCategory('all'); setPriceRange([0, 5000]); setSearch(''); }}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={onAddToCart}
                    onViewProduct={(id) => onNavigate('product', id)}
                    cartCount={getCartCount(p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
