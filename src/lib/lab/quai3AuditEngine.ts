import * as XLSX from 'xlsx';
import type { LabAuditDetail, LabAuditSummary } from '@/types/tip';

/**
 * Audit Client-Side de l'Acte 1 (.xlsx exporté depuis Microsoft Excel ou Google Sheets)
 * pour l'atelier Quai n°3 (tp-bur-03-quai3-pack).
 * Vérifie 4 jalons sur 6 sans envoi de fichier sur le serveur.
 */
export async function auditQuai3Excel(
  fileBuffer: ArrayBuffer,
  fileName: string,
  fileSize: number
): Promise<LabAuditSummary> {
  const details: LabAuditDetail[] = [];

  if (fileBuffer.byteLength > 10 * 1024 * 1024 || fileSize > 10 * 1024 * 1024) {
    throw new Error('Le fichier dépasse la limite maximale autorisée de 10 Mo.');
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
      throw new Error('Le classeur ne contient aucune feuille de calcul.');
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error('Impossible de lire la première feuille du classeur.');
    }

    // Repérage des formules et valeurs clés sur les lignes 4 à 15
    let poidsOkCount = 0;
    let tvaFormulaDollarCount = 0;
    let tvaMathOkCount = 0;
    let siFormulaCount = 0;
    let surchargeDetectedCount = 0;
    let rechercheOkCount = 0;
    let errorCount = 0;

    // Scan erreurs globales
    Object.keys(sheet).forEach((key) => {
      if (key.startsWith('!')) return;
      const c = sheet[key];
      if (!c) return;
      const wStr = String(c.w || '');
      const vStr = String(c.v || '');
      if (
        c.t === 'e' ||
        wStr.includes('#N/A') ||
        vStr.includes('#N/A') ||
        wStr.includes('#VALEUR!') ||
        wStr.includes('#VALUE!') ||
        wStr.includes('#REF!') ||
        wStr.includes('#DIV/0!')
      ) {
        errorCount++;
      }
    });

    for (let r = 4; r <= 15; r++) {
      // Jalon 1a : Poids Total (Col G = E*F)
      const gCell = sheet[`G${r}`];
      const gFormula = String(gCell?.f || '').toUpperCase();
      const gVal = parseFloat(String(gCell?.v ?? ''));
      if (gFormula.includes('*') || (!isNaN(gVal) && gVal >= 500)) {
        if (gFormula.includes(`E${r}`) && gFormula.includes(`F${r}`)) {
          poidsOkCount++;
        } else if (!isNaN(gVal) && gVal >= 500 && gFormula.length > 0) {
          poidsOkCount++;
        }
      }

      // Jalon 1b : TVA 8.5% (Col J = I*$J$2 ou *0.085)
      const jCell = sheet[`J${r}`];
      const jFormula = String(jCell?.f || '').toUpperCase();
      const jVal = parseFloat(String(jCell?.v ?? ''));
      if (jFormula.includes('$') && (jFormula.includes('J$2') || jFormula.includes('$J2') || jFormula.includes('$J$2'))) {
        tvaFormulaDollarCount++;
      }
      if (!isNaN(jVal) && jVal > 35) {
        tvaMathOkCount++;
      }

      // Jalon 2 : Alerte Chariot SI (Col H)
      const hCell = sheet[`H${r}`];
      const hFormula = String(hCell?.f || '').toUpperCase();
      const hValStr = String(hCell?.v ?? hCell?.w ?? '').toUpperCase();
      if (hFormula.includes('IF(') || hFormula.includes('SI(')) {
        siFormulaCount++;
      }
      if (hValStr.includes('SURCHARGE')) {
        surchargeDetectedCount++;
      }

      // Jalon 3 : Nom de Zone RECHERCHEV / SIERREUR (Col D)
      const dCell = sheet[`D${r}`];
      const dFormula = String(dCell?.f || '').toUpperCase();
      const dValStr = String(dCell?.v ?? dCell?.w ?? '').toLowerCase();
      if (
        dFormula.includes('VLOOKUP') ||
        dFormula.includes('RECHERCHEV') ||
        dFormula.includes('XLOOKUP') ||
        dFormula.includes('RECHERCHEX')
      ) {
        rechercheOkCount++;
      } else if (dValStr.includes('quai') || dValStr.includes('hangar') || dValStr.includes('douane')) {
        // Tolérance partielle si Google Sheets sans formule préservée mais résultat présent
        rechercheOkCount += 0.5;
      }
    }

    // Jalon 4 : Synthèse statistique (lignes 17 à 26)
    let hasSum = false;
    let hasAvg = false;
    let hasMaxOrMin = false;
    let hasCountIf = false;

    Object.keys(sheet).forEach((key) => {
      if (key.startsWith('!')) return;
      const c = sheet[key];
      const f = String(c?.f || '').toUpperCase();
      if (!f) return;
      if (f.includes('SUM(') || f.includes('SOMME(')) hasSum = true;
      if (f.includes('AVERAGE(') || f.includes('MOYENNE(')) hasAvg = true;
      if (f.includes('MAX(') || f.includes('MIN(')) hasMaxOrMin = true;
      if (f.includes('COUNTIF(') || f.includes('NB.SI(')) hasCountIf = true;
    });

    // Construction des 4 jalons Acte 1
    const m1Valid = poidsOkCount >= 10 && (tvaFormulaDollarCount >= 8 || tvaMathOkCount >= 10);
    details.push({
      milestoneId: 'q1_poids_tva',
      status: m1Valid ? 'valide' : 'non_conforme',
      message: m1Valid
        ? 'Calculs de poids total (=E4*F4) et TVA 8,5 % validés.'
        : `Calculs incomplets (Poids : ${poidsOkCount}/12 formules, TVA avec $ : ${tvaFormulaDollarCount}/12).`,
      details: m1Valid
        ? 'Les références bloquées avec le cadenas $ (F4) empêchent le décalage à la recopie.'
        : 'Rappel simple : tapez =E4*F4 en G4, puis =I4*$J$2 en J4 (appuyez sur F4 après J2 pour poser les deux $).',
    });

    const m2Valid = siFormulaCount >= 10 && surchargeDetectedCount >= 3;
    details.push({
      milestoneId: 'q2_si_alerte',
      status: m2Valid ? 'valide' : 'non_conforme',
      message: m2Valid
        ? `Condition =SI(...) validée (${surchargeDetectedCount} alertes surcharge détectées).`
        : `Formule =SI(...) attendue en colonne H (${siFormulaCount}/12 détectées).`,
      details: m2Valid
        ? 'Le test automatique > 2 500 kg protège les caristes au quai.'
        : 'Formule simple : =SI(G4>$H$2; "SURCHARGE - 2 PASSAGES"; "OK CHARIOT"). N’oubliez pas les guillemets autour des textes !',
    });

    const m3Valid = errorCount === 0 && rechercheOkCount >= 10;
    details.push({
      milestoneId: 'q3_recherchev_sierreur',
      status: m3Valid ? 'valide' : 'non_conforme',
      message: m3Valid
        ? 'Recherche de zone RECHERCHEV + protection SIERREUR opérationnelle (0 erreur).'
        : errorCount > 0
        ? `${errorCount} erreur(s) type #N/A ou #VALEUR! encore visible(s) dans le tableau.`
        : `Formule RECHERCHEV manquante en colonne D (${Math.floor(rechercheOkCount)}/12).`,
      details: m3Valid
        ? 'Les espaces en trop (Z-A ) et les codes inconnus (Z-99) sont gérés proprement sans #N/A.'
        : 'Utilisez =SIERREUR(RECHERCHEV(SUPPRESPACE(C4); Zones_Quais!$A$3:$C$6; 2; FAUX); "Zone inconnue").',
    });

    const statsScore = [hasSum, hasAvg, hasMaxOrMin, hasCountIf].filter(Boolean).length;
    const m4Valid = statsScore >= 3;
    details.push({
      milestoneId: 'q4_stats_synthese',
      status: m4Valid ? 'valide' : 'non_conforme',
      message: m4Valid
        ? `Synthèse statistique complète (${statsScore}/4 familles de formules : SOMME, MOYENNE, MAX/MIN, NB.SI).`
        : `Synthèse incomplète (${statsScore}/4 formules trouvées : SOMME=${hasSum ? 'OK' : 'Non'}, MOYENNE=${hasAvg ? 'OK' : 'Non'}, MAX/MIN=${hasMaxOrMin ? 'OK' : 'Non'}, NB.SI=${hasCountIf ? 'OK' : 'Non'}).`,
      details: m4Valid
        ? 'Le chef de quai dispose de tous ses indicateurs de pilotage.'
        : 'Complétez le bloc synthèse en bas du tableau avec =SOMME(...), =MOYENNE(...), =MAX(...), =MIN(...) et =NB.SI(...).',
    });

    const validCount = details.filter((d) => d.status === 'valide').length;
    const scorePct = Math.round((validCount / 4) * 100);

    return {
      timestamp: new Date().toISOString(),
      fileName,
      fileSize,
      validCount,
      milestonesCount: 4,
      scorePct,
      isFullyValid: validCount === 4,
      details,
    };
  } catch (err: any) {
    throw new Error(err?.message || 'Impossible de lire le fichier tableur (.xlsx).');
  }
}

/**
 * Audit Client-Side de l'Acte 2 (.docx enregistré depuis Microsoft Word ou téléchargé depuis Google Docs)
 * via SheetJS CFB (sans dépendance supplémentaire). Vérifie les 2 jalons Word / Docs.
 */
export async function auditQuai3Docx(
  fileBuffer: ArrayBuffer,
  fileName: string,
  fileSize: number
): Promise<LabAuditSummary> {
  const details: LabAuditDetail[] = [];

  if (fileBuffer.byteLength > 15 * 1024 * 1024 || fileSize > 15 * 1024 * 1024) {
    throw new Error('Le document dépasse la limite maximale autorisée de 15 Mo.');
  }

  try {
    const pkg = XLSX.CFB.read(new Uint8Array(fileBuffer), { type: 'array' });
    const docEntry = XLSX.CFB.find(pkg, '/word/document.xml');

    if (!docEntry || !docEntry.content) {
      throw new Error('Fichier .docx invalide : word/document.xml introuvable.');
    }

    const xml = new TextDecoder().decode(new Uint8Array(docEntry.content));

    // Vérification des vrais Styles Titre 1 / Heading 1 (Word FR, Word EN, Google Docs)
    const hasHeadingStyle =
      /w:pStyle[^>]+w:val=["']?(Heading|Titre|1|2|Subtitle)/i.test(xml) ||
      xml.includes('Titre1') ||
      xml.includes('Heading1');

    // Vérification saut de page explicite ou TOC
    const hasPageBreak =
      xml.includes('w:type="page"') ||
      xml.includes("w:type='page'") ||
      xml.includes('w:pageBreakBefore');

    const hasTocOrCleanSpacing =
      /TOC|Table des mati|TableOfContents/i.test(xml) ||
      pkg.FullPaths.some((p: string) => p.toLowerCase().includes('header') || p.toLowerCase().includes('footer'));

    // Détection anti-pattern : 5 paragraphes vides consécutifs (<w:p> sans <w:t>)
    const emptyParaMatches = xml.match(/(?:<w:p(?:\s[^>]*)?>\s*(?:<w:pPr>[\s\S]*?<\/w:pPr>\s*)?<\/w:p>\s*){5,}/g);
    const hasMassiveBlankLines = Boolean(emptyParaMatches && emptyParaMatches.length > 0);

    // Jalon 5 : Structure Word/Docs propre
    const m5Valid = hasHeadingStyle && (hasPageBreak || hasTocOrCleanSpacing) && !hasMassiveBlankLines;
    details.push({
      milestoneId: 'q5_docx_structure',
      status: m5Valid ? 'valide' : 'non_conforme',
      message: m5Valid
        ? 'Structure propre détectée : vrais Styles Titres, saut de page et zéro appui Entrée en cascade.'
        : `Mise en page incomplète (Styles Titres : ${hasHeadingStyle ? 'OK' : 'Manquant'}, Saut de page : ${hasPageBreak ? 'OK' : 'Manquant'}, Lignes vides en trop : ${hasMassiveBlankLines ? 'OUI' : 'Non'}).`,
      details: m5Valid
        ? 'Votre document peut générer une table des matières automatique dans Word comme dans Google Docs.'
        : 'Appliquez les vrais styles Titre 1 / Titre 2, supprimez les lignes vides du début et insérez un Saut de page (Ctrl + Entrée).',
    });

    // Jalon 6 : Captures d'écran + tableau insérés
    const mediaFiles = pkg.FullPaths.filter((p: string) => p.toLowerCase().includes('word/media/'));
    const hasDrawingTags = xml.includes('<w:drawing>') || xml.includes('<v:imagedata');
    const imageCount = Math.max(mediaFiles.length, hasDrawingTags ? 1 : 0);
    const hasTable = xml.includes('<w:tbl>');

    const m6Valid = imageCount >= 1 && hasTable;
    details.push({
      milestoneId: 'q6_docx_captures_tableau',
      status: m6Valid ? 'valide' : 'non_conforme',
      message: m6Valid
        ? `${mediaFiles.length || 1} capture(s) d’écran et tableau de synthèse détectés dans le document.`
        : `Éléments visuels manquants (Images détectées : ${mediaFiles.length}, Tableau : ${hasTable ? 'OK' : 'Manquant'}).`,
      details: m6Valid
        ? 'Guide prêt à être imprimé ou exporté en PDF pour les caristes du Quai n°3.'
        : 'Utilisez Win + Maj + S pour coller au moins une capture de votre tableur, et collez votre mini-tableau statistiques.',
    });

    const validCount = details.filter((d) => d.status === 'valide').length;
    const scorePct = Math.round((validCount / 2) * 100);

    return {
      timestamp: new Date().toISOString(),
      fileName,
      fileSize,
      validCount,
      milestonesCount: 2,
      scorePct,
      isFullyValid: validCount === 2,
      details,
    };
  } catch (err: any) {
    throw new Error(err?.message || 'Impossible de lire le document Word (.docx).');
  }
}

/**
 * Fusionne les deux audits (Acte 1 Tableur + Acte 2 Traitement de texte) en un score unifié sur 6 jalons.
 */
export function mergeQuai3Audits(
  excelAudit: LabAuditSummary | null,
  docxAudit: LabAuditSummary | null
): LabAuditSummary | null {
  if (!excelAudit && !docxAudit) return null;

  const details: LabAuditDetail[] = [
    ...(excelAudit?.details || []),
    ...(docxAudit?.details || []),
  ];

  const validCount = details.filter((d) => d.status === 'valide').length;
  const milestonesCount = 6;
  const scorePct = Math.round((validCount / milestonesCount) * 100);

  const fileNames = [excelAudit?.fileName, docxAudit?.fileName].filter(Boolean).join(' + ');

  return {
    timestamp: new Date().toISOString(),
    fileName: fileNames || 'Pack Quai n°3',
    fileSize: (excelAudit?.fileSize || 0) + (docxAudit?.fileSize || 0),
    validCount,
    milestonesCount,
    scorePct,
    isFullyValid: validCount === milestonesCount,
    details,
  };
}
