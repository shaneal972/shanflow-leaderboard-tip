/**
 * Cœur métier pur (Clean Architecture - Couche 1 Domain)
 * Calculs douaniers et fiscaux d'importation maritime aux Antilles (Guadeloupe 971 / Martinique 972)
 * et utilitaires purs de sanitisation documentaire.
 */

export interface ImportDutiesResult {
  montantHT: number;
  tauxOctroiPct: number;
  tauxTvaPct: number;
  montantOctroi: number;
  assietteTVA: number;
  montantTVA: number;
  totalTTC: number;
}

export const ANTILLES_TAX_RATES = Object.freeze({
  TVA_NORMALE_PCT: 8.5,
  TVA_REDUITE_PCT: 2.1,
  OCTROI_MER_STANDARD_PCT: 8.5,
});

function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calcule l'Octroi de mer, l'assiette douanière et la TVA locale (8,5 % ou 2,1 %)
 * conformément aux règles fiscales d'importation en Guadeloupe / Martinique :
 * - Montant Octroi de mer =Valeur HT * Taux Octroi
 * - Assiette TVA douanière = Valeur HT + Montant Octroi de mer
 * - Montant TVA = Assiette TVA * Taux TVA locale
 * - Total TTC dédouané = Assiette TVA + Montant TVA
 */
export function calculateImportDutiesAntilles(
  montantHTInput: number,
  tauxOctroiPctInput: number,
  tauxTvaPctInput: number
): ImportDutiesResult {
  const montantHT = Number.isFinite(montantHTInput) ? Math.max(0, montantHTInput) : 0;
  const tauxOctroiPct = Number.isFinite(tauxOctroiPctInput) ? Math.max(0, tauxOctroiPctInput) : 0;
  const tauxTvaPct = Number.isFinite(tauxTvaPctInput) ? Math.max(0, tauxTvaPctInput) : 0;

  const montantOctroi = roundCurrency((montantHT * tauxOctroiPct) / 100);
  const assietteTVA = roundCurrency(montantHT + montantOctroi);
  const montantTVA = roundCurrency((assietteTVA * tauxTvaPct) / 100);
  const totalTTC = roundCurrency(assietteTVA + montantTVA);

  return {
    montantHT: roundCurrency(montantHT),
    tauxOctroiPct,
    tauxTvaPct,
    montantOctroi,
    assietteTVA,
    montantTVA,
    totalTTC,
  };
}

/**
 * Échappe intégralement les caractères spéciaux HTML pour prévenir toute injection XSS
 * ou rupture de mise en page dans les gabarits PDF Gotenberg (Chromium).
 */
export function escapeHtml(input: string | null | undefined): string {
  if (!input) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Nettoie une saisie texte métier destinée à être stockée en base de données
 * sans altérer la ponctuation française légitime (apostrophes, guillemets, barres obliques)
 * tout en éliminant les caractères de contrôle invisibles et balises exécutables.
 */
export function sanitizePlainText(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<\s*\/?\s*script\b[^>]*>/gi, '')
    .trim();
}
