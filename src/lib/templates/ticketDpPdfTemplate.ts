import { TicketKLF, TicketResolution, Apprenant } from '@/types/tip';

export interface DpTemplateData {
  titreDp: string;
  contexteDp: string;
  outilsMobilises: string;
  reussiteReflexive: string;
  difficulteReflexive: string;
  enseignementReflexive: string;
}

export function getDpDetailsForTicket(ticketId: string): DpTemplateData {
  switch (ticketId) {
    case 'TCK-101':
      return {
        titreDp: 'Partage réseau sécurisé SMBv3, droits NTFS & politique de sauvegarde NAS (CCP 1)',
        contexteDp: "Entreprise Karukera Logistique & Fret (Jarry). Sécurisation et fiabilisation des flux de données comptables et douaniers suite à des corruptions d'accès concurrents et des risques de pertes de données sur le réseau local.",
        outilsMobilises: 'NAS Synology d’entreprise (RAID 5), protocole SMBv3 crypté, autorisations NTFS (ACL avancées), console Active Directory (groupes de sécurité), script de synchronisation automatisé.',
        reussiteReflexive: "Mise en œuvre d'une arborescence réseau partitionnée avec droits stricts en lecture/écriture empêchant tout écrasement accidentel et automatisation des sauvegardes journalières.",
        difficulteReflexive: "Analyser les verrous de fichiers (file locking) sous SMBv3 sans interrompre l'activité de facturation des déclarants en douane.",
        enseignementReflexive: "La gestion des droits d'accès au niveau NTFS et le cloisonnement par groupes de sécurité AD sont les fondations indispensables de l'intégrité des données en entreprise."
      };
    case 'TCK-102':
      return {
        titreDp: 'Déploiement, segmentation Wi-Fi industriel VLAN & maintien en condition opérationnelle (MCO) de terminaux mobiles (CCP 1)',
        contexteDp: "Plateforme logistique KLF Quai n°3 (Zone industrielle de Jarry). Renouvellement et mise en service du parc de terminaux durcis Zebra TC57 pour les caristes et opérateurs de transit maritime.",
        outilsMobilises: 'Terminaux durcis Zebra Android Enterprise, console MDM (Mobile Device Management), infrastructure Wi-Fi industrielle (SSID dédié, VLAN 30 Quai, roaming 802.11r), procédure d\'exploitation standardisée.',
        reussiteReflexive: "Configuration automatisée des profils réseau par MDM et rédaction d'une procédure visuelle de MCO réduisant de 65% les arrêts d'activité sur le quai d'expédition.",
        difficulteReflexive: "Diagnostiquer les pertes de connexion ponctuelles lors des transitions entre bornes Wi-Fi (roaming) dans les zones d'ombres causées par les structures métalliques des conteneurs.",
        enseignementReflexive: "En environnement industriel sévère, la configuration technique doit impérativement s'accompagner d'une procédure d'assistance claire et assimilable par les équipes de terrain."
      };
    case 'TCK-103':
      return {
        titreDp: 'Mise en service d\'une imprimante réseau multifonction, serveur d\'impression & sécurisation des flux (CCP 1)',
        contexteDp: "Service Ressources Humaines & Direction KLF (Jarry). Intégration d'un copieur multifonction réseau départemental haute cadence avec contrainte d'isolation réseau et d'impression sécurisée de documents confidentiels.",
        outilsMobilises: 'Copieur multifonction réseau, serveur d\'impression Windows Server 2022, pilote universel PCL6, réservation DHCP statique par adresse MAC, GPO Active Directory, file d’impression sécurisée par code PIN usager.',
        reussiteReflexive: "Déploiement centralisé de la file d'impression par stratégie de groupe (GPO) et verrouillage de la libération des travaux d'impression confidentiels par code PIN individuel.",
        difficulteReflexive: "Résoudre un conflit de protocole SNMP entre le serveur d'impression et l'équipement qui bloquait les remontées d'état des bacs papier.",
        enseignementReflexive: "La centralisation de la gestion des périphériques via un serveur d'impression simplifie la maintenance préventive et garantit la conformité RGPD sur les flux sensibles."
      };
    case 'TCK-104':
      return {
        titreDp: 'Sécurisation des flux de messagerie, filtrage DNS/SMTP (SPF, DKIM, DMARC) & neutralisation d\'usurpation (CCP 1)',
        contexteDp: "Pôle Finance & Direction Générale KLF. Détection et neutralisation d'une tentative d'escroquerie au faux ordre de virement maritime (24 500 €) usurpant l'identité d'un armateur international (CMA-CGM).",
        outilsMobilises: 'Analyseur d’en-têtes MIME RFC 5322, requêtes DNS avancées (TXT SPF, clé publique DKIM, alignement DMARC), pare-feu UTM d’entreprise, console Microsoft 365 Defender.',
        reussiteReflexive: "Mise en évidence technique de l'usurpation de domaine par discordance entre le champ From et le Return-Path réel, suivie du blocage immédiat de l'adresse IP émettrice sur le pare-feu.",
        difficulteReflexive: "Traduire l'analyse technique des en-têtes DNS/SMTP en consignes de sécurité compréhensibles et applicables immédiatement par le personnel non technique.",
        enseignementReflexive: "La sécurité de proximité repose sur le couplage d'un filtrage réseau rigoureux (protocoles d'authentification e-mail) et de la sensibilisation continue des collaborateurs."
      };
    case 'TCK-105':
    default:
      return {
        titreDp: 'Plan d\'adressage IPv4 statique, passerelle par défaut & diagnostic de connectivité réseau (CCP 1)',
        contexteDp: "Quai d'expédition KLF Logistique (Jarry). Arrêt critique de la chaîne logistique suite à la perte de connectivité de l'imprimante réseau d'étiquettes Zebra ZT410 consécutive à une coupure électrique générale.",
        outilsMobilises: 'Imprimante thermique Zebra ZT410, plan d’adressage IPv4 d\'entreprise, console DHCP (réservation de bail statique), console switch manageable (VLAN Quai), outils CLI (Ping, ARP, Tracert, IPConfig).',
        reussiteReflexive: "Identification immédiate de la bascule en adresse APIPA non routable (169.254.x.x), réattribution d'une IP fixe hors plage dynamique et validation complète de la route réseau (0% de perte de paquets).",
        difficulteReflexive: "Intervenir sous forte pression temporelle face aux camions en attente tout en appliquant une méthode d'investigation rigoureuse par couches du modèle OSI.",
        enseignementReflexive: "Tout équipement de production névralgique doit impérativement faire l'objet d'un adressage statique documenté dans le plan de câblage et hors de la portée des baux DHCP volatils."
      };
  }
}

/**
 * Génère le gabarit HTML A4 Portrait Gotenberg pour la fiche d'activité du DP.
 * Strict Single-Page A4 (Zéro débordement page 2).
 * Conforme au Cerfa DP du Ministère du Travail (Rubriques 1 à 5).
 */
export function generateTicketDpPdfHtml(
  ticket: TicketKLF,
  resolution: TicketResolution,
  student: Apprenant
): string {
  const details = getDpDetailsForTicket(ticket.id);

  const dateSoumission = resolution.soumis_le
    ? new Date(resolution.soumis_le).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const statutLibelle = resolution.statut === 'valide'
    ? 'Intervention validée & clôturée'
    : 'Intervention réalisée (En attente d’homologation)';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche DP • ${student.nom} ${student.prenom} • ${ticket.id}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 8.5pt;
      line-height: 1.25;
      color: #0F172A;
      background-color: #FFFFFF;
      -webkit-font-smoothing: antialiased;
    }

    /* En-tête officiel */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2px solid #0F172A;
      padding-bottom: 5px;
      margin-bottom: 7px;
    }
    .header-logo {
      font-size: 11pt;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #0F172A;
    }
    .header-sub {
      font-size: 7.5pt;
      color: #475569;
      margin-top: 1px;
    }
    .header-badge {
      text-align: right;
      vertical-align: top;
    }
    .header-badge span {
      display: inline-block;
      background: #0284C7;
      color: #FFFFFF;
      font-size: 7pt;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Titre du document */
    .doc-title {
      font-size: 11pt;
      font-weight: 800;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0F172A;
      margin: 4px 0 2px 0;
    }
    .doc-subtitle {
      font-size: 7.5pt;
      text-align: center;
      color: #64748B;
      margin-bottom: 7px;
    }

    /* Cartouche d'identification */
    .id-box {
      width: 100%;
      border: 1px solid #CBD5E1;
      border-radius: 4px;
      background: #F8FAFC;
      padding: 6px 10px;
      margin-bottom: 8px;
    }
    .id-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    .id-table td {
      padding: 2px 4px;
      vertical-align: middle;
    }
    .id-label {
      color: #64748B;
      font-weight: 600;
      width: 16%;
    }
    .id-val {
      color: #0F172A;
      font-weight: 700;
      width: 34%;
    }

    /* Rubriques officielles */
    .rubrique-card {
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      margin-bottom: 6px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .rubrique-header {
      background: #F1F5F9;
      border-bottom: 1px solid #E2E8F0;
      padding: 3px 8px;
      font-size: 8pt;
      font-weight: 800;
      color: #1E293B;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      display: flex;
      align-items: center;
    }
    .rubrique-num {
      display: inline-block;
      width: 15px;
      height: 15px;
      background: #0F172A;
      color: #FFFFFF;
      border-radius: 50%;
      text-align: center;
      line-height: 15px;
      font-size: 7pt;
      font-weight: bold;
      margin-right: 5px;
    }
    .rubrique-body {
      padding: 6px 8px;
      font-size: 8pt;
      line-height: 1.25;
      color: #334155;
    }

    /* Styles spécifiques de contenu */
    .highlight-title {
      font-size: 9pt;
      font-weight: 800;
      color: #0369A1;
      margin-bottom: 3px;
    }
    .tools-tag {
      display: inline-block;
      background: #E0F2FE;
      color: #0369A1;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7pt;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 3px;
      margin-top: 3px;
    }
    .code-block {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      border-radius: 3px;
      padding: 4px 6px;
      font-size: 7.5pt;
      color: #0F172A;
      margin: 3px 0;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Grille de réflexion Option A */
    .reflexive-grid {
      width: 100%;
      border-collapse: collapse;
      margin-top: 2px;
    }
    .reflexive-grid td {
      width: 33.33%;
      padding: 3px 5px;
      vertical-align: top;
      border: 1px solid #E2E8F0;
      background: #FAFAFA;
      font-size: 7.5pt;
    }
    .reflexive-title {
      font-weight: 800;
      font-size: 7pt;
      text-transform: uppercase;
      margin-bottom: 2px;
      display: block;
    }
    .reflexive-green { color: #047857; }
    .reflexive-amber { color: #B45309; }
    .reflexive-blue { color: #1D4ED8; }

    /* Footer officiel sans signature */
    .footer-note {
      margin-top: 6px;
      padding-top: 4px;
      border-top: 1px solid #E2E8F0;
      font-size: 6.8pt;
      color: #94A3B8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-note strong {
      color: #475569;
    }
  </style>
</head>
<body>

  <!-- EN-TÊTE OFFICIEL -->
  <table class="header-table">
    <tr>
      <td>
        <div class="header-logo">CFA FORE ALTERNANCE • PROMOTION TIP2</div>
        <div class="header-sub">Titre Professionnel : Technicien d'Intervention en Informatique (Niveau 4 • RNCP 37674)</div>
      </td>
      <td class="header-badge">
        <span>CCP 1 • Support & Réseau</span>
      </td>
    </tr>
  </table>

  <div class="doc-title">Fiche descriptive d'un exemple de pratique professionnelle</div>
  <div class="doc-subtitle">Support de préparation et d'entraînement pour le Dossier Professionnel (DP) • Ministère du Travail</div>

  <!-- CARTOUCHE D'IDENTIFICATION -->
  <div class="id-box">
    <table class="id-table">
      <tr>
        <td class="id-label">Candidat(e) :</td>
        <td class="id-val">${student.nom.toUpperCase()} ${student.prenom}</td>
        <td class="id-label">Réf. Incident :</td>
        <td class="id-val">${ticket.id} (${ticket.service})</td>
      </tr>
      <tr>
        <td class="id-label">Escouade :</td>
        <td class="id-val">${student.equipe}</td>
        <td class="id-label">Date d'action :</td>
        <td class="id-val">${dateSoumission}</td>
      </tr>
      <tr>
        <td class="id-label">Qualification :</td>
        <td class="id-val">${resolution.diagnostic_categorie.toUpperCase()} • URGENCE ${resolution.diagnostic_urgence}</td>
        <td class="id-label">Homologation :</td>
        <td class="id-val" style="color: #047857;">✓ ${statutLibelle}</td>
      </tr>
    </table>
  </div>

  <!-- 1. INTITULÉ DE L'ACTIVITÉ TYPE RETENUE POUR LE DP -->
  <div class="rubrique-card">
    <div class="rubrique-header">
      <span class="rubrique-num">1</span>
      Intitulé de l'exemple de pratique retenu pour le Dossier Professionnel (CCP 1)
    </div>
    <div class="rubrique-body">
      <div class="highlight-title">« ${details.titreDp} »</div>
      <div><strong>Compétences REAC mobilisées :</strong> Diagnostiquer un incident d'équipement numérique, rétablir la connectivité réseau, appliquer les consignes de sécurité DSI et tracer l'intervention dans le gestionnaire de tickets.</div>
    </div>
  </div>

  <!-- 2. CONTEXTE PROFESSIONNEL & BESOIN USAGER -->
  <div class="rubrique-card">
    <div class="rubrique-header">
      <span class="rubrique-num">2</span>
      Contexte professionnel, environnement technique & besoin usager
    </div>
    <div class="rubrique-body">
      <div style="margin-bottom: 3px;">${details.contexteDp}</div>
      <div style="font-size: 7.5pt; color: #475569;">
        <strong>Demandeur :</strong> ${ticket.demandeur} | <strong>Incident initial :</strong> ${ticket.titre}
      </div>
      <div>
        <span class="tools-tag">Moyens & Outils : ${details.outilsMobilises}</span>
      </div>
    </div>
  </div>

  <!-- 3. DÉMARCHE TECHNIQUE & PROCÉDURE APPLIQUÉE -->
  <div class="rubrique-card">
    <div class="rubrique-header">
      <span class="rubrique-num">3</span>
      Démarche technique appliquée & chronologie d'intervention (Rédigée par le candidat)
    </div>
    <div class="rubrique-body">
      <div class="code-block">${resolution.demarche_technique.replace(/\n/g, '<br>')}</div>
    </div>
  </div>

  <!-- 4. COMMUNICATION USAGER & DÉMARCHE DE SERVICE (ITIL) -->
  <div class="rubrique-card">
    <div class="rubrique-header">
      <span class="rubrique-num">4</span>
      Communication usager, posture de service & clôture d'incident
    </div>
    <div class="rubrique-body">
      <div style="font-style: italic; color: #1E293B; background: #F8FAFC; padding: 4px 6px; border-left: 3px solid #0284C7; font-size: 7.8pt;">
        « ${resolution.message_usager.replace(/\n/g, ' ')} »
      </div>
    </div>
  </div>

  <!-- 5. BILAN PERSONNEL & ANALYSE RÉFLEXIVE (OPTION A - CERFA DP RUBRIQUE 5) -->
  <div class="rubrique-card">
    <div class="rubrique-header">
      <span class="rubrique-num">5</span>
      Bilan personnel & analyse réflexive pour l'oral d'examen (Rubrique 5 officielle du Cerfa DP)
    </div>
    <div class="rubrique-body" style="padding: 4px 6px;">
      <table class="reflexive-grid">
        <tr>
          <td>
            <span class="reflexive-title reflexive-green">✓ Ce qui a été particulièrement réussi</span>
            <div>${details.reussiteReflexive}</div>
          </td>
          <td>
            <span class="reflexive-title reflexive-amber">⚠ Difficultés & contournement</span>
            <div>${details.difficulteReflexive}</div>
          </td>
          <td>
            <span class="reflexive-title reflexive-blue">💡 Enseignement pour ma pratique future</span>
            <div>${details.enseignementReflexive}</div>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- PIED DE PAGE RÉGLEMENTAIRE SANS VISA FORMATEUR -->
  <table style="width: 100%; font-size: 6.8pt; color: #64748B; border-top: 1px solid #CBD5E1; padding-top: 3px; margin-top: 4px;">
    <tr>
      <td>
        Document personnel du candidat • Support d'aide à la rédaction du Dossier Professionnel (DP).
      </td>
      <td style="text-align: right;">
        Plateforme KLF Support Services • Écosystème pédagogique FORE Alternance
      </td>
    </tr>
  </table>

</body>
</html>`;
}
