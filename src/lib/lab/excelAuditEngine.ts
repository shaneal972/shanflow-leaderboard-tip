import * as XLSX from 'xlsx';
import type { LabAuditSummary, LabAuditDetail } from '@/types/tip';

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

  // Garde-fou de sécurité : taille maximale du buffer (10 Mo)
  if (fileBuffer.byteLength > 10 * 1024 * 1024 || fileSize > 10 * 1024 * 1024) {
    throw new Error("Le fichier dépasse la limite maximale autorisée de 10 Mo.");
  }

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

    // Extraction et filtrage strict : conteneurs uniquement (exclure lignes vides et ligne TOTAL)
    interface DataRowInfo {
      row: any[];
      excelRow: number;
    }

    const dataRowsInfo: DataRowInfo[] = [];
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const r = rawData[i];
      if (!r || r.length === 0) continue;
      const firstCol = String(r[0] || '').trim();
      if (!firstCol || firstCol.toLowerCase().includes('total')) continue;
      dataRowsInfo.push({ row: r, excelRow: i + 1 });
    }

    const dataRows = dataRowsInfo.map((d) => d.row);

    // Lettres de colonnes clés
    const cpColLetter = colCp !== -1 ? XLSX.utils.encode_col(colCp) : 'E';
    const baseColLetter = colBaseHt !== -1 ? XLSX.utils.encode_col(colBaseHt) : 'F';
    const transitColLetter = colTransit !== -1 ? XLSX.utils.encode_col(colTransit) : 'G';
    const octroiColLetter = colOctroi !== -1 ? XLSX.utils.encode_col(colOctroi) : 'H';
    const tvaColLetter = colTva !== -1 ? XLSX.utils.encode_col(colTva) : 'I';
    const ttcColLetter = colTtc !== -1 ? XLSX.utils.encode_col(colTtc) : 'J';

    // -------------------------------------------------------------------------
    // RÈGLE 1 : Intégrité des codes postaux (5 caractères textuels)
    // -------------------------------------------------------------------------
    let validCpCount = 0;
    let checkedCpCount = 0;
    const cpIndex = colCp !== -1 ? colCp : 4; // Colonne E par défaut

    dataRowsInfo.forEach((d) => {
      checkedCpCount++;
      const cellKey = `${cpColLetter}${d.excelRow}`;
      const cell = sheet[cellKey];
      let isCpValid = false;

      // 1. Chaîne directe depuis rawData (ex: si texte ou cell.w déjà formaté sur 5 chiffres)
      const rawVal = String(d.row[cpIndex] !== undefined && d.row[cpIndex] !== null ? d.row[cpIndex] : '').trim();
      if (/^[0-9]{5}$/.test(rawVal)) {
        isCpValid = true;
      }

      // 2. Inspection de la cellule SheetJS (format personnalisé 00000 ou formule TEXT)
      if (!isCpValid && cell) {
        const cellValStr = String(cell.v !== undefined && cell.v !== null ? cell.v : '').trim();
        const cellWStr = String(cell.w || '').trim();

        if (/^[0-9]{5}$/.test(cellValStr) || /^[0-9]{5}$/.test(cellWStr)) {
          isCpValid = true;
        } else {
          const formatStr = String(cell.z || '').toLowerCase();
          const formulaStr = String(cell.f || '').toUpperCase();
          const has00000Pattern =
            formatStr.includes('00000') || formulaStr.includes('00000') || formulaStr.includes('TEXT');
          if (has00000Pattern) {
            const padded = cellValStr.padStart(5, '0');
            if (/^[0-9]{5}$/.test(padded)) {
              isCpValid = true;
            }
          }
        }
      }

      if (isCpValid) {
        validCpCount++;
      }
    });

    const isCpAllValid = checkedCpCount >= 5 && validCpCount === checkedCpCount;
    if (isCpAllValid) {
      details.push({
        milestoneId: 'm1_postal_codes',
        status: 'valide',
        message: 'Codes postaux normalisés avec succès sur 5 positions (format texte / masque 00000).',
        details: `${validCpCount}/${checkedCpCount} codes postaux vérifiés conformes avec zéros initiaux préservés.`,
      });
    } else {
      details.push({
        milestoneId: 'm1_postal_codes',
        status: 'non_conforme',
        message: 'Anomalie de format : certains codes postaux sont tronqués ou incomplets.',
        details: `Seulement ${validCpCount}/${checkedCpCount} codes postaux font 5 chiffres. Astuce : utilisez =TEXTE(cellule; "00000"), le format personnalisé 00000, ou préfixez d'un format texte pour ne pas perdre les zéros.`,
      });
    }

    // -------------------------------------------------------------------------
    // RÈGLE 2 : Éradication des erreurs #N/A & SUPPRESPACE / SIERREUR
    // -------------------------------------------------------------------------
    let naErrorCount = 0;
    let formulaCleanCount = 0;

    // Scan de l'ensemble des cellules de la feuille pour traquer #N/A et erreurs OpenXML
    Object.keys(sheet).forEach((cellKey) => {
      if (cellKey.startsWith('!')) return;
      const cell = sheet[cellKey];
      if (!cell) return;

      const wStr = String(cell.w || '');
      const vStr = String(cell.v || '');
      if (
        cell.t === 'e' ||
        wStr.includes('#N/A') ||
        vStr.includes('#N/A') ||
        wStr.includes('#VALEUR!') ||
        wStr.includes('#VALUE!') ||
        wStr.includes('#REF!')
      ) {
        naErrorCount++;
      }

      // Vérifie si la colonne transit utilise SUPPRESPACE ou TRIM ou SIERREUR / IFERROR
      if (cellKey.startsWith(transitColLetter) && cell.f) {
        const fUpper = cell.f.toUpperCase();
        if (
          fUpper.includes('TRIM') ||
          fUpper.includes('SUPPRESPACE') ||
          fUpper.includes('SIERREUR') ||
          fUpper.includes('IFERROR') ||
          fUpper.includes('CLEAN') ||
          fUpper.includes('EPURAGE')
        ) {
          formulaCleanCount++;
        }
      }
    });

    // Vérification qu'au moins 8 lignes de la colonne Frais Transit contiennent une valeur numérique valide (> 0)
    let validTransitCount = 0;
    dataRowsInfo.forEach((d) => {
      const cellKey = `${transitColLetter}${d.excelRow}`;
      const cell = sheet[cellKey];
      let transitVal = NaN;

      if (cell && cell.t !== 'e') {
        transitVal = parseFloat(String(cell.v !== undefined ? cell.v : '').replace(',', '.'));
      }
      if (isNaN(transitVal)) {
        const rawTransit = d.row[colTransit !== -1 ? colTransit : 6];
        transitVal = parseFloat(String(rawTransit || '').replace(',', '.'));
      }

      if (!isNaN(transitVal) && transitVal > 0) {
        validTransitCount++;
      }
    });

    const isTransitMilestoneValid = naErrorCount === 0 && validTransitCount >= Math.min(8, dataRowsInfo.length);

    if (isTransitMilestoneValid) {
      details.push({
        milestoneId: 'm2_supprespace_na',
        status: 'valide',
        message: 'Zéro erreur #N/A constatée et frais de transit intégralement résolus.',
        details: formulaCleanCount > 0
          ? `${validTransitCount}/${dataRowsInfo.length} frais de transit calculés avec succès (fonctions SUPPRESPACE / SIERREUR identifiées).`
          : `${validTransitCount}/${dataRowsInfo.length} correspondances de frais de transit résolues sans rupture.`,
      });
    } else {
      details.push({
        milestoneId: 'm2_supprespace_na',
        status: 'non_conforme',
        message:
          naErrorCount > 0
            ? `${naErrorCount} erreur(s) #N/A encore présente(s) dans le classeur.`
            : `Colonne Frais Transit incomplète (${validTransitCount}/${dataRowsInfo.length} valeurs valides).`,
        details: `Les espaces superflus en fin de référence bloquent la recherche matricielle. Encapsulez la cellule de recherche dans SUPPRESPACE(...) et sécurisez avec SIERREUR(...; 0).`,
      });
    }

    // -------------------------------------------------------------------------
    // RÈGLE 3 : Calcul dynamique de l'Octroi de mer (8.5%)
    // -------------------------------------------------------------------------
    let octroiFormulaCount = 0;
    let octroiExactMathCount = 0;

    dataRowsInfo.forEach((d) => {
      const cellKey = `${octroiColLetter}${d.excelRow}`;
      const cell = sheet[cellKey];
      if (cell) {
        if (cell.f) {
          const f = cell.f.toUpperCase();
          if (
            f.includes('0.085') ||
            f.includes('8.5%') ||
            f.includes('$H$2') ||
            f.includes('H$2') ||
            f.includes('H2') ||
            f.includes('$F$2') ||
            f.includes('F$2') ||
            f.includes('$2')
          ) {
            octroiFormulaCount++;
          }
        }
        const val = parseFloat(String(cell.v !== undefined ? cell.v : '').replace(',', '.'));
        const baseCell = sheet[`${baseColLetter}${d.excelRow}`];
        const baseVal = parseFloat(
          String(baseCell?.v !== undefined ? baseCell.v : d.row[colBaseHt !== -1 ? colBaseHt : 5] || '').replace(
            ',',
            '.'
          )
        );

        const transitCell = sheet[`${transitColLetter}${d.excelRow}`];
        const transitVal =
          parseFloat(
            String(transitCell?.v !== undefined ? transitCell.v : d.row[colTransit !== -1 ? colTransit : 6] || '0').replace(
              ',',
              '.'
            )
          ) || 0;

        if (!isNaN(val) && !isNaN(baseVal) && baseVal > 0) {
          const expectedBaseOnly = baseVal * 0.085;
          const expectedWithTransit = (baseVal + transitVal) * 0.085;
          if (Math.abs(val - expectedBaseOnly) < 0.25 || Math.abs(val - expectedWithTransit) < 0.25) {
            octroiExactMathCount++;
          }
        }
      }
    });

    const isOctroiFormulaValid =
      octroiFormulaCount >= 3 || (octroiFormulaCount > 0 && octroiFormulaCount >= dataRowsInfo.length * 0.5);
    const isOctroiMathValid = octroiExactMathCount >= Math.min(5, dataRowsInfo.length);

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

    dataRowsInfo.forEach((d) => {
      const cellKey = `${tvaColLetter}${d.excelRow}`;
      const cell = sheet[cellKey];
      if (cell) {
        if (cell.f) {
          const f = cell.f.toUpperCase();
          if (
            f.includes('0.085') ||
            f.includes('8.5%') ||
            f.includes('$I$2') ||
            f.includes('I$2') ||
            f.includes('I2') ||
            f.includes('$H$2') ||
            f.includes('H$2') ||
            f.includes('$2')
          ) {
            tvaFormulaCount++;
          }
        }
        const val = parseFloat(String(cell.v !== undefined ? cell.v : '').replace(',', '.'));
        const baseCell = sheet[`${baseColLetter}${d.excelRow}`];
        const baseVal = parseFloat(
          String(baseCell?.v !== undefined ? baseCell.v : d.row[colBaseHt !== -1 ? colBaseHt : 5] || '').replace(
            ',',
            '.'
          )
        );

        const octroiCell = sheet[`${octroiColLetter}${d.excelRow}`];
        const octroiVal =
          parseFloat(
            String(octroiCell?.v !== undefined ? octroiCell.v : d.row[colOctroi !== -1 ? colOctroi : 7] || '0').replace(
              ',',
              '.'
            )
          ) || baseVal * 0.085;

        const transitCell = sheet[`${transitColLetter}${d.excelRow}`];
        const transitVal =
          parseFloat(
            String(transitCell?.v !== undefined ? transitCell.v : d.row[colTransit !== -1 ? colTransit : 6] || '0').replace(
              ',',
              '.'
            )
          ) || 0;

        if (!isNaN(val) && !isNaN(baseVal) && baseVal > 0) {
          // 1. Calcul direct sur Base HT : baseVal * 0.085
          const exp1 = baseVal * 0.085;
          // 2. Assiette douanière Antilles : (Base HT + Octroi) * 0.085
          const exp2 = (baseVal + octroiVal) * 0.085;
          // 3. Assiette douanière complète : (Base HT + Transit + Octroi) * 0.085
          const exp3 = (baseVal + transitVal + octroiVal) * 0.085;
          // 4. Base HT + Transit : (Base HT + Transit) * 0.085
          const exp4 = (baseVal + transitVal) * 0.085;

          if (
            Math.abs(val - exp1) < 0.25 ||
            Math.abs(val - exp2) < 0.25 ||
            Math.abs(val - exp3) < 0.25 ||
            Math.abs(val - exp4) < 0.25
          ) {
            tvaExactMathCount++;
          }
        }
      }
    });

    const isTvaFormulaValid =
      tvaFormulaCount >= 3 || (tvaFormulaCount > 0 && tvaFormulaCount >= dataRowsInfo.length * 0.5);
    const isTvaMathValid = tvaExactMathCount >= Math.min(5, dataRowsInfo.length);

    if (isTvaFormulaValid && isTvaMathValid) {
      details.push({
        milestoneId: 'm4_tva_guadeloupe',
        status: 'valide',
        message: 'Formules dynamiques de TVA locale (8.5%) conformes.',
        details: `Calcul automatisé de la TVA Guadeloupe avec références bloquées vérifié sur les arrivages (assiette standard ou douanière acceptée).`,
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
    let ttcFormulaCount = 0;
    let ttcMathCount = 0;

    dataRowsInfo.forEach((d) => {
      const cellKey = `${ttcColLetter}${d.excelRow}`;
      const cell = sheet[cellKey];
      if (cell) {
        if (cell.f) {
          ttcFormulaCount++;
        }
        const val = parseFloat(String(cell.v !== undefined ? cell.v : '').replace(',', '.'));
        const baseCell = sheet[`${baseColLetter}${d.excelRow}`];
        const baseVal = parseFloat(
          String(baseCell?.v !== undefined ? baseCell.v : d.row[colBaseHt !== -1 ? colBaseHt : 5] || '').replace(
            ',',
            '.'
          )
        );

        const octroiCell = sheet[`${octroiColLetter}${d.excelRow}`];
        const octroiVal =
          parseFloat(
            String(octroiCell?.v !== undefined ? octroiCell.v : d.row[colOctroi !== -1 ? colOctroi : 7] || '0').replace(
              ',',
              '.'
            )
          ) || baseVal * 0.085;

        const tvaCell = sheet[`${tvaColLetter}${d.excelRow}`];
        const tvaVal =
          parseFloat(
            String(tvaCell?.v !== undefined ? tvaCell.v : d.row[colTva !== -1 ? colTva : 8] || '0').replace(
              ',',
              '.'
            )
          ) || baseVal * 0.085;

        const transitCell = sheet[`${transitColLetter}${d.excelRow}`];
        const transitVal =
          parseFloat(
            String(transitCell?.v !== undefined ? transitCell.v : d.row[colTransit !== -1 ? colTransit : 6] || '0').replace(
              ',',
              '.'
            )
          ) || 0;

        if (!isNaN(val) && !isNaN(baseVal) && baseVal > 0) {
          // Option A: Base HT + Octroi + TVA
          const expA = baseVal + octroiVal + tvaVal;
          // Option B: Base HT + Frais Transit + Octroi + TVA
          const expB = baseVal + transitVal + octroiVal + tvaVal;

          if (Math.abs(val - expA) < 0.5 || Math.abs(val - expB) < 0.5) {
            ttcMathCount++;
          }
        }
      }
    });

    const isTtcFormulaValid = ttcFormulaCount >= Math.min(3, dataRowsInfo.length);
    const isTtcMathValid = ttcMathCount >= Math.min(3, dataRowsInfo.length);

    // Détection de volets figés dans les métadonnées SheetJS
    const sheetViews = (sheet as any)['!views'] || (sheet as any)['!freeze'];
    const hasFreezeView = !!sheetViews;

    if (isTtcFormulaValid && (isTtcMathValid || ttcFormulaCount >= 5)) {
      details.push({
        milestoneId: 'm5_freeze_total',
        status: 'valide',
        message: 'Formules de Total TTC douanier vérifiées et opérationnelles.',
        details: hasFreezeView
          ? `Ligne d'en-tête figée détectée avec succès (Freeze Panes). Total TTC calculé dynamiquement.`
          : `Total TTC dynamiquement calculé sur chaque conteneur (= Base HT + Octroi de mer + TVA).`,
      });
    } else {
      details.push({
        milestoneId: 'm5_freeze_total',
        status: 'non_conforme',
        message: 'Colonne Total TTC incomplète ou non dynamisée.',
        details: `La colonne Total TTC doit additionner la Base HT (et les frais de transit éventuels), l'Octroi de mer et la TVA (=F4+H4+I4 ou =SOMME(F4:I4)). N'oubliez pas également de figer la ligne d'en-tête dans l'onglet Affichage.`,
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
