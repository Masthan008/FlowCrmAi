import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Zap, Layers, ArrowRight, Cpu, Lock, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  autoDismissMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  autoDismissMs = 2800,
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Initializing Enterprise AI Core...');

  useEffect(() => {
    const statusMessages = [
      '⚡ Booting Autonomous Lead-to-Cash Pipeline...',
      '🛡️ Verifying Multi-Tenant Cryptographic Boundaries...',
      '🤖 Syncing Grounded AI Win-Probability Models...',
      '📊 Loading Reconciled Ledger & Customer Insights...',
      '🚀 FlowCRM AI Enterprise Ready!'
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 18) + 6;
        if (next >= 100) {
          clearInterval(interval);
          setStatusMessage(statusMessages[4]);
          return 100;
        }
        const index = Math.min(Math.floor((next / 100) * 4), 3);
        setStatusMessage(statusMessages[index]);
        return next;
      });
    }, 110);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 400);
    }, autoDismissMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [autoDismissMs, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 text-white overflow-hidden select-none font-sans"
        >
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [-30, 30, -30],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -left-32 w-96 h-96 bg-brand-550/30 rounded-full blur-[130px]"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.5, 0.2],
                y: [-40, 40, -40],
              }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[130px]"
            />
            <motion.div
              animate={{
                opacity: [0.15, 0.35, 0.15],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-teal-500/10 rounded-full blur-[180px]"
            />
          </div>

          {/* Grid lines overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '36px 36px',
            }}
          />

          <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-md w-full">
            {/* Branded Icon Container */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="relative mb-8"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-550 via-teal-500 to-purple-600 p-0.5 shadow-2xl shadow-brand-550/50">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center backdrop-blur-xl relative overflow-hidden group">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-tr from-brand-550/30 via-purple-500/20 to-transparent"
                  />
                  <Sparkles className="w-11 h-11 text-brand-400 relative z-10 animate-pulse" />
                </div>
              </div>

              {/* Glowing Pulse Ring */}
              <motion.div
                animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-3xl border border-brand-400/50 pointer-events-none"
              />
            </motion.div>

            {/* Title & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <h1 className="text-3xl font-black tracking-tight text-white mb-2 font-display">
                FlowCRM <span className="bg-gradient-to-r from-brand-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">AI Enterprise</span>
              </h1>
              <p className="text-[11px] font-extrabold text-slate-400 tracking-widest uppercase mb-8">
                Autonomous Revenue & Customer Intelligence
              </p>
            </motion.div>

            {/* Progress Bar & Status Ticker */}
            <motion.div
              initial={{ opacity: 0, width: '0%' }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ delay: 0.25 }}
              className="w-full space-y-3"
            >
              <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-550 via-teal-500 to-purple-500 rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 truncate max-w-[280px]">
                  <Cpu className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>{statusMessage}</span>
                </span>
                <span className="text-brand-400 font-extrabold shrink-0">{Math.min(progress, 100)}%</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
