'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '../../../supabase/server';
import {
  setTechnicianSession,
  clearStudentSession,
  clearTechnicianSession,
  getActiveTechnicianId,
  isStudentAuthenticated,
  verifyPinTimingSafe,
  getClientRateLimitKey,
  checkPinRateLimit,
  recordPinFailure,
  resetPinFailures,
} from '@/lib/studentAuth';
import { isAdminAuthenticated } from '@/lib/adminAuth';

const unlockSchema = z.object({
  studentId: z.string().uuid('Identifiant apprenant invalide.'),
  enteredPin: z
    .string()
    .min(4, 'Le code PIN doit comporter au moins 4 chiffres.')
    .max(6, 'Le code PIN ne peut excéder 6 chiffres.')
    .regex(/^\d+$/, 'Le code PIN doit être composé uniquement de chiffres.'),
});

const changeOwnPinSchema = z.object({
  studentId: z.string().uuid('Identifiant apprenant invalide.'),
  currentPin: z
    .string()
    .min(4, 'Saisissez votre code PIN actuel (4 à 6 chiffres).')
    .max(6, 'Code PIN actuel invalide.')
    .regex(/^\d+$/, 'Le code PIN actuel ne contient que des chiffres.'),
  newPin: z
    .string()
    .min(4, 'Le nouveau code PIN doit comporter entre 4 et 6 chiffres.')
    .max(6, 'Le nouveau code PIN ne peut excéder 6 chiffres.')
    .regex(/^\d+$/, 'Le nouveau code PIN doit être composé uniquement de chiffres.')
    .refine((val) => val !== '2026' && val !== '0000' && val !== '1234', {
      message: 'Choisissez un code PIN personnel confidentiel (différent de 2026, 0000 ou 1234).',
    }),
});

export interface UnlockResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action pour déverrouiller un passeport apprenant avec son code PIN DSI.
 */
export async function unlockPassportAction(
  studentId: string,
  enteredPin: string
): Promise<UnlockResult> {
  try {
    // 1. Validation des données en entrée
    const parsed = unlockSchema.safeParse({ studentId, enteredPin });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Données invalides.',
      };
    }

    // 2. Protection anti-brute-force par IP + passeport ciblé
    const rateKey = await getClientRateLimitKey(`passport:${studentId}`);
    const limitStatus = checkPinRateLimit(rateKey);
    if (!limitStatus.allowed) {
      return {
        success: false,
        error: `Trop de tentatives erronées. Accès temporairement suspendu (${limitStatus.retryAfterSeconds} s).`,
      };
    }

    // 3. Recherche du code PIN officiel dans Supabase (Schéma tip)
    const { data: student, error } = await supabaseServer
      .from('sf_apprenants')
      .select('id, pin_code')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      return {
        success: false,
        error: 'Passeport agent introuvable dans le registre DSI.',
      };
    }

    const expectedPin = student.pin_code || '2026';

    // 4. Vérification du code PIN en temps constant
    if (!verifyPinTimingSafe(enteredPin, expectedPin)) {
      recordPinFailure(rateKey);
      return {
        success: false,
        error: 'Code PIN agent incorrect. Veuillez vérifier ou demander votre code au formateur.',
      };
    }

    resetPinFailures(rateKey);

    // 5. Dépôt du cookie HttpOnly sécurisé (Passeport + Session Technicien Helpdesk/Quiz unifiée sur 30 jours)
    await setTechnicianSession(studentId);

    // 6. Rafraîchissement des espaces liés
    revalidatePath(`/passport/${studentId}`);
    revalidatePath('/tickets');

    return { success: true };
  } catch (err: any) {
    console.error('[unlockPassportAction] Exception:', err);
    return {
      success: false,
      error: 'Erreur lors de la validation du code PIN. Veuillez réessayer.',
    };
  }
}

/**
 * Server Action permettant au titulaire authentifié d'un passeport (ou au formateur)
 * de personnaliser son code PIN confidentiel afin de verrouiller exclusivement son espace.
 */
export async function updateOwnPassportPinAction(params: {
  studentId: string;
  currentPin: string;
  newPin: string;
}): Promise<UnlockResult> {
  try {
    const parsed = changeOwnPinSchema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Données invalides.',
      };
    }

    const { studentId, currentPin, newPin } = parsed.data;

    // 1. Contrôle strict d'identité : seul le titulaire authentifié du passeport ou le formateur
    const isFormateur = await isAdminAuthenticated();
    const isPassportOwner = await isStudentAuthenticated(studentId);
    const activeTechId = await getActiveTechnicianId();

    if (!isFormateur && !isPassportOwner && activeTechId !== studentId) {
      return {
        success: false,
        error: 'Accès non autorisé : session personnelle expirée ou invalide.',
      };
    }

    const rateKey = await getClientRateLimitKey(`change-pin:${studentId}`);
    const limitStatus = checkPinRateLimit(rateKey);
    if (!limitStatus.allowed) {
      return {
        success: false,
        error: `Trop de tentatives. Réessayez dans ${limitStatus.retryAfterSeconds} s.`,
      };
    }

    const { data: student, error: fetchErr } = await supabaseServer
      .from('sf_apprenants')
      .select('id, pin_code')
      .eq('id', studentId)
      .single();

    if (fetchErr || !student) {
      return { success: false, error: 'Profil apprenant introuvable.' };
    }

    const expectedPin = student.pin_code || '2026';
    if (!isFormateur && !verifyPinTimingSafe(currentPin, expectedPin)) {
      recordPinFailure(rateKey);
      return {
        success: false,
        error: 'Votre code PIN actuel est incorrect.',
      };
    }

    resetPinFailures(rateKey);

    const { error: updateErr } = await supabaseServer
      .from('sf_apprenants')
      .update({ pin_code: newPin.trim() })
      .eq('id', studentId);

    if (updateErr) {
      return { success: false, error: 'Impossible de mettre à jour le code PIN.' };
    }

    revalidatePath(`/passport/${studentId}`);
    revalidatePath('/admin');

    return { success: true };
  } catch (err: any) {
    console.error('[updateOwnPassportPinAction] Exception:', err);
    return { success: false, error: 'Erreur interne lors de la mise à jour du code PIN.' };
  }
}

/**
 * Server Action pour reverrouiller manuellement le passeport (déconnexion de poste).
 */
export async function lockPassportAction(studentId: string): Promise<UnlockResult> {
  try {
    await clearStudentSession(studentId);
    const activeTechId = await getActiveTechnicianId();
    if (activeTechId === studentId) {
      await clearTechnicianSession();
    }
    revalidatePath(`/passport/${studentId}`);
    revalidatePath('/tickets');
    return { success: true };
  } catch (err: any) {
    console.error('[lockPassportAction] Exception:', err);
    return { success: false, error: 'Erreur lors du verrouillage.' };
  }
}
