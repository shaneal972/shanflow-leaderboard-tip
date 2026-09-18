import { supabase } from '../../supabase/client';
import { supabaseServer } from '../../supabase/server';
import { 
  Apprenant, 
  Badge, 
  LeaderboardApprenant, 
  TicketKLF, 
  DPSuivi,
  Quiz,
  QuizQuestion,
  QuizOption,
  QuizSubmission,
  QuizWithStats,
  TicketResolution
} from '@/types/tip';
import { 
  MOCK_APPRENANTS, 
  MOCK_BADGES, 
  MOCK_TICKETS, 
  MOCK_ACHIEVEMENTS, 
  MOCK_DP_SUIVI, 
  getPublicLeaderboard 
} from '@/data/mockData';

export { supabase, supabaseServer };

/**
 * Récupère le classement public pseudo-anonymisé (RGPD).
 * Tente d'abord la vue sécurisée tip.v_leaderboard_public, sinon bascule sur le mock enrichi.
 */
export async function getLeaderboardData(): Promise<LeaderboardApprenant[]> {
  try {
    const { data, error } = await supabase
      .from('v_leaderboard_public')
      .select('*');

    if (error || !data || data.length === 0) {
      return getPublicLeaderboard();
    }

    // Récupération du compte de badges pour chaque apprenant
    const { data: achievements } = await supabase
      .from('sf_achievements')
      .select('apprenant_id, badge_id');

    const badgeCounts: Record<string, number> = {};
    if (achievements) {
      achievements.forEach((ach) => {
        badgeCounts[ach.apprenant_id] = (badgeCounts[ach.apprenant_id] || 0) + 1;
      });
    }

    return data.map((item, index) => ({
      ...item,
      rank: index + 1,
      badges_count: badgeCounts[item.id] || 0,
    }));
  } catch {
    return getPublicLeaderboard();
  }
}

/**
 * Récupère le profil complet d'un apprenant pour son passeport personnel.
 */
export async function getApprenantById(id: string): Promise<Apprenant | null> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_apprenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      const mock = MOCK_APPRENANTS.find((a) => a.id === id);
      return mock || null;
    }

    return data;
  } catch {
    const mock = MOCK_APPRENANTS.find((a) => a.id === id);
    return mock || null;
  }
}

/**
 * Récupère tous les badges avec le statut débloqué pour un apprenant donné.
 */
export async function getBadgesWithStatus(apprenantId: string): Promise<Badge[]> {
  try {
    const { data: badgesData, error: badgesError } = await supabase
      .from('sf_badges')
      .select('*')
      .order('points_requis', { ascending: true });

    const allBadges = (!badgesError && badgesData && badgesData.length > 0) 
      ? badgesData 
      : MOCK_BADGES;

    const { data: achievements, error: achError } = await supabase
      .from('sf_achievements')
      .select('badge_id, obtenu_le')
      .eq('apprenant_id', apprenantId);

    const unlockedMap: Record<string, string> = {};
    if (!achError && achievements) {
      achievements.forEach((ach) => {
        unlockedMap[ach.badge_id] = ach.obtenu_le;
      });
    } else {
      const mockAch = MOCK_ACHIEVEMENTS[apprenantId] || [];
      mockAch.forEach((badgeId) => {
        unlockedMap[badgeId] = new Date().toISOString();
      });
    }

    return allBadges.map((badge) => ({
      ...badge,
      unlocked: !!unlockedMap[badge.id],
      obtenu_le: unlockedMap[badge.id],
    }));
  } catch {
    const mockAch = MOCK_ACHIEVEMENTS[apprenantId] || [];
    return MOCK_BADGES.map((b) => ({
      ...b,
      unlocked: mockAch.includes(b.id),
      obtenu_le: mockAch.includes(b.id) ? new Date().toISOString() : undefined,
    }));
  }
}

/**
 * Récupère les tickets du Helpdesk KLF.
 */
export async function getTicketsData(): Promise<TicketKLF[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_tickets_klf')
      .select('*')
      .order('urgence', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_TICKETS;
    }

    return data;
  } catch {
    return MOCK_TICKETS;
  }
}

/**
 * Récupère toutes les résolutions de tickets pour un apprenant donné.
 */
export async function getTicketResolutionsForStudent(studentId: string): Promise<TicketResolution[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_ticket_resolutions')
      .select('*')
      .eq('apprenant_id', studentId)
      .order('soumis_le', { ascending: false });

    if (error || !data) return [];
    return data as TicketResolution[];
  } catch {
    return [];
  }
}

/**
 * Récupère l'ensemble des résolutions de tickets avec jointures pour le cockpit formateur (/admin).
 */
export async function getAllTicketResolutionsAdmin(): Promise<TicketResolution[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_ticket_resolutions')
      .select(`
        *,
        apprenant:sf_apprenants(id, nom, prenom, equipe, points_total),
        ticket:sf_tickets_klf(id, titre, service, demandeur, points_valeur, urgence)
      `)
      .order('soumis_le', { ascending: false });

    if (error || !data) return [];
    return data as unknown as TicketResolution[];
  } catch {
    return [];
  }
}

/**
 * Récupère le suivi DP REAC d'un apprenant.
 */
export async function getDPSuiviByApprenant(apprenantId: string): Promise<DPSuivi> {
  try {
    const { data, error } = await supabase
      .from('sf_dp_suivi')
      .select('*')
      .eq('apprenant_id', apprenantId)
      .single();

    if (error || !data) {
      return MOCK_DP_SUIVI[apprenantId] || {
        apprenant_id: apprenantId,
        rubrique_1: false,
        rubrique_2: false,
        rubrique_3: false,
        rubrique_4: false,
        rubrique_5: false,
        statut_dp: 'brouillon',
      };
    }

    return data;
  } catch {
    return MOCK_DP_SUIVI[apprenantId] || {
      apprenant_id: apprenantId,
      rubrique_1: false,
      rubrique_2: false,
      rubrique_3: false,
      rubrique_4: false,
      rubrique_5: false,
      statut_dp: 'brouillon',
    };
  }
}

/**
 * Récupère tous les apprenants avec identité complète pour l'administration.
 */
export async function getAllApprenantsAdmin(): Promise<Apprenant[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_apprenants')
      .select('*')
      .order('points_total', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_APPRENANTS;
    }
    return data;
  } catch {
    return MOCK_APPRENANTS;
  }
}

/**
 * Récupère tous les badges pour le cockpit d'administration.
 */
export async function getAllBadgesAdmin(): Promise<Badge[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_badges')
      .select('*')
      .order('points_requis', { ascending: true });

    if (error || !data || data.length === 0) {
      return MOCK_BADGES;
    }
    return data;
  } catch {
    return MOCK_BADGES;
  }
}

/**
 * Récupère toutes les liaisons apprenant-badges (achievements).
 */
export async function getAllAchievementsAdmin(): Promise<{ apprenant_id: string; badge_id: string; obtenu_le?: string }[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_achievements')
      .select('apprenant_id, badge_id, obtenu_le');

    if (error || !data) {
      const mockList: { apprenant_id: string; badge_id: string; obtenu_le?: string }[] = [];
      Object.entries(MOCK_ACHIEVEMENTS).forEach(([apprenantId, badgeIds]) => {
        badgeIds.forEach((badgeId) => {
          mockList.push({ apprenant_id: apprenantId, badge_id: badgeId, obtenu_le: new Date().toISOString() });
        });
      });
      return mockList;
    }
    return data;
  } catch {
    const mockList: { apprenant_id: string; badge_id: string; obtenu_le?: string }[] = [];
    Object.entries(MOCK_ACHIEVEMENTS).forEach(([apprenantId, badgeIds]) => {
      badgeIds.forEach((badgeId) => {
        mockList.push({ apprenant_id: apprenantId, badge_id: badgeId, obtenu_le: new Date().toISOString() });
      });
    });
    return mockList;
  }
}

/**
 * Récupère l'ensemble des fiches de suivi DP pour la promotion.
 */
export async function getAllDPSuiviAdmin(): Promise<DPSuivi[]> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_dp_suivi')
      .select('*');

    if (error || !data || data.length === 0) {
      return Object.values(MOCK_DP_SUIVI);
    }
    return data;
  } catch {
    return Object.values(MOCK_DP_SUIVI);
  }
}

// =========================================================================
// MODULE KLF QUIZ ENGINE & ANTI-CHEAT SYSTEM
// =========================================================================

/**
 * Récupère un Quiz pour la salle d'examen en mode ÉPREUVE (Anti-Triche Strict).
 * Si la correction n'est pas publiée, les colonnes is_correct et dsi_explanation
 * sont EXCLUES de la réponse pour empêcher toute triche côté client.
 */
export async function getQuizForExam(quizId: string): Promise<{ quiz: Quiz; questions: QuizQuestion[] } | null> {
  try {
    const { data: quiz, error: qErr } = await supabaseServer
      .from('sf_quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (qErr || !quiz) return null;

    const { data: questions, error: questErr } = await supabaseServer
      .from('sf_quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('ordre', { ascending: true });

    if (questErr || !questions) return { quiz, questions: [] };

    const questionIds = questions.map(q => q.id);

    // Si la correction n'est PAS publiée, on masque STRICTEMENT is_correct et dsi_explanation
    const isCorrectionPublished = quiz.statut === 'correction_publiee';
    const selectFields = isCorrectionPublished
      ? 'id, question_id, lettre, texte, is_correct, dsi_explanation'
      : 'id, question_id, lettre, texte';

    const { data: options } = await supabaseServer
      .from('sf_quiz_options')
      .select(selectFields)
      .in('question_id', questionIds)
      .order('lettre', { ascending: true });

    const optionsByQuestion: Record<string, QuizOption[]> = {};
    (options || []).forEach((opt: any) => {
      if (!optionsByQuestion[opt.question_id]) {
        optionsByQuestion[opt.question_id] = [];
      }
      optionsByQuestion[opt.question_id].push(opt);
    });

    const fullQuestions: QuizQuestion[] = questions.map(q => ({
      ...q,
      options: optionsByQuestion[q.id] || []
    }));

    return { quiz, questions: fullQuestions };
  } catch (error) {
    console.error('Erreur getQuizForExam:', error);
    return null;
  }
}

/**
 * Récupère le corrigé complet d'un quiz avec explications DSI pour un apprenant.
 * Uniquement autorisé si quiz.statut === 'correction_publiee'.
 */
export async function getQuizWithCorrection(quizId: string, apprenantId: string): Promise<{
  quiz: Quiz;
  questions: QuizQuestion[];
  submission: QuizSubmission | null;
} | null> {
  try {
    const { data: quiz } = await supabaseServer
      .from('sf_quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (!quiz) return null;

    // Récupérer la soumission de l'apprenant
    const { data: submission } = await supabaseServer
      .from('sf_quiz_submissions')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('apprenant_id', apprenantId)
      .maybeSingle();

    const { data: questions } = await supabaseServer
      .from('sf_quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('ordre', { ascending: true });

    if (!questions) return { quiz, questions: [], submission };

    const questionIds = questions.map(q => q.id);

    // Toujours les champs complets si on demande la correction
    const { data: options } = await supabaseServer
      .from('sf_quiz_options')
      .select('id, question_id, lettre, texte, is_correct, dsi_explanation')
      .in('question_id', questionIds)
      .order('lettre', { ascending: true });

    const optionsByQuestion: Record<string, QuizOption[]> = {};
    (options || []).forEach((opt: any) => {
      if (!optionsByQuestion[opt.question_id]) {
        optionsByQuestion[opt.question_id] = [];
      }
      optionsByQuestion[opt.question_id].push(opt);
    });

    const fullQuestions: QuizQuestion[] = questions.map(q => ({
      ...q,
      options: optionsByQuestion[q.id] || []
    }));

    return { quiz, questions: fullQuestions, submission };
  } catch (error) {
    console.error('Erreur getQuizWithCorrection:', error);
    return null;
  }
}

/**
 * Récupère la soumission d'un élève pour un quiz donné.
 */
export async function getSubmissionForStudent(quizId: string, apprenantId: string): Promise<QuizSubmission | null> {
  try {
    const { data, error } = await supabaseServer
      .from('sf_quiz_submissions')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('apprenant_id', apprenantId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Récupère tous les quiz avec statistiques agrégées pour l'espace administration.
 */
export async function getAllQuizzesAdmin(): Promise<QuizWithStats[]> {
  try {
    const { data: quizzes, error } = await supabaseServer
      .from('sf_quizzes')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !quizzes) return [];

    // Récupérer le nombre total d'apprenants
    const { count: studentCount } = await supabaseServer
      .from('sf_apprenants')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', false);

    // Récupérer les questions pour chaque quiz
    const { data: questions } = await supabaseServer
      .from('sf_quiz_questions')
      .select('quiz_id');

    const questionCountMap: Record<string, number> = {};
    (questions || []).forEach(q => {
      questionCountMap[q.quiz_id] = (questionCountMap[q.quiz_id] || 0) + 1;
    });

    // Récupérer les soumissions pour calculer la moyenne et le taux de participation
    const { data: submissions } = await supabaseServer
      .from('sf_quiz_submissions')
      .select('*');

    const submissionMap: Record<string, { total: number; sumPercent: number; submissions: QuizSubmission[] }> = {};
    (submissions || []).forEach(s => {
      if (!submissionMap[s.quiz_id]) {
        submissionMap[s.quiz_id] = { total: 0, sumPercent: 0, submissions: [] };
      }
      submissionMap[s.quiz_id].total += 1;
      submissionMap[s.quiz_id].sumPercent += (s.score_pourcentage || 0);
      submissionMap[s.quiz_id].submissions.push(s as any);
    });

    return quizzes.map(q => {
      const stats = submissionMap[q.id] || { total: 0, sumPercent: 0, submissions: [] };
      const avgScore = stats.total > 0 ? Math.round(stats.sumPercent / stats.total) : 0;
      return {
        ...q,
        questions_count: questionCountMap[q.id] || 0,
        total_submissions: stats.total,
        total_students: studentCount || 9,
        average_score: avgScore,
        submissions: stats.submissions
      };
    });
  } catch (error) {
    console.error('Erreur getAllQuizzesAdmin:', error);
    return [];
  }
}

/**
 * Récupère le cockpit de supervision en direct d'un quiz spécifique :
 * - Liste des soumissions élèves avec nom/avatar/statut
 * - Analyse des lacunes question par question
 */
export async function getQuizSupervisionAdmin(quizId: string) {
  try {
    const { data: quiz } = await supabaseServer
      .from('sf_quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (!quiz) return null;

    const [studentsRes, submissionsRes, questionsRes, optionsRes] = await Promise.all([
      supabaseServer.from('sf_apprenants').select('*').eq('is_admin', false).order('nom', { ascending: true }),
      supabaseServer.from('sf_quiz_submissions').select('*').eq('quiz_id', quizId),
      supabaseServer.from('sf_quiz_questions').select('*').eq('quiz_id', quizId).order('ordre', { ascending: true }),
      supabaseServer.from('sf_quiz_options').select('*')
    ]);

    const students: Apprenant[] = studentsRes.data || [];
    const submissions: QuizSubmission[] = submissionsRes.data || [];
    const questions: QuizQuestion[] = questionsRes.data || [];
    const options: QuizOption[] = optionsRes.data || [];

    const correctOptionsMap = new Set(
      options.filter(o => o.is_correct).map(o => o.id)
    );

    // Analyse des lacunes question par question
    const questionsAnalysis = questions.map(q => {
      let failureCount = 0;
      let totalAnswers = 0;

      submissions.forEach(sub => {
        const chosenOptionId = sub.reponses_choisies?.[q.id];
        if (chosenOptionId) {
          totalAnswers += 1;
          if (!correctOptionsMap.has(chosenOptionId)) {
            failureCount += 1;
          }
        }
      });

      const failureRate = totalAnswers > 0 ? Math.round((failureCount / totalAnswers) * 100) : 0;

      return {
        questionId: q.id,
        ordre: q.ordre,
        theme: q.theme,
        enonce: q.enonce,
        failureCount,
        totalAnswers,
        failureRate
      };
    }).sort((a, b) => b.failureRate - a.failureRate);

    // Association soumissions avec apprenants
    const submissionsByStudentId: Record<string, QuizSubmission> = {};
    submissions.forEach(s => {
      submissionsByStudentId[s.apprenant_id] = s;
    });

    const studentsProgress = students.map(st => ({
      student: st,
      submission: submissionsByStudentId[st.id] || null,
      hasSubmitted: !!submissionsByStudentId[st.id]
    }));

    return {
      quiz,
      studentsProgress,
      questionsAnalysis,
      totalStudents: students.length,
      submittedCount: submissions.length
    };
  } catch (error) {
    console.error('Erreur getQuizSupervisionAdmin:', error);
    return null;
  }
}

/**
 * Récupère l'état de tous les quiz pour un apprenant (pour l'affichage dans son Passeport).
 */
export async function getApprenantQuizzesStatus(apprenantId: string): Promise<{
  quizzes: (Quiz & { submission: QuizSubmission | null })[];
}> {
  try {
    const { data: quizzes } = await supabase
      .from('sf_quizzes')
      .select('*')
      .order('created_at', { ascending: true });

    if (!quizzes) return { quizzes: [] };

    const { data: submissions } = await supabase
      .from('sf_quiz_submissions')
      .select('*')
      .eq('apprenant_id', apprenantId);

    const subMap: Record<string, QuizSubmission> = {};
    (submissions || []).forEach(s => {
      subMap[s.quiz_id] = s;
    });

    const enriched = quizzes.map(q => ({
      ...q,
      submission: subMap[q.id] || null
    }));

    return { quizzes: enriched };
  } catch {
    return { quizzes: [] };
  }
}
