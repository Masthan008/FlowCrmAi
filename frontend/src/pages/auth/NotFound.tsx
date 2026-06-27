import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 select-none">
      <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-6 shadow-glossy-sm">
        <HelpCircle size={28} />
      </div>
      
      <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-3">
        404 - Page Not Found
      </h1>
      
      <p className="text-xs text-slate-450 font-medium max-w-md mb-8 leading-relaxed">
        The requested URL is not configured or has been deleted. Double-check your route settings or return back to the application dashboard.
      </p>

      <div className="flex gap-4">
        <Link to="/">
          <Button className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-2">
            <ArrowLeft size={14} />
            <span>Return Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
