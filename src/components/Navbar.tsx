import { useState } from 'react';
import { CartItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  cart: CartItem[];
  onNavigate: (page: string, productId?: number) => void;
  currentPage: string;
}

export default function Navbar({ cart, onNavigate, currentPage }: NavbarProps) {
  const { user, signOut, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Top promo bar */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white text-center py-1.5 text-xs font-medium tracking-wide">
        🚀 FREE delivery within Mombasa CBD for orders above KES 3,000 &nbsp;|&nbsp; 📞 Call/WhatsApp: 0712 345 678
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow">
              💎
            </div>
            <div>
              <div className="font-black text-lg leading-tight text-gray-900">Zesh<span className="text-amber-600">Viv</span></div>
              <div className="text-[10px] text-gray-400 leading-tight font-medium">Premium Perfumes</div>
            </div>
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden sm:flex">
            <div className="flex w-full border-2 border-amber-500 rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search perfumes, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onNavigate('shop');
                }}
                className="flex-1 px-4 py-2 text-sm outline-none text-gray-700"
              />
              <button
                onClick={() => onNavigate('shop')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* User Auth */}
            {isAuthenticated && user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.name || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-amber-400"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                      {(user.user_metadata?.name || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-gray-700 font-medium max-w-24 truncate">
                    {user.user_metadata?.name || user.email?.split('@')[0]}
                  </span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 hidden group-hover:block z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="font-semibold text-gray-800 text-sm truncate">
                      {user.user_metadata?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={async () => { await signOut(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                👤 Sign In
              </button>
            )}
            {/* Admin */}
            <button
              onClick={() => onNavigate('admin')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⚙️ Admin
            </button>

            {/* Viability Report */}
            <button
              onClick={() => onNavigate('viability')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'viability'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Viability
            </button>

            {/* Shop */}
            <button
              onClick={() => onNavigate('shop')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'shop'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🛍️ Shop
            </button>

            {/* Cart */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 border-t pt-3 space-y-2">
            <div className="flex border-2 border-amber-500 rounded-lg overflow-hidden mb-3">
              <input
                type="text"
                placeholder="Search perfumes..."
                className="flex-1 px-3 py-2 text-sm outline-none"
              />
              <button className="bg-amber-500 text-white px-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 border-t border-gray-100 mt-2 pt-2">
                  <div className="text-xs text-gray-500 mb-1">Signed in as:</div>
                  <div className="text-sm font-medium text-gray-800 truncate">{user?.email}</div>
                </div>
                <button onClick={async () => { await signOut(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 font-medium">🚪 Sign Out</button>
              </>
            ) : (
              <button onClick={() => { onNavigate('auth'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-amber-600 hover:bg-amber-50 font-medium">👤 Sign In with Google</button>
            )}
            <button onClick={() => { onNavigate('admin'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">⚙️ Admin Panel</button>
            <button onClick={() => { onNavigate('shop'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">🛍️ Shop All Perfumes</button>
            <button onClick={() => { onNavigate('viability'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">📊 Business Viability Report</button>
          </div>
        )}
      </div>

      {/* Category Nav */}
      <div className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {[
              { label: '🔥 All', cat: 'all' },
              { label: '👨 Men', cat: 'men' },
              { label: '👩 Women', cat: 'women' },
              { label: '⚡ Unisex', cat: 'unisex' },
              { label: '🔶 Oud', cat: 'oud' },
              { label: '💰 Under KES 2000', cat: 'budget' },
              { label: '👑 Luxury', cat: 'luxury' },
            ].map(({ label, cat }) => (
              <button
                key={cat}
                onClick={() => onNavigate('shop')}
                className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 hover:border-amber-400 hover:text-amber-600 transition-colors text-gray-600"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
