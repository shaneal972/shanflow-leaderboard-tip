import * as fs from 'fs';
import * as path from 'path';
import { generateFicheJournalierePdfHtml, FicheJournaliereData } from '../src/lib/templates/ficheJournalierePdfTemplate';
import { CHRONOGRAMME_SESSIONS, SessionItem } from '../src/lib/data/chronogrammeSessions';

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

interface SessionConfig {
  folderName: string;
  dateStr: string;
  dateDisplay: string;
  seanceNum: string;
  module: string;
  nomFormateur: string;
  filiere: string;
  objectifs: SessionItem[];
  contenu: SessionItem[];
  supports: SessionItem[];
  remarquesHumaine: SessionItem[];
  remarquesAdmin: SessionItem[];
}

async function run() {
  console.log('🚀 Démarrage de la mise à niveau et génération des Fiches Journalières (10, 15, 22, 29 Septembre)...');

  const s2 = CHRONOGRAMME_SESSIONS.find((s) => s.id === 2)!;
  const s3 = CHRONOGRAMME_SESSIONS.find((s) => s.id === 3)!;
  const s4 = CHRONOGRAMME_SESSIONS.find((s) => s.id === 4)!;
  const s5 = CHRONOGRAMME_SESSIONS.find((s) => s.id === 5)!;

  const sessionsToGenerate: SessionConfig[] = [
    {
      folderName: '10-09-26',
      dateStr: '2026-09-10',
      dateDisplay: '10/09/2026',
      seanceNum: '2',
      module: 'Savoir-être professionnel, TRE & DP',
      nomFormateur: 'JACQUA David',
      filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
      objectifs: [
        { bold: 'Corriger les défauts de posture et de communication ', text: 'orale face aux utilisateurs en détresse ou agressifs.' },
        { bold: 'Faire assimiler les obligations de discrétion ', text: 'et de confidentialité (RGPD, données salariales ou médicales) inhérentes aux droits administrateurs.' },
        { bold: 'Cadrer la rédaction du Dossier Professionnel ', text: '(DP Cerfa TP-00476, CCP 1) et la règle des 5 rubriques indispensables pour le jury.' },
        { bold: 'Débloquer la peur du téléphone ', text: 'pour démarcher activement les entreprises de Guadeloupe et structurer le CV technique.' }
      ],
      contenu: [
        { bold: 'Régularisations & Drive : ', text: 'Accueil de Kehyann (absent la veille), création de ses accès et de son casier. Contrôle des dossiers Drive de Jessy, Wilfried et Thomas B. avec recadrage sur le nommage des fichiers.' },
        { bold: 'Mises en situation & posture : ', text: 'Jeux de rôle de 2 minutes par binôme sur 3 cas réels : utilisateur en panique (urgence paie), cadre agressif lors d\'une panne, et collègue ayant bricolé son PC. Analyse critique en groupe des réactions et débriefing des réflexes à adopter (ne pas toucher au clavier les 30 premières secondes, écouter sans couper, rester calme).' },
        { bold: 'Dossier Professionnel (DP) : ', text: 'Explication des 5 rubriques obligatoires pour chaque fiche technique. Début de saisie de la page de garde et du tableau des parcours sur la trame Cerfa officielle.' },
        { bold: 'Prospection téléphonique en direct : ', text: 'Travail sur le script d\'appel pour passer le barrage standard en se positionnant comme un renfort technique support. Premiers appels passés en salle par les apprenants et création du fichier Excel de suivi (Suivi recherche de stage.xlsx).' },
        { bold: 'Atelier CV technique (après-midi) : ', text: 'Audit critique des CV des stagiaires. Réécriture pour éliminer les mentions généralistes et valoriser les compétences support (diagnostic, Windows, maintenance, réseau). Dépôt des versions corrigées sur le Drive.' }
      ],
      supports: [
        { bold: 'Trame officielle Cerfa ', text: 'du Dossier Professionnel (Titre Pro TP-00476, CCP 1).' },
        { bold: 'Script d\'appel téléphonique ', text: 'et tableau de bord Excel de prospection (Suivi recherche de stage.xlsx).' },
        { bold: 'Modèles de CV techniques ', text: 'et espace partagé Google Drive de la promotion (TIP-FORE-2026_2027).' },
        { bold: 'Postes informatiques de la salle ', text: 'et téléphones portables des apprenants.' }
      ],
      remarquesHumaine: [
        { bold: 'Exercice des jeux de rôle très formateur : ', text: 'plusieurs apprenants ont pris conscience qu\'un technicien passe plus de temps à communiquer et rassurer qu\'à démonter des tours.' },
        { bold: 'Le passage aux appels réels a été un vrai révélateur : ', text: 'certains étaient bloqués au départ, mais la dynamique de salle les a poussés à décrocher. Premiers contacts encourageants pris avec des entreprises locales.' },
        { bold: 'L\'effectif complet (12/12) ', text: 'est désormais raccordé au Drive et dispose de ses outils de travail.' }
      ],
      remarquesAdmin: [
        { bold: 'Régularisation effective : ', text: 'Kehyann DESPOIS (absent le 09/09) a été accueilli et pleinement raccordé au Drive. 100 % de la promotion (12/12) dispose désormais d\'un environnement numérique conforme.' },
        { bold: 'Mobilisation active sur le phoning : ', text: 'plusieurs prises de contact directes réussies auprès de responsables informatiques locaux (Micro Caraïbes PC, PC Leader, Konectic et des mairies de l\'archipel).' },
        { bold: 'Climat de travail studieux, ', text: 'dynamique de groupe collaborative et rigoureuse.' }
      ]
    },
    {
      folderName: '15-09-26',
      dateStr: '2026-09-15',
      dateDisplay: '15/09/2026',
      seanceNum: '3',
      module: 'Évaluation diagnostique bureautique & TRE',
      nomFormateur: 'JACQUA David',
      filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
      objectifs: s3.objectifs,
      contenu: s3.contenu,
      supports: s3.supports,
      remarquesHumaine: s3.remarques,
      remarquesAdmin: [
        { bold: 'Couverture diagnostique à 100% : ', text: 'l\'intégralité des 12 apprenants a complété la batterie des 3 tests, établissant la cartographie précise des besoins d\'individualisation pédagogique.' },
        { bold: 'Conformité de passation : ', text: 'protocole d\'examen rigoureux sur poste informatique sans consultation documentaire externe.' },
        { bold: 'Dynamique stage satisfaisante : ', text: 'un tiers de l\'effectif a d\'ores et déjà validé son accueil en entreprise.' }
      ]
    },
    {
      folderName: '22-09-26',
      dateStr: '2026-09-22',
      dateDisplay: '22/09/2026',
      seanceNum: '4',
      module: s4.module,
      nomFormateur: s4.nomFormateur,
      filiere: s4.filiere,
      objectifs: s4.objectifs,
      contenu: s4.contenu,
      supports: s4.supports,
      remarquesHumaine: s4.remarques,
      remarquesAdmin: [
        { bold: 'Validation officielle Palier 1 : ', text: '100% des apprenants ont validé l\'évaluation de messagerie collaborative (Indicateur Qualiopi 11).' },
        { bold: 'Traçabilité documentaire : ', text: 'production et validation du livrable technique TCK-102 conforme aux exigences du REAC TIP.' },
        { bold: 'Avancement conventions de stage : ', text: 'poursuite de la formalisation des accords d\'accueil en entreprise.' }
      ]
    },
    {
      folderName: '29-09-26',
      dateStr: '2026-09-29',
      dateDisplay: '29/09/2026',
      seanceNum: '5',
      module: s5.module,
      nomFormateur: s5.nomFormateur,
      filiere: s5.filiere,
      objectifs: s5.objectifs,
      contenu: s5.contenu,
      supports: s5.supports,
      remarquesHumaine: s5.remarques,
      remarquesAdmin: [
        { bold: 'Couverture des compétences REAC : ', text: 'acquisition des techniques de gestion d\'inventaire et fiabilisation de base de données matérielle.' },
        { bold: 'Pointage administratif stages : ', text: 'actualisation de la grille de suivi et sécurisation des périodes d\'immersion professionnelle.' },
        { bold: 'Conformité Qualiopi : ', text: 'validation des objectifs pédagogiques de la séquence 1 du Palier 1.' }
      ]
    }
  ];

  for (const item of sessionsToGenerate) {
    const targetDir = path.join(baseOutDir, item.folderName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`📁 Dossier créé : ${targetDir}`);
    }

    const baseData: FicheJournaliereData = {
      nomFormateur: item.nomFormateur,
      module: item.module,
      filiere: item.filiere,
      date: item.dateDisplay,
      seance: item.seanceNum,
      objectifs: item.objectifs,
      contenu: item.contenu,
      supports: item.supports,
      remarques: item.remarquesHumaine,
    };

    const variants = [
      { suffix: '', remarques: item.remarquesHumaine },
      { suffix: '_VERSION_HUMAINE', remarques: item.remarquesHumaine },
      { suffix: '_VERSION_ADMIN', remarques: item.remarquesAdmin },
    ];

    console.log(`\n📅 Traitement de la séance du ${item.dateDisplay} (${item.folderName})...`);

    for (const v of variants) {
      const data: FicheJournaliereData = { ...baseData, remarques: v.remarques };
      const compiledHtml = generateFicheJournalierePdfHtml(data);

      const htmlFileName = `FICHE_JOURNALIERE_ACTIVITE_FORMATEUR_${item.dateStr}_David_JACQUA${v.suffix}.html`;
      const pdfFileName = `FICHE_JOURNALIERE_ACTIVITE_FORMATEUR_${item.dateStr}_David_JACQUA${v.suffix}.pdf`;

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
  }

  console.log('\n🎉 Génération et harmonisation 100% terminées avec succès pour les 4 fiches de septembre !');
}

run().catch(console.error);
