import {
  TicketKLF,
  TicketResolutionCategory,
  TicketUrgency,
} from '@/types/tip';

export interface TicketDiagnosticPoint {
  label: string;
  detail: string;
  code?: string;
}

export interface TicketScenarioSolution {
  ticketId: string;
  diagnosticBadge: string;
  diagnosticTitle: string;
  diagnosticPoints: TicketDiagnosticPoint[];
  dpExtensionTitle: string;
  dpExtensionDescription: string;
  expectedCategory: TicketResolutionCategory;
  expectedUrgency: TicketUrgency;
  expectedDemarche: string;
  expectedMessageUsager: string;
}

const SCENARIO_SOLUTIONS: Record<string, TicketScenarioSolution> = {
  'TCK-101': {
    ticketId: 'TCK-101',
    diagnosticBadge: 'Entrepôt Frigorifique • Quai n°1',
    diagnosticTitle:
      'Données techniques & éléments de diagnostic (Alain GOURGUE)',
    diagnosticPoints: [
      {
        label: '1. Erreur #REF! (colonne supprimée)',
        detail:
          'Restauration de la version saine J-1 via les clichés instantanés VSS (Shadow Copies) sur le NAS Synology, puis masquage préventif des colonnes au lieu de leur suppression.',
      },
      {
        label: '2. Erreur #DIV/0! (chambres en maintenance)',
        detail:
          'Encapsulation de la division par la capacité (C2 = 0) avec formatage Pourcentage (%) :',
        code: '=SIERREUR(B2/C2; 0)',
      },
      {
        label: '3. Alerte sanitaire chaîne du froid (-18°C)',
        detail:
          'En température négative, une valeur supérieure à -18°C (ex: -12°C) signale une rupture de froid :',
        code: '=SI(D2 > -18; "ALERTE RUPTURE FROID"; "CONFORME")',
      },
      {
        label: '4. Conflits d’accès réseau (lecteur Z:\\)',
        detail:
          'Migration vers le partage centralisé SMBv3 sur NAS et cloisonnement des permissions NTFS par groupe AD GG_Exploitation_Frigo :',
        code: '\\\\NAS-KLF\\Entrepot_Frigo',
      },
    ],
    dpExtensionTitle:
      'Partage réseau SMBv3, clichés VSS & droits NTFS Entrepôt Frigo (CCP 1)',
    dpExtensionDescription:
      "Pour votre DP, valorisez l'intervention d'infrastructure auprès d'Alain GOURGUE : restauration du classeur via les clichés instantanés VSS (Shadow Copies) sur le NAS Synology, migration vers un partage centralisé SMBv3 (\\\\NAS-KLF\\Entrepot_Frigo), gestion des permissions NTFS par groupes Active Directory (GG_Exploitation_Frigo) et automatisation de sauvegardes journalières.",
    expectedCategory: 'applicatif',
    expectedUrgency: 'P1',
    expectedDemarche:
      '1. Restauration immédiate du classeur Suivi_Chaine_Froid_Jarry.xlsx depuis les clichés instantanés VSS (Versions précédentes) du NAS Synology pour récupérer les formules détruites par #REF!.\n2. Sécurisation des calculs de taux de remplissage contre les capacités nulles (#DIV/0!) avec =SIERREUR(B2/C2; 0) au format Pourcentage.\n3. Mise en place de la formule d’alerte sanitaire sur la colonne température : =SI(D2 > -18; "ALERTE RUPTURE FROID"; "CONFORME").\n4. Migration du fichier sur le partage réseau SMBv3 \\\\NAS-KLF\\Entrepot_Frigo avec droits NTFS dédiés (groupe AD GG_Exploitation_Frigo : écriture responsables, lecture seule agents de quai) pour supprimer les conflits d’écriture simultanée.',
    expectedMessageUsager:
      "Bonjour Alain, votre classeur de suivi de la chaîne du froid est entièrement restauré et opérationnel pour l'inspection de 15h. Les erreurs #REF! et #DIV/0! ont été corrigées, l'alerte automatique au-dessus de -18°C est active et le fichier est désormais sécurisé sur \\\\NAS-KLF\\Entrepot_Frigo sans risque d'écrasement lors d'accès simultanés. Bien cordialement, Support DSI KLF.",
  },
  'TCK-102': {
    ticketId: 'TCK-102',
    diagnosticBadge: 'Quai & Entrepôts • Mobilité Zebra TC57',
    diagnosticTitle:
      'Données techniques & éléments de diagnostic (Sébastien LEBLANC)',
    diagnosticPoints: [
      {
        label: '1. Équipement cible',
        detail:
          '8 tablettes durcies Zebra TC57 (Android Enterprise / DataWedge) utilisées par les caristes sur le quai n°3.',
      },
      {
        label: '2. Infrastructure Wi-Fi dédiée',
        detail:
          'Rattachement au SSID logistique sur VLAN 30 Quai avec itinérance rapide (roaming 802.11r) entre les bornes AP.',
      },
      {
        label: '3. Fiche réflexe 1-page A4 plastifiée',
        detail:
          'Guide illustré grand format couvrant : allumage/déverrouillage, procédure de scan code-barres, vidage du cache applicatif en cas de freeze et redémarrage forcé (bouton Power maintenu 10 s), avec numéro d’urgence IT (Poste 404).',
      },
    ],
    dpExtensionTitle: 'Déploiement et segmentation Wi-Fi industriel (CCP 1)',
    dpExtensionDescription:
      "Valorisez devant le jury la couverture sans-fil de l'entrepôt : configuration d'un SSID dédié pour les tablettes Zebra, segmentation réseau via un VLAN Quai isolé, plage DHCP réservée et analyse du signal radio (roaming entre bornes AP pour éviter les coupures).",
    expectedCategory: 'materiel',
    expectedUrgency: 'P2',
    expectedDemarche:
      '1. Vérification des 8 tablettes durcies Zebra TC57 (profil Wi-Fi VLAN 30 Quai, roaming 802.11r actif et service de scan DataWedge opérationnel).\n2. Rédaction et mise en page d’une fiche réflexe synthétique 1-page A4 prête à plastifier avec captures d’écran annotées.\n3. Intégration des 4 procédures essentielles : allumage & connexion session cariste, prise de scan code-barres, vidage du cache applicatif (Paramètres > Applications > Stockage > Vider le cache) et redémarrage matériel forcé en cas de blocage.\n4. Ajout du contact d’astreinte support DSI KLF (Poste 404) en pied de fiche et test de validation terrain avec un cariste.',
    expectedMessageUsager:
      'Bonjour Sébastien, la fiche réflexe 1-page A4 illustrée pour les tablettes Zebra TC57 est prête pour plastification. Elle couvre pas à pas l’allumage, le scan, le vidage du cache et le redémarrage forcé, ainsi que notre ligne directe (Poste 404). La connexion sur le VLAN 30 Quai a également été vérifiée sur les terminaux. Bien cordialement, Support DSI KLF.',
  },
  'TCK-103': {
    ticketId: 'TCK-103',
    diagnosticBadge: 'Ressources Humaines • Publipostage Word',
    diagnosticTitle:
      'Données techniques & éléments de diagnostic (Élodie THEOPHILE)',
    diagnosticPoints: [
      {
        label: '1. Anomalie de mise en page',
        detail:
          'Suppression du saut de paragraphe parasite (¶) et des espaces superflus dans le bloc d’adresses provoquant le décalage vertical des prénoms.',
      },
      {
        label: '2. Verrouillage du format de date',
        detail:
          'Affichage des codes de champ (Alt + F9) et ajout du commutateur de formatage français :',
        code: '\\@ "dd/MM/yyyy"',
      },
      {
        label: '3. Impression confidentielle RH',
        detail:
          'Déploiement du copieur réseau départemental sécurisé par code PIN individuel (rétention d’impression RH) via GPO.',
      },
    ],
    dpExtensionTitle:
      "Mise en service d'une imprimante réseau départementale (CCP 1)",
    dpExtensionDescription:
      "Raccrochez ce publipostage à une épreuve d'infrastructure : raccordement RJ45 d'une imprimante multifonction, attribution d'une IP statique hors DHCP, configuration du pilote sur le serveur d'impression et déploiement automatisé par stratégie de groupe (GPO).",
    expectedCategory: 'applicatif',
    expectedUrgency: 'P2',
    expectedDemarche:
      '1. Ouverture du document maître Word avec affichage des marques de mise en forme (¶) pour diagnostiquer le bloc de fusion.\n2. Suppression du saut de paragraphe parasite et des retours chariot inutiles dans le bloc destinataire, puis vérification de la source Excel.\n3. Bascule des codes de champ (Alt + F9) pour ajouter le commutateur de date français \\@ "dd/MM/yyyy" afin d’éviter toute inversion mois/jour.\n4. Prévisualisation complète des 60 enregistrements (Jarry et Fort-de-France) et lancement de l’impression confidentielle sur le copieur réseau RH avec libération sécurisée par code PIN.',
    expectedMessageUsager:
      'Bonjour Élodie, le modèle de publipostage Word a été assaini (suppression du saut de paragraphe parasite et verrouillage du format de date jj/mm/aaaa). Les 60 convocations médicales s’affichent désormais sans aucun décalage et peuvent être envoyées vers le copieur sécurisé par votre code PIN RH. Bien cordialement, Support DSI KLF.',
  },
  'TCK-104': {
    ticketId: 'TCK-104',
    diagnosticBadge: 'Direction & Finance • Incident Cyber P1',
    diagnosticTitle:
      'Données techniques & éléments de diagnostic (Marc VINCENOT)',
    diagnosticPoints: [
      {
        label: '1. Usurpation d’identité (Domain Spoofing)',
        detail:
          'Expéditeur affiché compta@cma-cgm-caraibes.com mais Return-Path réel frauduleux :',
        code: 'Return-Path: billing-relay-proxy@malicious-node.xyz',
      },
      {
        label: '2. Origine réseau & réputation',
        detail:
          'Serveur émetteur suspect localisé hors périmètre maritime légitime (nœud de sortie Tor, Lituanie) :',
        code: 'IP : 185.220.101.4',
      },
      {
        label: '3. Contrôles cryptographiques DNS',
        detail: 'Triple échec d’authentification SMTP :',
        code: 'SPF: FAIL | DKIM: INVALID | DMARC: QUARANTINE',
      },
      {
        label: '4. Remédiation & confinement',
        detail:
          'Gel immédiat de tout virement (24 500 €), blocage de l’IP 185.220.101.4 et du domaine malveillant sur le pare-feu UTM / passerelle antispam, et diffusion d’une consigne de vigilance anti-phishing.',
      },
    ],
    dpExtensionTitle:
      'Sécurisation des flux de messagerie & filtrage DNS/SMTP (CCP 1)',
    dpExtensionDescription:
      "Pour valoriser la cyber en CCP 1 : diagnostic des protocoles de messagerie (relais SMTP, MX), inspection des enregistrements DNS (TXT SPF, clé publique DKIM, politique DMARC), analyse des en-têtes MIME bruts et paramétrage du filtrage antispam sur la passerelle de sécurité (UTM).",
    expectedCategory: 'systeme',
    expectedUrgency: 'P1',
    expectedDemarche:
      '1. Isolement immédiat du courriel suspect sans cliquer sur aucun lien ni télécharger de pièce jointe, et demande de gel immédiat du virement de 24 500 € auprès de la comptabilité.\n2. Extraction et analyse des en-têtes MIME bruts : détection d’une discordance entre l’adresse affichée (compta@cma-cgm-caraibes.com) et le Return-Path réel (billing-relay-proxy@malicious-node.xyz) émis depuis l’IP 185.220.101.4 (Lituanie / Tor Exit Node).\n3. Constat de l’échec complet des contrôles d’authenticité (SPF: FAIL, DKIM: INVALID, DMARC: QUARANTINE) confirmant une attaque par Domain Spoofing / fraude au faux fournisseur.\n4. Blocage de l’IP 185.220.101.4 et du domaine malicious-node.xyz sur le pare-feu UTM / passerelle mail, durcissement DMARC et diffusion d’une alerte de sensibilisation à l’ensemble des services.',
    expectedMessageUsager:
      "Bonjour Marc, l'analyse des en-têtes MIME confirme une tentative d'escroquerie par usurpation de domaine (SPF: FAIL, DKIM: INVALID, Return-Path malicious-node.xyz via 185.220.101.4). Aucun virement n'a été exécuté, l'IP et le domaine expéditeur sont bloqués sur notre pare-feu UTM et une consigne de vigilance anti-phishing vient d'être diffusée à tous les collaborateurs. Bien cordialement, Support DSI KLF.",
  },
  'TCK-105': {
    ticketId: 'TCK-105',
    diagnosticBadge: 'Expéditions & Logistique • Réseau Quai Jarry',
    diagnosticTitle:
      'Données techniques & éléments de diagnostic (Sébastien LEBLANC)',
    diagnosticPoints: [
      {
        label: '1. Symptôme après coupure EDF',
        detail:
          'L’imprimante thermique Zebra ZT410 a perdu son bail et basculé en adresse APIPA non routable :',
        code: '169.254.12.88',
      },
      {
        label: '2. Réattribution IP statique',
        detail:
          'Configuration fixe hors plage dynamique DHCP avec masque /24 et passerelle cœur Jarry :',
        code: 'IP : 192.168.10.45 /24 | Passerelle : 192.168.10.1',
      },
      {
        label: '3. Pérennisation DHCP & test connectivité',
        detail:
          'Création d’une réservation DHCP liée à l’adresse MAC de la Zebra ZT410 et validation par requête ICMP :',
        code: 'ping 192.168.10.45 -n 4 -> 0% de perte',
      },
    ],
    dpExtensionTitle:
      "Plan d'adressage IP statique & diagnostic de connectivité réseau (CCP 1)",
    dpExtensionDescription:
      "L'activité réseau par excellence pour votre DP : analyse du plan d'adressage IP local, exclusion de plage DHCP et réservation par adresse MAC, configuration statique de l'imprimante (IP, masque /24, passerelle par défaut), tests de connectivité (Ping, résolution ARP) et validation du port sur le switch (VLAN Quai).",
    expectedCategory: 'reseau',
    expectedUrgency: 'P2',
    expectedDemarche:
      '1. Diagnostic physique et réseau sur l’imprimante Zebra ZT410 du quai d’expédition : vérification du lien RJ45 sur le switch (VLAN Quai) et relevé sur l’écran LCD confirmant une bascule en adresse APIPA 169.254.12.88 suite à la micro-coupure EDF.\n2. Paramétrage d’une adresse IP statique pérenne hors plage dynamique DHCP : IP 192.168.10.45, masque 255.255.255.0 (/24) et passerelle par défaut 192.168.10.1.\n3. Création d’une réservation DHCP associée à l’adresse MAC de la Zebra ZT410 sur le serveur DHCP pour prévenir tout conflit IP futur.\n4. Validation de bout en bout via ping 192.168.10.45 -n 4 (0% de perte) et édition réussie d’une étiquette code-barres test depuis le poste expéditions.',
    expectedMessageUsager:
      'Bonjour Sébastien, l’imprimante thermique Zebra ZT410 est de nouveau opérationnelle sur l’adresse 192.168.10.45. Elle était passée en adresse APIPA (169.254.12.88) après la coupure EDF ; j’ai fixé son IP en statique avec réservation MAC pour éviter que l’incident ne se reproduise et validé l’impression d’une étiquette test. Bien cordialement, Support DSI KLF.',
  },
  'TCK-106': {
    ticketId: 'TCK-106',
    diagnosticBadge: 'Facturation & Douane • Excel + Lecteur SMB Y:\\',
    diagnosticTitle:
      'Données techniques & éléments de diagnostic (Corinne BÉVILLE)',
    diagnosticPoints: [
      {
        label: '1. Erreurs #N/A sur RECHERCHEV',
        detail:
          'Nettoyage des espaces invisibles dans les codes conteneurs avec SUPPRESPACE et encapsulation anti-erreur SIERREUR :',
        code: '=SIERREUR(RECHERCHEV(SUPPRESPACE(A4); Grilles!$A$2:$D$50; 3; FAUX); "Code inconnu")',
      },
      {
        label: '2. Décalage TVA 8,5 % & Octroi de mer',
        detail:
          'Verrouillage des cellules de taux ($H$2 TVA Guadeloupe 8,5 % et $I$2 Octroi de mer) par la touche F4 (références absolues $) avant recopie vers le bas :',
        code: '=D4*$H$2  |  =D4*$I$2',
      },
      {
        label: '3. Diagnostic réseau DNS & SMB',
        detail:
          'Test de joignabilité du serveur de tarifs (ping + résolution FQDN) puis contrôle du montage SMB :',
        code: 'nslookup srv-klf-tarifs.klf.local && ping 192.168.20.250',
      },
      {
        label: '4. Reconnexion persistante lecteur Y:\\',
        detail:
          'Purge de la session réseau bloquée et remappage persistant du partage douanier en invite de commandes :',
        code: 'net use Y: /delete && net use Y: \\\\192.168.20.250\\Douane /persistent:yes',
      },
    ],
    dpExtensionTitle:
      'Modélisation Excel fiable (RECHERCHEV / F4) & restauration de partage réseau SMB (CCP 1 & CCP 3)',
    dpExtensionDescription:
      "Valorisez devant le jury le double volet bureautique et réseau : assainissement des formules Excel (SUPPRESPACE, SIERREUR, références absolues $ pour la TVA 8,5 % et l'Octroi de mer) couplé au diagnostic DNS (nslookup), à la vérification IP (ping) et au remappage persistant d'un lecteur réseau SMB (net use /persistent:yes) lié aux liaisons externes du classeur.",
    expectedCategory: 'applicatif',
    expectedUrgency: 'P1',
    expectedDemarche:
      '1. Diagnostic réseau du lecteur Y:\\ en erreur : exécution de nslookup srv-klf-tarifs.klf.local et ping 192.168.20.250, puis purge et reconnexion persistante du partage SMB via net use Y: /delete suivi de net use Y: \\\\192.168.20.250\\Douane /persistent:yes.\n2. Actualisation des liaisons externes dans Excel (Données > Modifier les liens d’accès) après rétablissement du lecteur Y:\\.\n3. Éradication des erreurs #N/A dans RECHERCHEV en nettoyant les espaces parasites et en sécurisant le renvoi : =SIERREUR(RECHERCHEV(SUPPRESPACE(A4); Grilles!$A$2:$D$50; 3; FAUX); "Code inconnu").\n4. Verrouillage des cellules de taux TVA Guadeloupe 8,5 % ($H$2) et Octroi de mer ($I$2) avec la touche F4 ($), étirement complet de la colonne et vérification des totaux TTC avant dédouanement.',
    expectedMessageUsager:
      'Bonjour Corinne, votre lecteur réseau Y:\\ (\\\\srv-klf-tarifs.klf.local\\Douane) a été rétabli de façon persistante et vos liaisons Excel sont à jour. J’ai également corrigé les formules RECHERCHEV (#N/A) avec SUPPRESPACE/SIERREUR et bloqué les taux de TVA 8,5 % et d’Octroi de mer en référence absolue ($) pour éviter tout décalage lors de la recopie. Vous pouvez finaliser la facturation douanière. Bien cordialement, Support DSI KLF.',
  },
  'TCK-107': {
    ticketId: 'TCK-107',
    diagnosticBadge: 'Coordination Maritime • Outlook + DNS Autodiscover',
    diagnosticTitle:
      'Données techniques & éléments de diagnostic (Jean-Marc BÉLÉNUS)',
    diagnosticPoints: [
      {
        label: '1. Diagnostic DNS & ports messagerie',
        detail:
          'Rétablissement du serveur DNS interne KLF (192.168.10.10) sur la carte réseau, purge du cache et test Autodiscover (HTTPS 443 / SMTPS 587) :',
        code: 'ipconfig /flushdns && nslookup autodiscover.klf.local',
      },
      {
        label: '2. Reprise mode connecté & cache .ost',
        detail:
          'Désactivation de « Travailler hors connexion » (onglet Envoyer/Recevoir) et vérification/réparation du fichier local .ost via SCANPST.EXE ou recréation du profil Mail.',
      },
      {
        label: '3. Calendrier partagé Planning_Quais_Jarry',
        detail:
          'Rattachement du calendrier partagé d’équipe (Ajouter un calendrier > À partir du carnet d’adresses) et contrôle des droits « Peut modifier ».',
      },
      {
        label: '4. Règle serveur & signature KLF',
        detail:
          'Création de la règle de tri automatique sur l’objet [AVIS-ARRIVEE] vers le dossier « Urgences Port » et application de la signature HTML officielle KLF.',
      },
    ],
    dpExtensionTitle:
      'Dépannage client Outlook (.ost), DNS Autodiscover & délégation d’agenda (CCP 1 & CCP 3)',
    dpExtensionDescription:
      "Mettez en avant votre démarche ITIL complète : identification d'une cause réseau sous-jacente (DNS externe bloquant la résolution autodiscover.klf.local et les flux M365/Exchange), remise en ligne d'Outlook, contrôle d'intégrité du cache local .ost (SCANPST.EXE) et configuration collaborative (agenda partagé et règle côté serveur).",
    expectedCategory: 'applicatif',
    expectedUrgency: 'P1',
    expectedDemarche:
      '1. Diagnostic de connectivité réseau : constat d’un serveur DNS externe erroné sur la carte réseau bloquant Outlook. Réattribution du DNS interne KLF (192.168.10.10), vidage du cache avec ipconfig /flushdns et validation de nslookup autodiscover.klf.local (ports HTTPS 443 et SMTPS 587 joignables).\n2. Sortie du mode « Travailler hors connexion » dans Outlook (onglet Envoyer/Recevoir), vérification d’intégrité du cache local .ost via SCANPST.EXE et libération des e-mails coincés dans la Boîte d’envoi.\n3. Réattachement du calendrier partagé Planning_Quais_Jarry avec vérification des droits d’édition pour les créneaux camions.\n4. Paramétrage d’une règle côté serveur acheminant tout message contenant [AVIS-ARRIVEE] vers le dossier « Urgences Port » et déploiement de la signature HTML KLF.',
    expectedMessageUsager:
      'Bonjour Jean-Marc, votre messagerie Outlook est de nouveau connectée et vos messages en attente ont bien été expédiés : l’incident venait d’un paramétrage DNS erroné sur votre carte réseau. Le calendrier partagé Planning_Quais_Jarry, la règle de classement [AVIS-ARRIVEE] vers « Urgences Port » et votre signature KLF sont opérationnels. Bien cordialement, Support DSI KLF.',
  },
  'TCK-108': {
    ticketId: 'TCK-108',
    diagnosticBadge: 'Qualité, HSE & Douane • Word + Verrou SMB NAS',
    diagnosticTitle:
      'Données techniques & éléments de diagnostic (Nadia KANCEL)',
    diagnosticPoints: [
      {
        label: '1. Fermeture de session SMB fantôme',
        detail:
          'Déverrouillage du fichier sur le serveur de fichiers via la console Dossiers partagés (Fichiers ouverts) et suppression du fichier temporaire caché :',
        code: 'fsmgmt.msc  ->  supprimer ~$Manuel_HSE_Portuaire_2026.docx',
      },
      {
        label: '2. Assainissement marques ¶ & sauts',
        detail:
          'Affichage des caractères non imprimables (Ctrl + Maj + 8), suppression des 15 retours Entrée vides et remplacement par des sauts de page (Ctrl + Entrée).',
      },
      {
        label: '3. Styles hiérarchiques & sommaire',
        detail:
          'Application des styles Titre 1 / Titre 2 et actualisation de la Table des matières (Références > Mettre à jour toute la table).',
      },
      {
        label: '4. Saut de section Paysage (page 4)',
        detail:
          'Encadrement de la page 4 par deux sauts de section (Page suivante) pour isoler l’orientation Paysage et activation de « Répéter la ligne d’en-tête » sur le tableau.',
      },
    ],
    dpExtensionTitle:
      'Gestion des verrous réseau SMB (fsmgmt.msc) & structuration documentaire Word (CCP 1 & CCP 3)',
    dpExtensionDescription:
      "Démontrez au jury comment résoudre un blocage collaboratif sur NAS : diagnostic d'un verrou SMB orphelin laissé par un arrêt brutal (console fsmgmt.msc + fichier verrou ~$), suivi d'une remise aux normes documentaires (styles hiérarchiques, sommaire dynamique et sauts de section mixtes Portrait/Paysage).",
    expectedCategory: 'applicatif',
    expectedUrgency: 'P2',
    expectedDemarche:
      '1. Déverrouillage réseau sur \\\\NAS-KLF\\Qualite : ouverture de fsmgmt.msc (Dossiers partagés > Fichiers ouverts) pour fermer la session SMB fantôme de Nadia KANCEL, puis suppression du fichier verrou caché ~$Manuel_HSE_Portuaire_2026.docx.\n2. Affichage des marques de mise en forme (¶ via Ctrl + Maj + 8) dans Word, suppression des retours chariot superflus et insertion de vrais sauts de page (Ctrl + Entrée).\n3. Normalisation des titres via les styles Titre 1 et Titre 2, puis génération et mise à jour complète de la Table des matières automatique.\n4. Insertion de deux sauts de section (Page suivante) avant et après le grand tableau de la page 4 pour passer uniquement cette page en orientation Paysage et activer la répétition des en-têtes du tableau.',
    expectedMessageUsager:
      'Bonjour Nadia, le verrou réseau qui bloquait votre rapport en lecture seule suite au plantage de votre PC a été levé sur le NAS. J’ai également assaini la mise en page (suppression des retours Entrée parasites, sommaire automatique mis à jour) et passé la page 4 du grand tableau en format Paysage grâce aux sauts de section. Vous pouvez exporter en PDF pour la capitainerie. Bien cordialement, Support DSI KLF.',
  },
  'TCK-109': {
    ticketId: 'TCK-109',
    diagnosticBadge: 'Logistique Inter-Îles • SharePoint / OneDrive + Proxy',
    diagnosticTitle:
      'Données techniques & éléments de diagnostic (Stéphane ZÉPHIR)',
    diagnosticPoints: [
      {
        label: '1. Réseau : Proxy obsolète & reset agent',
        detail:
          'Désactivation du proxy manuel erroné dans inetcpl.cpl bloquant *.sharepoint.com (code 0x8004de40), test nslookup et réinitialisation de l’agent :',
        code: '%localappdata%\\Microsoft\\OneDrive\\onedrive.exe /reset',
      },
      {
        label: '2. Restauration historique de versions',
        detail:
          'Restauration de la version saine de 08h00 depuis SharePoint / Excel (Fichier > Informations > Historique des versions) sans perte du journal d’audit.',
      },
      {
        label: '3. Correction des 3 fichiers bloqués',
        detail:
          'Renommage des fichiers contenant des caractères interdits (* : ? / \\) et raccourcissement des sous-dossiers dépassant 255 caractères.',
      },
      {
        label: '4. Partage externe sécurisé RGPD',
        detail:
          'Remplacement du lien public par un partage « Personnes spécifiques » limité au transitaire avec vérification par code OTP et date d’expiration.',
      },
    ],
    dpExtensionTitle:
      'Synchronisation hybride OneDrive/SharePoint, diagnostic Proxy/HTTPS & gouvernance RGPD (CCP 1 & CCP 3)',
    dpExtensionDescription:
      "Illustrez la dimension Cloud hybride du nouveau REAC TIP : diagnostic d'erreur réseau 0x8004de40 (proxy HTTP obsolète bloquant TLS/HTTPS vers Microsoft 365 et réinitialisation du démon onedrive.exe /reset), restauration collaborative par historique de versions et sécurisation RGPD des liens externes.",
    expectedCategory: 'applicatif',
    expectedUrgency: 'P2',
    expectedDemarche:
      '1. Résolution de l’erreur réseau 0x8004de40 sur le poste : désactivation du serveur proxy manuel obsolète dans inetcpl.cpl (Options Internet > Connexions > Paramètres réseau), test nslookup et relance propre de la synchronisation via onedrive.exe /reset.\n2. Restauration immédiate de l’onglet écrasé via l’Historique des versions SharePoint (version de 08h00 restaurée avant la modification du stagiaire).\n3. Traitement des 3 fichiers en erreur de synchronisation : suppression des caractères interdits (*, :, ?) et réduction de la longueur de chemin sous la limite de 255 caractères.\n4. Configuration du partage externe vers le transitaire en mode « Personnes spécifiques » (authentification par code OTP par e-mail et expiration automatique à 15 jours, conformément au RGPD).',
    expectedMessageUsager:
      'Bonjour Stéphane, l’onglet des expéditions a été restauré à son état de 08h00 grâce à l’historique de versions SharePoint. La croix rouge OneDrive venait d’un ancien proxy réseau bloquant la connexion sécurisée et de 3 noms de fichiers contenant des caractères non autorisés : tout est resynchronisé. Le lien pour votre transitaire est configuré en accès nominatif sécurisé avec expiration automatique. Bien cordialement, Support DSI KLF.',
  },
  'TCK-110': {
    ticketId: 'TCK-110',
    diagnosticBadge: 'Contrôle de Gestion • CSV UTF-8 + TCD + Pare-feu SMB',
    diagnosticTitle:
      'Données techniques & éléments de diagnostic (Valérie LÉOTIN)',
    diagnosticPoints: [
      {
        label: '1. Réseau : Profil Public bloquant TCP 445',
        detail:
          'Bascule de l’interface Ethernet du profil « Public » vers « Privé / Domaine » pour autoriser le port SMB 445 dans le pare-feu Windows et test UNC :',
        code: 'Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private',
      },
      {
        label: '2. Test de joignabilité serveur ERP',
        detail:
          'Vérification de la couche IP avant montage du dossier réseau :',
        code: 'ping 192.168.10.80 -n 4 && dir \\\\192.168.10.80\\Exports_ERP',
      },
      {
        label: '3. Import CSV UTF-8 & typage monétaire',
        detail:
          'Importation via Données > À partir d’un fichier texte/CSV (encodage 65001 Unicode UTF-8, délimiteur « ; ») et conversion des décimales point en virgule.',
      },
      {
        label: '4. Tableau Croisé Dynamique & PowerPoint',
        detail:
          'Création du TCD (CA HT et tonnage par quai et département 971/972), ajout d’un segment de filtre et collage lié du graphique dans PowerPoint.',
      },
    ],
    dpExtensionTitle:
      'Importation de données ERP (UTF-8 / TCD) & déblocage pare-feu Windows SMB port 445 (CCP 1 & CCP 3)',
    dpExtensionDescription:
      "Mettez en valeur l'articulation entre exploitation de données décisionnelles (Power Query / import CSV encodé 65001 UTF-8, TCD, segments et liaison dynamique PowerPoint) et sécurité réseau poste client (diagnostic d'un profil réseau Windows passé en Public qui filtrait le port TCP 445 SMB).",
    expectedCategory: 'applicatif',
    expectedUrgency: 'P2',
    expectedDemarche:
      '1. Diagnostic réseau sur le poste Ethernet : constat que la carte réseau a basculé en profil « Public » après rebranchement, activant le blocage du port TCP 445 (SMB) dans le pare-feu Windows Defender. Bascule en profil Privé/Domaine (Set-NetConnectionProfile) et validation par ping 192.168.10.80 et accès à \\\\192.168.10.80\\Exports_ERP.\n2. Importation propre de Tonnage_Quais_2026.csv dans Excel via Données > À partir d’un fichier texte/CSV en sélectionnant l’encodage 65001 : Unicode (UTF-8) et le séparateur Point-virgule (;).\n3. Conversion des séparateurs décimaux (point vers virgule) pour typer les montants HT en format numérique monétaire €.\n4. Création du Tableau Croisé Dynamique par quai et par département (971/972) avec un segment de filtre et collage du graphique croisé dynamique lié dans la présentation PowerPoint.',
    expectedMessageUsager:
      'Bonjour Valérie, l’accès au dossier réseau \\\\192.168.10.80\\Exports_ERP est rétabli : Windows avait classé votre câble rebranché en réseau « Public », ce qui bloquait le partage de fichiers dans le pare-feu. Votre export CSV a été réimporté en UTF-8 avec toutes les colonnes et montants HT exploitables, et votre Tableau Croisé Dynamique est lié à votre présentation PowerPoint pour 14h. Bien cordialement, Support DSI KLF.',
  },
};

export function getTicketScenarioSolution(
  ticket: Pick<TicketKLF, 'id' | 'titre' | 'demandeur' | 'service' | 'urgence'>
): TicketScenarioSolution {
  const existing = SCENARIO_SOLUTIONS[ticket.id];
  if (existing) {
    return existing;
  }

  return {
    ticketId: ticket.id,
    diagnosticBadge: `${ticket.service} • Scénario personnalisé`,
    diagnosticTitle: `Éléments de diagnostic DSI (${ticket.demandeur})`,
    diagnosticPoints: [
      {
        label: '1. Qualification initiale',
        detail: `Analyser l'incident "${ticket.titre}" déclaré par ${ticket.demandeur} (${ticket.service}) avec priorité ${ticket.urgence}.`,
      },
      {
        label: '2. Vérification & remédiation',
        detail:
          "Reproduire l'anomalie, isoler la cause racine (poste, applicatif ou réseau) et appliquer le correctif conforme aux standards DSI KLF.",
      },
      {
        label: '3. Recette utilisateur',
        detail:
          "Valider le bon fonctionnement en conditions réelles avec l'usager avant la clôture du ticket.",
      },
    ],
    dpExtensionTitle: 'Diagnostic de connectivité et configuration réseau (CCP 1)',
    dpExtensionDescription:
      "Mettez en avant le plan d'adressage IP statique, le paramétrage de la passerelle par défaut et les tests de connectivité (Ping, Traceroute, DNS) pour prouver au jury votre maîtrise des flux réseau.",
    expectedCategory: 'systeme',
    expectedUrgency: ticket.urgence || 'P2',
    expectedDemarche: `1. Prise en charge du ticket ${ticket.id} signalé par ${ticket.demandeur} (${ticket.service}).\n2. Diagnostic méthodique de l'anomalie "${ticket.titre}" et identification de la cause racine.\n3. Application du correctif technique et vérification de non-régression en environnement de production KLF.`,
    expectedMessageUsager: `Bonjour ${ticket.demandeur}, votre incident (${ticket.id}) a bien été analysé et résolu par le support DSI. Vous pouvez reprendre votre activité normalement ; n'hésitez pas à nous solliciter en cas de besoin. Bien cordialement, Support DSI KLF.`,
  };
}

