import { TicketKLF, TicketResolution, Apprenant } from '@/types/tip';

interface DpTemplateData {
  titreDp: string;
  contexteDp: string;
  outilsMobilises: string;
  reussiteReflexive: string;
  difficulteReflexive: string;
  enseignementReflexive: string;
}

function getDpDetailsForTicket(ticketId: string): DpTemplateData {
  switch (ticketId) {
    case 'TCK-101':
      return {
        titreDp: 'Partage réseau sécurisé & politique de sauvegarde de fichiers comptables (CCP 1)',
        contexteDp: "Entreprise KLF Logistique Caraïbes (Jarry). Blocage critique de la facturation douanière suite à l'altération de liaisons de fichiers et à des droits d'accès réseau non harmonisés sur le classeur de suivi des manifestes conteneurs.",
        outilsMobilises: 'NAS d’entreprise, partage SMB, autorisations NTFS, tableur Microsoft Excel / Microsoft 365, calculatrice fiscale locale (Octroi de mer 8.5% & TVA).',
        reussiteReflexive: "Identification rapide de l'anomalie de formule et préconisation d'un hébergement centralisé sécurisé prévenant toute désynchronisation entre les postes de travail.",
        difficulteReflexive: "Distinguer clairement le dysfonctionnement applicatif (erreur #N/A) des contraintes d'accès réseau pour vulgariser la solution auprès de la responsable comptable.",
        enseignementReflexive: "Les classeurs partagés multi-utilisateurs doivent impérativement reposer sur un stockage réseau dédié avec sauvegardes journalières automatisées."
      };
    case 'TCK-102':
      return {
        titreDp: 'Déploiement, segmentation Wi-Fi industriel & support utilisateurs de quai (CCP 1)',
        contexteDp: "Site logistique KLF Quai n°3 (Zone de Jarry). Renouvellement du parc de terminaux mobiles durcis Zebra TC57 pour les 8 caristes et nécessité d'un protocole d'assistance et de maintien en conditions opérationnelles.",
        outilsMobilises: 'Tablettes durcies Zebra Android, réseau sans-fil Wi-Fi industriel (SSID isolé / VLAN Quai), console MDM, procédure documentaire 1-page plastifiée.',
        reussiteReflexive: "Conception d'une fiche réflexe synthétique et visuelle immédiatement adoptée par les caristes, réduisant les appels d'urgence au support de plus de 60%.",
        difficulteReflexive: "Adapter le vocabulaire technique (cache applicatif, roaming Wi-Fi, redémarrage à chaud) à des opérateurs de quai en situation de manutention intensive.",
        enseignementReflexive: "La qualité de service d'un technicien support se mesure autant à son aisance relationnelle et rédactionnelle qu'à sa maîtrise technique du matériel."
      };
    case 'TCK-103':
      return {
        titreDp: 'Mise en service d\'une imprimante réseau départementale & traitement de flux RH (CCP 1)',
        contexteDp: "Service Ressources Humaines KLF (Site de Jarry). Préparation et édition en masse de 60 convocations médicales confidentielles avec contrainte de distribution sur plusieurs sites (Guadeloupe et Martinique).",
        outilsMobilises: 'Traitement de texte Word, source de données tabulaire normalisée, imprimante multifonction réseau, file d’impression sécurisée par code PIN.',
        reussiteReflexive: "Correction intégrale des décalages de fusion et verrouillage des formats de champs d'adresses assurant une édition sans aucune altération de mise en page.",
        difficulteReflexive: "Manipuler des données RH confidentielles tout en testant l'impression sur un bac partagé sans risquer d'exposer des informations privées.",
        enseignementReflexive: "L'automatisation bureautique nécessite une rigueur absolue sur la propreté de la base de données source et le respect du RGPD."
      };
    case 'TCK-104':
      return {
        titreDp: 'Sécurisation des flux de messagerie & filtrage DNS/SMTP contre le phishing (CCP 1)',
        contexteDp: "Direction Générale & Pôle Finance KLF. Tentative d'escroquerie au faux virement maritime (24 500 €) usurpant l'identité d'un armateur partenaire (CMA-CGM) par usurpation de nom de domaine.",
        outilsMobilises: 'Analyseur d’en-têtes MIME (RFC 5322), enregistrements DNS (TXT SPF, clé publique DKIM, politique DMARC), pare-feu d’entreprise UTM, relais SMTP sécurisé.',
        reussiteReflexive: "Preuve formelle de la falsification par l'analyse du Return-Path réel et neutralisation immédiate de la menace avant tout transfert financier.",
        difficulteReflexive: "Gérer l'urgence et le stress des interlocuteurs financiers tout en menant un audit technique posé et méthodique des en-têtes e-mail.",
        enseignementReflexive: "Le facteur humain reste la première vulnérabilité de sécurité : un technicien doit savoir alerter et former les utilisateurs avec calme et pédagogie."
      };
    case 'TCK-105':
    default:
      return {
        titreDp: 'Plan d\'adressage IP statique, passerelle et tests de connectivité réseau (CCP 1)',
        contexteDp: "Quai d'expédition KLF Logistique (Jarry). Perte totale de communication avec l'imprimante réseau d'étiquettes code-barres Zebra suite à une coupure électrique EDF, bloquant les expéditions maritimes.",
        outilsMobilises: 'Imprimante thermique Zebra ZT410, plan d’adressage IPv4 local, bail DHCP réservé / IP statique, invites de commandes (Ping, ARP, Tracert), switch manageable.',
        reussiteReflexive: "Diagnostic express de l'adresse APIPA (169.254.x.x) et reparamétrage d'un bail statique pérenne validé par 0% de perte sur les tests de connectivité.",
        difficulteReflexive: "Effectuer le diagnostic réseau dans l'environnement bruyant du quai et interagir avec l'interface compacte de l'imprimante sans écran complet.",
        enseignementReflexive: "Tout équipement périphérique névralgique en production logistique doit être documenté avec une adresse IP fixe hors de la plage DHCP dynamique."
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
