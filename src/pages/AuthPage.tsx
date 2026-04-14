import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type AuthTab = 'signin' | 'signup' | 'forgot';

interface AuthPageProps {
  onNavigate: (page: string) => void;
  redirectAfterLogin?: string;
}

export default function AuthPage({ onNavigate, redirectAfterLogin = 'checkout' }: AuthPageProps) {
  const { signInWithGoogle, signInWithEmail, signUp, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Sign In form
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });

  // Sign Up form
  const [signUpForm, setSignUpForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  // Forgot password
  const [resetEmail, setResetEmail] = useState('');

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^0[17]\d{8}$/.test(phone.replace(/\s/g, ''));
  const validatePassword = (pw: string) => pw.length >= 6;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(signInForm.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!signInForm.password) {
      setError('Please enter your password');
      return;
    }

    setEmailLoading(true);
    try {
      await signInWithEmail(signInForm.email, signInForm.password);
      sessionStorage.setItem('redirectAfterLogin', redirectAfterLogin);
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.message?.includes('Invalid login')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please verify your email address first. Check your inbox for the confirmation link.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signUpForm.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!validateEmail(signUpForm.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validatePhone(signUpForm.phone)) {
      setError('Enter a valid Kenyan phone number (e.g. 0723424962)');
      return;
    }
    if (!validatePassword(signUpForm.password)) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setEmailLoading(true);
    try {
      await signUp(signUpForm.email, signUpForm.password, signUpForm.name.trim(), signUpForm.phone.trim());
      setSuccess('Account created! Please check your email to verify your account, then sign in.');
      setSignUpForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      // Auto-switch to sign in after a delay
      setTimeout(() => setActiveTab('signin'), 3000);
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.message?.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(resetEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setEmailLoading(true);
    try {
      await resetPassword(resetEmail);
      setSuccess('Password reset link sent! Check your email inbox (and spam folder).');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      sessionStorage.setItem('redirectAfterLogin', redirectAfterLogin);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputClass = (field: string, error?: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
      error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-amber-400'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-start md:items-center justify-center p-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-6 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-2xl shadow-lg">
              💎
            </div>
            <div>
              <h1 className="text-xl font-black">ZeshViv Perfumes</h1>
              <p className="text-xs text-gray-400">Mombasa's Premium Fragrance Store</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { key: 'signin' as AuthTab, label: 'Sign In' },
            { key: 'signup' as AuthTab, label: 'Create Account' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); setSuccess(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === tab.key
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error / Success messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-600">
              ✅ {success}
            </div>
          )}

          {/* ===== SIGN IN FORM ===== */}
          {activeTab === 'signin' && (
            <div>
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className={`w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all hover:border-amber-400 hover:shadow-md mb-4 ${
                  googleLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {googleLoading ? (
                  <><span className="animate-spin">⏳</span> Connecting...</>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Email/Password form */}
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. amina@gmail.com"
                    value={signInForm.email}
                    onChange={e => setSignInForm({ ...signInForm, email: e.target.value })}
                    className={inputClass('email')}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-600">Password *</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={signInForm.password}
                    onChange={e => setSignInForm({ ...signInForm, password: e.target.value })}
                    className={inputClass('password')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all ${
                    emailLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {emailLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Signing In...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Don't have an account?{' '}
                <button onClick={() => setActiveTab('signup')} className="text-amber-600 font-semibold hover:text-amber-700">
                  Create Account
                </button>
              </p>
            </div>
          )}

          {/* ===== SIGN UP FORM ===== */}
          {activeTab === 'signup' && (
            <div>
              {/* Google Sign Up */}
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className={`w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all hover:border-amber-400 hover:shadow-md mb-4 ${
                  googleLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {googleLoading ? (
                  <><span className="animate-spin">⏳</span> Connecting...</>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign up with Google
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Registration form */}
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Amina Hassan"
                    value={signUpForm.name}
                    onChange={e => setSignUpForm({ ...signUpForm, name: e.target.value })}
                    className={inputClass('name')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. amina@gmail.com"
                    value={signUpForm.email}
                    onChange={e => setSignUpForm({ ...signUpForm, email: e.target.value })}
                    className={inputClass('email')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Phone Number (M-Pesa) *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0723424962"
                    value={signUpForm.phone}
                    onChange={e => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                    className={inputClass('phone')}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">We'll send order updates to this number</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Password *</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={signUpForm.password}
                    onChange={e => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    className={inputClass('password')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={signUpForm.confirmPassword}
                    onChange={e => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                    className={inputClass('confirmPassword', signUpForm.confirmPassword && signUpForm.password !== signUpForm.confirmPassword ? 'Passwords do not match' : undefined)}
                  />
                </div>

                {/* Terms */}
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  By creating an account, you agree to our{' '}
                  <span className="text-amber-600 cursor-pointer hover:underline">Terms of Service</span>{' '}
                  and{' '}
                  <span className="text-amber-600 cursor-pointer hover:underline">Privacy Policy</span>
                </div>

                <button
                  type="submit"
                  disabled={emailLoading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all ${
                    emailLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {emailLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Creating Account...
                    </span>
                  ) : '🎉 Create My Account'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Already have an account?{' '}
                <button onClick={() => setActiveTab('signin')} className="text-amber-600 font-semibold hover:text-amber-700">
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* ===== FORGOT PASSWORD ===== */}
          {activeTab === 'forgot' && (
            <div>
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                  🔑
                </div>
                <h2 className="text-lg font-black text-gray-900">Reset Password</h2>
                <p className="text-xs text-gray-500 mt-1">Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. amina@gmail.com"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className={inputClass('resetEmail')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all ${
                    emailLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {emailLoading ? 'Sending...' : '📧 Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                <button onClick={() => setActiveTab('signin')} className="text-amber-600 font-semibold hover:text-amber-700">
                  ← Back to Sign In
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between rounded-b-2xl bg-gray-50">
          <button
            onClick={() => onNavigate('home')}
            className="text-gray-500 text-sm hover:text-amber-600 transition-colors font-medium"
          >
            ← Continue Shopping as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
