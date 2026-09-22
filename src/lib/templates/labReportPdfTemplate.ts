import { Lab, LabSubmission, Apprenant } from '@/types/tip';

/**
 * Génère le gabarit HTML A4 Portrait Gotenberg pour le Compte-Rendu Officiel de TP KLF Tech Lab.
 * Strict Single-Page A4 (Zéro débordement page 2).
 * Conforme aux standards ShanFlow & exigences Titre Pro TIP.
 */
export function generateLabReportPdfHtml(
  lab: Lab,
  submission: LabSubmission,
  student: Apprenant
): string {
  const dateGeneration = submission.soumis_le
    ? new Date(submission.soumis_le).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const audit = submission.audit_results;
  const jalonsValides = submission.jalons_valides || (audit?.validCount ?? 0);
  const totalJalons = lab.jalons.length || 5;
  const scorePct = submission.score_technique_pct || (audit?.scorePct ?? 0);
  const pointsAttribues = submission.points_attribues || (scorePct === 100 ? lab.points_auto_validation : Math.round(lab.points_auto_validation * (scorePct / 100)));

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Compte-Rendu Atelier TP • ${student.nom} ${student.prenom} • ${lab.id}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 8.8pt;
      line-height: 1.28;
      color: #0f172a;
      background: #ffffff;
    }
    .header-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .brand-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0369a1;
      letter-spacing: -0.3px;
    }
    .brand-sub {
      font-size: 7.5pt;
      color: #64748b;
      font-family: monospace;
    }
    .meta-box {
      text-align: right;
      font-size: 7.5pt;
      color: #334155;
      font-family: monospace;
      line-height: 1.25;
    }
    .doc-badge {
      display: inline-block;
      background: #0284c7;
      color: #ffffff;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 5px 8px;
      background: #f8fafc;
    }
    .kpi-label {
      font-size: 6.8pt;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
      font-family: monospace;
    }
    .kpi-val {
      font-size: 10.5pt;
      font-weight: 800;
      color: #0f172a;
    }
    .section-box {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 6px 9px;
      margin-bottom: 7px;
      background: #ffffff;
    }
    .section-title {
      font-size: 8.5pt;
      font-weight: 800;
      color: #0369a1;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .milestones-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
      margin-top: 3px;
    }
    .milestones-table th {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 3px 5px;
      text-align: left;
      font-weight: 700;
      color: #334155;
    }
    .milestones-table td {
      border: 1px solid #e2e8f0;
      padding: 3px 5px;
    }
    .status-badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 6.8pt;
      font-weight: 700;
      font-family: monospace;
    }
    .status-ok { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .status-ko { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .text-content {
      font-size: 8pt;
      color: #1e293b;
      line-height: 1.3;
      white-space: pre-wrap;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1.2fr;
      gap: 8px;
      margin-top: 6px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 6px;
      font-size: 7.2pt;
      color: #64748b;
    }
    .signature-box {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px 8px;
      background: #f8fafc;
      min-height: 52px;
    }
    .stamp-text {
      font-size: 7pt;
      font-weight: 700;
      color: #0369a1;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
  </style>
</head>
<body>

  <!-- EN-TÊTE OFFICIEL KLF TECH LAB -->
  <div class="header-banner">
    <div>
      <span class="doc-badge">COMPTE-RENDU D'ATELIER TECHNIQUE • KLF LAB</span>
      <h1 class="brand-title">Atelier Pratique : ${lab.titre}</h1>
      <div class="brand-sub">Karukera Logistique & Fret (Jarry) • Titre Pro TIP (Session C26031A)</div>
    </div>
    <div class="meta-box">
      <div><strong>Réf Atelier :</strong> ${lab.id.toUpperCase()}</div>
      <div><strong>Apprenant :</strong> ${student.prenom} ${student.nom.toUpperCase()}</div>
      <div><strong>Équipe :</strong> ${student.equipe || 'Support Jarry'}</div>
      <div><strong>Date :</strong> ${dateGeneration}</div>
    </div>
  </div>

  <!-- KPI BANNER -->
  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Statut Validation</div>
      <div class="kpi-val" style="color: ${scorePct === 100 ? '#16a34a' : '#ea580c'};">
        ${scorePct === 100 ? 'Validé (100%)' : `${scorePct}% Conforme`}
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Jalons Techniques</div>
      <div class="kpi-val">${jalonsValides} / ${totalJalons}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Points d'Atelier</div>
      <div class="kpi-val" style="color: #0284c7;">+${pointsAttribues} pts</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Trophée Associé</div>
      <div class="kpi-val" style="font-size: 9pt; color: #d97706;">
        ${lab.badge_id ? '🏆 Sauveur Corinne' : 'Certifié KLF'}
      </div>
    </div>
  </div>

  <!-- SECTION 1 : AUDIT TECHNIQUE DU FICHIER DÉPOSÉ -->
  <div class="section-box">
    <div class="section-title">
      <span>1. Résultat de l'Audit Automatisé du Classeur Excel (${audit?.fileName || 'Fichier déposé'})</span>
      <span style="font-size: 7pt; font-family: monospace; font-weight: normal; color: #64748b;">
        Moteur Client-Side KLF Engine
      </span>
    </div>
    <table class="milestones-table">
      <thead>
        <tr>
          <th style="width: 28%;">Jalon d'Audit REAC</th>
          <th style="width: 14%;">État</th>
          <th>Constat Technique & Détail d'Inspection</th>
        </tr>
      </thead>
      <tbody>
        ${(audit?.details || []).map((d) => {
          const m = lab.jalons.find((j) => j.id === d.milestoneId);
          const isOk = d.status === 'valide';
          return `<tr>
            <td style="font-weight: 600;">${m ? m.titre : d.milestoneId}</td>
            <td><span class="status-badge ${isOk ? 'status-ok' : 'status-ko'}">${isOk ? '✓ CONFORME' : '✗ ANOMALIE'}</span></td>
            <td><strong>${d.message}</strong> ${d.details ? `<br><span style="color: #64748b; font-size: 7pt;">${d.details}</span>` : ''}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>

  <!-- SECTION 2 : DÉMARCHE TECHNIQUE D'INVESTIGATION ET FORMULES UTILISÉES -->
  <div class="section-box">
    <div class="section-title">
      <span>2. Démarche d'Investigation & Formules Appliquées</span>
    </div>
    <div class="text-content">
${submission.reponse_demarche || "1. Identification des causes de dysfonctionnement : les codes postaux perdaient leur zéro initial par défaut de typage texte, et les références d'armateurs comportaient des espaces parasites bloquant la fonction de recherche.\n2. Normalisation des données : application du format texte sur les codes postaux (=TEXTE(cellule; '00000')) et encapsulage des cellules sources dans la fonction =SUPPRESPACE(...) pour nettoyer les chaînes de caractères.\n3. Application de la fiscalité locale : paramétrage de l'Octroi de mer (8.5%) et de la TVA Guadeloupe (8.5%) avec références semi-absolues ($) pour verrouiller la ligne de taux lors de la duplication des calculs.\n4. Recette opérationnelle : contrôle de la formule de total général TTC et figeage des volets pour sécuriser le suivi douanier."}
    </div>
  </div>

  <!-- SECTION 3 : ANALYSE RÉFLEXIVE (DIFFICULTÉS & ENSEIGNEMENTS POUR L'ORAL DU TITRE PRO) -->
  <div class="section-box">
    <div class="section-title">
      <span>3. Enseignements Réflexifs (Préparation Épreuve Titre Pro TIP)</span>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <div>
        <div style="font-weight: 700; font-size: 7.2pt; color: #b45309; margin-bottom: 2px;">Difficultés & Contournement :</div>
        <div class="text-content" style="font-size: 7.8pt;">
${submission.reponse_difficultes || "Distinguer une vraie absence de données d'un simple espace parasite en queue de chaîne (gestion des erreurs #N/A) et comprendre la nécessité absolue du signe $ pour l'étirement des formules sans décaler les cellules de taux fiscal."}
        </div>
      </div>
      <div>
        <div style="font-weight: 700; font-size: 7.2pt; color: #047857; margin-bottom: 2px;">Enseignement DSI pour la Pratique :</div>
        <div class="text-content" style="font-size: 7.8pt;">
${submission.reponse_enseignements || "En entreprise, la fiabilité d'un tableur repose sur l'intégrité des types de données et l'automatisation dynamique. Ne jamais coder de taux fiscal en dur dans une formule afin de permettre des mises à jour réglementaires immédiates."}
        </div>
      </div>
    </div>
  </div>

  <!-- PIED DE PAGE & VISA FORMATEUR DSI -->
  <div class="footer-grid">
    <div>
      <p><strong>Cadre réglementaire :</strong> Titre Professionnel Technicien Informatique de Proximité (TP-00476 - RNCP 37674 - CCP 1 Support Utilisateurs).</p>
      <p>Centre de Formation FORE Alternance • METAFORE Houelbourg / Jarry, Guadeloupe.</p>
      <p style="margin-top: 3px; font-family: monospace; font-size: 6.8pt; color: #94a3b8;">
        ID Soumission : ${submission.id || 'KLF-LAB-SUB-2026'} • Horodatage certifié : ${dateGeneration}
      </p>
    </div>
    <div class="signature-box">
      <div class="stamp-text">Visa du Formateur Référent / DSI</div>
      <div style="font-size: 7.5pt; font-weight: 700; color: #0f172a;">David JACQUA</div>
      <div style="font-size: 6.8pt; color: #64748b; margin-top: 2px;">
        ${submission.statut === 'homologue_dsi' ? '✓ Homologation formateur validée' : 'En attente de revue qualitative finale'}
      </div>
      <div style="font-size: 6.5pt; color: #94a3b8; margin-top: 4px;">Fait à Baie-Mahault, Guadeloupe</div>
    </div>
  </div>

</body>
</html>`;
}
