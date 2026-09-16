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
  pin_code?: string;
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

export type TicketResolutionStatus = 'en_attente_validation' | 'valide' | 'a_corriger';
export type TicketResolutionCategory = 'materiel' | 'systeme' | 'reseau' | 'applicatif';

export interface TicketResolution {
  id: string;
  ticket_id: string;
  apprenant_id: string;
  diagnostic_categorie: TicketResolutionCategory;
  diagnostic_urgence: TicketUrgency;
  demarche_technique: string;
  message_usager: string;
  statut: TicketResolutionStatus;
  feedback_formateur?: string | null;
  points_attribues: number;
  soumis_le: string;
  evalue_le?: string | null;
  evalue_par?: string | null;
  apprenant?: Apprenant;
  ticket?: TicketKLF;
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

export interface QuizInfractionLog {
  type: string;
  timestamp: string;
  details?: string;
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
  infractions_count?: number;
  infractions_log?: QuizInfractionLog[];
  closed_for_cheating?: boolean;
  apprenant?: Apprenant;
}

export interface QuizWithStats extends Quiz {
  total_submissions?: number;
  total_students?: number;
  average_score?: number;
  submissions?: QuizSubmission[];
}

// =========================================================================
// MODULE QUALIOPI AUDIT & REPORTING ENGINE (CFA FORE ALTERNANCE)
// =========================================================================

export interface QualiopiDomainDetail {
  domaine: string;
  total_questions: number;
  reponses_correctes: number;
  pourcentage: number;
  acquis: boolean;
}

export interface QualiopiStudentRow {
  apprenant_id: string;
  nom: string;
  prenom: string;
  email: string;
  equipe: string;
  avatar_url: string;
  points_klf_total: number;
  palier_actuel: string;
  // Indicateur 8 : Positionnement initial à l'entrée
  has_submitted_positionnement: boolean;
  date_test_positionnement: string;
  date_test_iso?: string;
  score_positionnement_sur_20: number | null;
  score_positionnement_pourcentage: number | null;
  seuil_atteint: boolean;
  statut_positionnement: 'Validé' | 'À consolider' | 'Non effectué';
  domaines: QualiopiDomainDetail[];
  // Grille détaillée multi-épreuves TIP2 (Bureautique & RAN)
  score_ran_sur_20?: number | null;
  score_word_sur_20?: number | null;
  score_excel_sur_20?: number | null;
  score_outlook_sur_20?: number | null;
  moyenne_bureautique_sur_20?: number | null;
  statut_bureautique?: 'Validé' | 'À consolider' | 'Non effectué';
  // Indicateur 11 : Progression continue & DP
  badges_obtenus_total: number;
  dp_rubriques_validees_count: number;
  dp_rubrique_1: boolean;
  dp_rubrique_2: boolean;
  dp_rubrique_3: boolean;
  dp_rubrique_4: boolean;
  dp_rubrique_5: boolean;
  statut_dossier_professionnel: DPStatus | string;
  avis_formateur: string;
}

export interface QualiopiKPIs {
  total_stagiaires: number;
  count_passage_test: number;
  taux_passage_test: number;
  moyenne_generale_positionnement: number;
  moyenne_ran?: number;
  moyenne_word?: number;
  moyenne_excel?: number;
  moyenne_outlook?: number;
  moyenne_bureautique_promo?: number;
  taux_avancement_moyen_dp: number;
  total_badges_distribues: number;
  promotion_nom: string;
  session_code: string;
  formateur_nom: string;
  centre_formation: string;
  generated_at: string;
}

export interface QualiopiReportData {
  students: QualiopiStudentRow[];
  kpis: QualiopiKPIs;
}
