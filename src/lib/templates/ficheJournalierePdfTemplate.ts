import { SessionItem } from '@/lib/data/chronogrammeSessions';
import { FORE_LOGO_BASE64, FRANCE_TRAVAIL_LOGO_BASE64 } from './fichesLogos';

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
      margin: 12mm 15mm 10mm 15mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      color: #000;
      background: #f8fafc;
      margin: 0;
      padding: 16px;
    }
    .sheet {
      background: #fff;
      max-width: 820px;
      margin: 0 auto;
      padding: 20px 24px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    table { width: 100%; border-collapse: collapse; }
    .header-table td {
      border: 1.5px solid #000;
      padding: 6px 12px;
      vertical-align: middle;
    }
    .logo-cell { width: 19%; text-align: center; padding: 4px !important; }
    .logo-cell img { max-height: 62px; display: block; margin: 0 auto; }
    .title-cell {
      width: 57%;
      text-align: center;
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.5px;
      line-height: 1.35;
      color: #000;
    }
    .ref-cell { width: 24%; text-align: right; font-size: 10.5px; line-height: 1.25; }
    .ref-en19 { font-size: 15.5px; font-weight: 800; color: #000; }
    .ref-date { font-size: 10.5px; color: #334155; margin-bottom: 2px; }
    .rf-logo-img { max-height: 48px; margin-top: 2px; display: inline-block; }
    .meta-section {
      margin: 11px 0 9px 0;
      font-size: 13px;
      line-height: 1.7;
    }
    .meta-row { display: flex; justify-content: space-between; }
    .bold { font-weight: bold; }
    .handwritten-val { font-family: Arial, "Segoe UI", sans-serif; font-weight: 700; color: #000; }
    .main-table {
      margin-top: 0px;
      border: 1.5px solid #000;
    }
    .main-table td {
      border: 1.5px solid #000;
      padding: 16px 14px;
      vertical-align: top;
    }
    .section-title {
      font-weight: bold;
      font-size: 12.5px;
      margin-bottom: 6px;
      color: #000;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    ul { margin: 0; padding-left: 18px; }
    li {
      font-size: 11.8px;
      line-height: 1.50;
      margin-bottom: 5.5px;
      color: #0f172a;
    }
    li:last-child { margin-bottom: 0; }
    .footer-note {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      margin-top: 10px;
      color: #334155;
    }
    @media print {
      body { background: #fff; padding: 0; margin: 0; }
      .sheet { border: none; box-shadow: none; padding: 0; margin: 0; max-width: 100%; }
      .main-table td { padding: 16px 14px; }
      li { font-size: 11.8px; line-height: 1.50; margin-bottom: 5.5px; }
    }
  </style>
</head>
<body>
<div class="sheet">
  <table class="header-table">
    <tr>
      <td class="logo-cell"><img src="${FORE_LOGO_BASE64}"></td>
      <td class="title-cell">FICHE JOURNALIERE ACTIVITE<br>FORMATEUR</td>
      <td class="ref-cell">
        <div class="ref-en19">EN-19</div>
        <div class="ref-date">14/03/2025</div>
        <img class="rf-logo-img" src="${FRANCE_TRAVAIL_LOGO_BASE64}">
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
