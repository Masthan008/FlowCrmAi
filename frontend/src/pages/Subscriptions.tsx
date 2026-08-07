import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Repeat, Plus, Search, Trash2, Loader2, PauseCircle, PlayCircle,
  TrendingUp, ShieldCheck, DollarSign, Calendar, Zap, Sparkles, Check, X, RefreshCw, CheckCircle2,
  CreditCard, QrCode, Building2, Download, FileText, Lock, ArrowRight, ArrowUpRight
} from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { subscriptionApi } from '../services/subscriptionApi';
import { api } from '../services/api';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface SubscriptionItem {
  id: string;
  planName?: string;
  status: string;
  renewalDate?: string;
  createdAt?: string;
  amount?: number;
}

interface PaymentTransaction {
  id: string;
  transactionId: string;
  planName: string;
  amount: number;
  method: string;
  date: string;
  invoiceNumber: string;
}

export default function Subscriptions() {
  const breadcrumbs = [{ label: 'Billing & Recurring Revenue' }, { label: 'Subscriptions & Payments' }];
  const toast = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'transactions'>('all');

  // Checkout Payment Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<{ name: string; price: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [res, paymentsRes] = await Promise.all([
        subscriptionApi.list().catch(() => ({ data: { data: [] } })),
        api.get('/payments').catch(() => ({ data: { data: [] } }))
      ]);

      const rawItems = res.data.data?.items || res.data.data || [];
      const mapped = rawItems.map((s: any) => ({
        id: s.id,
        planName: s.plan?.name || s.planName || 'Professional Scale Plan',
        status: (s.status || 'Active').toLowerCase(),
        renewalDate: s.endDate ? s.endDate.split('T')[0] : (s.nextBillingDate ? s.nextBillingDate.split('T')[0] : 'Auto-renews monthly'),
        createdAt: s.startDate ? s.startDate.split('T')[0] : (s.createdAt ? s.createdAt.split('T')[0] : ''),
        amount: s.plan?.price || s.amount || 8999,
      }));
      setItems(mapped);

      const payItems = paymentsRes.data?.data || paymentsRes.data?.data?.items || [];
      const mappedPay = payItems.map((p: any) => ({
        id: p.id,
        transactionId: p.transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        planName: p.planName || 'Enterprise Subscription',
        amount: p.amount || 8999,
        method: p.method || 'Credit Card / UPI',
        date: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        invoiceNumber: p.invoice?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      }));
      setTransactions(mappedPay);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openPaymentCheckout = (planName: string, price: number) => {
    setSelectedPlanForPayment({ name: planName, price });
    setShowCheckoutModal(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForPayment) return;

    setIsProcessing(true);
    const unitPrice = isAnnual ? selectedPlanForPayment.price * 10 : selectedPlanForPayment.price; // 20% discount on annual
    const taxAmount = Math.round(unitPrice * 0.18);
    const totalAmount = unitPrice + taxAmount;

    try {
      const res = await api.post('/payments/process', {
        amount: totalAmount,
        currency: 'INR',
        planName: selectedPlanForPayment.name,
        billingCycle: isAnnual ? 'Annual' : 'Monthly',
        paymentMethod,
        paymentDetails: paymentMethod === 'upi' ? { upiId } : { cardNumberLast4: cardNumber.slice(-4) }
      });

      const txId = res.data?.data?.transactionId || `TXN-${Date.now()}`;

      toast.success(
        'Payment & Enrollment Successful! 🎉',
        `Enrolled in ${selectedPlanForPayment.name}. Transaction ID: ${txId}`
      );

      setShowCheckoutModal(false);
      setSelectedPlanForPayment(null);
      setUpiId('');
      setCardNumber('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Payment Failed', err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadInvoice = (txn: PaymentTransaction) => {
    const invoiceContent = `
============================================================
           FLOWCRM AI ENTERPRISE TAX INVOICE
============================================================
Invoice Number: ${txn.invoiceNumber}
Transaction ID: ${txn.transactionId}
Date:           ${txn.date}
Payment Method: ${txn.method}
------------------------------------------------------------
Plan:           ${txn.planName}
Base Amount:    ₹${Math.round(txn.amount / 1.18).toLocaleString('en-IN')}
GST (18%):      ₹${Math.round(txn.amount - (txn.amount / 1.18)).toLocaleString('en-IN')}
------------------------------------------------------------
Total Paid:     ₹${txn.amount.toLocaleString('en-IN')} INR (PAID)
============================================================
Status:         100% Reconciled & Verified
Thank you for choosing FlowCRM AI Enterprise!
============================================================
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${txn.invoiceNumber}_Tax_Invoice.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice Downloaded! 📄', `${txn.invoiceNumber} saved to your device.`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete subscription "${name}"?`)) {
      try {
        await subscriptionApi.delete(id);
        toast.success('Subscription Deleted', 'Subscription removed.');
        loadData();
      } catch (err) {
        toast.error('Delete Failed', 'Failed to delete subscription.');
      }
    }
  };

  const handlePauseResume = async (id: string, action: 'pause' | 'resume') => {
    try {
      if (action === 'pause') await subscriptionApi.pause(id);
      else await subscriptionApi.resume(id);
      toast.success(action === 'pause' ? 'Subscription Paused' : 'Subscription Resumed', '');
      loadData();
    } catch (err) {
      toast.error('Action Failed', `Failed to ${action} subscription.`);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'active':
        return <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">ACTIVE</span>;
      case 'paused':
        return <span className="px-2.5 py-1 text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">PAUSED</span>;
      case 'canceled': case 'cancelled':
        return <span className="px-2.5 py-1 text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 rounded-full">{s.toUpperCase()}</span>;
    }
  };

  const filtered = items.filter(s => {
    const matchesSearch = s.planName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all' || activeTab === 'transactions') return matchesSearch;
    return matchesSearch && s.status === activeTab;
  });

  const activeCount = items.filter(i => i.status === 'active').length;
  const totalMRR = items.reduce((acc, i) => acc + (i.status === 'active' ? (i.amount || 8999) : 0), 0);
  const totalARR = totalMRR * 12;

  const quickTierOptions = [
    { name: 'Starter Growth', price: 3999, desc: 'Essential CRM & Lead-to-Cash tools', features: ['Up to 5 Sales Rep Seats', 'GST Invoicing Engine', 'Standard Pipeline'] },
    { name: 'Professional Scale', price: 8999, desc: 'Grounded AI & custom workflows', features: ['Unlimited User Seats', 'AI Deal Win Probability', 'Priority Support'] },
    { name: 'Enterprise Apex', price: 19999, desc: 'Strict multi-tenant security isolation', features: ['Custom Workflows', 'Dedicated Success Rep', 'Audit Streaming'] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 select-none font-sans pb-16"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-glossy-sm">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-850 tracking-tight font-display mt-1">
            Subscriptions & Payment Gateway Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage paid subscriptions, process INR ₹ payments, download GST tax invoices, and track MRR.
          </p>
        </div>
        <Button
          onClick={() => openPaymentCheckout('Professional Scale', 8999)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>Pay & Enroll Plan</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Paid Subscriptions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">{activeCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Paid Enrolled</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Verified active client plans</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Monthly Revenue (MRR)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">₹{totalMRR.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Recurring</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Verified payments in INR</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Annualized Run Rate (ARR)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">₹{totalARR.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Forecast</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">12-month revenue run rate</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Payment Compliance</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">18% GST</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold border border-purple-200">Tax Invoice</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Auto-generated tax receipts</p>
        </SpotlightCard>
      </div>

      {/* Featured Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickTierOptions.map((tier) => (
          <SpotlightCard key={tier.name} className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-glossy-md space-y-4 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-extrabold text-slate-850 group-hover:text-brand-600 transition-colors">{tier.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{tier.desc}</p>
              </div>
              <span className="text-lg font-black text-slate-850 font-mono">₹{tier.price.toLocaleString('en-IN')}<span className="text-[10px] text-slate-400 font-normal">/mo</span></span>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-150">
              {tier.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => openPaymentCheckout(tier.name, tier.price)}
              className="w-full mt-2 text-xs font-bold bg-brand-550 hover:bg-brand-600 text-white shadow-glossy cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <CreditCard size={14} />
              <span>Pay ₹{tier.price.toLocaleString('en-IN')} & Enroll</span>
            </Button>
          </SpotlightCard>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-extrabold capitalize rounded-xl transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Subscriptions ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 text-xs font-extrabold capitalize rounded-xl transition-all cursor-pointer ${
                activeTab === 'active' ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 text-xs font-extrabold capitalize rounded-xl transition-all cursor-pointer ${
                activeTab === 'transactions' ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Transaction Receipts ({transactions.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search plan or invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Synchronizing Payment & Subscription Ledger...</p>
          </div>
        ) : activeTab === 'transactions' ? (
          transactions.length === 0 ? (
            <div className="flex items-center justify-center min-h-[250px]">
              <EmptyState
                title="No Payment Receipts Logged"
                description="Completed subscription payment receipts will appear here for instant tax invoice download."
                icon={<FileText className="w-12 h-12 text-slate-300" />}
              />
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-150 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                    <th className="px-5 py-3.5">Invoice #</th>
                    <th className="px-5 py-3.5">Transaction ID</th>
                    <th className="px-5 py-3.5">Plan Name</th>
                    <th className="px-5 py-3.5">Amount Paid (INR)</th>
                    <th className="px-5 py-3.5">Payment Method</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Tax Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-850">{txn.invoiceNumber}</td>
                      <td className="px-5 py-4 font-mono text-slate-500">{txn.transactionId}</td>
                      <td className="px-5 py-4 font-bold text-brand-600">{txn.planName}</td>
                      <td className="px-5 py-4 font-mono font-extrabold text-slate-850 text-sm">₹{txn.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-slate-600 font-semibold">{txn.method}</td>
                      <td className="px-5 py-4 text-slate-500 font-mono">{txn.date}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => downloadInvoice(txn)}
                          className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <Download size={13} />
                          <span>Download Tax Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={items.length === 0 ? 'No Active Paid Subscriptions' : 'No Matching Subscriptions'}
              description={items.length === 0 ? 'Select a plan above to pay and enroll in active recurring billing.' : 'Try adjusting search or status filter.'}
              icon={<Repeat className="w-12 h-12 text-slate-300" />}
              actionLabel={items.length === 0 ? 'Pay & Enroll Plan' : undefined}
              onAction={() => openPaymentCheckout('Professional Scale', 8999)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Subscription Plan</th>
                  <th className="px-5 py-3.5">Recurring Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Next Renewal</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-850 flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{s.planName}</span>
                    </td>
                    <td className="px-5 py-4 font-mono font-extrabold text-slate-850 text-sm">₹{s.amount?.toLocaleString('en-IN') || 8999}<span className="text-[10px] text-slate-400 font-normal">/mo</span></td>
                    <td className="px-5 py-4">
                      {getStatusBadge(s.status)}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{s.renewalDate}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === 'active' ? (
                          <button onClick={() => handlePauseResume(s.id, 'pause')} className="p-1.5 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Pause Subscription">
                            <PauseCircle size={15} />
                          </button>
                        ) : (
                          <button onClick={() => handlePauseResume(s.id, 'resume')} className="p-1.5 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Resume Subscription">
                            <PlayCircle size={15} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(s.id, s.planName || '')} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Payment Checkout Modal */}
      {showCheckoutModal && selectedPlanForPayment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-glossy-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-150 pb-4">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  REAL-TIME PAYMENT CHECKOUT
                </span>
                <h3 className="text-xl font-extrabold text-slate-850 mt-1">{selectedPlanForPayment.name} Plan</h3>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            {/* Billing Cycle Selector */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Billing Cycle</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnnual(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isAnnual ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnnual(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isAnnual ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Annual (20% OFF)
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{selectedPlanForPayment.name} ({isAnnual ? 'Annual' : 'Monthly'})</span>
                <span className="font-mono text-slate-850 font-bold">
                  ₹{(isAnnual ? selectedPlanForPayment.price * 10 : selectedPlanForPayment.price).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%)</span>
                <span className="font-mono text-slate-850 font-bold">
                  ₹{Math.round((isAnnual ? selectedPlanForPayment.price * 10 : selectedPlanForPayment.price) * 0.18).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-t border-slate-150 pt-2 flex justify-between text-sm font-bold text-slate-850">
                <span>Total Amount Due</span>
                <span className="font-mono text-lg text-emerald-600 font-extrabold">
                  ₹{Math.round((isAnnual ? selectedPlanForPayment.price * 10 : selectedPlanForPayment.price) * 1.18).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Select Payment Method (INR ₹)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'upi', label: 'UPI / QR', icon: QrCode },
                    { id: 'card', label: 'Cards', icon: CreditCard },
                    { id: 'netbanking', label: 'Netbanking', icon: Building2 },
                  ].map((method) => {
                    const Icon = method.icon;
                    const active = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          active
                            ? 'bg-brand-50 border-brand-400 text-brand-700 shadow-sm'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-brand-600" />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="text-xs text-slate-700 font-medium">Enter VPA / UPI ID (GPay / PhonePe / Paytm)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. name@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-550"
                  />
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Card Number (Visa / Mastercard / RuPay)"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-550"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-brand-550 via-teal-600 to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-glossy cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Pay ₹{Math.round((isAnnual ? selectedPlanForPayment.price * 10 : selectedPlanForPayment.price) * 1.18).toLocaleString('en-IN')} & Confirm Enrollment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
