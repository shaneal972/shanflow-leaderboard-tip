import {
  Apprenant,
  DPSuivi,
  LabSubmission,
  QuizSubmission,
  QuizWithStats,
  TicketKLF,
  TicketResolution,
} from '@/types/tip';

export const TRACKED_TICKET_CODES = ['TCK-101', 'TCK-102', 'TCK-103', 'TCK-104', 'TCK-105'] as const;

export const TRACKED_QUIZZES = [
  { id: 'quiz-p0-ran', code: 'RAN', label: 'Diagnostic RAN' },
  { id: 'quiz-p1-word-docs', code: 'WRD', label: 'Word & Docs' },
  { id: 'quiz-p1-excel-sheets', code: 'XLS', label: 'Excel & Sheets' },
  { id: 'quiz-p1-outlook-gmail', code: 'OUT', label: 'Outlook & Gmail' },
] as const;

export const CORINNE_LAB_ID = 'tp-bur-01-corinne';
export const QUAI3_LAB_ID = 'tp-bur-03-quai3-pack';
export const TOTAL_TRACKED_WORKS = 10; // 1 TP Corinne + 5 Tickets + 4 Quiz

export interface StudentTicketState {
  ticketId: string;
  shortCode: string;
  titre: string;
  resolution: TicketResolution | null;
}

export interface StudentQuizState {
  quizId: string;
  code: string;
  label: string;
  titre: string;
  submission: QuizSubmission | null;
  isFinalized: boolean;
  isCheating: boolean;
  noteSur20: number | null;
  scorePourcentage: number | null;
}

export interface Student360Row {
  student: Apprenant;
  corinneSub: LabSubmission | null;
  quai3Sub: LabSubmission | null;
  isCorinneDone: boolean;
  isCorinnePending: boolean;
  ticketsState: StudentTicketState[];
  ticketsSubmittedCount: number;
  ticketsValidatedCount: number;
  ticketsPendingCount: number;
  quizzesState: StudentQuizState[];
  quizzesFinalizedCount: number;
  quizzesValidCount: number;
  quizAverageSur20: number | null;
  dpRecord: DPSuivi | null;
  dpRubriquesCount: number;
  completedCount: number;
  progressPct: number;
  hasPendingReview: boolean;
  isBehind: boolean;
  isOnTrack: boolean;
}

export interface Promo360Kpis {
  totalLearners: number;
  avgProgressPct: number;
  corinneSubmittedCount: number;
  corinnePendingCount: number;
  ticketsHandledTotal: number;
  ticketsPossibleTotal: number;
  ticketsPendingTotal: number;
  quizCopiesTotal: number;
  quizCopiesPossibleTotal: number;
  promoQuizAvgSur20: number | null;
}

export function computeNoteSur20(scorePourcentage: number): number {
  return Math.round((scorePourcentage / 100) * 20 * 10) / 10;
}

export function buildPromo360Matrix(params: {
  students: Apprenant[];
  tickets: TicketKLF[];
  resolutions: TicketResolution[];
  quizzes: QuizWithStats[];
  labSubmissions: LabSubmission[];
  dpRecords: DPSuivi[];
}): { rows: Student360Row[]; kpis: Promo360Kpis } {
  const { students, tickets, resolutions, quizzes, labSubmissions, dpRecords } = params;

  const learners = students.filter((s) => !s.is_admin);
  const ticketMetaById = new Map(tickets.map((t) => [t.id, t]));
  const quizMetaById = new Map(quizzes.map((q) => [q.id, q]));

  const rows: Student360Row[] = learners.map((student) => {
    const corinneSub =
      labSubmissions.find((sub) => sub.lab_id === CORINNE_LAB_ID && sub.apprenant_id === student.id) ||
      null;
    const quai3Sub =
      labSubmissions.find((sub) => sub.lab_id === QUAI3_LAB_ID && sub.apprenant_id === student.id) ||
      null;

    const isCorinneDone =
      corinneSub?.statut === 'homologue_dsi' || corinneSub?.statut === 'soumis_en_revue';
    const isCorinnePending = corinneSub?.statut === 'soumis_en_revue';

    const ticketsState: StudentTicketState[] = TRACKED_TICKET_CODES.map((ticketId) => {
      const resolution =
        resolutions.find((r) => r.apprenant_id === student.id && r.ticket_id === ticketId) || null;
      const meta = ticketMetaById.get(ticketId);
      return {
        ticketId,
        shortCode: ticketId.replace('TCK-', ''),
        titre: meta?.titre || ticketId,
        resolution,
      };
    });

    const ticketsValidatedCount = ticketsState.filter((t) => t.resolution?.statut === 'valide').length;
    const ticketsPendingCount = ticketsState.filter(
      (t) => t.resolution?.statut === 'en_attente_validation'
    ).length;
    const ticketsSubmittedCount = ticketsState.filter(
      (t) =>
        t.resolution?.statut === 'valide' || t.resolution?.statut === 'en_attente_validation'
    ).length;

    const quizzesState: StudentQuizState[] = TRACKED_QUIZZES.map((qDef) => {
      const quizObj = quizMetaById.get(qDef.id);
      const submission =
        quizObj?.submissions?.find((s) => s.apprenant_id === student.id) || null;
      const isCheating = Boolean(submission?.closed_for_cheating);
      const isFinalized = Boolean(submission && (submission.closed_for_cheating || submission.submitted_at));
      const noteSur20 = isFinalized
        ? isCheating
          ? 0
          : computeNoteSur20(submission?.score_pourcentage || 0)
        : null;

      return {
        quizId: qDef.id,
        code: qDef.code,
        label: qDef.label,
        titre: quizObj?.titre || qDef.label,
        submission,
        isFinalized,
        isCheating,
        noteSur20,
        scorePourcentage: isFinalized && !isCheating ? submission?.score_pourcentage ?? 0 : null,
      };
    });

    const quizzesFinalizedCount = quizzesState.filter((q) => q.isFinalized).length;
    const quizzesValidCount = quizzesState.filter((q) => q.isFinalized && !q.isCheating).length;
    const validQuizNotes = quizzesState
      .map((q) => q.noteSur20)
      .filter((n): n is number => n !== null);
    const quizAverageSur20 =
      validQuizNotes.length > 0
        ? Math.round((validQuizNotes.reduce((acc, v) => acc + v, 0) / validQuizNotes.length) * 10) / 10
        : null;

    const dpRecord = dpRecords.find((d) => d.apprenant_id === student.id) || null;
    const dpRubriquesCount = dpRecord
      ? [
          dpRecord.rubrique_1,
          dpRecord.rubrique_2,
          dpRecord.rubrique_3,
          dpRecord.rubrique_4,
          dpRecord.rubrique_5,
        ].filter(Boolean).length
      : 0;

    const completedCount =
      (isCorinneDone ? 1 : 0) + ticketsSubmittedCount + quizzesValidCount;
    const progressPct = Math.round((completedCount / TOTAL_TRACKED_WORKS) * 100);

    const hasPendingReview = isCorinnePending || ticketsPendingCount > 0;
    const isBehind =
      !isCorinneDone || quizzesFinalizedCount < 2 || ticketsSubmittedCount === 0;
    const isOnTrack = progressPct >= 50;

    return {
      student,
      corinneSub,
      quai3Sub,
      isCorinneDone,
      isCorinnePending,
      ticketsState,
      ticketsSubmittedCount,
      ticketsValidatedCount,
      ticketsPendingCount,
      quizzesState,
      quizzesFinalizedCount,
      quizzesValidCount,
      quizAverageSur20,
      dpRecord,
      dpRubriquesCount,
      completedCount,
      progressPct,
      hasPendingReview,
      isBehind,
      isOnTrack,
    };
  });

  const totalLearners = rows.length;
  const avgProgressPct =
    totalLearners > 0
      ? Math.round(rows.reduce((sum, r) => sum + r.progressPct, 0) / totalLearners)
      : 0;

  const corinneSubmittedCount = rows.filter((r) => r.isCorinneDone).length;
  const corinnePendingCount = rows.filter((r) => r.isCorinnePending).length;

  const ticketsHandledTotal = rows.reduce((sum, r) => sum + r.ticketsSubmittedCount, 0);
  const ticketsPendingTotal = rows.reduce((sum, r) => sum + r.ticketsPendingCount, 0);

  const allFinalizedQuizNotes = rows.flatMap((r) =>
    r.quizzesState.map((q) => q.noteSur20).filter((n): n is number => n !== null)
  );
  const quizCopiesTotal = rows.reduce((sum, r) => sum + r.quizzesFinalizedCount, 0);
  const promoQuizAvgSur20 =
    allFinalizedQuizNotes.length > 0
      ? Math.round(
          (allFinalizedQuizNotes.reduce((acc, n) => acc + n, 0) / allFinalizedQuizNotes.length) * 10
        ) / 10
      : null;

  return {
    rows,
    kpis: {
      totalLearners,
      avgProgressPct,
      corinneSubmittedCount,
      corinnePendingCount,
      ticketsHandledTotal,
      ticketsPossibleTotal: totalLearners * TRACKED_TICKET_CODES.length,
      ticketsPendingTotal,
      quizCopiesTotal,
      quizCopiesPossibleTotal: totalLearners * TRACKED_QUIZZES.length,
      promoQuizAvgSur20,
    },
  };
}

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '').replace(/"/g, '""');
  return `"${str}"`;
}

function formatTicketStatusCsv(res: TicketResolution | null): string {
  if (!res) return 'Non soumis';
  if (res.statut === 'valide') return 'Validé';
  if (res.statut === 'en_attente_validation') return 'En attente';
  if (res.statut === 'a_corriger') return 'À corriger';
  return res.statut;
}

function formatLabStatusCsv(sub: LabSubmission | null): string {
  if (!sub) return 'Non commencé';
  if (sub.statut === 'homologue_dsi') return `Homologué (100% / 200p)`;
  if (sub.statut === 'soumis_en_revue')
    return `Soumis (${sub.score_technique_pct}% / ${sub.jalons_valides}/5)`;
  if (sub.statut === 'a_corriger') return `À corriger (${sub.score_technique_pct}%)`;
  return `En cours (${sub.score_technique_pct}% / ${sub.jalons_valides}/5)`;
}

export function generate360CsvContent(rows: Student360Row[]): string {
  const headers = [
    'Prénom',
    'Nom',
    'Escouade',
    'Palier',
    'Points KLF',
    'TP Corinne',
    'TCK-101',
    'TCK-102',
    'TCK-103',
    'TCK-104',
    'TCK-105',
    'Quiz RAN (/20)',
    'Quiz Word (/20)',
    'Quiz Excel (/20)',
    'Quiz Outlook (/20)',
    'Travaux (/10)',
    'Avancement Global (%)',
  ];

  const csvLines = [
    headers.map(escapeCsvCell).join(';'),
    ...rows.map((r) => {
      const tMap = new Map(r.ticketsState.map((t) => [t.ticketId, formatTicketStatusCsv(t.resolution)]));
      const qMap = new Map(
        r.quizzesState.map((q) => [
          q.quizId,
          q.isFinalized
            ? q.isCheating
              ? 'Triche (0/20)'
              : `${String(q.noteSur20).replace('.', ',')}/20`
            : 'Non passé',
        ])
      );

      return [
        r.student.prenom,
        r.student.nom,
        r.student.equipe,
        r.student.palier_actuel,
        r.student.points_total,
        formatLabStatusCsv(r.corinneSub),
        tMap.get('TCK-101') || 'Non soumis',
        tMap.get('TCK-102') || 'Non soumis',
        tMap.get('TCK-103') || 'Non soumis',
        tMap.get('TCK-104') || 'Non soumis',
        tMap.get('TCK-105') || 'Non soumis',
        qMap.get('quiz-p0-ran') || 'Non passé',
        qMap.get('quiz-p1-word-docs') || 'Non passé',
        qMap.get('quiz-p1-excel-sheets') || 'Non passé',
        qMap.get('quiz-p1-outlook-gmail') || 'Non passé',
        `${r.completedCount}/10`,
        `${r.progressPct}%`,
      ]
        .map(escapeCsvCell)
        .join(';');
    }),
  ];

  return `\uFEFF${csvLines.join('\r\n')}`;
}
