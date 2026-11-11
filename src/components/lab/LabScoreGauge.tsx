'use client';

import React from 'react';
import { LabMilestoneStatus } from '@/types/tip';
import { getProgressScorePalette } from '@/core/domain/labProgress';

interface LabScoreGaugeProps {
  scorePct: number;
  jalonsValides: number;
  totalJalons: number;
  milestoneStatuses: LabMilestoneStatus[];
  milestoneTitles?: string[];
  compact?: boolean;
}

const MILESTONE_STYLE_MAP: Record<LabMilestoneStatus, { cls: string; label: string }> = {
  valide: {
    cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    label: 'Validé',
  },
  non_conforme: {
    cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    label: 'Anomalie détectée',
  },
  non_evalue: {
    cls: 'bg-white/5 text-slate-500 border-white/10',
    label: 'Non évalué',
  },
};

export const LabScoreGauge: React.FC<LabScoreGaugeProps> = ({
  scorePct,
  jalonsValides,
  totalJalons,
  milestoneStatuses,
  milestoneTitles = [],
  compact = false,
}) => {
  const safeScore = Math.min(100, Math.max(0, Math.round(scorePct)));
  const palette = getProgressScorePalette(safeScore);

  const pills =
    milestoneStatuses.length > 0
      ? milestoneStatuses
      : Array.from({ length: totalJalons || 5 }, () => 'non_evalue' as LabMilestoneStatus);

  return (
    <div className={compact ? 'space-y-1.5 min-w-[190px]' : 'space-y-2'}>
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={`font-mono font-extrabold tracking-tight ${
            compact ? 'text-sm' : 'text-lg'
          } ${palette.textClass}`}
        >
          {safeScore} / 100
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          {jalonsValides}/{totalJalons} jalons
        </span>
      </div>

      {/* Barre de progression graduée sur 100 */}
      <div
        className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/5"
        role="progressbar"
        aria-valuenow={safeScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progression ${safeScore} sur 100`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${palette.barClass}`}
          style={{ width: `${safeScore}%` }}
        />
      </div>

      {/* Pastilles visuelles des jalons J1..Jn */}
      <div className="flex flex-wrap items-center gap-1">
        {pills.map((status, idx) => {
          const styleInfo = MILESTONE_STYLE_MAP[status] || MILESTONE_STYLE_MAP.non_evalue;
          const jalonTitle = milestoneTitles[idx];
          const tooltip = jalonTitle
            ? `J${idx + 1} (${jalonTitle}) : ${styleInfo.label}`
            : `Jalon J${idx + 1} : ${styleInfo.label}`;

          return (
            <span
              key={idx}
              title={tooltip}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border leading-none ${styleInfo.cls}`}
            >
              J{idx + 1}
            </span>
          );
        })}
      </div>
    </div>
  );
};

