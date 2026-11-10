'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase';
import { getLabById } from '@/lib/lab/labData';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getActiveTechnicianId, isStudentAuthenticated } from '@/lib/studentAuth';
import { calculatePalierForPoints } from '@/core/domain/gamification';
import { LabAuditSummary, LabSubmissionStatus } from '@/types/tip';

// Sanitisation anti-XSS stricte
const sanitizeString = (val: string) =>
  val.replace(/<[^>]*>?/gm, '').trim();

const LabAuditSchema = z.object({
  labId: z.string().min(1),
  studentId: z.string().uuid(),
  auditResults: z.any(),
  reponseDemarche: z.string().transform(sanitizeString),
  reponseDifficultes: z.string().transform(sanitizeString),
  reponseEnseignements: z.string().transform(sanitizeString),
  isDraft: z.boolean().default(false),
});

/**
 * Enregistre le résultat de l'audit client-side et les réponses du carnet de laboratoire.
 * Si tous les jalons sont validés, octroie immédiatement 50% des points du lab (auto-validation).
 */
export async function saveLabProgressAction(formData: {
  labId: string;
  studentId: string;
  auditResults: LabAuditSummary | null;
  reponseDemarche: string;
  reponseDifficultes: string;
  reponseEnseignements: string;
  isDraft?: boolean;
}) {
  try {
    const parsed = LabAuditSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: 'Données invalides : vérifiez la saisie.' };
    }

    const {
      labId,
      studentId,
      auditResults,
      reponseDemarche,
      reponseDifficultes,
      reponseEnseignements,
      isDraft,
    } = parsed.data;

    // Garde d'autorisation strict anti-IDOR : titulaire connecté ou formateur DSI uniquement
    const isFormateur = await isAdminAuthenticated();
    const activeTechId = await getActiveTechnicianId();
    const isPassportOwner = await isStudentAuthenticated(studentId);

    if (!isFormateur && activeTechId !== studentId && !isPassportOwner) {
      return {
        success: false,
        error: 'Accès non autorisé : votre session personnelle ne correspond pas à cet apprenant.',
      };
    }

    const lab = getLabById(labId);
    if (!lab) {
      return { success: false, error: 'Atelier TP introuvable.' };
    }

    const jalonsValides = auditResults?.validCount || 0;
    const scorePct = auditResults?.scorePct || 0;
    const isFullyValid = auditResults?.isFullyValid || false;

    // Points auto-validés : si 100% des jalons validés, +100 pts immédiats
    const pointsAuto = isFullyValid ? lab.points_auto_validation : Math.round(lab.points_auto_validation * (scorePct / 100));

    // 1. Récupération de l'ancienne soumission pour préserver les textes, le statut et éviter le doublon de points
    const { data: existingSub } = await supabaseServer
      .from('sf_lab_submissions')
      .select(
        'id, points_attribues, statut, reponse_demarche, reponse_difficultes, reponse_enseignements, soumis_le'
      )
      .eq('lab_id', labId)
      .eq('apprenant_id', studentId)
      .maybeSingle();

    const previousPoints = existingSub?.points_attribues || 0;
    const pointsToAdd = Math.max(0, pointsAuto - previousPoints);
    const totalPointsAttribues = Math.max(previousPoints, pointsAuto);

    // Préservation des textes existants lors d'un auto-save d'audit (isDraft === true)
    const finalDemarche =
      isDraft && !reponseDemarche && existingSub?.reponse_demarche
        ? existingSub.reponse_demarche
        : reponseDemarche;
    const finalDifficultes =
      isDraft && !reponseDifficultes && existingSub?.reponse_difficultes
        ? existingSub.reponse_difficultes
        : reponseDifficultes;
    const finalEnseignements =
      isDraft && !reponseEnseignements && existingSub?.reponse_enseignements
        ? existingSub.reponse_enseignements
        : reponseEnseignements;

    // Préservation des statuts déjà soumis / homologués lors d'un re-test en brouillon
    let newStatut: LabSubmissionStatus;
    if (
      existingSub?.statut === 'homologue_dsi' ||
      existingSub?.statut === 'soumis_en_revue'
    ) {
      newStatut = existingSub.statut;
    } else if (isDraft) {
      newStatut = auditResults
        ? 'en_cours'
        : ((existingSub?.statut as LabSubmissionStatus | undefined) || 'brouillon');
    } else {
      newStatut = isFullyValid ? 'soumis_en_revue' : 'en_cours';
    }

    const upsertPayload: Record<string, unknown> = {
      lab_id: labId,
      apprenant_id: studentId,
      audit_results: auditResults,
      jalons_valides: jalonsValides,
      score_technique_pct: scorePct,
      reponse_demarche: finalDemarche,
      reponse_difficultes: finalDifficultes,
      reponse_enseignements: finalEnseignements,
      statut: newStatut,
      points_attribues: totalPointsAttribues,
    };

    if (!isDraft) {
      upsertPayload.soumis_le = new Date().toISOString();
    }

    // 2. Upsert dans la table sf_lab_submissions
    const { error: upsertError } = await supabaseServer
      .from('sf_lab_submissions')
      .upsert(upsertPayload, { onConflict: 'lab_id,apprenant_id' });

    if (upsertError) {
      console.warn('Erreur upsert sf_lab_submissions (table peut-être en attente de DDL):', upsertError);
    }

    // 3. Crédit immédiat des points et recalcul du palier sur le profil apprenant
    if (pointsToAdd > 0) {
      const { data: student } = await supabaseServer
        .from('sf_apprenants')
        .select('points_total, is_admin, palier_actuel')
        .eq('id', studentId)
        .single();

      if (student) {
        const newTotal = (student.points_total || 0) + pointsToAdd;
        const newPalier = calculatePalierForPoints(newTotal, {
          isAdmin: student.is_admin,
          currentPalier: student.palier_actuel,
        });
        await supabaseServer
          .from('sf_apprenants')
          .update({ points_total: newTotal, palier_actuel: newPalier })
          .eq('id', studentId);
      }
    }

    revalidatePath('/lab');
    revalidatePath(`/lab/${labId}`);
    revalidatePath(`/passport/${studentId}`);
    revalidatePath('/');
    revalidatePath('/admin');

    return {
      success: true,
      pointsAttribues: totalPointsAttribues,
      pointsNouveaux: pointsToAdd,
      statut: newStatut,
    };
  } catch (error: any) {
    console.error('Erreur saveLabProgressAction:', error);
    return { success: false, error: error.message || 'Erreur interne lors de la sauvegarde.' };
  }
}

/**
 * Homologation qualitative formateur DSI (David JACQUA) dans le cockpit /admin.
 */
export async function homologuerLabAction(params: {
  submissionId: string;
  labId: string;
  studentId: string;
  pointsSolde: number;
  badgeId?: string;
  feedback: string;
}) {
  try {
    const isFormateur = await isAdminAuthenticated();
    if (!isFormateur) {
      return { success: false, error: 'Accès non autorisé : session formateur DSI requise.' };
    }

    const { submissionId, labId, studentId, pointsSolde, badgeId, feedback } = params;

    // 1. Mise à jour de la soumission
    const { error: subErr } = await supabaseServer
      .from('sf_lab_submissions')
      .update({
        statut: 'homologue_dsi',
        feedback_formateur: sanitizeString(feedback),
        points_attribues: 200, // solde complet
        evalue_le: new Date().toISOString(),
        evalue_par: 'David JACQUA',
      })
      .eq('id', submissionId);

    // 2. Crédit du solde de points sur l'apprenant
    if (pointsSolde > 0) {
      const { data: student } = await supabaseServer
        .from('sf_apprenants')
        .select('points_total')
        .eq('id', studentId)
        .single();

      if (student) {
        await supabaseServer
          .from('sf_apprenants')
          .update({ points_total: (student.points_total || 0) + pointsSolde })
          .eq('id', studentId);
      }
    }

    // 3. Attribution du badge KLF si spécifié
    if (badgeId) {
      await supabaseServer
        .from('sf_achievements')
        .insert({
          apprenant_id: studentId,
          badge_id: badgeId,
        })
        .select()
        .maybeSingle();
    }

    revalidatePath('/lab');
    revalidatePath(`/lab/${labId}`);
    revalidatePath(`/passport/${studentId}`);
    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true };
  } catch (error: any) {
    console.error('Erreur homologuerLabAction:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'homologation formateur.' };
  }
}
