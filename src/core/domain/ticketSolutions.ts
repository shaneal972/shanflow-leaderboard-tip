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

