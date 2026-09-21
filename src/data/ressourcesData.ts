import { BureautiqueRessource } from '@/types/ressource';

export const RESSOURCES_DATA: BureautiqueRessource[] = [
  {
    id: 'sheets-figeage-pourcentages',
    slug: 'sheets-figeage-pourcentages',
    titre: 'Figeage des volets & calculs de pourcentages rigoureux',
    outil: 'sheets',
    categorie: 'Traitement de données & Formules',
    palier: 'Palier 1',
    tempsLecture: '8-10 min',
    resume: 'Maîtriser la navigation dans les classeurs volumineux sans perdre les en-têtes et sécuriser les calculs de pourcentages avec figeage absolu ($).',
    ticketAssocieId: 'TCK-101',
    badgeAssocieId: 'corinne_savior',
    objectifsPeda: [
      'Garder les lignes et colonnes d\'en-têtes visibles lors du défilement dans les classeurs volumineux.',
      'Comprendre la mécanique mathématique des pourcentages sans doubler la multiplication par 100.',
      'Verrouiller les cellules de référence (Total) avec le dollar ($) pour étirer les formules sans créer d\'erreurs #DIV/0!.',
      'Appliquer les standards typographiques DSI sur les données chiffrées (2 décimales, séparateurs de milliers, alignement).'
    ],
    prerequis: [
      'Savoir ouvrir un classeur Google Sheets ou Microsoft Excel.',
      'Connaître la structure d\'une formule débutant par le signe égal (=).'
    ],
    miseEnSituationKLF: 'Au terminal logistique de Jarry, Corinne et les gestionnaires de quai manipulent des manifestes de conteneurs comptant plus de 800 lignes. Dès que l\'agent fait défiler la page vers le bas, il ne sait plus si la colonne H correspond au poids brut ou au volume cubique, entraînant des erreurs de saisie critiques. De plus, lors du calcul du taux de remplissage des entrepôts, les agents multiplient par 100 manuellement avant de cliquer sur l\'icône pourcentage, affichant des taux aberrants de 8500 % !',
    raccourcisCles: [
      { touche: 'F4', action: 'Bascule automatique du figeage absolu ($A$1 -> A$1 -> $A1 -> A1)', plateforme: 'windows' },
      { touche: 'Cmd + T', action: 'Bascule du figeage absolu sur Mac Excel', plateforme: 'mac' },
      { touche: 'Ctrl + Maj + %', action: 'Appliquer instantanément le format pourcentage à la sélection', plateforme: 'universel' },
      { touche: 'Ctrl + Flèche Bas', action: 'Atteindre directement la dernière ligne renseignée du tableau', plateforme: 'windows' },
      { touche: 'Ctrl + Début', action: 'Revenir instantanément à la cellule A1 en haut à gauche', plateforme: 'windows' }
    ],
    etapesDetaillees: [
      {
        numero: 1,
        titre: 'Comprendre l\'anatomie du figeage de volets',
        detail: 'Figer ne modifie ni les données ni l\'impression : cela verrouille uniquement une zone d\'affichage à l\'écran. Sur une feuille de fret KLF, la ligne 1 (les intitulés de colonnes : Conteneur, Usager, Poids, Statut) et la colonne A (le numéro de dossier unique) doivent toujours rester visibles.',
        consigneTech: 'Ne figez jamais plus de 2 ou 3 lignes, sous peine de réduire drastiquement la zone de travail visible sur les écrans d\'ordinateurs portables des techniciens.',
        astuceDSI: 'Sur Google Sheets, repérez la barre grise épaisse située tout en haut à gauche de la cellule A1 : vous pouvez la glisser-déposer directement sous la ligne souhaitée en 1 seconde.'
      },
      {
        numero: 2,
        titre: 'Méthode pas-à-pas pour figer l\'en-tête (Sheets & Excel)',
        detail: 'Dans Google Sheets : Cliquez sur le menu "Affichage" > "Figer" > sélectionnez "1 ligne" (ou "Jusqu\'à la ligne actuelle"). Dans Microsoft Excel : Positionnez votre curseur sur la cellule située juste en dessous et à droite de la zone à bloquer, puis cliquez sur "Affichage" > "Figer les volets".',
        exempleCode: 'Menu Affichage > Figer > 1 ligne (verrouille l\'en-tête de colonnes)\nMenu Affichage > Figer > 1 colonne (verrouille la colonne des identifiants)',
        astuceDSI: 'Vérifiez le bon fonctionnement en utilisant la roulette de la souris : le corps du tableau doit glisser sous la ligne grise sans masquer vos titres.'
      },
      {
        numero: 3,
        titre: 'La règle mathématique du pourcentage sur tableur',
        detail: 'Une erreur classique consiste à écrire =(B2/B15)*100 puis à cliquer sur le bouton "%". Le tableur stocke en réalité 0.25 pour représenter 25 %. En multipliant par 100 dans la formule, vous obtenez 2500 % ! La formule brute doit UNIQUEMENT diviser la part par le total. C\'est l\'affichage du format de cellule qui applique l\'aspect visuel %.',
        exempleCode: '=B2/B15  (Résultat brut : 0,42)\n-> Appliquer le format [ % ] via le ruban -> Affichage : 42,0 %',
        consigneTech: 'Formule saine : Part / Total. Format visuel : Format > Nombre > Pourcentage.'
      },
      {
        numero: 4,
        titre: 'Le verrouillage absolu par le dollar ($) pour étirer sans crash',
        detail: 'Lorsque vous étirez une formule vers le bas, le tableur incrémente automatiquement les numéros de ligne (B2 devient B3, puis B4). Si vous écrivez =B2/B15, la ligne suivante deviendra =B3/B16. Or la cellule B16 est vide ! Cela déclenche immédiatement l\'erreur fatale #DIV/0! (Division par zéro). Pour bloquer la cellule du total, placez des dollars : $B$15.',
        exempleCode: '=B2/$B$15  (Ligne 2 : divise le poste 1 par le total)\n=B3/$B$15  (Ligne 3 : divise le poste 2 par le même total !)\n=B4/$B$15  (Ligne 4 : le total reste scellé grâce au $)',
        astuceDSI: 'Tapez la référence de cellule B15, puis appuyez sur la touche F4 de votre clavier pour injecter les dollars en une fraction de seconde.'
      },
      {
        numero: 5,
        titre: 'Contrôle d\'intégrité et somme de vérification (Check 100%)',
        detail: 'Un technicien DSI ne livre jamais un tableau sans point de contrôle. En bas de votre colonne de pourcentages, insérez systématiquement la somme totale avec la formule =SOMME(C2:C14). Le résultat doit être rigoureusement égal à 100,0 %. Si vous obtenez 99,8 % ou 100,2 %, vérifiez les arrondis de vos données sources.',
        exempleCode: '=SOMME(C2:C14)  -> Doit afficher exactement 100,0 %',
        consigneTech: 'Si la somme dépasse 100 %, cherchez si une ligne de sous-total n\'a pas été comptabilisée en double dans la plage.'
      }
    ],
    piegesAEviter: [
      'Multiplier la formule par 100 ET cliquer sur le bouton de format Pourcentage (résultat multiplié par 10 000).',
      'Oublier le symbole dollar ($) avant d\'étirer une formule vers le bas (génère des cascades de #DIV/0!).',
      'Figer les volets alors que la vue est scrollée à mi-page dans Excel (risque de masquer définitivement les premières lignes).',
      'Utiliser des formats de texte brut pour saisir des pourcentages à la main (empêche tout calcul ou tri ultérieur).'
    ],
    exerciceApplication: {
      enonce: 'Téléchargez le classeur d\'entraînement "KLF_Taux_Occupation_Quai_J1.xlsx". Réalisez les 3 opérations suivantes : 1) Figez la ligne d\'en-tête 1 et la colonne A des références conteneurs ; 2) Dans la colonne D, calculez le pourcentage de surface occupée par chaque client par rapport à la capacité totale située en B20 ; 3) Ajoutez la cellule de contrôle en D21 vérifiant que le total fait bien 100 %.',
      criteresReussite: [
        'La ligne 1 et la colonne A restent visibles lors du scroll vertical et horizontal.',
        'La formule de la colonne D contient le dollar absolu $B$20.',
        'La colonne D est formatée avec 1 décimale (ex: 24,5 %).',
        'La cellule D21 affiche la somme de contrôle de 100,0 %.'
      ],
      solutionAttendue: 'Formule en D2 : =C2/$B$20 (puis étirement de D2 à D19). Formule en D21 : =SOMME(D2:D19).'
    },
    miniQuiz: [
      {
        question: 'À quoi sert la touche F4 lors de l\'écriture d\'une formule sur tableur ?',
        options: [
          'À fermer immédiatement le classeur en cours sans sauvegarder.',
          'À convertir une référence relative (B15) en référence absolue verrouillée ($B$15).',
          'À multiplier automatiquement le résultat par 100.',
          'À figer la ligne d\'en-tête à l\'affichage.'
        ],
        reponseCorrecte: 1,
        explication: 'La touche F4 est le raccourci standard universel pour ajouter ou retirer les dollars ($) de figeage absolu sans les taper manuellement.'
      },
      {
        question: 'Quelle est la formule correcte pour calculer le pourcentage du chiffre d\'affaires en B2 par rapport au total en B10 ?',
        options: [
          '=(B2/B10)*100 avec format Pourcentage',
          '=B2/$B$10 avec application du format Pourcentage',
          '=$B$2/B10',
          '=POURCENTAGE(B2; B10)'
        ],
        reponseCorrecte: 1,
        explication: 'La formule mathématique saine est =B2/$B$10. Le dollar garantit que lors de l\'étirement vers le bas, le dénominateur reste fixé sur la cellule B10.'
      },
      {
        question: 'Que signifie l\'erreur #DIV/0! qui apparaît lorsqu\'on étire une formule ?',
        options: [
          'Le tableur ne trouve pas la police d\'écriture.',
          'La formule tente de diviser un nombre par zéro ou par une cellule vide.',
          'Le fichier est corrompu par un virus de quai.',
          'La colonne est simplement trop étroite pour afficher le texte.'
        ],
        reponseCorrecte: 1,
        explication: '#DIV/0! indique une division par zéro (ou par une cellule vide), survenant presque toujours quand on a oublié de verrouiller la cellule du total avec un dollar ($).'
      }
    ]
  },
  {
    id: 'docs-fiche-intervention',
    slug: 'docs-fiche-intervention',
    titre: 'Mise en page d\'une fiche d\'intervention normalisée DSI',
    outil: 'docs',
    categorie: 'Mise en page DSI & Charte documentaire',
    palier: 'Palier 1',
    tempsLecture: '8-10 min',
    resume: 'Construire un livrable support technique irréprochable sur Google Docs et Word : hiérarchie de styles, sauts de page forcés, tableaux sans déformation et conformité charte KLF.',
    ticketAssocieId: 'TCK-102',
    badgeAssocieId: 'dsi_charte_master',
    objectifsPeda: [
      'Bannir définitivement la touche Entrée répétée au profit du saut de page forcé (Ctrl + Entrée).',
      'Appliquer rigoureusement la hiérarchie des styles (Titre 1, Titre 2, Normal) pour structurer le document.',
      'Dimensionner des tableaux d\'intervention en pourcentages pour garantir zéro débordement lors de l\'impression.',
      'Créer un cartouche d\'émargement client professionnel aligné grâce aux tableaux invisibles.',
      'Normaliser le nommage du fichier PDF prêt à archiver (Standard DSI).'
    ],
    prerequis: [
      'Notions élémentaires de traitement de texte.',
      'Savoir sélectionner du texte et ouvrir la palette des polices.'
    ],
    miseEnSituationKLF: 'Sébastien, cariste sur les quais de Jarry, a besoin d\'une fiche réflexe d\'utilisation des terminaux Zebra. Un précédent stagiaire a rédigé un document sur Google Docs : dès qu\'on l\'ouvre sur un autre poste ou qu\'on l\'imprime, les titres glissent en bas de page, les logos s\'étirent horizontalement et le tableau de diagnostic est coupé en deux sur la page suivante. Pour la direction de KLF, ce manque de rigueur décrédibilise le service support.',
    raccourcisCles: [
      { touche: 'Ctrl + Entrée', action: 'Insérer un saut de page forcé instantané (Page Break)', plateforme: 'windows' },
      { touche: 'Cmd + Entrée', action: 'Insérer un saut de page forcé sur Mac Docs/Word', plateforme: 'mac' },
      { touche: 'Ctrl + Alt + 1', action: 'Appliquer immédiatement le style Titre 1 au paragraphe', plateforme: 'windows' },
      { touche: 'Ctrl + Alt + 2', action: 'Appliquer immédiatement le style Titre 2 au paragraphe', plateforme: 'windows' },
      { touche: 'Ctrl + Maj + C / V', action: 'Copier et coller uniquement le format de mise en page', plateforme: 'windows' }
    ],
    etapesDetaillees: [
      {
        numero: 1,
        titre: 'La structure anatomique d\'un document technique DSI',
        detail: 'Une fiche d\'intervention ou un tutoriel support officiel KLF doit impérativement comporter 4 zones normalisées : 1) L\'en-tête organisme (Logo KLF, référence document EN-19, date) ; 2) Le cartouche d\'identification (Demandeur, poste de travail concerné, urgence P1/P2/P3) ; 3) Le corps technique structuré (Constat, Diagnostic de cause, Actions correctives détaillées) ; 4) La zone de validation et visa (Nom du technicien, signature de l\'usager).',
        consigneTech: 'Chaque section majeure doit toujours démarrer en haut d\'une page propre, sans dépendre du volume de texte de la section précédente.',
        astuceDSI: 'Ne modifiez jamais la taille de police à la main pour faire un titre : utilisez exclusivement le sélecteur de styles natif.'
      },
      {
        numero: 2,
        titre: 'Bannir la touche Entrée : le saut de page forcé réflexe',
        detail: 'Le piège n°1 des débutants est d\'appuyer 10 fois sur la touche "Entrée" pour faire basculer le texte sur la page suivante. Dès que vous ajoutez un mot en page 1, tout le contenu de la page 2 descend et décale l\'intégralité du rapport ! Utilisez le raccourci universel Ctrl + Entrée. Le saut de page est un repère fixe : même si la page 1 se remplit, la page 2 restera solidement calée tout en haut.',
        exempleCode: 'Menu Insertion > Saut > Saut de page (Raccourci : Ctrl + Entrée)',
        astuceDSI: 'Sur Google Docs, activez "Affichage" > "Afficher les caractères non imprimables" pour repérer instantanément les retours à la ligne parasites.'
      },
      {
        numero: 3,
        titre: 'Maîtriser les Styles de Titres pour une table des matières automatique',
        detail: 'Les styles "Titre 1" et "Titre 2" ne servent pas seulement à colorer le texte. Ils créent l\'arborescence sémantique du fichier. C\'est cette hiérarchie qui permet à Google Docs ou Word de générer une table des matières dynamique en 1 clic et d\'assurer l\'accessibilité pour les lecteurs d\'écran.',
        exempleCode: 'Titre 1 : 1. IDENTIFICATION DU POSTE ET DE L\'INCIDENT\nTitre 2 : 1.1 Coordonnées de l\'usager demandeur\nTitre 2 : 1.2 Symptômes observés et codes d\'erreurs',
        consigneTech: 'Pour modifier l\'apparence d\'un titre sans tout refaire : mettez en forme une ligne, puis faites "Titre 1" > "Mettre à jour Titre 1 pour correspondre".'
      },
      {
        numero: 4,
        titre: 'Tableaux techniques sans déformation et non-fractionnement',
        detail: 'Les fiches d\'intervention comportent souvent un tableau de pièces remplacées ou d\'étapes de test. Pour éviter qu\'un tableau ne déborde lors de l\'impression, réglez la largeur totale sur 100% de la page (marges comprises). Dans Word ou Docs, cochez la propriété "Empêcher le fractionnement de la ligne sur plusieurs pages" pour qu\'une étape technique ne soit jamais coupée au milieu.',
        exempleCode: 'Propriétés du tableau > Alignement centré > Empêcher le fractionnement des lignes',
        astuceDSI: 'Pour les colonnes de données chiffrées (durée d\'intervention, coût), alignez toujours le texte à droite pour faciliter la lecture des unités.'
      },
      {
        numero: 5,
        titre: 'Le secret des DSI : les tableaux invisibles pour les signatures',
        detail: 'Pour placer côte à côte la date, le visa du technicien et la signature du client en bas de document, n\'utilisez jamais la barre d\'espace ou des tabulations chaotiques. Insérez un tableau de 1 ligne et 2 colonnes. Placez les mentions dans chaque colonne, puis mettez la couleur des bordures du tableau en transparent (0 pt ou blanc). L\'alignement reste parfait, quelle que soit la résolution d\'écran.',
        exempleCode: 'Tableau 1x2 : [Colonne gauche : Visa Technicien DSI] [Colonne droite : Visa Usager KLF]\nBordures du tableau = 0 pt (Invisible à l\'impression)',
        consigneTech: 'C\'est le standard absolu exigé pour les formulaires réglementaires Cerfa et Qualiopi.'
      }
    ],
    piegesAEviter: [
      'Appuyer 15 fois sur Entrée pour passer à la page suivante au lieu d\'utiliser Ctrl + Entrée.',
      'Mélanger plus de 2 polices de caractères dans un même document technique (règle DSI : une police de titre sobre, une police de corps lisible).',
      'Insérer des images ou captures d\'écran en mode "Au-dessus du texte" flottant (risque de recouvrir des paragraphes entiers).',
      'Oublier de convertir le livrable final en PDF avant de le transmettre à un usager ou à la hiérarchie.'
    ],
    exerciceApplication: {
      enonce: 'À partir du texte brut "Rapport_Incident_Quai_Zebra_Brut.txt", mettez en page la fiche d\'intervention officielle KLF en appliquant les règles DSI : 1) En-tête avec titre en Titre 1 ; 2) Saut de page forcé avant la section 2 ; 3) Tableau de diagnostic 3 colonnes centré sans bordures brisées ; 4) Cartouche de signature en tableau invisible 1x2 ; 5) Export au format "AAAA-MM-JJ_FicheInterv_Zebra_Prenom_NOM.pdf" (exemple fictif : 2026-09-22_FicheInterv_Zebra_Martin_RICHELIEU.pdf, à remplacer par votre propre prénom et NOM).',
      criteresReussite: [
        'Zéro saut de ligne parasite consécutif (vérifié via caractères masqués).',
        'Le document comporte un saut de page propre (Ctrl + Entrée).',
        'Les styles Titre 1 et Titre 2 sont appliqués.',
        'La zone d\'émargement finale est parfaitement alignée via tableau invisible.',
        'Nom de fichier strictement normalisé : AAAA-MM-JJ_FicheInterv_Zebra_Prenom_NOM.pdf.'
      ],
      solutionAttendue: 'Document normalisé 2 pages strictes au format AAAA-MM-JJ_FicheInterv_Zebra_Prenom_NOM.pdf, exporté en PDF haute qualité prêt pour le Dossier Professionnel (DP).'
    },
    miniQuiz: [
      {
        question: 'Quel est le raccourci universel pour insérer un saut de page propre sans décaler les paragraphes suivants ?',
        options: [
          'Maj + Entrée',
          'Ctrl + Entrée (ou Cmd + Entrée sur Mac)',
          'Alt + Entrée',
          'Ctrl + Tab'
        ],
        reponseCorrecte: 1,
        explication: 'Ctrl + Entrée insère immédiatement un saut de page forcé (Page Break), garantissant que le texte suivant démarrera toujours en haut de la page suivante.'
      },
      {
        question: 'Pourquoi est-il déconseillé de changer manuellement la taille et la couleur du texte pour créer un titre dans un rapport technique ?',
        options: [
          'Parce que l\'imprimante refuse d\'imprimer le texte agrandi.',
          'Parce que le document perd sa structure sémantique et ne peut pas générer de table des matières automatique.',
          'Parce que Google Docs facture les modifications de taille de police.',
          'Parce que cela efface automatiquement le pied de page.'
        ],
        reponseCorrecte: 1,
        explication: 'L\'utilisation des styles prédéfinis (Titre 1, Titre 2) confère une structure sémantique au document, indispensable pour l\'arborescence, la table des matières automatique et l\'accessibilité.'
      },
      {
        question: 'Comment aligner parfaitement deux blocs de signature côte à côte (Technicien et Usager) en bas de fiche ?',
        options: [
          'En tapant 45 espaces consécutifs entre les deux blocs.',
          'En insérant un tableau de 1 ligne et 2 colonnes avec des bordures transparentes (invisibles).',
          'En utilisant la loupe de Windows.',
          'En réduisant les marges de la page à 0 cm.'
        ],
        reponseCorrecte: 1,
        explication: 'Le tableau invisible (bordures masquées à 0 pt) est la méthode professionnelle standard pour verrouiller des alignements stricts sans dépendre des polices ou des marges.'
      }
    ]
  },
  {
    id: 'sheets-formules-vitales',
    slug: 'sheets-formules-vitales',
    titre: 'Les 5 formules réflexes du technicien support (Sheets & Excel)',
    outil: 'sheets',
    categorie: 'Support applicatif & Traitement de données',
    palier: 'Palier 2',
    tempsLecture: '8-10 min',
    resume: 'Maîtriser les 5 fonctions indispensables pour dépanner un utilisateur, auditer des fichiers de données et réparer les erreurs #N/A : SOMME, SI, RECHERCHEV, SUPPRESPACE et NB.SI.',
    badgeAssocieId: 'excel_data_cleaner',
    objectifsPeda: [
      'Comprendre et appliquer sans hésitation la syntaxe exacte de la formule RECHERCHEV avec l\'argument FAUX.',
      'Éradiquer les erreurs invisibles #N/A causées par des espaces résiduels grâce à la fonction SUPPRESPACE.',
      'Construire une condition logique SI robuste pour automatiser les statuts (Conforme / Non conforme).',
      'Dénombrer et filtrer des incidents par catégorie avec la formule NB.SI.',
      'Sécuriser l\'affichage utilisateur en encapsulant les formules sensibles dans un SIERREUR rassurant.'
    ],
    prerequis: [
      'Savoir saisir une formule simple avec le signe égal (=).',
      'Comprendre la notion de cellules et de plages de données (ex: A2:C50).'
    ],
    miseEnSituationKLF: 'Corinne au service Facturation de KLF est au bord de la crise : sur le fichier de dédouanement maritime des conteneurs, la moitié des lignes affichent le message d\'erreur "#N/A", bloquant le départ des transporteurs à Jarry. Elle pense que le fichier est détruit par un pirate. En réalité, sa formule RECHERCHEV ne contient pas le paramètre de correspondance exacte, et certains numéros de conteneurs contiennent un espace invisible à la fin ("CONT-4012 ") copié depuis un logiciel de caisse.',
    raccourcisCles: [
      { touche: 'Alt + =', action: 'Insertion automatique de la formule SOMME sur la colonne active', plateforme: 'windows' },
      { touche: 'Maj + F3', action: 'Ouvrir l\'assistant de fonctions et formules', plateforme: 'windows' },
      { touche: 'Ctrl + ;', action: 'Insérer la date du jour statique dans la cellule active', plateforme: 'windows' },
      { touche: 'Ctrl + H', action: 'Rechercher et remplacer rapidement dans tout le classeur', plateforme: 'windows' }
    ],
    etapesDetaillees: [
      {
        numero: 1,
        titre: 'Formule 1 : SOMME et SOMME.SI pour les agrégations de fret',
        detail: 'La fonction =SOMME(plage) additionne tous les nombres d\'une sélection. Mais sur le parc KLF, vous devez souvent sommer uniquement les montants d\'un service donné. La fonction =SOMME.SI(plage_critere; critere; plage_somme) permet par exemple d\'additionner le fret uniquement pour le port de "Pointe-à-Pitre".',
        exempleCode: '=SOMME(C2:C100)  (Totalise tous les montants de la colonne C)\n=SOMME.SI(B2:B100; "Jarry"; C2:C100)  (Totalise uniquement les conteneurs du site de Jarry)',
        astuceDSI: 'Ne sélectionnez jamais la colonne entière C:C si votre feuille comporte des milliers de lignes, car cela ralentit considérablement les calculs sur Google Sheets.'
      },
      {
        numero: 2,
        titre: 'Formule 2 : La condition logique SI pour automatiser le contrôle',
        detail: 'La fonction SI teste une condition et affiche un résultat différent selon que le test est VRAI ou FAUX. Syntaxe : =SI(test_logique; valeur_si_vrai; valeur_si_faux). Dans le support KLF, elle permet de repérer en 1 coup d\'œil les conteneurs en surcharge ou les délais de livraison dépassés.',
        exempleCode: '=SI(D2 > 25000; "SURCHARGE DANGER"; "CONFORME")\n=SI(E2="Payé"; 0; C2*0.085)  (Calcule la TVA 8.5% si la facture est en attente)',
        consigneTech: 'Pensez à toujours encadrer les textes entre guillemets ("CONFORME"). Les nombres et formules, eux, ne prennent jamais de guillemets.'
      },
      {
        numero: 3,
        titre: 'Formule 3 : Le RECHERCHEV démythifié (Pourquoi il plante toujours)',
        detail: 'RECHERCHEV cherche un identifiant dans la 1ère colonne d\'une table et renvoie la valeur située sur la même ligne dans une autre colonne. Syntaxe : =RECHERCHEV(valeur_cherchee; table_matrice; numero_index_colonne; [correspondance]). Le piège absolu est d\'oublier le 4ème argument ! Sans lui, le tableur suppose que la liste est triée par ordre alphabétique et renvoie des lignes fantaisistes.',
        exempleCode: '=RECHERCHEV(A2; $F$2:$H$500; 3; FAUX)\nExplication :\n- A2 : Le code conteneur cherché\n- $F$2:$H$500 : La base de référence verrouillée par les dollars\n- 3 : La 3ème colonne de la base (contenant le tarif)\n- FAUX (ou 0) : EXIGE la correspondance exacte (ZÉRO tolérance à l\'erreur)',
        astuceDSI: 'Retenez la règle mnémotechnique : en support DSI, le 4ème argument de RECHERCHEV est TOUJOURS FAUX (ou 0).'
      },
      {
        numero: 4,
        titre: 'Formule 4 : SUPPRESPACE, le remède miracle contre le faux #N/A',
        detail: '90 % des erreurs #N/A inexplicables proviennent d\'un espace fantôme ajouté à la fin d\'un mot lors d\'un copier-coller (ex: "JARRY " avec un espace final n\'est PAS égal à "JARRY"). La fonction =SUPPRESPACE(texte) nettoie instantanément la cellule en supprimant tous les espaces inutiles au début et à la fin.',
        exempleCode: '=SUPPRESPACE(A2)  (Nettoie la cellule A2 de tout espace parasite)\n=RECHERCHEV(SUPPRESPACE(A2); $F$2:$H$50; 2; FAUX)  (Formule blindée tout-en-un)',
        consigneTech: 'Avant de dire à un utilisateur que sa donnée n\'existe pas dans la base, passez systématiquement sa colonne d\'identifiants au crible de SUPPRESPACE.'
      },
      {
        numero: 5,
        titre: 'Formule 5 : NB.SI pour les métriques de supervision',
        detail: 'La fonction =NB.SI(plage; critere) compte le nombre de cellules répondant à une condition. C\'est l\'outil quotidien du technicien support pour comptabiliser les tickets ouverts ou les matériels défectueux en inventaire.',
        exempleCode: '=NB.SI(F2:F200; "En panne")  (Compte le nombre de postes hors service)\n=NB.SI(G2:G200; "P1")  (Compte le nombre d\'incidents critiques prioritaires)',
        astuceDSI: 'Associez NB.SI à la formule SIERREUR pour créer des tableaux de bord propres : =SIERREUR(RECHERCHEV(...); "Non référencé") évite d\'afficher un code d\'erreur anxiogène à l\'usager.'
      }
    ],
    piegesAEviter: [
      'Oublier le 4ème paramètre "FAUX" dans RECHERCHEV (entraîne des retours de valeurs erronées silencieuses).',
      'Ne pas verrouiller la table de référence avec les dollars $ ($A$2:$D$100), décalant la matrice à chaque ligne étirée.',
      'Oublier les guillemets autour des textes dans la formule SI (ex: =SI(A1=OK;...) provoque l\'erreur #NOM?).',
      'Confondre la recherche verticale (RECHERCHEV) qui exige que la clé soit impérativement dans la PREMIÈRE colonne du tableau de référence.'
    ],
    exerciceApplication: {
      enonce: 'Corinne vous confie le fichier d\'audit "KLF_Facturation_Conteneurs_Erreur.xlsx". La colonne E affiche des erreurs #N/A lors de la recherche du tarif client. 1) Analysez la cause de l\'erreur dans la formule actuelle ; 2) Corrigez la formule RECHERCHEV en injectant l\'argument de correspondance exacte et le figeage de la matrice tarifaire ; 3) Utilisez SUPPRESPACE pour traiter les codes conteneurs corrompus par des espaces ; 4) Encapsulez le tout avec SIERREUR pour afficher "Client Inconnu" si le code n\'existe pas.',
      criteresReussite: [
        'Toutes les erreurs #N/A disparaissent de la colonne E.',
        'La matrice tarifaire est scellée avec des dollars absolus ($).',
        'La formule gère proprement les espaces résiduels.',
        'Les clients non répertoriés affichent "Client Inconnu" au lieu d\'un message de crash.'
      ],
      solutionAttendue: '=SIERREUR(RECHERCHEV(SUPPRESPACE(A2); $H$2:$I$50; 2; FAUX); "Client Inconnu")'
    },
    miniQuiz: [
      {
        question: 'Pourquoi devez-vous TOUJOURS spécifier FAUX (ou 0) comme 4ème argument dans la fonction RECHERCHEV ?',
        options: [
          'Pour indiquer que le tableau doit être imprimé en noir et blanc.',
          'Pour exiger une correspondance exacte et empêcher le tableur de renvoyer une valeur approximative erronée.',
          'Pour accélérer la vitesse de calcul du processeur.',
          'Pour masquer les chiffres confidentiels aux stagiaires.'
        ],
        reponseCorrecte: 1,
        explication: 'Le 4ème argument FAUX (ou 0) force la correspondance exacte. S\'il est omis ou mis à VRAI, le tableur renverra la valeur la plus proche si le tableau est trié, créant des erreurs comptables redoutables.'
      },
      {
        question: 'À quoi sert la fonction =SUPPRESPACE(" CONT-902 ") ?',
        options: [
          'À supprimer définitivement la cellule de la feuille.',
          'À retirer les espaces invisibles situés au début et à la fin du texte pour obtenir "CONT-902".',
          'À mettre tout le texte en lettres majuscules.',
          'À calculer la racine carrée du numéro de conteneur.'
        ],
        reponseCorrecte: 1,
        explication: 'SUPPRESPACE élimine tous les espaces au début et à la fin de la chaîne de texte, ainsi que les doubles espaces intérieurs. C\'est l\'antidote numéro 1 aux erreurs #N/A.'
      },
      {
        question: 'Quelle formule permet d\'afficher "Non trouvé" au lieu du message d\'erreur #N/A si une recherche échoue ?',
        options: [
          '=SI(ERREUR; ...)',
          '=SIERREUR(RECHERCHEV(...); "Non trouvé")',
          '=EFFACER.ERREUR(RECHERCHEV(...))',
          '=RECHERCHEV(SIERREUR(...))'
        ],
        reponseCorrecte: 1,
        explication: 'La fonction =SIERREUR(formule; valeur_alternative) intercepte n\'importe quelle erreur (comme #N/A, #DIV/0!, #VALEUR!) et affiche le texte de remplacement choisi à la place.'
      }
    ]
  }
];

export function getAllRessources(): BureautiqueRessource[] {
  return RESSOURCES_DATA;
}

export function getRessourceBySlug(slug: string): BureautiqueRessource | undefined {
  return RESSOURCES_DATA.find((r) => r.slug === slug);
}

export function getRessourcesByTool(tool: string): BureautiqueRessource[] {
  if (tool === 'all') return RESSOURCES_DATA;
  return RESSOURCES_DATA.filter((r) => r.outil === tool);
}
