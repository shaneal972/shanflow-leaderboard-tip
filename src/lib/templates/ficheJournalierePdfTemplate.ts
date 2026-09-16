import { SessionItem } from '@/lib/data/chronogrammeSessions';

export interface FicheJournaliereData {
  nomFormateur: string;
  module: string;
  filiere: string;
  date: string;
  seance: string | number;
  objectifs: SessionItem[];
  contenu: SessionItem[];
  supports: SessionItem[];
  remarques: SessionItem[];
}

export function generateFicheJournalierePdfHtml(data: FicheJournaliereData): string {
  const objectifsHtml = (data.objectifs || [])
    .map(
      (item) =>
        `          <li><strong>${escapeHtml(item.bold)}</strong>${escapeHtml(item.text || '')}</li>`
    )
    .join('\n');

  const contenuHtml = (data.contenu || [])
    .map(
      (item) =>
        `          <li><strong>${escapeHtml(item.bold)}</strong>${escapeHtml(item.text || '')}</li>`
    )
    .join('\n');

  const supportsHtml = (data.supports || [])
    .map(
      (item) =>
        `          <li><strong>${escapeHtml(item.bold)}</strong>${escapeHtml(item.text || '')}</li>`
    )
    .join('\n');

  const remarquesHtml = (data.remarques || [])
    .map(
      (item) =>
        `          <li><strong>${escapeHtml(item.bold)}</strong>${escapeHtml(item.text || '')}</li>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche Journalière Activité Formateur - ${escapeHtml(data.date)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 12mm;
    }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      color: #000;
      background: #f8fafc;
      margin: 0;
      padding: 15px;
    }
    .sheet {
      background: #fff;
      max-width: 780px;
      margin: 0 auto;
      padding: 20px 24px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .header-table td {
      border: 1.5px solid #000;
      padding: 6px 12px;
      vertical-align: middle;
    }
    .logo-box {
      width: 22%;
      text-align: center;
    }
    .logo-fore {
      font-size: 24px;
      font-weight: 900;
      color: #c00000;
      letter-spacing: 1px;
      line-height: 1;
    }
    .logo-sub {
      font-size: 11px;
      font-weight: bold;
      color: #475569;
      letter-spacing: 2px;
    }
    .title-box {
      width: 53%;
      text-align: center;
      font-size: 15px;
      font-weight: 800;
      line-height: 1.3;
    }
    .ref-box {
      width: 25%;
      text-align: right;
      font-size: 10px;
      line-height: 1.25;
    }
    .ref-en19 {
      font-size: 13px;
      font-weight: 800;
    }
    .meta-section {
      margin: 10px 0 8px 0;
      font-size: 12.5px;
      line-height: 1.6;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
    }
    .bold {
      font-weight: bold;
    }
    .handwritten-val {
      font-family: "Segoe UI", Arial, sans-serif;
      font-weight: 700;
      color: #0f172a;
    }
    .main-table {
      margin-top: 4px;
      border: 1.5px solid #000;
    }
    .main-table td {
      border: 1.5px solid #000;
      padding: 7px 12px;
      vertical-align: top;
    }
    .section-title {
      font-weight: bold;
      font-size: 11.5px;
      margin-bottom: 4px;
      color: #0f172a;
      text-transform: uppercase;
    }
    ul {
      margin: 0;
      padding-left: 16px;
    }
    li {
      font-size: 10.5px;
      line-height: 1.4;
      margin-bottom: 2.5px;
      color: #1e293b;
    }
    .footer-note {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      margin-top: 8px;
      color: #334155;
    }
    @media print {
      body {
        background: #fff;
        padding: 0;
      }
      .sheet {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>

<div class="sheet">
  <table class="header-table">
    <tr>
      <td class="logo-box">
        <div class="logo-fore">FORE</div>
        <div class="logo-sub">ALTERNANCE</div>
      </td>
      <td class="title-box">
        FICHE JOURNALIERE ACTIVITE<br>FORMATEUR
      </td>
      <td class="ref-box">
        <div class="ref-en19">EN-19</div>
        <div>14/03/2025</div>
        <div style="margin-top: 3px; font-style: italic;">RÉPUBLIQUE FRANÇAISE<br>France Travail</div>
      </td>
    </tr>
  </table>

  <div class="meta-section">
    <div class="meta-row">
      <div><span class="bold">NOM DU FORMATEUR :</span> <span class="handwritten-val">${escapeHtml(data.nomFormateur || 'JACQUA David')}</span></div>
      <div><span class="bold">MODULE :</span> <span class="handwritten-val">${escapeHtml(data.module)}</span></div>
    </div>
    <div>
      <span class="bold">FILIERE :</span> <span class="handwritten-val">${escapeHtml(data.filiere || 'TECHNICIEN INFORMATIQUE DE PROXIMITE')}</span>
    </div>
    <div class="meta-row">
      <div><span class="bold">DATE :</span> <span class="handwritten-val">${escapeHtml(data.date)}</span></div>
      <div><span class="bold">SEANCE N° :</span> <span class="handwritten-val">${escapeHtml(String(data.seance))}</span></div>
    </div>
  </div>

  <table class="main-table">
    <tr>
      <td>
        <div class="section-title">OBJECTIFS DE LA SEANCE :</div>
        <ul>
${objectifsHtml}
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <div class="section-title">CONTENU DE LA SEANCE (COURS, EXERCICES ET APPLICATIONS RÉALISÉS) :</div>
        <ul>
${contenuHtml}
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <div class="section-title">SUPPORTS UTILISES :</div>
        <ul>
${supportsHtml}
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        <div class="section-title">REMARQUES :</div>
        <ul>
${remarquesHtml}
        </ul>
      </td>
    </tr>
  </table>

  <div class="footer-note">
    <div><em>Note : si des difficultés sont rencontrées durant la séance, veuillez remplir le verso</em></div>
    <div class="bold">T.P.S.V.P</div>
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
