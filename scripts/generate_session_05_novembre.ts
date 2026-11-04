import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { FORE_LOGO_BASE64, FRANCE_TRAVAIL_LOGO_BASE64 } from '../src/lib/templates/fichesLogos';
import { generateCorinneBrutWorkbook } from '../src/lib/lab/corinneWorkbook';
import { auditCorinneManifesteExcel } from '../src/lib/lab/excelAuditEngine';

const webhookUrl = process.env.N8N_QUALIOPI_PDF_WEBHOOK_URL || 'https://n8n.shandev.cloud/webhook/qualiopi-pdf-generate';
const bearerToken = process.env.KLF_WEBHOOK_BEARER_TOKEN || 'klf_tip_bearer_secret_2026_jarry_secure!';

const targetBrainDir = path.resolve('c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/03 - Paliers Pédagogiques/051126');
const klfEnterpriseDir = path.resolve('c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/01 - Entreprise Fictive KLF');

async function compilePdf(html: string, filename: string): Promise<Buffer> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({ html, filename }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur Gotenberg HTTP ${res.status}: ${err}`);
  }

  const arrBuf = await res.arrayBuffer();
  return Buffer.from(arrBuf);
}

/**
 * Analyse le binaire PDF pour compter strictement le nombre de pages physiques
 */
function getPdfPageCount(pdfBuffer: Buffer): number {
  const content = pdfBuffer.toString('binary');
  const matches = content.match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

/**
 * Génération du classeur corrigé DSI avec 100% de formules OpenXML actives (Standard Zéro Chiffre Brut)
 */
function buildTeacherCorrigéWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. Feuille principale : Manifeste d'Arrivages Maritimes
  const wsData: any[][] = [
    ['KARUKERA LOGISTIQUE & FRET (KLF) — MANIFESTE ARRIVAGES MARITIMES (PORT DE JARRY)', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', 'Paramètres fiscaux réglementaires (Octroi / TVA) :', '', 'Octroi 8,5% ->', 0.085, 0.085, ''],
    ['N° Conteneur', 'Navire', 'Armateur', 'Destinataire', 'Code Postal', 'Base HT (€)', 'Frais Transit (€)', 'Octroi de mer (€)', 'TVA 8.5% (€)', 'Total TTC (€)'],
    ['CMAU-982144-0', 'Fort Saint-Louis', 'CMA-CGM ', 'Antilles Fret Distribution', '97122', 12500.00, '', '', '', ''],
    ['MSCU-331209-1', 'Caraïbes Express', 'MSC  ', 'Boutique Caraïbes Déco', '01234', 4850.50, '', '', '', ''],
    ['MAEU-774011-8', 'Fort Sainte-Marie', 'Maersk ', 'Jarry Bricolage Outillage', '97110', 8920.00, '', '', '', ''],
    ['HLCU-440912-3', 'Atlantic Star', 'Hapag-Lloyd ', 'Société Guadeloupéenne d\'Import', '97139', 15400.00, '', '', '', ''],
    ['CMAU-110294-7', 'Fort Fleur d\'Épée', 'CMA-CGM  ', 'Pharmacie Centrale Houelbourg', '06000', 3100.00, '', '', '', ''],
    ['MSCU-889021-4', 'Caraïbes Express', 'MSC ', 'Agro-Antilles SAS', '97120', 22150.00, '', '', '', ''],
    ['MAEU-661045-2', 'Fort Saint-Louis', 'Maersk  ', 'Fret Express Baie-Mahault', '97122', 7300.00, '', '', '', ''],
    ['CMAU-554109-9', 'Fort Fleur d\'Épée', 'CMA-CGM ', 'Électronique Caraïbe Tech', '75001', 11400.00, '', '', '', ''],
    ['HLCU-992014-5', 'Atlantic Star', 'Hapag-Lloyd  ', 'Distribution Matériel Médical', '97139', 18900.00, '', '', '', ''],
    ['MSCU-443190-2', 'Caraïbes Express', 'MSC ', 'Trans-Antilles Transit', '97110', 6450.00, '', '', '', ''],
    ['TOTAL DU MANIFESTE', '', '', '', '', '', '', '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Cellules d'en-tête fiscaux
  ws['E2'] = { t: 's', v: 'Paramètres fiscaux réglementaires (Octroi / TVA) :' };
  ws['G2'] = { t: 's', v: 'Octroi 8,5% ->' };
  ws['H2'] = { t: 'n', v: 0.085, z: '0.0%' };
  ws['I2'] = { t: 'n', v: 0.085, z: '0.0%' };

  // Tarifs par armateur pour calcul exact des valeurs en cache
  const tarifsMap: Record<string, number> = {
    'CMA-CGM': 280.00,
    'MSC': 310.00,
    'Maersk': 295.00,
    'Hapag-Lloyd': 340.00,
  };

  const baseValues = [12500.00, 4850.50, 8920.00, 15400.00, 3100.00, 22150.00, 7300.00, 11400.00, 18900.00, 6450.00];
  const armateursClean = ['CMA-CGM', 'MSC', 'Maersk', 'Hapag-Lloyd', 'CMA-CGM', 'MSC', 'Maersk', 'CMA-CGM', 'Hapag-Lloyd', 'MSC'];

  let totalBase = 0;
  let totalTransit = 0;
  let totalOctroi = 0;
  let totalTva = 0;
  let totalTtc = 0;

  for (let r = 4; r <= 13; r++) {
    const idx = r - 4;
    const arm = armateursClean[idx];
    const transitFee = tarifsMap[arm] || 280;
    const baseVal = baseValues[idx];
    const octroiVal = Math.round(baseVal * 0.085 * 100) / 100;
    const tvaVal = Math.round(baseVal * 0.085 * 100) / 100;
    const ttcVal = Math.round((baseVal + transitFee + octroiVal + tvaVal) * 100) / 100;

    totalBase += baseVal;
    totalTransit += transitFee;
    totalOctroi += octroiVal;
    totalTva += tvaVal;
    totalTtc += ttcVal;

    // Col G : Frais transit avec TRIM et IFERROR (formule OpenXML vive)
    ws['G' + r] = {
      t: 'n',
      f: `IFERROR(VLOOKUP(TRIM(C${r}),Tarifs_Transit!$A$3:$B$6,2,FALSE),0)`,
      v: transitFee,
      z: '#,##0.00',
    };

    // Col H : Octroi de mer = Base HT * $H$2
    ws['H' + r] = {
      t: 'n',
      f: `F${r}*$H$2`,
      v: octroiVal,
      z: '#,##0.00',
    };

    // Col I : TVA locale = Base HT * $I$2
    ws['I' + r] = {
      t: 'n',
      f: `F${r}*$I$2`,
      v: tvaVal,
      z: '#,##0.00',
    };

    // Col J : Total TTC = Base + Transit + Octroi + TVA
    ws['J' + r] = {
      t: 'n',
      f: `F${r}+G${r}+H${r}+I${r}`,
      v: ttcVal,
      z: '#,##0.00',
    };
  }

  // Ligne 14 : Totaux avec formules SUM OpenXML actives
  ws['F14'] = { t: 'n', f: 'SUM(F4:F13)', v: totalBase, z: '#,##0.00' };
  ws['G14'] = { t: 'n', f: 'SUM(G4:G13)', v: totalTransit, z: '#,##0.00' };
  ws['H14'] = { t: 'n', f: 'SUM(H4:H13)', v: totalOctroi, z: '#,##0.00' };
  ws['I14'] = { t: 'n', f: 'SUM(I4:I13)', v: totalTva, z: '#,##0.00' };
  ws['J14'] = { t: 'n', f: 'SUM(J4:J13)', v: totalTtc, z: '#,##0.00' };

  // Figeage des volets sur la ligne 3 (titres des colonnes)
  ws['!views'] = [{ state: 'frozen', ySplit: 3 }];

  ws['!cols'] = [
    { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 32 }, { wch: 14 },
    { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Manifeste_Arrivages');

  // 2. Feuille secondaire : Référentiel tarifaire
  const wsTarifsData: any[][] = [
    ['RÉFÉRENTIEL TARIFAIRE DES FRAIS DE TRANSIT (PORT DE JARRY)', ''],
    ['Code Armateur', 'Forfait Transit (€)'],
    ['CMA-CGM', 280.00],
    ['MSC', 310.00],
    ['Maersk', 295.00],
    ['Hapag-Lloyd', 340.00],
  ];

  const wsTarifs = XLSX.utils.aoa_to_sheet(wsTarifsData);
  wsTarifs['!cols'] = [{ wch: 22 }, { wch: 20 }];
  wsTarifs['B3'] = { t: 'n', v: 280.00, z: '#,##0.00' };
  wsTarifs['B4'] = { t: 'n', v: 310.00, z: '#,##0.00' };
  wsTarifs['B5'] = { t: 'n', v: 295.00, z: '#,##0.00' };
  wsTarifs['B6'] = { t: 'n', v: 340.00, z: '#,##0.00' };
  XLSX.utils.book_append_sheet(wb, wsTarifs, 'Tarifs_Transit');

  return wb;
}

function generateTpHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>TP Cadrage Qualiopi - Sauvetage du Manifeste Corinne & Fiscalité Antilles</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 14mm 10mm 14mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      color: #0f172a;
      background: #fff;
      font-size: 10.5pt;
      line-height: 1.65;
    }

    .page {
      width: 100%;
      height: 276mm;
      max-height: 276mm;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .header-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #0f172a;
      margin-bottom: 8px;
    }
    .header-table td {
      border: 1.5px solid #0f172a;
      padding: 6px 10px;
      vertical-align: middle;
    }
    .logo-cell { width: 18%; text-align: center; }
    .logo-cell img { max-height: 48px; display: block; margin: 0 auto; }
    .title-cell {
      width: 60%;
      text-align: center;
      line-height: 1.25;
    }
    .main-title {
      font-size: 14pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #0f172a;
    }
    .sub-title {
      font-size: 10pt;
      color: #475569;
      font-weight: 700;
      margin-top: 2px;
    }
    .tp-badge {
      display: inline-block;
      background: #0f172a;
      color: #fff;
      font-size: 8.5pt;
      font-weight: 800;
      padding: 2.5px 8px;
      border-radius: 4px;
      margin-top: 3px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ref-cell {
      width: 22%;
      text-align: right;
      font-size: 9pt;
      line-height: 1.25;
    }
    .ref-cell img { max-height: 40px; margin-top: 3px; display: inline-block; }

    .meta-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      background: #f8fafc;
      border: 1.2px solid #cbd5e1;
      padding: 6px 10px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 9.5pt;
    }
    .meta-item strong { color: #0f172a; }

    .callout {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 14px;
      font-size: 10.2pt;
      line-height: 1.6;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .callout-title {
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 5px;
      font-size: 10.8pt;
      padding-left: 2px;
    }
    .callout-blue {
      background: #f8fafc;
      border: 1.2px solid #cbd5e1;
      border-left: 4px solid #0f172a;
    }
    .callout-blue .callout-title { color: #0f172a; }

    .callout-red {
      background: #fef2f2;
      border: 1.2px solid #fecaca;
      border-left: 4px solid #dc2626;
    }
    .callout-red .callout-title { color: #b91c1c; }

    .callout-green {
      background: #f0fdf4;
      border: 1.2px solid #bbf7d0;
      border-left: 4px solid #16a34a;
    }
    .callout-green .callout-title { color: #15803d; }

    .section-header {
      background: #0f172a;
      color: #fff;
      font-size: 11pt;
      font-weight: 800;
      padding: 8px 14px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin: 14px 0 12px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      break-after: avoid;
      page-break-after: avoid;
    }
    .section-header .tag {
      background: #334155;
      font-size: 8.5pt;
      padding: 2px 7px;
      border-radius: 3px;
      white-space: nowrap;
    }

    .notion-box {
      background: #eff6ff;
      border: 1.2px solid #bfdbfe;
      border-left: 4px solid #2563eb;
      border-radius: 4px;
      padding: 12px 16px;
      margin: 10px 0 14px 0;
      font-size: 10.2pt;
      line-height: 1.6;
      color: #1e3a8a;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .notion-box strong { color: #1d4ed8; font-size: 10.8pt; }

    p { margin-bottom: 6px; font-size: 10.5pt; line-height: 1.65; }
    ul, ol { margin-left: 20px; margin-bottom: 10px; }
    li { margin-bottom: 8px; font-size: 10.5pt; line-height: 1.62; color: #1e293b; }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 9.5pt;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .data-table th, .data-table td {
      border: 1.2px solid #cbd5e1;
      padding: 9px 12px;
      text-align: left;
      line-height: 1.5;
    }
    .data-table th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9pt;
    }

    .formula-code {
      font-family: "Courier New", Courier, monospace;
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      font-size: 9.5pt;
      padding: 2px 6px;
      border-radius: 3px;
      border: 1px solid #cbd5e1;
      display: inline-block;
    }

    .code-box {
      background: #0f172a;
      color: #38bdf8;
      font-family: "Courier New", Courier, monospace;
      font-size: 10.5pt;
      padding: 12px 16px;
      border-radius: 4px;
      margin: 10px 0;
      border-left: 4px solid #38bdf8;
      line-height: 1.55;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .eval-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin-top: 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .eval-table th, .eval-table td {
      border: 1.2px solid #cbd5e1;
      padding: 9px 12px;
      line-height: 1.5;
    }
    .eval-table th {
      background: #0f172a;
      color: #fff;
      font-size: 9pt;
      text-transform: uppercase;
      font-weight: 700;
    }

    .sign-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      border: 1.5px dashed #94a3b8;
      border-radius: 4px;
      font-size: 9.5pt;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .sign-table td {
      padding: 10px 14px;
      vertical-align: top;
      font-size: 9.5pt;
      line-height: 1.45;
    }

    .footer-bar {
      border-top: 1px solid #cbd5e1;
      padding-top: 5px;
      margin-top: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #64748b;
    }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1 : CADRAGE & ÉTAPE 1 ==================== -->
  <div class="page">
    <div>
      <table class="header-table">
        <tr>
          <td class="logo-cell">
            <img src="${FORE_LOGO_BASE64}" alt="FORE Alternance">
          </td>
          <td class="title-cell">
            <div class="main-title">Karukera Logistique & Fret (KLF)</div>
            <div class="sub-title">Direction des Systèmes d'Information • Jarry (Guadeloupe)</div>
            <span class="tp-badge">TP PALIER 2 • SÉANCE 8 (05/11/2026) — <span style="white-space: nowrap;">TICKET TCK-101</span></span>
          </td>
          <td class="ref-cell">
            <strong>Qualiopi Ind. 4 & 5</strong><br>
            Réf : TP-BUR-01-CORINNE<br>
            Titre Pro TIP (Niv. 4)<br>
            <img src="${FRANCE_TRAVAIL_LOGO_BASE64}" alt="France Travail">
          </td>
        </tr>
      </table>

      <div class="meta-bar">
        <div class="meta-item"><strong>Date :</strong> 05/11/2026 (6h00)</div>
        <div class="meta-item"><strong>Module :</strong> Tableur Avancé & Douane</div>
        <div class="meta-item"><strong>Formateur :</strong> David JACQUA</div>
        <div class="meta-item"><strong>Incident :</strong> P1 - Facturation Bloquée</div>
      </div>

      <div class="callout callout-red">
        <div class="callout-title">🚨 Urgence opérationnelle DSI (Incident P1 - Quai Jarry n°3)</div>
        Corinne MONROSE (Facturation Portuaire) est en détresse : son classeur de suivi des arrivages maritimes affiche des <strong>erreurs <code>#N/A</code> en cascade</strong> sur les frais de transit, les codes postaux sont tronqués en 4 chiffres et les taxes douanières (Octroi de mer et TVA 8,5 %) ne sont pas calculées. <strong>Conséquence immédiate :</strong> 10 conteneurs d'importation sont bloqués au terminal de Jarry avec risque majeur de pénalités de surestaries maritimes avant la clôture douanière de 16h00.
      </div>

      <div class="callout callout-blue">
        <div class="callout-title" style="display: flex; align-items: center; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>Réflexe professionnel du technicien TIP avant toute modification</span></div>
        Ne modifiez <strong>JAMAIS</strong> directement un fichier corrompu en production ! Téléchargez le fichier brut <code>KLF_Manifeste_Arrivages_Corinne_BRUT.xlsx</code> et créez immédiatement une copie de sauvegarde horodatée <code>..._BRUT_SAVE.xlsx</code> sur votre poste de travail.
      </div>

      <div class="section-header">
        <span>Étape 1 : Normalisation des Codes Postaux (5 Caractères Textuels)</span>
        <span class="tag">Jalon 1 • 20 pts</span>
      </div>
      <div class="notion-box">
        <strong>💡 Comprendre la notion :</strong> Dans un tableur, un nombre (ex: <code>01234</code>) perd son zéro initial car mathématiquement <code>01234 = 1234</code>. Or, un code postal est un <em>identifiant textuel</em> (01 = Ain, 06 = Alpes-Maritimes, 971 = Guadeloupe). Il doit impérativement être typé en texte sur 5 caractères pour être accepté par le système douanier.
      </div>
      <ol>
        <li>Ouvrez le classeur brut dans votre tableur (Excel ou Sheets) sur la feuille <code>Manifeste_Arrivages</code>.</li>
        <li>Repérez les anomalies en colonne E : ligne 5 (<code>1234</code> pour Boutique Caraïbes Déco) et ligne 8 (<code>6000</code> pour Pharmacie Centrale).</li>
        <li><strong>Méthode recommandée :</strong> Préfixez d'une apostrophe pour forcer le texte brut : <code>'01234</code> et <code>'06000</code>, ou appliquez le format de nombre personnalisé <code>00000</code> sur l'ensemble de la plage <code>E4:E13</code>.</li>
        <li><strong>Contrôle visuel :</strong> Vérifiez que 100% des 10 conteneurs affichent exactement 5 chiffres avec leurs zéros initiaux préservés.</li>
      </ol>
    </div>

    <div class="footer-bar">
      <span>FORE Alternance Jarry • Titre Pro TIP • Palier 2 Tableur Avancé & Douane Antilles</span>
      <span>Page 1 / 4</span>
    </div>
  </div>

  <!-- ==================== PAGE 2 : ÉTAPE 2 (RECHERCHEV) ==================== -->
  <div class="page">
    <div>
      <div class="section-header">
        <span>Étape 2 : Résolution du #N/A via RECHERCHEV, SUPPRESPACE & SIERREUR</span>
        <span class="tag">Jalon 2 • 20 pts</span>
      </div>
      <div class="notion-box">
        <strong>💡 Comprendre la notion :</strong> L'erreur <code>#N/A</code> ("Non Applicable") signifie qu'Excel ne trouve pas la valeur exacte dans la table de référence. Pourquoi ? Parce que la cellule <code>C4</code> contient <code>'CMA-CGM '</code> (8 caractères dont 1 espace invisible en fin de texte) alors que le catalogue <code>Tarifs_Transit</code> contient <code>'CMA-CGM'</code> (7 caractères). Pour l'ordinateur, l'égalité binaire est fausse ! La fonction <code>SUPPRESPACE</code> (<code>TRIM</code>) élimine ces espaces superflus.
      </div>

      <p><strong>1. Consultation de la grille tarifaire de transit :</strong></p>
      <p>Basculez sur la feuille <code>Tarifs_Transit</code> pour observer le référentiel officiel (plage <code>A3:B6</code>) :</p>
      <table class="data-table">
        <tr>
          <th>Code Armateur (Colonne A)</th>
          <th>Forfait Transit (€) (Colonne B - Index 2)</th>
        </tr>
        <tr>
          <td><strong>CMA-CGM</strong></td>
          <td><strong>280,00 €</strong></td>
        </tr>
        <tr>
          <td><strong>MSC</strong></td>
          <td><strong>310,00 €</strong></td>
        </tr>
        <tr>
          <td><strong>Maersk</strong></td>
          <td><strong>295,00 €</strong></td>
        </tr>
        <tr>
          <td><strong>Hapag-Lloyd</strong></td>
          <td><strong>340,00 €</strong></td>
        </tr>
      </table>

      <p style="margin-top: 10px;"><strong>2. Implémentation de la formule imbriquée :</strong></p>
      <p>Dans la feuille <code>Manifeste_Arrivages</code>, placez-vous en cellule <code>G4</code> (colonne Frais Transit) et saisissez la formule sécurisée :</p>
      
      <div class="code-box">
        =SIERREUR(RECHERCHEV(SUPPRESPACE(C4); Tarifs_Transit!$A$3:$B$6; 2; FAUX); 0)
      </div>
      <p style="font-size: 10.5pt; color: #475569; margin-bottom: 8px;">
        <em>(Syntaxe en anglais OpenXML : <code>=IFERROR(VLOOKUP(TRIM(C4),Tarifs_Transit!$A$3:$B$6,2,FALSE),0)</code>)</em>
      </p>

      <p><strong>3. Décorticage des arguments :</strong></p>
      <ul>
        <li><code>SUPPRESPACE(C4)</code> : nettoie l'armateur en supprimant l'espace parasite final.</li>
        <li><code>Tarifs_Transit!$A$3:$B$6</code> : plage du catalogue bloquée avec le signe dollar <code>$</code> via <code>F4</code>.</li>
        <li><code>2</code> : numéro d'index de la colonne contenant le forfait transit (€).</li>
        <li><code>FAUX</code> : recherche exacte obligatoire (aucune approximation tolérée en facturation/douane).</li>
        <li><code>SIERREUR(..., 0)</code> : ceinture de sécurité affichant 0 en cas d'armateur non répertorié.</li>
      </ul>

      <p style="margin-top: 8px;"><strong>4. Étirement et vérification :</strong></p>
      <p>Étirez la formule de <code>G4</code> à <code>G13</code>. Contrôlez que les 10 montants s'affichent sans aucun <code>#N/A</code> (G4 = 280,00 €, G5 = 310,00 €, G6 = 295,00 €, G7 = 340,00 €, etc.).</p>
    </div>

    <div class="footer-bar">
      <span>FORE Alternance Jarry • Titre Pro TIP • Palier 2 Tableur Avancé & Douane Antilles</span>
      <span>Page 2 / 4</span>
    </div>
  </div>

  <!-- ==================== PAGE 3 : ÉTAPES 3 & 4 (FISCALITÉ & TOTAL) ==================== -->
  <div class="page">
    <div>
      <div class="section-header">
        <span>Étape 3 : Calcul Automatisé de l'Octroi de Mer (8,5%) & TVA Guadeloupe</span>
        <span class="tag">Jalons 3 & 4 • 40 pts</span>
      </div>
      <div class="notion-box">
        <strong>💡 Comprendre la notion :</strong> En Guadeloupe, l'Octroi de mer (taxe d'importation régionale) et la TVA locale s'élèvent tous deux au taux normal de <strong>8,5%</strong>. Ces taux réglementaires sont stockés en cellules d'en-tête <code>H2</code> (Octroi) et <code>I2</code> (TVA). Pour pouvoir étirer les formules sans décaler la ligne 2 vers le bas, vous <strong>DEVEZ bloquer la ligne avec le symbole $</strong> (référence absolue <code>$H$2</code> et <code>$I$2</code> via la touche <code>F4</code>).
      </div>
      <ol>
        <li>En cellule <code>H4</code> (Octroi de mer), entrez la formule : <span class="formula-code">=F4*$H$2</span> (soit <code>12 500,00 € * 8,5% = 1 062,50 €</code>).</li>
        <li>En cellule <code>I4</code> (TVA locale), entrez la formule : <span class="formula-code">=F4*$I$2</span> (soit <code>1 062,50 €</code>).<br>
          <em>(Note DSI : L'assiette douanière portuaire Antilles <code>=(F4+H4)*$I$2 = 1 152,81 €</code> est également validée par l'auto-auditeur).</em>
        </li>
        <li>Sélectionnez <code>H4:I4</code> et étirez simultanément jusqu'à la ligne 13.</li>
      </ol>

      <div class="section-header">
        <span>Étape 4 : Total TTC, Figeage des Volets & Ligne 14 de Contrôle</span>
        <span class="tag">Jalon 5 • 20 pts</span>
      </div>
      <ol>
        <li>En cellule <code>J4</code> (Total TTC), additionnez la Base HT, les Frais de transit, l'Octroi de mer et la TVA :<br>
          <span class="formula-code">=F4+G4+H4+I4</span> <em>(Résultat ligne 4 : <code>14 905,00 €</code>)</em>. Étirez jusqu'en <code>J13</code>.
        </li>
        <li>En ligne 14 (TOTAL DU MANIFESTE), contrôlez les sommes avec <span class="formula-code">=SOMME(F4:F13)</span> sur chaque colonne F, G, H, I et J.
        </li>
        <li><strong>Figeage des volets :</strong> Sélectionnez la ligne 4, rendez-vous dans le ruban <strong>Affichage &gt; Figer les volets &gt; Figer les volets</strong> afin que les en-têtes (Ligne 3) demeurent visibles lors du défilement vertical.</li>
      </ol>

      <p style="margin-top: 8px;"><strong>Tableau des totaux généraux de contrôle (Ligne 14) :</strong></p>
      <table class="data-table">
        <tr>
          <th>Base HT (€)</th>
          <th>Frais Transit (€)</th>
          <th>Octroi de mer (€)</th>
          <th>TVA 8.5% (€)</th>
          <th>Total TTC (€)</th>
        </tr>
        <tr>
          <td><strong>110 970,50 €</strong></td>
          <td><strong>3 040,00 €</strong></td>
          <td><strong>9 432,49 €</strong></td>
          <td><strong>9 432,49 €</strong></td>
          <td><strong>132 875,48 €</strong></td>
        </tr>
      </table>
    </div>

    <div class="footer-bar">
      <span>FORE Alternance Jarry • Titre Pro TIP • Palier 2 Tableur Avancé & Douane Antilles</span>
      <span>Page 3 / 4</span>
    </div>
  </div>

  <!-- ==================== PAGE 4 : ITIL, GRILLE & SIGNATURE ==================== -->
  <div class="page">
    <div>
      <div class="section-header">
        <span>Étape 5 : Dépôt & Clôture Professionnelle du Ticket <span style="white-space: nowrap;">TCK-101</span> (Poste Technicien)</span>
        <span class="tag">Posture ITIL & REAC</span>
      </div>
      <div class="notion-box">
        <strong>💡 Clôture de ticket dans KLF Tech Lab :</strong> Connectez-vous sur votre poste technicien (code PIN), soumettez votre fichier corrigé dans l'auditeur pour obtenir 100% (5/5 jalons) et rédigez votre carnet réflexif pour le Dossier Professionnel (CCP 1).
      </div>
      <ul>
        <li><strong>Démarche technique rédigée au « Je » :</strong><br>
          <em>« J'ai analysé la corruption de la table de transit. J'ai normalisé les codes postaux en texte sur 5 caractères, résolu les ruptures #N/A via SUPPRESPACE et SIERREUR, automatisé le calcul fiscal (Octroi et TVA 8,5%) avec références bloquées $H$2 et $I$2, et figé les volets pour sécuriser la saisie. »</em>
        </li>
        <li style="margin-top: 6px;"><strong>Message usager bienveillant à Corinne :</strong><br>
          <em>« Bonjour Corinne. Votre manifeste maritime est intégralement dépanné et fiabilisé. Les frais de transit et taxes douanières sont automatisés sans erreur, vous permettant de dédouaner les conteneurs à temps. »</em>
        </li>
      </ul>

      <div class="section-header">
        <span>Grille d'Évaluation Formative des Compétences REAC <span style="white-space: nowrap;">(CCP 1)</span></span>
        <span class="tag">Qualiopi Ind. 11</span>
      </div>
      <table class="eval-table">
        <tr>
          <th>Critère d'évaluation technique</th>
          <th>Indicateur d'observabilité</th>
          <th>Barème</th>
          <th>Validation</th>
        </tr>
        <tr>
          <td><strong>1. Normalisation codes postaux</strong></td>
          <td>10/10 codes postaux sur 5 chiffres (format texte ou masque 00000, 01234/06000)</td>
          <td>4 pts</td>
          <td>[ &nbsp; ] Validé</td>
        </tr>
        <tr>
          <td><strong>2. Résolution #N/A Transit</strong></td>
          <td>0 erreur #N/A, 10/10 frais calculés (280/310/295/340 €), SUPPRESPACE/SIERREUR</td>
          <td>4 pts</td>
          <td>[ &nbsp; ] Validé</td>
        </tr>
        <tr>
          <td><strong>3. Calcul Octroi de mer (8,5%)</strong></td>
          <td>Formules dynamiques avec référence bloquée $H$2, montants exacts</td>
          <td>4 pts</td>
          <td>[ &nbsp; ] Validé</td>
        </tr>
        <tr>
          <td><strong>4. Calcul TVA locale (8,5%)</strong></td>
          <td>Formules dynamiques avec $I$2 (calcul direct Base HT ou assiette douanière)</td>
          <td>4 pts</td>
          <td>[ &nbsp; ] Validé</td>
        </tr>
        <tr>
          <td><strong>5. Total TTC, Volets & ITIL</strong></td>
          <td>Total TTC exact, volets figés ligne 3, démarche technique rédigée au « Je »</td>
          <td>4 pts</td>
          <td>[ &nbsp; ] Validé</td>
        </tr>
      </table>

      <table class="sign-table">
        <tr>
          <td style="width: 50%;">
            <strong>Observations & Remédiation individualisée :</strong><br>
            <div style="height: 44px; border-bottom: 1px dotted #cbd5e1; margin-top: 6px;"></div>
          </td>
          <td style="width: 50%; text-align: right;">
            <strong>Visa & Signature du Formateur Référent :</strong><br>
            <div style="font-size: 10pt; color: #475569; margin-top: 3px;">David JACQUA • DSI & Formateur Référent TIP</div>
            <div style="height: 32px;"></div>
          </td>
        </tr>
      </table>
    </div>

    <div class="footer-bar">
      <span>Titre Pro Technicien Informatique de Proximité (TIP) • Ministère du Travail • Qualiopi Ind. 11</span>
      <span>Page 4 / 4</span>
    </div>
  </div>

</body>
</html>`;
}

function generateTpMarkdown(): string {
  return `---
title: Consignes TP - Sauvetage du Manifeste d'Arrivages Maritimes de Corinne & Fiscalité Antilles
date: 2026-11-05
type: consignes_tp
statut: actif
tags:
  - tp
  - tableur
  - recherchev
  - supprespace
  - sierreur
  - fiscalite-antilles
  - octroi-de-mer
  - tva-guadeloupe
  - tip2
  - klf
  - qualiopi
aliases:
  - Consignes TP Séance 8 TIP2
  - TP Corinne Manifeste Maritimes & Fiscalité
---

# 💻 Consignes TP : Sauvetage du Manifeste d'Arrivages Maritimes de Corinne & Fiscalité Antilles (Ticket TCK-101)

> [!TIP] Document officiel d'impression & traçabilité Qualiopi
> La version imprimable officielle (2 pages A4 strictes avec logos FORE Alternance, France Travail, grille d'évaluation et visa formateur) a été compilée via Gotenberg :
> 👉 **PDF Officiel à imprimer / projeter :** [[TP_Consignes_Corinne_RECHERCHEV_Fiscalite_051126.pdf]]

---

> [!NOTE] Contexte professionnel immersif DSI KLF (Port de Jarry)
> Vous intervenez en tant que **Technicien Informatique de Proximité junior** au sein de la DSI de **Karukera Logistique & Fret (KLF)** à Jarry (Guadeloupe).
> Corinne MONROSE (Service Facturation Portuaire) est en situation de blocage critique : son classeur de suivi des manifestes d'arrivages maritimes affiche des **erreurs \`#N/A\` en cascade** sur les frais de transit, les codes postaux des destinataires sont tronqués en 4 chiffres et les taxes douanières (Octroi de mer et TVA locale de 8,5 %) ne sont pas calculées.
> **Impact économique majeur :** 10 conteneurs de fret commercial sont bloqués au terminal portuaire de Jarry avec risque imminent de surestaries maritimes avant la clôture douanière de 16h00.

---

## 🎯 Objectifs de l'intervention technique (Qualiopi Ind. 5)

1. **Normaliser les codes postaux sur 5 positions** sans perte des zéros non significatifs (\`'01234\`, \`'06000\`).
2. **Diagnostiquer et éradiquer les ruptures de recherche matricielle (\`#N/A\`)** en éliminant les espaces superflus via \`SUPPRESPACE\` (\`TRIM\`) et en sécurisant avec \`SIERREUR\` (\`IFERROR\`).
3. **Automatiser le calcul de l'Octroi de mer (8,5 %)** en utilisant une référence semi-absolue bloquée (\`$H$2\`).
4. **Automatiser le calcul de la TVA Guadeloupe (8,5 %)** avec référence bloquée (\`$I$2\`), en acceptant l'assiette standard ou douanière.
5. **Calculer le Total TTC**, appliquer le **figeage des volets** sur la ligne d'en-tête et clôturer le ticket selon la démarche ITIL au « Je ».

---

## 📋 Déroulé pas-à-pas des étapes d'intervention

### Étape 1 : Normalisation des codes postaux (5 caractères)
> **💡 Comprendre la notion :** Dans un tableur, un nombre (ex: \`01234\`) perd son zéro initial car mathématiquement \`01234 = 1234\`. Or, un code postal est un *identifiant textuel* (01 = Ain, 06 = Alpes-Maritimes, 971 = Guadeloupe). Il doit impérativement être typé en texte sur 5 caractères.

1. Téléchargez le classeur brut \`KLF_Manifeste_Arrivages_Corinne_BRUT.xlsx\` et créez une sauvegarde \`..._BRUT_SAVE.xlsx\`.
2. Repérez les anomalies en colonne E : ligne 5 (\`1234\`) et ligne 8 (\`6000\`).
3. **Correction :** Préfixez d'une apostrophe pour forcer le texte brut (\`'01234\` et \`'06000\`), ou appliquez le format de nombre personnalisé \`00000\` sur l'ensemble de la plage \`E4:E13\`.
4. Contrôlez que les 10 conteneurs affichent bien 5 chiffres.

---

### Étape 2 : Éradication du #N/A sur les frais de transit (RECHERCHEV + SUPPRESPACE + SIERREUR)
> **💡 Comprendre la notion :** L'erreur \`#N/A\` ("Non Applicable") survient quand Excel ne trouve pas la correspondance exacte. La cellule \`C4\` contient \`'CMA-CGM '\` (8 caractères avec un espace invisible) alors que la table \`Tarifs_Transit\` contient \`'CMA-CGM'\` (7 caractères). La fonction \`SUPPRESPACE\` (\`TRIM\`) supprime ces espaces parasites.

1. Observez la grille tarifaire dans l'onglet \`Tarifs_Transit\` : plage \`A3:B6\` (CMA-CGM = 280 €, MSC = 310 €, Maersk = 295 €, Hapag-Lloyd = 340 €).
2. En cellule \`G4\` de l'onglet \`Manifeste_Arrivages\`, saisissez la formule imbriquée :
   \`\`\`excel
   =SIERREUR(RECHERCHEV(SUPPRESPACE(C4); Tarifs_Transit!$A$3:$B$6; 2; FAUX); 0)
   \`\`\`
   *(En syntaxe anglaise OpenXML : \`=IFERROR(VLOOKUP(TRIM(C4),Tarifs_Transit!$A$3:$B$6,2,FALSE),0)\`)*
3. Étirez jusqu'en \`G13\`. Tous les frais de transit doivent s'afficher correctement sans aucune erreur.

---

### Étape 3 : Calcul automatisé de l'Octroi de mer (8,5 %) et de la TVA locale
> **💡 Comprendre la notion :** Les taux réglementaires sont stockés en cellules d'en-tête \`H2\` (Octroi de mer 8,5 %) et \`I2\` (TVA locale 8,5 %). Pour étirer les formules sans décaler la ligne 2 vers le bas, vous devez bloquer la ligne avec le signe \`$\` (\`$H$2\` et \`$I$2\` via la touche \`F4\`).

1. En cellule \`H4\` (Octroi de mer), saisissez : \`=F4*$H$2\` *(Résultat : 1 062,50 €)*.
2. En cellule \`I4\` (TVA locale), saisissez : \`=F4*$I$2\` *(Résultat : 1 062,50 €)*.
   *(Note culture DSI : La variante assiette douanière portuaire \`=(F4+H4)*$I$2 = 1 152,81 €\` est également acceptée par l'auditeur).*
3. Étirez les formules sur les lignes 4 à 13.

---

### Étape 4 : Total TTC, figeage des volets & contrôle de cohérence
1. En cellule \`J4\` (Total TTC), additionnez la Base HT, les Frais de transit, l'Octroi de mer et la TVA :
   \`=F4+G4+H4+I4\` *(Résultat ligne 4 : 14 905,00 €)*. Étirez jusqu'en \`J13\`.
2. En ligne 14, calculez les totaux généraux avec \`=SOMME(F4:F13)\` sur les colonnes F à J.
   *Totaux de contrôle : Base HT = 110 970,50 € • Transit = 3 040,00 € • Octroi = 9 432,49 € • TVA = 9 432,49 € • Total TTC = 132 875,48 €.*
3. **Figeage des volets :** Sélectionnez la ligne 4, puis cliquez sur **Affichage > Figer les volets > Figer les volets** pour sanctuariser la ligne d'en-tête (Ligne 3).

---

### Étape 5 : Soumission sur KLF Tech Lab & Clôture ITIL
1. Glissez votre fichier corrigé dans l'auto-auditeur KLF Tech Lab pour valider vos 5 jalons (score 100 %).
2. Rédigez votre compte-rendu d'intervention ITIL :
   - **Démarche technique au « Je » :** *« J'ai diagnostiqué les ruptures de formules sur le manifeste de Corinne. J'ai converti les codes postaux en texte sur 5 positions, éliminé les espaces invisibles avec SUPPRESPACE dans RECHERCHEV, sécurisé avec SIERREUR, calculé dynamiquement l'Octroi de mer et la TVA avec références bloquées $H$2 et $I$2, et activé le figeage des volets. »*
   - **Message usager à Corinne :** *« Bonjour Corinne. Votre classeur de suivi des manifestes d'arrivages maritimes est entièrement opérationnel et sécurisé. Les frais et taxes douanières sont automatisés, permettant la facturation immédiate des 10 conteneurs. »*
`;
}

function generateFicheAnimationMarkdown(): string {
  return `---
title: Palier 2 - Séance 08 - Fiche d'animation formateur (05-11-2026)
date: 2026-11-05
type: fiche_animation_formateur
statut: pret_pour_cours
tags:
  - pedagogie
  - animation
  - tableur-avance
  - recherchev
  - supprespace
  - sierreur
  - fiscalite-antilles
  - octroi-de-mer
  - tva-guadeloupe
  - klf
  - tip2
  - qualiopi
aliases:
  - Fiche d'animation Séance 8 TIP2
  - Guide formateur Incident Corinne & RECHERCHEV 05-11-2026
---

# Fiche d'animation formateur : Palier 2 – Incident Critique n°1 Corinne (\`TCK-101\`), \`RECHERCHEV\`, \`SUPPRESPACE\` & Fiscalité Douanière Antilles

> [!IMPORTANT] Informations administratives & traçabilité Qualiopi
> - **Centre de formation :** METAFORE Houelbourg / FORE Alternance Jarry (Guadeloupe)
> - **Session :** Titre Professionnel Technicien Informatique de Proximité (TIP2 – Session C26031A)
> - **Formateur référent :** David JACQUA (DSI KLF & Formateur Référent)
> - **Date & horaire :** Jeudi 5 novembre 2026 (Journée complète 08h30 – 15h30 / 6h00 nettes)
> - **Volume horaire cumulé :** 34h00 / 85h00 (Séance 8 sur 30 / Séance 11 du chronogramme officiel)
> - **Modalité pédagogique hybride-ready :** Présentiel en salle informatique réseau (Houelbourg Jarry) avec partage d'écran et assistance synchrone.
> - **Références réglementaires Qualiopi :**
>   - **Indicateur 4 & 5 :** Compétences professionnelles REAC (CCP 1 – Assister les usagers en bureautique et environnement numérique).
>   - **Indicateur 8 & 11 :** Évaluation formative continue via auto-auditeur KLF Tech Lab et traçabilité des livrables.
>   - **Indicateur 10 :** Différenciation pédagogique, explicitation pas-à-pas des notions et remédiation individualisée.
>   - **Indicateur 17, 18 & 19 :** Classeurs d'entreprise réels KLF, plateforme d'audit en temps réel et fiches réflexes.

---

## 🎯 1. Compétences visées & objectifs pédagogiques opérationnels

### A. Compétences professionnelles REAC ciblées (CCP 1)
* **CP 01 :** Assister les utilisateurs sur leurs outils bureautiques et applicatifs métiers (gestion du stress usager, posture d'écoute active, diagnostic rigoureux et communication bienveillante).
* **CP 02 :** Exploiter et fiabiliser les données d'entreprise au sein d'un tableur (recherches matricielles, intégrité des types de données, normalisation de chaînes de texte et formules imbriquées).
* **CP 03 :** Capitaliser, documenter et formaliser ses démarches techniques pour le Dossier Professionnel (DP - CCP 1).

### B. Objectifs d'apprentissage évaluables (Indicateur 5)
À l'issue de la journée de 6 heures, l'apprenant sera capable de :
1. **Identifier la cause technique d'une corruption de code postal** et restituer les zéros non significatifs sur 5 positions sans altération.
2. **Décortiquer les 4 arguments de la fonction \`RECHERCHEV\`** et justifier impérativement l'usage du mode exact (\`FAUX\` / \`0\`) en comptabilité.
3. **Diagnostiquer l'origine binaire d'une erreur \`#N/A\`** (espace invisible en fin de chaîne) et combiner \`RECHERCHEV\` avec \`SUPPRESPACE\` et \`SIERREUR\`.
4. **Appliquer les règles fiscales locales de la Guadeloupe (971)** : calcul de l'Octroi de mer (8,5 %) et de la TVA locale avec références absolues (\`$\`).
5. **Mettre en œuvre les règles d'ergonomie professionnelle** (figeage des volets sur grands classeurs) et rédiger la clôture du ticket au « Je ».

---

## 📖 2. Corps de cours magistral appliqué & Leçons approfondies

---

### Leçon 1 : La psychologie et la méthode de prise en charge d'un incident P1 (Ticket TCK-101)

#### 1.1 Le contexte métier réel au port de Jarry
À Karukera Logistique & Fret (KLF), le service Facturation Portuaire géré par **Corinne MONROSE** traite quotidiennement les manifestes d'arrivages maritimes des navires porte-conteneurs accostant au terminal de Jarry (CMA-CGM, MSC, Maersk, Hapag-Lloyd). Chaque conteneur déchargé doit faire l'objet d'un dédouanement immédiat et d'une facturation incluant le fret de base, les forfaits de transit portuaire, l'Octroi de mer et la TVA locale.

Si le classeur de Corinne plante, **la chaîne logistique s'arrête net :**
- Les déclarations en douane ne peuvent pas être transmises avant l'heure limite de 16h00.
- Les transporteurs et caristes ne reçoivent pas les bons de sortie de quai.
- KLF encourt des pénalités financières exorbitantes de **surestaries portuaires** (facturées à l'heure par les armateurs pour occupation indue du quai).

#### 1.2 La posture d'écoute active et la gestion du stress usager
Face à un usager en détresse qui s'exclame *« Tout a disparu, mes formules affichent #N/A, je vais me faire renvoyer par la direction ! »*, le technicien informatique de proximité ne doit jamais minimiser le problème ni se réfugier derrière un jargon hermétique.
- **Étape A - Écouter et rassurer :** *« Corinne, je comprends l'urgence pour les conteneurs de 16h. Respirez, vos données ne sont pas perdues, nous prenons l'incident en charge immédiatement. »*
- **Étape B - Poser le cadre de sécurité :** *« Ne touchez plus au fichier pour l'instant. Je vais faire une copie de sauvegarde sur le serveur avant d'intervenir. »*

> [!TIP] 🎙️ Ce que David explique au groupe
> *« En entreprise, la valeur d'un technicien informatique ne réside pas seulement dans sa capacité à taper des formules dans Excel. Elle réside dans sa sérénité et sa méthode face au stress d'un collègue. Si vous commencez à tripatouiller le fichier de Corinne sans sauvegarde, et qu'une fausse manipulation efface ses montants bruts, vous êtes responsable de la perte des données. La règle d'or d'un technicien KLF : Sauvegarder d'abord, analyser ensuite, modifier avec rigueur. »*

> [!WARNING] 👀 Point de vigilance Apprenant — Les blocages fréquents
> Les apprenants ont souvent le réflexe d'ouvrir le fichier et de tenter de réécrire les chiffres en dur pour *« faire plaisir à Corinne vite fait »*. **C'est le pire piège anti-professionnel !** La saisie en dur détruit l'automatisation pour les 800 prochains arrivages et expose l'entreprise à des erreurs fiscales graves.

---

### Leçon 2 : Typage des données en mémoire et mystère des zéros disparus (01234 ➔ 1234)

#### 2.1 Le mécanisme sous-jacent : Nombre vs Chaîne de caractères
Pourquoi le code postal de la Boutique Caraïbes Déco (\`01234\`) s'affiche-t-il sous la forme \`1234\` ?
Dans un tableur, tout repose sur la distinction fondamentale du typage :
- **Un nombre (type numérique) :** Est conçu pour des opérations arithmétiques (addition, moyenne, multiplication). En mathématiques pures, le chiffre zéro placé devant un entier n'a aucune valeur : $01234 = 1234$. Excel supprime donc automatiquement ce zéro jugé superflu et aligne le contenu **à droite**.
- **Une chaîne de caractères (type texte) :** Est une séquence ordonnée de symboles textuels. Le caractère \`"0"\` y possède exactement le même poids que la lettre \`"A"\` ou le chiffre \`"1"\`. Excel préserve l'intégralité des symboles et aligne le contenu **à gauche**.

Or, un code postal, un numéro de sécurité sociale, un numéro de carte bancaire ou un identifiant de conteneur ne sont **JAMAIS des quantités à additionner**. Ce sont des identifiants alphanumériques. Le code postal \`01234\` désigne une commune de l'Ain (département 01), alors que \`1234\` n'existe pas dans le système postal français et bloque les logiciels de routage douanier !

#### 2.2 Comparaison technique des 3 méthodes de remédiation
| Méthode | Manipulation exacte | Avantages techniques | Limites / Risques |
| :--- | :--- | :--- | :--- |
| **1. Préfixe Apostrophe** | Taper \`'01234\` directement dans la cellule | Ultra-rapide en saisie manuelle. Force le mode texte immédiat. | Fastidieux sur des fichiers de 500 lignes. |
| **2. Masque Personnalisé** | Clic droit > Format > Personnalisé > Taper \`00000\` | Préserve le type numérique tout en forçant l'affichage de 5 chiffres. | Reste un nombre en mémoire : peut reperdre son zéro lors d'un export CSV ou ERP. |
| **3. Formule TEXTE** | \`=TEXTE(E4; "00000")\` *(en anglais \`=TEXT(E4,"00000")\`)* | **Standard industriel d'excellence :** Convertit réellement la valeur en chaîne texte de 5 caractères. | Nécessite une colonne temporaire ou une formule d'ingestion. |

> [!TIP] 🎙️ Ce que David explique au groupe
> *« Regardez bien votre écran : dès qu'une cellule s'aligne à droite, Excel la considère comme un chiffre calculable. Dès qu'elle s'aligne à gauche, c'est du texte. Retenez cette phrase clé pour vos entretiens d'embauche et votre jury du Titre Pro : "Tout code numérique qui ne fait pas l'objet d'un calcul mathématique doit être stocké au format texte". »*

---

### Leçon 3 : Anatomie complète de RECHERCHEV (et ouverture vers RECHERCHEX)

#### 3.1 Pourquoi RECHERCHEV est le pilier des systèmes de gestion
Dans un système d'information logistique, les données ne sont jamais stockées en bloc monolithique. Les tarifs de transit sont centralisés dans une table de référence (\`Tarifs_Transit\`), et le manifeste opérationnel doit rapatrier dynamiquement le bon montant en fonction du nom de l'armateur. C'est le principe fondamental des bases de données relationnelles (clé primaire / clé étrangère).

#### 3.2 Décorticage visuel des 4 paramètres
La syntaxe universelle de \`RECHERCHEV\` (V pour Vertical) s'articule autour de 4 arguments obligatoires :
\`\`\`excel
=RECHERCHEV( valeur_cherchée ; table_matrice ; no_index_col ; [valeur_proche] )
\`\`\`

1. **Argument 1 : \`valeur_cherchée\` (\`C4\`) ➔ *« Qu'est-ce que je cherche ? »***
   - C'est l'identifiant présent sur la ligne de mon manifeste (ici, le nom de l'armateur : CMA-CGM, MSC, Maersk, etc.).
2. **Argument 2 : \`table_matrice\` (\`Tarifs_Transit!$A$3:$B$6\`) ➔ *« Où se trouve le dictionnaire de référence ? »***
   - C'est la plage contenant le catalogue tarifaire. **Règle absolue :** La première colonne de cette plage (colonne A) doit impérativement contenir les éléments comparés avec la valeur cherchée.
   - **Verrouillage obligatoire :** On applique impérativement les signes \`$\` (\`$A$3:$B$6\`) via la touche \`F4\` pour que la table ne glisse pas vers le bas lorsqu'on étirera la formule sur 50 lignes.
3. **Argument 3 : \`no_index_col\` (\`2\`) ➔ *« Quelle colonne du catalogue contient le résultat à rapporter ? »***
   - Ce n'est pas une lettre ! C'est le numéro d'ordre relatif dans la table sélectionnée. La colonne A est la colonne 1 (Armateur), la colonne B est la colonne 2 (Forfait Transit). On indique donc \`2\`.
4. **Argument 4 : \`[valeur_proche]\` (\`FAUX\` ou \`0\`) ➔ *« Est-ce que j'accepte l'approximation ? »***
   - En gestion d'entreprise, comptabilité et douane, **L'APPROXIMATION EST STRICTEMENT INTERDITE**.
   - \`FAUX\` (ou \`0\`) impose une correspondance exacte. Si la valeur n'existe pas, Excel renvoie une erreur au lieu d'inventer un tarif fantaisiste !
   - Si vous mettez \`VRAI\` (ou omettez l'argument), Excel cherche la valeur la plus proche dans une table triée, ce qui conduit à facturer le mauvais client ou appliquer le mauvais tarif douanier.

#### 3.3 Ouverture DSI : La relève moderne RECHERCHEX (XLOOKUP)
Sur Microsoft 365 et Excel moderne, Microsoft a introduit \`RECHERCHEX\` pour pallier les limites historiques de \`RECHERCHEV\` (impossibilité de chercher vers la gauche, fragilité lors de l'insertion de colonnes).
\`\`\`excel
=RECHERCHEX(C4; Tarifs_Transit!$A$3:$A$6; Tarifs_Transit!$B$3:$B$6; "Tarif Inconnu"; 0)
\`\`\`
En tant que technicien de proximité, vous devez maîtriser \`RECHERCHEV\` car 80 % des postes en entreprise tournent encore sur des versions perpétuelles (Excel 2016, 2019, 2021) ou des classeurs historiques.

---

### Leçon 4 : Autopsie du #N/A et nettoyage de chaînes avec SUPPRESPACE et SIERREUR

#### 4.1 Pourquoi l'ordinateur échoue : L'égalité binaire stricte
Pourquoi la formule de Corinne renvoie-t-elle \`#N/A\` alors que l'armateur \`CMA-CGM\` est visiblement présent dans les deux onglets ?
Pour un être humain, \`"CMA-CGM "\` et \`"CMA-CGM"\` semblent identiques car l'œil ignore les espaces blancs.
Pour un microprocesseur, une chaîne de texte est une suite d'octets ASCII :
- \`"CMA-CGM"\` = 7 caractères (octets : 67, 77, 65, 45, 67, 71, 77).
- \`"CMA-CGM "\` = 8 caractères (les 7 mêmes octets + l'octet 32 représentant l'espace).
L'ordinateur compare octet par octet : $7 \neq 8$, donc la condition d'égalité est fausse ! Ne trouvant aucune correspondance exacte, il lève l'exception standard **\`#N/A\` (Not Applicable / Non Disponible)**.

#### 4.2 La fonction salvatrice : SUPPRESPACE (TRIM en anglais)
La fonction \`SUPPRESPACE(texte)\` accomplit trois nettoyages vitaux :
1. Elle supprime tous les espaces situés au début de la chaîne (espaces préfixes).
2. Elle supprime tous les espaces situés à la fin de la chaîne (espaces suffixes invisibles).
3. Elle remplace les séries d'espaces multiples au milieu par un espace unique.

En écrivant \`SUPPRESPACE(C4)\`, \`'CMA-CGM '\` redevient instantanément \`'CMA-CGM'\` (7 caractères), et \`RECHERCHEV\` trouve immédiatement la ligne correspondante !

#### 4.3 La ceinture de sécurité : SIERREUR (IFERROR en anglais)
Que se passe-t-il si un navire d'un nouvel armateur non répertorié (ex: *Evergreen*) arrive au port ? \`RECHERCHEV\` renverra à nouveau \`#N/A\`, ce qui bloquera les formules de somme en bas de page.
La fonction \`SIERREUR(formule; valeur_si_erreur)\` intercepte toute anomalie et affiche une valeur de substitution propre (ex: \`0\` ou \`"A VÉRIFIER"\`).

#### 4.4 L'architecture d'imbrication « de l'intérieur vers l'extérieur »
\`\`\`excel
=SIERREUR( RECHERCHEV( SUPPRESPACE(C4) ; Tarifs_Transit!$A$3:$B$6 ; 2 ; FAUX ) ; 0 )
\`\`\`
1. **Étage 1 (Cœur) :** \`SUPPRESPACE(C4)\` nettoie les espaces parasites de la cellule C4.
2. **Étage 2 (Moteur) :** \`RECHERCHEV(..., 2, FAUX)\` consulte le catalogue et extrait le forfait transit.
3. **Étage 3 (Bouclier) :** \`SIERREUR(..., 0)\` sécurise l'ensemble pour éviter tout crash visuel.

#### 4.5 Le glossaire diagnostique des erreurs Excel
- **\`#N/A\` :** Valeur non trouvée (souvent causée par un espace invisible ou une faute d'orthographe).
- **\`#DIV/0!\` :** Tentative de division par zéro ou par une cellule vide.
- **\`#NOM?\` :** Faute de frappe sur le nom de la fonction (ex: \`RECHERVE\` au lieu de \`RECHERCHEV\`).
- **\`#REF!\` :** Référence de cellule supprimée ou écrasée.
- **\`#VALEUR!\` :** Incompatibilité de type (ex: vouloir multiplier une cellule contenant du texte par 8,5 %).

---

### Leçon 5 : Références relatives vs absolues ($) et Fiscalité Locale Antilles (Guadeloupe 971)

#### 5.1 La mécanique du glissement de cellule lors de la recopie
Quand on saisit \`=F4*H2\` en ligne 4 et qu'on tire vers le bas :
- En ligne 5, la formule devient automatiquement \`=F5*H3\`.
- En ligne 6, elle devient \`=F6*H4\`.
Or, la cellule \`H2\` contient le taux de 8,5 %, tandis que \`H3\` contient l'en-tête textuel \`"Octroi de mer (€)"\` ! Multiplier une somme d'argent par du texte déclenche immédiatement l'erreur **\`#VALEUR!\`** !

#### 5.2 Le rôle du verrouillage absolu avec le signe dollar ($)
Le signe \`$\` agit comme un cadenas posé sur les coordonnées d'une cellule :
- \`$H$2\` : La colonne H et la ligne 2 sont totalement scellées (référence absolue).
- \`H$2\` : La ligne 2 est figée, la colonne peut varier (référence semi-absolue ligne).
- \`$H2\` : La colonne H est figée, la ligne peut descendre (référence semi-absolue colonne).
- **Raccourci clavier universel :** Touche **\`F4\`** (sur PC portable, souvent \`Fn + F4\`) pour faire défiler les 4 modes de verrouillage en un clic.

#### 5.3 Les spécificités fiscales de la Guadeloupe (Réglementation Portuaire)
Aux Antilles (Guadeloupe 971, Martinique 972), la fiscalité indirecte à l'importation maritime présente des règles uniques :
1. **L'Octroi de mer (OM) :** Taxe historique propre aux départements d'outre-mer, perçue par les Douanes au profit des collectivités locales. Le taux normal est fixé à **8,5 %**.
2. **La TVA locale :** En Guadeloupe, le taux normal de TVA n'est pas de 20 % (comme en métropole), mais de **8,5 %** (art. 296 du Code Général des Impôts).

#### 5.4 Les deux niveaux de calcul fiscal (Pédagogie différenciée DSI)
- **Niveau 1 — Calcul Direct (Standard d'initiation) :**
  - $\text{Octroi de mer} = \text{Base HT} \times 8,5 \% \implies \text{Formule : } \texttt{=F4*\$H\$2}$
  - $\text{TVA locale} = \text{Base HT} \times 8,5 \% \implies \text{Formule : } \texttt{=F4*\$I\$2}$
- **Niveau 2 — Réalité Douanière Portuaire (Expertise DSI Antilles) :**
  - Selon le Code des Douanes, la TVA à l'importation frappe la valeur en douane **majorée de l'Octroi de mer déjà acquitté** (l'Octroi de mer entre dans l'assiette imposable de la TVA) :
    $$\text{Assiette TVA} = \text{Base HT} + \text{Octroi de mer}$$
    $$\text{TVA Douanière} = (\text{Base HT} + \text{Octroi de mer}) \times 8,5 \% \implies \text{Formule : } \texttt{=(F4+H4)*\$I\$2}$$

> [!TIP] 🎙️ Ce que David explique au groupe
> *« En cours et dans notre atelier KLF Tech Lab, nous acceptons les deux méthodes pour que personne ne soit pénalisé. Mais retenez bien ceci pour votre culture professionnelle : sur le port de Jarry, la douane applique la TVA sur la base HT + l'Octroi. Si vous travaillez un jour chez un transitaire ou en compta fret, cette nuance vous évitera des redressements douaniers ! »*

---

### Leçon 6 : Ergonomie des grands classeurs (Figeage des volets), contrôle de cohérence et clôture ITIL

#### 6.1 L'ergonomie bureautique : Figeage des volets (Freeze Panes)
Dans un manifeste maritime de 800 conteneurs, dès que l'usager fait défiler l'écran vers le bas, la ligne d'en-tête disparaît. L'utilisateur ne sait plus si la colonne F correspond à la Base HT, aux frais de transit ou à l'assurance.
- **Action corrective :** Menu **Affichage > Figer les volets**.
- En figeant les 3 premières lignes, les titres restent ancrés en permanence en haut de l'écran lors du défilement vertical, garantissant une saisie sans erreur.

#### 6.2 Contrôle de cohérence global (La formule SOMME)
Avant de déclarer un travail achevé, le technicien insère une ligne de totalisation générale (\`Ligne 14\`) utilisant \`=SOMME(F4:F13)\`, \`=SOMME(G4:G13)\`, etc. Cela permet de vérifier en un coup d'œil que le chiffre d'affaires global et la masse fiscale concordent au centime près.

#### 6.3 La clôture professionnelle ITIL en 3 volets (Dossier Professionnel)
Pour valider le CCP 1 du Titre Professionnel TIP devant les jurys du Ministère du Travail, un dépannage ne se termine pas quand la formule fonctionne : il se termine quand l'intervention est consignée et l'usager notifié.
1. **Qualification de l'incident :** Catégorisation technique (Incident Applicatif Bureautique / Urgence P1).
2. **Démarche technique rédigée au « Je » :** Rédaction claire et factuelle des actions entreprises avec le vocabulaire officiel (normalisation de type, assainissement de chaîne par \`SUPPRESPACE\`, références absolues \`$\`, sécurisation par \`SIERREUR\`).
3. **Communication usager bienveillante :** Rédaction d'un message professionnel à Corinne MONROSE expliquant le dépannage sans condescendance et confirmant que ses manifestes sont prêts pour la douane.

---

## ⏱️ 3. Déroulé minuté de la journée (08h30 – 15h30 / 6h00 nettes)

### MATIN (08h30 – 12h30 / 4h00)
- **08h30 – 09h00 (30 min) : Accueil, immersion métier & appel d'urgence de Corinne**
  - Présentation du Ticket d'incident P1 \`TCK-101\`. Mise en situation sur le quai n°3 de Jarry.
  - Sauvegarde immédiate du classeur brut \`KLF_Manifeste_Arrivages_Corinne_BRUT_SAVE.xlsx\`.
- **09h00 – 10h00 (1h00) : Leçon interactive 1 & 2 – Typage & Mystère des codes postaux**
  - Démonstration sur grand écran de la perte du zéro (\`01234\` ➔ \`1234\`).
  - Atelier pratique : mise en œuvre des 3 méthodes (apostrophe, masque \`00000\`, fonction \`TEXTE\`).
  - Validation du Jalon 1 par les apprenants.
- **10h00 – 10h15 (15 min) : Pause pédagogique**
- **10h15 – 11h15 (1h00) : Leçon 3 & 4 – Anatomie de RECHERCHEV et autopsie du #N/A**
  - Décorticage pas-à-pas des 4 paramètres. Démonstration de l'espace invisible à l'origine du \`#N/A\`.
  - Manipulation guidée : assemblage de \`SUPPRESPACE\` et \`SIERREUR\`.
- **11h15 – 12h30 (1h15) : Pratique autonome guidée sur les frais de transit**
  - Les apprenants résolvent les 10 lignes de conteneurs.
  - Tour de table de David JACQUA pour débloquer les erreurs de syntaxe (point-virgule vs virgule).
  - Validation du Jalon 2.

---

### PAUSE DÉJEUNER (12h30 – 13h30 / 1h00)

---

### APRÈS-MIDI (13h30 – 15h30 / 2h00)
- **13h30 – 14h15 (45 min) : Leçon 5 – Fiscalité Guadeloupe & Références absolues ($)**
  - Explication mécanique du glissement de cellule lors de la recopie. Touche \`F4\`.
  - Application des taux de 8,5 % en \`$H$2\` et \`$I$2\`. Calcul du Total TTC.
  - Validation des Jalons 3, 4 et 5.
- **14h15 – 15h00 (45 min) : Ergonomie des volets & Auto-audit KLF Tech Lab**
  - Application du figeage des volets sur la ligne 3.
  - Dépôt du fichier sur le KLF Tech Lab : obtention du score de 100 % (5/5 jalons validés).
- **15h00 – 15h30 (30 min) : Clôture ITIL, carnet réflexif & débriefing collectif**
  - Rédaction de la démarche technique au « Je » pour le Dossier Professionnel (DP).
  - Rédaction du message usager pour Corinne. Bilan des apprentissages et visa de David JACQUA.

---

## 📊 4. Grille d'évaluation formative Qualiopi (Indicateur 11)

| Critère d'évaluation | Indicateur technique observable | Poids | Seuil de maîtrise |
| :--- | :--- | :---: | :---: |
| **Jalon 1 : Codes postaux** | 100 % des 10 codes sur 5 positions (format texte / masque 00000) | 4 pts | 10/10 conformes |
| **Jalon 2 : Éradication #N/A** | 0 erreur #N/A, 10 forfaits transit résolus, formule SUPPRESPACE validée | 4 pts | 10/10 résolus |
| **Jalon 3 : Octroi de mer** | Formule dynamique \`=F4*$H$2\` avec verrouillage absolu dollar | 4 pts | Formule + Montant |
| **Jalon 4 : TVA Guadeloupe** | Formule dynamique \`=F4*$I$2\` ou assiette douanière \`=(F4+H4)*$I$2\` | 4 pts | Formule + Montant |
| **Jalon 5 : Total TTC & Volets** | Somme TTC exacte, volets figés ligne 3, total général ligne 14 | 4 pts | Ergonomie active |
| **Carnet réflexif ITIL (DP)** | Démarche rédigée au « Je » avec terminologie REAC + Message usager | Visa | Posture validée |
`;
}

async function run() {
  console.log('🚀 Démarrage de la génération de la Séance 8 (05/11/2026 - Incident Corinne)...');

  // Création des dossiers cibles
  if (!fs.existsSync(targetBrainDir)) {
    fs.mkdirSync(targetBrainDir, { recursive: true });
    console.log(`📁 Dossier créé : ${targetBrainDir}`);
  }
  if (!fs.existsSync(klfEnterpriseDir)) {
    fs.mkdirSync(klfEnterpriseDir, { recursive: true });
    console.log(`📁 Dossier créé : ${klfEnterpriseDir}`);
  }

  // ---------------------------------------------------------------------------
  // 1. LIVRABLE 1 : Cours Magistral Appliqué & Fiche d'Animation Formateur (.md)
  // ---------------------------------------------------------------------------
  const ficheAnimationPath = path.join(targetBrainDir, 'Palier 2 - Séance 08 - Fiche d\'animation formateur (05-11-2026).md');
  fs.writeFileSync(ficheAnimationPath, generateFicheAnimationMarkdown(), 'utf-8');
  console.log(`✅ LIVRABLE 1 généré : ${ficheAnimationPath}`);

  // ---------------------------------------------------------------------------
  // 2. LIVRABLE 2 : Support de Cours & Guide TP Apprenant (.md, .html, .pdf)
  // ---------------------------------------------------------------------------
  const tpMdPath = path.join(targetBrainDir, 'TP_Consignes_Corinne_RECHERCHEV_Fiscalite_051126.md');
  fs.writeFileSync(tpMdPath, generateTpMarkdown(), 'utf-8');
  console.log(`✅ LIVRABLE 2 (Markdown) généré : ${tpMdPath}`);

  const tpHtmlPath = path.join(targetBrainDir, 'TP_Consignes_Corinne_RECHERCHEV_Fiscalite_051126.html');
  const tpHtmlContent = generateTpHtml();
  fs.writeFileSync(tpHtmlPath, tpHtmlContent, 'utf-8');
  console.log(`✅ LIVRABLE 2 (HTML) généré : ${tpHtmlPath}`);

  console.log('⏳ Compilation du PDF Gotenberg officiel (strictement 4 pages A4)...');
  const tpPdfBuffer = await compilePdf(tpHtmlContent, 'TP_Consignes_Corinne_RECHERCHEV_Fiscalite_051126.pdf');
  const tpPdfPath = path.join(targetBrainDir, 'TP_Consignes_Corinne_RECHERCHEV_Fiscalite_051126.pdf');
  fs.writeFileSync(tpPdfPath, tpPdfBuffer);

  const pageCount = getPdfPageCount(tpPdfBuffer);
  console.log(`📄 Nombre de pages physiques détecté dans le PDF : ${pageCount} page(s)`);
  if (pageCount !== 4) {
    throw new Error(`ERREUR BLOQUANTE : Le PDF généré comporte ${pageCount} pages physiques au lieu de STRICTEMENT 4 pages !`);
  }
  console.log(`✅ LIVRABLE 2 (PDF Gotenberg) validé conforme : STRICTEMENT 4 PAGES (${tpPdfPath}, ${tpPdfBuffer.length} octets)`);

  // ---------------------------------------------------------------------------
  // 3. LIVRABLE 3 : Classeurs Excel Brut et Corrigé DSI (Formules Vives)
  // ---------------------------------------------------------------------------
  console.log('📊 Génération des classeurs Excel (Brut et Corrigé DSI)...');
  const brutWb = generateCorinneBrutWorkbook();
  const brutBuffer = XLSX.write(brutWb, { type: 'buffer', bookType: 'xlsx' });

  const corrWb = buildTeacherCorrigéWorkbook();
  const corrBuffer = XLSX.write(corrWb, { type: 'buffer', bookType: 'xlsx' });

  // Écriture dans le dossier de la séance 051126
  const brutPath1 = path.join(targetBrainDir, 'KLF_Manifeste_Arrivages_Corinne_BRUT.xlsx');
  const corrPath1 = path.join(targetBrainDir, 'KLF_Manifeste_Arrivages_Corinne_CORRIGE_DSI.xlsx');
  fs.writeFileSync(brutPath1, brutBuffer);
  fs.writeFileSync(corrPath1, corrBuffer);
  console.log(`✅ LIVRABLE 3 (051126) généré : ${brutPath1} & ${corrPath1}`);

  // Écriture dans le dossier Entreprise Fictive KLF
  const brutPath2 = path.join(klfEnterpriseDir, 'KLF_Manifeste_Arrivages_Corinne_BRUT.xlsx');
  const corrPath2 = path.join(klfEnterpriseDir, 'KLF_Manifeste_Arrivages_Corinne_CORRIGE_DSI.xlsx');
  fs.writeFileSync(brutPath2, brutBuffer);
  fs.writeFileSync(corrPath2, corrBuffer);
  console.log(`✅ LIVRABLE 3 (Entreprise KLF) généré : ${brutPath2} & ${corrPath2}`);

  // ---------------------------------------------------------------------------
  // 4. VALIDATION EMPIRIQUE IMMÉDIATE DU CLASSEUR CORRIGÉ
  // ---------------------------------------------------------------------------
  console.log('🧪 Audit empirique du classeur corrigé DSI avec auditCorinneManifesteExcel()...');
  const auditResult = await auditCorinneManifesteExcel(corrBuffer, 'KLF_Manifeste_Arrivages_Corinne_CORRIGE_DSI.xlsx', corrBuffer.length);
  console.log(`Score obtenu : ${auditResult.scorePct}% (${auditResult.validCount}/${auditResult.milestonesCount} jalons validés)`);
  auditResult.details.forEach(d => console.log(`  - [${d.status}] ${d.milestoneId}: ${d.message}`));

  if (!auditResult.isFullyValid || auditResult.validCount !== 5 || auditResult.scorePct !== 100) {
    throw new Error(`ERREUR : Le classeur corrigé n'a pas obtenu 100% (obtenu ${auditResult.scorePct}%)`);
  }
  console.log('🎉 AUDIT EMPIRIQUE DU CLASSEUR CORRIGÉ 100% SUCCÈS (5/5) !');
}

run().catch(err => {
  console.error('ERREUR:', err);
  process.exit(1);
});
