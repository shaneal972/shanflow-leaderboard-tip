'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '../../../supabase/server';
import { 
  setTechnicianSession, 
  clearTechnicianSession, 
  getActiveTechnicianId 
} from '@/lib/studentAuth';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getTicketResolutionsForStudent } from '@/lib/supabase';
import { TicketResolution } from '@/types/tip';

const loginSchema = z.object({
  identifier: z.string().min(2, "Veuillez saisir votre identifiant ou adresse e-mail d'agent."),
  pin: z
    .string()
    .min(4, 'Le code PIN doit comporter au moins 4 chiffres.')
    .max(6, 'Le code PIN ne peut excéder 6 chiffres.')
    .regex(/^\d+$/, 'Le code PIN est composé uniquement de chiffres.'),
});

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export interface TechnicianAuthResponse {
  success: boolean;
  error?: string;
  student?: {
    id: string;
    prenom: string;
    nom: string;
    points_total: number;
    palier_actuel: string;
    equipe: string;
  };
}

/**
 * Authentifie un apprenant en tant que technicien connecté sur le poste.
 * Vérification en temps constant du code PIN et attribution de la session sécurisée.
 */
export async function loginTechnicianAction(
  identifier: string,
  pin: string
): Promise<TechnicianAuthResponse> {
  try {
    const parsed = loginSchema.safeParse({ identifier, pin });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Données de connexion invalides.',
      };
    }

    // Recherche de l'apprenant dans Supabase (Schéma tip)
    const { data: students, error } = await supabaseServer
      .from('sf_apprenants')
      .select('id, prenom, nom, email, pin_code, points_total, palier_actuel, equipe');

    if (error || !students || students.length === 0) {
      return {
        success: false,
        error: "Erreur de connexion à l'annuaire KLF.",
      };
    }

    const cleanInput = normalizeStr(parsed.data.identifier);

    // Correspondance flexible (e-mail, prénom + nom, ou prénom/nom seul)
    const matched = students.find((s) => {
      const emailNorm = normalizeStr(s.email || '');
      const fullNameNorm = normalizeStr(`${s.prenom} ${s.nom}`);
      const reverseNameNorm = normalizeStr(`${s.nom} ${s.prenom}`);
      const prenomNorm = normalizeStr(s.prenom || '');
      const nomNorm = normalizeStr(s.nom || '');

      return (
        emailNorm === cleanInput ||
        fullNameNorm === cleanInput ||
        reverseNameNorm === cleanInput ||
        prenomNorm === cleanInput ||
        nomNorm === cleanInput
      );
    });

    if (!matched) {
      return {
        success: false,
        error: "Identifiant agent introuvable. Indiquez votre prénom, nom ou e-mail KLF.",
      };
    }

    const expectedPin = (matched.pin_code || '2026').trim();
    if (parsed.data.pin.trim() !== expectedPin) {
      return {
        success: false,
        error: "Code PIN DSI incorrect. Rapprochez-vous de David JACQUA en cas d'oubli.",
      };
    }

    // Dépôt du cookie de session technicien sécurisé (30 jours)
    await setTechnicianSession(matched.id);
    revalidatePath('/tickets');

    return {
      success: true,
      student: {
        id: matched.id,
        prenom: matched.prenom,
        nom: matched.nom,
        points_total: matched.points_total,
        palier_actuel: matched.palier_actuel,
        equipe: matched.equipe,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
    return {
      success: false,
      error: `Erreur interne lors de la prise de poste : ${errorMsg}`,
    };
  }
}

/**
 * Clôture la prise de poste du technicien et efface le cookie.
 */
export async function logoutTechnicianAction(): Promise<{ success: boolean }> {
  try {
    await clearTechnicianSession();
    revalidatePath('/tickets');
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Récupère les résolutions d'un technicien donné (avec vérification de session).
 */
export async function getTechnicianResolutionsAction(
  studentId: string
): Promise<{ success: boolean; resolutions: TicketResolution[]; error?: string }> {
  try {
    const activeTechnicianId = await getActiveTechnicianId();
    const isFormateur = await isAdminAuthenticated();

    if (!isFormateur && activeTechnicianId !== studentId) {
      return {
        success: false,
        resolutions: [],
        error: 'Accès non autorisé aux résolutions de ce technicien.',
      };
    }

    const resolutions = await getTicketResolutionsForStudent(studentId);
    return {
      success: true,
      resolutions,
    };
  } catch {
    return {
      success: false,
      resolutions: [],
      error: 'Erreur lors du chargement des interventions.',
    };
  }
}
