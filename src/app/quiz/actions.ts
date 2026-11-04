'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '../../../supabase/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getActiveTechnicianId, isStudentAuthenticated } from '@/lib/studentAuth';
import { calculatePalierForPoints } from '@/core/domain/gamification';
import { evaluateQuizSubmission } from '@/core/domain/quizEvaluation';

const submitQuizSchema = z.object({
  apprenantId: z.string().uuid('Identifiant apprenant invalide.'),
  quizId: z.string().min(1, 'Identifiant du quiz requis.').max(60),
  answers: z.record(z.string()), // { [question_id]: option_id }
});

export async function submitQuizAnswersAction(data: {
  apprenantId: string;
  quizId: string;
  answers: Record<string, string>;
}) {
  const parsed = submitQuizSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données de soumission invalides.',
      details: parsed.error.flatten().fieldErrors,
    };
  }

  const { apprenantId, quizId, answers } = parsed.data;

  // Vérification stricte de session (Anti-usurpation d'identité)
  const isFormateur = await isAdminAuthenticated();
  const activeTechId = await getActiveTechnicianId();
  const isPassportAuth = await isStudentAuthenticated(apprenantId);

  if (!isFormateur && activeTechId !== apprenantId && !isPassportAuth) {
    return {
      success: false,
      error: 'Session expirée ou non autorisée. Veuillez vous connecter avec votre code PIN DSI.',
    };
  }

  try {
    // 1. Vérifier l'existence et le statut du quiz
    const { data: quiz, error: quizErr } = await supabaseServer
      .from('sf_quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizErr || !quiz) {
      return { success: false, error: 'Quiz introuvable.' };
    }

    if (quiz.statut === 'ferme') {
      return {
        success: false,
        error: "L'épreuve est actuellement fermée par le formateur. Les soumissions ne sont pas acceptées.",
      };
    }

    // 2. Vérifier s'il existe déjà une soumission scellée ou sanctionnée
    const { data: existingSub } = await supabaseServer
      .from('sf_quiz_submissions')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('apprenant_id', apprenantId)
      .maybeSingle();

    if (existingSub?.closed_for_cheating) {
      return {
        success: false,
        error: 'Cette copie a été clôturée d’office suite à 3 infractions au protocole Sentinel Lock.',
      };
    }

    if (existingSub?.submitted_at && !isFormateur) {
      return {
        success: false,
        error: 'Votre copie a déjà été scellée et ne peut plus être modifiée.',
      };
    }

    // 3. Enregistrer la copie scellée
    // Si la correction est déjà publiée (ex: rattrapage autorisé), calcul immédiat via le Domaine pur
    let scoreObtenu = 0;
    let scorePourcentage = 0;
    let isValidated = false;
    let pointsAttribues = existingSub?.points_attribues || 0;

    if (quiz.statut === 'correction_publiee') {
      const { data: questions } = await supabaseServer
        .from('sf_quiz_questions')
        .select('id, points')
        .eq('quiz_id', quizId);

      const questionIds = (questions || []).map((q) => q.id);
      const { data: options } = await supabaseServer
        .from('sf_quiz_options')
        .select('id, question_id, is_correct')
        .in('question_id', questionIds.length > 0 ? questionIds : ['00000000-0000-0000-0000-000000000000']);

      const correctSet = new Set((options || []).filter((o) => o.is_correct).map((o) => o.id));

      const outcome = evaluateQuizSubmission({
        questions: questions || [],
        correctOptionIds: correctSet,
        answers,
        seuilValidation: quiz.seuil_validation || 75,
        pointsRecompense: quiz.points_recompense || 200,
        closedForCheating: false,
      });

      scoreObtenu = outcome.scoreObtenu;
      scorePourcentage = outcome.scorePourcentage;
      isValidated = outcome.isValidated;

      if (isValidated && (existingSub?.points_attribues || 0) === 0) {
        pointsAttribues = outcome.pointsAttribues;

        // Créditer les points ET recalculer le palier de l'apprenant
        const { data: appData } = await supabaseServer
          .from('sf_apprenants')
          .select('points_total, is_admin, palier_actuel')
          .eq('id', apprenantId)
          .single();

        if (appData) {
          const newPointsTotal = (appData.points_total || 0) + pointsAttribues;
          const newPalier = calculatePalierForPoints(newPointsTotal, {
            isAdmin: appData.is_admin,
            currentPalier: appData.palier_actuel,
          });
          await supabaseServer
            .from('sf_apprenants')
            .update({
              points_total: newPointsTotal,
              palier_actuel: newPalier,
            })
            .eq('id', apprenantId);
        }

        // Débloquer le badge si configuré
        if (quiz.badge_recompense) {
          await supabaseServer
            .from('sf_achievements')
            .upsert(
              {
                apprenant_id: apprenantId,
                badge_id: quiz.badge_recompense,
                obtenu_le: new Date().toISOString(),
              },
              { onConflict: 'apprenant_id,badge_id' }
            );
        }
      }
    }

    const { error: subErr } = await supabaseServer
      .from('sf_quiz_submissions')
      .upsert(
        {
          quiz_id: quizId,
          apprenant_id: apprenantId,
          reponses_choisies: answers,
          score_obtenu: scoreObtenu,
          score_pourcentage: scorePourcentage,
          is_validated: isValidated,
          points_attribues: pointsAttribues,
          infractions_count: existingSub?.infractions_count || 0,
          infractions_log: Array.isArray(existingSub?.infractions_log) ? existingSub.infractions_log : [],
          closed_for_cheating: false,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'quiz_id,apprenant_id' }
      );

    if (subErr) {
      console.error('Erreur insertion submission:', subErr);
      return { success: false, error: "Impossible d'enregistrer la copie en base." };
    }

    revalidatePath(`/quiz/${quizId}`);
    revalidatePath(`/passport/${apprenantId}`);
    revalidatePath('/admin');
    revalidatePath('/');

    if (quiz.statut === 'session_ouverte') {
      return {
        success: true,
        status: 'en_attente',
        message:
          '🔒 Copie enregistrée avec succès. En attente de la clôture de la session par David. Vos résultats et le corrigé détaillé seront débloqués simultanément pour toute la classe.',
      };
    } else {
      return {
        success: true,
        status: 'correction_publiee',
        score_pourcentage: scorePourcentage,
        is_validated: isValidated,
        message: 'Résultats calculés et débloqués.',
      };
    }
  } catch (err: any) {
    console.error('Erreur submitQuizAnswersAction:', err);
    return { success: false, error: err.message || 'Erreur serveur inattendue.' };
  }
}

const logInfractionSchema = z.object({
  quizId: z.string().min(1).max(60),
  apprenantId: z.string().uuid(),
  infractionType: z.string().min(1).max(300),
  timestamp: z.string().max(60),
  currentAnswers: z.record(z.string()).optional(),
});

export async function logQuizInfractionAction(data: {
  quizId: string;
  apprenantId: string;
  infractionType: string;
  timestamp: string;
  currentAnswers?: Record<string, string>;
}) {
  const parsed = logInfractionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Données d'infraction invalides." };
  }

  const { quizId, apprenantId, infractionType, timestamp, currentAnswers = {} } = parsed.data;

  // Vérification stricte de session (empêche tout sabotage de la copie d'un autre apprenant)
  const isFormateur = await isAdminAuthenticated();
  const activeTechId = await getActiveTechnicianId();
  const isPassportAuth = await isStudentAuthenticated(apprenantId);

  if (!isFormateur && activeTechId !== apprenantId && !isPassportAuth) {
    return { success: false, error: 'Session non autorisée.' };
  }

  try {
    // 1. Récupérer ou initialiser la soumission
    const { data: existingSub } = await supabaseServer
      .from('sf_quiz_submissions')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('apprenant_id', apprenantId)
      .maybeSingle();

    // Si la copie est déjà scellée ou clôturée, ne plus incrémenter
    if (existingSub?.submitted_at || existingSub?.closed_for_cheating) {
      return {
        success: true,
        count: existingSub.infractions_count || 0,
        closedForCheating: !!existingSub.closed_for_cheating,
        message: 'Copie déjà scellée.',
      };
    }

    const currentCount = (existingSub?.infractions_count || 0) + 1;
    const existingLog = Array.isArray(existingSub?.infractions_log) ? existingSub.infractions_log : [];
    const newLog = [
      ...existingLog,
      {
        type: infractionType,
        timestamp: timestamp || new Date().toISOString(),
      },
    ];

    const isClosedForCheating = currentCount >= 3;

    const upsertData: Record<string, any> = {
      quiz_id: quizId,
      apprenant_id: apprenantId,
      reponses_choisies: currentAnswers,
      infractions_count: currentCount,
      infractions_log: newLog,
      closed_for_cheating: isClosedForCheating,
      // Tant que la copie n'est pas remise ni auto-clôturée (3 infractions), submitted_at reste null
      submitted_at: isClosedForCheating ? new Date().toISOString() : null,
    };

    if (isClosedForCheating) {
      upsertData.score_obtenu = 0;
      upsertData.score_pourcentage = 0;
      upsertData.is_validated = false;
      upsertData.points_attribues = 0;
    }

    const { error: upsertErr } = await supabaseServer
      .from('sf_quiz_submissions')
      .upsert(upsertData, { onConflict: 'quiz_id,apprenant_id' });

    if (upsertErr) {
      console.error('Erreur logQuizInfractionAction:', upsertErr);
      return { success: false, error: upsertErr.message };
    }

    revalidatePath('/admin');
    if (isClosedForCheating) {
      revalidatePath(`/quiz/${quizId}`);
      revalidatePath(`/passport/${apprenantId}`);
    }

    return {
      success: true,
      count: currentCount,
      closedForCheating: isClosedForCheating,
      message: isClosedForCheating
        ? "Copie clôturée pour infractions répétées au protocole d'examen."
        : `Infraction ${currentCount}/3 enregistrée.`,
    };
  } catch (err: any) {
    console.error('Erreur logQuizInfractionAction:', err);
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}
