/**
 * Standard Design System PDF A4 - KLF / ShanFlow (v2026)
 * 
 * Standard absolu pour la génération de documents et fiches de TP pédagogiques A4
 * multi-pages (Gotenberg / Chromium) avec zéro débordement, typographie aérée et
 * icônes SVG inline anti-rognage.
 */

/**
 * Feuille de style CSS officielle et sanctuarisée pour documents A4 multi-pages.
 * Garantit exactement 276mm de hauteur utile par page, sans aucune page fantôme.
 */
export const KLF_A4_PDF_STYLES = `
  @page {
    size: A4 portrait;
    margin: 10mm 14mm 10mm 14mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    color: #0f172a;
    background: #fff;
    font-size: 10.5pt;
    line-height: 1.65;
  }

  .page {
    width: 100%;
    height: 276mm;
    max-height: 276mm;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }
  .page:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  .header-table {
    width: 100%;
    border-collapse: collapse;
    border: 1.5px solid #0f172a;
    margin-bottom: 8px;
  }
  .header-table td {
    border: 1.5px solid #0f172a;
    padding: 6px 10px;
    vertical-align: middle;
  }
  .logo-cell { width: 18%; text-align: center; }
  .logo-cell img { max-height: 48px; display: block; margin: 0 auto; }
  .title-cell {
    width: 60%;
    text-align: center;
    line-height: 1.25;
  }
  .main-title {
    font-size: 14pt;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: #0f172a;
  }
  .sub-title {
    font-size: 10pt;
    color: #475569;
    font-weight: 700;
    margin-top: 2px;
  }
  .tp-badge {
    display: inline-block;
    background: #0f172a;
    color: #fff;
    font-size: 8.5pt;
    font-weight: 800;
    padding: 2.5px 8px;
    border-radius: 4px;
    margin-top: 3px;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .ref-cell {
    width: 22%;
    text-align: right;
    font-size: 9pt;
    line-height: 1.25;
  }
  .ref-cell img { max-height: 40px; margin-top: 3px; display: inline-block; }

  .meta-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    background: #f8fafc;
    border: 1.2px solid #cbd5e1;
    padding: 6px 10px;
    border-radius: 4px;
    margin-bottom: 8px;
    font-size: 9.5pt;
  }
  .meta-item strong { color: #0f172a; }

  .callout {
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 14px;
    font-size: 10.2pt;
    line-height: 1.6;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .callout-title {
    font-weight: 800;
    text-transform: uppercase;
    margin-bottom: 5px;
    font-size: 10.8pt;
    padding-left: 2px;
  }
  .callout-blue {
    background: #f8fafc;
    border: 1.2px solid #cbd5e1;
    border-left: 4px solid #0f172a;
  }
  .callout-blue .callout-title { color: #0f172a; }

  .callout-red {
    background: #fef2f2;
    border: 1.2px solid #fecaca;
    border-left: 4px solid #dc2626;
  }
  .callout-red .callout-title { color: #b91c1c; }

  .callout-green {
    background: #f0fdf4;
    border: 1.2px solid #bbf7d0;
    border-left: 4px solid #16a34a;
  }
  .callout-green .callout-title { color: #15803d; }

  .section-header {
    background: #0f172a;
    color: #fff;
    font-size: 11pt;
    font-weight: 800;
    padding: 8px 14px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin: 14px 0 12px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    break-after: avoid;
    page-break-after: avoid;
  }
  .section-header .tag {
    background: #334155;
    font-size: 8.5pt;
    padding: 2px 7px;
    border-radius: 3px;
    white-space: nowrap;
  }

  .notion-box {
    background: #eff6ff;
    border: 1.2px solid #bfdbfe;
    border-left: 4px solid #2563eb;
    border-radius: 4px;
    padding: 12px 16px;
    margin: 10px 0 14px 0;
    font-size: 10.2pt;
    line-height: 1.6;
    color: #1e3a8a;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .notion-box strong { color: #1d4ed8; font-size: 10.8pt; }

  p { margin-bottom: 6px; font-size: 10.5pt; line-height: 1.65; }
  ul, ol { margin-left: 20px; margin-bottom: 10px; }
  li { margin-bottom: 8px; font-size: 10.5pt; line-height: 1.62; color: #1e293b; }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 9.5pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .data-table th, .data-table td {
    border: 1.2px solid #cbd5e1;
    padding: 9px 12px;
    text-align: left;
    line-height: 1.5;
  }
  .data-table th {
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 9pt;
  }

  .formula-code {
    font-family: "Courier New", Courier, monospace;
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    font-size: 9.5pt;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #cbd5e1;
    display: inline-block;
  }

  .code-box {
    background: #0f172a;
    color: #38bdf8;
    font-family: "Courier New", Courier, monospace;
    font-size: 10.5pt;
    padding: 12px 16px;
    border-radius: 4px;
    margin: 10px 0;
    border-left: 4px solid #38bdf8;
    line-height: 1.55;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .eval-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin-top: 10px;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .eval-table th, .eval-table td {
    border: 1.2px solid #cbd5e1;
    padding: 9px 12px;
    line-height: 1.5;
  }
  .eval-table th {
    background: #0f172a;
    color: #fff;
    font-size: 9pt;
    text-transform: uppercase;
    font-weight: 700;
  }

  .sign-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    border: 1.5px dashed #94a3b8;
    border-radius: 4px;
    font-size: 9.5pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .sign-table td {
    padding: 10px 14px;
    vertical-align: top;
    font-size: 9.5pt;
    line-height: 1.45;
  }

  .footer-bar {
    border-top: 1px solid #cbd5e1;
    padding-top: 5px;
    margin-top: 6px;
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
    color: #64748b;
  }
`;

/**
 * Icônes vectorielles SVG inline 16x16 standardisées.
 * Immunisées contre les bugs de glyphes ou d'em-box des polices Unicode (Noto Color Emoji)
 * sous Linux Gotenberg.
 */
export const PDF_ICONS = {
  /** Bouclier sécurité / réflexe pro */
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:text-bottom; margin-right:5px; flex-shrink:0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,

  /** Triangle d'alerte / avertissement */
  alert: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:text-bottom; margin-right:5px; flex-shrink:0;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,

  /** Ampoule astuce / compréhension */
  bulb: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:text-bottom; margin-right:5px; flex-shrink:0;"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,

  /** Cadenas / sécurité / blocage */
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:text-bottom; margin-right:5px; flex-shrink:0;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,

  /** Coche validation */
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:text-bottom; margin-right:5px; flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg>`,
};

/**
 * Protège un libellé ou un identifiant court contre toute coupure de ligne accidentelle
 * (ex: TCK-101, (CCP 1), Ind. 11, montants en €).
 */
export function nowrap(text: string): string {
  return `<span style="white-space: nowrap;">${text}</span>`;
}
