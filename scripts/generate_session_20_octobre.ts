import * as fs from 'fs';
import * as path from 'path';
import { generateFicheJournalierePdfHtml, FicheJournaliereData } from '../src/lib/templates/ficheJournalierePdfTemplate';
import { SessionItem } from '../src/lib/data/chronogrammeSessions';

const webhookUrl = process.env.N8N_QUALIOPI_PDF_WEBHOOK_URL || 'https://n8n.shandev.cloud/webhook/qualiopi-pdf-generate';
const bearerToken = process.env.KLF_WEBHOOK_BEARER_TOKEN || 'klf_tip_bearer_secret_2026_jarry_secure!';

const baseOutDir = path.resolve('c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/06 - Ressources/FichesJournalières');

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
  console.log('🚀 Démarrage de la génération de la Fiche Journalière EN-19 du 20/10/2026...');

  const folderName = '20-10-26';
  const targetDir = path.join(baseOutDir, folderName);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`📁 Dossier créé : ${targetDir}`);
  }

  const dateStr = '2026-10-20';
  const dateDisplay = '20/10/2026';
  const seanceNum = '6';

  const objectifs: SessionItem[] = [
    { bold: 'Débriefer le retour de stage immersion (70h) : ', text: 'capitaliser sur les pannes réelles vécues en entreprise pour alimenter le Dossier Professionnel (DP).' },
    { bold: 'Maîtriser les formules conditionnelles statistiques ', text: 'clés du support informatique (NB.SI, SOMME.SI) et calculs de ratios d\'équipements.' },
    { bold: 'Calculer le taux d\'obsolescence et l\'âge du parc ', text: 'via l\'automatisation des indicateurs d\'ancienneté par rapport à la date du jour.' },
    { bold: 'Automatiser des alertes visuelles ', text: 'par mise en forme conditionnelle (matériels critiques hors garantie à renouveler).' },
  ];

  const contenu: SessionItem[] = [
    { bold: 'Tour de table retour de stage & recueil d\'incidents : ', text: 'Partage d\'expériences terrain, analyse des pannes résolues et cadrage de la fiche pratique DP (règle des 5 rubriques).' },
    { bold: 'Atelier formules statistiques DSI KLF : ', text: 'Dénombrement automatique du parc par système d\'exploitation (Windows 10 / Windows 11) et par type de machine (Fixe / Portable).' },
    { bold: 'Indicateurs d\'ancienneté & calculs d\'obsolescence : ', text: 'Calcul dynamique de l\'âge des postes par rapport à AUJOURDHUI() et proportion du parc de Jarry à remplacer (> 5 ans).' },
    { bold: 'Mise en forme conditionnelle & archivage Drive : ', text: 'Coloration automatique des machines hors garantie et dépôt du livrable normé sur l\'espace collaboratif.' },
  ];

  const supports: SessionItem[] = [
    { bold: 'Base d\'inventaire KLF consolidée ', text: '(KLF_Inventaire_Parc_Jarry_Brut.xlsx enrichi).' },
    { bold: 'Grille d\'exploitation de stage ', text: 'et référentiel de compétences REAC TIP (CCP 1).' },
    { bold: 'Postes informatiques de la salle ', text: 'avec suite bureautique (Google Sheets & Microsoft Excel).' },
    { bold: 'Espace partagé Google Drive ', text: 'de la promotion (TIP-FORE-2026_2027).' },
  ];

  const remarquesHumaine: SessionItem[] = [
    { bold: 'Excellente dynamique de reprise : ', text: 'les apprenants reviennent motivés et enrichis de leur immersion de 2 semaines en entreprise, très fiers de leurs dépannages.' },
    { bold: 'Lien terrain / cours très porteur : ', text: 'les stagiaires ont immédiatement perçu l\'intérêt des formules statistiques après avoir constaté le désordre des parcs en entreprise.' },
    { bold: 'Promotion au complet (12/12) : ', text: 'mobilisation totale et rigueur sur la tenue des casiers numériques.' },
  ];

  const remarquesAdmin: SessionItem[] = [
    { bold: 'Conformité Qualiopi Indicateur 11 & 22 : ', text: 'traçabilité des compétences acquises en immersion professionnelle (70h PAE) et exploitation pédagogique continue.' },
    { bold: 'Couverture du REAC Ministère du Travail (CCP 1) : ', text: 'acquisition des compétences de gestion de parc et de conception de tableaux de bord d\'aide à la décision technique.' },
    { bold: 'Traçabilité documentaire : ', text: 'livrables déposés et contrôlés dans l\'espace collaboratif sécurisé de la promotion.' },
  ];

  const baseData: FicheJournaliereData = {
    nomFormateur: 'JACQUA David',
    module: 'Palier 1 - Analyse de parc & Formules statistiques',
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
    const pdfPath = path.join(targetDir, pdfFileName);

    // Écriture HTML
    fs.writeFileSync(htmlPath, compiledHtml, 'utf-8');
    console.log(`  📄 HTML généré : ${htmlFileName}`);

    // Compilation PDF via Gotenberg
    console.log(`  ⏳ Compilation Gotenberg : ${pdfFileName}...`);
    const pdfBuffer = await compilePdf(compiledHtml, pdfFileName);
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`  ✅ PDF généré avec succès (${(pdfBuffer.length / 1024).toFixed(1)} Ko) : ${pdfFileName}`);
  }

  console.log('\n🎉 Fiche journalière du 20/10/2026 générée avec succès !');
}

run().catch(console.error);
