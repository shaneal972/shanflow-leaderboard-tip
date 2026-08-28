import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getQualiopiReportDataAction } from '@/app/admin/actions';
import { generateQualiopiPdfHtml } from '@/lib/templates/qualiopiPdfTemplate';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 secondes pour la compilation Gotenberg

export async function GET(request: NextRequest) {
  // 1. Contrôle d'accès formateur
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return new NextResponse('Accès non autorisé : session formateur requise.', {
      status: 401,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  try {
    // 2. Agrégation des données réelles de la promotion
    const res = await getQualiopiReportDataAction();
    if (!res.success || !res.report) {
      return new NextResponse(
        `Erreur lors de la récupération des données Qualiopi : ${res.error || 'Données introuvables'}`,
        { status: 500 }
      );
    }

    const report = res.report;

    // 3. Pré-compilation du gabarit HTML A4 Paysage
    const compiledHtml = generateQualiopiPdfHtml(report);

    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `${todayStr}_FORE-Alternance_Bilan-Qualiopi_TIP-C26031A.pdf`;

    // 4. Appel du webhook n8n / Gotenberg sécurisé
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
      // Pas de cache pour les documents réglementaires temps réel
      cache: 'no-store',
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('[Qualiopi PDF] Erreur webhook n8n:', n8nResponse.status, errorText);
      return new NextResponse(
        `Erreur du service d'impression PDF Gotenberg (${n8nResponse.status}) : ${errorText.substring(0, 200)}`,
        { status: 502 }
      );
    }

    // 5. Récupération du buffer binaire PDF généré par Gotenberg
    const pdfBuffer = await n8nResponse.arrayBuffer();

    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      return new NextResponse("Le service d'impression Gotenberg a renvoyé un document vide.", {
        status: 502,
      });
    }

    // 6. Streaming direct du PDF vers le navigateur de David
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
    console.error('[Qualiopi PDF] Exception inattendue:', error);
    return new NextResponse(
      `Erreur interne lors de la génération du PDF Qualiopi : ${error.message || 'Erreur inconnue'}`,
      { status: 500 }
    );
  }
}
