import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

/**
 * 1. Animated Counter Number (Smooth count-up effect)
 */
export const AnimatedNumber: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number; className?: string }> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200; // ms
    const startVal = displayValue;
    const endVal = typeof value === 'number' && !isNaN(value) ? value : 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  const formatted = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

/**
 * 2. Radial Spotlight Glass Card (Mouse tracking light effect)
 */
export const SpotlightCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  onClick?: () => void;
}> = ({ children, className = '', spotlightColor = 'rgba(13, 148, 136, 0.15)', onClick }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      whileHover={{ y: -3, scale: 1.003 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={onClick}
      className={`relative overflow-hidden glass-card p-6 transition-all duration-300 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-2xl"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

/**
 * 3. Magnetic Button (Follows cursor within proximity)
 */
export const MagneticButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className = '', disabled = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || disabled) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    setPosition({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 250, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {children}
      </button>
    </motion.div>
  );
};

/**
 * 4. Animated Sliding Tab Bar
 */
export const AnimatedTabs: React.FC<{
  tabs: { id: string; label: string; icon?: React.ElementType }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase rounded-lg whitespace-nowrap transition-colors z-10 select-none ${
              isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-brand-550 rounded-lg shadow-glossy-sm z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            {Icon && <Icon size={14} className="relative z-10" />}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

/**
 * 5. Pulse Ring Badge
 */
export const PulseBadge: React.FC<{ label: string; color?: 'emerald' | 'amber' | 'rose' | 'blue'; className?: string }> = ({
  label,
  color = 'emerald',
  className = '',
}) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50 text-amber-700 border-amber-200', ring: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50 text-rose-700 border-rose-200', ring: 'bg-rose-500' },
    blue: { bg: 'bg-blue-50 text-blue-700 border-blue-200', ring: 'bg-blue-500' },
  };

  const style = colorMap[color];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${style.bg} ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.ring}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.ring}`} />
      </span>
      {label}
    </span>
  );
};

/**
 * 6. Ambient Floating Aura Background
 */
export const AmbientAura: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40">
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-tr from-brand-200/30 to-teal-300/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-gradient-to-bl from-blue-200/25 to-indigo-300/15 rounded-full blur-3xl"
      />
    </div>
  );
};
