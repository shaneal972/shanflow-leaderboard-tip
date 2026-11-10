'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LabSubmission,
  Apprenant,
  Lab,
  LabParticipantProgress,
  LabParticipantStatus,
} from '@/types/tip';
import { ALL_LABS, getLabById } from '@/lib/lab/labData';
import {
  buildLabParticipantsProgress,
  computeLabGlobalStats,
  getProgressScorePalette,
  sortLabParticipants,
} from '@/core/domain/labProgress';
import { LabScoreGauge } from '@/components/lab/LabScoreGauge';
import { homologuerLabAction } from '@/app/lab/actions';
import {
  FlaskConical,
  CheckCircle2,
  Download,
  Award,
  ExternalLink,
  Search,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';

const CORINNE_CONTAINERS_CORRIGE = [
  { lig: 4, id: 'CMAU-982144-0', navire: 'Fort Saint-Louis', armateur: 'CMA-CGM', cp: '97122', base: '12 500,00 €', transit: '280,00 €', octroi: '1 062,50 €', tvaDir: '1 062,50 €', ttc: '14 905,00 €' },
  { lig: 5, id: 'MSCU-331209-1', navire: 'Caraïbes Express', armateur: 'MSC', cp: '01234', base: '4 850,50 €', transit: '310,00 €', octroi: '412,29 €', tvaDir: '412,29 €', ttc: '5 985,08 €' },
  { lig: 6, id: 'MAEU-774011-8', navire: 'Fort Sainte-Marie', armateur: 'Maersk', cp: '97110', base: '8 920,00 €', transit: '295,00 €', octroi: '758,20 €', tvaDir: '758,20 €', ttc: '10 731,40 €' },
  { lig: 7, id: 'HLCU-440912-3', navire: 'Atlantic Star', armateur: 'Hapag-Lloyd', cp: '97139', base: '15 400,00 €', transit: '340,00 €', octroi: '1 309,00 €', tvaDir: '1 309,00 €', ttc: '18 358,00 €' },
  { lig: 8, id: 'CMAU-110294-7', navire: 'Fort Fleur d\'Épée', armateur: 'CMA-CGM', cp: '06000', base: '3 100,00 €', transit: '280,00 €', octroi: '263,50 €', tvaDir: '263,50 €', ttc: '3 907,00 €' },
  { lig: 9, id: 'MSCU-889021-4', navire: 'Caraïbes Express', armateur: 'MSC', cp: '97120', base: '22 150,00 €', transit: '310,00 €', octroi: '1 882,75 €', tvaDir: '1 882,75 €', ttc: '26 225,50 €' },
  { lig: 10, id: 'MAEU-661045-2', navire: 'Fort Saint-Louis', armateur: 'Maersk', cp: '97122', base: '7 300,00 €', transit: '295,00 €', octroi: '620,50 €', tvaDir: '620,50 €', ttc: '8 836,00 €' },
  { lig: 11, id: 'CMAU-554109-9', navire: 'Fort Fleur d\'Épée', armateur: 'CMA-CGM', cp: '75001', base: '11 400,00 €', transit: '280,00 €', octroi: '969,00 €', tvaDir: '969,00 €', ttc: '13 618,00 €' },
  { lig: 12, id: 'HLCU-992014-5', navire: 'Atlantic Star', armateur: 'Hapag-Lloyd', cp: '97139', base: '18 900,00 €', transit: '340,00 €', octroi: '1 606,50 €', tvaDir: '1 606,50 €', ttc: '22 453,00 €' },
  { lig: 13, id: 'MSCU-443190-2', navire: 'Caraïbes Express', armateur: 'MSC', cp: '97110', base: '6 450,00 €', transit: '310,00 €', octroi: '548,25 €', tvaDir: '548,25 €', ttc: '7 856,50 €' },
];

interface AdminLabRow extends LabParticipantProgress {
  lab: Lab;
  student: Apprenant;
}

interface AdminLabOverviewProps {
  submissions: LabSubmission[];
  students: Apprenant[];
}

function getAdminStatusBadge(
  statut: LabParticipantStatus,
  scorePct: number
): { label: string; cls: string } {
  switch (statut) {
    case 'homologue_dsi':
      return {
        label: '✓ Homologué DSI',
        cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
      };
    case 'soumis_en_revue':
      return {
        label: 'À homologuer',
        cls: 'bg-sky-500/20 text-sky-300 border-sky-500/35',
      };
    case 'a_corriger':
      return {
        label: 'À corriger',
        cls: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
      };
    case 'en_cours':
      return {
        label: `En cours (${scorePct}%)`,
        cls: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
      };
    case 'brouillon':
      return {
        label: 'Brouillon',
        cls: 'bg-white/5 text-slate-300 border-white/15',
      };
    default:
      return {
        label: 'Non commencé (0/100)',
        cls: 'bg-white/5 text-slate-400 border-white/10',
      };
  }
}

export const AdminLabOverview: React.FC<AdminLabOverviewProps> = ({
  submissions: initialSubmissions,
  students,
}) => {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<LabSubmission[]>(initialSubmissions);
  const [selectedLabId, setSelectedLabId] = useState<string>('tp-bur-01-corinne');
  const [selectedSub, setSelectedSub] = useState<LabSubmission | null>(null);
  const [feedback, setFeedback] = useState<string>(
    'Démarche technique rigoureuse et formules conformes aux spécifications KLF. Homologation accordée.'
  );
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCorrigePanel, setShowCorrigePanel] = useState<boolean>(false);
  const [showQuai3Panel, setShowQuai3Panel] = useState<boolean>(false);

  useEffect(() => {
    setSubmissions(initialSubmissions);
  }, [initialSubmissions]);

  const studentsById = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students]
  );

  // Construction de la matrice complète des apprenants (!is_admin) croisée avec les soumissions
  const allRows: AdminLabRow[] = useMemo(() => {
    const labsToDisplay =
      selectedLabId === 'all'
        ? ALL_LABS
        : [getLabById(selectedLabId) || ALL_LABS[0]];

    const combined: AdminLabRow[] = [];
    for (const lab of labsToDisplay) {
      const participants = buildLabParticipantsProgress({
        lab,
        students,
        submissions,
        isFormateur: true,
      });

      for (const p of participants) {
        const studentObj = studentsById.get(p.apprenantId);
        if (!studentObj) continue;
        combined.push({
          ...p,
          lab,
          student: studentObj,
        });
      }
    }

    return sortLabParticipants(combined);
  }, [selectedLabId, students, submissions, studentsById]);

  const globalStats = useMemo(
    () => computeLabGlobalStats(allRows),
    [allRows]
  );

  const globalPalette = getProgressScorePalette(globalStats.averagePromoPct);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allRows.filter((row) => {
      const fullName = `${row.prenom} ${row.nomDisplay} ${row.equipe} ${row.lab.titre}`.toLowerCase();
      const matchesSearch = !q || fullName.includes(q);

      let matchesStatus = true;
      if (statusFilter === 'actifs') {
        matchesStatus = row.scorePct > 0;
      } else if (statusFilter !== 'all') {
        matchesStatus = row.statut === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [allRows, searchQuery, statusFilter]);

  const handleOpenInspect = (row: AdminLabRow) => {
    if (!row.fullSubmission) return;
    setSelectedSub({
      ...row.fullSubmission,
      apprenant: row.fullSubmission.apprenant || row.student,
      lab: row.fullSubmission.lab || row.lab,
    });
  };

  const handleHomologuer = (sub: LabSubmission) => {
    if (sub.statut === 'homologue_dsi') return;
    startTransition(async () => {
      const targetLab = getLabById(sub.lab_id) || sub.lab;
      const totalLabPoints = targetLab?.points_total || 200;
      const pointsSolde = Math.max(0, totalLabPoints - (sub.points_attribues || 0));

      const res = await homologuerLabAction({
        submissionId: sub.id,
        labId: sub.lab_id,
        studentId: sub.apprenant_id,
        pointsSolde,
        badgeId:
          targetLab?.badge_id ||
          (sub.lab_id === 'tp-bur-03-quai3-pack'
            ? 'office_collab_pilot'
            : 'corinne_savior'),
        feedback,
      });

      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === sub.id
              ? {
                  ...s,
                  statut: 'homologue_dsi',
                  points_attribues: totalLabPoints,
                  feedback_formateur: feedback,
                }
              : s
          )
        );
        setSelectedSub(null);
        router.refresh();
      } else {
        alert("Erreur lors de l'homologation : " + (res.error || 'Inconnue'));
      }
    });
  };

  const activeLabObj =
    selectedLabId === 'all' ? null : getLabById(selectedLabId) || null;

  return (
    <div className="space-y-6">

      {/* 1. Sélecteur d'atelier TP & Bandeau de jauge globale sur 100 */}
      <div className="p-5 rounded-3xl slate-glass border border-teal-500/30 bg-[#0A192F]/80 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-['Lexend']">
                Supervision des ateliers KLF Tech Lab — Jauge promo /100
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Suivi complet des {students.filter((s) => !s.is_admin).length} apprenants de la promotion (y compris non commencés à 0/100) et homologation DSI.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              aria-label="Sélectionner un atelier TP"
              className="px-3.5 py-2 rounded-xl bg-[#070F1E] border border-teal-500/35 text-xs text-white font-mono focus:outline-none focus:border-teal-400 cursor-pointer max-w-full sm:max-w-xs"
            >
              {ALL_LABS.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.id === 'tp-bur-01-corinne'
                    ? '★ TP Corinne — Manifeste maritime (tp-bur-01-corinne)'
                    : lab.id === 'tp-bur-03-quai3-pack'
                      ? 'Pack 4h Quai n°3 — Word/Excel/Docs/Sheets'
                      : `${lab.titre} (${lab.statut === 'a_venir' ? 'À venir' : lab.id})`}
                </option>
              ))}
              <option value="all">
                Tous les ateliers de ALL_LABS ({ALL_LABS.length})
              </option>
            </select>

            {activeLabObj && activeLabObj.statut === 'ouvert' && (
              <Link
                href={`/lab/${activeLabObj.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/35 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ouvrir l&apos;atelier</span>
              </Link>
            )}
          </div>
        </div>

        {/* Bandeau Jauge Globale de l'Atelier sur 100 */}
        <div className="p-4 rounded-2xl bg-[#070F1E]/90 border border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Users className="w-4 h-4 text-teal-400" />
              <span className="font-bold">
                Jauge globale de l&apos;atelier sur 100
              </span>
              {activeLabObj && (
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-400 border border-white/10">
                  {activeLabObj.jalons?.length || 5} jalons d&apos;audit
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              {globalStats.activeCount > 0 && (
                <span className="text-slate-400">
                  Moy. actifs :{' '}
                  <strong className="text-cyan-300">
                    {globalStats.averageActivePct} / 100
                  </strong>
                </span>
              )}
              <span className={`text-base font-extrabold ${globalPalette.textClass}`}>
                {globalStats.averagePromoPct} / 100
              </span>
            </div>
          </div>

          <div
            className="w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/5"
            role="progressbar"
            aria-valuenow={globalStats.averagePromoPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${globalPalette.barClass}`}
              style={{ width: `${globalStats.averagePromoPct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Participants actifs
              </span>
              <span className="text-xs font-mono font-bold text-teal-300">
                {globalStats.activeCount} / {globalStats.totalParticipants}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-200/80">
                Validés à 100/100
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {globalStats.validated100Count}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between">
              <span className="text-[11px] font-mono text-sky-200/80">
                À homologuer
              </span>
              <span className="text-xs font-mono font-bold text-sky-300">
                {globalStats.pendingReviewCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Non commencés
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                {globalStats.notStartedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Barre recherche & filtre statut */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer un apprenant, une escouade..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#070F1E] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrer par statut d'atelier"
            className="px-3 py-2 rounded-xl bg-[#070F1E] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-teal-400 font-mono cursor-pointer"
          >
            <option value="all">Tous les statuts ({allRows.length})</option>
            <option value="actifs">
              Participants actifs (&gt; 0/100) ({allRows.filter((r) => r.scorePct > 0).length})
            </option>
            <option value="soumis_en_revue">
              À homologuer ({globalStats.pendingReviewCount})
            </option>
            <option value="homologue_dsi">Homologués DSI (100/100)</option>
            <option value="en_cours">En cours</option>
            <option value="brouillon">Brouillons</option>
            <option value="a_corriger">À corriger</option>
            <option value="non_commence">
              Non commencés (0/100) ({globalStats.notStartedCount})
            </option>
          </select>
        </div>
      </div>

      {/* 2. Tableau complet des 12 apprenants avec jauge /100 */}
      <div className="rounded-2xl border border-white/10 bg-[#0A192F]/60 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-w-full [webkit-overflow-scrolling:touch]">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#112240]/90 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Technicien TIP</th>
                <th className="py-3 px-4">Atelier KLF</th>
                <th className="py-3 px-4">Progression / Score audit (/100)</th>
                <th className="py-3 px-4 text-center">Points</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center w-48 sticky right-0 z-[5] bg-[#112240] shadow-[-8px_0_16px_rgba(0,0,0,0.45)]">
                  Actions formateur
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    Aucun apprenant trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const statusBadge = getAdminStatusBadge(row.statut, row.scorePct);
                  const initials = `${row.prenom.charAt(0)}${row.nomDisplay.charAt(0)}`.toUpperCase();
                  const sub = row.fullSubmission;

                  return (
                    <tr
                      key={`${row.lab.id}-${row.apprenantId}`}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Apprenant */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-teal-400 shrink-0 text-[10px] overflow-hidden">
                            {row.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={row.avatar_url}
                                alt={`${row.prenom} ${row.nomDisplay}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 font-['Lexend']">
                              {row.prenom} {row.nomDisplay}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {row.equipe}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Atelier */}
                      <td className="py-3 px-4 max-w-[230px]">
                        <div className="font-semibold text-slate-200 line-clamp-1">
                          {row.lab.titre}
                        </div>
                        <div className="text-[10px] font-mono text-teal-400">
                          {row.lab.id.toUpperCase()}
                        </div>
                      </td>

                      {/* Progression / Score Audit sur 100 + pastilles J1..Jn */}
                      <td className="py-3 px-4">
                        <LabScoreGauge
                          compact
                          scorePct={row.scorePct}
                          jalonsValides={row.jalonsValides}
                          totalJalons={row.totalJalons}
                          milestoneStatuses={row.milestoneStatuses}
                          milestoneTitles={(row.lab.jalons || []).map((j) => j.titre)}
                        />
                      </td>

                      {/* Points */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-400 whitespace-nowrap">
                        {row.pointsAttribues} pts
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4 text-center font-mono whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.cls}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions sticky */}
                      <td className="py-3 px-4 text-center sticky right-0 z-[5] bg-[#0B1B34] shadow-[-8px_0_16px_rgba(0,0,0,0.45)]">
                        {sub ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenInspect(row)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
                              title="Inspecter le carnet et les réponses"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspecter</span>
                            </button>

                            <a
                              href={`/api/lab/export-pdf?labId=${row.lab.id}&studentId=${row.apprenantId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all"
                              title="Télécharger le compte-rendu A4 Gotenberg"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-500">
                            En attente de dépôt
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Cartes Référentiel & Corrigé Formateur DSI */}

      {/* Carte Référentiel & Corrigé Formateur DSI — Séance 10/11 Pack 4h Quai n°3 */}
      <div className="p-5 rounded-3xl slate-glass border border-amber-500/35 bg-amber-950/10 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 shadow-md">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white font-['Lexend']">
                  Référentiel &amp; Corrigé Formateur DSI — Pack 4h Quai n°3 (<code>tp-bur-03-quai3-pack</code>)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  Séance 10/11 • Word + Excel + Docs + Sheets
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Double corrigé DSI (Tableur 100 % formules OpenXML vives + Guide Caristes Word/Docs aux normes avec Styles, saut de page et mini-tableau).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/api/admin/lab/download-corrige?labId=tp-bur-03-quai3-pack&part=xlsx"
              download="KLF_Palette_Quai3_CORRIGE_DSI_101126.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all active:scale-95 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Corrigé Tableur (.xlsx)</span>
            </a>

            <a
              href="/api/admin/lab/download-corrige?labId=tp-bur-03-quai3-pack&part=docx"
              download="KLF_Guide_Caristes_CORRIGE_DSI_101126.docx"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all active:scale-95 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Corrigé Guide (.docx)</span>
            </a>

            <button
              type="button"
              onClick={() => setShowQuai3Panel(!showQuai3Panel)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 transition-all active:scale-95 cursor-pointer"
            >
              {showQuai3Panel ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showQuai3Panel ? 'Masquer formules Quai n°3' : 'Voir formules & chiffres clés'}</span>
            </button>
          </div>
        </div>

        {showQuai3Panel && (
          <div className="pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#070F1E] border border-white/5 space-y-1">
              <div className="text-emerald-300 font-bold text-[11px]">Col G &amp; J • Poids &amp; TVA bloquée ($)</div>
              <div className="text-[11px] text-amber-300">=E4*F4 | =I4*$J$2 | =I4+J4</div>
            </div>
            <div className="p-3 rounded-xl bg-[#070F1E] border border-white/5 space-y-1">
              <div className="text-emerald-300 font-bold text-[11px]">Col H • Alerte 2 500 kg ($H$2)</div>
              <div className="text-[11px] text-amber-300">=SI(G4&gt;$H$2; &quot;SURCHARGE - 2 PASSAGES&quot;; &quot;OK CHARIOT&quot;)</div>
            </div>
            <div className="p-3 rounded-xl bg-[#070F1E] border border-white/5 space-y-1">
              <div className="text-emerald-300 font-bold text-[11px]">Col D • Liaison sans #N/A</div>
              <div className="text-[11px] text-amber-300">=SIERREUR(RECHERCHEV(SUPPRESPACE(C4);Zones_Quais!$A$3:$C$6;2;FAUX);&quot;Zone inconnue&quot;)</div>
            </div>
            <div className="p-3 rounded-xl bg-[#070F1E] border border-white/5 space-y-1 md:col-span-2 lg:col-span-3">
              <div className="text-sky-300 font-bold text-[11px]">Synthèse B18:B23 (Chiffres de contrôle exacts)</div>
              <div className="text-[11px] text-slate-200">
                Poids Total = 26 065 kg | Moyenne = 2 172,08 kg | Max = 3 600 kg | Min = 600 kg | Surcharges (=NB.SI) = 4 palettes | Total TTC = 17 202,68 €
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Carte Référentiel & Corrigé Formateur DSI (Atelier Corinne) */}
      <div className="p-5 rounded-3xl slate-glass border border-teal-500/30 bg-teal-950/15 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 mt-0.5 shadow-md shadow-teal-950/40">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white font-['Lexend']">
                  Référentiel &amp; Corrigé Formateur DSI — Atelier Corinne (<code>tp-bur-01-corinne</code>)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                  Officiel DSI • 100% Validé (5/5 jalons)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Sauvetage du manifeste d&apos;arrivages maritimes de Corinne &amp; Fiscalité Antilles (Frais de transit, Octroi de mer 8,5%, TVA 8,5%, Total TTC).
              </p>
            </div>
          </div>

          {/* 3 boutons d'action rapide */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/api/admin/lab/download-corrige?labId=tp-bur-01-corinne"
              download="KLF_Manifeste_Arrivages_Corinne_CORRIGE_DSI.xlsx"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all active:scale-95 shadow-md"
              title="Télécharger le classeur Excel corrigé officiel avec 100% de formules OpenXML actives (.f)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le CORRIGÉ DSI (.xlsx)</span>
            </a>

            <a
              href="/api/lab/download-sample?labId=tp-bur-01-corinne"
              download="KLF_Manifeste_Arrivages_Corinne_BRUT.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
              title="Télécharger le classeur élève brut tel qu'attribué aux stagiaires"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Classeur BRUT élève (.xlsx)</span>
            </a>

            <button
              type="button"
              onClick={() => setShowCorrigePanel(!showCorrigePanel)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all active:scale-95 cursor-pointer"
            >
              {showCorrigePanel ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showCorrigePanel ? 'Masquer le corrigé détaillé' : 'Consulter le corrigé détaillé en direct'}</span>
              {showCorrigePanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Panneau interactif du corrigé détaillé */}
        {showCorrigePanel && (
          <div className="pt-4 border-t border-white/10 space-y-5 animate-in fade-in duration-200">
            {/* BLOC A : Les 5 Formules & Manipulations attendues */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-300 font-mono uppercase tracking-wider">
                <span>Bloc A • Les 5 formules et manipulations attendues (Jalons 1 à 5)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#070F1E] border border-white/5 space-y-1">
                  <div className="text-teal-300 font-bold text-[11px]">Jalon 1 • Normalisation Codes Postaux (Col E)</div>
                  <p className="text-[11px] text-slate-300 font-sans">
                    Format texte préfixé d&apos;une apostrophe (<code>&apos;01234</code>, <code>&apos;06000</code>), format personnalisé <code>00000</code> ou formule <code>=TEXTE(E4; &quot;00000&quot;)</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#070F1E] border border-white/5 space-y-1">
                  <div className="text-teal-300 font-bold text-[11px]">Jalon 2 • Frais de Transit &amp; Anti-#N/A (Col G)</div>
                  <div className="text-[10px] text-emerald-300 bg-white/5 p-1.5 rounded border border-white/5 break-all">
                    =SIERREUR(RECHERCHEV(SUPPRESPACE(C4); Tarifs_Transit!$A$3:$B$6; 2; FAUX); 0)
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    SUPPRESPACE nettoie les espaces parasites de fin; SIERREUR sécurise la correspondance.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#070F1E] border border-white/5 space-y-1">
                  <div className="text-teal-300 font-bold text-[11px]">Jalon 3 • Octroi de Mer 8,5% (Col H)</div>
                  <div className="text-[10px] text-emerald-300 bg-white/5 p-1.5 rounded border border-white/5 break-all">
                    =F4*$H$2
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Verrouillage absolu de la cellule taux en H2 via le raccourci F4.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#070F1E] border border-white/5 space-y-1">
                  <div className="text-teal-300 font-bold text-[11px]">Jalon 4 • TVA Locale 8,5% (Col I)</div>
                  <div className="text-[10px] text-emerald-300 bg-white/5 p-1.5 rounded border border-white/5 break-all">
                    =F4*$I$2 <span className="text-slate-400">ou</span> =(F4+H4)*$I$2
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Calcul direct sur Base HT ou assiette douanière Guadeloupe acceptée.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#070F1E] border border-white/5 space-y-1 md:col-span-2 lg:col-span-2">
                  <div className="text-teal-300 font-bold text-[11px]">Jalon 5 • Total TTC (Col J), Totaux L14 &amp; Volets figés</div>
                  <div className="text-[10px] text-emerald-300 bg-white/5 p-1.5 rounded border border-white/5 break-all">
                    Col J : =F4+G4+H4+I4 (ou =SOMME(F4:I4)) | Totaux L14 : =SOMME(F4:F13) à =SOMME(J4:J13)
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Menu <em>Affichage &gt; Figer les volets</em> appliqué sous la ligne 3 pour maintenir visibles les en-têtes lors du défilement.
                  </p>
                </div>
              </div>
            </div>

            {/* BLOC B : Tableau récapitulatif des 10 conteneurs + Ligne 14 TOTAL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 font-mono uppercase tracking-wider">
                  Bloc B • Valeurs numériques exactes attendues ligne par ligne
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  10 conteneurs + Ligne 14 Total
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#070F1E]/90 max-w-full">
                <table className="w-full text-left border-collapse text-[11px] font-mono min-w-[780px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0D1F38] text-slate-400 uppercase text-[10px]">
                      <th className="py-2 px-3">Lig.</th>
                      <th className="py-2 px-3">Conteneur</th>
                      <th className="py-2 px-3">Armateur</th>
                      <th className="py-2 px-3 text-center">CP Corrigé</th>
                      <th className="py-2 px-3 text-right">Base HT</th>
                      <th className="py-2 px-3 text-right">Transit (€)</th>
                      <th className="py-2 px-3 text-right">Octroi 8,5%</th>
                      <th className="py-2 px-3 text-right">TVA 8,5%</th>
                      <th className="py-2 px-3 text-right text-teal-300 font-bold">Total TTC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {CORINNE_CONTAINERS_CORRIGE.map((c) => (
                      <tr key={c.lig} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 text-slate-500">{c.lig}</td>
                        <td className="py-2 px-3 text-white font-semibold">{c.id}</td>
                        <td className="py-2 px-3 text-slate-300">{c.armateur}</td>
                        <td className="py-2 px-3 text-center text-amber-300 font-bold">{c.cp}</td>
                        <td className="py-2 px-3 text-right text-slate-200">{c.base}</td>
                        <td className="py-2 px-3 text-right text-teal-400">{c.transit}</td>
                        <td className="py-2 px-3 text-right text-slate-200">{c.octroi}</td>
                        <td className="py-2 px-3 text-right text-slate-200">{c.tvaDir}</td>
                        <td className="py-2 px-3 text-right font-bold text-teal-300">{c.ttc}</td>
                      </tr>
                    ))}
                    {/* Ligne 14 TOTAL */}
                    <tr className="bg-teal-500/10 font-bold border-t-2 border-teal-500/30 text-white">
                      <td className="py-2.5 px-3 text-teal-300 font-bold">14</td>
                      <td colSpan={3} className="py-2.5 px-3 tracking-wider text-teal-200">
                        TOTAL DU MANIFESTE (=SOMME)
                      </td>
                      <td className="py-2.5 px-3 text-right">110 970,50 €</td>
                      <td className="py-2.5 px-3 text-right text-teal-300">3 040,00 €</td>
                      <td className="py-2.5 px-3 text-right text-amber-300">9 432,49 €</td>
                      <td className="py-2.5 px-3 text-right text-amber-300">9 432,49 €</td>
                      <td className="py-2.5 px-3 text-right text-emerald-300 text-xs">132 875,48 €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-[10px] text-slate-400 font-mono italic">
                * Note sur la TVA : Si l&apos;apprenant applique l&apos;assiette douanière complète Guadeloupe <code>=(Base HT + Octroi)*8,5%</code>, le total TVA s&apos;élève à 10 234,25 € et le Total TTC à 133 677,24 € (les deux approches sont validées à 100% par le moteur d&apos;auto-audit).
              </div>
            </div>

            {/* BLOC C : Corrigé type du Carnet de Laboratoire Réflexif */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-300 font-mono uppercase tracking-wider">
                <span>Bloc C • Corrigé type du carnet de laboratoire réflexif (Rédactionnel attendu)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#070F1E] border border-white/5 space-y-1.5">
                  <div className="text-teal-300 font-bold text-[11px] font-['Lexend']">
                    1. Démarche technique adoptée (au « Je »)
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    « J&apos;ai débuté par le diagnostic du classeur corrompu. En premier lieu, j&apos;ai normalisé la colonne des codes postaux (Col E) en appliquant le format texte pour restaurer le zéro initial tronqué sur les communes 01234 et 06000. Ensuite, j&apos;ai résolu l&apos;erreur #N/A sur les frais de transit (Col G) en combinant SUPPRESPACE(C4) pour éliminer les espaces parasites des noms d&apos;armateurs et SIERREUR pour sécuriser la formule de recherche. Pour la fiscalité locale Guadeloupe, j&apos;ai automatisé l&apos;Octroi de mer 8,5 % (=F4*$H$2) et la TVA 8,5 % (=F4*$I$2) avec verrouillage absolu F4 de la ligne d&apos;en-tête, puis calculé le Total TTC (=F4+G4+H4+I4). Enfin, j&apos;ai consolidé les totaux par SOMME en ligne 14 et figé les volets sous la ligne 3 pour garantir une consultation ergonomique lors du défilement. »
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070F1E] border border-white/5 space-y-1.5">
                  <div className="text-amber-300 font-bold text-[11px] font-['Lexend']">
                    2. Difficultés rencontrées &amp; Contournement
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    « La principale difficulté résidait dans l&apos;erreur invisible #N/A causée par des espaces de fin dans le texte des armateurs (ex: &apos;CMA-CGM &apos; vs &apos;CMA-CGM&apos;). Un simple RECHERCHEV échouait. J&apos;ai utilisé SUPPRESPACE() pour nettoyer la chaîne avant la recherche matricielle. J&apos;ai également veillé à bloquer les cellules de taux ($H$2, $I$2) avec le signe $ pour éviter le décalage des références lors de l&apos;étirement vers le bas. »
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070F1E] border border-white/5 space-y-1.5">
                  <div className="text-emerald-300 font-bold text-[11px] font-['Lexend']">
                    3. Enseignements DSI &amp; Bonnes pratiques
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    « En production d&apos;entreprise, les données importées comportent fréquemment des anomalies de saisie (zéros tronqués, espaces invisibles). La standardisation systématique des types de données et l&apos;encapsulation préventive des formules dans des fonctions de contrôle (SUPPRESPACE, SIERREUR) garantissent l&apos;intégrité des tableaux de bord financiers et évitent les ruptures de traitement lors des clôtures douanières. »
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal d'inspection & d'homologation formateur */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0A192F] border border-white/15 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Lexend']">
                    Homologation d&apos;Atelier TP • David JACQUA
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Stagiaire : {selectedSub.apprenant?.prenom} {selectedSub.apprenant?.nom} ({selectedSub.lab_id})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {/* Détails de l'audit */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Conformité technique calculée :</span>
                <span className="text-emerald-400 font-bold">
                  {selectedSub.score_technique_pct}% ({selectedSub.jalons_valides}/
                  {getLabById(selectedSub.lab_id)?.jalons?.length || 5} jalons)
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Points actuels attribués :</span>
                <span className="text-amber-400 font-bold">
                  {selectedSub.points_attribues} pts /{' '}
                  {getLabById(selectedSub.lab_id)?.points_total || 200}
                </span>
              </div>
            </div>

            {/* Réponses rédigées par l'apprenant */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-300 font-mono">1. Démarche technique :</span>
                <div className="mt-1 p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-slate-200 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {selectedSub.reponse_demarche || 'Aucune démarche rédigée.'}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 font-mono">2. Difficultés & Contournement :</span>
                <div className="mt-1 p-2.5 rounded-lg bg-black/40 border border-white/10 font-mono text-slate-200">
                  {selectedSub.reponse_difficultes || 'Non renseigné.'}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 font-mono">3. Enseignements réflexifs :</span>
                <div className="mt-1 p-2.5 rounded-lg bg-black/40 border border-white/10 font-mono text-slate-200">
                  {selectedSub.reponse_enseignements || 'Non renseigné.'}
                </div>
              </div>
            </div>

            {/* Formulaire de validation formateur */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Avis & Visa formateur DSI :</span>
                <span className="text-[10px] text-amber-400 font-mono">+100 pts de solde + Trophée Sauveur Corinne</span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#070F1E] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Actions modal */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
              >
                Fermer
              </button>
              {selectedSub.statut === 'homologue_dsi' ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Déjà homologué DSI</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleHomologuer(selectedSub)}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {isPending
                      ? 'Homologation...'
                      : `Homologuer (+${Math.max(
                          0,
                          (getLabById(selectedSub.lab_id)?.points_total || 200) -
                            (selectedSub.points_attribues || 0)
                        )} pts & Badge KLF)`}
                  </span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
