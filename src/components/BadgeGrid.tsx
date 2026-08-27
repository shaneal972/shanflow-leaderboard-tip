'use client';

import React from 'react';
import { Badge } from '@/types/tip';
import { Lock, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BadgeGridProps {
  badges: Badge[];
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({ badges }) => {
  const triggerBadgeConfetti = (badge: Badge) => {
    if (!badge.unlocked) return;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#F59E0B', '#00B4D8', '#10B981'],
    });
  };

  const getRarityBadge = (rarete: string) => {
    switch (rarete) {
      case 'legendaire':
        return <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Légendaire</span>;
      case 'epique':
        return <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Épique</span>;
      case 'rare':
        return <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">Rare</span>;
      default:
        return <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-300 border border-slate-500/30">Commun</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge) => {
        const isUnlocked = !!badge.unlocked;

        return (
          <div
            key={badge.id}
            onClick={() => triggerBadgeConfetti(badge)}
            className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
              isUnlocked
                ? 'slate-glass border-amber-500/30 hover:border-amber-400 gold-glow hover:scale-[1.02]'
                : 'bg-white/[0.02] border-white/5 opacity-40 hover:opacity-70 grayscale'
            }`}
          >
            {/* Ruban Palier & Rareté */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-semibold text-teal-400">
                {badge.palier}
              </span>
              {getRarityBadge(badge.rarete)}
            </div>

            {/* Corps du badge */}
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                  isUnlocked
                    ? 'bg-amber-500/20 border border-amber-500/40 shadow-inner'
                    : 'bg-slate-800 border border-white/10'
                }`}
              >
                {badge.icone_url}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-sm text-slate-100 font-['Lexend'] truncate">
                    {badge.titre}
                  </h4>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-snug">
                  {badge.description}
                </p>
              </div>
            </div>

            {/* Pied de carte : Valeur en points & statut */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-semibold">
                +{badge.points_requis} pts
              </span>
              {isUnlocked ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Validé
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Verrouillé
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
