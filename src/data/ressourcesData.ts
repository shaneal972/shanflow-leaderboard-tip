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
          'À convertir une référence relative (B15) en référence absolue verrouillée ($B$15).',
          'À fermer immédiatement le classeur en cours sans sauvegarder.',
          'À multiplier automatiquement le résultat par 100.',
          'À figer la ligne d\'en-tête à l\'affichage.'
        ],
        reponseCorrecte: 0,
        explication: 'La touche F4 est le raccourci standard universel pour ajouter ou retirer les dollars ($) de figeage absolu sans les taper manuellement.'
      },
      {
        question: 'Quelle est la formule correcte pour calculer le pourcentage du chiffre d\'affaires en B2 par rapport au total en B10 ?',
        options: [
          '=(B2/B10)*100 avec format Pourcentage',
          '=$B$2/B10',
          '=POURCENTAGE(B2; B10)',
          '=B2/$B$10 avec application du format Pourcentage'
        ],
        reponseCorrecte: 3,
        explication: 'La formule mathématique saine est =B2/$B$10. Le dollar garantit que lors de l\'étirement vers le bas, le dénominateur reste fixé sur la cellule B10.'
      },
      {
        question: 'Que signifie l\'erreur #DIV/0! qui apparaît lorsqu\'on étire une formule ?',
        options: [
          'Le tableur ne trouve pas la police d\'écriture.',
          'Le fichier est corrompu par un virus de quai.',
          'La formule tente de diviser un nombre par zéro ou par une cellule vide.',
          'La colonne est simplement trop étroite pour afficher le texte.'
        ],
        reponseCorrecte: 2,
        explication: '#DIV/0! indique une division par zéro (ou par une cellule vide), survenant presque toujours quand on a oublié de verrouiller la cellule du total avec un dollar ($).'
      }
    ]
  },
  {
    id: 'docs-fiche-intervention',
    slug: 'docs-fiche-intervention',
    titre: 'Mise en page chirurgicale d\'une fiche d\'intervention & Charte DSI (Notice Zebra)',
    outil: 'docs',
    categorie: 'Mise en page DSI & Charte documentaire',
    palier: 'Palier 1',
    tempsLecture: '12-15 min (Atelier pratique 1h30)',
    resume: 'Prendre en main un document technique corrompu (.docx poubelle), éradiquer les retours à la ligne parasites via les marques masquées (¶), caler la page 2 avec Ctrl + Entrée, appliquer les styles Titre 1/Titre 2 et verrouiller l\'émargement client avec un tableau invisible.',
    ticketAssocieId: 'TCK-102',
    badgeAssocieId: 'dsi_charte_master',
    fichierExerciceNom: 'KLF_Notice_Zebra_v1_POUBELLE.docx',
    fichierExerciceUrl: '/api/ressources/download-sample?file=zebra-doc',
    fichierFormat: '.docx',
    autopsieAvantApres: {
      defauts: [
        '15 appuis consécutifs sur la touche Entrée pour forcer le passage à la page 2 (décalant tout le document au moindre mot ajouté).',
        'Titres bricolés manuellement à la souris (sélectionner + police 16 + gras) détruisant l\'arborescence sémantique du fichier.',
        'Tableau de diagnostic coupé en deux à l\'impression car non paramétré en interdiction de fractionnement des lignes.',
        'Alignement de la signature client et du visa technicien bricolé avec 40 espaces consécutifs (partant en lambeaux sur écran large).'
      ],
      solutionsDSI: [
        'Saut de page forcé instantané (Ctrl + Entrée) garantissant une page 2 toujours parfaitement calée en haut.',
        'Application stricte des styles sémantiques Titre 1 et Titre 2 pour une uniformisation de la charte en 1 clic.',
        'Tableau dimensionné à 100% avec l\'option « Empêcher le fractionnement de la ligne sur plusieurs pages » cochée.',
        'Tableau invisible 1x2 sans bordures (0 pt) garantissant un alignement d\'émargement millimétré quel que soit le support.'
      ]
    },
    objectifsPeda: [
      'Bannir définitivement la touche Entrée répétée au profit du saut de page forcé (Ctrl + Entrée).',
      'Activer et interpréter les caractères non imprimables (¶, flèches de tabulation, points d\'espace) pour nettoyer un document.',
      'Appliquer rigoureusement la hiérarchie des styles (Titre 1, Titre 2, Normal) pour structurer le document selon la charte DSI.',
      'Dimensionner des tableaux d\'intervention en pourcentages et empêcher le fractionnement des lignes.',
      'Créer un cartouche d\'émargement client professionnel aligné grâce aux tableaux invisibles sans bordure.',
      'Normaliser le nommage du fichier PDF prêt à archiver (Standard DSI KLF).'
    ],
    prerequis: [
      'Notions élémentaires de traitement de texte (sélectionner du texte, couper/coller).',
      'Savoir ouvrir Microsoft Word ou Google Docs sur son poste de travail.'
    ],
    miseEnSituationKLF: 'Sébastien, cariste sur les quais de Jarry, est en détresse : la notice technique des terminaux Zebra TC57 rédigée par un précédent stagiaire (KLF_Notice_Zebra_v1_POUBELLE.docx) est un désastre opérationnel. Dès qu\'on l\'ouvre sur un autre poste ou qu\'on l\'imprime pour le quai, les titres glissent en bas de page, les logos s\'étirent horizontalement et le tableau de diagnostic est coupé en deux sur la page suivante. Pour la direction de KLF, ce manque de rigueur décrédibilise le service support.',
    raccourcisCles: [
      { touche: 'Ctrl + Entrée', action: 'Insérer un saut de page forcé instantané (Page Break)', plateforme: 'windows' },
      { touche: 'Cmd + Entrée', action: 'Insérer un saut de page forcé sur Mac Docs/Word', plateforme: 'mac' },
      { touche: 'Ctrl + Maj + 8 (ou bouton ¶)', action: 'Afficher / masquer les caractères non imprimables', plateforme: 'windows' },
      { touche: 'Ctrl + Alt + 1', action: 'Appliquer immédiatement le style Titre 1 au paragraphe', plateforme: 'windows' },
      { touche: 'Ctrl + Alt + 2', action: 'Appliquer immédiatement le style Titre 2 au paragraphe', plateforme: 'windows' },
      { touche: 'Ctrl + Maj + C / V', action: 'Copier et coller uniquement le format de mise en page', plateforme: 'windows' }
    ],
    etapesDetaillees: [
      {
        numero: 1,
        titre: 'Télécharger le document poubelle et activer les marques de paragraphe (¶)',
        detail: 'Téléchargez le fichier KLF_Notice_Zebra_v1_POUBELLE.docx via le bouton ci-dessus et ouvrez-le. Votre premier réflexe de technicien est d\'activer l\'affichage des caractères non imprimables via [Accueil] > [Groupe Paragraphe] > [Bouton ¶] (ou raccourci Ctrl + Maj + 8). Vous découvrez alors l\'ampleur du désastre : 15 symboles ¶ consécutifs tapés pour faire descendre le texte !',
        consigneTech: 'Bannissez la peur des marques cachées : elles ne s\'impriment jamais, mais elles sont les yeux du technicien pour repérer les anomalies de mise en page.',
        astuceDSI: 'Sur Google Docs, allez dans [Affichage] > [Afficher les caractères non imprimables].'
      },
      {
        numero: 2,
        titre: 'Éradiquer les retours chariots et caler la page 2 avec Ctrl + Entrée',
        detail: 'Sélectionnez tous les symboles ¶ parasites situés entre la section 1 et la section 2 et supprimez-les avec la touche Suppr. Positionnez ensuite votre curseur immédiatement devant le titre « 2. PROCEDURE DE PRISE DE POSTE » et appuyez sur Ctrl + Entrée. Un trait discret « Saut de page » apparaît : la page 2 est désormais scellée tout en haut, même si vous modifiez la page 1 ultérieurement.',
        exempleCode: 'Raccourci universel : Ctrl + Entrée (Windows) / Cmd + Entrée (Mac)\nChemin ruban : [Onglet Insertion] > [Groupe Pages] > [Bouton Saut de page]',
        astuceDSI: 'Si une page blanche vide apparaît, supprimez simplement le caractère ¶ résiduel situé juste devant la balise de saut de page.'
      },
      {
        numero: 3,
        titre: 'Appliquer la hiérarchie sémantique des styles (Titre 1 & Titre 2)',
        detail: 'Ne touchez plus jamais au sélecteur de taille de police pour faire un titre ! Placez votre curseur dans le titre principal et appliquez [Accueil] > [Styles] > [Titre 1] (ou Ctrl + Alt + 1). Pour les sous-parties (2.1, 2.2), appliquez le style [Titre 2] (Ctrl + Alt + 2). Les styles confèrent une structure sémantique au document, indispensable pour l\'accessibilité et le sommaire automatique.',
        exempleCode: 'Titre 1 : 1. CONTEXTE ET OBJECTIF DU DOCUMENT (Ctrl + Alt + 1)\nTitre 1 : 2. PROCEDURE DE PRISE DE POSTE ET D\'ALLUMAGE (Ctrl + Alt + 1)\nTitre 2 : 2.1 Contrôle des batteries et voyants (Ctrl + Alt + 2)',
        consigneTech: 'Pour adapter la charte KLF : mettez en forme une ligne (ex: police Calibri 16 bleu marine KLF #0A192F), puis faites clic droit sur Titre 1 dans le ruban > « Mettre à jour Titre 1 pour correspondre à la sélection ».'
      },
      {
        numero: 4,
        titre: 'Dompter le tableau de diagnostic (100% largeur & Zéro fractionnement)',
        detail: 'Un tableau technique ne doit jamais déborder des marges ni être coupé horizontalement au milieu d\'une ligne lors de l\'impression. Sélectionnez le tableau de diagnostic des voyants : 1) Réglez sa largeur totale sur 100% ; 2) Faites un clic droit sur le tableau > [Propriétés du tableau] > onglet [Ligne] > décochez impérativement la case « Autoriser le fractionnement des lignes sur plusieurs pages ». La ligne entière basculera proprement si l\'espace manque.',
        exempleCode: '[Clic droit sur le tableau] > [Propriétés du tableau] > [Ligne] > Décocher [Autoriser le fractionnement des lignes sur plusieurs pages]',
        astuceDSI: 'Dans l\'onglet [Ligne], cochez également « Répéter en tant que ligne d\'en-tête en haut de chaque page » si votre tableau dépasse sur une deuxième page.'
      },
      {
        numero: 5,
        titre: 'Le secret des DSI : L\'émargement par tableau invisible 1x2 sans bordure',
        detail: 'Pour placer le Visa du Technicien et la Signature du Client côte à côte en bas de document, n\'utilisez jamais la barre d\'espace ou des tabulations manuelles. Insérez un tableau de 1 ligne et 2 colonnes ([Insertion] > [Tableau] > 1x2). Saisissez les mentions dans chaque colonne, puis appliquez [Bordures] > [Aucune bordure] (0 pt). L\'alignement reste inaltérable sur tout écran et à l\'impression.',
        exempleCode: 'Tableau 1x2 : [Colonne gauche : Visa Technicien DSI KLF] [Colonne droite : Visa Responsable Quai Sebastien LEBLANC]\nBordures du tableau = 0 pt (Bordures invisibles à l\'impression)',
        consigneTech: 'C\'est le standard absolu exigé pour les formulaires réglementaires Cerfa et Qualiopi.'
      }
    ],
    piegesAEviter: [
      'Appuyer 15 fois sur Entrée pour passer à la page suivante au lieu d\'utiliser Ctrl + Entrée.',
      'Mélanger plus de 2 polices de caractères dans un même document technique (règle DSI : une police de titre sobre, une police de corps lisible).',
      'Insérer des images ou captures d\'écran en mode « Au-dessus du texte » flottant (risque de recouvrir des paragraphes entiers).',
      'Oublier de convertir le livrable final en PDF avant de le transmettre à un usager ou à la hiérarchie.'
    ],
    exerciceApplication: {
      enonce: `DÉFI AUTONOME (Ticket TCK-104) : La procédure technique d'exploitation du Pont-Bascule de Quai 2 a été rédigée sous forme d'un document brut chaotique (KLF_Procedure_PontBascule_v1_POUBELLE.docx). Votre mission de technicien support consiste à restructurer ce document en un livrable DSI officiel de 4 pages strictes :

1. Découpage chirurgical (4 pages) : Éradiquez tous les retours chariots parasites (¶) et scellez chaque partie en haut de sa page dédiée via Ctrl + Entrée (Page 1 = Contexte ; Page 2 = Étalonnage ; Page 3 = Diagnostic ; Page 4 = Émargement).
2. Hiérarchie complète des styles à 3 niveaux :
   • Titre 1 : Parties principales (1, 2, 3, 4).
   • Titre 2 : Sous-parties (1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2).
   • Titre 3 : Points d'attention technique spécifiques (1.1.1 Caractéristiques de la fosse, 2.1.1 Contrôle des capteurs).
3. Tableau technique (Page 3) : Caler le tableau des codes erreurs à 100% de largeur et interdire le fractionnement des lignes sur plusieurs pages.
4. Émargement scellé (Page 4) : Construire le bloc de double signature (Visa Technicien DSI / Visa Responsable Quai) via un tableau invisible 1x2 sans bordure (0 pt).
5. ⚠️ RÈGLE TEMPORELLE IMPORTANTE : Aucun sommaire automatique n'est demandé sur ce document (la création de la table des matières dynamique et des gabarits .dotx sera abordée dans le module suivant, après la pause).
6. Export et dépôt Drive : Enregistrez le livrable final en PDF sous le format :
   • AAAA-MM-JJ_Procedure_PontBascule_Prenom_NOM.pdf
   Déposez-le directement sur le Google Drive dans l'arborescence officielle :
   • 02_CASIERS_DES_APPRENANTS > Evaluations_Bureautique > Word-Docs`,
      fichierNom: 'KLF_Procedure_PontBascule_v1_POUBELLE.docx',
      fichierUrl: '/api/ressources/download-sample?file=pont-bascule-doc',
      criteresReussite: [
        'Zéro saut de ligne parasite consécutif (contrôlé avec l\'affichage des marques ¶ masquées).',
        'Document scellé sur 4 pages strictes grâce à des sauts de page forcés (Ctrl + Entrée).',
        'Arborescence sémantique complète et uniforme avec 3 niveaux de styles (Titre 1, Titre 2 et Titre 3).',
        'Tableau de diagnostic (page 3) calé à 100% de largeur sans rupture de ligne.',
        'Bloc d\'émargement final (page 4) rigoureusement aligné grâce au tableau invisible 1x2 sans bordures.',
        'Respect de la séquence pédagogique : aucun sommaire automatique généré à cette étape.',
        'Livrable PDF 4 pages déposé sur le Google Drive dans 02_CASIERS_DES_APPRENANTS > Evaluations_Bureautique > Word-Docs avec le nom normalisé : AAAA-MM-JJ_Procedure_PontBascule_Prenom_NOM.pdf.'
      ],
      solutionAttendue: 'Document technique de 4 pages strictes nommé AAAA-MM-JJ_Procedure_PontBascule_Prenom_NOM.pdf, arborescence sémantique complète (Titre 1/2/3), émargement verrouillé par tableau invisible, sans table des matières (prévue au Module 2), déposé sur le Drive dans 02_CASIERS_DES_APPRENANTS > Evaluations_Bureautique > Word-Docs.'
    },
    miniQuiz: [
      {
        question: 'Quel est le raccourci universel pour insérer un saut de page propre sans décaler les paragraphes suivants ?',
        options: [
          'Maj + Entrée',
          'Alt + Entrée',
          'Ctrl + Entrée (ou Cmd + Entrée sur Mac)',
          'Ctrl + Tab'
        ],
        reponseCorrecte: 2,
        explication: 'Ctrl + Entrée insère immédiatement un saut de page forcé (Page Break), garantissant que le texte suivant démarrera toujours en haut de la page suivante, indépendamment des modifications de la page 1.'
      },
      {
        question: 'Pourquoi est-il formellement proscrit de changer manuellement la taille et la couleur du texte pour créer un titre ?',
        options: [
          'Parce que le document perd sa structure sémantique et ne peut pas générer de table des matières automatique.',
          'Parce que les logiciels de traitement de texte bloquent l’impression des textes agrandis manuellement.',
          'Parce que cela convertit automatiquement le paragraphe en image non modifiable.',
          'Parce que cela efface automatiquement l’en-tête et le pied de page du document.'
        ],
        reponseCorrecte: 0,
        explication: 'L\'utilisation des styles prédéfinis (Titre 1, Titre 2) confère une structure sémantique au document, indispensable pour l\'arborescence, la table des matières automatique et l\'accessibilité pour les malvoyants.'
      },
      {
        question: 'Comment aligner parfaitement deux blocs de signature côte à côte (Technicien et Usager) en bas de fiche ?',
        options: [
          'En insérant 40 espaces consécutifs ou 5 tabulations manuelles entre les deux blocs.',
          'En insérant un tableau de 1 ligne et 2 colonnes avec des bordures transparentes (invisibles à 0 pt).',
          'En divisant la page entière en deux colonnes de journal.',
          'En réduisant les marges latérales de la page à 0 cm.'
        ],
        reponseCorrecte: 1,
        explication: 'Le tableau invisible (bordures masquées à 0 pt) est la méthode professionnelle standard pour verrouiller des alignements stricts sans dépendre des polices, des tabulations aléatoires ou des marges.'
      }
    ]
  },
  {
    id: 'docs-sommaire-gabarit-dotx',
    slug: 'docs-sommaire-gabarit-dotx',
    titre: 'Documents techniques longs : Sommaire automatique, Styles avancés & Modèle (.dotx)',
    outil: 'docs',
    categorie: 'Architecture documentaire & Automatisation',
    palier: 'Palier 1',
    tempsLecture: '12-15 min (Atelier pratique 1h45)',
    resume: 'Structurer un manuel d\'exploitation KLF de 4 pages : numérotation hiérarchique multiniveaux (1. / 1.1 / 1.2) liée aux styles, volet de navigation, table des matières dynamique en 1 clic, pieds de page Page X sur Y et sauvegarde en modèle réutilisable (.dotx).',
    ticketAssocieId: 'TCK-102',
    badgeAssocieId: 'dsi_charte_master',
    fichierExerciceNom: 'KLF_Manuel_Procedure_Standard_BRUT.txt',
    fichierExerciceUrl: '/api/ressources/download-sample?file=sop-txt',
    fichierFormat: '.txt',
    autopsieAvantApres: {
      defauts: [
        'Numérotation des chapitres tapée en dur à la main (1., 1.1, 1.2), devenant fausse dès qu\'on intercale une nouvelle section.',
        'Sommaire tapé artisanalement avec des petits points tapés à la main (.....) et numéros de pages désynchronisés à chaque mise à jour.',
        'Absence de numérotation automatique de page (Page X sur Y), obligeant à modifier manuellement chaque pied de page.',
        'Absence de modèle d\'entreprise (.dotx) : chaque technicien repart d\'une feuille blanche avec des polices hétérogènes.'
      ],
      solutionsDSI: [
        'Numérotation hiérarchique officielle liée directement aux styles Titre 1 et Titre 2.',
        'Table des matières automatique générée en 1 clic, actualisable instantanément via la touche F9.',
        'Pieds de page dynamiques avec le champ automatique « Page X sur Y » et logo DSI dans l\'en-tête.',
        'Enregistrement de la trame au format Modèle Word (.dotx) pour standardiser l\'ensemble des procédures de la promotion.'
      ]
    },
    objectifsPeda: [
      'Configurer une liste à plusieurs niveaux liée directement aux styles Titre 1 et Titre 2 pour une numérotation 100% automatique.',
      'Exploiter le volet de navigation pour réorganiser des chapitres entiers par simple glisser-déposer sans copier-coller.',
      'Générer, personnaliser et actualiser (touche F9) une table des matières dynamique avec points de suite.',
      'Insérer des pieds de page normés avec le champ automatique « Page X sur Y ».',
      'Enregistrer et déployer un Modèle Word d\'entreprise (.dotx) prêt à l\'emploi dans les modèles Office.'
    ],
    prerequis: [
      'Maîtriser les styles Titre 1 et Titre 2 vus dans le Module 1.',
      'Savoir insérer un saut de page propre (Ctrl + Entrée).'
    ],
    miseEnSituationKLF: 'Après le succès de la remise en état de la notice Zebra, le DSI Marc Verdier vous confie une mission d\'envergure : transformer les notes brutes de maintenance (KLF_Manuel_Procedure_Standard_BRUT.txt) en un Manuel de Procédure Standard DSI officiel de 4 pages. Ce document doit être doté d\'une couverture sobre, d\'un sommaire dynamique automatique en page 2, de numéros de pages X/Y et être enregistré au format Modèle Word (.dotx) pour servir de matrice à toutes les équipes informatiques de Jarry.',
    raccourcisCles: [
      { touche: 'F9', action: 'Mettre à jour instantanément les champs et la table des matières sélectionnée', plateforme: 'windows' },
      { touche: 'Alt + Maj + P', action: 'Insérer automatiquement le numéro de page dynamique dans le pied de page', plateforme: 'windows' },
      { touche: 'Ctrl + F (onglet Titres)', action: 'Ouvrir le volet de navigation pour réorganiser les chapitres par glisser-déposer', plateforme: 'windows' },
      { touche: 'Maj + F3', action: 'Basculer la casse du texte sélectionné (Majuscules, Minuscules, Nom propre)', plateforme: 'windows' },
      { touche: 'Ctrl + Maj + S', action: 'Ouvrir la fenêtre flottante d\'application rapide des styles', plateforme: 'windows' }
    ],
    etapesDetaillees: [
      {
        numero: 1,
        titre: 'Importer le texte brut et poser l\'architecture en 4 pages',
        detail: 'Téléchargez KLF_Manuel_Procedure_Standard_BRUT.txt et collez son contenu dans un document Word vierge. Posez les 4 pages d\'emblée grâce à des sauts de page (Ctrl + Entrée) : Page 1 = Page de garde sobre (Titre, Référence SOP, Auteur, Date) ; Page 2 = Emplacement réservé pour la Table des matières ; Page 3 & 4 = Corps de procédure technique.',
        consigneTech: 'Ne commencez jamais à mettre en forme avant d\'avoir structuré l\'enchaînement de vos pages.',
        astuceDSI: 'Insérez un saut de page immédiatement après le titre du document pour isoler la couverture.'
      },
      {
        numero: 2,
        titre: 'Lier la liste multiniveau aux styles Titre 1 et Titre 2',
        detail: 'Pour que vos titres se numérotent automatiquement (1. INTRODUCTION, 1.1 Contexte), ne tapez aucun chiffre à la main ! Cliquez sur [Accueil] > [Groupe Paragraphe] > [Bouton Liste à plusieurs niveaux ▾] > choisissez la bibliothèque affichant « 1. Titre 1 / 1.1 Titre 2 ». Dès que vous appliquez le style Titre 1, Word numérote 1, 2, 3... Si vous appliquez Titre 2, il numérote 1.1, 1.2, 2.1... Si vous déplacez un chapitre, toute la numérotation se recalcule instantanément !',
        exempleCode: '[Onglet Accueil] > [Groupe Paragraphe] > [Liste à plusieurs niveaux ▾] > Sélectionner [1 Titre 1 / 1.1 Titre 2]',
        astuceDSI: 'Si vous insérez un nouveau chapitre entre le 1 et le 2, le 2 devient automatiquement 3 sans aucun risque d\'erreur humaine.'
      },
      {
        numero: 3,
        titre: 'Générer la table des matières automatique en 1 clic',
        detail: 'Placez votre curseur en haut de la Page 2. Allez dans [Références] > [Groupe Table des matières] > [Bouton Table des matières] > sélectionnez « Table automatique 1 ». En 1 seconde, Word scanne l\'intégralité de vos styles Titre 1 et Titre 2, extrait les intitulés, pose les taquets avec points de suite et associe les bons numéros de page !',
        exempleCode: '[Onglet Références] > [Table des matières] > [Table automatique 1]\nRaccourci de mise à jour : Clic sur la table + touche F9 > « Mettre à jour toute la table »',
        consigneTech: 'Interdiction formelle de taper des petits points (...) au clavier : c\'est le premier motif de sanction au TOSA Word et face au jury Titre Pro.'
      },
      {
        numero: 4,
        titre: 'Insérer le pied de page normé « Page X sur Y »',
        detail: 'Double-cliquez dans le bas de la Page 3 pour ouvrir la zone de pied de page. Allez dans [En-tête et pied de page] > [Numéro de page] > [Bas de page] > descendez jusqu\'à la catégorie « Page X sur Y » (Numéro gras 2). Word gère automatiquement le compteur dynamique. Pour aligner le logo KLF à gauche et la pagination à droite, utilisez un tableau invisible 1x2.',
        exempleCode: '[En-tête et pied de page] > [Numéro de page] > [Bas de page] > [Page X sur Y]',
        astuceDSI: 'Pour que le numéro n\'apparaisse pas sur la couverture, cochez simplement la case « Première page différente » dans le ruban d\'en-tête.'
      },
      {
        numero: 5,
        titre: 'Bonus Pro (+35 pts) : Enregistrer le chef-d\'œuvre en Modèle Word (.dotx)',
        detail: 'Pour que votre travail serve de matrice à toute la DSI de KLF : allez dans [Fichier] > [Enregistrer sous] > changez le type de fichier en « Modèle Word (*.dotx) ». Word vous redirige automatiquement dans votre dossier « Modèles Office personnalisés ». Nommez-le KLF_Gabarit_Procedure_DSI.dotx. Désormais, un simple double-clic dessus ouvrira un nouveau document vierge reprenant vos styles, votre logo et vos pieds de page sans jamais écraser le modèle original !',
        exempleCode: '[Fichier] > [Enregistrer sous] > Type : Modèle Word (*.dotx) > Nom : KLF_Gabarit_Procedure_DSI.dotx',
        consigneTech: 'La différence vitale : un .docx s\'écrase si on clique sur Enregistrer. Un .dotx génère toujours un "Document 1" protégé.',
        astuceDSI: 'Défi bonus : La création et le dépôt du fichier .dotx rapportent +35 points d\'expérience sur le leaderboard.'
      }
    ],
    piegesAEviter: [
      'Taper les points de suite du sommaire à la main avec la touche point (.....).',
      'Attribuer le style Titre 1 à un paragraphe entier de texte courant (le texte entier se retrouve aspiré dans le sommaire !).',
      'Oublier d\'actualiser la table des matières avec F9 avant d\'exporter en PDF.',
      'Enregistrer le gabarit en .docx standard au lieu du format modèle .dotx.'
    ],
    exerciceApplication: {
      enonce: `À partir du texte brut "KLF_Manuel_Procedure_Standard_BRUT.txt" téléchargé, construisez le manuel officiel DSI :

1. Structurez le document en 4 pages avec couverture et sommaire en page 2.
2. Appliquez la numérotation multiniveau liée aux styles Titre 1 et Titre 2.
3. Insérez la table des matières dynamique avec points de suite.
4. Insérez le pied de page Page X sur Y (première page différente).
5. Export et dépôt Drive obligatoire : Enregistrez le PDF officiel :
   • AAAA-MM-JJ_ManuelProcedure_Zebra_Prenom_NOM.pdf
   Déposez-le directement sur le Google Drive dans l'arborescence officielle :
   • 02_CASIERS_DES_APPRENANTS > Evaluations_Bureautique > Word-Docs
6. 🎁 Bonus DSI (+35 PTS) : Sauvegardez la trame au format Modèle Word d'entreprise :
   • KLF_Gabarit_Procedure_DSI.dotx
   et déposez-la aux côtés de votre PDF pour valider le bonus.`,
      criteresReussite: [
        'La table des matières dynamique se met à jour en 1 clic via F9 sans aucun point tapé à la main.',
        'La numérotation 1., 1.1, 1.2 est générée automatiquement par la liste multiniveaux liée aux styles.',
        'Le pied de page affiche dynamiquement Page X sur Y avec première page différente.',
        'Livrable obligatoire : Le document PDF officiel est déposé sur le Google Drive dans 02_CASIERS_DES_APPRENANTS > Evaluations_Bureautique > Word-Docs.',
        '🎁 Bonus DSI (+35 PTS) : Le fichier modèle d\'entreprise KLF_Gabarit_Procedure_DSI.dotx est également déposé dans le dossier.'
      ],
      solutionAttendue: 'Manuel DSI 4 pages (PDF obligatoire) avec sommaire dynamique actualisable, numérotation multiniveaux et pied de page Page X sur Y, complété du modèle réutilisable .dotx pour décrocher le bonus de +35 points.'
    },
    miniQuiz: [
      {
        question: 'Quelle est la méthode officielle pour mettre à jour instantanément une table des matières après avoir modifié des titres dans Word ?',
        options: [
          'Supprimer la table des matières et la retaper manuellement depuis le début.',
          'Changer la police de la table des matières dans l’onglet Accueil.',
          'Faire un clic droit sur la table puis « Couper / Coller ».',
          'Faire un clic droit sur la table et choisir « Mettre à jour les champs » (ou appuyer sur F9).'
        ],
        reponseCorrecte: 3,
        explication: 'La touche F9 (ou clic droit > Mettre à jour les champs) recalcule dynamiquement l\'arborescence des styles et actualise les numéros de page sans réinsérer la table.'
      },
      {
        question: 'Pourquoi est-il fortement recommandé d’enregistrer une trame officielle sous l’extension .dotx plutôt que .docx ?',
        options: [
          'Parce que le format .dotx est le seul qui autorise l’impression en couleur.',
          'Parce qu’un double-clic sur un fichier .dotx ouvre une copie vierge sans jamais écraser le fichier modèle d’origine.',
          'Parce que les fichiers .dotx sont automatiquement cryptés avec un mot de passe militaire.',
          'Parce que Google Docs refuse d’ouvrir les fichiers .docx standards.'
        ],
        reponseCorrecte: 1,
        explication: 'Le format .dotx (Document Template) est un modèle d\'entreprise : à chaque ouverture, il crée un nouveau document vierge prêt à être complété, sanctuarisant ainsi la matrice originale contre les écrasements accidentels.'
      },
      {
        question: 'Où se situe l’option permettant de réorganiser des chapitres entiers par simple glisser-déposer sans aucun copier-coller ?',
        options: [
          'Dans la corbeille de Windows.',
          'Dans le menu contextuel du correcteur d’orthographe.',
          'Dans le Volet de navigation (accessible via Ctrl + F ou l’onglet Affichage).',
          'Dans les options avancées d’impression du document.'
        ],
        reponseCorrecte: 2,
        explication: 'Dans le Volet de navigation (Ctrl + F > onglet Titres), l\'arborescence des styles Titre 1 et Titre 2 permet de glisser-déposer des sections entières : le titre et tout son contenu associé se déplacent d\'un bloc !'
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
          'Pour accélérer la vitesse de calcul du processeur.',
          'Pour masquer les chiffres confidentiels aux stagiaires.',
          'Pour exiger une correspondance exacte et empêcher le tableur de renvoyer une valeur approximative erronée.'
        ],
        reponseCorrecte: 3,
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
          '=SIERREUR(RECHERCHEV(...); "Non trouvé")',
          '=SI(ERREUR; ...)',
          '=EFFACER.ERREUR(RECHERCHEV(...))',
          '=RECHERCHEV(SIERREUR(...))'
        ],
        reponseCorrecte: 0,
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
