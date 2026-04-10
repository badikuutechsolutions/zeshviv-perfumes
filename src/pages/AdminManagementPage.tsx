import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface AdminManagementProps {
  showToast: (type: 'success' | 'error', message: string) => void;
}

type AdminUser = {
  id: number;
  email: string;
  name: string | null;
  role: 'super_admin' | 'admin' | 'staff';
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  last_login: string | null;
};

export default function AdminManagementPage({ showToast }: AdminManagementProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', name: '', role: 'admin' as const });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error: any) {
      console.error('Error fetching admins:', error);
      showToast('error', 'Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.email.trim()) {
      showToast('error', 'Please enter an email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdmin.email)) {
      showToast('error', 'Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('admin_users').insert({
        email: newAdmin.email.trim().toLowerCase(),
        name: newAdmin.name.trim() || null,
        role: newAdmin.role,
        is_active: true,
        created_by: 'super_admin',
      });

      if (error) {
        if (error.code === '23505') {
          showToast('error', 'An admin with this email already exists');
        } else {
          throw error;
        }
      } else {
        showToast('success', `${newAdmin.email} added as ${newAdmin.role}`);
        setNewAdmin({ email: '', name: '', role: 'admin' });
        setShowAddForm(false);
        await fetchAdmins();
      }
    } catch (error: any) {
      showToast('error', error.message || 'Failed to add admin');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (admin: AdminUser) => {
    const { error } = await supabase
      .from('admin_users')
      .update({ is_active: !admin.is_active })
      .eq('id', admin.id);

    if (error) {
      showToast('error', 'Failed to update admin status');
    } else {
      showToast('success', `${admin.email} ${!admin.is_active ? 'activated' : 'deactivated'}`);
      await fetchAdmins();
    }
  };

  const updateRole = async (admin: AdminUser, newRole: string) => {
    const { error } = await supabase
      .from('admin_users')
      .update({ role: newRole })
      .eq('id', admin.id);

    if (error) {
      showToast('error', 'Failed to update role');
    } else {
      showToast('success', `${admin.email} role updated to ${newRole}`);
      await fetchAdmins();
    }
  };

  const removeAdmin = async (admin: AdminUser) => {
    if (!confirm(`Are you sure you want to remove ${admin.email}?`)) return;

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', admin.id);

    if (error) {
      showToast('error', 'Failed to remove admin');
    } else {
      showToast('success', `${admin.email} has been removed`);
      await fetchAdmins();
    }
  };

  const roleLabels: Record<string, string> = {
    super_admin: '👑 Super Admin',
    admin: '🛡️ Admin',
    staff: '👤 Staff',
  };

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    staff: 'bg-gray-100 text-gray-700',
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

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin text-5xl mb-4">👥</div>
        <p className="text-gray-500">Loading admin users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Admin Users</h2>
          <p className="text-sm text-gray-500">{admins.length} admin{admins.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm hover:-translate-y-0.5"
        >
          {showAddForm ? '✕ Cancel' : '+ Add Admin'}
        </button>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-900 text-white px-5 py-3">
            <h3 className="font-bold text-sm">➕ New Admin User</h3>
          </div>
          <div className="p-5">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-700">
                💡 <strong>How it works:</strong> Enter the Google email address of the person you want to add. 
                They'll be able to sign in with that Google account. Share the admin dashboard URL and password with them.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Google Email *</label>
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  value={newAdmin.email}
                  onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zeinab Odipo"
                  value={newAdmin.name}
                  onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                <select
                  value={newAdmin.role}
                  onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value as typeof newAdmin.role })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                >
                  <option value="admin">🛡️ Admin</option>
                  <option value="super_admin">👑 Super Admin</option>
                  <option value="staff">👤 Staff</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                disabled={saving}
                className={`px-5 py-2 rounded-lg text-sm font-bold text-white transition-all ${
                  saving ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400'
                }`}
              >
                {saving ? 'Adding...' : '✅ Add Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admins List */}
      {admins.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No admin users yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first admin user to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-amber-400"
          >
            + Add First Admin
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-bold text-gray-700">Email</th>
                  <th className="text-left p-3 font-bold text-gray-700">Name</th>
                  <th className="text-left p-3 font-bold text-gray-700">Role</th>
                  <th className="text-left p-3 font-bold text-gray-700">Status</th>
                  <th className="text-left p-3 font-bold text-gray-700">Created</th>
                  <th className="text-right p-3 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map(admin => (
                  <tr key={admin.id} className={`hover:bg-gray-50 transition-colors ${!admin.is_active ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{admin.email}</div>
                      {admin.last_login && (
                        <div className="text-[10px] text-gray-400">Last login: {formatDate(admin.last_login)}</div>
                      )}
                    </td>
                    <td className="p-3 text-gray-600">{admin.name || '—'}</td>
                    <td className="p-3">
                      <select
                        value={admin.role}
                        onChange={e => updateRole(admin, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer ${roleColors[admin.role]}`}
                      >
                        <option value="super_admin">👑 Super Admin</option>
                        <option value="admin">🛡️ Admin</option>
                        <option value="staff">👤 Staff</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleActive(admin)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                          admin.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {admin.is_active ? '✓ Active' : '✗ Inactive'}
                      </button>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{formatDate(admin.created_at)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(admin)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {admin.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => removeAdmin(admin)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role descriptions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-sm text-gray-900 mb-3">📋 Role Permissions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
            <div className="text-sm font-bold text-purple-800 mb-1">👑 Super Admin</div>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Full access to everything</li>
              <li>• Add/remove other admins</li>
              <li>• Manage all settings</li>
              <li>• Manage products & orders</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="text-sm font-bold text-blue-800 mb-1">🛡️ Admin</div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Manage products</li>
              <li>• Manage orders & payments</li>
              <li>• View store settings</li>
              <li>• Cannot manage admins</li>
            </ul>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <div className="text-sm font-bold text-gray-800 mb-1">👤 Staff</div>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• View orders only</li>
              <li>• Update order status</li>
              <li>• Cannot edit products</li>
              <li>• Cannot change settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
