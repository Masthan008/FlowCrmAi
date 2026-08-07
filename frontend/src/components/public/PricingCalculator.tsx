import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, Users, Sparkles, CheckCircle2, ShieldCheck,
  Zap, ArrowRight, DollarSign, Tag, HelpCircle, Server, RefreshCw, Cpu, Layers, Award
} from 'lucide-react';

interface PricingCalculatorProps {
  onSelectPlan?: (planKey: string, seats: number, isAnnual: boolean) => void;
}

const BASE_PLANS = {
  starter: {
    key: 'starter',
    name: 'Starter Growth',
    monthlyPrice: 1499,
    annualPrice: 1199,
    badge: 'Essential CRM',
    description: 'Perfect for growing sales teams needing database-backed lead & deal management.',
    features: [
      'Lead Capture & SLA Qualification',
      'Contact & Company Database',
      'Deals & Kanban Sales Pipeline',
      'Tasks, Subtasks & Activity Logs',
      'Product Catalog & Price Lists',
      'Quotes & Invoice Generation',
    ],
  },
  professional: {
    key: 'professional',
    name: 'Professional Scale',
    monthlyPrice: 3999,
    annualPrice: 3199,
    badge: 'Most Popular',
    description: 'Complete Lead-to-Cash automation, service desk, and payment reconciliation.',
    features: [
      'Everything in Starter Growth',
      'Lead-to-Cash Automation (Quote → Order → Invoice → Payment)',
      'Real Payment Processing & Status Reconciliation (/payments)',
      'Calendar Event Management & Meeting Sync (/calendar)',
      'Contracts, Orders & Recurring Subscriptions (/subscriptions)',
      'Support Tickets & Knowledge Base (/tickets, /knowledge)',
      'Web-to-Lead Forms & CSAT Surveys (/webforms, /surveys)',
      'Expense Tracking & Asset Management (/expenses, /assets)',
    ],
  },
  enterprise: {
    key: 'enterprise',
    name: 'Enterprise Apex AI',
    monthlyPrice: 9999,
    annualPrice: 7999,
    badge: 'Full AI & Security',
    description: 'Grounded AI win probabilities, multi-tenant scoping, TOTP 2FA, and audit logging.',
    features: [
      'Everything in Professional Scale',
      'Grounded AI Deal Win Probability & Rationale Engine',
      'Multi-Tenant Security & Organization Boundary Scoping',
      'Multi-Factor Authentication (TOTP 2FA) & Recovery Codes',
      'GDPR Consent Logs & Erasure Data Requests (/gdpr)',
      'Commission Rules & Payout Tracking (/commissions)',
      'Customer Portal Access & Live Chat Widget (/portal, /chat)',
      'Role-Based Access Control (RBAC) & Audit Logs',
    ],
  },
};

export const PricingCalculator: React.FC<PricingCalculatorProps> = () => {
  const navigate = useNavigate();
  const [selectedPlanKey, setSelectedPlanKey] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [userSeats, setUserSeats] = useState(10);
  const [isAnnual, setIsAnnual] = useState(true);
  const [isComputing, setIsComputing] = useState(false);
  const [computingStatus, setComputingStatus] = useState('Recalculating ROI & Volume Seat Savings...');

  // Optional Add-ons
  const [addOns, setAddOns] = useState({
    aiFineTuning: false, // +₹4,999 / mo
    slaSupport: false,   // +₹2,499 / mo
    whiteLabel: false,   // +₹1,999 / mo
  });

  const triggerComputePulse = (statusMsg?: string) => {
    setComputingStatus(statusMsg || 'Computing Enterprise Matrix & Tax Rates...');
    setIsComputing(true);
    const timer = setTimeout(() => setIsComputing(false), 220);
    return () => clearTimeout(timer);
  };

  const handlePlanChange = (key: 'starter' | 'professional' | 'enterprise') => {
    setSelectedPlanKey(key);
    triggerComputePulse(`Configuring ${BASE_PLANS[key].name} License Matrix...`);
  };

  const handleSeatsChange = (seats: number) => {
    setUserSeats(seats);
    if (!isComputing) {
      triggerComputePulse(`Recalculating volume discount for ${seats} seats...`);
    }
  };

  const handleBillingToggle = () => {
    setIsAnnual(!isAnnual);
    triggerComputePulse(!isAnnual ? 'Applying 20% Annual Commitment Discount...' : 'Switching to Monthly Flexible Billing...');
  };

  const plan = BASE_PLANS[selectedPlanKey];

  // Price calculations
  const rawUnitPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const grossMonthly = rawUnitPrice * userSeats;

  // Volume seat discount
  let volumeDiscountPct = 0;
  if (userSeats >= 25) volumeDiscountPct = 0.20; // 20% off for 25+ users
  else if (userSeats >= 10) volumeDiscountPct = 0.10; // 10% off for 10+ users

  const volumeDiscountAmount = Math.round(grossMonthly * volumeDiscountPct);

  // Addons total
  let addOnsTotal = 0;
  if (addOns.aiFineTuning) addOnsTotal += 4999;
  if (addOns.slaSupport) addOnsTotal += 2499;
  if (addOns.whiteLabel) addOnsTotal += 1999;

  const subtotalBeforeTax = grossMonthly - volumeDiscountAmount + addOnsTotal;
  const gstAmount = Math.round(subtotalBeforeTax * 0.18); // 18% GST in INR
  const totalInvestment = subtotalBeforeTax + gstAmount;

  const costPerUserPerDay = Math.round((totalInvestment / userSeats) / 30);
  const estimatedHoursSaved = userSeats * 42; // ~42 hrs/rep/month saved

  const toggleAddOn = (key: keyof typeof addOns) => {
    setAddOns((prev) => ({ ...prev, [key]: !prev[key] }));
    triggerComputePulse(`Updating optional add-on stack...`);
  };

  const handleCheckout = () => {
    navigate(
      `/checkout?plan=${selectedPlanKey}&billing=${isAnnual ? 'annual' : 'monthly'}&seats=${userSeats}`
    );
  };

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden font-sans select-none">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-550/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 relative">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 animate-pulse" /> REAL-TIME INTERACTIVE COST & ROI CALCULATOR
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 font-display tracking-tight">
            Calculate Your Custom Enterprise Plan (INR ₹)
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Adjust seat capacity, plan tier, and add-ons to preview instant quotes with GST breakdown.
          </p>
        </div>

        {/* Annual Savings Toggle Badge */}
        <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
          <span className={`text-xs font-bold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
          <button
            type="button"
            onClick={handleBillingToggle}
            className="w-12 h-6 rounded-full bg-slate-800 p-1 relative border border-slate-700 cursor-pointer transition-colors"
          >
            <motion.div
              animate={{ x: isAnnual ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="w-4 h-4 rounded-full bg-gradient-to-r from-brand-550 to-teal-400 shadow-md"
            />
          </button>
          <span className={`text-xs font-bold ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
            Annual <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">20% OFF</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Select Plan Tier */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-brand-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" /> 1. Select Enterprise Plan Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['starter', 'professional', 'enterprise'] as const).map((key) => {
                const item = BASE_PLANS[key];
                const active = selectedPlanKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => handlePlanChange(key)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                      active
                        ? 'bg-gradient-to-b from-brand-900/40 to-slate-900 border-brand-500 shadow-glossy-lg ring-1 ring-brand-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-extrabold text-brand-300 uppercase block tracking-wider">{item.badge}</span>
                      <h4 className="text-sm font-black text-white mt-0.5">{item.name}</h4>
                    </div>
                    <div className="mt-4">
                      <span className="text-lg font-black font-mono text-white">
                        ₹{isAnnual ? item.annualPrice.toLocaleString('en-IN') : item.monthlyPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">/ user / mo</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: User Seats Slider with Instant Calculator */}
          <div className="space-y-4 bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-brand-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" /> 2. Enterprise Team Seats Capacity
              </label>
              <span className="text-lg font-black text-white font-mono bg-brand-500/20 px-3.5 py-1 rounded-xl border border-brand-500/40 shadow-sm">
                {userSeats} {userSeats === 1 ? 'Seat' : 'Seats'}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min={1}
                max={100}
                value={userSeats}
                onChange={(e) => handleSeatsChange(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-550"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>1 Seat</span>
                <span>10 Seats (10% Off)</span>
                <span>25+ Seats (20% Off)</span>
                <span>100 Seats</span>
              </div>
            </div>
          </div>

          {/* Step 3: Optional Enterprise Add-ons */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-brand-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" /> 3. Optional Enterprise Add-ons
            </label>

            <div className="space-y-2.5">
              {[
                {
                  id: 'aiFineTuning',
                  title: 'Dedicated Grounded AI Win-Probability Tuning',
                  price: '₹4,999 / mo',
                  desc: 'Custom trained predictive opportunity models tailored to your sales history.',
                },
                {
                  id: 'slaSupport',
                  title: '24/7 Priority SLA Dedicated Support Desk',
                  price: '₹2,499 / mo',
                  desc: 'Guaranteed 15-minute SLA response velocity & assigned account manager.',
                },
                {
                  id: 'whiteLabel',
                  title: 'Custom Domain & White-Label Customer Portal',
                  price: '₹1,999 / mo',
                  desc: 'Host self-service portal & live chat widget directly on your domain.',
                },
              ].map((addon) => {
                const isChecked = addOns[addon.id as keyof typeof addOns];
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddOn(addon.id as keyof typeof addOns)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      isChecked
                        ? 'bg-brand-900/30 border-brand-500/70 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-brand-550 border-brand-500 text-white' : 'border-slate-700 bg-slate-950'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-white">{addon.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{addon.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-300 shrink-0">{addon.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Computing Quote Summary Panel with Futuristic Pulse */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 flex flex-col justify-between relative shadow-2xl overflow-hidden">
          {/* Futuristic Computing Overlay */}
          <AnimatePresence>
            {isComputing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center space-y-3 p-6 text-center"
              >
                <div className="relative">
                  <Cpu className="w-10 h-10 text-brand-400 animate-spin" />
                  <span className="w-10 h-10 rounded-full border-2 border-brand-400 border-t-transparent animate-spin absolute inset-0" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-white tracking-wide uppercase font-mono">{computingStatus}</p>
                  <p className="text-[10px] text-slate-400">Recalculating GST, discounts, and seat allocations...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-extrabold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calculator size={14} /> LIVE REAL-TIME QUOTE SUMMARY
              </span>
              <h4 className="text-2xl font-black text-white mt-1 font-display">{plan.name}</h4>
              <p className="text-xs text-slate-400 font-medium">
                {userSeats} User Seats • {isAnnual ? 'Annual Commitment (20% OFF)' : 'Monthly Flexible'}
              </p>
            </div>

            {/* Line Items */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Subscription ({userSeats} × ₹{rawUnitPrice.toLocaleString('en-IN')})</span>
                <span className="font-mono font-bold text-white">₹{grossMonthly.toLocaleString('en-IN')}</span>
              </div>

              {volumeDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Volume Seat Savings ({volumeDiscountPct * 100}%)</span>
                  <span className="font-mono font-bold">-₹{volumeDiscountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {addOnsTotal > 0 && (
                <div className="flex justify-between text-brand-300 font-semibold">
                  <span>Enterprise Add-ons Total</span>
                  <span className="font-mono font-bold">+₹{addOnsTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>GST Tax (18%)</span>
                <span className="font-mono font-bold text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Net Investment Card */}
              <div className="p-5 bg-gradient-to-br from-brand-950/80 via-slate-900 to-teal-950/40 rounded-2xl border border-brand-500/30 mt-4 space-y-2 shadow-glossy-sm">
                <span className="text-[10px] font-extrabold text-brand-300 uppercase tracking-widest block">
                  NET MONTHLY INVESTMENT
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                    ₹{totalInvestment.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ month incl. GST</span>
                </div>
                <div className="pt-2 border-t border-brand-500/20 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-emerald-400" /> ~₹{costPerUserPerDay} / user / day
                  </span>
                  <span className="text-teal-300">
                    Saves ~{estimatedHoursSaved} hrs/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Included Real Features for this Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Features Included in Real Time:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-550 via-teal-600 to-emerald-600 text-white font-extrabold text-xs shadow-glossy-lg hover:shadow-glossy-xl cursor-pointer transition-all flex items-center justify-center gap-2 mt-6"
          >
            <span>Proceed to Checkout with {userSeats} Seats</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
