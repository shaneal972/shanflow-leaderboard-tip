'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';

interface ConfettiTriggerProps {
  label?: string;
  className?: string;
  points?: number;
}

export const ConfettiTrigger: React.FC<ConfettiTriggerProps> = ({
  label = 'Célébrer la réussite',
  className = '',
  points = 100,
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00B4D8', '#F59E0B', '#10B981', '#ffffff'],
    });
  };

  return (
    <button
      type="button"
      onClick={triggerConfetti}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all active:scale-95 ${className}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span>{label}</span>
      {points > 0 && <span className="font-mono text-amber-400">+{points} pts</span>}
    </button>
  );
};
