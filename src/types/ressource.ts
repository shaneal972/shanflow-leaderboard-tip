export type BureautiqueTool = 'sheets' | 'docs' | 'slides' | 'gmail';

export interface ShortcutItem {
  touche: string;
  action: string;
  plateforme?: 'windows' | 'mac' | 'universel';
}

export interface StepItem {
  numero: number;
  titre: string;
  detail: string;
  consigneTech?: string;
  exempleCode?: string;
  astuceDSI?: string;
}

export interface MiniQuizQuestion {
  question: string;
  options: string[];
  reponseCorrecte: number; // Index 0..N
  explication: string;
}

export interface BureautiqueRessource {
  id: string;
  slug: string;
  titre: string;
  outil: BureautiqueTool;
  categorie: string;
  palier: 'Palier 0' | 'Palier 1' | 'Palier 2' | 'Palier 3';
  tempsLecture: string; // Ex: '8-10 min'
  resume: string;
  miseEnSituationKLF: string;
  objectifsPeda: string[];
  prerequis?: string[];
  raccourcisCles: ShortcutItem[];
  etapesDetaillees: StepItem[];
  piegesAEviter: string[];
  exerciceApplication: {
    enonce: string;
    criteresReussite: string[];
    solutionAttendue?: string;
    fichierNom?: string;
    fichierUrl?: string;
  };
  miniQuiz?: MiniQuizQuestion[];
  ticketAssocieId?: string; // Ex: 'TCK-101'
  badgeAssocieId?: string;
  fichierExerciceNom?: string;
  fichierExerciceUrl?: string;
  fichierFormat?: string;
  autopsieAvantApres?: {
    defauts: string[];
    solutionsDSI: string[];
  };
}
