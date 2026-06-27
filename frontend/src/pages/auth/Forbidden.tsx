import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Forbidden: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 select-none">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-6 shadow-glossy-sm">
        <Lock size={26} />
      </div>
      
      <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-3">
        403 - Access Denied
      </h1>
      
      <p className="text-xs text-slate-450 font-medium max-w-md mb-8 leading-relaxed">
        You do not possess the required security permissions or role credentials to access this system module. Please contact your administrator if you believe this is in error.
      </p>

      <div className="flex gap-4">
        <Link to="/">
          <Button className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-2">
            <Home size={14} />
            <span>Return Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
