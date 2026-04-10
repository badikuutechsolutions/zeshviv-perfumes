import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import SettingsPage from './SettingsPage';
import AdminManagementPage from './AdminManagementPage';

// Admin password - change this to your own
const ADMIN_PASSWORD = 'zeshviv2025';

type ModalMode = 'list' | 'add' | 'edit';
type TabMode = 'products' | 'orders' | 'settings' | 'admins';

type OrderRecord = {
  id: string;
  customer_name: string;
  phone: string;
  location: string;
  delivery_zone: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
  email?: string;
};

type ProductRow = {
  id: number;
  name: string;
  brand: string;
  price: number;
  original_price: number | null;
  category: string;
  size: string;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  badge: string | null;
  description: string;
  notes_top: string[];
  notes_middle: string[];
  notes_base: string[];
  emoji: string;
  image_url: string | null;
  created_at: string;
};

type FormState = {
  name: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  category: 'men' | 'women' | 'unisex' | 'oud';
  size: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge: null | 'bestseller' | 'new' | 'sale' | 'hot';
  description: string;
  notesTop: string[];
  notesMiddle: string[];
  notesBase: string[];
  emoji: string;
};

const CATEGORY_OPTIONS = ['men', 'women', 'unisex', 'oud'] as const;

const emptyProduct: FormState = {
  name: '',
  brand: '',
  price: 0,
  originalPrice: null,
  category: 'unisex',
  size: '100ml',
  rating: 4.5,
  reviews: 0,
  inStock: true,
  badge: null,
  description: '',
  notesTop: [''],
  notesMiddle: [''],
  notesBase: [''],
  emoji: '🔶',
};

const statusConfig: Record<string, { label: string; color: string; bg: string; nextStatus?: string; nextLabel?: string }> = {
  pending: { label: 'Pending', color: 'text-orange-600', bg: 'bg-orange-50', nextStatus: 'confirmed', nextLabel: 'Confirm' },
  confirmed: { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-50', nextStatus: 'delivered', nextLabel: 'Mark Delivered' },
  delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
};

export default function AdminPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState<TabMode>('products');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Orders state
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<string>('all');

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Image upload handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async (productId: number): Promise<string | null> => {
    if (!imageFile) return currentImageUrl;

    setImageUploading(true);
    try {
      // Create unique filename
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;

      // Delete old image if exists
      if (currentImageUrl) {
        const oldPath = currentImageUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('product-images').remove([oldPath]);
        }
      }

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      showToast('error', error.message || 'Failed to upload image');
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        (data || []).map((row: ProductRow) => ({
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

  // Fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      showToast('error', 'Failed to load orders');
    } else {
      setOrders(data || []);
    }
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAuthenticated]);

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'orders') return;
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab]);

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
    setCurrentImageUrl(product.imageUrl || '');
    setImagePreview(null);
    setImageFile(null);
    setEditingId(product.id);
    setModalMode('edit');
  };

  // Save product
  const handleSaveProduct = async () => {
    if (!form.name.trim() || !form.brand.trim() || form.price <= 0) {
      showToast('error', 'Please fill in name, brand, and a valid price');
      return;
    }

    setSaving(true);
    let imageUrl = currentImageUrl;

    try {
      // For new products, insert first to get ID
      let productId = editingId;

      if (modalMode === 'add') {
        const { data, error } = await supabase
          .from('products')
          .insert({
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
          })
          .select()
          .single();

        if (error) throw error;
        productId = data?.id;
      } else {
        // Upload image first if editing
        if (imageFile && productId) {
          const uploadedUrl = await handleImageUpload(productId);
          if (uploadedUrl) imageUrl = uploadedUrl;
        }

        const { error } = await supabase
          .from('products')
          .update({
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
            image_url: imageUrl,
          })
          .eq('id', productId);

        if (error) throw error;
      }

      // For new products, upload image after getting ID
      if (modalMode === 'add' && imageFile && productId) {
        const uploadedUrl = await handleImageUpload(productId);
        if (uploadedUrl) {
          await supabase.from('products').update({ image_url: uploadedUrl }).eq('id', productId);
        }
      }

      showToast('success', modalMode === 'add' ? 'Product added!' : 'Product updated!');
      setModalMode('list');
      resetImageState();
      await fetchProducts();
    } catch (err: any) {
      console.error('Save error:', err);
      showToast('error', err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
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

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      showToast('error', 'Failed to update order status');
    } else {
      showToast('success', `Order marked as ${newStatus}`);
      await fetchOrders();
    }
  };

  // Array field helper for product form
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  // Filtered orders
  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

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
              <p className="text-xs text-gray-400">Manage your store</p>
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

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-5 py-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === 'products' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📦 Products
              {activeTab === 'products' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === 'orders' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🛒 Orders
              {pendingCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
              {activeTab === 'orders' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === 'settings' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ Settings
              {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-5 py-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === 'admins' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👥 Admins
              {activeTab === 'admins' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === 'products' && modalMode === 'list' && (
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
                                    onClick={() => handleDeleteProduct(p.id)}
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

        {/* ===== ORDERS TAB ===== */}
        {activeTab === 'orders' && (
          <>
            {/* Orders header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
                  <div className="text-2xl font-black text-gray-900">{orders.length}</div>
                  <div className="text-xs text-gray-500">Total Orders</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
                  <div className="text-2xl font-black text-orange-600">{pendingCount}</div>
                  <div className="text-xs text-gray-500">Pending</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
                  <div className="text-2xl font-black text-green-600">KES {orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Revenue (Delivered)</div>
                </div>
              </div>
              <button
                onClick={fetchOrders}
                className="bg-white border border-gray-200 hover:border-amber-400 text-gray-700 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                🔄 Refresh
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {[
                { key: 'all', label: 'All', count: orders.length },
                { key: 'pending', label: '⏳ Pending', count: orders.filter(o => o.status === 'pending').length },
                { key: 'confirmed', label: '✅ Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
                { key: 'delivered', label: '🚚 Delivered', count: orders.filter(o => o.status === 'delivered').length },
                { key: 'cancelled', label: '❌ Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setOrderFilter(f.key)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    orderFilter === f.key
                      ? 'bg-amber-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-400'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {/* Orders list */}
            {ordersLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin text-5xl mb-4">⏳</div>
                <p className="text-gray-500">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div className="text-5xl mb-4">🛒</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No orders found</h3>
                <p className="text-sm text-gray-500">
                  {orderFilter !== 'all' ? 'Try changing the filter' : 'Orders will appear here once customers start buying'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => {
                  const config = statusConfig[order.status] || statusConfig.pending;

                  return (
                    <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      {/* Order header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{order.id}</span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-amber-600">KES {order.total.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{order.payment_method === 'mpesa' ? 'M-Pesa (Pochi)' : 'Cash on Delivery'}</div>
                        </div>
                      </div>

                      {/* Customer info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-[10px] text-gray-500 font-semibold uppercase">Customer</div>
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 font-semibold uppercase">Phone</div>
                          <div className="text-sm font-medium text-gray-900">{order.phone}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 font-semibold uppercase">Delivery Zone</div>
                          <div className="text-sm font-medium text-gray-900">{order.delivery_zone}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 font-semibold uppercase">Email</div>
                          <div className="text-sm font-medium text-gray-900 truncate">{order.email || 'N/A'}</div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="text-[10px] text-amber-600 font-semibold uppercase mb-0.5">Delivery Address</div>
                        <div className="text-sm text-gray-700">{order.location}</div>
                      </div>

                      {/* Breakdown */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span>Subtotal: <strong className="text-gray-700">KES {order.subtotal.toLocaleString()}</strong></span>
                        <span>Delivery: <strong className="text-gray-700">KES {order.delivery_fee.toLocaleString()}</strong></span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        {config.nextStatus && (
                          <button
                            onClick={() => updateOrderStatus(order.id, config.nextStatus!)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors"
                          >
                            ✅ {config.nextLabel}
                          </button>
                        )}
                        {order.status !== 'cancelled' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                          >
                            ❌ Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === 'settings' && (
          <SettingsPage showToast={showToast} />
        )}

        {/* ===== ADMIN MANAGEMENT TAB ===== */}
        {activeTab === 'admins' && (
          <AdminManagementPage showToast={showToast} />
        )}

        {/* ===== ADD/EDIT PRODUCT MODAL ===== */}
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

                {/* Product Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Product Image</label>
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="relative">
                      {imagePreview || currentImageUrl ? (
                        <div className="w-32 h-32 rounded-xl border-2 border-amber-200 overflow-hidden image-preview bg-gray-50 flex items-center justify-center">
                          <img
                            src={imagePreview || currentImageUrl}
                            alt="Product"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl text-gray-300">📷</div>
                            <div className="text-[10px] text-gray-400 mt-1">No image</div>
                          </div>
                        </div>
                      )}
                      {imageUploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                          <div className="animate-spin text-white text-lg">⏳</div>
                        </div>
                      )}
                    </div>

                    {/* Upload controls */}
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-4 py-2 rounded-lg transition-colors mb-2"
                      >
                        📁 Choose Image
                      </button>
                      <p className="text-[10px] text-gray-400">PNG, JPG, WebP up to 5MB</p>
                      {(imagePreview || currentImageUrl) && (
                        <button
                          type="button"
                          onClick={resetImageState}
                          className="text-[10px] text-red-500 hover:text-red-700 mt-1 block"
                        >
                          ✕ Remove image
                        </button>
                      )}
                    </div>
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
                  onClick={handleSaveProduct}
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
