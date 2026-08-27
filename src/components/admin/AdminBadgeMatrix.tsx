'use client';

import React, { useState, useTransition } from 'react';
import { Apprenant, Badge } from '@/types/tip';
import { 
  Trophy, 
  Check, 
  Lock, 
  Sparkles, 
  AlertCircle, 
  X, 
  ShieldCheck 
} from 'lucide-react';
import { awardBadgeAction, revokeBadgeAction } from '@/app/admin/actions';

interface AdminBadgeMatrixProps {
  students: Apprenant[];
  badges: Badge[];
  achievements: { apprenant_id: string; badge_id: string }[];
}

export const AdminBadgeMatrix: React.FC<AdminBadgeMatrixProps> = ({ 
  students, 
  badges, 
  achievements: initialAchievements 
}) => {
  const [achievements, setAchievements] = useState(initialAchievements);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isUnlocked = (studentId: string, badgeId: string) => {
    return achievements.some(
      (a) => a.apprenant_id === studentId && a.badge_id === badgeId
    );
  };

  const handleToggleBadge = (student: Apprenant, badge: Badge) => {
    const unlocked = isUnlocked(student.id, badge.id);

    startTransition(async () => {
      if (unlocked) {
        // Révocation
        const res = await revokeBadgeAction(student.id, badge.id);
        if (res.success) {
          setAchievements((prev) =>
            prev.filter(
              (a) => !(a.apprenant_id === student.id && a.badge_id === badge.id)
            )
          );
          setMessage({
            type: 'success',
            text: `Badge « ${badge.titre} » révoqué pour ${student.prenom} ${student.nom} (-${badge.points_requis} pts).`,
          });
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage({ type: 'error', text: res.error || 'Erreur lors de la révocation.' });
        }
      } else {
        // Attribution
        const res = await awardBadgeAction(student.id, badge.id);
        if (res.success) {
          setAchievements((prev) => [
            ...prev,
            { apprenant_id: student.id, badge_id: badge.id },
          ]);
          setMessage({
            type: 'success',
            text: `Badge « ${badge.titre} » débloqué pour ${student.prenom} ${student.nom} (+${badge.points_requis} pts) !`,
          });
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage({ type: 'error', text: res.error || 'Erreur lors de l\'attribution.' });
        }
      }
    });
  };

  return (
    <div className="space-y-4">

      {/* Barre de rétroaction */}
      {message && (
        <div className={`p-3 rounded-xl text-xs font-mono flex items-center justify-between border ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* En-tête de la matrice */}
      <div className="p-4 rounded-xl slate-glass border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Matrice d&apos;attribution manuelle des badges KLF
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cliquez directement sur une case pour débloquer ou révoquer un badge. Les points du barème sont automatiquement recalculés.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <div className="w-2.5 h-2.5 rounded bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span>Débloqué</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-2.5 h-2.5 rounded bg-white/10" />
            <span>Verrouillé</span>
          </div>
        </div>
      </div>

      {/* Tableau croisé avec colonnes badges et ligne apprenant */}
      <div className="rounded-xl border border-white/10 bg-[#0A192F]/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-center border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#112240] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 text-left w-52 sticky left-0 z-20 bg-[#112240] shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                  Technicien TIP
                </th>
                {badges.map((badge) => (
                  <th key={badge.id} className="py-3 px-2 w-24 text-center">
                    <div className="text-lg mb-0.5" title={badge.titre}>
                      {badge.icone_url}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-200 truncate max-w-[90px] mx-auto">
                      {badge.titre}
                    </div>
                    <div className="text-[9px] font-mono text-amber-400">
                      +{badge.points_requis}p
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {students.map((student) => {
                const studentUnlockedCount = badges.filter((b) => isUnlocked(student.id, b.id)).length;

                return (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Colonne Apprenant Sticky à gauche */}
                    <td className="py-3 px-4 text-left sticky left-0 z-10 bg-[#0A192F] shadow-[4px_0_12px_rgba(0,0,0,0.4)]">
                      <div className="font-semibold text-white font-['Lexend'] truncate">
                        {student.prenom} {student.nom}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-teal-400">{student.points_total} pts</span>
                        <span>•</span>
                        <span className="text-slate-400">{studentUnlockedCount}/{badges.length} badges</span>
                      </div>
                    </td>

                    {/* Cellules Badges interactives */}
                    {badges.map((badge) => {
                      const active = isUnlocked(student.id, badge.id);

                      return (
                        <td key={badge.id} className="py-2.5 px-2">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleToggleBadge(student, badge)}
                            className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all duration-200 select-none ${
                              active
                                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95'
                                : 'bg-white/[0.03] border border-white/5 text-slate-600 hover:border-white/20 hover:text-slate-400'
                            }`}
                            title={`${badge.titre} - ${active ? 'Cliquer pour révoquer' : 'Cliquer pour débloquer'}`}
                          >
                            {active ? (
                              <Check className="w-5 h-5 text-amber-400" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
