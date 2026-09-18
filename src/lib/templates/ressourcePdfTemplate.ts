import { BureautiqueRessource } from '@/types/ressource';

export function generateRessourcePdfHtml(ressource: BureautiqueRessource): string {
  const raccourcisRows = (ressource.raccourcisCles || [])
    .map(
      (r) => `
      <tr>
        <td style="width: 32%; font-family: monospace; font-weight: bold; color: #0284c7; background: #f0fdf4;">${escapeHtml(r.touche)}</td>
        <td style="font-size: 9.8px; color: #0f172a;">${escapeHtml(r.action)}</td>
      </tr>`
    )
    .join('\n');

  const etapesHtml = (ressource.etapesDetaillees || [])
    .map(
      (e) => `
      <div style="margin-bottom: 6px; padding-bottom: 5px; border-bottom: 1px dashed #cbd5e1;">
        <div style="font-weight: bold; font-size: 10.5px; color: #0f172a; margin-bottom: 2px;">
          Étape ${e.numero} : ${escapeHtml(e.titre)}
        </div>
        <div style="font-size: 9.8px; line-height: 1.25; color: #334155;">
          ${escapeHtml(e.detail)}
        </div>
        ${
          e.exempleCode
            ? `<div style="background: #f1f5f9; border-left: 3px solid #0284c7; padding: 3px 6px; margin-top: 3px; font-family: monospace; font-size: 9px; color: #0369a1;">${escapeHtml(e.exempleCode).replace(/\n/g, '<br>')}</div>`
            : ''
        }
      </div>`
    )
    .join('\n');

  const piegesHtml = (ressource.piegesAEviter || [])
    .map(
      (p) => `<li style="margin-bottom: 2.5px; font-size: 9.5px; color: #991b1b;">${escapeHtml(p)}</li>`
    )
    .join('\n');

  const outilBadge =
    ressource.outil === 'sheets'
      ? 'Google Sheets & Excel'
      : ressource.outil === 'docs'
      ? 'Google Docs & Word'
      : ressource.outil === 'slides'
      ? 'Google Slides & PowerPoint'
      : 'Gmail & Workspace';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche Mémo DSI - ${escapeHtml(ressource.titre)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 12mm;
    }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
      font-size: 10px;
      line-height: 1.22;
    }
    .page-container {
      width: 100%;
      box-sizing: border-box;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 7px;
    }
    .header-table td {
      border: 1.5px solid #000;
      padding: 5px 8px;
      vertical-align: middle;
    }
    .title-box {
      text-align: center;
      font-weight: bold;
      font-size: 11.5px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: #f8fafc;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    .meta-table td {
      border: 1px solid #000;
      padding: 3px 6px;
      font-size: 9.5px;
    }
    .section-title {
      background: #e2e8f0;
      font-weight: bold;
      font-size: 10px;
      text-transform: uppercase;
      padding: 3px 6px;
      border: 1px solid #000;
      border-bottom: 1.5px solid #000;
      color: #0f172a;
      margin-top: 4px;
      margin-bottom: 3px;
    }
    .shortcut-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 4px;
    }
    .shortcut-table td {
      border: 1px solid #94a3b8;
      padding: 2.5px 5px;
    }
    ul {
      margin: 2px 0 3px 0;
      padding-left: 15px;
    }
    .footer-note {
      margin-top: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #475569;
      border-top: 1px solid #cbd5e1;
      padding-top: 3px;
    }
  </style>
</head>
<body>
<div class="page-container">
  <table class="header-table">
    <tr>
      <td style="width: 35%; font-weight: bold; font-size: 10px;">
        ORGANISME DE FORMATION :<br>
        <span style="font-size: 12px; font-weight: 800; color: #0f172a;">KLF FORE ALTERNANCE</span>
      </td>
      <td class="title-box">
        FICHE MÉMO TECHNICIEN SUPPORT (DSI)<br>
        <span style="font-size: 9.5px; font-weight: normal; text-transform: none; color: #475569;">Académie Bureautique • Titre Professionnel TIP (Session C26031A)</span>
      </td>
    </tr>
  </table>

  <table class="meta-table">
    <tr>
      <td style="width: 50%;"><strong>THEME :</strong> ${escapeHtml(ressource.titre)}</td>
      <td style="width: 50%;"><strong>OUTIL :</strong> ${escapeHtml(outilBadge)} (${escapeHtml(ressource.palier)})</td>
    </tr>
    <tr>
      <td><strong>FORMATEUR RÉFÉRENT :</strong> David JACQUA</td>
      <td><strong>DURÉE D'ASSIMILATION :</strong> ${escapeHtml(ressource.tempsLecture)} &nbsp;|&nbsp; <strong>APPLICATION :</strong> ${escapeHtml(ressource.ticketAssocieId || 'Atelier DSI')}</td>
    </tr>
  </table>

  <div class="section-title">1. Raccourcis indispensables & réflexes clavier du technicien</div>
  <table class="shortcut-table">
    ${raccourcisRows}
  </table>

  <div class="section-title">2. Démarche pas-à-pas & points clés d'intervention</div>
  <div style="border: 1px solid #94a3b8; padding: 5px 7px; background: #ffffff;">
    ${etapesHtml}
  </div>

  <div class="section-title" style="background: #fee2e2; color: #991b1b; border-color: #f87171;">3. Pièges fréquents & erreurs à bannir</div>
  <div style="border: 1px solid #f87171; padding: 4px 7px; background: #fff5f5;">
    <ul>
      ${piegesHtml}
    </ul>
  </div>

  <div class="footer-note">
    <div><em>Support pédagogique officiel KLF Leaderboard • Document technique de référence à conserver pour le stage en entreprise</em></div>
    <div style="font-weight: bold;">RÉF. MÉMO-${escapeHtml(ressource.id.toUpperCase())}</div>
  </div>
</div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
