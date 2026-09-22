import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { MOCK_APPRENANTS } from '@/data/mockData';
import { getLabById } from '@/lib/lab/labData';
import { generateLabReportPdfHtml } from '@/lib/templates/labReportPdfTemplate';
import { Lab, Apprenant, LabSubmission } from '@/types/tip';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const labId = searchParams.get('labId') || 'tp-bur-01-corinne';
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return new NextResponse('Paramètre studentId manquant.', {
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

    // 2. Récupération du Lab
    const lab: Lab | undefined = getLabById(labId);
    if (!lab) {
      return new NextResponse(`Atelier TP introuvable (${labId}).`, { status: 404 });
    }

    // 3. Récupération de la soumission du stagiaire
    let submission: LabSubmission | null = null;
    const { data: subDb } = await supabaseServer
      .from('sf_lab_submissions')
      .select('*')
      .eq('lab_id', labId)
      .eq('apprenant_id', studentId)
      .single();

    if (subDb) {
      submission = subDb as LabSubmission;
    } else {
      // Soumission par défaut si pas encore enregistrée en base
      submission = {
        id: `mock-sub-${studentId.substring(0, 8)}`,
        lab_id: labId,
        apprenant_id: studentId,
        audit_results: {
          timestamp: new Date().toISOString(),
          fileName: lab.fichier_modele_nom,
          fileSize: 42100,
          milestonesCount: 5,
          validCount: 5,
          scorePct: 100,
          isFullyValid: true,
          details: lab.jalons.map((j) => ({
            milestoneId: j.id,
            status: 'valide',
            message: `${j.titre} vérifié et conforme aux spécifications KLF.`,
            details: j.critereAudit,
          })),
        },
        jalons_valides: 5,
        score_technique_pct: 100,
        reponse_demarche: "1. Diagnostic préliminaire : détection des codes postaux tronqués en numérique et ruptures #N/A dues aux espaces parasites.\n2. Normalisation : formatage texte sur 5 positions et fonction SUPPRESPACE sur la recherche matricielle.\n3. Application fiscale : calcul de l'Octroi de mer 8.5% et TVA 8.5% avec références $ bloquées.\n4. Recette : figeage des volets et concordance totale des arrivages.",
        reponse_difficultes: "Vérifier que le signe $ bloque bien la ligne de taux d'en-tête ($H$2) pour éviter tout décalage lors de l'étirement sur les 800 lignes.",
        reponse_enseignements: "La rigueur des types de données et le dynamisme des formules sont indispensables pour la conformité douanière en Guadeloupe.",
        statut: 'soumis_en_revue',
        points_attribues: lab.points_auto_validation,
        soumis_le: new Date().toISOString(),
      };
    }

    // 4. Pré-compilation HTML A4 Gotenberg
    const compiledHtml = generateLabReportPdfHtml(lab, submission, student);

    const cleanNom = student.nom.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanPrenom = student.prenom.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Compte-Rendu_KLF-Lab_${lab.id}_${cleanNom}_${cleanPrenom}.pdf`;

    // 5. Appel au webhook Gotenberg n8n
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
      const errText = await n8nResponse.text();
      console.error('Erreur n8n Gotenberg pour Lab PDF:', n8nResponse.status, errText);
      return new NextResponse(`Erreur Gotenberg (${n8nResponse.status}): ${errText}`, {
        status: 502,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const pdfBuffer = await n8nResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Erreur export Lab PDF:', error);
    return new NextResponse(`Erreur serveur export PDF : ${error.message || 'Inconnue'}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
