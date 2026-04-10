import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ViabilityPage from './pages/ViabilityPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import AdminProfilePage from './pages/AdminProfilePage';
import ProfilePage from './pages/ProfilePage';
import { supabase } from './lib/supabase';
import { CartItem, Page } from './types';

type OrderData = {
  customerName: string;
  phone: string;
  location: string;
  deliveryZone: string;
  paymentMethod: 'mpesa' | 'cash';
  mpesaNumber?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: { productId: number; quantity: number; unitPrice: number }[];
};

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('zeshviv-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle redirect after Google login
  useEffect(() => {
    if (user) {
      const redirectTarget = sessionStorage.getItem('redirectAfterLogin');
      if (redirectTarget) {
        sessionStorage.removeItem('redirectAfterLogin');
        setPage(redirectTarget as Page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [user]);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('zeshviv-cart', JSON.stringify(cart));
  }, [cart]);

  const handleNavigate = (targetPage: string, productId?: number) => {
    // If trying to access checkout without being logged in, redirect to auth
    if (targetPage === 'checkout' && !user) {
      setPage('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetPage === 'product' && productId) {
      setSelectedProductId(productId);
    }
    setPage(targetPage as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (productId: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleUpdateCart = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.productId !== productId));
    } else {
      setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
    }
  };

  const handlePlaceOrder = async (orderData: OrderData) => {
    if (!user) {
      handleNavigate('auth');
      return;
    }

    setIsLoading(true);
    try {
      const orderId = `ZV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_name: orderData.customerName,
          phone: orderData.phone,
          location: orderData.location,
          delivery_zone: orderData.deliveryZone,
          payment_method: orderData.paymentMethod,
          mpesa_number: orderData.mpesaNumber || null,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          total: orderData.total,
          status: 'pending',
          user_id: user.id,
          email: user.email,
        });

      if (orderError) throw orderError;

      const orderItems = orderData.items.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await supabase
        .from('customers')
        .upsert({
          name: orderData.customerName,
          phone: orderData.phone,
          location: orderData.location,
          email: user.email,
        }, { onConflict: 'phone' });

      setLastOrderId(orderId);
      setCart([]);
      setPage('order-success');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      console.log('Order placed successfully:', { orderId, ...orderData });
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again or contact us on WhatsApp: 0712 345 678');
    } finally {
      setIsLoading(false);
    }
  };

  const showNav = page !== 'order-success' && page !== 'admin' && page !== 'auth' && page !== 'profile' && page !== 'admin-profile';

  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && (
        <Navbar
          cart={cart}
          onNavigate={handleNavigate}
          currentPage={page}
        />
      )}

      {page === 'auth' && (
        <AuthPage
          onNavigate={handleNavigate}
          redirectAfterLogin="checkout"
        />
      )}

      {page === 'home' && (
        <HomePage
          cart={cart}
          onAddToCart={handleAddToCart}
          onNavigate={handleNavigate}
        />
      )}

      {page === 'shop' && (
        <ShopPage
          cart={cart}
          onAddToCart={handleAddToCart}
          onNavigate={handleNavigate}
        />
      )}

      {page === 'product' && selectedProductId && (
        <ProductPage
          productId={selectedProductId}
          cart={cart}
          onAddToCart={handleAddToCart}
          onNavigate={handleNavigate}
        />
      )}

      {page === 'cart' && (
        <CartPage
          cart={cart}
          onUpdateCart={handleUpdateCart}
          onNavigate={handleNavigate}
        />
      )}

      {page === 'checkout' && user && (
        <CheckoutPage
          cart={cart}
          onPlaceOrder={handlePlaceOrder}
          onNavigate={handleNavigate}
          isLoading={isLoading}
          user={user}
        />
      )}

      {page === 'order-success' && (
        <OrderSuccessPage
          orderId={lastOrderId}
          onNavigate={handleNavigate}
        />
      )}

      {page === 'viability' && (
        <ViabilityPage
          onNavigate={handleNavigate}
        />
      )}

      {page === 'admin' && (
        <AdminPage
          onNavigate={handleNavigate}
        />
      )}

      {page === 'admin-profile' && (
        <AdminProfilePage
          onNavigate={handleNavigate}
          showToast={(type, message) => {
            // Simple alert for admin profile
            if (type === 'error') alert(message);
            else alert('✅ ' + message);
          }}
        />
      )}

      {page === 'profile' && (
        <ProfilePage
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
