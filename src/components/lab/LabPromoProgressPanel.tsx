'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lab,
  LabParticipantProgress,
  LabParticipantStatus,
} from '@/types/tip';
import {
  computeLabGlobalStats,
  getProgressScorePalette,
  sortLabParticipants,
} from '@/core/domain/labProgress';
import { LabScoreGauge } from './LabScoreGauge';
import {
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  Download,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

type PromoFilter = 'all' | 'active' | 'validated' | 'pending';

interface LabPromoProgressPanelProps {
  lab: Lab;
  participants: LabParticipantProgress[];
  currentStudentId: string;
  isFormateur: boolean;
}

function getParticipantStatusBadge(
  statut: LabParticipantStatus,
  scorePct: number
): { label: string; cls: string } {
  switch (statut) {
    case 'homologue_dsi':
      return {
        label: `🟢 Homologué DSI (${scorePct}/100)`,
        cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
      };
    case 'soumis_en_revue':
      return {
        label: `🔵 Soumis (${scorePct}/100)`,
        cls: 'bg-sky-500/15 text-sky-300 border-sky-500/35',
      };
    case 'a_corriger':
      return {
        label: `🔴 À corriger (${scorePct}/100)`,
        cls: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
      };
    case 'en_cours':
    case 'brouillon':
      return {
        label: `🟡 En cours (${scorePct}/100)`,
        cls: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
      };
    default:
      return {
        label: '⚪ En attente (0/100)',
        cls: 'bg-white/5 text-slate-400 border-white/10',
      };
  }
}

export const LabPromoProgressPanel: React.FC<LabPromoProgressPanelProps> = ({
  lab,
  participants,
  currentStudentId,
  isFormateur,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(isFormateur);
  const [activeFilter, setActiveFilter] = useState<PromoFilter>('all');
  const [isRefreshing, startRefresh] = useTransition();
  const [inspectedParticipant, setInspectedParticipant] =
    useState<LabParticipantProgress | null>(null);

  const sortedParticipants = useMemo(
    () => sortLabParticipants(participants),
    [participants]
  );

  const stats = useMemo(
    () => computeLabGlobalStats(sortedParticipants),
    [sortedParticipants]
  );

  const milestoneTitles = useMemo(
    () => (lab.jalons || []).map((j) => j.titre),
    [lab.jalons]
  );

  const currentStudentProgress = useMemo(
    () => sortedParticipants.find((p) => p.apprenantId === currentStudentId) || null,
    [sortedParticipants, currentStudentId]
  );

  const filterCounts = useMemo(
    () => ({
      all: sortedParticipants.length,
      active: sortedParticipants.filter((p) => p.scorePct > 0).length,
      validated: sortedParticipants.filter((p) => p.scorePct >= 100).length,
      pending: sortedParticipants.filter((p) => p.scorePct === 0).length,
    }),
    [sortedParticipants]
  );

  const filteredParticipants = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return sortedParticipants.filter((p) => p.scorePct > 0);
      case 'validated':
        return sortedParticipants.filter((p) => p.scorePct >= 100);
      case 'pending':
        return sortedParticipants.filter((p) => p.scorePct === 0);
      default:
        return sortedParticipants;
    }
  }, [sortedParticipants, activeFilter]);

  const globalPalette = getProgressScorePalette(stats.averagePromoPct);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    startRefresh(() => {
      router.refresh();
    });
  };

  return (
    <section className="rounded-3xl slate-glass border border-white/10 overflow-hidden shadow-xl">
      {/* En-tête repliable & Jauge globale de l'atelier */}
      <div className="p-4 sm:p-5 bg-[#0A192F]/70 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-start sm:items-center gap-3 text-left group cursor-pointer"
            aria-expanded={isOpen}
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white font-['Lexend'] group-hover:text-teal-300 transition-colors">
                  👥 Progression de la promotion sur cet atelier (jauge /100)
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                  {isOpen ? (
                    <>
                      <span>Replier</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>Afficher les {stats.totalParticipants} participants</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
                <span className="text-teal-300 font-bold">
                  {stats.activeCount} / {stats.totalParticipants} en action
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-300 font-bold">
                  {stats.validated100Count} / {stats.totalParticipants} à 100%
                </span>
                {!isFormateur && currentStudentProgress && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-200 border border-teal-500/30">
                      Votre score : {currentStudentProgress.scorePct} / 100
                    </span>
                  </>
                )}
              </div>
            </div>
          </button>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-teal-300 border border-teal-500/30 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>
                {isRefreshing ? 'Actualisation...' : '🔄 Actualiser en direct'}
              </span>
            </button>
          </div>
        </div>

        {/* Jauge globale de l'atelier sur 100 */}
        <div className="p-3.5 rounded-2xl bg-[#070F1E]/80 border border-white/10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-300 font-semibold">
              Jauge globale de l&apos;atelier (moyenne promotion)
            </span>
            <div className="flex items-center gap-3">
              {stats.activeCount > 0 && (
                <span className="text-[11px] text-slate-400">
                  Moy. actifs :{' '}
                  <strong className="text-cyan-300">
                    {stats.averageActivePct} / 100
                  </strong>
                </span>
              )}
              <span className={`text-sm font-extrabold ${globalPalette.textClass}`}>
                {stats.averagePromoPct} / 100
              </span>
            </div>
          </div>
          <div
            className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/5"
            role="progressbar"
            aria-valuenow={stats.averagePromoPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Jauge globale de progression de la promotion sur cet atelier"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${globalPalette.barClass}`}
              style={{ width: `${stats.averagePromoPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Corps dépliable : Filtres + Grille des apprenants */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-white/10 space-y-4 bg-[#070F1E]/40">
          {/* Filtres rapides */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: `Tous (${filterCounts.all})` },
                {
                  id: 'active',
                  label: `En cours / Actifs (> 0%) (${filterCounts.active})`,
                },
                {
                  id: 'validated',
                  label: `Validés (100%) (${filterCounts.validated})`,
                },
                {
                  id: 'pending',
                  label: `En attente (0%) (${filterCounts.pending})`,
                },
              ] as const
            ).map((filter) => {
              const isSelected = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-200 border-teal-400/50 font-bold shadow-sm'
                      : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white hover:bg-white/[0.07]'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Grille des apprenants */}
          {filteredParticipants.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] text-center text-xs font-mono text-slate-400">
              Aucun apprenant ne correspond à ce filtre pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredParticipants.map((participant) => {
                const badge = getParticipantStatusBadge(
                  participant.statut,
                  participant.scorePct
                );
                const isSelf =
                  !isFormateur && participant.apprenantId === currentStudentId;
                const initials = `${participant.prenom.charAt(0)}${participant.nomDisplay.charAt(0)}`.toUpperCase();

                return (
                  <div
                    key={participant.apprenantId}
                    className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                      isSelf
                        ? 'bg-teal-950/25 border-teal-400/45 shadow-[0_0_20px_rgba(20,184,166,0.12)]'
                        : participant.scorePct >= 100
                          ? 'bg-emerald-950/15 border-emerald-500/25'
                          : 'bg-[#0A192F]/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Ligne identité + statut */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center text-xs font-bold text-teal-300 shrink-0 overflow-hidden">
                            {participant.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={participant.avatar_url}
                                alt={`${participant.prenom} ${participant.nomDisplay}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white font-['Lexend'] truncate">
                                {participant.prenom} {participant.nomDisplay}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-teal-500/25 text-teal-200 border border-teal-400/40">
                                  Vous
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {participant.equipe}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border shrink-0 ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Jauge individuelle /100 + Pastilles J1..Jn */}
                      <LabScoreGauge
                        scorePct={participant.scorePct}
                        jalonsValides={participant.jalonsValides}
                        totalJalons={participant.totalJalons}
                        milestoneStatuses={participant.milestoneStatuses}
                        milestoneTitles={milestoneTitles}
                      />
                    </div>

                    {/* Actions rapides formateur DSI */}
                    {isFormateur && participant.fullSubmission && (
                      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectedParticipant(participant)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-400" />
                          <span>👁️ Voir copie / PDF</span>
                        </button>

                        <a
                          href={`/api/lab/export-pdf?labId=${lab.id}&studentId=${participant.apprenantId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all"
                          title="Télécharger le compte-rendu PDF Gotenberg"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modale formateur : Consultation rapide de copie & export PDF */}
      {isFormateur && inspectedParticipant && inspectedParticipant.fullSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0A192F] border border-white/15 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Lexend']">
                    Copie atelier • {inspectedParticipant.prenom}{' '}
                    {inspectedParticipant.nomDisplay}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    {inspectedParticipant.equipe} • Score :{' '}
                    {inspectedParticipant.scorePct} / 100 (
                    {inspectedParticipant.jalonsValides}/
                    {inspectedParticipant.totalJalons} jalons)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedParticipant(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                aria-label="Fermer la fenêtre d'inspection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-mono font-bold text-slate-300">
                  1. Démarche technique :
                </span>
                <div className="mt-1 p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-slate-200 whitespace-pre-wrap max-h-44 overflow-y-auto">
                  {inspectedParticipant.fullSubmission.reponse_demarche ||
                    'Aucune démarche rédigée.'}
                </div>
              </div>

              <div>
                <span className="font-mono font-bold text-slate-300">
                  2. Difficultés &amp; contournement :
                </span>
                <div className="mt-1 p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-slate-200 whitespace-pre-wrap">
                  {inspectedParticipant.fullSubmission.reponse_difficultes ||
                    'Non renseigné.'}
                </div>
              </div>

              <div>
                <span className="font-mono font-bold text-slate-300">
                  3. Enseignements professionnels :
                </span>
                <div className="mt-1 p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-slate-200 whitespace-pre-wrap">
                  {inspectedParticipant.fullSubmission.reponse_enseignements ||
                    'Non renseigné.'}
                </div>
              </div>

              {inspectedParticipant.fullSubmission.feedback_formateur && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 font-mono">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Avis formateur DSI :</span>
                  </div>
                  <p>{inspectedParticipant.fullSubmission.feedback_formateur}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {inspectedParticipant.soumisLe
                    ? `Soumis le ${new Date(
                        inspectedParticipant.soumisLe
                      ).toLocaleString('fr-FR')}`
                    : 'En cours / brouillon'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectedParticipant(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
                >
                  Fermer
                </button>
                <a
                  href={`/api/lab/export-pdf?labId=${lab.id}&studentId=${inspectedParticipant.apprenantId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-indigo-500 hover:bg-indigo-400 text-white transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger le PDF A4 (Gotenberg)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
