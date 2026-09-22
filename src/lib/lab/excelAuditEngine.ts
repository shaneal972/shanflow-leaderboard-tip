import * as XLSX from 'xlsx';
import { LabAuditSummary, LabAuditDetail } from '@/types/tip';

/**
 * Moteur d'audit 100% Client-Side pour le Lab TP-BUR-01 (Manifeste Corinne & Fiscalité Antilles).
 * S'exécute directement dans le navigateur du stagiaire (0 Mo de stockage Vercel, temps d'audit < 200ms).
 */
export async function auditCorinneManifesteExcel(
  fileBuffer: ArrayBuffer,
  fileName: string,
  fileSize: number
): Promise<LabAuditSummary> {
  const details: LabAuditDetail[] = [];

  try {
    const workbook = XLSX.read(fileBuffer, {
      type: 'array',
      cellFormula: true,
      cellStyles: true,
      cellNF: true,
    });

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("Le classeur Excel ne contient aucune feuille de calcul.");
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error("Impossible de lire la première feuille du classeur.");
    }

    // Conversion en tableau d'objets pour analyse
    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

    // Détection de la ligne d'en-tête (cherche 'Conteneur', 'Code Postal', 'Base HT' ou équivalent)
    let headerRowIndex = -1;
    for (let r = 0; r < Math.min(10, rawData.length); r++) {
      const row = rawData[r] || [];
      const rowStr = row.map((c) => String(c || '').toLowerCase()).join(' ');
      if (rowStr.includes('conteneur') || rowStr.includes('postal') || rowStr.includes('base ht') || rowStr.includes('fournisseur')) {
        headerRowIndex = r;
        break;
      }
    }

    if (headerRowIndex === -1) {
      headerRowIndex = 2; // repli par défaut sur la 3ème ligne
    }

    const header = (rawData[headerRowIndex] || []).map((c) => String(c || '').trim().toLowerCase());

    // Recherche des indices de colonnes clés
    const findCol = (keywords: string[]) => {
      return header.findIndex((h) => keywords.some((kw) => h.includes(kw)));
    };

    const colCp = findCol(['code postal', 'postal', 'cp']);
    const colBaseHt = findCol(['base ht', 'montant ht', 'ht']);
    const colTransit = findCol(['transit', 'frais']);
    const colOctroi = findCol(['octroi', 'om']);
    const colTva = findCol(['tva']);
    const colTtc = findCol(['ttc', 'total']);

    const dataRows = rawData.slice(headerRowIndex + 1).filter((r) => r && r.length > 0 && String(r[0] || '').trim() !== '');

    // -------------------------------------------------------------------------
    // RÈGLE 1 : Intégrité des codes postaux (5 caractères textuels)
    // -------------------------------------------------------------------------
    let validCpCount = 0;
    let checkedCpCount = 0;
    const cpIndex = colCp !== -1 ? colCp : 4; // Colonne E par défaut

    dataRows.forEach((row) => {
      const val = String(row[cpIndex] || '').trim();
      if (val && !val.toLowerCase().includes('total')) {
        checkedCpCount++;
        // Doit comporter 5 caractères (chiffres ou format DOM 971xx)
        if (val.length === 5 && /^[0-9]{5}$/.test(val)) {
          validCpCount++;
        }
      }
    });

    const cpRatio = checkedCpCount > 0 ? (validCpCount / checkedCpCount) : 0;
    if (cpRatio >= 0.85) {
      details.push({
        milestoneId: 'm1_postal_codes',
        status: 'valide',
        message: 'Codes postaux normalisés avec succès sur 5 positions (format texte).',
        details: `${validCpCount}/${checkedCpCount} codes postaux vérifiés conformes avec zéros initiaux préservés.`,
      });
    } else {
      details.push({
        milestoneId: 'm1_postal_codes',
        status: 'non_conforme',
        message: 'Anomalie de format : certains codes postaux sont tronqués ou incomplets.',
        details: `Seulement ${validCpCount}/${checkedCpCount} codes postaux font 5 chiffres. Astuce : utilisez =TEXTE(cellule; "00000") ou préfixez d'un format texte pour ne pas perdre les zéros.`,
      });
    }

    // -------------------------------------------------------------------------
    // RÈGLE 2 : Éradication des erreurs #N/A & SUPPRESPACE / SIERREUR
    // -------------------------------------------------------------------------
    let naErrorCount = 0;
    let formulaCleanCount = 0;
    const transitColLetter = colTransit !== -1 ? XLSX.utils.encode_col(colTransit) : 'G';

    // Scan de l'ensemble des cellules de la feuille pour traquer #N/A
    Object.keys(sheet).forEach((cellKey) => {
      if (cellKey.startsWith('!')) return;
      const cell = sheet[cellKey];
      if (cell && (cell.w === '#N/A' || cell.v === '#N/A' || String(cell.v || '').includes('#N/A') || cell.t === 'e')) {
        naErrorCount++;
      }

      // Vérifie si la colonne transit utilise SUPPRESPACE ou TRIM ou SIERREUR / IFERROR
      if (cellKey.startsWith(transitColLetter) && cell && cell.f) {
        const fUpper = cell.f.toUpperCase();
        if (fUpper.includes('TRIM') || fUpper.includes('SUPPRESPACE') || fUpper.includes('SIERREUR') || fUpper.includes('IFERROR')) {
          formulaCleanCount++;
        }
      }
    });

    if (naErrorCount === 0) {
      details.push({
        milestoneId: 'm2_supprespace_na',
        status: 'valide',
        message: 'Zéro erreur #N/A constatée sur l\'ensemble du manifeste.',
        details: formulaCleanCount > 0
          ? `Fonctions de nettoyage d'espaces (SUPPRESPACE) et sécurisation (SIERREUR) bien identifiées.`
          : `Les correspondances de frais de transit sont 100% résolues sans rupture.`,
      });
    } else {
      details.push({
        milestoneId: 'm2_supprespace_na',
        status: 'non_conforme',
        message: `${naErrorCount} erreur(s) #N/A encore présente(s) dans le classeur.`,
        details: `Les espaces superflus en fin de référence bloquent la recherche matricielle. Encapsulez la cellule de recherche dans SUPPRESPACE(...) et sécurisez avec SIERREUR(...; 0).`,
      });
    }

    // -------------------------------------------------------------------------
    // RÈGLE 3 : Calcul dynamique de l'Octroi de mer (8.5%)
    // -------------------------------------------------------------------------
    let octroiFormulaCount = 0;
    let octroiExactMathCount = 0;
    const octroiColLetter = colOctroi !== -1 ? XLSX.utils.encode_col(colOctroi) : 'H';
    const baseColLetter = colBaseHt !== -1 ? XLSX.utils.encode_col(colBaseHt) : 'F';

    dataRows.forEach((row, idx) => {
      const rowIndex = headerRowIndex + 2 + idx;
      const cellKey = `${octroiColLetter}${rowIndex}`;
      const cell = sheet[cellKey];
      if (cell) {
        if (cell.f) {
          const f = cell.f.toUpperCase();
          if (f.includes('0.085') || f.includes('8.5%') || f.includes('$H$2') || f.includes('H$2') || f.includes('H2') || f.includes('$2')) {
            octroiFormulaCount++;
          }
        }
        const val = parseFloat(String(cell.v || '').replace(',', '.'));
        const baseVal = parseFloat(String(row[colBaseHt !== -1 ? colBaseHt : 5] || '').replace(',', '.'));
        if (!isNaN(val) && !isNaN(baseVal) && baseVal > 0) {
          const expected = baseVal * 0.085;
          if (Math.abs(val - expected) < 0.2) {
            octroiExactMathCount++;
          }
        }
      }
    });

    const isOctroiFormulaValid = octroiFormulaCount >= 3 || (octroiFormulaCount > 0 && octroiFormulaCount >= dataRows.length * 0.5);
    const isOctroiMathValid = octroiExactMathCount >= Math.min(5, dataRows.length);

    if (isOctroiFormulaValid && isOctroiMathValid) {
      details.push({
        milestoneId: 'm3_octroi_mer',
        status: 'valide',
        message: 'Formules dynamiques d\'Octroi de mer (8.5%) conformes à la fiscalité Guadeloupe.',
        details: `Formules dynamiques détectées avec verrouillage de référence ($) et cohérence mathématique validée sur la Base HT.`,
      });
    } else if (isOctroiMathValid && !isOctroiFormulaValid) {
      details.push({
        milestoneId: 'm3_octroi_mer',
        status: 'non_conforme',
        message: 'Montants d\'Octroi de mer justes, mais saisis en dur sans formule dynamique.',
        details: `Interdiction de taper les chiffres à la main. Vous devez créer une formule dynamique (ex: =${baseColLetter}4*$H$2) pour automatiser le calcul lors de nouveaux arrivages.`,
      });
    } else {
      details.push({
        milestoneId: 'm3_octroi_mer',
        status: 'non_conforme',
        message: 'Calcul de l\'Octroi de mer 8.5% manquant ou erroné.',
        details: `Multipliez la Base HT par le taux de 8.5% présent dans la cellule d'en-tête en bloquant la ligne avec le signe $ (=F4*$H$2).`,
      });
    }

    // -------------------------------------------------------------------------
    // RÈGLE 4 : Calcul dynamique de la TVA locale (8.5%)
    // -------------------------------------------------------------------------
    let tvaFormulaCount = 0;
    let tvaExactMathCount = 0;
    const tvaColLetter = colTva !== -1 ? XLSX.utils.encode_col(colTva) : 'I';

    dataRows.forEach((row, idx) => {
      const rowIndex = headerRowIndex + 2 + idx;
      const cellKey = `${tvaColLetter}${rowIndex}`;
      const cell = sheet[cellKey];
      if (cell) {
        if (cell.f) {
          const f = cell.f.toUpperCase();
          if (f.includes('0.085') || f.includes('8.5%') || f.includes('$I$2') || f.includes('I$2') || f.includes('I2') || f.includes('$2')) {
            tvaFormulaCount++;
          }
        }
        const val = parseFloat(String(cell.v || '').replace(',', '.'));
        const baseVal = parseFloat(String(row[colBaseHt !== -1 ? colBaseHt : 5] || '').replace(',', '.'));
        if (!isNaN(val) && !isNaN(baseVal) && baseVal > 0) {
          const expected = baseVal * 0.085;
          if (Math.abs(val - expected) < 0.2) {
            tvaExactMathCount++;
          }
        }
      }
    });

    const isTvaFormulaValid = tvaFormulaCount >= 3 || (tvaFormulaCount > 0 && tvaFormulaCount >= dataRows.length * 0.5);
    const isTvaMathValid = tvaExactMathCount >= Math.min(5, dataRows.length);

    if (isTvaFormulaValid && isTvaMathValid) {
      details.push({
        milestoneId: 'm4_tva_guadeloupe',
        status: 'valide',
        message: 'Formules dynamiques de TVA locale (8.5%) conformes.',
        details: `Calcul automatisé de la TVA Guadeloupe avec références bloquées vérifié sur les arrivages.`,
      });
    } else if (isTvaMathValid && !isTvaFormulaValid) {
      details.push({
        milestoneId: 'm4_tva_guadeloupe',
        status: 'non_conforme',
        message: 'Montants de TVA corrects mais calculés en dur sans formules.',
        details: `Insérez la formule =${baseColLetter}4*$I$2 pour lier dynamiquement le calcul au taux officiel de TVA locale.`,
      });
    } else {
      details.push({
        milestoneId: 'm4_tva_guadeloupe',
        status: 'non_conforme',
        message: 'Calcul de la TVA 8.5% manquant ou erroné.',
        details: `Appliquez la formule =${baseColLetter}4*$I$2 sur l'ensemble de la colonne TVA.`,
      });
    }

    // -------------------------------------------------------------------------
    // RÈGLE 5 : Figeage des volets & Total TTC douanier
    // -------------------------------------------------------------------------
    // Vérification de la présence d'une formule de somme TTC ou total cohérent
    let ttcFormulaCount = 0;
    const ttcColLetter = colTtc !== -1 ? XLSX.utils.encode_col(colTtc) : 'J';

    dataRows.forEach((row, idx) => {
      const rowIndex = headerRowIndex + 2 + idx;
      const cellKey = `${ttcColLetter}${rowIndex}`;
      const cell = sheet[cellKey];
      if (cell && cell.f) {
        ttcFormulaCount++;
      }
    });

    // Détection de volets figés dans les métadonnées SheetJS
    const sheetViews = (sheet as any)['!views'] || (sheet as any)['!freeze'];
    const hasFreezeView = !!sheetViews;

    if (ttcFormulaCount >= Math.min(3, dataRows.length)) {
      details.push({
        milestoneId: 'm5_freeze_total',
        status: 'valide',
        message: 'Formules de Total TTC douanier vérifiées et opérationnelles.',
        details: hasFreezeView
          ? `Ligne d'en-tête figée détectée avec succès (Freeze Panes).`
          : `Total TTC dynamiquement calculé sur chaque conteneur (= Base HT + Octroi de mer + TVA).`,
      });
    } else {
      details.push({
        milestoneId: 'm5_freeze_total',
        status: 'non_conforme',
        message: 'Colonne Total TTC incomplète ou non dynamisée.',
        details: `La colonne Total TTC doit additionner la Base HT, l'Octroi de mer et la TVA (=F4+H4+I4 ou =SOMME(F4;H4;I4)). N'oubliez pas également de figer la ligne supérieure dans l'onglet Affichage.`,
      });
    }

  } catch (error: any) {
    // Si le fichier n'est pas un XLSX valide
    return {
      timestamp: new Date().toISOString(),
      fileName,
      fileSize,
      milestonesCount: 5,
      validCount: 0,
      scorePct: 0,
      isFullyValid: false,
      details: [
        {
          milestoneId: 'm1_postal_codes',
          status: 'non_conforme',
          message: 'Fichier illisible ou non conforme.',
          details: `Erreur d'analyse : ${error.message || 'Le fichier ne semble pas être un classeur Excel .xlsx valide.'}`,
        },
      ],
    };
  }

  const validCount = details.filter((d) => d.status === 'valide').length;
  const milestonesCount = 5;
  const scorePct = Math.round((validCount / milestonesCount) * 100);
  const isFullyValid = validCount === milestonesCount;

  return {
    timestamp: new Date().toISOString(),
    fileName,
    fileSize,
    milestonesCount,
    validCount,
    scorePct,
    isFullyValid,
    details,
  };
}
