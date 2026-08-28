'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '../../../supabase/server';
import { setStudentSession, clearStudentSession } from '@/lib/studentAuth';

const unlockSchema = z.object({
  studentId: z.string().uuid('Identifiant apprenant invalide.'),
  enteredPin: z
    .string()
    .min(4, 'Le code PIN doit comporter au moins 4 chiffres.')
    .max(6, 'Le code PIN ne peut excéder 6 chiffres.')
    .regex(/^\d+$/, 'Le code PIN doit être composé uniquement de chiffres.'),
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

    // 2. Recherche du code PIN officiel dans Supabase (Schéma tip)
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

    // 3. Vérification du code PIN
    if (enteredPin.trim() !== expectedPin.trim()) {
      return {
        success: false,
        error: 'Code PIN agent incorrect. Veuillez vérifier ou demander votre code au formateur.',
      };
    }

    // 4. Dépôt du cookie HttpOnly sécurisé (30 jours)
    await setStudentSession(studentId);

    // 5. Rafraîchissement de la page cible
    revalidatePath(`/passport/${studentId}`);

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
 * Server Action pour reverrouiller manuellement le passeport (déconnexion de poste).
 */
export async function lockPassportAction(studentId: string): Promise<UnlockResult> {
  try {
    await clearStudentSession(studentId);
    revalidatePath(`/passport/${studentId}`);
    return { success: true };
  } catch (err: any) {
    console.error('[lockPassportAction] Exception:', err);
    return { success: false, error: 'Erreur lors du verrouillage.' };
  }
}
