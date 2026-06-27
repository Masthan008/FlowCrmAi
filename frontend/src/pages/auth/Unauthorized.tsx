import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 select-none">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-6 shadow-glossy-sm">
        <ShieldAlert size={28} className="animate-bounce" />
      </div>
      
      <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-3">
        Session Unauthorized
      </h1>
      
      <p className="text-xs text-slate-450 font-medium max-w-md mb-8 leading-relaxed">
        Your current session credentials are missing, expired, or failed security checks. You must authenticate to view this page's content.
      </p>

      <div className="flex gap-4">
        <Link to="/login">
          <Button className="bg-brand-550 hover:bg-brand-600 text-white font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-2">
            <LogIn size={14} />
            <span>Go to Sign In</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
