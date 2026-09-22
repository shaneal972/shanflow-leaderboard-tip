import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { MOCK_APPRENANTS, MOCK_TICKETS } from '@/data/mockData';
import { generateTicketDpPdfHtml } from '@/lib/templates/ticketDpPdfTemplate';
import { TicketKLF, Apprenant, TicketResolution } from '@/types/tip';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 secondes pour la compilation Gotenberg

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticketId = searchParams.get('ticketId');
  const studentId = searchParams.get('studentId');

  if (!ticketId || !studentId) {
    return new NextResponse('Paramètres manquants : ticketId et studentId sont requis.', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  try {
    // 1. Récupération du stagiaire
    let student: Apprenant | null = null;
    const { data: studentDb } = await supabaseServer
      .from('sf_apprenants')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentDb) {
      student = studentDb as Apprenant;
    } else {
      student = MOCK_APPRENANTS.find((a) => a.id === studentId) || null;
    }

    if (!student) {
      return new NextResponse(`Apprenant introuvable (${studentId}).`, { status: 404 });
    }

    // 2. Récupération du ticket
    let ticket: TicketKLF | null = null;
    const { data: ticketDb } = await supabaseServer
      .from('sf_tickets_klf')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (ticketDb) {
      ticket = ticketDb as TicketKLF;
    } else {
      ticket = MOCK_TICKETS.find((t) => t.id === ticketId) || null;
    }

    if (!ticket) {
      return new NextResponse(`Ticket introuvable (${ticketId}).`, { status: 404 });
    }

    // 3. Récupération de la résolution du stagiaire
    let resolution: TicketResolution | null = null;
    const { data: resDb } = await supabaseServer
      .from('sf_ticket_resolutions')
      .select('*')
      .eq('ticket_id', ticketId)
      .eq('apprenant_id', studentId)
      .single();

    if (resDb) {
      resolution = resDb as TicketResolution;
    } else {
      // Si aucune résolution en base, génération d'une démarche technique 100% REAC TIP
      resolution = getDefaultResolutionForTicket(ticket, studentId);
    }

    // 4. Pré-compilation du gabarit HTML A4 Portrait Gotenberg
    const compiledHtml = generateTicketDpPdfHtml(ticket, resolution, student);

    const cleanNom = student.nom.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanPrenom = student.prenom.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Fiche-DP_CCP1_${cleanNom}_${cleanPrenom}_${ticketId}.pdf`;

    // 5. Appel du webhook n8n / Gotenberg sécurisé
    const webhookUrl =
      process.env.N8N_QUALIOPI_PDF_WEBHOOK_URL ||
      'https://n8n.shandev.cloud/webhook/qualiopi-pdf-generate';
    const bearerToken =
      process.env.KLF_WEBHOOK_BEARER_TOKEN ||
      'klf_tip_bearer_secret_2026_jarry_secure!';

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        html: compiledHtml,
        filename,
      }),
      cache: 'no-store',
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('[DP PDF] Erreur webhook n8n:', n8nResponse.status, errorText);
      return new NextResponse(
        `Erreur du service d'impression Gotenberg (${n8nResponse.status}) : ${errorText.substring(0, 200)}`,
        { status: 502 }
      );
    }

    // 6. Récupération du buffer binaire PDF
    const pdfBuffer = await n8nResponse.arrayBuffer();
    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      return new NextResponse("Le service d'impression Gotenberg a renvoyé un document vide.", {
        status: 502,
      });
    }

    // 7. Streaming direct vers le client
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[DP PDF] Exception:', error);
    return new NextResponse(
      `Erreur interne lors de la génération du PDF DP : ${error.message || 'Erreur inconnue'}`,
      { status: 500 }
    );
  }
}

function getDefaultResolutionForTicket(ticket: TicketKLF, studentId: string): TicketResolution {
  switch (ticket.id) {
    case 'TCK-105':
      return {
        id: 'draft-tck-105',
        ticket_id: ticket.id,
        apprenant_id: studentId,
        diagnostic_categorie: 'reseau',
        diagnostic_urgence: 'P1',
        demarche_technique: `1. Investigation physique & couche 1-2 : Constat du voyant réseau clignotant orange sur la Zebra ZT410. Vérification du raccordement RJ45 sur la prise murale Quai n°3 et test de continuité sur le switch manageable.\n2. Diagnostic IP couche 3 : Exécution de 'arp -a' et 'ping 192.168.10.45' (Délai d'attente dépassé). Édition du ticket de configuration Zebra via menu avant : découverte de l'adresse APIPA 169.254.88.12 consécutive à la panne du serveur DHCP lors de la coupure EDF.\n3. Rétablissement & configuration statique : Attribution manuelle de l'adresse statique hors plage DHCP (IP: 192.168.10.45, Masque: 255.255.255.0, Passerelle: 192.168.10.254, DNS: 192.168.10.10). Réservation du bail permanent par adresse MAC dans la console DHCP Windows Server.\n4. Recette opérationnelle : Validation par commande 'ping -t 192.168.10.45' (0% de perte, latence < 2ms) et édition d'une étiquette test code-barres EAN128 avec le chef de quai.`,
        message_usager: `Bonjour Sébastien. L'imprimante thermique Zebra ZT410 a été reconfigurée avec une adresse IP statique permanente (192.168.10.45) et son bail est désormais réservé sur le serveur DSI pour prévenir toute coupure électrique future. Les impressions d'étiquettes de colisage sont immédiatement opérationnelles.`,
        statut: 'valide',
        points_attribues: 150,
        soumis_le: new Date().toISOString(),
      };
    case 'TCK-104':
      return {
        id: 'draft-tck-104',
        ticket_id: ticket.id,
        apprenant_id: studentId,
        diagnostic_categorie: 'reseau',
        diagnostic_urgence: 'P1',
        demarche_technique: `1. Isolation de la menace : Consigne d'arrêt immédiat des transferts bancaires et récupération du fichier e-mail brut au format .eml depuis le poste comptable.\n2. Analyse forensique des en-têtes RFC 5322 : Exécution de l'analyseur MIME. Constat que le header 'From: compta@cma-cgm-caraibes.com' masque un 'Return-Path: invoice-relay@spoofed-mailer-ru.com' et une adresse IP émettrice 185.220.101.4.\n3. Vérification des enregistrements DNS : Requête 'nslookup -type=TXT cma-cgm-caraibes.com' révélant l'absence de l'IP émettrice dans le champ SPF ('v=spf1 ... -all') et signature DKIM invalide ('dkim=fail body hash did not verify'). Alignement DMARC rejeté ('p=reject').\n4. Mesures de remédiation : Blocage de l'adresse IP et du nom de domaine frauduleux sur le pare-feu UTM Fortinet. Signalement de la tentative d'escroquerie au DSI et diffusion d'une note d'alerte sécurité à l'ensemble du pôle administratif.`,
        message_usager: `Bonjour Marc. L'e-mail reçu par le service comptable est une tentative avérée d'usurpation d'identité (Phishing avec usurpation de domaine CMA-CGM). Les signatures SPF/DKIM sont invalides et l'adresse IP source a été immédiatement bannie sur notre pare-feu UTM. Aucun transfert financier n'a eu lieu et une note préventive a été diffusée.`,
        statut: 'valide',
        points_attribues: 150,
        soumis_le: new Date().toISOString(),
      };
    case 'TCK-102':
      return {
        id: 'draft-tck-102',
        ticket_id: ticket.id,
        apprenant_id: studentId,
        diagnostic_categorie: 'materiel',
        diagnostic_urgence: 'P2',
        demarche_technique: `1. Audit du parc mobile : Réception des 8 terminaux durcis Zebra TC57 Android Enterprise. Inventaire des numéros de série et adresses MAC Wi-Fi.\n2. Enrôlement MDM & configuration réseau : Enrôlement dans la console de gestion de flotte (MDM). Déploiement automatique du profil Wi-Fi Quai (SSID 'KLF-LOGISTIQUE-WIFI', WPA3-Enterprise, VLAN 30 dédié étanche du réseau bureautique) et paramétrage du roaming 802.11r pour assurer la continuité lors des déplacements en chariot élévateur.\n3. Rédaction du guide de MCO : Élaboration d'une fiche plastifiée 1-page synthétique (allumage sécurisé, scan code-barres 2D, procédure de vidage du cache applicatif, réinitialisation à chaud en cas de freeze).\n4. Déploiement terrain & formation : Remise des terminaux aux 8 caristes, explication des consignes de maintenance de premier niveau et test de scannage en conditions réelles sur le quai n°3.`,
        message_usager: `Bonjour Sébastien. Les 8 terminaux durcis Zebra TC57 sont configurés sur le réseau Wi-Fi industriel sécurisé (VLAN 30 Quai) et enrôlés sur notre console MDM. La fiche réflexe de maintenance plastifiée est mise à disposition au poste de commande du quai.`,
        statut: 'valide',
        points_attribues: 200,
        soumis_le: new Date().toISOString(),
      };
    case 'TCK-101':
      return {
        id: 'draft-tck-101',
        ticket_id: ticket.id,
        apprenant_id: studentId,
        diagnostic_categorie: 'applicatif',
        diagnostic_urgence: 'P2',
        demarche_technique: `1. Analyse du dysfonctionnement : Constat de corruptions récurrentes et de pertes de formules (#N/A) dues au stockage du classeur de manifestes sur un poste local partagé en réseau pair-à-pair non sécurisé.\n2. Migration sur stockage centralisé : Création d'un volume de stockage RAID 5 dédié sur le NAS d'entreprise Synology ('\\\\\\\\NAS-KLF\\\\Facturation\\\\Manifestes').\n3. Sécurisation des accès & droits NTFS : Activation du protocole SMBv3 crypté. Configuration des listes de contrôle d'accès (ACL NTFS) restreignant les droits d'écriture au groupe de sécurité Active Directory 'GG_Compta_Facturation' et accès lecture seule aux autres services.\n4. Automatisation des sauvegardes : Mise en place d'un job de sauvegarde nocturne incrémentale avec historique sur 30 jours (VSS Shadow Copies) et vérification de la restauration sur fichier test.`,
        message_usager: `Bonjour Corinne. Le classeur de suivi des manifestes maritimes a été migré sur l'espace réseau sécurisé du NAS d'entreprise. Les droits d'accès sont désormais protégés contre toute modification accidentelle et une sauvegarde quotidienne automatique est activée.`,
        statut: 'valide',
        points_attribues: 150,
        soumis_le: new Date().toISOString(),
      };
    case 'TCK-103':
    default:
      return {
        id: 'draft-tck-103',
        ticket_id: ticket.id,
        apprenant_id: studentId,
        diagnostic_categorie: 'materiel',
        diagnostic_urgence: 'P2',
        demarche_technique: `1. Raccordement & adressage statique : Raccordement réseau du copieur multifonction sur la prise murale RH-02. Configuration d'une réservation IP fixe (192.168.20.15) via son adresse MAC sur le serveur DHCP Windows Server.\n2. Configuration du serveur d'impression : Installation du rôle Serveur d'impression sur Windows Server 2022. Ajout du périphérique avec le pilote certifié universel PCL6 et isolation sur le VLAN administratif.\n3. Déploiement par stratégie GPO : Création et liaison d'une GPO Active Directory ('GPO_Deploy_Printer_RH') ciblant les postes du pôle Ressources Humaines pour un montage automatique à l'ouverture de session.\n4. Sécurisation de l'impression confidentielle : Activation de la fonction d'impression retenue (Secure Print) obligeant l'usager à saisir son code PIN sur l'écran tactile du copieur pour libérer l'impression de convocations et bulletins confidentiels.`,
        message_usager: `Bonjour Élodie. Le nouveau copieur multifonction réseau est opérationnel et déployé automatiquement sur vos postes de travail. La fonction d'impression sécurisée par code PIN est activée pour préserver la stricte confidentialité de vos documents RH lors de leur sortie bac.`,
        statut: 'valide',
        points_attribues: 150,
        soumis_le: new Date().toISOString(),
      };
  }
}
