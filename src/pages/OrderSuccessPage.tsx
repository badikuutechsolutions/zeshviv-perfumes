interface OrderSuccessPageProps {
  orderId: string;
  onNavigate: (page: string) => void;
}

export default function OrderSuccessPage({ orderId, onNavigate }: OrderSuccessPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
        {/* Success animation */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🎉</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-4">Asante sana! Your order has been received.</p>

        {/* Order ID */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
          <div className="text-xs text-gray-500 mb-1">Order Reference</div>
          <div className="font-black text-amber-700 text-xl">{orderId}</div>
          <div className="text-xs text-gray-400 mt-1">Save this number for tracking</div>
        </div>

        {/* Steps */}
        <div className="text-left space-y-3 mb-6">
          {[
            { icon: '📱', title: 'M-Pesa STK Push Sent', desc: 'Check your phone and enter your M-Pesa PIN to complete payment.' },
            { icon: '📦', title: 'Order Being Prepared', desc: 'We\'re picking and packing your perfume(s) right now.' },
            { icon: '🛵', title: 'Out for Delivery', desc: 'Our rider will be on the way to you shortly.' },
            { icon: '📞', title: 'Rider Will Call You', desc: 'Expect a call from our delivery rider for directions.' },
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg border border-amber-100">
                {step.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{step.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700">
            📞 Need help? Call or WhatsApp us at <strong>0712 345 678</strong><br />
            We're available 8am – 9pm, 7 days a week.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('shop')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors"
          >
            🛍️ Continue Shopping
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
