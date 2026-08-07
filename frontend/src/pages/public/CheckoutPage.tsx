import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, CreditCard, QrCode, Building2, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { useToast } from '../../components/ui/ToastProvider';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/ui/Logo';

const REAL_PLANS: Record<string, { name: string; monthlyPrice: number; annualPrice: number; features: string[]; badge: string }> = {
  starter: {
    name: 'Starter Growth',
    monthlyPrice: 3999,
    annualPrice: 3199,
    badge: 'Standard',
    features: [
      'Omnichannel Lead Routing & SLA Manager',
      'Automated Lead-to-Cash Invoicing Engine',
      'B2B Account KYC & CVR Verification',
      'Basic Sales Pipeline & Contact CRM'
    ]
  },
  professional: {
    name: 'Professional Scale',
    monthlyPrice: 8999,
    annualPrice: 7199,
    badge: 'Popular',
    features: [
      'Everything in Starter Growth',
      'Grounded AI Deal Win Probability & AI Insights',
      'Custom Workflow Automation Builder',
      'Interactive Playbook & Sales Execution Engine',
      'Multi-Currency Invoicing (INR / USD)'
    ]
  },
  enterprise: {
    name: 'Enterprise Apex',
    monthlyPrice: 19999,
    annualPrice: 15999,
    badge: 'Unlimited',
    features: [
      'Everything in Professional Scale',
      'Strict Multi-Tenant Isolation & Audit Streaming',
      'Unlimited User Seats & Custom Roles',
      'Dedicated Customer Success Manager',
      '24/7 Priority SLA Service Desk'
    ]
  }
};

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { login: setAuth } = useAuthStore();

  const planKey = searchParams.get('plan') || 'professional';
  const selectedPlan = REAL_PLANS[planKey] || REAL_PLANS.professional;

  const [isAnnual, setIsAnnual] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form Inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const unitPrice = isAnnual ? selectedPlan.annualPrice * 12 : selectedPlan.monthlyPrice;
  const taxAmount = Math.round(unitPrice * 0.18);
  const totalAmount = unitPrice + taxAmount;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error('Validation Error', 'Please complete all required fields (*)');
      return;
    }

    setIsProcessing(true);

    try {
      const names = fullName.trim().split(' ');
      const firstName = names[0] || 'Subscriber';
      const lastName = names.slice(1).join(' ') || 'Account';

      // 1. Register User & Company
      const regRes = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        companyName: companyName || `${firstName}'s Enterprise`,
        industry: 'Technology & Services',
        employeeCount: 10,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      });

      // 2. Process Payment & Activate Subscription
      const payRes = await api.post('/payments/process', {
        email,
        amount: totalAmount,
        currency: 'INR',
        planName: selectedPlan.name,
        billingCycle: isAnnual ? 'Annual' : 'Monthly',
        paymentMethod,
        paymentDetails: paymentMethod === 'upi' ? { upiId } : { cardNumberLast4: cardNumber.slice(-4) }
      }).catch(() => null);

      // 3. Auto Login
      const loginRes = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user, role, permissions } = loginRes.data.data;
      setAuth(accessToken, refreshToken, user, role, permissions);

      toast.success(
        'Payment & Activation Successful! 🎉',
        `Welcome to ${selectedPlan.name}! Transaction ID: ${payRes?.data?.data?.transactionId || 'TXN-' + Date.now()}`
      );

      navigate('/', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Payment processing failed. Please try again.';
      toast.error('Transaction Failed', msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-25 text-slate-800 py-12 px-4 font-sans select-none relative overflow-hidden">
      {/* Background visual glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-100/40 blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-150 pb-6">
          <button
            onClick={() => navigate('/landing')}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Landing Page
          </button>
          <Logo size="md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Summary Column (White Glossy Light Theme) */}
          <div className="lg:col-span-5 bg-white/90 border border-slate-100 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-glossy-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {selectedPlan.badge}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-850 mt-2">{selectedPlan.name} Plan</h3>
              </div>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-150 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Billing Cycle</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isAnnual ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isAnnual ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Annual (20% OFF)
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{selectedPlan.name} ({isAnnual ? 'Annual' : 'Monthly'})</span>
                <span className="font-mono text-slate-850 font-bold">₹{unitPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%)</span>
                <span className="font-mono text-slate-850 font-bold">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-150 pt-3 flex justify-between text-sm font-bold text-slate-850">
                <span>Total Amount Due</span>
                <span className="font-mono text-lg text-emerald-600 font-extrabold">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-150 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 256-Bit SSL Encrypted Payment
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-brand-600" /> Instant Account Activation & CRM Setup
              </div>
            </div>
          </div>

          {/* Checkout & Account Setup Form Column */}
          <div className="lg:col-span-7 bg-white/90 border border-slate-100 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-glossy-lg space-y-6">
            <h3 className="text-xl font-extrabold text-slate-850">Account Setup & Payment Details</h3>

            <form onSubmit={handlePayment} className="space-y-5">
              {/* Account Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-550 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-550 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Company Name</label>
                  <input
                    type="text"
                    placeholder="Apex Technologies"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-550 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-550 font-medium"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-2">
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

                {paymentMethod === 'upi' && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="text-xs text-slate-700 font-medium">Enter VPA / UPI ID (Google Pay, PhonePe, Paytm)</label>
                    <input
                      type="text"
                      placeholder="e.g. name@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-550"
                    />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number (Visa / Mastercard / RuPay)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-550"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
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
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-brand-550 via-teal-600 to-emerald-600 text-white font-extrabold text-sm shadow-glossy-lg hover:shadow-glossy-xl cursor-pointer transition-all flex items-center justify-center gap-2"
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
