'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase';
import { getLabById } from '@/lib/lab/labData';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { LabAuditSummary, LabSubmission } from '@/types/tip';

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

    const lab = getLabById(labId);
    if (!lab) {
      return { success: false, error: 'Atelier TP introuvable.' };
    }

    const jalonsValides = auditResults?.validCount || 0;
    const scorePct = auditResults?.scorePct || 0;
    const isFullyValid = auditResults?.isFullyValid || false;

    // Points auto-validés : si 100% des jalons validés, +100 pts immédiats
    const pointsAuto = isFullyValid ? lab.points_auto_validation : Math.round(lab.points_auto_validation * (scorePct / 100));

    // 1. Récupération de l'ancienne soumission pour ne pas doubler les points
    const { data: existingSub } = await supabaseServer
      .from('sf_lab_submissions')
      .select('id, points_attribues, statut')
      .eq('lab_id', labId)
      .eq('apprenant_id', studentId)
      .maybeSingle();

    const previousPoints = existingSub?.points_attribues || 0;
    const pointsToAdd = Math.max(0, pointsAuto - previousPoints);

    const newStatut = isDraft ? 'brouillon' : (isFullyValid ? 'soumis_en_revue' : 'en_cours');

    // 2. Upsert dans la table sf_lab_submissions
    const { error: upsertError } = await supabaseServer
      .from('sf_lab_submissions')
      .upsert(
        {
          lab_id: labId,
          apprenant_id: studentId,
          audit_results: auditResults,
          jalons_valides: jalonsValides,
          score_technique_pct: scorePct,
          reponse_demarche: reponseDemarche,
          reponse_difficultes: reponseDifficultes,
          reponse_enseignements: reponseEnseignements,
          statut: newStatut,
          points_attribues: Math.max(previousPoints, pointsAuto),
          soumis_le: isDraft ? undefined : new Date().toISOString(),
        },
        { onConflict: 'lab_id,apprenant_id' }
      );

    if (upsertError) {
      console.warn('Erreur upsert sf_lab_submissions (table peut-être en attente de DDL):', upsertError);
    }

    // 3. Crédit immédiat des points sur le profil apprenant
    if (pointsToAdd > 0) {
      const { data: student } = await supabaseServer
        .from('sf_apprenants')
        .select('points_total')
        .eq('id', studentId)
        .single();

      if (student) {
        const newTotal = (student.points_total || 0) + pointsToAdd;
        await supabaseServer
          .from('sf_apprenants')
          .update({ points_total: newTotal })
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
      pointsAttribues: pointsAuto,
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
