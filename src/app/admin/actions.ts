'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '../../../supabase/server';
import { 
  validateAdminPassword, 
  setAdminSession, 
  clearAdminSession, 
  isAdminAuthenticated 
} from '@/lib/adminAuth';
import {
  getActiveTechnicianId,
  isStudentAuthenticated,
} from '@/lib/studentAuth';
import { calculatePalierForPoints } from '@/core/domain/gamification';
import { sanitizePlainText } from '@/core/domain/antillesFiscal';
import {
  evaluateQuizSubmission,
  validateAndPrepareNewQuizKlf,
} from '@/core/domain/quizEvaluation';
import { 
  Apprenant, 
  DPSuivi, 
  QuizSubmission, 
  QualiopiReportData, 
  QualiopiStudentRow, 
  QualiopiDomainDetail 
} from '@/types/tip';
import { 
  MOCK_APPRENANTS, 
  MOCK_ACHIEVEMENTS, 
  MOCK_DP_SUIVI 
} from '@/data/mockData';

// Utilitaire de sanitisation anti-XSS
function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/* ==========================================================================
   1. AUTHENTIFICATION FORMATEUR
   ========================================================================== */

export async function loginAdminAction(prevState: { error?: string } | null, formData: FormData) {
  const password = formData.get('password');

  if (typeof password !== 'string' || !password.trim()) {
    return { error: 'Veuillez saisir le mot de passe formateur.' };
  }

  const isValid = validateAdminPassword(password);
  if (!isValid) {
    return { error: 'Mot de passe formateur incorrect.' };
  }

  await setAdminSession();
  redirect('/admin');
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect('/admin/login');
}

/* ==========================================================================
   2. GESTION DES APPRENANTS
   ========================================================================== */

const studentSchema = z.object({
  prenom: z.string().min(2).max(50).transform(sanitizeString),
  nom: z.string().min(2).max(50).transform(sanitizeString),
  email: z.string().email(),
  equipe: z.string().min(2).max(50).transform(sanitizeString),
  palier_actuel: z.string().default('Palier 0'),
  avatar_url: z.string().url().optional(),
});

export async function createStudentAction(data: {
  prenom: string;
  nom: string;
  email: string;
  equipe: string;
  palier_actuel?: string;
  avatar_url?: string;
}) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  const parsed = studentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Données apprenant invalides.' };
  }

  const seed = parsed.data.prenom.toLowerCase();
  const avatarUrl = parsed.data.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;

  try {
    const initialPin = Math.floor(1000 + Math.random() * 9000).toString();

    const { data: newStudent, error } = await supabaseServer.from('sf_apprenants').insert({
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      email: parsed.data.email,
      equipe: parsed.data.equipe,
      palier_actuel: parsed.data.palier_actuel || 'Palier 0',
      avatar_url: avatarUrl,
      points_total: 0,
      pin_code: initialPin,
      is_admin: false,
    }).select().single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, student: newStudent };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

const updateStudentSchema = z.object({
  id: z.string().uuid(),
  prenom: z.string().min(2).max(50).transform(sanitizeString),
  nom: z.string().min(2).max(50).transform(sanitizeString),
  email: z.string().email(),
  equipe: z.string().min(2).max(50).transform(sanitizeString),
  palier_actuel: z.string(),
  pin_code: z.string().regex(/^\d{4,6}$/, 'Code PIN invalide (4 à 6 chiffres)').optional(),
});

export async function updateStudentAction(data: {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  equipe: string;
  palier_actuel: string;
  pin_code?: string;
}) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  const parsed = updateStudentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Données de mise à jour invalides.' };
  }

  try {
    const updatePayload: Record<string, any> = {
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      email: parsed.data.email,
      equipe: parsed.data.equipe,
      palier_actuel: parsed.data.palier_actuel,
    };
    if (parsed.data.pin_code) {
      updatePayload.pin_code = parsed.data.pin_code;
    }

    const { data: updatedStudent, error } = await supabaseServer
      .from('sf_apprenants')
      .update(updatePayload)
      .eq('id', parsed.data.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath(`/passport/${parsed.data.id}`);
    return { success: true, student: updatedStudent };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

export async function deleteStudentAction(studentId: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  try {
    const { error } = await supabaseServer
      .from('sf_apprenants')
      .delete()
      .eq('id', studentId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

const adjustPointsSchema = z.object({
  studentId: z.string().uuid(),
  deltaPoints: z.number().int(),
  reason: z.string().max(200).optional(),
});

export async function adjustPointsAction(data: {
  studentId: string;
  deltaPoints: number;
  reason?: string;
}) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  const parsed = adjustPointsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Format d\'ajustement de points invalide.' };
  }

  try {
    const { data: student, error: fetchErr } = await supabaseServer
      .from('sf_apprenants')
      .select('points_total, is_admin, palier_actuel')
      .eq('id', parsed.data.studentId)
      .single();

    if (fetchErr || !student) {
      return { success: false, error: 'Apprenant introuvable.' };
    }

    const newTotal = Math.max(0, (student.points_total || 0) + parsed.data.deltaPoints);
    const newPalier = calculatePalierForPoints(newTotal, {
      isAdmin: student.is_admin,
      currentPalier: student.palier_actuel,
    });

    const { error: updateErr } = await supabaseServer
      .from('sf_apprenants')
      .update({ 
        points_total: newTotal,
        palier_actuel: newPalier 
      })
      .eq('id', parsed.data.studentId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath(`/passport/${parsed.data.studentId}`);
    return { success: true, newPoints: newTotal, newPalier };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

/* ==========================================================================
   3. GESTION DES TICKETS D'INCIDENTS KLF
   ========================================================================== */

const ticketSchema = z.object({
  id: z.string().min(3).max(20).transform(sanitizeString),
  service: z.string().min(2).max(50).transform(sanitizeString),
  demandeur: z.string().min(2).max(60).transform(sanitizeString),
  titre: z.string().min(5).max(120).transform(sanitizeString),
  description: z.string().min(10).max(1000).transform(sanitizeString),
  urgence: z.enum(['P1', 'P2', 'P3']),
  points_valeur: z.number().int().min(25).max(500),
});

export async function createTicketAction(data: {
  id: string;
  service: string;
  demandeur: string;
  titre: string;
  description: string;
  urgence: 'P1' | 'P2' | 'P3';
  points_valeur: number;
}) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  const parsed = ticketSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Données de ticket invalides.' };
  }

  try {
    const { data: newTicket, error } = await supabaseServer.from('sf_tickets_klf').insert({
      ...parsed.data,
      statut: 'ouvert',
    }).select().single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/tickets');
    return { success: true, ticket: newTicket };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

export async function toggleTicketStatusAction(ticketId: string, newStatus: 'ouvert' | 'en_cours' | 'resolu') {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  try {
    const { error } = await supabaseServer
      .from('sf_tickets_klf')
      .update({ statut: newStatus })
      .eq('id', ticketId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/tickets');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

export async function awardTicketToStudentAction(ticketId: string, studentId: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  try {
    // 1. Récupérer le ticket pour connaître sa valeur en points et son urgence
    const { data: ticket, error: ticketErr } = await supabaseServer
      .from('sf_tickets_klf')
      .select('id, points_valeur, urgence, statut')
      .eq('id', ticketId)
      .single();

    if (ticketErr || !ticket) {
      return { success: false, error: 'Ticket introuvable.' };
    }

    // 2. Vérifier s'il existe déjà une résolution validée pour éviter tout double crédit
    const { data: existingRes } = await supabaseServer
      .from('sf_ticket_resolutions')
      .select('*')
      .eq('ticket_id', ticketId)
      .eq('apprenant_id', studentId)
      .maybeSingle();

    if (existingRes?.statut === 'valide') {
      return {
        success: false,
        error: 'Ce ticket a déjà été homologué et crédité pour cet apprenant.',
      };
    }

    const defaultCategory =
      ticketId === 'TCK-105'
        ? 'reseau'
        : ticketId === 'TCK-102'
        ? 'materiel'
        : ticketId === 'TCK-104'
        ? 'systeme'
        : 'applicatif';

    // 3. Créer ou homologuer la fiche individuelle dans sf_ticket_resolutions (sans fermer le scénario pour le reste de la promo)
    const { error: resUpsertErr } = await supabaseServer
      .from('sf_ticket_resolutions')
      .upsert(
        {
          ticket_id: ticketId,
          apprenant_id: studentId,
          diagnostic_categorie: existingRes?.diagnostic_categorie || defaultCategory,
          diagnostic_urgence: existingRes?.diagnostic_urgence || ticket.urgence || 'P2',
          demarche_technique:
            existingRes?.demarche_technique ||
            'Intervention technique validée en présentiel lors de l’atelier pratique supervisé par le formateur référent.',
          message_usager:
            existingRes?.message_usager ||
            'Incident résolu et recette opérationnelle validée directement auprès du service demandeur.',
          statut: 'valide',
          points_attribues: ticket.points_valeur,
          feedback_formateur:
            existingRes?.feedback_formateur || 'Attribution et homologation directe par David JACQUA.',
          soumis_le: existingRes?.soumis_le || new Date().toISOString(),
          evalue_le: new Date().toISOString(),
          evalue_par: 'David JACQUA',
        },
        { onConflict: 'ticket_id,apprenant_id' }
      );

    if (resUpsertErr) {
      return { success: false, error: resUpsertErr.message };
    }

    // 4. Ajuster les points et le palier de l'apprenant
    const adjustResult = await adjustPointsAction({
      studentId,
      deltaPoints: ticket.points_valeur,
      reason: `Résolution ticket ${ticketId}`,
    });

    if (!adjustResult.success) {
      return { success: false, error: adjustResult.error || 'Erreur lors de l\'attribution des points.' };
    }

    revalidatePath('/admin');
    revalidatePath('/tickets');
    revalidatePath(`/passport/${studentId}`);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

/* ==========================================================================
   RÉSOLUTIONS DE TICKETS HELPDESK KLF (CYCLE ITIL EN 3 ÉTAPES)
   ========================================================================== */

const SubmitTicketResolutionSchema = z.object({
  ticketId: z.string().min(1, 'Identifiant ticket requis').max(30),
  studentId: z.string().uuid('Identifiant apprenant invalide'),
  diagnosticCategorie: z.enum(['materiel', 'systeme', 'reseau', 'applicatif']),
  diagnosticUrgence: z.enum(['P1', 'P2', 'P3']),
  demarcheTechnique: z
    .string()
    .transform(sanitizePlainText)
    .pipe(z.string().min(10, 'La démarche technique doit être détaillée (au moins 10 caractères)').max(5000)),
  messageUsager: z
    .string()
    .transform(sanitizePlainText)
    .pipe(z.string().min(10, 'Le message à l\'usager doit être formulé avec soin (au moins 10 caractères)').max(2000)),
});

export async function submitTicketResolutionAction(formData: {
  ticketId: string;
  studentId: string;
  diagnosticCategorie: string;
  diagnosticUrgence: string;
  demarcheTechnique: string;
  messageUsager: string;
}) {
  try {
    const parsed = SubmitTicketResolutionSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Données de formulaire invalides.' };
    }

    const { ticketId, studentId, diagnosticCategorie, diagnosticUrgence, demarcheTechnique, messageUsager } = parsed.data;

    // Vérification stricte de session (Anti-usurpation d'identité inter-élèves)
    const isFormateur = await isAdminAuthenticated();
    const activeTechId = await getActiveTechnicianId();
    const isPassportAuth = await isStudentAuthenticated(studentId);

    if (!isFormateur && activeTechId !== studentId && !isPassportAuth) {
      return {
        success: false,
        error: 'Session technicien expirée ou non autorisée. Veuillez vous identifier avec votre code PIN.',
      };
    }

    // Empêcher l'écrasement d'une résolution déjà homologuée par le formateur
    const { data: existing } = await supabaseServer
      .from('sf_ticket_resolutions')
      .select('statut')
      .eq('ticket_id', ticketId)
      .eq('apprenant_id', studentId)
      .maybeSingle();

    if (existing?.statut === 'valide' && !isFormateur) {
      return {
        success: false,
        error: 'Cette intervention a déjà été homologuée par le formateur et est désormais scellée.',
      };
    }

    const payload = {
      ticket_id: ticketId,
      apprenant_id: studentId,
      diagnostic_categorie: diagnosticCategorie,
      diagnostic_urgence: diagnosticUrgence,
      demarche_technique: demarcheTechnique,
      message_usager: messageUsager,
      statut: 'en_attente_validation',
      soumis_le: new Date().toISOString()
    };

    const { data, error } = await supabaseServer
      .from('sf_ticket_resolutions')
      .upsert(payload, { onConflict: 'ticket_id,apprenant_id' })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/tickets');
    revalidatePath('/admin');
    return { success: true, resolution: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

const ReviewResolutionSchema = z.object({
  resolutionId: z.string().uuid('ID de résolution invalide'),
  statut: z.enum(['valide', 'a_corriger']),
  feedback: z.string().optional(),
  pointsAAttribuer: z.number().int().min(0).optional(),
});

export async function reviewTicketResolutionAction(input: {
  resolutionId: string;
  statut: 'valide' | 'a_corriger';
  feedback?: string;
  pointsAAttribuer?: number;
}) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  try {
    const parsed = ReviewResolutionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Données invalides.' };
    }

    const { resolutionId, statut, feedback, pointsAAttribuer } = parsed.data;

    // 1. Récupérer la résolution actuelle
    const { data: resData, error: fetchErr } = await supabaseServer
      .from('sf_ticket_resolutions')
      .select('*, ticket:sf_tickets_klf(points_valeur)')
      .eq('id', resolutionId)
      .single();

    if (fetchErr || !resData) {
      return { success: false, error: 'Résolution introuvable.' };
    }

    const pointsFinal = pointsAAttribuer !== undefined ? pointsAAttribuer : (resData.ticket?.points_valeur || 0);

    // 2. Mettre à jour la résolution
    const updatePayload: any = {
      statut,
      feedback_formateur: feedback?.trim() || null,
      evalue_le: new Date().toISOString(),
      evalue_par: 'David JACQUA',
    };

    if (statut === 'valide') {
      updatePayload.points_attribues = pointsFinal;
    }

    const { error: upErr } = await supabaseServer
      .from('sf_ticket_resolutions')
      .update(updatePayload)
      .eq('id', resolutionId);

    if (upErr) {
      return { success: false, error: upErr.message };
    }

    // 3. Si validé et pas encore crédité
    if (statut === 'valide' && resData.statut !== 'valide' && pointsFinal > 0) {
      await adjustPointsAction({
        studentId: resData.apprenant_id,
        deltaPoints: pointsFinal,
        reason: `Résolution validée ticket ${resData.ticket_id}`,
      });
    }

    revalidatePath('/admin');
    revalidatePath('/tickets');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}


/* ==========================================================================
   4. MATRICE D'ATTRIBUTION DES BADGES
   ========================================================================== */

export async function awardBadgeAction(studentId: string, badgeId: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  try {
    // 1. Enregistrer l'attribution du badge
    const { error: achError } = await supabaseServer
      .from('sf_achievements')
      .upsert(
        { apprenant_id: studentId, badge_id: badgeId },
        { onConflict: 'apprenant_id,badge_id' }
      );

    if (achError) {
      return { success: false, error: achError.message };
    }

    // 2. Créditer les points requis du badge à l'apprenant
    const { data: badge } = await supabaseServer
      .from('sf_badges')
      .select('points_requis')
      .eq('id', badgeId)
      .single();

    if (badge && badge.points_requis > 0) {
      await adjustPointsAction({
        studentId,
        deltaPoints: badge.points_requis,
        reason: `Obtention badge ${badgeId}`,
      });
    }

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath(`/passport/${studentId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

export async function revokeBadgeAction(studentId: string, badgeId: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  try {
    const { error: delError } = await supabaseServer
      .from('sf_achievements')
      .delete()
      .eq('apprenant_id', studentId)
      .eq('badge_id', badgeId);

    if (delError) {
      return { success: false, error: delError.message };
    }

    // Retirer les points associés au badge
    const { data: badge } = await supabaseServer
      .from('sf_badges')
      .select('points_requis')
      .eq('id', badgeId)
      .single();

    if (badge && badge.points_requis > 0) {
      await adjustPointsAction({
        studentId,
        deltaPoints: -badge.points_requis,
        reason: `Révocation badge ${badgeId}`,
      });
    }

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath(`/passport/${studentId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

/* ==========================================================================
   5. SUPERVISEUR DU DOSSIER PROFESSIONNEL (DP REAC)
   ========================================================================== */

const dpChecklistSchema = z.object({
  studentId: z.string().uuid(),
  rubrique_1: z.boolean(),
  rubrique_2: z.boolean(),
  rubrique_3: z.boolean(),
  rubrique_4: z.boolean(),
  rubrique_5: z.boolean(),
  statut_dp: z.enum(['brouillon', 'en_revue', 'valide_jury']),
});

export async function updateDPChecklistAction(data: {
  studentId: string;
  rubrique_1: boolean;
  rubrique_2: boolean;
  rubrique_3: boolean;
  rubrique_4: boolean;
  rubrique_5: boolean;
  statut_dp: 'brouillon' | 'en_revue' | 'valide_jury';
}) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  const parsed = dpChecklistSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Données de suivi DP invalides.' };
  }

  try {
    const { error } = await supabaseServer
      .from('sf_dp_suivi')
      .upsert({
        apprenant_id: parsed.data.studentId,
        rubrique_1: parsed.data.rubrique_1,
        rubrique_2: parsed.data.rubrique_2,
        rubrique_3: parsed.data.rubrique_3,
        rubrique_4: parsed.data.rubrique_4,
        rubrique_5: parsed.data.rubrique_5,
        statut_dp: parsed.data.statut_dp,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath('/dp');
    revalidatePath(`/passport/${parsed.data.studentId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}


/* ==========================================================================
   6. GESTION DU MOTEUR DE QUIZ KLF (FORMATEUR)
   ========================================================================== */

export async function updateQuizStatusAction(quizId: string, newStatus: 'ferme' | 'session_ouverte' | 'correction_publiee') {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  try {
    const { error } = await supabaseServer
      .from('sf_quizzes')
      .update({ statut: newStatus })
      .eq('id', quizId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin');
    revalidatePath(`/quiz/${quizId}`);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

export async function publishQuizCorrectionAction(quizId: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  try {
    // 1. Récupérer le quiz
    const { data: quiz, error: qErr } = await supabaseServer
      .from('sf_quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (qErr || !quiz) return { success: false, error: 'Quiz introuvable.' };

    // 2. Récupérer les questions et options avec is_correct
    const { data: questions } = await supabaseServer
      .from('sf_quiz_questions')
      .select('id, points')
      .eq('quiz_id', quizId);

    const questionIds = (questions || []).map(q => q.id);
    const { data: options } = await supabaseServer
      .from('sf_quiz_options')
      .select('id, question_id, is_correct')
      .in('question_id', questionIds.length > 0 ? questionIds : ['00000000-0000-0000-0000-000000000000']);

    const correctOptionsSet = new Set(
      (options || []).filter(o => o.is_correct).map(o => o.id)
    );

    // 3. Récupérer toutes les soumissions finalisées de ce quiz
    const { data: rawSubmissions } = await supabaseServer
      .from('sf_quiz_submissions')
      .select('*')
      .eq('quiz_id', quizId);

    const submissions = (rawSubmissions || []).filter(
      (s) => Boolean(s.closed_for_cheating || s.submitted_at)
    );

    // 4. Calculer le score de chaque copie (Domaine pur) et attribuer les points/paliers/badges
    for (const sub of submissions) {
      const outcome = evaluateQuizSubmission({
        questions: questions || [],
        correctOptionIds: correctOptionsSet,
        answers: sub.reponses_choisies,
        seuilValidation: quiz.seuil_validation || 75,
        pointsRecompense: quiz.points_recompense || 200,
        closedForCheating: !!sub.closed_for_cheating,
      });

      const { scoreObtenu, scorePourcentage, isValidated, pointsAttribues: pointsToAward } = outcome;

      // Si l'élève a validé (sans triche) et n'a pas encore reçu ses points
      if (isValidated && !sub.closed_for_cheating && (sub.points_attribues || 0) === 0) {
        const { data: appData } = await supabaseServer
          .from('sf_apprenants')
          .select('points_total, is_admin, palier_actuel')
          .eq('id', sub.apprenant_id)
          .single();

        if (appData) {
          const newPointsTotal = (appData.points_total || 0) + pointsToAward;
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
            .eq('id', sub.apprenant_id);
        }

        // Débloquer le badge
        if (quiz.badge_recompense) {
          await supabaseServer
            .from('sf_achievements')
            .upsert({
              apprenant_id: sub.apprenant_id,
              badge_id: quiz.badge_recompense,
              obtenu_le: new Date().toISOString()
            }, { onConflict: 'apprenant_id,badge_id' });
        }
      }

      // Mise à jour de la soumission (sanction 0/20 préservée si closed_for_cheating)
      await supabaseServer
        .from('sf_quiz_submissions')
        .update({
          score_obtenu: scoreObtenu,
          score_pourcentage: scorePourcentage,
          is_validated: isValidated,
          points_attribues: sub.closed_for_cheating
            ? 0
            : isValidated
            ? Math.max(sub.points_attribues || 0, pointsToAward)
            : sub.points_attribues || 0,
        })
        .eq('id', sub.id);
    }

    // 5. Basculer le quiz en statut 'correction_publiee'
    await supabaseServer
      .from('sf_quizzes')
      .update({ statut: 'correction_publiee' })
      .eq('id', quizId);

    revalidatePath('/admin');
    revalidatePath(`/quiz/${quizId}`);
    revalidatePath('/passport');
    revalidatePath('/');

    return { 
      success: true, 
      countEvaluated: (submissions || []).length,
      message: 'Correction publiée avec succès pour toute la classe.' 
    };
  } catch (err: any) {
    console.error('Erreur publishQuizCorrectionAction:', err);
    return { success: false, error: err.message || 'Erreur lors de la publication.' };
  }
}

export async function resetStudentQuizAttemptAction(quizId: string, apprenantId: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  try {
    const { error } = await supabaseServer
      .from('sf_quiz_submissions')
      .delete()
      .eq('quiz_id', quizId)
      .eq('apprenant_id', apprenantId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin');
    revalidatePath(`/quiz/${quizId}`);
    revalidatePath(`/passport/${apprenantId}`);
    return { success: true, message: 'Tentative réinitialisée avec succès.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

export async function importQuizJsonAction(jsonString: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.title || !Array.isArray(parsed.questions)) {
      return { success: false, error: 'Structure JSON invalide (title ou questions manquants).' };
    }

    const rawId = typeof parsed.id === 'string' ? parsed.id.trim() : '';
    const quizId = rawId
      ? rawId.startsWith('quiz-')
        ? rawId
        : `quiz-${rawId}`
      : 'quiz-' + Date.now().toString(36);

    // Protection stricte des quiz ayant déjà des copies d'élèves scellées
    const { count: existingSubmissionsCount } = await supabaseServer
      .from('sf_quiz_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);

    if ((existingSubmissionsCount || 0) > 0) {
      return {
        success: false,
        error: `Protection d'intégrité : le quiz "${quizId}" possède déjà ${existingSubmissionsCount} copie(s) d'élèves enregistrée(s) et ne peut pas être écrasé. Choisissez un nouvel identifiant.`,
      };
    }

    // Protocole docimologique KLF en 12 verrous AVANT toute écriture en base
    const validation = validateAndPrepareNewQuizKlf(parsed.questions);
    if (!validation.valid) {
      return {
        success: false,
        error: `Rejet docimologique KLF (${validation.errors.length} anomalie(s)) : ${validation.errors.slice(0, 3).join(' | ')}`,
      };
    }

    const { normalizedQuestions, balancedOptions, distributionAudit } = validation;

    // Insertion du Quiz
    const { error: qErr } = await supabaseServer
      .from('sf_quizzes')
      .upsert({
        id: quizId,
        titre: sanitizePlainText(String(parsed.title)),
        description: sanitizePlainText(
          String(parsed.description || 'Évaluation importée via le cockpit KLF.')
        ),
        palier: parsed.palier || 'Palier 1',
        seuil_validation: parsed.seuil_validation || 75,
        points_recompense: parsed.points_recompense || 200,
        duree_minutes: parsed.duree_minutes || 30,
        badge_recompense: parsed.badge_recompense || null,
        statut: 'ferme'
      });

    if (qErr) return { success: false, error: qErr.message };

    // Nettoyer questions existantes si brouillon sans copies
    await supabaseServer.from('sf_quiz_questions').delete().eq('quiz_id', quizId);

    // Insertion questions et options équilibrées
    for (let i = 0; i < normalizedQuestions.length; i++) {
      const q = normalizedQuestions[i];
      const { data: qRow, error: questErr } = await supabaseServer
        .from('sf_quiz_questions')
        .insert({
          quiz_id: quizId,
          ordre: i + 1,
          theme: q.theme,
          enonce: q.enonce,
          points: q.points
        })
        .select()
        .single();

      if (questErr || !qRow) continue;

      const opts = (balancedOptions[i] || []).map((opt) => ({
        question_id: qRow.id,
        lettre: opt.lettre,
        texte: opt.texte,
        is_correct: opt.is_correct,
        dsi_explanation: opt.dsi_explanation
      }));

      await supabaseServer.from('sf_quiz_options').insert(opts);
    }

    revalidatePath('/admin');
    return { 
      success: true, 
      quizId, 
      count: normalizedQuestions.length,
      distribution: distributionAudit.percentages,
      message: `✅ Quiz importé (${normalizedQuestions.length} questions). Protocole KLF 12 verrous validé — distribution : ${distributionAudit.summaryText}.` 
    };
  } catch (err: any) {
    return { success: false, error: 'JSON non parsable : ' + (err.message || String(err)) };
  }
}

/* ==========================================================================
   7. MOTEUR D'AUDIT ET DE RAPPORT QUALIOPI (CFA FORE ALTERNANCE - JARRY)
   ========================================================================== */

/**
 * Agrège les données d'audit pédagogique pour les indicateurs Qualiopi 8 & 11.
 */
export async function getQualiopiReportDataAction(): Promise<{
  success: boolean;
  error?: string;
  report?: QualiopiReportData;
}> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: 'Accès non autorisé.' };
  }

  try {
    // 1. Récupération des apprenants de la promotion (hors formateur référent)
    const { data: rawStudents, error: stuErr } = await supabaseServer
      .from('sf_apprenants')
      .select('*')
      .eq('is_admin', false)
      .order('nom', { ascending: true });

    const students: Apprenant[] = (!stuErr && rawStudents && rawStudents.length > 0)
      ? rawStudents
      : MOCK_APPRENANTS.filter((a) => !a.is_admin);

    // 2. Paramètres des quiz (Palier 0 RAN + Trinité Bureautique Palier 1)
    const quizIds = ['quiz-p0-ran', 'quiz-p1-word-docs', 'quiz-p1-excel-sheets', 'quiz-p1-outlook-gmail'];

    const { data: allQuizzesData } = await supabaseServer
      .from('sf_quizzes')
      .select('*')
      .in('id', quizIds);

    const quizMap = new Map<string, any>();
    (allQuizzesData || []).forEach((q: any) => quizMap.set(q.id, q));

    const seuilValidation = 75;

    // 3. Récupération des questions & options pour cartographie par domaine (Indicateur 8)
    const { data: questionsData } = await supabaseServer
      .from('sf_quiz_questions')
      .select('id, quiz_id, theme, points, sf_quiz_options(id, is_correct)')
      .in('quiz_id', quizIds);

    const mapThemeToDomain = (theme: string, quizId: string): string => {
      if (quizId === 'quiz-p1-word-docs' || theme.toLowerCase().includes('texte') || theme.toLowerCase().includes('word') || theme.toLowerCase().includes('doc')) {
        return 'Traitement de texte (Word & Docs)';
      }
      if (quizId === 'quiz-p1-excel-sheets' || theme.toLowerCase().includes('tableur') || theme.toLowerCase().includes('excel') || theme.toLowerCase().includes('sheet')) {
        return 'Tableur & Analyse (Excel & Sheets)';
      }
      if (quizId === 'quiz-p1-outlook-gmail' || theme.toLowerCase().includes('messagerie') || theme.toLowerCase().includes('outlook') || theme.toLowerCase().includes('mail') || theme.toLowerCase().includes('agenda')) {
        return 'Messagerie & Collaboration (Outlook & Gmail)';
      }
      if (theme.toLowerCase().includes('fichier') || theme.toLowerCase().includes('nommage') || theme.toLowerCase().includes('clavier') || theme.toLowerCase().includes('raccourci')) {
        return 'Hygiène Système & Fichiers';
      }
      return 'Posture DSI & Sécurité RGPD';
    };

    // 4. Récupération des soumissions de tous les quiz
    const { data: rawSubmissions } = await supabaseServer
      .from('sf_quiz_submissions')
      .select('*')
      .in('quiz_id', quizIds);

    // Map: studentId -> Map<quizId, QuizSubmission>
    const studentSubmissionsMap = new Map<string, Map<string, QuizSubmission>>();
    (rawSubmissions || []).forEach((sub: QuizSubmission) => {
      if (!studentSubmissionsMap.has(sub.apprenant_id)) {
        studentSubmissionsMap.set(sub.apprenant_id, new Map());
      }
      const existing = studentSubmissionsMap.get(sub.apprenant_id)!.get(sub.quiz_id);
      if (!existing || new Date(sub.submitted_at) > new Date(existing.submitted_at)) {
        studentSubmissionsMap.get(sub.apprenant_id)!.set(sub.quiz_id, sub);
      }
    });

    // 5. Récupération des badges obtenus (Indicateur 11)
    const { data: rawAchievements } = await supabaseServer
      .from('sf_achievements')
      .select('apprenant_id, badge_id');

    const badgesCountMap = new Map<string, number>();
    if (rawAchievements && rawAchievements.length > 0) {
      rawAchievements.forEach((ach: { apprenant_id: string; badge_id: string }) => {
        badgesCountMap.set(ach.apprenant_id, (badgesCountMap.get(ach.apprenant_id) || 0) + 1);
      });
    } else {
      Object.entries(MOCK_ACHIEVEMENTS).forEach(([appId, badgeIds]) => {
        badgesCountMap.set(appId, badgeIds.length);
      });
    }

    // 6. Récupération des 5 rubriques du dossier professionnel (DP REAC)
    const { data: rawDP } = await supabaseServer
      .from('sf_dp_suivi')
      .select('*');

    const dpMap = new Map<string, DPSuivi>();
    if (rawDP && rawDP.length > 0) {
      rawDP.forEach((dp: DPSuivi) => {
        dpMap.set(dp.apprenant_id, dp);
      });
    } else {
      Object.entries(MOCK_DP_SUIVI).forEach(([appId, dp]) => {
        dpMap.set(appId, dp);
      });
    }

    // 7. Fusion et calcul par stagiaire
    const studentRows: QualiopiStudentRow[] = students.map((student) => {
      const subsForStudent = studentSubmissionsMap.get(student.id) || new Map();
      const subRan = subsForStudent.get('quiz-p0-ran');
      const subWord = subsForStudent.get('quiz-p1-word-docs');
      const subExcel = subsForStudent.get('quiz-p1-excel-sheets');
      const subOutlook = subsForStudent.get('quiz-p1-outlook-gmail');

      const dp = dpMap.get(student.id) || {
        apprenant_id: student.id,
        rubrique_1: false,
        rubrique_2: false,
        rubrique_3: false,
        rubrique_4: false,
        rubrique_5: false,
        statut_dp: 'brouillon',
      };

      const dpRubriquesCount = [
        dp.rubrique_1,
        dp.rubrique_2,
        dp.rubrique_3,
        dp.rubrique_4,
        dp.rubrique_5,
      ].filter(Boolean).length;

      const badgesCount = badgesCountMap.get(student.id) || 0;

      // Notes individuelles sur 20
      const scoreRan = typeof subRan?.score_obtenu === 'number' ? subRan.score_obtenu : null;
      const scoreWord = typeof subWord?.score_obtenu === 'number' ? subWord.score_obtenu : null;
      const scoreExcel = typeof subExcel?.score_obtenu === 'number' ? subExcel.score_obtenu : null;
      const scoreOutlook = typeof subOutlook?.score_obtenu === 'number' ? subOutlook.score_obtenu : null;

      // Moyenne bureautique (sur les quiz Palier 1 passés)
      const officeScores = [scoreWord, scoreExcel, scoreOutlook].filter((s): s is number => s !== null);
      const moyenneBureautique = officeScores.length > 0
        ? Number((officeScores.reduce((a, b) => a + b, 0) / officeScores.length).toFixed(1))
        : null;

      const statutBureautique = moyenneBureautique !== null
        ? (moyenneBureautique >= 15 ? 'Validé' : 'À consolider')
        : 'Non effectué';

      // Test de positionnement global / RAN
      const allPassedSubs = [subRan, subWord, subExcel, subOutlook].filter(Boolean) as QuizSubmission[];
      const hasSubmittedAny = allPassedSubs.length > 0;

      let latestDateFormatted = 'Non effectué';
      let latestDateIso: string | undefined = undefined;

      if (hasSubmittedAny) {
        const sortedSubs = [...allPassedSubs].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
        const latest = sortedSubs[0];
        latestDateIso = latest.submitted_at;
        const d = new Date(latest.submitted_at);
        latestDateFormatted = d.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      // Note d'entrée de référence (Score RAN ou Moyenne générale)
      const allScores = [scoreRan, scoreWord, scoreExcel, scoreOutlook].filter((s): s is number => s !== null);
      const scoreSur20 = allScores.length > 0
        ? Number((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1))
        : null;
      const scorePercent = scoreSur20 !== null ? Math.round((scoreSur20 / 20) * 100) : null;
      const seuilAtteint = scorePercent !== null ? scorePercent >= seuilValidation : false;
      const statutPos: 'Validé' | 'À consolider' | 'Non effectué' = hasSubmittedAny
        ? (seuilAtteint ? 'Validé' : 'À consolider')
        : 'Non effectué';

      // Domaines Qualiopi Indicateur 8 (5 Domaines)
      const domainsList = [
        'Hygiène Système & Fichiers',
        'Traitement de texte (Word & Docs)',
        'Tableur & Analyse (Excel & Sheets)',
        'Messagerie & Collaboration (Outlook & Gmail)',
        'Posture DSI & Sécurité RGPD',
      ];

      const domainStatsMap: Record<string, { total: number; correct: number }> = {};
      domainsList.forEach((d) => {
        domainStatsMap[d] = { total: 0, correct: 0 };
      });

      if (questionsData && questionsData.length > 0) {
        questionsData.forEach((q: any) => {
          const dom = mapThemeToDomain(q.theme || '', q.quiz_id);
          if (!domainStatsMap[dom]) {
            domainStatsMap[dom] = { total: 0, correct: 0 };
          }
          domainStatsMap[dom].total += 1;

          const relatedSub = subsForStudent.get(q.quiz_id);
          if (relatedSub && relatedSub.reponses_choisies) {
            const chosenOptionId = relatedSub.reponses_choisies[q.id];
            const correctOpt = (q.sf_quiz_options || []).find((opt: any) => opt.is_correct);
            if (correctOpt && chosenOptionId === correctOpt.id) {
              domainStatsMap[dom].correct += 1;
            }
          }
        });
      }

      const domainesDetail: QualiopiDomainDetail[] = domainsList.map((dom) => {
        const stats = domainStatsMap[dom] || { total: 0, correct: 0 };
        const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        return {
          domaine: dom,
          total_questions: stats.total,
          reponses_correctes: stats.correct,
          pourcentage: pct,
          acquis: pct >= 60,
        };
      });

      // Appréciation pédagogique
      let avis = 'Progression conforme aux attendus REAC';
      if (dp.statut_dp === 'valide_jury') {
        avis = 'Dossier professionnel validé pour le jury';
      } else if (dpRubriquesCount >= 4) {
        avis = 'Dossier professionnel bien avancé';
      } else if (!hasSubmittedAny) {
        avis = 'Tests d\'entrée à compléter';
      } else if (moyenneBureautique !== null && moyenneBureautique >= 16) {
        avis = 'Excellente maîtrise opérationnelle des outils bureautiques';
      } else if (scoreSur20 !== null && scoreSur20 < 12) {
        avis = 'Remédiation recommandée sur les fondamentaux';
      }

      return {
        apprenant_id: student.id,
        nom: student.nom,
        prenom: student.prenom,
        email: student.email,
        equipe: student.equipe,
        avatar_url: student.avatar_url,
        points_klf_total: student.points_total || 0,
        palier_actuel: student.palier_actuel || 'Palier 0',
        has_submitted_positionnement: hasSubmittedAny,
        date_test_positionnement: latestDateFormatted,
        date_test_iso: latestDateIso,
        score_positionnement_sur_20: scoreSur20,
        score_positionnement_pourcentage: scorePercent,
        seuil_atteint: seuilAtteint,
        statut_positionnement: statutPos,
        domaines: domainesDetail,
        // Grille détaillée multi-épreuves
        score_ran_sur_20: scoreRan,
        score_word_sur_20: scoreWord,
        score_excel_sur_20: scoreExcel,
        score_outlook_sur_20: scoreOutlook,
        moyenne_bureautique_sur_20: moyenneBureautique,
        statut_bureautique: statutBureautique,
        badges_obtenus_total: badgesCount,
        dp_rubriques_validees_count: dpRubriquesCount,
        dp_rubrique_1: dp.rubrique_1 || false,
        dp_rubrique_2: dp.rubrique_2 || false,
        dp_rubrique_3: dp.rubrique_3 || false,
        dp_rubrique_4: dp.rubrique_4 || false,
        dp_rubrique_5: dp.rubrique_5 || false,
        statut_dossier_professionnel: dp.statut_dp || 'brouillon',
        avis_formateur: avis,
      };
    });

    // 8. Synthèse des indicateurs Qualiopi
    const totalStagiaires = studentRows.length;
    const submittedRows = studentRows.filter((s) => s.has_submitted_positionnement);
    const countPassage = submittedRows.length;
    const tauxPassage = totalStagiaires > 0 ? Math.round((countPassage / totalStagiaires) * 100) : 0;

    const sumScores = submittedRows.reduce((acc, s) => acc + (s.score_positionnement_sur_20 || 0), 0);
    const moyenneGenerale = countPassage > 0 ? Number((sumScores / countPassage).toFixed(1)) : 0;

    // Moyennes par épreuve pour la promo
    const calcAvg = (getter: (s: QualiopiStudentRow) => number | null | undefined) => {
      const vals = studentRows.map(getter).filter((v): v is number => typeof v === 'number');
      return vals.length > 0 ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : undefined;
    };

    const avgRan = calcAvg(s => s.score_ran_sur_20);
    const avgWord = calcAvg(s => s.score_word_sur_20);
    const avgExcel = calcAvg(s => s.score_excel_sur_20);
    const avgOutlook = calcAvg(s => s.score_outlook_sur_20);
    const avgOffice = calcAvg(s => s.moyenne_bureautique_sur_20);

    const totalRubriquesValidees = studentRows.reduce((acc, s) => acc + s.dp_rubriques_validees_count, 0);
    const maxRubriques = totalStagiaires * 5;
    const tauxAvancementDp = maxRubriques > 0 ? Math.round((totalRubriquesValidees / maxRubriques) * 100) : 0;

    const totalBadges = studentRows.reduce((acc, s) => acc + s.badges_obtenus_total, 0);

    const report: QualiopiReportData = {
      students: studentRows,
      kpis: {
        total_stagiaires: totalStagiaires,
        count_passage_test: countPassage,
        taux_passage_test: tauxPassage,
        moyenne_generale_positionnement: moyenneGenerale,
        moyenne_ran: avgRan,
        moyenne_word: avgWord,
        moyenne_excel: avgExcel,
        moyenne_outlook: avgOutlook,
        moyenne_bureautique_promo: avgOffice,
        taux_avancement_moyen_dp: tauxAvancementDp,
        total_badges_distribues: totalBadges,
        promotion_nom: 'Technicien Informatique de Proximité (TIP)',
        session_code: 'Session C26031A',
        formateur_nom: 'David JACQUA',
        centre_formation: 'FORE Alternance / METAFORE Jarry (Guadeloupe)',
        generated_at: new Date().toISOString(),
      },
    };

    return { success: true, report };
  } catch (err: any) {
    console.error('Erreur getQualiopiReportDataAction:', err);
    return { success: false, error: err.message || 'Erreur lors de la génération du bilan Qualiopi.' };
  }
}


/**
 * Génère le contenu CSV formaté conforme aux normes régionales françaises & Excel (UTF-8 BOM).
 */
export async function generateQualiopiCsvStringAction(): Promise<{
  success: boolean;
  error?: string;
  csvContent?: string;
  filename?: string;
}> {
  const result = await getQualiopiReportDataAction();
  if (!result.success || !result.report) {
    return { success: false, error: result.error || 'Impossible de récupérer les données.' };
  }

  const { students } = result.report;

  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    'Identifiant_Apprenant',
    'Nom',
    'Prenom',
    'Email',
    'Equipe',
    'Date_Dernier_Test',
    'Note_RAN_Sur_20',
    'Note_Word_Docs_Sur_20',
    'Note_Excel_Sheets_Sur_20',
    'Note_Outlook_Gmail_Sur_20',
    'Moyenne_Bureautique_Sur_20',
    'Statut_Bureautique',
    'Note_Entree_Globale_Sur_20',
    'Statut_Positionnement_Global',
    'Badges_Obtenus_Total',
    'Points_KLF_Total',
    'Palier_Actuel',
    'DP_Rubrique_1_Taches',
    'DP_Rubrique_2_Moyens',
    'DP_Rubrique_3_Equipe',
    'DP_Rubrique_4_Contexte',
    'DP_Rubrique_5_Info_Comp',
    'Statut_Dossier_Professionnel',
    'Avis_Pédagogique_Formateur',
  ];

  const formatDPStatus = (status: string) => {
    if (status === 'valide_jury') return 'Validé jury';
    if (status === 'en_revue') return 'En revue';
    return 'Brouillon';
  };

  const rows = students.map((s) => [
    escapeCell(s.apprenant_id),
    escapeCell(s.nom),
    escapeCell(s.prenom),
    escapeCell(s.email),
    escapeCell(s.equipe),
    escapeCell(s.date_test_positionnement),
    escapeCell(s.score_ran_sur_20 !== null && s.score_ran_sur_20 !== undefined ? s.score_ran_sur_20 : 'Non effectué'),
    escapeCell(s.score_word_sur_20 !== null && s.score_word_sur_20 !== undefined ? s.score_word_sur_20 : 'Non effectué'),
    escapeCell(s.score_excel_sur_20 !== null && s.score_excel_sur_20 !== undefined ? s.score_excel_sur_20 : 'Non effectué'),
    escapeCell(s.score_outlook_sur_20 !== null && s.score_outlook_sur_20 !== undefined ? s.score_outlook_sur_20 : 'Non effectué'),
    escapeCell(s.moyenne_bureautique_sur_20 !== null && s.moyenne_bureautique_sur_20 !== undefined ? `${s.moyenne_bureautique_sur_20}/20` : 'Non effectué'),
    escapeCell(s.statut_bureautique || 'Non effectué'),
    escapeCell(s.score_positionnement_sur_20 !== null ? `${s.score_positionnement_sur_20}/20` : 'Non effectué'),
    escapeCell(s.statut_positionnement),
    escapeCell(s.badges_obtenus_total),
    escapeCell(s.points_klf_total),
    escapeCell(s.palier_actuel),
    escapeCell(s.dp_rubrique_1 ? 'Validé' : 'Non validé'),
    escapeCell(s.dp_rubrique_2 ? 'Validé' : 'Non validé'),
    escapeCell(s.dp_rubrique_3 ? 'Validé' : 'Non validé'),
    escapeCell(s.dp_rubrique_4 ? 'Validé' : 'Non validé'),
    escapeCell(s.dp_rubrique_5 ? 'Validé' : 'Non validé'),
    escapeCell(formatDPStatus(s.statut_dossier_professionnel)),
    escapeCell(s.avis_formateur),
  ]);

  const bom = '\uFEFF';
  const csvLines = [headers.join(';'), ...rows.map((r) => r.join(';'))];
  const csvContent = bom + csvLines.join('\r\n');

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `${todayStr}_FORE-Alternance_Bilan-Qualiopi_TIP-C26031A.csv`;

  return { success: true, csvContent, filename };
}

/**
 * 8. GESTION DU CODE PIN APPRENANT
 * Permet au formateur de réinitialiser ou modifier immédiatement le code PIN d'un apprenant.
 */
export async function updateStudentPinAction(studentId: string, newPin: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  const pinClean = newPin.trim();
  if (!/^\d{4,6}$/.test(pinClean)) {
    return { success: false, error: 'Le code PIN doit comporter entre 4 et 6 chiffres.' };
  }

  try {
    const { error } = await supabaseServer
      .from('sf_apprenants')
      .update({ pin_code: pinClean })
      .eq('id', studentId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin');
    revalidatePath(`/passport/${studentId}`);
    return { success: true, pin: pinClean };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur.' };
  }
}

