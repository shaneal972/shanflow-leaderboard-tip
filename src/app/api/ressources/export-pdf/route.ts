import { NextRequest, NextResponse } from 'next/server';
import { getRessourceBySlug } from '@/data/ressourcesData';
import { generateRessourcePdfHtml } from '@/lib/templates/ressourcePdfTemplate';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 secondes pour la compilation Gotenberg

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return new NextResponse('Paramètre slug requis.', { status: 400 });
    }

    const ressource = getRessourceBySlug(slug);
    if (!ressource) {
      return new NextResponse('Ressource pédagogique introuvable.', { status: 404 });
    }

    // Précompilation HTML
    const compiledHtml = generateRessourcePdfHtml(ressource);
    const filename = `FICHE_MEMO_DSI_${slug.toUpperCase()}_KLF.pdf`;

    // Appel Gotenberg via webhook n8n
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
      console.error('[Ressource PDF] Erreur webhook n8n:', n8nResponse.status, errorText);
      return new NextResponse(
        `Erreur service Gotenberg (${n8nResponse.status}) : ${errorText.substring(0, 200)}`,
        { status: 502 }
      );
    }

    const pdfBuffer = await n8nResponse.arrayBuffer();
    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      return new NextResponse('Gotenberg a retourné un binaire vide.', { status: 502 });
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('[Ressource PDF] Exception:', err);
    return new NextResponse(`Erreur interne : ${err.message || 'Erreur inconnue'}`, {
      status: 500,
    });
  }
}
