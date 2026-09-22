'use client';

import React from 'react';
import { LabMilestone, LabAuditDetail } from '@/types/tip';
import { CheckCircle2, XCircle, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

interface LabMilestoneListProps {
  milestones: LabMilestone[];
  auditDetails: LabAuditDetail[];
}

export const LabMilestoneList: React.FC<LabMilestoneListProps> = ({
  milestones,
  auditDetails,
}) => {
  const getDetailForMilestone = (mId: string) => {
    return auditDetails.find((d) => d.milestoneId === mId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Jalons d&apos;inspection technique</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          {auditDetails.filter((d) => d.status === 'valide').length} / {milestones.length} validés
        </span>
      </div>

      <div className="space-y-2.5">
        {milestones.map((milestone) => {
          const detail = getDetailForMilestone(milestone.id);
          const status = detail ? detail.status : 'non_evalue';

          const isOk = status === 'valide';
          const isKo = status === 'non_conforme';
          const isPending = status === 'non_evalue';

          return (
            <div
              key={milestone.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isOk
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : isKo
                  ? 'bg-rose-950/25 border-rose-500/50 text-rose-100'
                  : 'bg-white/[0.02] border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {isOk && <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-in zoom-in-75 duration-300" />}
                    {isKo && <XCircle className="w-4 h-4 text-rose-400 animate-in shake duration-300" />}
                    {isPending && <Clock className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-['Lexend'] text-white">
                        {milestone.ordre}. {milestone.titre}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-white/5 border border-white/10 text-slate-400">
                        +{milestone.points} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isOk && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      ✓ Validé
                    </span>
                  )}
                  {isKo && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                      ✗ À corriger
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                      En attente de fichier
                    </span>
                  )}
                </div>
              </div>

              {/* Message de diagnostic retourné par le moteur d'audit */}
              {detail && (
                <div
                  className={`mt-2.5 p-2.5 rounded-lg text-[11px] font-mono flex items-start gap-2 ${
                    isOk
                      ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-200 border border-rose-500/20'
                  }`}
                >
                  {isKo ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-semibold">{detail.message}</div>
                    {detail.details && <div className="text-[10px] opacity-80">{detail.details}</div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
