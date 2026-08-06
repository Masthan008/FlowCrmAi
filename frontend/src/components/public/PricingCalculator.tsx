import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, Users, Sparkles, CheckCircle2, ShieldCheck,
  Zap, ArrowRight, DollarSign, Tag, HelpCircle, Server
} from 'lucide-react';

interface PricingCalculatorProps {
  onSelectPlan?: (planKey: string, seats: number, isAnnual: boolean) => void;
}

const BASE_PLANS = {
  starter: {
    key: 'starter',
    name: 'Starter',
    monthlyPrice: 1499,
    annualPrice: 1199,
    badge: 'Essential CRM',
    description: 'Perfect for small sales teams needing database-backed lead & deal management.',
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
    name: 'Professional',
    monthlyPrice: 3999,
    annualPrice: 3199,
    badge: 'Most Popular',
    description: 'Complete Lead-to-Cash automation, service desk, and payment reconciliation.',
    features: [
      'Everything in Starter',
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
    name: 'Enterprise AI',
    monthlyPrice: 9999,
    annualPrice: 7999,
    badge: 'Full AI & Security',
    description: 'Grounded AI win probabilities, multi-tenant scoping, TOTP 2FA, and audit logging.',
    features: [
      'Everything in Professional',
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
  const [userSeats, setUserSeats] = useState(5);
  const [isAnnual, setIsAnnual] = useState(true);

  // Optional Add-ons
  const [addOns, setAddOns] = useState({
    aiFineTuning: false, // +₹4,999 / mo
    slaSupport: false,   // +₹2,499 / mo
    whiteLabel: false,   // +₹1,999 / mo
  });

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

  const toggleAddOn = (key: keyof typeof addOns) => {
    setAddOns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckout = () => {
    navigate(
      `/checkout?plan=${selectedPlanKey}&billing=${isAnnual ? 'annual' : 'monthly'}&seats=${userSeats}`
    );
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Calculator Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" /> REAL-TIME INTERACTIVE COST CALCULATOR
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
            Calculate Your Custom Enterprise Plan (INR ₹)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Adjust user seats, plan tier, and add-ons to see live real-time pricing breakdown with GST.
          </p>
        </div>

        {/* Annual Savings Badge */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
          <span className={`text-xs font-bold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-slate-800 p-1 relative border border-slate-700 cursor-pointer transition-colors"
          >
            <motion.div
              animate={{ x: isAnnual ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md"
            />
          </button>
          <span className={`text-xs font-bold ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
            Annual <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/20 px-1.5 py-0.5 rounded">20% OFF</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Select Plan Tier */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest block">
              1. Select Plan Tier
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['starter', 'professional', 'enterprise'] as const).map((key) => {
                const item = BASE_PLANS[key];
                const active = selectedPlanKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedPlanKey(key)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      active
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-extrabold text-indigo-300 uppercase block">{item.badge}</span>
                      <h4 className="text-sm font-black text-white mt-0.5">{item.name}</h4>
                    </div>
                    <div className="mt-3">
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

          {/* Step 2: User Seats Slider */}
          <div className="space-y-3 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> 2. Number of Team User Seats
              </label>
              <span className="text-lg font-black text-white font-mono bg-indigo-600/30 px-3 py-1 rounded-xl border border-indigo-500/40">
                {userSeats} {userSeats === 1 ? 'User' : 'Users'}
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={100}
              value={userSeats}
              onChange={(e) => setUserSeats(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
              <span>1 Seat</span>
              <span>10 Seats (10% Volume Discount)</span>
              <span>25+ Seats (20% Volume Discount)</span>
              <span>100 Seats</span>
            </div>
          </div>

          {/* Step 3: Optional Enterprise Add-ons */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest block">
              3. Optional Enterprise Add-ons
            </label>

            <div className="space-y-2">
              {[
                {
                  id: 'aiFineTuning',
                  title: 'Dedicated Grounded AI Model Fine-Tuning',
                  price: '₹4,999 / mo',
                  desc: 'Custom trained win-probability algorithms on your company data.',
                },
                {
                  id: 'slaSupport',
                  title: '24/7 Priority SLA Dedicated Support Desk',
                  price: '₹2,499 / mo',
                  desc: 'Guaranteed 15-minute response time & assigned account manager.',
                },
                {
                  id: 'whiteLabel',
                  title: 'Custom Domain & White-Label Portal',
                  price: '₹1,999 / mo',
                  desc: 'Host customer portal & live chat widget on your own domain.',
                },
              ].map((addon) => {
                const isChecked = addOns[addon.id as keyof typeof addOns];
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddOn(addon.id as keyof typeof addOns)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      isChecked
                        ? 'bg-indigo-600/15 border-indigo-500/70 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{addon.title}</p>
                        <p className="text-[10px] text-slate-400">{addon.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-300 shrink-0">{addon.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Financial Breakdown Column */}
        <div className="lg:col-span-5 bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 flex flex-col justify-between relative shadow-xl">
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                LIVE REAL-TIME QUOTE SUMMARY
              </span>
              <h4 className="text-2xl font-black text-white mt-1">{plan.name} Plan</h4>
              <p className="text-xs text-slate-400">{userSeats} User Seats • {isAnnual ? 'Annual Billing' : 'Monthly Billing'}</p>
            </div>

            {/* Price Line Items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Subscription ({userSeats} × ₹{rawUnitPrice.toLocaleString('en-IN')})</span>
                <span className="font-mono font-bold text-white">₹{grossMonthly.toLocaleString('en-IN')}</span>
              </div>

              {volumeDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Volume Seat Savings ({volumeDiscountPct * 100}%)</span>
                  <span className="font-mono font-bold">-₹{volumeDiscountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {addOnsTotal > 0 && (
                <div className="flex justify-between text-indigo-300">
                  <span>Enterprise Add-ons Total</span>
                  <span className="font-mono font-bold">+₹{addOnsTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                <span>GST Tax (18%)</span>
                <span className="font-mono font-bold text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Total Investment Card */}
              <div className="p-4 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 rounded-2xl border border-indigo-500/30 mt-4 space-y-1">
                <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest block">
                  NET MONTHLY INVESTMENT
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                    ₹{totalInvestment.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ month incl. GST</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-bold pt-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Only ~₹{costPerUserPerDay} / user / day
                </p>
              </div>
            </div>

            {/* Included Real Features for this Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[11px] font-extrabold text-slate-300 uppercase">Features Included in Real Time:</p>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCheckout}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer transition-all flex items-center justify-center gap-2 mt-6"
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
