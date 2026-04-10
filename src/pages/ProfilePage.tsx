import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

type OrderRecord = {
  id: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
  payment_method: string;
  delivery_zone: string;
  customer_name: string;
  phone: string;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    product_name?: string;
    product_emoji?: string;
  }[];
};

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, signOut, updateProfile, updatePassword } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'orders' | 'order-detail' | 'edit' | 'password'>('profile');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Initialize edit form
  useEffect(() => {
    if (user) {
      setEditName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      setEditPhone(user.user_metadata?.phone || '');
    }
  }, [user]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any; message?: string }> = {
    pending: { label: 'Pending — Payment Verification', color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock, message: 'We\'re waiting to confirm your payment. Once confirmed, status will update to Confirmed.' },
    confirmed: { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle, message: 'Payment received! We\'re preparing your order for delivery.' },
    delivered: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50', icon: Truck, message: 'Your order has been delivered. Enjoy your fragrance!' },
    cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', icon: Package, message: 'This order was cancelled.' },
  };

  useEffect(() => {
    if (!user) {
      onNavigate('auth');
      return;
    }
    fetchOrders();
    // Auto-refresh orders every 30 seconds so customer sees status changes
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`email.eq.${user.email},user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          const itemsWithProducts = await Promise.all(
            (items || []).map(async (item) => {
              const { data: product } = await supabase
                .from('products')
                .select('name, emoji')
                .eq('id', item.product_id)
                .single();

              return {
                ...item,
                product_name: product?.name || 'Unknown Product',
                product_emoji: product?.emoji || '📦',
              };
            })
          );

          return { ...order, items: itemsWithProducts };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('error', 'Name is required');
      return;
    }
    setEditSaving(true);
    try {
      await updateProfile({ name: editName.trim(), phone: editPhone.trim() });
      showToast('success', 'Profile updated!');
      setActiveSection('profile');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update profile');
    } finally {
      setEditSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await updatePassword(newPassword);
      showToast('success', 'Password changed!');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection('profile');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
  const userPhone = user.user_metadata?.phone || 'Not set';
  const userAvatar = user.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Account</h1>
            <p className="text-xs text-gray-500">Manage your profile and orders</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-[99999] px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-linear-to-r from-amber-500 to-orange-500 px-6 py-8 text-white">
                <div className="flex items-center gap-4">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-16 h-16 rounded-full border-3 border-white/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shadow-lg">
                      {userName[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{userName}</h2>
                    <p className="text-white/80 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Personal Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-sm font-medium text-gray-900 truncate">{user.email}</div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="text-sm font-medium text-gray-900">{userPhone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500">Member Since</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(user.created_at).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={() => setActiveSection('edit')}
                    className="w-full flex items-center justify-between p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors border border-amber-100"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-amber-600" />
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">Edit Profile</div>
                        <div className="text-xs text-gray-500">Update your name and phone</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-400" />
                  </button>
                  <button
                    onClick={() => setActiveSection('password')}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">Change Password</div>
                        <div className="text-xs text-gray-500">Update your account password</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => setActiveSection('orders')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5 text-amber-500" />
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">My Orders</div>
                        <div className="text-xs text-gray-500">{orders.length} orders placed</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-red-200 rounded-xl text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Section */}
        {activeSection === 'edit' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setActiveSection('profile')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                <p className="text-xs text-gray-500">Update your personal information</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-900">{user.email}</span>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-amber-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-amber-400" />
                  </div>
                </div>
                <button type="submit" disabled={editSaving} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all ${editSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 shadow-lg'}`}>
                  {editSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Section */}
        {activeSection === 'password' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setActiveSection('profile')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-amber-400" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-amber-400" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-700">💡 Password must be at least 6 characters. Use a mix of letters, numbers, and symbols for better security.</p>
                </div>
                <button type="submit" disabled={passwordSaving} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all ${passwordSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 shadow-lg'}`}>
                  {passwordSaving ? 'Updating...' : <><Lock className="w-4 h-4" /> Update Password</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Orders List */}
        {activeSection === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setActiveSection('profile')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-bold text-gray-900">My Orders</h2>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin text-3xl mb-3 text-amber-500 mx-auto">
                  <Clock className="w-8 h-8 animate-spin" />
                </div>
                <p className="text-gray-500">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-sm text-gray-500 mb-6">Start shopping and your orders will appear here</p>
                <button
                  onClick={() => onNavigate('shop')}
                  className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const config = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <button
                      key={order.id}
                      onClick={() => { setSelectedOrder(order); setActiveSection('order-detail'); }}
                      className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-amber-200 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{order.id}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.created_at)}
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>

                      {/* Items preview */}
                      {order.items && order.items.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          {order.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-lg">
                              {item.product_emoji || '📦'}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xs text-gray-500">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="text-xs text-gray-500">
                          {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items • {order.payment_method === 'mpesa' ? 'M-Pesa' : 'Cash'}
                        </div>
                        <div className="text-lg font-bold text-amber-600">
                          KES {order.total.toLocaleString()}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Order Detail */}
        {activeSection === 'order-detail' && selectedOrder && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setActiveSection('orders')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                <p className="text-xs text-gray-500">{selectedOrder.id}</p>
              </div>
            </div>

            {/* Status */}
            {(() => {
              const config = statusConfig[selectedOrder.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <div>
                  <div className={`${config.bg} border border-${config.color.replace('text-', '')}-100 rounded-2xl p-4 flex items-center gap-3`}>
                    <StatusIcon className={`w-6 h-6 ${config.color}`} />
                    <div>
                      <div className={`font-bold ${config.color}`}>{config.label}</div>
                      <div className="text-xs text-gray-500">Order placed on {formatDate(selectedOrder.created_at)}</div>
                    </div>
                  </div>
                  {config.message && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      💡 {config.message}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <h3 className="font-bold text-sm text-gray-900">Items Ordered</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {item.product_emoji || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{item.product_name}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity} × KES {item.unit_price.toLocaleString()}</div>
                    </div>
                    <div className="font-bold text-gray-900">KES {(item.quantity * item.unit_price).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>KES {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery ({selectedOrder.delivery_zone})</span>
                  <span>KES {selectedOrder.delivery_fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                  <span>Total Paid</span>
                  <span className="text-amber-600">KES {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Delivery Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium text-gray-900">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900">{selectedOrder.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-gray-900">{selectedOrder.payment_method === 'mpesa' ? 'M-Pesa' : 'Cash on Delivery'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
