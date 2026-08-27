export type PalierType = 
  | 'Palier 0' 
  | 'Palier 1' 
  | 'Palier 2' 
  | 'Palier 3' 
  | 'Palier 4'
  | 'Formateur Référent';

export type BadgeRarity = 'commun' | 'rare' | 'epique' | 'legendaire';

export type TicketUrgency = 'P1' | 'P2' | 'P3';
export type TicketStatus = 'ouvert' | 'en_cours' | 'resolu';

export type DPStatus = 'brouillon' | 'en_revue' | 'valide_jury';

export interface Apprenant {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  avatar_url: string;
  points_total: number;
  palier_actuel: PalierType;
  equipe: string;
  is_admin: boolean;
  consentement_rgpd: boolean;
  created_at?: string;
}

export interface LeaderboardApprenant {
  id: string;
  prenom: string;
  nom_initial: string;
  avatar_url: string;
  points_total: number;
  palier_actuel: PalierType;
  equipe: string;
  rank?: number;
  badges_count?: number;
}

export interface Badge {
  id: string;
  titre: string;
  description: string;
  palier: PalierType;
  points_requis: number;
  icone_url: string;
  rarete: BadgeRarity;
  unlocked?: boolean;
  obtenu_le?: string;
}

export interface Achievement {
  id: string;
  apprenant_id: string;
  badge_id: string;
  obtenu_le: string;
}

export interface TicketKLF {
  id: string;
  service: string;
  demandeur: string;
  titre: string;
  description: string;
  urgence: TicketUrgency;
  points_valeur: number;
  statut: TicketStatus;
}

export interface DPSuivi {
  apprenant_id: string;
  rubrique_1: boolean;
  rubrique_2: boolean;
  rubrique_3: boolean;
  rubrique_4: boolean;
  rubrique_5: boolean;
  statut_dp: DPStatus;
  updated_at?: string;
}

export type QuizStatus = 'ferme' | 'session_ouverte' | 'correction_publiee';

export interface QuizOption {
  id: string;
  question_id: string;
  lettre: 'A' | 'B' | 'C' | 'D';
  texte: string;
  is_correct?: boolean; // Présent uniquement si session clôturée et corrigé publié
  dsi_explanation?: string; // Présent uniquement si session clôturée et corrigé publié
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  ordre: number;
  theme: string;
  enonce: string;
  points: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  titre: string;
  description: string;
  palier: PalierType | string;
  seuil_validation: number;
  points_recompense: number;
  duree_minutes: number;
  badge_recompense?: string;
  statut: QuizStatus;
  created_at?: string;
  questions_count?: number;
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  apprenant_id: string;
  reponses_choisies: Record<string, string>; // { [question_id]: option_id }
  score_obtenu: number;
  score_pourcentage: number;
  is_validated: boolean;
  submitted_at: string;
  points_attribues: number;
  apprenant?: Apprenant;
}

export interface QuizWithStats extends Quiz {
  total_submissions?: number;
  total_students?: number;
  average_score?: number;
  submissions?: QuizSubmission[];
}
