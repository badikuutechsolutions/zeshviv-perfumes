import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onNavigate: (page: string) => void;
  redirectAfterLogin?: string;
}

export default function AuthPage({ onNavigate, redirectAfterLogin = 'checkout' }: AuthPageProps) {
  const { signInWithGoogle, loading: authLoading } = useAuth();
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // After Google redirect, the user will be logged in
      // We store the redirect target in sessionStorage for after login
      sessionStorage.setItem('redirectAfterLogin', redirectAfterLogin);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg">
            💎
          </div>
          <h1 className="text-2xl font-black text-gray-900">Welcome to ZeshViv</h1>
          <p className="text-sm text-gray-500 mt-2">
            Sign in to complete your purchase and track your orders
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-amber-800 text-sm mb-3">Why sign in?</h3>
          <ul className="space-y-2 text-xs text-amber-700">
            <li className="flex items-start gap-2">
              <span className="font-bold">✓</span>
              <span>Faster checkout — your details saved</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">✓</span>
              <span>Track your order history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">✓</span>
              <span>Exclusive deals for members</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">✓</span>
              <span>Easy returns and exchanges</span>
            </li>
          </ul>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className={`w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all hover:border-amber-400 hover:shadow-md ${
            googleLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {googleLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              Connecting to Google...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Back to store */}
        <button
          onClick={() => onNavigate('home')}
          className="w-full mt-4 text-gray-500 text-sm hover:text-amber-600 py-2 transition-colors"
        >
          ← Continue Shopping as Guest
        </button>

        {/* Info */}
        <p className="text-center text-xs text-gray-400 mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
