'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '../../../supabase/server';

const submitQuizSchema = z.object({
  apprenantId: z.string().uuid("Identifiant apprenant invalide."),
  quizId: z.string().min(1, "Identifiant du quiz requis."),
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
      details: parsed.error.flatten().fieldErrors 
    };
  }

  const { apprenantId, quizId, answers } = parsed.data;

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
        error: "L'épreuve est actuellement fermée par le formateur. Les soumissions ne sont pas acceptées." 
      };
    }

    // 2. Enregistrer la copie scellée
    // Si la correction est déjà publiée (ex: rattrapage en temps réel), on calcule le score directement
    let scoreObtenu = 0;
    let scorePourcentage = 0;
    let isValidated = false;
    let pointsAttribues = 0;

    if (quiz.statut === 'correction_publiee') {
      const { data: questions } = await supabaseServer
        .from('sf_quiz_questions')
        .select('id, points')
        .eq('quiz_id', quizId);

      const { data: options } = await supabaseServer
        .from('sf_quiz_options')
        .select('id, question_id, is_correct');

      const correctSet = new Set(
        (options || []).filter(o => o.is_correct).map(o => o.id)
      );

      let totalPointsPossibles = 0;
      (questions || []).forEach(q => {
        totalPointsPossibles += (q.points || 1);
        const chosen = answers[q.id];
        if (chosen && correctSet.has(chosen)) {
          scoreObtenu += (q.points || 1);
        }
      });

      scorePourcentage = totalPointsPossibles > 0 
        ? Math.round((scoreObtenu / totalPointsPossibles) * 100) 
        : 0;
      isValidated = scorePourcentage >= (quiz.seuil_validation || 75);

      if (isValidated) {
        pointsAttribues = quiz.points_recompense || 200;
        // Créditer les points à l'apprenant
        const { data: appData } = await supabaseServer
          .from('sf_apprenants')
          .select('points_total')
          .eq('id', apprenantId)
          .single();

        if (appData) {
          await supabaseServer
            .from('sf_apprenants')
            .update({ points_total: (appData.points_total || 0) + pointsAttribues })
            .eq('id', apprenantId);
        }

        // Débloquer le badge si configuré
        if (quiz.badge_recompense) {
          await supabaseServer
            .from('sf_achievements')
            .upsert({
              apprenant_id: apprenantId,
              badge_id: quiz.badge_recompense,
              obtenu_le: new Date().toISOString()
            }, { onConflict: 'apprenant_id,badge_id' });
        }
      }
    }

    const { error: subErr } = await supabaseServer
      .from('sf_quiz_submissions')
      .upsert({
        quiz_id: quizId,
        apprenant_id: apprenantId,
        reponses_choisies: answers,
        score_obtenu: scoreObtenu,
        score_pourcentage: scorePourcentage,
        is_validated: isValidated,
        points_attribues: pointsAttribues,
        submitted_at: new Date().toISOString()
      }, { onConflict: 'quiz_id,apprenant_id' });

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
        message: '🔒 Copie enregistrée avec succès. En attente de la clôture de la session par David. Vos résultats et le corrigé détaillé seront débloqués simultanément pour toute la classe.'
      };
    } else {
      return {
        success: true,
        status: 'correction_publiee',
        score_pourcentage: scorePourcentage,
        is_validated: isValidated,
        message: 'Résultats calculés et débloqués.'
      };
    }
  } catch (err: any) {
    console.error('Erreur submitQuizAnswersAction:', err);
    return { success: false, error: err.message || 'Erreur serveur inattendue.' };
  }
}

const logInfractionSchema = z.object({
  quizId: z.string().min(1),
  apprenantId: z.string().uuid(),
  infractionType: z.string().min(1),
  timestamp: z.string(),
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
    return { success: false, error: 'Données d\'infraction invalides.' };
  }

  const { quizId, apprenantId, infractionType, timestamp, currentAnswers = {} } = parsed.data;

  try {
    // 1. Récupérer ou initialiser la soumission
    const { data: existingSub } = await supabaseServer
      .from('sf_quiz_submissions')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('apprenant_id', apprenantId)
      .maybeSingle();

    const currentCount = (existingSub?.infractions_count || 0) + 1;
    const existingLog = Array.isArray(existingSub?.infractions_log) ? existingSub.infractions_log : [];
    const newLog = [
      ...existingLog,
      {
        type: infractionType,
        timestamp: timestamp || new Date().toISOString(),
      }
    ];

    const isClosedForCheating = currentCount >= 3;

    const upsertData: any = {
      quiz_id: quizId,
      apprenant_id: apprenantId,
      reponses_choisies: existingSub?.reponses_choisies || currentAnswers,
      infractions_count: currentCount,
      infractions_log: newLog,
      closed_for_cheating: isClosedForCheating || !!existingSub?.closed_for_cheating,
    };

    // Si 3ème infraction : la copie est scellée immédiatement
    if (isClosedForCheating) {
      upsertData.score_obtenu = 0;
      upsertData.score_pourcentage = 0;
      upsertData.is_validated = false;
      upsertData.submitted_at = new Date().toISOString();
    }

    const { error: upsertErr } = await supabaseServer
      .from('sf_quiz_submissions')
      .upsert(upsertData, { onConflict: 'quiz_id,apprenant_id' });

    if (upsertErr) {
      console.error('Erreur logQuizInfractionAction:', upsertErr);
      return { success: false, error: upsertErr.message };
    }

    revalidatePath('/admin');
    revalidatePath(`/quiz/${quizId}`);

    return {
      success: true,
      count: currentCount,
      closedForCheating: isClosedForCheating,
      message: isClosedForCheating
        ? 'Copie clôturée pour infractions répétées au protocole d\'examen.'
        : `Infraction ${currentCount}/3 enregistrée.`
    };
  } catch (err: any) {
    console.error('Erreur logQuizInfractionAction:', err);
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

