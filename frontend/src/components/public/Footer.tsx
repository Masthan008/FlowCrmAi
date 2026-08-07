import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Globe2, Lock, ArrowRight, Heart } from 'lucide-react';
import { Logo } from '../ui/Logo';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    navigate('/landing');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-white pt-16 pb-12 px-6 relative overflow-hidden select-none font-sans">
      {/* Background Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-550/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-medium">
              FlowCRM AI Enterprise is the autonomous, database-backed customer relationship & support engine. Grounded machine intelligence for modern growth teams.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400 font-bold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> SOC2 & GDPR Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-400">Platform & Solutions</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <button onClick={() => navigate('/landing')} className="hover:text-white transition-colors cursor-pointer">
                  Platform Overview
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">
                  Capabilities & Feature Matrix
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">
                  INR Pricing Calculator
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
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-400">Company & Governance</h4>
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
            </ul>
          </div>

          {/* Col 3: Quick Start */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-400">Workspace Portal</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">
                  Sign In to Console
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/register')} className="hover:text-white transition-colors cursor-pointer">
                  Provision Free Workspace
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/portal')} className="hover:text-white transition-colors cursor-pointer">
                  Customer Self-Service Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} FlowCRM AI Enterprise. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <button onClick={() => navigate('/gdpr')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => navigate('/gdpr')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => navigate('/about')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Security
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
