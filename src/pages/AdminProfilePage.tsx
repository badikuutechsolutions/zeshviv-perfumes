import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
} from 'lucide-react';

interface AdminProfilePageProps {
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export default function AdminProfilePage({ onNavigate, showToast }: AdminProfilePageProps) {
  const { user, updateProfile, updatePassword } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'password'>('profile');

  // Profile form
  const [name, setName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  if (!user) {
    onNavigate('auth');
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Name is required');
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      showToast('success', 'Profile updated successfully!');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      // Supabase doesn't require current password for password change
      await updatePassword(newPassword);
      showToast('success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection('profile');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition-colors";

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
            <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
            <p className="text-xs text-gray-500">Manage your personal information and password</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="bg-linear-to-r from-amber-500 to-orange-500 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={name}
                  className="w-16 h-16 rounded-full border-3 border-white/30 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shadow-lg">
                  {(name || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">{name || 'User'}</h2>
                <p className="text-white/80 text-sm">{user.email}</p>
                <p className="text-white/60 text-xs mt-1">
                  Member since {new Date(user.created_at).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors relative ${
              activeSection === 'profile' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Information
            {activeSection === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
          </button>
          <button
            onClick={() => setActiveSection('password')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors relative ${
              activeSection === 'password' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            Change Password
            {activeSection === 'password' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
          </button>
        </div>

        {/* Profile Information Form */}
        {activeSection === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              Personal Information
            </h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-900">{user.email}</span>
                  {user.email_confirmed_at && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-auto flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Zeinab Odipo"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 0723424962"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={profileSaving}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all ${
                  profileSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {profileSaving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Change Password Form */}
        {activeSection === 'password' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" />
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={`${inputClass} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className={`${inputClass} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-700 font-semibold mb-1">Password Requirements:</p>
                <ul className="text-xs text-blue-600 space-y-0.5">
                  <li>• At least 6 characters long</li>
                  <li>• Use a mix of letters, numbers, and symbols for better security</li>
                </ul>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={passwordSaving}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all ${
                  passwordSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {passwordSaving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
