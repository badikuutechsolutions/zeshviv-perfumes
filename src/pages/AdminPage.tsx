import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

// Admin password - change this to your own
const ADMIN_PASSWORD = 'zeshviv2025';

type ModalMode = 'list' | 'add' | 'edit';

const CATEGORY_OPTIONS = ['men', 'women', 'unisex', 'oud'] as const;
const BADGE_OPTIONS = [null, 'bestseller', 'new', 'sale', 'hot'] as const;

const emptyProduct = {
  name: '',
  brand: '',
  price: 0,
  originalPrice: null as number | null,
  category: 'unisex' as typeof CATEGORY_OPTIONS[number],
  size: '100ml',
  rating: 4.5,
  reviews: 0,
  inStock: true,
  badge: null as typeof BADGE_OPTIONS[number],
  description: '',
  notesTop: [''] as string[],
  notesMiddle: [''] as string[],
  notesBase: [''] as string[],
  emoji: '🔶',
};

type FormState = typeof emptyProduct;

export default function AdminPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Password check
  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      showToast('error', 'Failed to load products');
    } else {
      setProducts(
        (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          brand: row.brand,
          price: row.price,
          originalPrice: row.original_price ?? undefined,
          category: row.category,
          size: row.size,
          rating: Number(row.rating),
          reviews: row.reviews_count,
          inStock: row.in_stock,
          badge: row.badge ?? undefined,
          description: row.description,
          notes: {
            top: row.notes_top || [],
            middle: row.notes_middle || [],
            base: row.notes_base || [],
          },
          emoji: row.emoji,
          imageUrl: row.image_url ?? undefined,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) fetchProducts();
  }, [isAuthenticated]);

  // Open add/edit modal
  const openAdd = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setModalMode('add');
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      category: product.category,
      size: product.size,
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      badge: product.badge ?? null,
      description: product.description,
      notesTop: product.notes.top.length ? product.notes.top : [''],
      notesMiddle: product.notes.middle.length ? product.notes.middle : [''],
      notesBase: product.notes.base.length ? product.notes.base : [''],
      emoji: product.emoji,
    });
    setEditingId(product.id);
    setModalMode('edit');
  };

  // Save product
  const handleSave = async () => {
    if (!form.name.trim() || !form.brand.trim() || form.price <= 0) {
      showToast('error', 'Please fill in name, brand, and a valid price');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: form.price,
      original_price: form.originalPrice || null,
      category: form.category,
      size: form.size.trim(),
      rating: form.rating,
      reviews_count: form.reviews,
      in_stock: form.inStock,
      badge: form.badge,
      description: form.description.trim(),
      notes_top: form.notesTop.filter(n => n.trim()),
      notes_middle: form.notesMiddle.filter(n => n.trim()),
      notes_base: form.notesBase.filter(n => n.trim()),
      emoji: form.emoji,
      image_url: null,
    };

    try {
      let error;
      if (modalMode === 'add') {
        const { error: e } = await supabase.from('products').insert(payload);
        error = e;
      } else {
        const { error: e } = await supabase.from('products').update(payload).eq('id', editingId);
        error = e;
      }

      if (error) throw error;

      showToast('success', modalMode === 'add' ? 'Product added!' : 'Product updated!');
      setModalMode('list');
      await fetchProducts();
    } catch (err: any) {
      console.error('Save error:', err);
      showToast('error', err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      showToast('error', 'Failed to delete product');
    } else {
      showToast('success', 'Product deleted');
      setDeleteConfirm(null);
      await fetchProducts();
    }
  };

  // Toggle stock
  const toggleStock = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ in_stock: !product.inStock })
      .eq('id', product.id);

    if (error) {
      showToast('error', 'Failed to update stock');
    } else {
      await fetchProducts();
    }
  };

  // Array field helper
  const ArrayField = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string[];
    onChange: (arr: string[]) => void;
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {value.map((item, i) => (
        <div key={i} className="flex gap-2 mb-1.5">
          <input
            type="text"
            value={item}
            onChange={e => {
              const arr = [...value];
              arr[i] = e.target.value;
              onChange(arr);
            }}
            placeholder={`Note ${i + 1}`}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
          {value.length > 1 && (
            <button
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 font-bold"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => onChange([...value, ''])}
        className="text-xs text-amber-600 hover:text-amber-700 font-medium"
      >
        + Add note
      </button>
    </div>
  );

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🔐
            </div>
            <h1 className="text-xl font-black text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">ZeshViv Perfumes</p>
          </div>
          <input
            type="password"
            placeholder="Enter admin password"
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 mb-3"
          />
          {passwordError && <p className="text-red-500 text-xs mb-3">{passwordError}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="w-full mt-2 text-gray-500 text-sm hover:text-amber-600 py-2"
          >
            ← Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💎</span>
            <div>
              <h1 className="text-lg font-black">ZeshViv Admin</h1>
              <p className="text-xs text-gray-400">Manage your perfume catalog</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              🏪 View Store
            </button>
            <button
              onClick={() => { setIsAuthenticated(false); setPasswordInput(''); }}
              className="text-sm bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {modalMode === 'list' && (
          <>
            {/* Stats + Add button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
                  <div className="text-2xl font-black text-gray-900">{products.length}</div>
                  <div className="text-xs text-gray-500">Total Products</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
                  <div className="text-2xl font-black text-green-600">{products.filter(p => p.inStock).length}</div>
                  <div className="text-xs text-gray-500">In Stock</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
                  <div className="text-2xl font-black text-red-500">{products.filter(p => !p.inStock).length}</div>
                  <div className="text-xs text-gray-500">Out of Stock</div>
                </div>
              </div>
              <button
                onClick={openAdd}
                className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
              >
                + Add New Perfume
              </button>
            </div>

            {/* Products table */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin text-5xl mb-4">⏳</div>
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left p-3 font-bold text-gray-700"></th>
                        <th className="text-left p-3 font-bold text-gray-700">Name</th>
                        <th className="text-left p-3 font-bold text-gray-700">Brand</th>
                        <th className="text-left p-3 font-bold text-gray-700">Category</th>
                        <th className="text-left p-3 font-bold text-gray-700">Price</th>
                        <th className="text-left p-3 font-bold text-gray-700">Badge</th>
                        <th className="text-left p-3 font-bold text-gray-700">Stock</th>
                        <th className="text-right p-3 font-bold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-2xl w-12 text-center">{p.emoji}</td>
                          <td className="p-3">
                            <div className="font-semibold text-gray-900">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.size} · ⭐ {p.rating} ({p.reviews})</div>
                          </td>
                          <td className="p-3 text-gray-600">{p.brand}</td>
                          <td className="p-3">
                            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full capitalize">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-gray-900">
                            KES {p.price.toLocaleString()}
                            {p.originalPrice && (
                              <div className="text-xs text-gray-400 line-through">
                                KES {p.originalPrice.toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            {p.badge && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                p.badge === 'bestseller' ? 'bg-amber-100 text-amber-700' :
                                p.badge === 'new' ? 'bg-green-100 text-green-700' :
                                p.badge === 'sale' ? 'bg-red-100 text-red-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {p.badge.toUpperCase()}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => toggleStock(p)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                                p.inStock
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {p.inStock ? '✓ In Stock' : '✗ Out'}
                            </button>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEdit(p)}
                                className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              {deleteConfirm === p.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(p.id)}
                                    className="text-xs bg-red-500 text-white px-2 py-1.5 rounded-lg font-medium"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1.5 rounded-lg font-medium"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(p.id)}
                                  className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                                >
                                  🗑️ Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {(modalMode === 'add' || modalMode === 'edit') && (
          <div className="fixed inset-0 bg-black/50 z-40 flex items-start justify-center overflow-y-auto py-8">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 my-8">
              {/* Modal header */}
              <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="font-black text-lg">
                  {modalMode === 'add' ? '➕ Add New Perfume' : '✏️ Edit Perfume'}
                </h2>
                <button
                  onClick={() => setModalMode('list')}
                  className="text-gray-400 hover:text-white text-xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Form body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Basic info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Perfume Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Oud Al Shams"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Brand *</label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={e => setForm({ ...form, brand: e.target.value })}
                      placeholder="e.g. Swahili Scents"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Emoji</label>
                    <input
                      type="text"
                      value={form.emoji}
                      onChange={e => setForm({ ...form, emoji: e.target.value })}
                      placeholder="🔶"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price (KES) *</label>
                    <input
                      type="number"
                      value={form.price || ''}
                      onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                      placeholder="2500"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Original Price</label>
                    <input
                      type="number"
                      value={form.originalPrice || ''}
                      onChange={e => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : null })}
                      placeholder="3200"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Size</label>
                    <input
                      type="text"
                      value={form.size}
                      onChange={e => setForm({ ...form, size: e.target.value })}
                      placeholder="100ml"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Category + Badge */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value as typeof CATEGORY_OPTIONS[number] })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    >
                      {CATEGORY_OPTIONS.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Badge</label>
                    <select
                      value={form.badge || ''}
                      onChange={e => setForm({ ...form, badge: e.target.value || null })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    >
                      <option value="">None</option>
                      <option value="bestseller">⭐ Bestseller</option>
                      <option value="new">✨ New</option>
                      <option value="sale">🔥 Sale</option>
                      <option value="hot">🌶️ Hot</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.inStock}
                        onChange={e => setForm({ ...form, inStock: e.target.checked })}
                        className="w-4 h-4 accent-green-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">In Stock</span>
                    </label>
                  </div>
                </div>

                {/* Rating + Reviews */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={form.rating}
                      onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Reviews Count</label>
                    <input
                      type="number"
                      value={form.reviews}
                      onChange={e => setForm({ ...form, reviews: Number(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="A rich, smoky oud with warm amber..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                {/* Fragrance notes */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">🌿 Fragrance Notes</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <ArrayField
                      label="Top Notes"
                      value={form.notesTop}
                      onChange={arr => setForm({ ...form, notesTop: arr })}
                    />
                    <ArrayField
                      label="Heart Notes"
                      value={form.notesMiddle}
                      onChange={arr => setForm({ ...form, notesMiddle: arr })}
                    />
                    <ArrayField
                      label="Base Notes"
                      value={form.notesBase}
                      onChange={arr => setForm({ ...form, notesBase: arr })}
                    />
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="border-t px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => setModalMode('list')}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
                    saving
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Saving...
                    </span>
                  ) : (
                    modalMode === 'add' ? '➕ Add Perfume' : '💾 Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
