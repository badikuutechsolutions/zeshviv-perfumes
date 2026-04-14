import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

type CreditSale = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  total_amount: number;
  amount_paid: number;
  balance: number;
  due_date: string | null;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CreditPayment = {
  id: string;
  credit_sale_id: string;
  amount: number;
  payment_method: string;
  payment_reference: string | null;
  recorded_by: string | null;
  notes: string | null;
  created_at: string;
};

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

interface CreditSalesPageProps {
  showToast: (type: 'success' | 'error', message: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-orange-600', bg: 'bg-orange-50' },
  partial: { label: 'Partial', color: 'text-blue-600', bg: 'bg-blue-50' },
  paid: { label: 'Paid', color: 'text-green-600', bg: 'bg-green-50' },
  overdue: { label: 'Overdue', color: 'text-red-600', bg: 'bg-red-50' },
  cancelled: { label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-50' },
};

export default function CreditSalesPage({ showToast }: CreditSalesPageProps) {
  const [creditSales, setCreditSales] = useState<CreditSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedSale, setSelectedSale] = useState<CreditSale | null>(null);
  const [payments, setPayments] = useState<CreditPayment[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'mpesa',
    payment_reference: '',
    notes: '',
  });

  // Add credit sale form
  const [addForm, setAddForm] = useState({
    order_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    total_amount: '',
    due_date: '',
    notes: '',
  });

  const fetchCreditSales = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('credit_sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching credit sales:', error);
      showToast('error', 'Failed to load credit sales');
    } else {
      setCreditSales(data || []);
    }
    setLoading(false);
  }, [showToast]);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
  }, []);

  const fetchPayments = async (creditSaleId: string) => {
    const { data, error } = await supabase
      .from('credit_payments')
      .select('*')
      .eq('credit_sale_id', creditSaleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      showToast('error', 'Failed to load payment history');
    } else {
      setPayments(data || []);
    }
  };

  useEffect(() => {
    fetchCreditSales();
    fetchOrders();
  }, [fetchCreditSales, fetchOrders]);

  const handleViewDetails = async (sale: CreditSale) => {
    setSelectedSale(sale);
    await fetchPayments(sale.id);
  };

  const handleRecordPayment = async () => {
    if (!selectedSale || !paymentForm.amount) {
      showToast('error', 'Please enter a valid amount');
      return;
    }

    const amount = parseFloat(paymentForm.amount);
    if (amount <= 0) {
      showToast('error', 'Amount must be greater than 0');
      return;
    }

    if (amount > selectedSale.balance) {
      showToast('error', `Amount cannot exceed balance (KES ${selectedSale.balance.toLocaleString()})`);
      return;
    }

    const { error } = await supabase.from('credit_payments').insert({
      credit_sale_id: selectedSale.id,
      amount,
      payment_method: paymentForm.payment_method,
      payment_reference: paymentForm.payment_reference || null,
      notes: paymentForm.notes || null,
    });

    if (error) {
      showToast('error', 'Failed to record payment');
      console.error(error);
    } else {
      showToast('success', `Payment of KES ${amount.toLocaleString()} recorded successfully`);
      setShowPaymentModal(false);
      setPaymentForm({ amount: '', payment_method: 'mpesa', payment_reference: '', notes: '' });
      await fetchCreditSales();
      await fetchPayments(selectedSale.id);
      // Refresh selected sale
      const { data } = await supabase.from('credit_sales').select('*').eq('id', selectedSale.id).single();
      if (data) setSelectedSale(data);
    }
  };

  const handleAddCreditSale = async () => {
    if (!addForm.order_id || !addForm.customer_name || !addForm.customer_phone || !addForm.total_amount) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const totalAmount = parseFloat(addForm.total_amount);
    if (totalAmount <= 0) {
      showToast('error', 'Total amount must be greater than 0');
      return;
    }

    const { error } = await supabase.from('credit_sales').insert({
      order_id: addForm.order_id,
      customer_name: addForm.customer_name.trim(),
      customer_phone: addForm.customer_phone.trim(),
      customer_email: addForm.customer_email.trim() || null,
      total_amount: totalAmount,
      amount_paid: 0,
      balance: totalAmount,
      due_date: addForm.due_date || null,
      status: 'pending',
      notes: addForm.notes.trim() || null,
    });

    if (error) {
      showToast('error', 'Failed to create credit sale');
      console.error(error);
    } else {
      showToast('success', 'Credit sale created successfully');
      setShowAddModal(false);
      setAddForm({ order_id: '', customer_name: '', customer_phone: '', customer_email: '', total_amount: '', due_date: '', notes: '' });
      await fetchCreditSales();
    }
  };

  const handleCancelCreditSale = async (sale: CreditSale) => {
    if (!confirm(`Are you sure you want to cancel credit sale for ${sale.customer_name}?`)) return;

    const { error } = await supabase
      .from('credit_sales')
      .update({ status: 'cancelled' })
      .eq('id', sale.id);

    if (error) {
      showToast('error', 'Failed to cancel credit sale');
    } else {
      showToast('success', 'Credit sale cancelled');
      await fetchCreditSales();
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

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  // Stats
  const totalCreditSales = creditSales.filter(s => s.status !== 'cancelled').length;
  const totalOutstanding = creditSales
    .filter(s => s.status !== 'cancelled' && s.status !== 'paid')
    .reduce((sum, s) => sum + s.balance, 0);
  const totalPaid = creditSales
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.total_amount, 0);
  const pendingCount = creditSales.filter(s => s.status === 'pending' || s.status === 'partial').length;

  // Filtered sales
  const filteredSales = filter === 'all' ? creditSales : creditSales.filter(s => s.status === filter);

  return (
    <div>
      {/* Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
            <div className="text-2xl font-black text-gray-900">{totalCreditSales}</div>
            <div className="text-xs text-gray-500">Total Credit Sales</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
            <div className="text-2xl font-black text-orange-600">{formatCurrency(totalOutstanding)}</div>
            <div className="text-xs text-gray-500">Outstanding Balance</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
            <div className="text-2xl font-black text-green-600">{formatCurrency(totalPaid)}</div>
            <div className="text-xs text-gray-500">Fully Paid</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
            <div className="text-2xl font-black text-blue-600">{pendingCount}</div>
            <div className="text-xs text-gray-500">Pending/Partial</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            + New Credit Sale
          </button>
          <button
            onClick={fetchCreditSales}
            className="bg-white border border-gray-200 hover:border-amber-400 text-gray-700 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All', count: creditSales.length },
          { key: 'pending', label: '⏳ Pending', count: creditSales.filter(s => s.status === 'pending').length },
          { key: 'partial', label: '💵 Partial', count: creditSales.filter(s => s.status === 'partial').length },
          { key: 'paid', label: '✅ Paid', count: creditSales.filter(s => s.status === 'paid').length },
          { key: 'overdue', label: '⚠️ Overdue', count: creditSales.filter(s => s.status === 'overdue').length },
          { key: 'cancelled', label: '❌ Cancelled', count: creditSales.filter(s => s.status === 'cancelled').length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-400'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Credit sales list */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-gray-500">Loading credit sales...</p>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">💳</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No credit sales found</h3>
          <p className="text-sm text-gray-500">
            {filter !== 'all' ? 'Try changing the filter' : 'Credit sales will appear here when created'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSales.map(sale => {
            const config = statusConfig[sale.status] || statusConfig.pending;
            const progressPercent = sale.total_amount > 0 ? (sale.amount_paid / sale.total_amount) * 100 : 0;

            return (
              <div key={sale.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">Order #{sale.order_id}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(sale.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-600">{formatCurrency(sale.total_amount)}</div>
                    <div className="text-xs text-gray-500">Balance: <span className="font-bold text-red-600">{formatCurrency(sale.balance)}</span></div>
                  </div>
                </div>

                {/* Customer info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Customer</div>
                    <div className="text-sm font-medium text-gray-900">{sale.customer_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Phone</div>
                    <div className="text-sm font-medium text-gray-900">{sale.customer_phone}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Paid</div>
                    <div className="text-sm font-medium text-green-600">{formatCurrency(sale.amount_paid)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Due Date</div>
                    <div className="text-sm font-medium text-gray-900">{sale.due_date ? new Date(sale.due_date).toLocaleDateString('en-KE') : 'N/A'}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Payment Progress</span>
                    <span>{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progressPercent >= 100 ? 'bg-green-500' : progressPercent > 0 ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Notes */}
                {sale.notes && (
                  <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="text-[10px] text-amber-600 font-semibold uppercase mb-0.5">Notes</div>
                    <div className="text-sm text-gray-700">{sale.notes}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 flex-wrap">
                  <button
                    onClick={() => handleViewDetails(sale)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    👁️ View Details
                  </button>
                  {sale.status !== 'cancelled' && sale.status !== 'paid' && (
                    <button
                      onClick={() => { setSelectedSale(sale); setShowPaymentModal(true); setPaymentForm({ amount: '', payment_method: 'mpesa', payment_reference: '', notes: '' }); }}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      💵 Record Payment
                    </button>
                  )}
                  {sale.status !== 'cancelled' && sale.status !== 'paid' && (
                    <button
                      onClick={() => handleCancelCreditSale(sale)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedSale && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-black text-lg">💵 Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="text-sm text-gray-600 mb-1">Customer: <strong>{selectedSale.customer_name}</strong></div>
                <div className="text-sm text-gray-600 mb-1">Total: <strong>{formatCurrency(selectedSale.total_amount)}</strong></div>
                <div className="text-sm text-gray-600">Outstanding Balance: <strong className="text-red-600">{formatCurrency(selectedSale.balance)}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Amount (KES) *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                >
                  <option value="mpesa">📱 M-Pesa</option>
                  <option value="cash">💵 Cash</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Reference (Optional)</label>
                <input
                  type="text"
                  value={paymentForm.payment_reference}
                  onChange={e => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })}
                  placeholder="e.g. M-Pesa transaction code"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (Optional)</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl bg-white">
              <button onClick={() => setShowPaymentModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleRecordPayment} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">Record Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Credit Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-black text-lg">+ New Credit Sale</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Order *</label>
                <select
                  value={addForm.order_id}
                  onChange={e => {
                    const order = orders.find(o => o.id === e.target.value);
                    if (order) {
                      setAddForm({
                        ...addForm,
                        order_id: e.target.value,
                        customer_name: order.customer_name,
                        customer_phone: order.phone,
                        customer_email: order.email || '',
                        total_amount: order.total.toString(),
                      });
                    }
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                >
                  <option value="">Select an order...</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {o.customer_name} ({formatCurrency(o.total)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={addForm.customer_name}
                  onChange={e => setAddForm({ ...addForm, customer_name: e.target.value })}
                  placeholder="Customer full name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={addForm.customer_phone}
                  onChange={e => setAddForm({ ...addForm, customer_phone: e.target.value })}
                  placeholder="e.g. 0723424962"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={addForm.customer_email}
                  onChange={e => setAddForm({ ...addForm, customer_email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Total Amount (KES) *</label>
                <input
                  type="number"
                  value={addForm.total_amount}
                  onChange={e => setAddForm({ ...addForm, total_amount: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date (Optional)</label>
                <input
                  type="date"
                  value={addForm.due_date}
                  onChange={e => setAddForm({ ...addForm, due_date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (Optional)</label>
                <textarea
                  value={addForm.notes}
                  onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="Additional notes about this credit sale..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>
            <div className="border-t px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl bg-white">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleAddCreditSale} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">Create Credit Sale</button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedSale && !showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setSelectedSale(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl shrink-0">
              <h2 className="font-black text-lg">📋 Credit Sale Details</h2>
              <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-white text-xl font-bold">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {/* Sale info */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Order ID</div>
                    <div className="font-bold text-gray-900">{selectedSale.order_id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Status</div>
                    <div className={`font-bold ${statusConfig[selectedSale.status]?.color}`}>{statusConfig[selectedSale.status]?.label}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Customer</div>
                    <div className="font-bold text-gray-900">{selectedSale.customer_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Phone</div>
                    <div className="font-bold text-gray-900">{selectedSale.customer_phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Total Amount</div>
                    <div className="font-bold text-gray-900">{formatCurrency(selectedSale.total_amount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Amount Paid</div>
                    <div className="font-bold text-green-600">{formatCurrency(selectedSale.amount_paid)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Balance</div>
                    <div className="font-bold text-red-600">{formatCurrency(selectedSale.balance)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Due Date</div>
                    <div className="font-bold text-gray-900">{selectedSale.due_date ? new Date(selectedSale.due_date).toLocaleDateString('en-KE') : 'N/A'}</div>
                  </div>
                </div>
                {selectedSale.notes && (
                  <div className="mt-3 pt-3 border-t border-amber-200">
                    <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Notes</div>
                    <div className="text-sm text-gray-700">{selectedSale.notes}</div>
                  </div>
                )}
              </div>

              {/* Payment history */}
              <h3 className="font-bold text-gray-900 mb-3">💳 Payment History</h3>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No payments recorded yet</div>
              ) : (
                <div className="space-y-2">
                  {payments.map(payment => (
                    <div key={payment.id} className="bg-white border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                          <div className="text-xs text-gray-500">{formatDate(payment.created_at)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-gray-700 capitalize">{payment.payment_method.replace('_', ' ')}</div>
                          {payment.payment_reference && (
                            <div className="text-[10px] text-gray-500">Ref: {payment.payment_reference}</div>
                          )}
                        </div>
                      </div>
                      {payment.notes && (
                        <div className="mt-2 text-xs text-gray-600 italic">{payment.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* WhatsApp link */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <a
                  href={`https://wa.me/254${selectedSale.customer_phone.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  💬 WhatsApp {selectedSale.customer_name}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
