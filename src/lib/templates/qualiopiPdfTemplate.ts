import { QualiopiReportData, QualiopiStudentRow } from '@/types/tip';

/**
 * Génère le code HTML complet pré-compilé pour Gotenberg Chromium (A4 Paysage Strict).
 * Conforme aux standards d'audit Qualiopi (Indicateurs 8 & 11) pour le CFA FORE Alternance.
 */
export function generateQualiopiPdfHtml(data: QualiopiReportData): string {
  const { kpis, students } = data;

  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const studentsWithPositionnement = students.filter((s) => s.has_submitted_positionnement);
  const validatedCount = students.filter((s) => s.seuil_atteint).length;
  const tauxReussite = kpis.count_passage_test > 0
    ? Math.round((validatedCount / kpis.count_passage_test) * 100)
    : 0;

  // Lignes du tableau des apprenants
  const rowsHtml = students.map((s, idx) => {
    const isEven = idx % 2 === 1;
    const bgRow = isEven ? '#F8FAFC' : '#FFFFFF';

    // Pastille de statut
    let badgeHtml = '';
    if (s.statut_positionnement === 'Validé') {
      badgeHtml = '<span class="status-pill status-success">✓ Validé</span>';
    } else if (s.statut_positionnement === 'À consolider') {
      badgeHtml = '<span class="status-pill status-warning">⚠ À consolider</span>';
    } else {
      badgeHtml = '<span class="status-pill status-neutral">○ Non passé</span>';
    }

    // Domaines Qualiopi synthétiques (Fichiers, Word, Sheets, Posture)
    const domFichiers = s.domaines.find((d) => d.domaine.includes('Fichiers'))?.pourcentage ?? '-';
    const domWord = s.domaines.find((d) => d.domaine.includes('texte'))?.pourcentage ?? '-';
    const domSheets = s.domaines.find((d) => d.domaine.includes('Tableur'))?.pourcentage ?? '-';
    const domDsi = s.domaines.find((d) => d.domaine.includes('Posture'))?.pourcentage ?? '-';

    const noteDisplay = s.score_positionnement_sur_20 !== null
      ? `<strong>${s.score_positionnement_sur_20}</strong>/20 <span class="text-muted">(${s.score_positionnement_pourcentage}%)</span>`
      : '<span class="text-muted">-</span>';

    return `
      <tr style="background-color: ${bgRow};">
        <td class="col-student">
          <div class="student-name">${s.nom} ${s.prenom}</div>
          <div class="student-email">${s.email}</div>
        </td>
        <td class="col-team">${s.equipe}</td>
        <td class="col-center text-mono">${s.date_test_positionnement}</td>
        <td class="col-center">${noteDisplay}</td>
        <td class="col-center">${badgeHtml}</td>
        <td class="col-domains">
          <span class="dom-tag" title="Hygiène Fichiers">Fic: ${domFichiers}%</span>
          <span class="dom-tag" title="Traitement de texte">Wrd: ${domWord}%</span>
          <span class="dom-tag" title="Tableur Sheets">Xls: ${domSheets}%</span>
          <span class="dom-tag" title="Posture DSI">DSI: ${domDsi}%</span>
        </td>
        <td class="col-center">
          <strong>${s.badges_obtenus_total}</strong>/10
          <div class="text-muted text-xs">${s.points_klf_total} pts</div>
        </td>
        <td class="col-center">
          <div class="dp-progress">
            <span class="dp-score">${s.dp_rubriques_validees_count} / 5</span>
          </div>
        </td>
        <td class="col-avis">${s.avis_formateur}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bilan Qualiopi • Promotion TIP C26031A</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 8.5pt;
      line-height: 1.25;
      color: #0F172A;
      background: #FFFFFF;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* En-tête officiel */
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 7px;
      border-bottom: 2px solid #008080;
      margin-bottom: 8px;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo-badge {
      background: #008080;
      color: #FFFFFF;
      font-weight: 900;
      font-size: 13pt;
      padding: 5px 9px;
      border-radius: 6px;
      letter-spacing: -0.5px;
    }
    .brand-text h1 {
      margin: 0;
      font-size: 12pt;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.3px;
    }
    .brand-text p {
      margin: 2px 0 0 0;
      font-size: 7.5pt;
      color: #64748B;
      font-weight: 500;
    }
    .header-center {
      text-align: center;
    }
    .header-center .doc-title {
      font-size: 11pt;
      font-weight: 800;
      color: #008080;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .header-center .doc-subtitle {
      font-size: 8pt;
      color: #475569;
      margin: 2px 0 0 0;
      font-weight: 600;
    }
    .header-meta {
      text-align: right;
      font-size: 7.5pt;
      color: #475569;
    }
    .header-meta strong {
      color: #0F172A;
    }
    .qualiopi-tag {
      display: inline-block;
      background: #E6FFFA;
      color: #008080;
      border: 1px solid #81E6D9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 700;
      margin-top: 3px;
    }

    /* Cartouches KPI */
    .kpi-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 7px;
      margin-bottom: 8px;
    }
    .kpi-card {
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 5px 8px;
      background: #F8FAFC;
      border-left: 3.5px solid #008080;
    }
    .kpi-card.kpi-amber {
      border-left-color: #D97706;
    }
    .kpi-card.kpi-emerald {
      border-left-color: #059669;
    }
    .kpi-card.kpi-indigo {
      border-left-color: #4F46E5;
    }
    .kpi-label {
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748B;
      letter-spacing: 0.3px;
    }
    .kpi-value {
      font-size: 11pt;
      font-weight: 800;
      color: #0F172A;
      margin: 1px 0;
    }
    .kpi-subtext {
      font-size: 6.5pt;
      color: #475569;
    }

    /* Tableau officiel */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
      border: 1px solid #CBD5E1;
      margin-bottom: 7px;
    }
    thead th {
      background: #0F172A;
      color: #FFFFFF;
      padding: 5px 6px;
      text-align: left;
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border: 1px solid #334155;
    }
    thead th.col-center {
      text-align: center;
    }
    tbody td {
      padding: 4px 6px;
      border: 1px solid #E2E8F0;
      vertical-align: middle;
    }
    .col-student {
      width: 18%;
    }
    .student-name {
      font-weight: 700;
      color: #0F172A;
    }
    .student-email {
      font-size: 6.5pt;
      color: #64748B;
      font-family: monospace;
    }
    .col-team {
      width: 11%;
      font-weight: 600;
      color: #334155;
    }
    .col-center {
      text-align: center;
    }
    .col-domains {
      width: 17%;
      text-align: center;
      white-space: nowrap;
    }
    .dom-tag {
      display: inline-block;
      font-size: 6pt;
      font-family: monospace;
      padding: 1px 3px;
      border-radius: 3px;
      background: #EDF2F7;
      color: #2D3748;
      border: 1px solid #CBD5E1;
      margin: 0 1px;
    }
    .col-avis {
      width: 19%;
      font-size: 7pt;
      color: #334155;
      line-height: 1.2;
    }
    .status-pill {
      display: inline-block;
      padding: 1.5px 5px;
      border-radius: 10px;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    .status-success {
      background: #DCFCE7;
      color: #15803D;
      border: 1px solid #86EFAC;
    }
    .status-warning {
      background: #FEF3C7;
      color: #B45309;
      border: 1px solid #FCD34D;
    }
    .status-neutral {
      background: #F1F5F9;
      color: #64748B;
      border: 1px solid #CBD5E1;
    }
    .dp-score {
      font-weight: 800;
      color: #059669;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 7pt;
    }
    .text-mono {
      font-family: monospace;
      font-size: 7pt;
    }
    .text-muted {
      color: #64748B;
    }
    .text-xs {
      font-size: 6.5pt;
    }

    /* Bandeau légende & référentiel des compétences */
    .legend-container {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 5px;
      padding: 4px 8px;
      margin-bottom: 7px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 4px 8px;
      font-size: 6.5pt;
      color: #475569;
    }
    .legend-title {
      font-weight: 800;
      text-transform: uppercase;
      color: #008080;
      font-size: 6.5pt;
      letter-spacing: 0.3px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .legend-items {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 10px;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .legend-code {
      font-family: monospace;
      font-weight: 700;
      background: #EDF2F7;
      color: #1E293B;
      border: 1px solid #CBD5E1;
      padding: 0.5px 3.5px;
      border-radius: 3px;
      font-size: 6pt;
    }

    /* Cadre d'émargement et pied de page */
    .footer-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 5px;
      border-top: 1px solid #CBD5E1;
    }
    .footer-legal {
      width: 58%;
      font-size: 6.5pt;
      color: #64748B;
      line-height: 1.35;
    }
    .footer-legal strong {
      color: #334155;
    }
    .footer-signature {
      width: 38%;
      border: 1px solid #008080;
      border-radius: 6px;
      padding: 5px 9px;
      background: #F8FAFC;
    }
    .signature-title {
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #008080;
      margin-bottom: 2px;
    }
    .signature-location {
      font-size: 7pt;
      color: #475569;
    }
    .signature-line {
      margin-top: 18px;
      border-top: 1px dashed #94A3B8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2px;
      font-size: 6.5pt;
      color: #64748B;
    }
    .signature-name {
      font-weight: 700;
      color: #0F172A;
      font-size: 7.5pt;
    }
  </style>
</head>
<body>

  <!-- En-tête officiel -->
  <header class="header-container">
    <div class="header-brand">
      <div class="brand-logo-badge">FORE</div>
      <div class="brand-text">
        <h1>FORE Alternance • METAFORE</h1>
        <p>CFA & Centre de Formation Continue • Baie-Mahault / Jarry (Guadeloupe)</p>
      </div>
    </div>

    <div class="header-center">
      <div class="doc-title">Bilan d&apos;évaluation des acquis et traçabilité Qualiopi</div>
      <div class="doc-subtitle">Titre Professionnel Technicien Informatique de Proximité (TP-00476 • CCP 1)</div>
    </div>

    <div class="header-meta">
      <div>Session : <strong>${kpis.session_code}</strong></div>
      <div>Formateur référent : <strong>${kpis.formateur_nom}</strong></div>
      <div>Édité le : <strong>${todayFormatted}</strong></div>
      <span class="qualiopi-tag">Conforme Qualiopi (Ind. 8 &amp; 11)</span>
    </div>
  </header>

  <!-- Cartouches KPI synthétiques -->
  <section class="kpi-container">
    <div class="kpi-card">
      <div class="kpi-label">Indicateur 8 • Test d&apos;entrée</div>
      <div class="kpi-value">${kpis.count_passage_test} / ${kpis.total_stagiaires} stagiaires</div>
      <div class="kpi-subtext">Taux de passation diagnostique : <strong>${kpis.taux_passage_test}%</strong></div>
    </div>

    <div class="kpi-card kpi-amber">
      <div class="kpi-label">Moyenne générale promo</div>
      <div class="kpi-value">${kpis.moyenne_generale_positionnement} / 20</div>
      <div class="kpi-subtext">Diagnostic Palier 0 (Standards RAN DSI)</div>
    </div>

    <div class="kpi-card kpi-emerald">
      <div class="kpi-label">Taux de réussite au seuil</div>
      <div class="kpi-value">${tauxReussite}%</div>
      <div class="kpi-subtext">Seuil de conformité : <strong>15 / 20 (75%)</strong></div>
    </div>

    <div class="kpi-card kpi-indigo">
      <div class="kpi-label">Indicateur 11 • Dossier professionnel</div>
      <div class="kpi-value">${kpis.taux_avancement_moyen_dp}%</div>
      <div class="kpi-subtext">Progression moyenne sur les 5 rubriques Cerfa</div>
    </div>
  </section>

  <!-- Tableau matriciel de la promotion -->
  <table>
    <thead>
      <tr>
        <th class="col-student">Stagiaire (Identité)</th>
        <th class="col-team">Équipe KLF</th>
        <th class="col-center" style="width: 10%;">Date test</th>
        <th class="col-center" style="width: 10%;">Note entrée</th>
        <th class="col-center" style="width: 9%;">Positionnement</th>
        <th class="col-domains">Ventilation domaines</th>
        <th class="col-center" style="width: 8%;">Badges KLF</th>
        <th class="col-center" style="width: 7%;">DP (CCP 1)</th>
        <th class="col-avis">Avis et appréciation du formateur</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <!-- Bandeau légende & référentiel des compétences -->
  <div class="legend-container">
    <div class="legend-title">
      <span>📌 Référentiel des domaines &amp; repères d&apos;évaluation :</span>
    </div>
    <div class="legend-items">
      <div class="legend-item"><span class="legend-code">Fic</span> Hygiène fichiers &amp; Windows</div>
      <div class="legend-item"><span class="legend-code">Wrd</span> Traitement de texte &amp; publipostage (Word)</div>
      <div class="legend-item"><span class="legend-code">Xls</span> Tableur &amp; formules de calcul (Sheets / Excel)</div>
      <div class="legend-item"><span class="legend-code">DSI</span> Posture &amp; règles informatiques DSI</div>
      <div class="legend-item"><span class="legend-code">DP</span> Rubriques Cerfa validées (/5 REAC CCP 1)</div>
      <div class="legend-item"><strong>Seuil de validation :</strong> ≥ 15/20 (75%)</div>
    </div>
  </div>

  <!-- Pied de page avec cadre d'émargement et visa -->
  <footer class="footer-container">
    <div class="footer-legal">
      <p style="margin: 0 0 3px 0;">
        <strong>Cadre réglementaire :</strong> Le présent état récapitulatif est établi en application des critères 3 du <strong>Référentiel National Qualité (Qualiopi)</strong> pour les organismes de formation professionnelle (CFA).
      </p>
      <p style="margin: 0;">
        • <strong>Indicateur 8 :</strong> Traçabilité de l'évaluation diagnostique préalable et identification des besoins d'adaptation.<br>
        • <strong>Indicateur 11 :</strong> Constat formalisé de l'acquisition des compétences REAC et préparation au titre professionnel.
      </p>
    </div>

    <div class="footer-signature">
      <div class="signature-title">Visa et signature du formateur référent</div>
      <div class="signature-location">Fait à Baie-Mahault (Guadeloupe), le ${todayFormatted}</div>
      <div class="signature-line">
        <span class="signature-name">${kpis.formateur_nom}</span>
        <span>Signature &amp; Cachet</span>
      </div>
    </div>
  </footer>

</body>
</html>`;
}
