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
  console.log('🚀 Démarrage de la génération de la Fiche Journalière EN-19 du 27/10/2026...');

  const folderName = '27-10-26';
  const targetDir = path.join(baseOutDir, folderName);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`📁 Dossier créé : ${targetDir}`);
  }

  const dateStr = '2026-10-27';
  const dateDisplay = '27/10/2026';
  const seanceNum = '7';

  const objectifs: SessionItem[] = [
    { bold: 'Concevoir des graphiques décisionnels DSI : ', text: 'restituer visuellement la ventilation du parc par OS (graphique en anneau) pour le Comité de Direction.' },
    { bold: 'Visualiser l\'obsolescence face au seuil d\'alerte : ', text: 'modéliser le taux de vétusté critique (36%) par rapport au seuil de renouvellement DSI (20%).' },
    { bold: 'Automatiser des alertes visuelles sur l\'inventaire : ', text: 'configurer des règles de mise en forme conditionnelle dynamiques sur les machines de plus de 5 ans.' },
    { bold: 'Différencier et consolider les compétences : ', text: 'permettre le rattrapage des formules statistiques pour les absents et valoriser l\'entraide par les pairs (support N2).' },
  ];

  const contenu: SessionItem[] = [
    { bold: 'Atelier de différenciation & Peer-learning : ', text: 'Rattrapage guidé du tableau de bord d\'inventaire KLF et soutien technique individualisé par les apprenants avancés.' },
    { bold: 'Modélisation graphique professionnelle : ', text: 'Création et mise en forme du graphique Donut (répartition OS) selon la charte visuelle DSI KLF (bleu nuit / orange alerte).' },
    { bold: 'Histogramme comparatif seuil critique : ', text: 'Construction de la jauge d\'aide à la décision budgétaire 2027 et calcul de l\'écart au seuil.' },
    { bold: 'Mise en forme conditionnelle dynamique : ', text: 'Application de surbrillances automatiques rouge clair / rouge foncé sur l\'inventaire et test empirique de réactivité.' },
  ];

  const supports: SessionItem[] = [
    { bold: 'Classeur d\'inventaire KLF base et corrigé ', text: '(KLF_Inventaire_Parc_Jarry_Base_271026.xlsx et KLF_Tableau_Bord_DSI_Graphiques_CORRIGE.xlsx).' },
    { bold: 'Fiche guide de TP imprimable Qualiopi ', text: '(TP_Consignes_Graphiques_DSI_MFC_271026.pdf).' },
    { bold: 'Suite bureautique Microsoft Excel / Google Sheets ', text: 'et vidéoprojection / partage d\'écran Google Meet.' },
    { bold: 'Espace collaboratif partagé Google Drive ', text: 'de la promotion TIP 2026.' },
  ];

  const remarquesHumaine: SessionItem[] = [
    { bold: 'Excellente implication collective : ', text: 'la dynamique de binômes et de support mutuel entre apprenants a permis de rattraper le retard de la séance précédente avec beaucoup d\'efficacité.' },
    { bold: 'Montée en compétence visuelle très gratifiante : ', text: 'les apprenants ont immédiatement compris la valeur ajoutée des graphiques professionnels pour convaincre un décideur ou un DSI.' },
    { bold: 'Travaux finalisés et archivés : ', text: 'dépôt des classeurs complets avec graphiques et alertes conditionnelles dans les casiers Google Drive.' },
  ];

  const remarquesAdmin: SessionItem[] = [
    { bold: 'Conformité Qualiopi Indicateurs 10, 11 & 18 : ', text: 'individualisation des parcours, gestion de l\'hétérogénéité post-distanciel, évaluation formative et traçabilité des livrables.' },
    { bold: 'Couverture du REAC Ministère du Travail (CCP 1) : ', text: 'maîtrise de la CP 01 (assistance usagers et posture collaborative) et de la CP 02 (gestion et pilotage de parc informatique).' },
    { bold: 'Traçabilité des présences et des livrables : ', text: 'fichiers normés contrôlés et validés sur l\'espace numérique sécurisé.' },
  ];

  const baseData: FicheJournaliereData = {
    nomFormateur: 'JACQUA David',
    module: 'Palier 1 - Visualisation DSI & Graphiques décisionnels',
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

    fs.writeFileSync(htmlPath, compiledHtml, 'utf-8');
    console.log(`  📄 HTML généré : ${htmlFileName}`);

    try {
      const pdfBuf = await compilePdf(compiledHtml, pdfFileName);
      fs.writeFileSync(pdfPath, pdfBuf);
      console.log(`  ✅ PDF généré (${(pdfBuf.length / 1024).toFixed(1)} Ko) : ${pdfFileName}`);
    } catch (err: any) {
      console.error(`  ⚠️ Erreur compilation PDF pour ${pdfFileName} :`, err.message);
    }
  }

  console.log('\n🎉 Fiches Journalières EN-19 générées et compilées avec succès !');
}

run().catch(console.error);
