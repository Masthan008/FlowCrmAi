import React from 'react';
import { useRouteError, useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export const RouteErrorFallback: React.FC = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  const errorMessage = error?.statusText || error?.message || 'An unexpected application error occurred.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6 font-sans select-none">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight">
            Unexpected Application Error
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            The workspace encountered an unexpected runtime exception. Don't worry, your data remains fully safe.
          </p>
        </div>

        {/* Error Detail Box */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">Error Stack Trace</span>
          <p className="text-xs font-mono text-slate-300 break-words leading-normal">
            {errorMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorFallback;
