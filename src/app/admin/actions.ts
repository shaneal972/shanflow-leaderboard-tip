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
    const { data: newStudent, error } = await supabaseServer.from('sf_apprenants').insert({
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      email: parsed.data.email,
      equipe: parsed.data.equipe,
      palier_actuel: parsed.data.palier_actuel || 'Palier 0',
      avatar_url: avatarUrl,
      points_total: 0,
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
});

export async function updateStudentAction(data: {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  equipe: string;
  palier_actuel: string;
}) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Accès non autorisé.' };

  const parsed = updateStudentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: 'Données de mise à jour invalides.' };
  }

  try {
    const { data: updatedStudent, error } = await supabaseServer
      .from('sf_apprenants')
      .update({
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        email: parsed.data.email,
        equipe: parsed.data.equipe,
        palier_actuel: parsed.data.palier_actuel,
      })
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
      .select('points_total')
      .eq('id', parsed.data.studentId)
      .single();

    if (fetchErr || !student) {
      return { success: false, error: 'Apprenant introuvable.' };
    }

    const newTotal = Math.max(0, (student.points_total || 0) + parsed.data.deltaPoints);

    // Calcul automatique du palier selon les points
    let newPalier = 'Palier 0';
    if (newTotal >= 1000) newPalier = 'Palier 4';
    else if (newTotal >= 650) newPalier = 'Palier 3';
    else if (newTotal >= 350) newPalier = 'Palier 2';
    else if (newTotal >= 150) newPalier = 'Palier 1';

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
    // 1. Récupérer le ticket pour connaître sa valeur en points
    const { data: ticket, error: ticketErr } = await supabaseServer
      .from('sf_tickets_klf')
      .select('points_valeur, statut')
      .eq('id', ticketId)
      .single();

    if (ticketErr || !ticket) {
      return { success: false, error: 'Ticket introuvable.' };
    }

    // 2. Marquer le ticket résolu
    await supabaseServer
      .from('sf_tickets_klf')
      .update({ statut: 'resolu' })
      .eq('id', ticketId);

    // 3. Ajuster les points de l'apprenant
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
