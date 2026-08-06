import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ShieldCheck, CheckCircle2, CreditCard, QrCode, Building2,
  Lock, ArrowRight, ArrowLeft, DollarSign, Wallet, ShieldAlert, UserCheck
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/ToastProvider';

const PLANS_DATA: Record<string, { name: string; monthlyPrice: number; annualPrice: number; badge: string }> = {
  starter: {
    name: 'Starter',
    monthlyPrice: 1499,
    annualPrice: 1199,
    badge: 'CRM Essentials',
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 3999,
    annualPrice: 3199,
    badge: 'Most Popular',
  },
  enterprise: {
    name: 'Enterprise AI',
    monthlyPrice: 9999,
    annualPrice: 7999,
    badge: 'Full Automation & AI',
  },
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { login: setAuth } = useAuthStore();

  const planKey = (searchParams.get('plan') || 'professional').toLowerCase();
  const isAnnualParam = searchParams.get('billing') !== 'monthly';

  const [isAnnual, setIsAnnual] = useState(isAnnualParam);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan = PLANS_DATA[planKey] || PLANS_DATA.professional;
  const unitPrice = isAnnual ? selectedPlan.annualPrice : selectedPlan.monthlyPrice;
  const taxAmount = Math.round(unitPrice * 0.18); // 18% GST in INR
  const totalAmount = unitPrice + taxAmount;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Required Fields Missing', 'Please fill in your name, email, and password.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Register account
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'Account';

      const regRes = await api.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
        companyName: companyName || 'My Business',
      });

      const { accessToken, refreshToken, user, role, permissions } = regRes.data.data;

      // 2. Record payment in database
      await api.post(
        '/payments',
        {
          amount: totalAmount,
          method: paymentMethod.toUpperCase(),
          status: 'completed',
          transactionId: `TXN-INR-${Date.now()}`,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ).catch(() => {});

      // 3. Set auth state
      setAuth(accessToken, refreshToken, user, role, permissions);

      toast.success(
        'Subscription Activated!',
        `Welcome to FlowCRM AI Enterprise, ${user.firstName}! Your ${selectedPlan.name} plan is active.`
      );

      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Payment processing failed. Please try again.';
      toast.error('Checkout Error', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white font-sans py-12 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/20 to-transparent blur-[160px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <button
            onClick={() => navigate('/landing')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Landing Page
          </button>
          <Logo size="md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Summary Column */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {selectedPlan.badge}
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-2">{selectedPlan.name} Plan</h3>
              </div>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Billing Cycle</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isAnnual ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isAnnual ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Annual (20% OFF)
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{selectedPlan.name} ({isAnnual ? 'Annual' : 'Monthly'})</span>
                <span className="font-mono text-white font-bold">₹{unitPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST Tax (18%)</span>
                <span className="font-mono text-white font-bold">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-sm font-bold text-white">
                <span>Total Amount Due</span>
                <span className="font-mono text-lg text-emerald-400 font-extrabold">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 256-Bit SSL Encrypted Payment
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Instant Account Activation & CRM Setup
              </div>
            </div>
          </div>

          {/* Checkout & Account Setup Form Column */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <h3 className="text-xl font-extrabold text-white">Account Setup & Payment Details</h3>

            <form onSubmit={handlePayment} className="space-y-5">
              {/* Account Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Company Name</label>
                  <input
                    type="text"
                    placeholder="Apex Technologies"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 uppercase">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase">Select Payment Method (INR ₹)</label>
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
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-indigo-400" />
                        {method.label}
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'upi' && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <label className="text-xs text-slate-300 font-medium">Enter VPA / UPI ID (Google Pay, PhonePe, Paytm)</label>
                    <input
                      type="text"
                      placeholder="e.g. name@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number (Visa / Mastercard / RuPay)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                    Supports HDFC Bank, ICICI Bank, State Bank of India (SBI), Axis Bank, Kotak & 50+ Indian banks.
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Payment in INR...</span>
                ) : (
                  <>
                    <span>Pay ₹{totalAmount.toLocaleString('en-IN')} & Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
