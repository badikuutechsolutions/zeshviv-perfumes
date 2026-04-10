import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/products';
import { Product, CartItem } from '../types';

interface CheckoutPageProps {
  cart: CartItem[];
  onPlaceOrder: (orderData: {
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
  }) => void;
  onNavigate: (page: string) => void;
  isLoading: boolean;
}

const deliveryZones = [
  { name: 'Mombasa CBD', fee: 0, threshold: 3000, time: '1-2 hours', label: 'FREE over KES 3k, else KES 150' },
  { name: 'Nyali & Bamburi', fee: 200, threshold: 99999, time: '2-3 hours', label: 'KES 200' },
  { name: 'Likoni & South Coast', fee: 250, threshold: 99999, time: '2-4 hours', label: 'KES 250' },
  { name: 'Kisauni & Bombolulu', fee: 200, threshold: 99999, time: '2-3 hours', label: 'KES 200' },
  { name: 'Mtwapa', fee: 300, threshold: 99999, time: '3-4 hours', label: 'KES 300' },
  { name: 'Diani & Ukunda', fee: 400, threshold: 99999, time: 'Next day', label: 'KES 400' },
];

export default function CheckoutPage({ cart, onPlaceOrder, onNavigate, isLoading }: CheckoutPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    location: '',
    deliveryZone: deliveryZones[0].name,
    paymentMethod: 'mpesa' as 'mpesa' | 'cash',
    mpesaNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProducts()
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cartProducts = cart
    .map(item => ({
      item,
      product: products.find(p => p.id === item.productId),
    }))
    .filter(cp => cp.product) as { item: CartItem; product: Product }[];

  const subtotal = cartProducts.reduce((sum, { item, product }) => sum + product.price * item.quantity, 0);
  const selectedZone = deliveryZones.find(z => z.name === form.deliveryZone)!;
  const deliveryFee = form.deliveryZone === 'Mombasa CBD' && subtotal >= 3000 ? 0 : selectedZone.fee || 150;
  const total = subtotal + deliveryFee;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName.trim()) errs.customerName = 'Full name is required';
    if (!form.phone.trim() || !/^0[17]\d{8}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid Kenyan phone number';
    if (!form.location.trim()) errs.location = 'Delivery address is required';
    if (form.paymentMethod === 'mpesa' && !form.mpesaNumber.trim())
      errs.mpesaNumber = 'M-Pesa number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const items = cartProducts.map(({ item, product }) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
    }));
    onPlaceOrder({
      customerName: form.customerName,
      phone: form.phone,
      location: form.location,
      deliveryZone: form.deliveryZone,
      paymentMethod: form.paymentMethod,
      mpesaNumber: form.mpesaNumber,
      subtotal,
      deliveryFee,
      total,
      items,
    });
  };

  const inputClass = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-amber-400'
    }`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🚀</div>
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => onNavigate('home')} className="hover:text-amber-600">Home</button>
          <span>/</span>
          <button onClick={() => onNavigate('cart')} className="hover:text-amber-600">Cart</button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Checkout</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-gray-900 mb-2">🚀 Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Delivery */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Amina Hassan"
                    value={form.customerName}
                    onChange={e => setForm({ ...form, customerName: e.target.value })}
                    className={inputClass('customerName')}
                  />
                  {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 0712 345 678"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className={inputClass('phone')}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  <p className="text-xs text-gray-400 mt-1">We'll send your order status to this number</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Zone *</label>
                  <select
                    value={form.deliveryZone}
                    onChange={e => setForm({ ...form, deliveryZone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400"
                  >
                    {deliveryZones.map(z => (
                      <option key={z.name} value={z.name}>
                        {z.name} — {z.label} ({z.time})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Street Address / Landmark *</label>
                  <textarea
                    placeholder="e.g. Near City Mall, Nyali Road, Opposite Barclays Bank"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    rows={2}
                    className={`${inputClass('location')} resize-none`}
                  />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { value: 'mpesa', label: '📱 M-Pesa', desc: 'Pay via Lipa Na M-Pesa', popular: true },
                  { value: 'cash', label: '💵 Cash on Delivery', desc: 'Pay when delivered', popular: false },
                ].map(pm => (
                  <button
                    key={pm.value}
                    onClick={() => setForm({ ...form, paymentMethod: pm.value as 'mpesa' | 'cash' })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.paymentMethod === pm.value
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-gray-800 text-sm">{pm.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{pm.desc}</div>
                    {pm.popular && (
                      <div className="mt-1 inline-block text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">Most Popular</div>
                    )}
                  </button>
                ))}
              </div>

              {form.paymentMethod === 'mpesa' && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
                    <div>
                      <div className="font-bold text-green-800 text-sm">Lipa Na M-Pesa</div>
                      <div className="text-xs text-green-600">Paybill: 123456 | Account: Your Order ID</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">M-Pesa Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0712 345 678"
                      value={form.mpesaNumber}
                      onChange={e => setForm({ ...form, mpesaNumber: e.target.value })}
                      className={inputClass('mpesaNumber')}
                    />
                    {errors.mpesaNumber && <p className="text-red-500 text-xs mt-1">{errors.mpesaNumber}</p>}
                    <p className="text-xs text-gray-500 mt-1.5">📲 You'll receive an STK push to complete payment after placing your order.</p>
                  </div>
                </div>
              )}

              {form.paymentMethod === 'cash' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-sm text-blue-700">💡 <strong>Cash on Delivery:</strong> Please have exact change ready. Our rider will collect KES {total.toLocaleString()} upon delivery.</p>
                </div>
              )}
            </div>

            {/* Place order button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full font-black py-4 rounded-xl text-lg transition-all shadow-lg hover:-translate-y-0.5 ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-white hover:shadow-amber-200'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Processing Order...
                </span>
              ) : (
                `🎉 Place Order — KES ${total.toLocaleString()}`
              )}
            </button>
            <p className="text-center text-xs text-gray-400">
              By placing your order, you agree to our Terms & Conditions and Privacy Policy
            </p>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-36">
              <h2 className="font-bold text-gray-900 mb-3">📦 Your Order</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartProducts.map(({ item, product }) => (
                  <div key={product.id} className="flex gap-3 text-sm">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{product.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">{product.name}</div>
                      <div className="text-gray-500 text-xs">x{item.quantity} × KES {product.price.toLocaleString()}</div>
                    </div>
                    <div className="font-bold text-gray-800 flex-shrink-0">KES {(product.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery ({form.deliveryZone})</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {deliveryFee === 0 ? 'FREE 🎉' : `KES ${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-base pt-1 border-t">
                  <span>Total</span>
                  <span className="text-amber-600">KES {total.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
                ⏱️ Estimated delivery: <strong>{selectedZone?.time}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
