import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Globe2, Lock, ArrowRight, Heart } from 'lucide-react';
import { Logo } from '../ui/Logo';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-white pt-16 pb-12 px-6 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-600/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              FlowCRM AI Enterprise is the autonomous, database-backed customer relationship & support engine. Grounded machine intelligence for modern growth teams.
            </p>

            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> SOC2 & GDPR Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Secured
              </span>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Platform & Solutions</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <button onClick={() => navigate('/landing')} className="hover:text-white transition-colors cursor-pointer">
                  Landing Overview
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/onboarding')} className="hover:text-white transition-colors cursor-pointer">
                  Interactive Product Tour
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/checkout')} className="hover:text-white transition-colors cursor-pointer">
                  Enterprise Pricing Calculator
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  Grounded Win Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Company & Governance</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  About Us & Mission
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  Security Architecture
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/gdpr')} className="hover:text-white transition-colors cursor-pointer">
                  GDPR Erasure Hub (/gdpr)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  SLA & Trust Guarantee
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Account & Portal</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">
                  Sign In to Workspace
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/register')} className="hover:text-white transition-colors cursor-pointer">
                  Register New Account
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/portal')} className="hover:text-white transition-colors cursor-pointer">
                  Customer Support Portal (/portal)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/checkout')} className="hover:text-white transition-colors cursor-pointer">
                  Upgrade Plan (/checkout)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© 2026 FlowCRM AI Enterprise. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/landing')} className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigate('/landing')} className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={() => navigate('/landing')} className="hover:text-slate-300 transition-colors cursor-pointer">System Status</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
