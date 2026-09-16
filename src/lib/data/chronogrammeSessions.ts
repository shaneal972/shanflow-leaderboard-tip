export interface SessionItem {
  bold: string;
  text?: string;
}

export interface ChronogrammeSession {
  id: number;
  seanceNum: number;
  seance?: number;
  date: string; // Format 'DD/MM/YYYY'
  isoDate: string; // Format 'YYYY-MM-DD'
  horaire: string;
  duree: string;
  titre: string;
  module: string;
  filiere: string;
  nomFormateur: string;
  objectifs: SessionItem[];
  contenu: SessionItem[];
  supports: SessionItem[];
  remarques: SessionItem[];
}

export const CHRONOGRAMME_SESSIONS: ChronogrammeSession[] = [
  {
    id: 1,
    seanceNum: 1,
    date: '09/09/2026',
    isoDate: '2026-09-09',
    horaire: '08h30 - 15h30',
    duree: '6h',
    titre: 'Accueil, Onboarding & Identité Numérique Drive',
    module: 'FP (Intégration & Environnement numérique)',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Faire connaissance et poser le cadre ', text: 'd\'écoute et de bienveillance au sein de la promotion TIP2.' },
      { bold: 'Démystifier le rôle de technicien support : ', text: 'valoriser l\'empathie, l\'écoute active et la patience face aux pannes usagers.' },
      { bold: 'Apprivoiser les outils collaboratifs ', text: 'et sécuriser les accès de travail (Proton Mail, Google Drive partagé).' },
      { bold: 'Déployer les casiers individuels ', text: 'sur le Drive pour assurer la gestion documentaire de la formation.' }
    ],
    contenu: [
      { bold: 'Tour de table & présentations : ', text: 'Partage des parcours de vie, motivations et attentes de chacun face au Titre Pro.' },
      { bold: 'La posture humaine du technicien : ', text: 'Échanges sur le rôle d\'accompagnant en entreprise (gestion du stress usager, calme face aux imprévus).' },
      { bold: 'Atelier identité numérique & sécurité : ', text: 'Création guidée des adresses professionnelles sécurisées. Résolution collective des blocages 2FA et SMS.' },
      { bold: 'Appropriation du Drive de promotion : ', text: 'Découverte de l\'espace partagé (TIP-FORE-2026_2027), création des casiers au format NOM_Prenom_TIP et premier dépôt du document de bienvenue.' },
      { bold: 'Amorce de la recherche de stage : ', text: 'Échanges sur les projets professionnels et premiers dépôts de CV pour préparer l\'atelier TRE.' }
    ],
    supports: [
      { bold: 'Guide d\'accueil ', text: 'et tutoriel d\'onboarding numérique pas-à-pas.' },
      { bold: 'Espace Google Drive collaboratif ', text: 'de la promotion (TIP-FORE-2026_2027).' },
      { bold: 'Ordinateurs de la salle ', text: 'et smartphones des apprenants (tests croisés).' },
      { bold: 'Vidéoprojecteur ', text: 'pour la projection collective.' }
    ],
    remarques: [
      { bold: 'Promotion attentive et solidaire : ', text: 'très bonne dynamique d\'entraide face aux blocages techniques rencontrés.' },
      { bold: '10 stagiaires sur les 11 présents ', text: 'ont finalisé leur casier Drive et leur prise de poste. Accompagnement prévu pour Jessy et pour Kehyann à son retour.' },
      { bold: 'Test de positionnement ', text: 'décalé à la séance d\'évaluation pour privilégier une rentrée sereine sans stress.' }
    ]
  },
  {
    id: 2,
    seanceNum: 2,
    date: '10/09/2026',
    isoDate: '2026-09-10',
    horaire: '08h30 - 15h30',
    duree: '6h',
    titre: 'Posture Professionnelle, Phoning Entreprises & CV Technique',
    module: 'Savoir-être professionnel & TRE',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Corriger les défauts de posture ', text: 'et de communication orale face aux usagers en détresse ou agressifs.' },
      { bold: 'Faire assimiler les obligations de discrétion ', text: 'et de confidentialité (RGPD, données salariales ou médicales) inhérentes aux droits administrateurs.' },
      { bold: 'Débloquer la peur du téléphone ', text: 'pour démarcher activement les entreprises de Guadeloupe et qualifier les besoins support.' },
      { bold: 'Restructurer le CV technique ', text: 'pour valoriser précisément les compétences attendues d\'un technicien d\'assistance.' }
    ],
    contenu: [
      { bold: 'Régularisations & Drive : ', text: 'Accueil de Kehyann (absent la veille), création de ses accès et de son casier. Contrôle des dossiers Drive de Jessy, Wilfried et Thomas B. avec recadrage sur le nommage des fichiers.' },
      { bold: 'Mises en situation & posture : ', text: 'Jeux de rôle de 2 minutes par binôme sur 3 cas réels : utilisatrice en panique (urgence paie), cadre agressif lors d\'une panne, et collègue ayant bricolé son PC. Analyse critique en groupe des réactions et débriefing des réflexes à adopter (ne pas toucher au clavier les 30 premières secondes, écouter sans couper, rester calme).' },
      { bold: 'Déontologie DSI & secret professionnel : ', text: 'Sensibilisation aux responsabilités liées aux droits d\'administration. Règle stricte d\'amnésie professionnelle à la pause-café concernant les données sensibles ou personnelles aperçues à l\'écran (RGPD).' },
      { bold: 'Prospection téléphonique en direct : ', text: 'Travail sur le script d\'appel pour passer le barrage standard en se positionnant comme un renfort technique support. Premiers appels passés en salle par les apprenants et création du fichier Excel de suivi (Suivi recherche de stage.xlsx).' },
      { bold: 'Atelier CV technique (après-midi) : ', text: 'Audit critique des CV des stagiaires. Réécriture pour éliminer les mentions généralistes et valoriser les compétences support (diagnostic, Windows, maintenance, réseau). Dépôt des versions corrigées sur le Drive.' }
    ],
    supports: [
      { bold: 'Kit d\'appel phoning & scripts ', text: 'de prospection téléphonique pour techniciens support.' },
      { bold: 'Tableau de bord Excel de prospection ', text: '(Suivi recherche de stage.xlsx).' },
      { bold: 'Modèles de CV techniques ', text: 'et espace partagé Google Drive de la promotion (TIP-FORE-2026_2027).' },
      { bold: 'Postes informatiques de la salle ', text: 'et téléphones portables des apprenants.' }
    ],
    remarques: [
      { bold: 'Exercice des jeux de rôle très formateur : ', text: 'plusieurs apprenants ont pris conscience qu\'un technicien passe plus de temps à communiquer et rassurer qu\'à démonter des tours.' },
      { bold: 'Le passage aux appels réels a été un vrai révélateur : ', text: 'certains étaient bloqués au départ, mais la dynamique de salle les a poussés à décrocher. Premiers contacts encourageants pris avec des entreprises locales.' },
      { bold: 'L\'effectif complet (12/12) ', text: 'est désormais raccordé au Drive et dispose de ses outils de travail.' }
    ]
  },
  {
    id: 3,
    seanceNum: 3,
    date: '15/09/2026',
    isoDate: '2026-09-15',
    horaire: '08h30 - 15h30',
    duree: '6h',
    titre: 'Évaluation Diagnostique (3 Tests), Suivi de Stage & Mails Pro',
    module: 'Évaluation diagnostique bureautique & TRE',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Mesurer le niveau réel d\'entrée ', text: 'sur les fondamentaux du support (Test 0 RAN : raccourcis, arborescences, hygiène système).' },
      { bold: 'Évaluer les compétences en traitement de texte ', text: 'professionnel (Test 1 Word/Docs : hiérarchie des styles, sauts de section, charte graphique DSI).' },
      { bold: 'Évaluer la maîtrise du tableur ', text: 'et de la logique de calcul (Test 2 Sheet/Excel : adressage $, formules de base, calculs commerciaux).' },
      { bold: 'Actualiser le suivi de recherche de stage ', text: 'et recadrer individuellement les démarches de prospection.' }
    ],
    contenu: [
      { bold: 'Point d\'étape stages & mise à jour du tableur : ', text: 'Tour de table des démarches. Enregistrement des signatures (Jessy chez Micronet, Wilfried chez Micro Caraïbes), de l\'accord verbal de Steeven (Mairie de Deshaies), des candidatures de Chloé et recadrage des relances pour Jordan (Balguerie) et Tristan (Konectic). Actualisation de la feuille 15092026 du fichier de suivi.' },
      { bold: 'Passation des 3 épreuves sur poste : ', text: 'Enchaînement chronométré par les apprenants du Test 0 (Diagnostic RAN - 20 Q), du Test 1 (Word/Docs - 20 Q) et du Test 2 (Sheet/Excel - 20 Q). Observation des comportements face au chrono et au stress d\'évaluation.' },
      { bold: 'Débriefing des erreurs & rigueur des consignes : ', text: 'Analyse collective des résultats en direct. Constat récurrent : la moitié des mauvaises réponses vient d\'une lecture trop rapide de l\'énoncé. Suite à l\'intervention de Chloé, valorisation du respect strict du cahier des charges et de la rigueur.' },
      { bold: 'Atelier prospection & communication (après-midi) : ', text: 'Rédaction d\'e-mails professionnels de relance d\'entreprises et simulations orales rapides d\'entretiens techniques pour décrocher son stage.' }
    ],
    supports: [
      { bold: 'Plateforme d\'évaluation numérique ', text: '(tests QCM chronométrés sur poste informatique).' },
      { bold: 'Les 3 quiz d\'évaluation : ', text: 'Diagnostic RAN (20 Q), Word/Docs (20 Q) et Sheet/Excel (20 Q).' },
      { bold: 'Tableau partagé de prospection ', text: '(Suivi recherche de stage.xlsx, feuille 15092026).' },
      { bold: 'Postes informatiques de la salle ', text: 'et vidéoprojecteur pour la restitution collective.' }
    ],
    remarques: [
      { bold: 'Séance très dense avec l\'enchaînement des 3 tests : ', text: 'les apprenants ont ressenti la pression du chrono, ce qui a permis d\'observer leur sang-froid en condition réelle d\'évaluation.' },
      { bold: 'Résultats très contrastés : ', text: 'bon niveau d\'ensemble sur les raccourcis et le traitement de texte, mais réelles difficultés révélées sur le tableur (formules, logique de calculs), qui sera notre priorité des prochaines séances.' },
      { bold: 'Bonne avancée sur les stages : ', text: '4 situations sont scellées ou très bien engagées. Accompagnement serré maintenu pour les apprenants sans contact positif.' }
    ]
  },
  {
    id: 4,
    seanceNum: 4,
    date: '22/09/2026',
    isoDate: '2026-09-22',
    horaire: '13h30 - 15h30',
    duree: '2h',
    titre: 'Palier 1 : La Charte Graphique DSI (Styles Word/Docs)',
    module: 'Palier 1 - Standardisation documentaire DSI',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Appliquer une charte graphique d\'entreprise ', text: 'sur un document technique officiel (polices, marges, couleurs corporate).' },
      { bold: 'Maîtriser la hiérarchie des styles ', text: '(Titre 1, Titre 2, Corps de texte) et la génération automatique de sommaire dynamique.' },
      { bold: 'Éliminer les pollutions de mise en page ', text: '(multiples retours à la ligne, espaces manuels, tabulations approximatives).' },
      { bold: 'Gérer les sauts de page et sauts de section ', text: 'pour la numérotation différenciée (romain/arabe).' }
    ],
    contenu: [
      { bold: 'Démonstration interactive des anti-patterns : ', text: 'Analyse d\'un document poubelle typique (texte décalé, polices multiples) et impact sur la crédibilité d\'une DSI.' },
      { bold: 'TP Guidé KLF Doc Standard : ', text: 'Configuration pas-à-pas du modèle officiel de rapport d\'intervention KLF Logistique sur Word/Docs.' },
      { bold: 'Exercice pratique individuel : ', text: 'Refonte d\'une notice de dépannage brute de 4 pages : application des styles normalisés, insertion d\'un sommaire cliquable et export PDF conforme.' },
      { bold: 'Point flash conventions : ', text: 'Recueil des dernières conventions signées et relance des contacts en cours.' }
    ],
    supports: [
      { bold: 'Document brut à corriger ', text: '(Notice_Depannage_Reseau_v1_Brute.docx).' },
      { bold: 'Guide de style officiel ', text: 'DSI Karukera Logistique & Fret (KLF).' },
      { bold: 'Postes informatiques de la salle ', text: 'avec Microsoft Word / Google Docs.' }
    ],
    remarques: [
      { bold: 'Bonne appropriation des styles : ', text: 'la majorité des apprenants a rapidement compris l\'intérêt du sommaire automatique par rapport à une saisie manuelle.' },
      { bold: 'Point de vigilance : ', text: 'la manipulation des sauts de section pour isoler la page de garde nécessite encore un entraînement guidé pour 3 apprenants.' }
    ]
  },
  {
    id: 5,
    seanceNum: 5,
    date: '29/09/2026',
    isoDate: '2026-09-29',
    horaire: '08h30 - 12h30',
    duree: '4h',
    titre: 'Palier 1 : Tableur DSI - Inventaire Brut du Parc KLF',
    module: 'Palier 1 - Tableur & Gestion de parc informatique',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Nettoyer et restructurer une base de données brute ', text: 'de parc informatique sous tableur (Excel / Google Sheets).' },
      { bold: 'Maîtriser les fonctions de texte et de tri ', text: '(SUPPRESPACE, MAJUSCULE, fractionnement de colonnes, dédoublonnage).' },
      { bold: 'Appliquer des règles de validation des données ', text: 'pour empêcher les erreurs de saisie d\'inventaire (listes déroulantes DSI).' },
      { bold: 'Sécuriser l\'intégrité des données ', text: 'via le figeage des volets et le verrouillage de cellules.' }
    ],
    contenu: [
      { bold: 'Mise en situation KLF : ', text: 'Réception du fichier d\'inventaire d\'urgence de la zone de Jarry comportant des anomalies (doublons de numéros de série, espaces masqués, noms d\'utilisateurs tronqués).' },
      { bold: 'Atelier nettoyage méthodique : ', text: 'Utilisation des fonctions de nettoyage de chaînes de caractères et suppression des lignes dupliquées.' },
      { bold: 'Normalisation du parc : ', text: 'Mise en place de listes déroulantes de validation (Types de matériel : PC Fixe, Portable, Écran, Imprimante ; Statuts : En service, En panne, Réformé).' },
      { bold: 'Mise en page d\'inventaire : ', text: 'Figeage des lignes d\'en-tête, quadrillage normé et calculs de totaux d\'équipements.' }
    ],
    supports: [
      { bold: 'Fichier brut d\'inventaire : ', text: 'KLF_Inventaire_Parc_Jarry_Brut.xlsx.' },
      { bold: 'Tutoriel pas-à-pas : ', text: 'Nettoyage et validation de données sous tableur.' },
      { bold: 'Postes informatiques de la salle ', text: 'avec tableur.' }
    ],
    remarques: [
      { bold: 'Exercice concret très apprécié : ', text: 'les stagiaires ont mesuré la différence entre un tableau brouillon et une base d\'inventaire exploitable par un technicien.' },
      { bold: 'Progression notable ', text: 'sur la logique des listes déroulantes et l\'hygiène des formules.' }
    ]
  },
  {
    id: 6,
    seanceNum: 6,
    date: '20/10/2026',
    isoDate: '2026-10-20',
    horaire: '13h30 - 15h30',
    duree: '2h',
    titre: 'Tableaux de Bord DSI : Formules Statistiques & Obsolescence',
    module: 'Palier 1 - Analyse de parc & Formules statistiques',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Maîtriser les formules conditionnelles ', text: 'statistiques clés du support technique (NB.SI, SOMME.SI, MOYENNE.SI).' },
      { bold: 'Calculer le taux d\'obsolescence ', text: 'd\'un parc informatique selon l\'ancienneté des machines.' },
      { bold: 'Automatiser des alertes visuelles ', text: 'via la mise en forme conditionnelle (matériels hors garantie).' }
    ],
    contenu: [
      { bold: 'Calculs d\'indicateurs DSI : ', text: 'Dénombrement automatique du nombre de PC par système d\'exploitation (Windows 10, Windows 11).' },
      { bold: 'Formules d\'ancienneté : ', text: 'Calcul dynamique de l\'âge des machines en années par rapport à la date du jour (DATEDIF / ANNEE).' },
      { bold: 'Tableau de synthèse direction : ', text: 'Restitution claire des pourcentages de machines à renouveler.' }
    ],
    supports: [
      { bold: 'Classeur d\'inventaire KLF ', text: 'consolidé lors de la séance précédente.' },
      { bold: 'Fiche mémo : ', text: 'Les formules statistiques du technicien informatique.' }
    ],
    remarques: [
      { bold: 'Notions de formules bien assimilées : ', text: 'le recours aux critères logiques entre guillemets a nécessité quelques ajustements au départ mais est désormais compris.' }
    ]
  },
  {
    id: 7,
    seanceNum: 7,
    date: '27/10/2026',
    isoDate: '2026-10-27',
    horaire: '13h30 - 15h30',
    duree: '2h',
    titre: 'Visualisation de Données DSI & Alertes Garanties',
    module: 'Palier 1 - Graphiques DSI & Reporting',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Concevoir des graphiques professionnels ', text: 'adaptés à une présentation en comité de direction (secteurs, barres groupées).' },
      { bold: 'Paramétrer des règles de mise en forme conditionnelle ', text: 'complexes avec gestion des priorités visuelles.' },
      { bold: 'Exporter un rapport d\'état de parc ', text: 'propre au format PDF pour les décideurs.' }
    ],
    contenu: [
      { bold: 'Création graphique : ', text: 'Réalisation du camembert de répartition des pannes et de l\'histogramme des types de matériels.' },
      { bold: 'Mise en valeur visuelle : ', text: 'Coloration automatique en rouge des postes hors garantie depuis plus de 6 mois et en vert des postes sous contrat.' },
      { bold: 'Recette croisée : ', text: 'Vérification en binôme de la lisibilité des graphiques.' }
    ],
    supports: [
      { bold: 'Classeur KLF de parc informatique.', text: '' },
      { bold: 'Guide de bonnes pratiques ', text: 'de visualisation de données professionnelles.' }
    ],
    remarques: [
      { bold: 'Belle créativité technique : ', text: 'les rendus graphiques sont soignés et respectent la charte sobre attendue en entreprise.' }
    ]
  },
  {
    id: 8,
    seanceNum: 8,
    date: '05/11/2026',
    isoDate: '2026-11-05',
    horaire: '08h30 - 15h30',
    duree: '6h',
    titre: 'Palier 2 : Incident n°1 Corinne, RECHERCHEV & Fiscalité Locale',
    module: 'Palier 2 - Support applicatif & Calculs fiscaux Antilles',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Diagnostiquer et résoudre un incident de classeur corrompu ', text: '(erreurs #N/A, références circulaires, liaisons rompues).' },
      { bold: 'Maîtriser la recherche verticale et matricielle ', text: '(RECHERCHEV / XLOOKUP) pour croiser des tables de manifestes de fret.' },
      { bold: 'Intégrer les calculs fiscaux spécifiques aux Antilles ', text: '(TVA locale 8.5% et 2.1%, Octroi de mer et frais de douane).' },
      { bold: 'Rédiger le message de clôture d\'incident ', text: 'clair et rassurant pour l\'utilisatrice.' }
    ],
    contenu: [
      { bold: 'Matinée (Ticket d\'incident n°1) : ', text: 'Prise en charge de la demande de Corinne (Service Facturation KLF). Dépannage du classeur de conteneurs, correction des formules de recherche défaillantes.' },
      { bold: 'Après-midi (Atelier fiscalité locale) : ', text: 'Modélisation des taux de TVA applicables en Guadeloupe et calculs d\'Octroi de mer sur les bordereaux d\'expédition maritime.' },
      { bold: 'Recette finale : ', text: 'Test de robustesse du classeur avec saisie de nouvelles lignes de conteneurs.' }
    ],
    supports: [
      { bold: 'Ticket KLF TCK-101 ', text: '(Incident Facturation Corinne).' },
      { bold: 'Classeur de simulation fret maritime ', text: 'avec barème douanier local.' }
    ],
    remarques: [
      { bold: 'Mise en situation très immersive : ', text: 'les apprenants ont tout de suite compris l\'impact direct d\'une formule erronée sur la trésorerie et la facturation d\'une entreprise locale.' }
    ]
  },
  {
    id: 9,
    seanceNum: 9,
    date: '10/11/2026',
    isoDate: '2026-11-10',
    horaire: '08h30 - 12h30',
    duree: '4h',
    titre: 'Rédaction d\'un Tutoriel Pas-à-Pas Illustré (Épreuve REAC)',
    module: 'Palier 2 - Documentation technique & Pédagogie usagers',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Concevoir un tutoriel logiciel didactique ', text: 'sans jargon à destination des agents d\'exploitation non informaticiens.' },
      { bold: 'Capturer et annoter proprement des écrans ', text: '(raccourci Windows+Shift+S, encadrements rouges, flèches, numérotation d\'étapes).' },
      { bold: 'Structurer un guide utilisateur ', text: 'selon la norme REAC (Objectif, Prérequis, Étapes 1-2-3, Cas d\'erreur).' }
    ],
    contenu: [
      { bold: 'Analyse du besoin terrain : ', text: 'Les caristes du quai de Jarry doivent saisir l\'état des palettes sur une tablette tactile mais bloquent sur la synchronisation.' },
      { bold: 'Atelier de rédaction pas-à-pas : ', text: 'Rédaction d\'une fiche pratique 1-page plastifiable avec captures annotées et consignes courtes.' },
      { bold: 'Test utilisateur croisé : ', text: 'Un camarade teste la procédure sans explication orale pour vérifier qu\'aucune étape n\'est sous-entendue.' }
    ],
    supports: [
      { bold: 'Outil de capture d\'écran Windows, ', text: 'modèle de fiche réflexe KLF.' },
      { bold: 'Application de simulation de quai.', text: '' }
    ],
    remarques: [
      { bold: 'Exercice fondamental pour le Titre Pro : ', text: 'apprendre à se mettre à la place d\'un utilisateur débutant est un critère central de l\'évaluation finale devant le jury.' }
    ]
  },
  {
    id: 10,
    seanceNum: 10,
    date: '01/12/2026',
    isoDate: '2026-12-01',
    horaire: '08h30 - 12h30',
    duree: '4h',
    titre: 'Automatisation Documentaire : Publipostage RH Sécurisé',
    module: 'Palier 2 - Publipostage & Gestion documentaire',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Réaliser une campagne de publipostage complexe ', text: '(courriers et e-mails personnalisés) sans décalage de champs.' },
      { bold: 'Préparer et fiabiliser la source de données ', text: 'Excel (formatage des civilités, adresses postales, codes postaux sur 5 chiffres).' },
      { bold: 'Gérer les règles conditionnelles de fusion ', text: '(champ SI... ALORS... SINON pour adapter le texte au profil de l\'usager).' }
    ],
    contenu: [
      { bold: 'Scénario RH KLF : ', text: 'Élodie (Ressources Humaines) doit convoquer 85 collaborateurs aux visites médicales et formations sécurité obligatoires.' },
      { bold: 'Préparation du fichier source : ', text: 'Nettoyage des codes postaux (format 971XX), correction des espaces insécables et vérification des adresses mails.' },
      { bold: 'Exécution de la fusion : ', text: 'Liaison entre la trame Word et la base de données, aperçu individuel des fusions et génération du document final scindé.' }
    ],
    supports: [
      { bold: 'Fichier source RH KLF (85 lignes).', text: '' },
      { bold: 'Trame de convocation officielle KLF.', text: '' }
    ],
    remarques: [
      { bold: 'Compétence très demandée en entreprise : ', text: 'les apprenants ont compris le piège classique des codes postaux transformés en nombres à 4 chiffres (perte du zéro initial).' }
    ]
  },
  {
    id: 11,
    seanceNum: 11,
    date: '15/12/2026',
    isoDate: '2026-12-15',
    horaire: '13h30 - 15h30',
    duree: '2h',
    titre: 'Gestion de Crise Documentaire : Récupération & Encodage CSV',
    module: 'Palier 2 - Réparation documentaire & Résilience DSI',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Récupérer un document corrompu ', text: 'ou mal fermé suite à un arrêt inopiné du système.' },
      { bold: 'Résoudre les problèmes d\'encodage de caractères ', text: '(accents brisés, UTF-8 vs ANSI / Windows-1252 sur fichiers CSV).' },
      { bold: 'Gérer les séparateurs de données ', text: '(point-virgule vs virgule) lors de l\'import/export inter-logiciels.' }
    ],
    contenu: [
      { bold: 'Cas pratique de crash : ', text: 'Fichier d\'extraction de caisse ou de stock inexploitable avec caractères hiéroglyphiques.' },
      { bold: 'Méthode de conversion : ', text: 'Ouverture via éditeur de texte brut (Notepad++), conversion d\'encodage et réimportation dans le tableur.' },
      { bold: 'Procédures de sauvegarde réflexe : ', text: 'Configuration de la récupération automatique et des versions d\'historique sur le Cloud.' }
    ],
    supports: [
      { bold: 'Échantillons de fichiers CSV corrompus ', text: 'avec erreurs d\'accents et de séparateurs.' },
      { bold: 'Éditeurs de texte avancés et tableur.' }
    ],
    remarques: [
      { bold: 'Réflexe technique précieux : ', text: 'savoir qu\'un fichier cassé peut souvent être réparé en 1 minute sans tout ressaisir est une révélation pour les stagiaires.' }
    ]
  },
  {
    id: 12,
    seanceNum: 12,
    date: '12/01/2027',
    isoDate: '2027-01-12',
    horaire: '08h30 - 12h30',
    duree: '4h',
    titre: 'Palier 3 : Introduction à l\'IA pour le Support Bureautique',
    module: 'Palier 3 - IA & Productivité Technicien Support',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Comprendre le fonctionnement et les limites d\'une IA générative ', text: 'dans le cadre du support informatique.' },
      { bold: 'Appliquer les règles d\'or de sécurité et de confidentialité ', text: '(zéro donnée sensible ou nominative envoyée dans le prompt / respect RGPD).' },
      { bold: 'Maîtriser le Prompt Engineering pour techniciens : ', text: 'formuler des requêtes structurées (Rôle, Contexte, Contraintes, Format attendu).' }
    ],
    contenu: [
      { bold: 'Cadre éthique et légal : ', text: 'Sensibilisation aux risques de fuite de données d\'entreprise lors de l\'utilisation d\'outils IA publics.' },
      { bold: 'Atelier d\'anonymisation : ', text: 'Comment masquer les noms d\'utilisateurs, adresses IP et données confidentielles avant de solliciter une IA.' },
      { bold: 'Exercices pratiques de prompt : ', text: 'Demander à une IA d\'expliquer un code d\'erreur Windows ou d\'aider à la rédaction d\'une réponse utilisateur.' }
    ],
    supports: [
      { bold: 'Charte d\'utilisation de l\'IA en entreprise.', text: '' },
      { bold: 'Guide des structures de prompts ', text: 'pour techniciens informatique.' }
    ],
    remarques: [
      { bold: 'Intérêt immédiat et vif du groupe : ', text: 'découverte des bonnes pratiques qui évitent les erreurs professionnelles graves.' }
    ]
  },
  {
    id: 13,
    seanceNum: 13,
    date: '19/01/2027',
    isoDate: '2027-01-19',
    horaire: '08h30 - 15h30',
    duree: '6h',
    titre: 'Génération de Formules Complexes & Vulgarisation par l\'IA',
    module: 'Palier 3 - Résolution assistée & Vulgarisation technique',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Utiliser l\'IA pour construire et déboguer des formules de tableur ', text: 'imbriquées (INDEX/EQUIV, SI.CONDITIONS, RECHERCHEX avec critères multiples).' },
      { bold: 'Transformer un rapport technique aride ', text: 'en consigne claire, bienveillante et rassurante pour l\'utilisateur final.' },
      { bold: 'Vérifier systématiquement l\'exactitude mathématique ', text: 'des calculs proposés par l\'IA (lutte contre les hallucinations).' }
    ],
    contenu: [
      { bold: 'Matinée (Formules assistées) : ', text: 'Soumission de problématiques complexes de calculs de fret et génération de formules adaptées. Test immédiat sur jeu d\'essai réel.' },
      { bold: 'Après-midi (L\'art de la vulgarisation) : ', text: 'Traduction d\'un rapport de crash d\'écran bleu (BSOD) ou d\'erreur réseau en message usager compréhensible par un non-initié.' }
    ],
    supports: [
      { bold: 'Logs d\'erreurs système bruts.', text: '' },
      { bold: 'Classeurs de test avec cas d\'erreurs mathématiques.' }
    ],
    remarques: [
      { bold: 'Prise de recul appréciable : ', text: 'les apprenants apprennent à ne pas faire confiance aveuglément à l\'IA et à toujours valider empiriquement le résultat.' }
    ]
  },
  {
    id: 14,
    seanceNum: 14,
    date: '26/01/2027',
    isoDate: '2027-01-26',
    horaire: '13h30 - 15h30',
    duree: '2h',
    titre: 'Création Assistée d\'une Base de Connaissances (FAQ Helpdesk)',
    module: 'Palier 3 - Capitalisation & Base de connaissances',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Structurer une base de connaissances (Knowledge Base) ', text: 'pour mutualiser les solutions du service support.' },
      { bold: 'Rédiger des articles de FAQ d\'assistance ', text: 'au format standardisé (Symptôme, Cause, Résolution pas-à-pas).' },
      { bold: 'Indexation par mots-clés ', text: 'pour faciliter la recherche rapide par les techniciens d\'astreinte.' }
    ],
    contenu: [
      { bold: 'Recensement des 10 pannes les plus fréquentes ', text: 'rencontrées sur le parc KLF (imprimante bloquée, profil corrompu, Wi-Fi déconnecté).' },
      { bold: 'Génération assistée et harmonisation ', text: 'des fiches solutions dans un style homogène.' },
      { bold: 'Mise en ligne sur l\'espace collaboratif de formation.', text: '' }
    ],
    supports: [
      { bold: 'Modèle de fiche KB KLF.', text: '' },
      { bold: 'Historique des tickets incidents résolus.' }
    ],
    remarques: [
      { bold: 'Très bon esprit d\'équipe : ', text: 'chaque binôme a produit 2 fiches, aboutissant à une base collective de 12 fiches opérationnelles.' }
    ]
  },
  {
    id: 15,
    seanceNum: 15,
    date: '02/02/2027',
    isoDate: '2027-02-02',
    horaire: '13h30 - 15h30',
    duree: '2h',
    titre: 'Audit & Fiabilisation des Réponses de l\'IA (Anti-Hallucination)',
    module: 'Palier 3 - Audit critique & Fiabilité des solutions IA',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Développer un esprit critique acéré ', text: 'face aux suggestions des outils d\'intelligence artificielle.' },
      { bold: 'Identifier les pièges classiques : ', text: 'fonctions inexistantes inventées par l\'IA, commandes PowerShell destructrices, fausses syntaxes.' },
      { bold: 'Établir un protocole de test en environnement bac à sable ', text: 'avant tout déploiement en production.' }
    ],
    contenu: [
      { bold: 'Exercice du détecteur de mensonge : ', text: 'Analyse de 5 réponses fournies par des IA contenant des erreurs volontaires glissées par le formateur.' },
      { bold: 'Validation manuelle des calculs ', text: 'et tests dans une machine virtuelle isolée.' },
      { bold: 'Formalisation des règles de sécurité DSI.', text: '' }
    ],
    supports: [
      { bold: 'Corpus de 5 réponses IA piégées.', text: '' },
      { bold: 'Checklist d\'audit et de validation sécurisée.' }
    ],
    remarques: [
      { bold: 'Choc salutaire pour le groupe : ', text: 'constat qu\'une réponse rédigée avec une parfaite assurance peut être techniquement fausse ou dangereuse.' }
    ]
  },
  {
    id: 16,
    seanceNum: 16,
    date: '11/02/2027',
    isoDate: '2027-02-11',
    horaire: '08h00 - 16h00',
    duree: '7h',
    titre: 'Journée Intensive : Hackathon Support Usagers & Bilan Mi-Parcours',
    module: 'Palier 3 - Hackathon Support & Évaluation mi-parcours',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Gérer en autonomie et en temps réel un flux d\'incidents bureautiques ', text: 'multi-services sous pression chronométrée.' },
      { bold: 'Prioriser les tickets selon la gravité et l\'impact métier ', text: '(P1 Bloquant vs P3 Confort).' },
      { bold: 'Mobiliser l\'ensemble des compétences acquises ', text: '(Word, Excel, Messagerie, Posture, IA Copilote).' },
      { bold: 'Réaliser le bilan individuel d\'avancement Qualiopi ', text: 'avant le départ en période d\'immersion entreprise.' }
    ],
    contenu: [
      { bold: 'Matinée (08h00 - 12h00 / Hackathon KLF) : ', text: 'Résolution de 5 incidents successifs déclenchés par le formateur (panne comptable, publipostage RH, tutoriel d\'urgence, déblocage réseau).' },
      { bold: 'Après-midi (13h00 - 16h00 / Bilan individuel) : ', text: 'Entretiens individuels de 15 minutes avec chaque stagiaire : revue de la grille d\'évaluation formative, points forts et axes d\'effort pour le stage.' }
    ],
    supports: [
      { bold: 'Simulateur d\'incidents KLF.', text: '' },
      { bold: 'Grille officielle d\'évaluation formative Qualiopi.' }
    ],
    remarques: [
      { bold: 'Engagement exceptionnel de la promotion : ', text: 'ambiance de ruche professionnelle, très belle solidarité et montée en maturité confirmée pour 100% des apprenants.' }
    ]
  },
  {
    id: 17,
    seanceNum: 17,
    date: '16/02/2027',
    isoDate: '2027-02-16',
    horaire: '13h30 - 15h30',
    duree: '2h',
    titre: 'Cadrage des Missions de Stage Entreprise & Consignes PAE',
    module: 'TRE & Préparation Période d\'Application en Entreprise',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Sécuriser le démarrage de la période d\'immersion en entreprise ', text: '(PAE de mars 2027).' },
      { bold: 'Identifier les activités types du Titre Pro ', text: 'à réaliser obligatoirement chez l\'employeur (support, réseau, installation).' },
      { bold: 'Présenter le carnet de suivi en entreprise ', text: 'et les modalités d\'évaluation par le tuteur.' }
    ],
    contenu: [
      { bold: 'Point administratif final : ', text: 'Vérification des 12 conventions signées, fiches de liaison tuteur et coordonnées des maîtres de stage.' },
      { bold: 'Consignes de posture en entreprise : ', text: 'Ponctualité, règles de sécurité physique et numérique, réactivité et communication avec le tuteur.' },
      { bold: 'Méthodologie de collecte des preuves : ', text: 'Comment collecter des photos, captures d\'écrans anonymisées et comptes-rendus d\'intervention pour enrichir le futur DP.' }
    ],
    supports: [
      { bold: 'Livret de stage officiel FORE Alternance.', text: '' },
      { bold: 'Guide de collecte de preuves professionnelles.' }
    ],
    remarques: [
      { bold: 'Toutes les conventions sont scellées : ', text: 'le groupe est prêt et enthousiaste pour son immersion terrain.' }
    ]
  },
  {
    id: 18,
    seanceNum: 18,
    date: '06/04/2027',
    isoDate: '2027-04-06',
    horaire: '13h30 - 15h30',
    duree: '2h',
    titre: 'Retour de Stage : Débriefing des Réalités Terrain & Retours Tuteurs',
    module: 'Bilan de stage & Transition Palier 4',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Partager et capitaliser sur les retours d\'expérience ', text: 'vécus durant le stage en entreprise.' },
      { bold: 'Analyser les difficultés techniques et relationnelles rencontrées ', text: 'et identifier les solutions apportées.' },
      { bold: 'Faire le point sur les évaluations des tuteurs ', text: 'et valoriser les réussites opérationnelles.' }
    ],
    contenu: [
      { bold: 'Tour de table retour d\'expérience : ', text: 'Chaque apprenant présente en 5 minutes son entreprise d\'accueil, son parc informatique et ses principales missions.' },
      { bold: 'Bilan collectif des interventions : ', text: 'Classement des pannes les plus fréquentes traitées en entreprise (réseaux locaux, réinstallation d\'OS, imprimantes multifonctions).' },
      { bold: 'Transition vers le Palier 4 : ', text: 'Introduction au besoin d\'automatisation des tâches répétitives en DSI.' }
    ],
    supports: [
      { bold: 'Bilans de stage et attestations tuteurs.', text: '' },
      { bold: 'Présentations synthétiques des apprenants.' }
    ],
    remarques: [
      { bold: 'Retours tuteurs très positifs : ', text: 'excellente intégration professionnelle saluée par les entreprises d\'accueil.' }
    ]
  },
  {
    id: 19,
    seanceNum: 19,
    date: '13/04/2027',
    isoDate: '2027-04-13',
    horaire: '08h30 - 15h30',
    duree: '6h',
    titre: 'Palier 4 n8n : Conception du Helpdesk Automatisé & Fiches PDF',
    module: 'Palier 4 - Automatisation de processus DSI (n8n & Webhooks)',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Comprendre l\'architecture d\'un flux d\'automatisation no-code/low-code ', text: 'pour un service support informatique (n8n).' },
      { bold: 'Configurer un déclencheur webhook ', text: 'connecté à un formulaire de signalement d\'incident usager.' },
      { bold: 'Générer automatiquement une fiche d\'intervention PDF ', text: 'dès la soumission d\'un ticket critique.' }
    ],
    contenu: [
      { bold: 'Matinée (Workflow n8n de base) : ', text: 'Découverte de l\'interface n8n, création du nœud Webhook et parsing du payload JSON de l\'incident.' },
      { bold: 'Après-midi (Génération PDF automatique) : ', text: 'Liaison avec le moteur d\'impression Gotenberg, injection des variables du ticket dans un modèle HTML/CSS et test de génération.' }
    ],
    supports: [
      { bold: 'Instance n8n de formation.', text: '' },
      { bold: 'Gabarit de fiche d\'intervention technique KLF.' }
    ],
    remarques: [
      { bold: 'Fascination des stagiaires ', text: 'pour la puissance de l\'automatisation : voir un ticket générer un PDF en 2 secondes sans intervention humaine a été un déclic majeur.' }
    ]
  },
  {
    id: 20,
    seanceNum: 20,
    date: '20/04/2027',
    isoDate: '2027-04-20',
    horaire: '13h30 - 15h30',
    duree: '2h',
    titre: 'Mise à Jour Live du Tableau de Bord DSI & Notifications Mail',
    module: 'Palier 4 - Monitoring DSI & Alertes automatiques',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Synchroniser automatiquement les données d\'incidents ', text: 'vers une base centrale (Google Sheets / PostgreSQL).' },
      { bold: 'Déclencher des alertes automatiques par e-mail ', text: 'vers les techniciens de garde en cas d\'incident P1 bloquant.' },
      { bold: 'Mettre en place la gestion des erreurs ', text: 'et des fallbacks dans un workflow n8n.' }
    ],
    contenu: [
      { bold: 'Branchement de la base de données : ', text: 'Ajout du nœud Google Sheets / Supabase dans le flux n8n existant.' },
      { bold: 'Routage conditionnel : ', text: 'Si urgence = Bloquante, envoi immédiat d\'une notification au technicien d\'astreinte.' },
      { bold: 'Simulation d\'incidents en direct : ', text: 'Test de bout en bout avec soumission de faux tickets par les apprenants.' }
    ],
    supports: [
      { bold: 'Workflows n8n KLF Support.', text: '' },
      { bold: 'Tableau de bord de supervision DSI.' }
    ],
    remarques: [
      { bold: 'Architecture complète maîtrisée : ', text: 'la promotion est capable d\'expliquer le cycle de vie complet d\'un ticket moderne.' }
    ]
  },
  {
    id: 21,
    seanceNum: 21,
    date: '27/04/2027',
    isoDate: '2027-04-27',
    horaire: '08h30 - 15h30',
    duree: '6h',
    titre: 'Atelier Dossier Pro (DP) : Rédaction des 5 Rubriques & Revue Croisée',
    module: 'Préparation Titre Pro - Dossier Professionnel Cerfa',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Rédiger définitivement les fiches d\'activités du DP ', text: 'selon la règle d\'or des 5 rubriques consécutives du Ministère du Travail.' },
      { bold: 'Valider la conformité réglementaire de chaque dossier ', text: '(Code Titre TP-00476, CCP 1 - Assurer le support utilisateur).' },
      { bold: 'Réaliser une revue critique croisée entre pairs ', text: 'avec grille d\'audit zéro-défaut.' }
    ],
    contenu: [
      { bold: 'Matinée (Rédaction encadrée) : ', text: 'Finalisation des exemples concrets tirés du stage en entreprise : conditions de réalisation rédigées au Je, moyens utilisés, équipe, contexte et réflexivité.' },
      { bold: 'Après-midi (Audit par les pairs) : ', text: 'Chaque apprenant audite le DP d\'un camarade avec la checklist Cerfa : chasse aux omissions, vérification des annexes et de la numérotation.' },
      { bold: 'Validation formateur : ', text: 'Revue individuelle finale et signature des versions prêtes pour le jury.' }
    ],
    supports: [
      { bold: 'Trame Cerfa officielle du Dossier Professionnel.', text: '' },
      { bold: 'Grille d\'audit et conformité DP ShanFlow/KLF.' }
    ],
    remarques: [
      { bold: 'Objectif Zéro-Défaut atteint : ', text: '100% des dossiers professionnels de la promotion sont rédigés, conformes et sécurisés avant l\'épreuve finale.' }
    ]
  },
  {
    id: 22,
    seanceNum: 22,
    date: '11/05/2027',
    isoDate: '2027-05-11',
    horaire: '13h30 - 15h30',
    duree: '2h',
    titre: 'Simulation Orale Jury Titre Pro & Bilan Final 85h',
    module: 'Clôture du parcours & Entraînement Jury Blanc',
    filiere: 'TECHNICIEN INFORMATIQUE DE PROXIMITE',
    nomFormateur: 'JACQUA David',
    objectifs: [
      { bold: 'Maîtriser la présentation orale du parcours ', text: 'face à un jury d\'examen professionnel (synthèse de 15 minutes sans notes).' },
      { bold: 'Savoir défendre sa posture de technicien ', text: 'et argumenter ses choix techniques avec sérénité.' },
      { bold: 'Dresser le bilan final de progression ', text: 'sur les 85 heures d\'intervention du parcours.' }
    ],
    contenu: [
      { bold: 'Passages oraux à blanc : ', text: 'Simulations d\'entretien final avec questions pièges du jury (gestion d\'un litige usager, panne inconnue, respect des délais).' },
      { bold: 'Débriefing collectif : ', text: 'Conseils de gestion du stress, posture physique, regard et clarté d\'élocution.' },
      { bold: 'Clôture officielle : ', text: 'Remise des attestations de compétences KLF et célébration du parcours de la promotion TIP2.' }
    ],
    supports: [
      { bold: 'Grille officielle de notation du jury Titre Pro.', text: '' },
      { bold: 'Bilan global des compétences KLF Leaderboard.' }
    ],
    remarques: [
      { bold: 'Promotion prête et confiante : ', text: 'l\'évolution entre le premier jour de septembre et aujourd\'hui est remarquable. Les apprenants possèdent la posture et la rigueur d\'un technicien opérationnel.' }
    ]
  }
];

export function getSessionByDate(dateStr: string): ChronogrammeSession | undefined {
  return CHRONOGRAMME_SESSIONS.find(s => s.date === dateStr || s.isoDate === dateStr);
}

export function getSessionById(id: number): ChronogrammeSession | undefined {
  return CHRONOGRAMME_SESSIONS.find(s => s.id === id);
}

export function getClosestSession(currentDate: Date = new Date()): ChronogrammeSession {
  const iso = currentDate.toISOString().split('T')[0];
  const exact = CHRONOGRAMME_SESSIONS.find(s => s.isoDate === iso);
  if (exact) return exact;

  const currentTs = currentDate.getTime();
  const future = CHRONOGRAMME_SESSIONS.filter(s => new Date(s.isoDate).getTime() >= currentTs);
  if (future.length > 0) return future[0];

  return CHRONOGRAMME_SESSIONS[CHRONOGRAMME_SESSIONS.length - 1];
}
