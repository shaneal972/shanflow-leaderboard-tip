import React from 'react';

interface StatusDotProps {
  status?: 'operational' | 'warning' | 'critical';
  label?: string;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ 
  status = 'operational', 
  label = 'Système opérationnel',
  className = '' 
}) => {
  const statusColors = {
    operational: {
      bg: 'bg-emerald-500',
      glow: 'shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      text: 'text-emerald-400',
    },
    warning: {
      bg: 'bg-amber-500',
      glow: 'shadow-[0_0_8px_rgba(245,158,11,0.8)]',
      text: 'text-amber-400',
    },
    critical: {
      bg: 'bg-rose-500',
      glow: 'shadow-[0_0_8px_rgba(239,68,68,0.8)]',
      text: 'text-rose-400',
    },
  };

  const current = statusColors[status];

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.bg}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.bg} ${current.glow}`} />
      </span>
      {label && (
        <span className={`text-[11px] font-mono font-medium tracking-wide ${current.text}`}>
          {label}
        </span>
      )}
    </div>
  );
};
