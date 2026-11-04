import * as fs from 'fs';
import * as path from 'path';
import { FORE_LOGO_BASE64, FRANCE_TRAVAIL_LOGO_BASE64 } from '../src/lib/templates/fichesLogos';

const webhookUrl = process.env.N8N_QUALIOPI_PDF_WEBHOOK_URL || 'https://n8n.shandev.cloud/webhook/qualiopi-pdf-generate';
const bearerToken = process.env.KLF_WEBHOOK_BEARER_TOKEN || 'klf_tip_bearer_secret_2026_jarry_secure!';

const baseOutDir = path.resolve('c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/06 - Ressources/FichesJournalières');

export interface SessionItem {
  bold: string;
  text?: string;
}

export interface FicheJournaliereData {
  nomFormateur: string;
  module: string;
  filiere: string;
  date: string;
  seance: string | number;
  objectifs: SessionItem[];
  contenu: SessionItem[];
  supports: SessionItem[];
  remarques: SessionItem[];
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateFicheJournalierePdfHtml(data: FicheJournaliereData): string {
  const objectifsHtml = (data.objectifs || [])
    .map(
      (item) =>
        `          <li><strong>${escapeHtml(item.bold)}</strong>${escapeHtml(item.text || '')}</li>`
    )
    .join('\n');

  const contenuHtml = (data.contenu || [])
    .map(
      (item) =>
        `          <li><strong>${escapeHtml(item.bold)}</strong>${escapeHtml(item.text || '')}</li>`
    )
    .join('\n');

  const supportsHtml = (data.supports || [])
    .map(
      (item) =>
        `          <li><strong>${escapeHtml(item.bold)}</strong>${escapeHtml(item.text || '')}</li>`
    )
    .join('\n');

  const remarquesHtml = (data.remarques || [])
    .map(
      (item) =>
        `          <li><strong>${escapeHtml(item.bold)}</strong>${escapeHtml(item.text || '')}</li>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche Journalière Activité Formateur - ${escapeHtml(data.date)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 10mm 15mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      color: #000;
      background: #f8fafc;
      margin: 0;
      padding: 16px;
    }
    .sheet {
      background: #fff;
      max-width: 820px;
      margin: 0 auto;
      padding: 20px 24px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    table { width: 100%; border-collapse: collapse; }
    .header-table td {
      border: 1.5px solid #000;
      padding: 6px 12px;
      vertical-align: middle;
    }
    .logo-cell { width: 19%; text-align: center; padding: 4px !important; }
    .logo-cell img { max-height: 62px; display: block; margin: 0 auto; }
    .title-cell {
      width: 57%;
      text-align: center;
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.5px;
      line-height: 1.35;
      color: #000;
    }
    .ref-cell { width: 24%; text-align: right; font-size: 10.5px; line-height: 1.25; }
    .ref-en19 { font-size: 15.5px; font-weight: 800; color: #000; }
    .ref-date { font-size: 10.5px; color: #334155; margin-bottom: 2px; }
    .rf-logo-img { max-height: 48px; margin-top: 2px; display: inline-block; }
    .meta-section {
      margin: 11px 0 9px 0;
      font-size: 13px;
      line-height: 1.7;
    }
    .meta-row { display: flex; justify-content: space-between; }
    .bold { font-weight: bold; }
    .handwritten-val { font-family: Arial, "Segoe UI", sans-serif; font-weight: 700; color: #000; }
    .main-table {
      margin-top: 0px;
      border: 1.5px solid #000;
    }
    .main-table td {
      border: 1.5px solid #000;
      padding: 16px 14px;
      vertical-align: top;
    }
    .section-title {
      font-weight: bold;
      font-size: 12.5px;
      margin-bottom: 6px;
      color: #000;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    ul { margin: 0; padding-left: 18px; }
    li {
      font-size: 11.8px;
      line-height: 1.50;
      margin-bottom: 5.5px;
      color: #0f172a;
    }
    li:last-child { margin-bottom: 0; }
    .footer-note {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      margin-top: 10px;
      color: #334155;
    }
    @media print {
      body { background: #fff; padding: 0; margin: 0; }
      .sheet { border: none; box-shadow: none; padding: 0; margin: 0; max-width: 100%; }
      .main-table td { padding: 16px 14px; }
      li { font-size: 11.8px; line-height: 1.50; margin-bottom: 5.5px; }
    }
  </style>
</head>
<body>
<div class="sheet">
  <table class="header-table">
    <tr>
      <td class="logo-cell"><img src="${FORE_LOGO_BASE64}"></td>
      <td class="title-cell">FICHE JOURNALIERE ACTIVITE<br>FORMATEUR</td>
      <td class="ref-cell">
        <div class="ref-en19">EN-19</div>
        <div class="ref-date">14/03/2025</div>
        <img class="rf-logo-img" src="${FRANCE_TRAVAIL_LOGO_BASE64}">
      </td>
    </tr>
  </table>

  <div class="meta-section">
    <div class="meta-row">
      <div><span class="bold">NOM DU FORMATEUR :</span> <span class="handwritten-val">${escapeHtml(data.nomFormateur || 'JACQUA David')}</span></div>
      <div><span class="bold">MODULE :</span> <span class="handwritten-val">${escapeHtml(data.module)}</span></div>
    </div>
    <div>
      <span class="bold">FILIERE :</span> <span class="handwritten-val">${escapeHtml(data.filiere || 'TECHNICIEN INFORMATIQUE DE PROXIMITE')}</span>
    </div>
    <div class="meta-row">
      <div><span class="bold">DATE :</span> <span class="handwritten-val">${escapeHtml(data.date)}</span></div>
      <div><span class="bold">SEANCE N° :</span> <span class="handwritten-val">${escapeHtml(String(data.seance))}</span></div>
    </div>
  </div>

  <table class="main-table">
    <tr>
      <td>
        <div class="section-title">OBJECTIFS DE LA SEANCE :</div>
        <ul>
${objectifsHtml}
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <div class="section-title">CONTENU DE LA SEANCE (COURS, EXERCICES ET APPLICATIONS RÉALISÉS) :</div>
        <ul>
${contenuHtml}
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <div class="section-title">SUPPORTS UTILISES :</div>
        <ul>
${supportsHtml}
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <div class="section-title">REMARQUES :</div>
        <ul>
${remarquesHtml}
        </ul>
      </td>
    </tr>
  </table>

  <div class="footer-note">
    <div><em>Note : si des difficultés sont rencontrées durant la séance, veuillez remplir le verso</em></div>
    <div class="bold">T.P.S.V.P</div>
  </div>
</div>
</body>
</html>`;
}

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

async function run() {
  console.log('🚀 Démarrage de la génération de la Fiche Journalière EN-19 du 05/11/2026...');

  const folderName = '05-11-26';
  const targetDir = path.join(baseOutDir, folderName);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`📁 Dossier créé : ${targetDir}`);
  }

  const dateStr = '2026-11-05';
  const dateDisplay = '05/11/2026';
  const seanceNum = '8';

  const objectifs: SessionItem[] = [
    { bold: 'Diagnostiquer et corriger les ruptures matricielles : ', text: 'résoudre les erreurs #N/A bloquantes sur les frais de transit portuaires via RECHERCHEV combinée à SUPPRESPACE.' },
    { bold: 'Maîtriser les typages de données et l\'intégrité postale : ', text: 'restituer les codes postaux sur 5 caractères avec zéros non significatifs préservés sans troncature.' },
    { bold: 'Automatiser la fiscalité indirecte de la Guadeloupe : ', text: 'calculer dynamiquement l\'Octroi de mer (8,5%) et la TVA locale (8,5%) avec références semi-absolues bloquées ($).' },
    { bold: 'Optimiser l\'ergonomie et formaliser la clôture ITIL : ', text: 'activer le figeage des volets et consigner la démarche technique au « Je » pour le Dossier Professionnel (CCP 1).' },
  ];

  const contenu: SessionItem[] = [
    { bold: 'Immersion incident critique P1 DSI (Ticket TCK-101) : ', text: 'Prise en charge du manifeste d\'arrivages maritimes de Corinne MONROSE bloqué à Jarry et copie de sauvegarde préalable.' },
    { bold: 'Analyse du typage mémoire (Texte vs Nombre) : ', text: 'Démonstration de la perte du zéro de tête (01234 -> 1234) et mise en œuvre des formats texte, apostrophe et masque 00000.' },
    { bold: 'Décorticage de RECHERCHEV et autopsie du #N/A : ', text: 'Analyse binaire de l\'espace parasite dans \'CMA-CGM \' et assemblage de l\'imbrication SIERREUR(RECHERCHEV(SUPPRESPACE(...))).' },
    { bold: 'Fiscalité portuaire Antilles et références $ : ', text: 'Mécanique du verrouillage absolu (F4) sur $H$2 et $I$2, calcul de l\'assiette douanière et totalisation générale.' },
    { bold: 'Recette technique et clôture ITIL : ', text: 'Figeage des volets sur la ligne d\'en-tête, audit automatisé KLF Tech Lab (100%) et rédaction du message usager rassurant.' },
  ];

  const supports: SessionItem[] = [
    { bold: 'Classeur de manifestes KLF brut et corrigé DSI ', text: '(KLF_Manifeste_Arrivages_Corinne_BRUT.xlsx et KLF_Manifeste_Arrivages_Corinne_CORRIGE_DSI.xlsx).' },
    { bold: 'Fiche guide de TP officiel Qualiopi ', text: '(TP_Consignes_Corinne_RECHERCHEV_Fiscalite_051126.pdf).' },
    { bold: 'Plateforme KLF Tech Lab Leaderboard ', text: 'Moteur d\'auto-audit 100% client et poste de travail technicien.' },
    { bold: 'Suite bureautique professionnelle Microsoft Excel ', text: 'et vidéoprojection / assistance synchrone.' },
  ];

  const remarquesHumaine: SessionItem[] = [
    { bold: 'Excellente mobilisation sur un scénario à fort enjeu : ', text: 'les apprenants ont immédiatement mesuré l\'impact économique concret d\'un conteneur bloqué au port de Jarry et se sont investis avec beaucoup de sérieux.' },
    { bold: 'Déclic pédagogique majeur sur l\'espace invisible : ', text: 'la démonstration en direct de l\'octet d\'espace provoquant le #N/A a suscité une vive prise de conscience sur l\'exigence de rigueur des données.' },
    { bold: 'Autonomie validée sur la fiscalité locale : ', text: '100% des apprenants ont réussi à verrouiller les références $H$2 et $I$2 sans décalage et ont obtenu les 5 jalons validés sur le Tech Lab.' },
  ];

  const remarquesAdmin: SessionItem[] = [
    { bold: 'Conformité Qualiopi Indicateurs 4, 5, 8, 10 & 11 : ', text: 'adéquation au référentiel RNCP 37674 (CCP 1), individualisation des parcours, évaluation formative continue et traçabilité des livrables.' },
    { bold: 'Couverture du REAC Ministère du Travail : ', text: 'validation de la CP 01 (assistance utilisateur, communication bienveillante) et de la CP 02 (gestion et fiabilisation des données bureautiques).' },
    { bold: 'Volume horaire cumulé : ', text: '34h00 réalisées sur les 85h00 du parcours. Émargements numériques et classeurs normalisés archivés sur l\'espace sécurisé.' },
  ];

  const baseData: FicheJournaliereData = {
    nomFormateur: 'JACQUA David',
    module: 'Palier 2 - Tableur Avancé, RECHERCHEV & Fiscalité Douanière Antilles',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    date: dateDisplay,
    seance: seanceNum,
    objectifs,
    contenu,
    supports,
    remarques: remarquesHumaine,
  };

  const variants = [
    { suffix: '', remarques: remarquesHumaine },
    { suffix: '_VERSION_HUMAINE', remarques: remarquesHumaine },
    { suffix: '_VERSION_ADMIN', remarques: remarquesAdmin },
  ];

  for (const v of variants) {
    const data: FicheJournaliereData = { ...baseData, remarques: v.remarques };
    const compiledHtml = generateFicheJournalierePdfHtml(data);

    const htmlFileName = `FICHE_JOURNALIERE_ACTIVITE_FORMATEUR_${dateStr}_David_JACQUA${v.suffix}.html`;
    const pdfFileName = `FICHE_JOURNALIERE_ACTIVITE_FORMATEUR_${dateStr}_David_JACQUA${v.suffix}.pdf`;

    const htmlPath = path.join(targetDir, htmlFileName);
    fs.writeFileSync(htmlPath, compiledHtml, 'utf-8');
    console.log(`📄 Fichier HTML généré : ${htmlPath}`);

    console.log(`⏳ Compilation Gotenberg : ${pdfFileName}...`);
    const pdfBuffer = await compilePdf(compiledHtml, pdfFileName);
    const pdfPath = path.join(targetDir, pdfFileName);
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`✅ Fichier PDF généré : ${pdfPath} (${pdfBuffer.length} octets)`);
  }

  console.log('🎉 Fiches Journalières du 05/11/2026 générées et compilées avec succès !');
}

run().catch((err) => {
  console.error('ERREUR:', err);
  process.exit(1);
});
