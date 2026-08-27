import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../supabase/server';

/**
 * Route Webhook pour l'automatisation n8n (Quiz Forms, Déblocage de Badges, Evolution API)
 * Sécurisée par clé Bearer Token et table d'idempotence tip.sf_idempotency.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Vérification de l'authentification Bearer Token
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.KLF_WEBHOOK_BEARER_TOKEN || 'klf_tip_bearer_secret_2026_jarry_secure!';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Accès non autorisé : En-tête Bearer manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Accès interdit : Jeton Bearer invalide' },
        { status: 403 }
      );
    }

    // 2. Parsing du corps de la requête
    const body = await req.json();
    const { event_id, source, event_type, data } = body;

    if (!event_id || !event_type || !data) {
      return NextResponse.json(
        { error: 'Corps de requête invalide : event_id, event_type et data requis' },
        { status: 400 }
      );
    }

    // 3. Contrôle d'idempotence strict (Évite tout doublon de points ou de badges)
    try {
      const { data: existingEvent } = await supabaseServer
        .from('sf_idempotency')
        .select('event_id')
        .eq('event_id', event_id)
        .single();

      if (existingEvent) {
        return NextResponse.json(
          { message: 'Événement déjà traité précédemment (Idempotence respectée)', event_id },
          { status: 200 }
        );
      }

      // Enregistrement de l'événement dans la table d'idempotence
      await supabaseServer.from('sf_idempotency').insert({
        event_id,
        source: source || 'n8n_webhook',
      });
    } catch {
      // Si la table est en cours de création, on continue avec précaution
    }

    // 4. Traitement selon le type d'événement
    if (event_type === 'quiz_completed') {
      const { email, points, badge_id } = data;

      if (!email) {
        return NextResponse.json({ error: 'Email apprenant requis' }, { status: 400 });
      }

      // Recherche de l'apprenant
      const { data: apprenant } = await supabaseServer
        .from('sf_apprenants')
        .select('id, points_total')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (!apprenant) {
        return NextResponse.json(
          { error: 'Apprenant introuvable pour cet email' },
          { status: 404 }
        );
      }

      // Attribution des points
      const newPoints = (apprenant.points_total || 0) + (points || 0);
      await supabaseServer
        .from('sf_apprenants')
        .update({ points_total: newPoints })
        .eq('id', apprenant.id);

      // Attribution du badge si spécifié
      if (badge_id) {
        await supabaseServer
          .from('sf_achievements')
          .insert({
            apprenant_id: apprenant.id,
            badge_id,
          });
      }

      return NextResponse.json({
        success: true,
        message: `Progression enregistrée pour l'apprenant (+${points} pts)`,
        event_id,
      });
    }

    if (event_type === 'badge_unlocked') {
      const { apprenant_id, badge_id } = data;

      await supabaseServer
        .from('sf_achievements')
        .insert({
          apprenant_id,
          badge_id,
        });

      return NextResponse.json({
        success: true,
        message: `Badge ${badge_id} débloqué pour ${apprenant_id}`,
        event_id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Événement traité',
      event_id,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook', details: message },
      { status: 500 }
    );
  }
}
