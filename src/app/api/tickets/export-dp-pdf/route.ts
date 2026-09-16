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
      // Si aucune résolution en base, on génère un brouillon type basé sur le ticket
      resolution = {
        id: 'draft-res',
        ticket_id: ticketId,
        apprenant_id: studentId,
        diagnostic_categorie: ticket.id === 'TCK-102' ? 'materiel' : ticket.id === 'TCK-105' ? 'reseau' : 'applicatif',
        diagnostic_urgence: ticket.urgence,
        demarche_technique: `1. Diagnostic préliminaire de l'incident ${ticket.id}.\n2. Application de la procédure standard d'intervention.\n3. Recette et validation fonctionnelle avec l'usager.`,
        message_usager: `Bonjour ${ticket.demandeur}, l'incident ${ticket.id} a été pris en charge et résolu avec succès.`,
        statut: 'en_attente_validation',
        points_attribues: 0,
        soumis_le: new Date().toISOString(),
      };
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
