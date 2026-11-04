export type PalierLevel =
  | 'Palier 0'
  | 'Palier 1'
  | 'Palier 2'
  | 'Palier 3'
  | 'Palier 4'
  | 'Formateur Référent';

export interface PalierDefinition {
  id: Exclude<PalierLevel, 'Formateur Référent'>;
  name: string;
  desc: string;
  minPoints: number;
}

/**
 * Référentiel unique des 5 paliers de compétences TIP (Promotion KLF Jarry).
 * Source de vérité partagée entre le Domaine, les Server Actions et le Passeport.
 */
export const PALIERS_KLF: readonly PalierDefinition[] = Object.freeze([
  {
    id: 'Palier 0',
    name: 'Palier 0 : Raccourcis & Hygiène',
    desc: 'RAN & Standards clavier',
    minPoints: 0,
  },
  {
    id: 'Palier 1',
    name: 'Palier 1 : Standard DSI & Parc',
    desc: 'Mise en page & Nettoyage Tableur',
    minPoints: 150,
  },
  {
    id: 'Palier 2',
    name: 'Palier 2 : Helpdesk Hero',
    desc: 'Dépannage Facturation & Quai REAC',
    minPoints: 350,
  },
  {
    id: 'Palier 3',
    name: 'Palier 3 : TIP Augmenté',
    desc: 'Prompt Engineering & Copilote IA',
    minPoints: 650,
  },
  {
    id: 'Palier 4',
    name: 'Palier 4 : NetOps & Automation',
    desc: 'Workflows n8n & Alertes Helpdesk',
    minPoints: 1000,
  },
]);

/**
 * Calcule de manière pure et déterministe le palier KLF correspondant à un total de points.
 * Préserve le statut spécial "Formateur Référent" pour les comptes administrateurs.
 */
export function calculatePalierForPoints(
  pointsTotal: number,
  options?: { isAdmin?: boolean; currentPalier?: string | null }
): PalierLevel {
  if (options?.isAdmin || options?.currentPalier === 'Formateur Référent') {
    return 'Formateur Référent';
  }

  const safePoints = Number.isFinite(pointsTotal) ? Math.max(0, Math.floor(pointsTotal)) : 0;

  if (safePoints >= 1000) return 'Palier 4';
  if (safePoints >= 650) return 'Palier 3';
  if (safePoints >= 350) return 'Palier 2';
  if (safePoints >= 150) return 'Palier 1';
  return 'Palier 0';
}
