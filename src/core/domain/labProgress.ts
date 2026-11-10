import {
  Apprenant,
  Lab,
  LabAuditSummary,
  LabMilestoneStatus,
  LabParticipantProgress,
  LabParticipantStatus,
  LabSubmission,
  LabSubmissionStatus,
} from '@/types/tip';

export interface LabGlobalStats {
  totalParticipants: number;
  activeCount: number;
  validated100Count: number;
  pendingReviewCount: number;
  notStartedCount: number;
  averagePromoPct: number;
  averageActivePct: number;
}

export interface ProgressScorePalette {
  barClass: string;
  textClass: string;
  badgeClass: string;
}

/**
 * Calcule les statuts ordonnés de chaque jalon d'un atelier TP à partir d'un résumé d'audit ou d'une soumission.
 */
export function resolveLabMilestoneStatuses(
  lab: Lab,
  auditResults?: LabAuditSummary | null,
  submission?: LabSubmission | null
): LabMilestoneStatus[] {
  const jalons = lab.jalons || [];
  const totalJalons = jalons.length || 5;
  const detailsMap = new Map(
    (auditResults?.details || []).map((d) => [d.milestoneId, d.status])
  );

  if (jalons.length === 0) {
    const validCount = Math.min(
      totalJalons,
      Math.max(0, submission?.jalons_valides ?? auditResults?.validCount ?? 0)
    );
    return Array.from({ length: totalJalons }, (_, idx) =>
      idx < validCount ? 'valide' : 'non_evalue'
    );
  }

  const isFullyHomologated =
    submission?.statut === 'homologue_dsi' &&
    ((submission.score_technique_pct ?? 0) >= 100 ||
      (submission.jalons_valides ?? 0) >= totalJalons);

  return jalons.map((jalon) => {
    const explicit = detailsMap.get(jalon.id);
    if (explicit) return explicit;
    if (isFullyHomologated) return 'valide';
    return 'non_evalue';
  });
}

/**
 * Trie les apprenants par progression décroissante (scorePct décroissant, points attribués, puis nom).
 */
export function sortLabParticipants<
  T extends {
    scorePct: number;
    pointsAttribues: number;
    nomDisplay: string;
    prenom: string;
  },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (b.scorePct !== a.scorePct) {
      return b.scorePct - a.scorePct;
    }
    if (b.pointsAttribues !== a.pointsAttribues) {
      return b.pointsAttribues - a.pointsAttribues;
    }
    const nomCompare = a.nomDisplay.localeCompare(b.nomDisplay, 'fr');
    if (nomCompare !== 0) {
      return nomCompare;
    }
    return a.prenom.localeCompare(b.prenom, 'fr');
  });
}

/**
 * Construit la matrice des participants d'un atelier TP avec respect strict du RGPD côté élève.
 */
export function buildLabParticipantsProgress(params: {
  lab: Lab;
  students: Apprenant[];
  submissions: LabSubmission[];
  isFormateur: boolean;
}): LabParticipantProgress[] {
  const { lab, students, submissions, isFormateur } = params;
  const totalJalons = lab.jalons?.length || 5;

  const submissionByStudentId = new Map<string, LabSubmission>();
  for (const sub of submissions) {
    if (sub.lab_id === lab.id) {
      submissionByStudentId.set(sub.apprenant_id, sub);
    }
  }

  const learners = students.filter((s) => !s.is_admin);

  const items: LabParticipantProgress[] = learners.map((student) => {
    const sub = submissionByStudentId.get(student.id) || null;
    const rawScore = sub?.score_technique_pct ?? sub?.audit_results?.scorePct ?? 0;
    const scorePct = Math.min(100, Math.max(0, Math.round(rawScore)));
    const rawJalons = sub?.jalons_valides ?? sub?.audit_results?.validCount ?? 0;
    const jalonsValides = Math.min(totalJalons, Math.max(0, rawJalons));
    const statut: LabParticipantStatus = sub?.statut || 'non_commence';
    const nomDisplay = isFormateur
      ? student.nom
      : student.nom
        ? `${student.nom.charAt(0)}.`
        : '';

    return {
      apprenantId: student.id,
      prenom: student.prenom,
      nomDisplay,
      equipe: student.equipe || 'Promotion TIP',
      avatar_url: student.avatar_url || '',
      scorePct,
      jalonsValides,
      totalJalons,
      statut,
      pointsAttribues: sub?.points_attribues ?? 0,
      soumisLe: sub?.soumis_le ?? null,
      milestoneStatuses: resolveLabMilestoneStatuses(lab, sub?.audit_results, sub),
      fullSubmission: isFormateur ? sub : null,
    };
  });

  return sortLabParticipants(items);
}

/**
 * Calcule les indicateurs globaux sur 100 d'un atelier TP.
 */
export function computeLabGlobalStats(
  items: Pick<LabParticipantProgress, 'scorePct' | 'statut'>[]
): LabGlobalStats {
  const totalParticipants = items.length;
  const activeItems = items.filter(
    (p) => p.scorePct > 0 || p.statut !== 'non_commence'
  );
  const activeCount = activeItems.length;
  const validated100Count = items.filter((p) => p.scorePct >= 100).length;
  const pendingReviewCount = items.filter(
    (p) => p.statut === 'soumis_en_revue'
  ).length;
  const notStartedCount = items.filter(
    (p) => p.statut === 'non_commence'
  ).length;

  const averagePromoPct =
    totalParticipants > 0
      ? Math.round(
          items.reduce((sum, item) => sum + item.scorePct, 0) / totalParticipants
        )
      : 0;

  const averageActivePct =
    activeCount > 0
      ? Math.round(
          activeItems.reduce((sum, item) => sum + item.scorePct, 0) / activeCount
        )
      : 0;

  return {
    totalParticipants,
    activeCount,
    validated100Count,
    pendingReviewCount,
    notStartedCount,
    averagePromoPct,
    averageActivePct,
  };
}

/**
 * Met à jour immédiatement la progression locale d'un apprenant après un auto-audit client.
 */
export function applyLocalAuditToParticipants(
  participants: LabParticipantProgress[],
  studentId: string,
  lab: Lab,
  summary: LabAuditSummary
): LabParticipantProgress[] {
  const nextScore = Math.min(100, Math.max(0, Math.round(summary.scorePct)));
  const totalJalons = summary.milestonesCount || lab.jalons?.length || 5;
  const nextJalons = Math.min(totalJalons, Math.max(0, summary.validCount));

  const updated = participants.map((p) => {
    if (p.apprenantId !== studentId) return p;

    const nextStatut: LabParticipantStatus =
      p.statut === 'homologue_dsi'
        ? 'homologue_dsi'
        : p.statut === 'soumis_en_revue'
          ? 'soumis_en_revue'
          : 'en_cours';

    return {
      ...p,
      scorePct: nextScore,
      jalonsValides: nextJalons,
      totalJalons,
      statut: nextStatut,
      milestoneStatuses: resolveLabMilestoneStatuses(lab, summary, p.fullSubmission),
    };
  });

  return sortLabParticipants(updated);
}

/**
 * Met à jour immédiatement le statut et les points d'un apprenant après sauvegarde/soumission du carnet.
 */
export function applyLocalSubmissionStatusToParticipants(
  participants: LabParticipantProgress[],
  studentId: string,
  result: { statut: LabSubmissionStatus; pointsAttribues: number }
): LabParticipantProgress[] {
  const updated = participants.map((p) => {
    if (p.apprenantId !== studentId) return p;

    return {
      ...p,
      statut: p.statut === 'homologue_dsi' ? 'homologue_dsi' : result.statut,
      pointsAttribues: Math.max(p.pointsAttribues, result.pointsAttribues),
      soumisLe: result.statut === 'brouillon' ? p.soumisLe : new Date().toISOString(),
    };
  });

  return sortLabParticipants(updated);
}

/**
 * Retourne les classes visuelles graduées sur 100 pour les jauges d'atelier TP.
 */
export function getProgressScorePalette(scorePct: number): ProgressScorePalette {
  if (scorePct >= 100) {
    return {
      barClass: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
      textClass: 'text-emerald-300',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
    };
  }
  if (scorePct >= 60) {
    return {
      barClass: 'bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]',
      textClass: 'text-cyan-300',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
    };
  }
  if (scorePct >= 20) {
    return {
      barClass: 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
      textClass: 'text-amber-300',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
    };
  }
  return {
    barClass: 'bg-slate-600',
    textClass: 'text-slate-400',
    badgeClass: 'bg-white/5 text-slate-400 border-white/10',
  };
}
