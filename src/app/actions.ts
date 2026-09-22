'use server';

import { z } from 'zod';
import { supabaseServer } from '../../supabase/server';
import { revalidatePath } from 'next/cache';

// Utilitaire de sanitisation anti-XSS
function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Schéma de validation pour le suivi DP
const updateDPSchema = z.object({
  apprenantId: z.string().uuid(),
  rubrique_1: z.boolean(),
  rubrique_2: z.boolean(),
  rubrique_3: z.boolean(),
  rubrique_4: z.boolean(),
  rubrique_5: z.boolean(),
  statut_dp: z.enum(['brouillon', 'en_revue', 'valide_jury']),
});

export async function updateDPSuiviAction(formData: {
  apprenantId: string;
  rubrique_1: boolean;
  rubrique_2: boolean;
  rubrique_3: boolean;
  rubrique_4: boolean;
  rubrique_5: boolean;
  statut_dp: 'brouillon' | 'en_revue' | 'valide_jury';
}) {
  const parsed = updateDPSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'Données de formulaire invalides' };
  }

  const { apprenantId, rubrique_1, rubrique_2, rubrique_3, rubrique_4, rubrique_5, statut_dp } = parsed.data;

  try {
    const { error } = await supabaseServer
      .from('sf_dp_suivi')
      .upsert({
        apprenant_id: apprenantId,
        rubrique_1,
        rubrique_2,
        rubrique_3,
        rubrique_4,
        rubrique_5,
        statut_dp,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'apprenant_id' });

    if (error) {
      console.warn('Supabase DP Upsert error:', error.message);
      return { success: false, error: error.message };
    }

    revalidatePath('/dp');
    revalidatePath(`/passport/${apprenantId}`);
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erreur interne lors de la sauvegarde DP';
    console.error('Erreur updateDPSuiviAction:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

