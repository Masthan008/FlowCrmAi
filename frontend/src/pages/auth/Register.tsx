import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-25 px-4 relative overflow-hidden py-12">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand-100/30 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-brand-200/20 blur-3xl" />

      <div className="bg-white/80 backdrop-blur-xl border border-slate-100/80 shadow-glossy-lg rounded-3xl p-8 max-w-md w-full relative z-10 overflow-hidden">
        {/* Disabled Overlay Backdrop */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-4 shadow-glossy-sm">
            <ShieldAlert size={22} className="animate-bounce" />
          </div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight mb-2">
            Registration Restricted
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 px-4">
            FlowCRM AI self-registration is currently disabled. User accounts can only be created by administrative staff via invite configurations.
          </p>
          <Link to="/login" className="w-full max-w-[200px]">
            <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 rounded-xl">
              Back to Sign In
            </Button>
          </Link>
        </div>

        {/* UI Mock Mock Form behind overlay */}
        <div className="opacity-35 pointer-events-none select-none">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-10 h-10 rounded-2xl bg-brand-550 flex items-center justify-center text-white font-bold mb-3 shadow-glossy shadow-brand-200">
              F
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none mb-1">
              Create an Account
            </h2>
            <p className="text-[10px] text-slate-450 font-medium">
              Create your corporate sales workspace credentials
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-650 tracking-wide uppercase">First Name</label>
              <input type="text" placeholder="John" className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50" disabled />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-650 tracking-wide uppercase">Last Name</label>
              <input type="text" placeholder="Doe" className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50" disabled />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-650 tracking-wide uppercase">Email Address</label>
              <input type="email" placeholder="john.doe@company.com" className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50" disabled />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-650 tracking-wide uppercase">Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50" disabled />
            </div>
            <button className="w-full py-2 bg-brand-550 text-white text-xs font-bold rounded-xl" disabled>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
