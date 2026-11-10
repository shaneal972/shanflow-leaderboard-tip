'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Apprenant,
  DPSuivi,
  LabSubmission,
  QuizWithStats,
  TicketKLF,
  TicketResolution,
} from '@/types/tip';
import {
  buildPromo360Matrix,
  generate360CsvContent,
  Student360Row,
  TOTAL_TRACKED_WORKS,
} from '@/core/domain/progressTracker';
import {
  Activity,
  BookOpen,
  Clock,
  Download,
  ExternalLink,
  FileCheck2,
  FlaskConical,
  Search,
  Ticket,
  X,
} from 'lucide-react';

export interface AdminProgressTrackerProps {
  students: Apprenant[];
  tickets: TicketKLF[];
  resolutions: TicketResolution[];
  quizzes: QuizWithStats[];
  labSubmissions: LabSubmission[];
  dpRecords: DPSuivi[];
  onNavigateTab?: (tab: 'labs' | 'tickets' | 'quiz' | 'dp') => void;
}

type StatusFilter = 'all' | 'pending_review' | 'behind' | 'on_track';

const DEFAULT_ESCOUADES = ['Escouade Alizé', 'Escouade Houelbourg', 'Escouade Baie-Mahault'];

export const AdminProgressTracker: React.FC<AdminProgressTrackerProps> = ({
  students,
  tickets,
  resolutions,
  quizzes,
  labSubmissions,
  dpRecords,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [detailRow, setDetailRow] = useState<Student360Row | null>(null);

  const { rows, kpis } = useMemo(
    () =>
      buildPromo360Matrix({
        students,
        tickets,
        resolutions,
        quizzes,
        labSubmissions,
        dpRecords,
      }),
    [students, tickets, resolutions, quizzes, labSubmissions, dpRecords]
  );

  const escouadeOptions = useMemo(() => {
    const dynamicTeams = rows.map((r) => r.student.equipe).filter(Boolean);
    return Array.from(new Set([...DEFAULT_ESCOUADES, ...dynamicTeams]));
  }, [rows]);

  const filterCounts = useMemo(
    () => ({
      all: rows.length,
      pending_review: rows.filter((r) => r.hasPendingReview).length,
      behind: rows.filter((r) => r.isBehind).length,
      on_track: rows.filter((r) => r.isOnTrack).length,
    }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const fullName = `${row.student.prenom} ${row.student.nom} ${row.student.equipe}`.toLowerCase();
      const matchesSearch = !q || fullName.includes(q);
      const matchesTeam = selectedTeam === 'all' || row.student.equipe === selectedTeam;

      let matchesStatus = true;
      if (statusFilter === 'pending_review') matchesStatus = row.hasPendingReview;
      else if (statusFilter === 'behind') matchesStatus = row.isBehind;
      else if (statusFilter === 'on_track') matchesStatus = row.isOnTrack;

      return matchesSearch && matchesTeam && matchesStatus;
    });
  }, [rows, searchQuery, selectedTeam, statusFilter]);

  const handleExportCsv = () => {
    const csv = generate360CsvContent(filteredRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Suivi_360_KLF_TIP_${dateStamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* A. Bandeau de 4 KPI synthétiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Avancement Global Promo */}
        <div className="p-4 rounded-2xl slate-glass border border-teal-500/25 bg-teal-950/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-teal-300">
            <span>Avancement global promo</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-['Lexend']">
              {kpis.avgProgressPct} %
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              sur {kpis.totalLearners} stagiaires
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${kpis.avgProgressPct}%` }}
            />
          </div>
        </div>

        {/* KPI 2 : Atelier TP Corinne */}
        <div className="p-4 rounded-2xl slate-glass border border-sky-500/25 bg-sky-950/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-sky-300">
            <span>Atelier TP Corinne</span>
            <FlaskConical className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-['Lexend']">
              {kpis.corinneSubmittedCount} / {kpis.totalLearners}
            </span>
            <span className="text-[11px] font-mono text-slate-400">rendus</span>
          </div>
          <div className="text-[11px] font-mono">
            {kpis.corinnePendingCount > 0 ? (
              <button
                type="button"
                onClick={() => onNavigateTab?.('labs')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 hover:bg-cyan-500/30 cursor-pointer"
              >
                <Clock className="w-3 h-3 animate-pulse" />
                <span>{kpis.corinnePendingCount} à homologuer</span>
              </button>
            ) : (
              <span className="text-slate-400">Aucune homologation en attente</span>
            )}
          </div>
        </div>

        {/* KPI 3 : Tickets Helpdesk KLF */}
        <div className="p-4 rounded-2xl slate-glass border border-amber-500/25 bg-amber-950/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-amber-300">
            <span>Tickets Helpdesk (5 scénarios)</span>
            <Ticket className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-['Lexend']">
              {kpis.ticketsHandledTotal} / {kpis.ticketsPossibleTotal}
            </span>
            <span className="text-[11px] font-mono text-slate-400">traités</span>
          </div>
          <div className="text-[11px] font-mono">
            {kpis.ticketsPendingTotal > 0 ? (
              <button
                type="button"
                onClick={() => onNavigateTab?.('tickets')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 animate-pulse hover:bg-amber-500/30 cursor-pointer"
              >
                <Clock className="w-3 h-3" />
                <span>{kpis.ticketsPendingTotal} en attente de validation</span>
              </button>
            ) : (
              <span className="text-emerald-300/80">File d&apos;attente à jour</span>
            )}
          </div>
        </div>

        {/* KPI 4 : Épreuves Quiz KLF */}
        <div className="p-4 rounded-2xl slate-glass border border-purple-500/25 bg-purple-950/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-purple-300">
            <span>Épreuves Quiz KLF (4 quiz)</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-['Lexend']">
              {kpis.quizCopiesTotal} / {kpis.quizCopiesPossibleTotal}
            </span>
            <span className="text-[11px] font-mono text-slate-400">copies</span>
          </div>
          <div className="text-[11px] font-mono text-purple-200">
            Moyenne promo :{' '}
            <strong>
              {kpis.promoQuizAvgSur20 !== null ? `${kpis.promoQuizAvgSur20} / 20` : '—'}
            </strong>
          </div>
        </div>
      </div>

      {/* B. Barre d'outils & Filtres intelligents */}
      <div className="p-4 rounded-2xl slate-glass border border-white/10 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            {/* Recherche textuelle */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par prénom, nom ou escouade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Filtre par Escouade */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              aria-label="Filtrer par escouade"
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="all">Toutes les escouades</option>
              {escouadeOptions.map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>📥 Exporter le suivi 360° (.CSV)</span>
          </button>
        </div>

        {/* Filtres d'état pédagogique */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
          {[
            { id: 'all', label: `Tous les apprenants (${filterCounts.all})` },
            {
              id: 'pending_review',
              label: `⏳ En attente formateur (${filterCounts.pending_review})`,
            },
            {
              id: 'behind',
              label: `⚠️ En retard / Rattrapage (${filterCounts.behind})`,
            },
            {
              id: 'on_track',
              label: `✅ Progression avancée ≥ 50 % (${filterCounts.on_track})`,
            },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id as StatusFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                statusFilter === f.id
                  ? 'bg-teal-500/20 text-teal-200 border-teal-400/50 font-bold'
                  : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* C. Tableau Matriciel 360° des Apprenants */}
      <div className="rounded-3xl slate-glass border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-w-full [webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[1060px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#0A1628] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 sticky left-0 z-20 bg-[#0A1628] shadow-[4px_0_12px_rgba(0,0,0,0.4)] min-w-[230px]">
                  Stagiaire
                </th>
                <th className="py-3.5 px-3 min-w-[145px]">Avancement global</th>
                <th className="py-3.5 px-3 min-w-[185px]">Atelier TP Corinne</th>
                <th className="py-3.5 px-3 min-w-[235px]">Tickets Helpdesk (5)</th>
                <th className="py-3.5 px-3 min-w-[245px]">Quiz KLF (4)</th>
                <th className="py-3.5 px-4 text-right sticky right-0 z-20 bg-[#0A1628] shadow-[-4px_0_12px_rgba(0,0,0,0.4)]">
                  Détail 360°
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-mono">
                    Aucun stagiaire ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const { student, corinneSub } = row;
                  const initials = `${student.prenom?.[0] || ''}${student.nom?.[0] || ''}`.toUpperCase();

                  return (
                    <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* 1. Stagiaire (Sticky gauche) */}
                      <td className="py-3 px-4 sticky left-0 z-10 bg-[#070F1E] group-hover:bg-[#0D1B30] shadow-[4px_0_12px_rgba(0,0,0,0.35)]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-300 shrink-0 overflow-hidden">
                            {student.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={student.avatar_url}
                                alt={student.prenom}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white truncate font-['Lexend']">
                                {student.prenom} {student.nom.toUpperCase()}
                              </span>
                              <Link
                                href={`/passport/${student.id}`}
                                target="_blank"
                                className="text-slate-500 hover:text-teal-400 transition-colors shrink-0"
                                title={`Ouvrir le passeport de ${student.prenom}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {student.equipe} • {student.points_total} pts • {student.palier_actuel}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Avancement Global (Jauge) */}
                      <td className="py-3 px-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-200 font-bold">
                              {row.completedCount} / {TOTAL_TRACKED_WORKS}
                            </span>
                            <span
                              className={
                                row.progressPct >= 75
                                  ? 'text-emerald-300 font-bold'
                                  : row.progressPct >= 50
                                  ? 'text-teal-300 font-bold'
                                  : 'text-amber-300 font-bold'
                              }
                            >
                              {row.progressPct} %
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                row.progressPct >= 75
                                  ? 'bg-emerald-500'
                                  : row.progressPct >= 50
                                  ? 'bg-teal-400'
                                  : 'bg-amber-400'
                              }`}
                              style={{ width: `${row.progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 3. Atelier TP (TP-BUR-01 Corinne) */}
                      <td className="py-3 px-3">
                        {corinneSub?.statut === 'homologue_dsi' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                            🟢 Homologué (100% • 200p)
                          </span>
                        ) : corinneSub?.statut === 'soumis_en_revue' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold">
                              🔵 Soumis ({corinneSub.score_technique_pct}% • {corinneSub.jalons_valides}/5)
                            </span>
                            <div className="text-[10px] font-mono text-amber-300">
                              ⏳ À homologuer
                            </div>
                          </div>
                        ) : corinneSub?.statut === 'a_corriger' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-orange-500/15 text-orange-300 border border-orange-500/35">
                            ⚠ À corriger ({corinneSub.score_technique_pct}% • {corinneSub.jalons_valides}/5)
                          </span>
                        ) : corinneSub &&
                          (corinneSub.statut === 'brouillon' || corinneSub.statut === 'en_cours') ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/35">
                            🟡 En cours ({corinneSub.score_technique_pct}% • {corinneSub.jalons_valides}/5)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/5 text-slate-400 border border-white/10">
                            ⚪ Non commencé
                          </span>
                        )}
                      </td>

                      {/* 4. Tickets Helpdesk (TCK-101 à TCK-105) */}
                      <td className="py-3 px-3">
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-mono text-slate-400">
                            <strong className="text-slate-200">{row.ticketsSubmittedCount} / 5</strong>{' '}
                            traités
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            {row.ticketsState.map((t) => {
                              const st = t.resolution?.statut;
                              let cls = 'bg-white/5 text-slate-500 border-white/10';
                              let prefix = '';
                              let labelStatus = 'Non soumis';

                              if (st === 'valide') {
                                cls = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                                prefix = '✓ ';
                                labelStatus = 'Validé';
                              } else if (st === 'en_attente_validation') {
                                cls =
                                  'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse';
                                prefix = '⏳ ';
                                labelStatus = 'En attente de validation';
                              } else if (st === 'a_corriger') {
                                cls = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                                prefix = '⚠ ';
                                labelStatus = 'À corriger';
                              }

                              return (
                                <span
                                  key={t.ticketId}
                                  title={`${t.ticketId} — ${t.titre} : ${labelStatus}`}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${cls}`}
                                >
                                  {prefix}
                                  {t.shortCode}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* 5. Quiz KLF (RAN, WRD, XLS, OUT) */}
                      <td className="py-3 px-3">
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-mono text-slate-400">
                            <strong className="text-slate-200">{row.quizzesFinalizedCount} / 4</strong>{' '}
                            passés
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            {row.quizzesState.map((q) => {
                              if (q.isCheating) {
                                return (
                                  <span
                                    key={q.quizId}
                                    title={`${q.titre} : Clôturé pour suspicion de triche`}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-mono border bg-rose-500/20 text-rose-300 border-rose-500/40"
                                  >
                                    🔴 Triche 0/20
                                  </span>
                                );
                              }
                              if (q.isFinalized && q.scorePourcentage !== null && q.noteSur20 !== null) {
                                const isSuccess = q.scorePourcentage >= 75;
                                return (
                                  <span
                                    key={q.quizId}
                                    title={`${q.titre} : ${q.noteSur20}/20 (${q.scorePourcentage}%)`}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                      isSuccess
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    }`}
                                  >
                                    {isSuccess ? '✓' : '⚠'} {q.code} {q.noteSur20}/20
                                  </span>
                                );
                              }
                              return (
                                <span
                                  key={q.quizId}
                                  title={`${q.titre} : Non passé`}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono border bg-white/5 text-slate-500 border-white/10"
                                >
                                  ⚪ {q.code} -
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* 6. Actions (Sticky droite) */}
                      <td className="py-3 px-4 text-right sticky right-0 z-10 bg-[#070F1E] group-hover:bg-[#0D1B30] shadow-[-4px_0_12px_rgba(0,0,0,0.35)]">
                        <button
                          type="button"
                          onClick={() => setDetailRow(row)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-teal-500/15 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border border-teal-500/35 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                        >
                          <span>🔍 Détail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale individuelle 360° */}
      {detailRow && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#081224] border border-teal-500/35 shadow-2xl p-6 space-y-5">
            {/* Header Modale */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-teal-500/40 flex items-center justify-center text-sm font-bold text-teal-300 overflow-hidden shrink-0">
                  {detailRow.student.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detailRow.student.avatar_url}
                      alt={detailRow.student.prenom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    `${detailRow.student.prenom[0]}${detailRow.student.nom[0]}`
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white font-['Lexend']">
                    Dossier 360° — {detailRow.student.prenom} {detailRow.student.nom.toUpperCase()}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 flex flex-wrap items-center gap-2">
                    <span>{detailRow.student.equipe}</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">{detailRow.student.points_total} pts</span>
                    <span>•</span>
                    <span>{detailRow.student.palier_actuel}</span>
                    <span>•</span>
                    <span className="text-teal-300 font-bold">
                      Avancement : {detailRow.progressPct} % ({detailRow.completedCount}/{TOTAL_TRACKED_WORKS})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailRow(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1 : Ateliers TP Tech Lab */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" />
                  <span>Ateliers pratiques Tech Lab</span>
                </h4>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setDetailRow(null);
                      onNavigateTab('labs');
                    }}
                    className="text-[11px] font-mono text-teal-300 hover:underline cursor-pointer"
                  >
                    Ouvrir l&apos;onglet Ateliers TP →
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-200 space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5">
                  <span>TP-BUR-01 • Manifeste Corinne &amp; Fiscalité</span>
                  <span className="font-mono font-bold text-teal-300">
                    {detailRow.corinneSub
                      ? `${detailRow.corinneSub.statut} (${detailRow.corinneSub.score_technique_pct}% • ${detailRow.corinneSub.jalons_valides}/5)`
                      : 'Non commencé'}
                  </span>
                </div>
                {detailRow.quai3Sub && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5">
                    <span>TP-BUR-03 • Pack 4h Quai n°3 (Word/Excel/Docs/Sheets)</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {detailRow.quai3Sub.statut} ({detailRow.quai3Sub.score_technique_pct}% • {detailRow.quai3Sub.jalons_valides}/6)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2 : Tickets Helpdesk KLF */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  <span>Tickets Helpdesk KLF ({detailRow.ticketsSubmittedCount} / 5)</span>
                </h4>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setDetailRow(null);
                      onNavigateTab('tickets');
                    }}
                    className="text-[11px] font-mono text-amber-300 hover:underline cursor-pointer"
                  >
                    Corriger dans Tickets KLF →
                  </button>
                )}
              </div>
              <div className="space-y-1.5 text-xs">
                {detailRow.ticketsState.map((t) => (
                  <div
                    key={t.ticketId}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl bg-black/30 border border-white/5"
                  >
                    <span className="text-slate-200 truncate">
                      <strong className="font-mono text-slate-400 mr-1.5">{t.ticketId}</strong>
                      {t.titre}
                    </span>
                    <span className="font-mono shrink-0 text-[11px]">
                      {t.resolution?.statut === 'valide'
                        ? '🟢 Validé'
                        : t.resolution?.statut === 'en_attente_validation'
                        ? '⏳ En attente'
                        : t.resolution?.statut === 'a_corriger'
                        ? '⚠ À corriger'
                        : '⚪ Non soumis'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 : Quiz KLF + Avancement DP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Quiz KLF ({detailRow.quizzesFinalizedCount} / 4)</span>
                  </h4>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => {
                        setDetailRow(null);
                        onNavigateTab('quiz');
                      }}
                      className="text-[11px] font-mono text-purple-300 hover:underline cursor-pointer"
                    >
                      Onglet Quiz →
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 text-xs">
                  {detailRow.quizzesState.map((q) => (
                    <div
                      key={q.quizId}
                      className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5"
                    >
                      <span className="text-slate-200">{q.label}</span>
                      <span className="font-mono font-bold">
                        {q.isCheating ? (
                          <span className="text-rose-400">🔴 Triche (0/20)</span>
                        ) : q.isFinalized && q.noteSur20 !== null ? (
                          <span className="text-emerald-300">
                            {q.noteSur20}/20 ({q.scorePourcentage}%)
                          </span>
                        ) : (
                          <span className="text-slate-500">Non passé</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4" />
                      <span>Dossier professionnel (DP)</span>
                    </h4>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => {
                          setDetailRow(null);
                          onNavigateTab('dp');
                        }}
                        className="text-[11px] font-mono text-emerald-300 hover:underline cursor-pointer"
                      >
                        Onglet DP →
                      </button>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rubriques validées :</span>
                      <strong className="font-mono text-white">{detailRow.dpRubriquesCount} / 5</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Statut DP :</span>
                      <strong className="font-mono text-emerald-300">
                        {detailRow.dpRecord?.statut_dp || 'brouillon'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <Link
                    href={`/passport/${detailRow.student.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-teal-300 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Voir passeport complet</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDetailRow(null)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
