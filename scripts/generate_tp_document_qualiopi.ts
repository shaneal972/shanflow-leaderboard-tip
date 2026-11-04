import * as fs from 'fs';
import * as path from 'path';
import { FORE_LOGO_BASE64, FRANCE_TRAVAIL_LOGO_BASE64 } from '../src/lib/templates/fichesLogos';

const webhookUrl = process.env.N8N_QUALIOPI_PDF_WEBHOOK_URL || 'https://n8n.shandev.cloud/webhook/qualiopi-pdf-generate';
const bearerToken = process.env.KLF_WEBHOOK_BEARER_TOKEN || 'klf_tip_bearer_secret_2026_jarry_secure!';

const outDir = path.resolve('c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/03 - Paliers Pédagogiques/201026');

async function compilePdf(html: string, filename: string): Promise<Buffer> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({ html, filename }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur Gotenberg HTTP ${res.status}: ${err}`);
  }

  const arrBuf = await res.arrayBuffer();
  return Buffer.from(arrBuf);
}

function generateTpHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>TP Cadrage Qualiopi - Tableur DSI Obsolescence KLF</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      color: #0f172a;
      background: #fff;
      font-size: 11.5px;
      line-height: 1.45;
    }

    /* Page container */
    .page {
      width: 100%;
      height: 100%;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    /* Header Table */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #0f172a;
      margin-bottom: 8px;
    }
    .header-table td {
      border: 1.5px solid #0f172a;
      padding: 6px 12px;
      vertical-align: middle;
    }
    .logo-cell { width: 20%; text-align: center; }
    .logo-cell img { max-height: 56px; display: block; margin: 0 auto; }
    .title-cell {
      width: 58%;
      text-align: center;
      line-height: 1.3;
    }
    .main-title {
      font-size: 14.5px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #0f172a;
    }
    .sub-title {
      font-size: 10.5px;
      color: #475569;
      font-weight: 700;
      margin-top: 2px;
    }
    .tp-badge {
      display: inline-block;
      background: #0f172a;
      color: #fff;
      font-size: 10.5px;
      font-weight: 800;
      padding: 2.5px 10px;
      border-radius: 3px;
      margin-top: 3px;
      text-transform: uppercase;
    }
    .ref-cell {
      width: 22%;
      text-align: right;
      font-size: 10px;
      line-height: 1.25;
    }
    .ref-cell img { max-height: 44px; margin-top: 3px; display: inline-block; }

    /* Metadata Bar */
    .meta-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      background: #f8fafc;
      border: 1.2px solid #cbd5e1;
      padding: 6px 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 11px;
    }
    .meta-item strong { color: #0f172a; }

    /* Callout Box */
    .callout {
      background: #f0fdf4;
      border: 1.2px solid #bbf7d0;
      border-left: 4px solid #16a34a;
      padding: 7px 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 11px;
      line-height: 1.45;
    }
    .callout-title {
      font-weight: 800;
      color: #15803d;
      text-transform: uppercase;
      margin-bottom: 2px;
      font-size: 11px;
    }

    .callout-blue {
      background: #f8fafc;
      border: 1.2px solid #cbd5e1;
      border-left: 4px solid #0f172a;
    }
    .callout-blue .callout-title { color: #0f172a; }

    /* Section Styles */
    .section-header {
      background: #0f172a;
      color: #fff;
      font-size: 11.5px;
      font-weight: 800;
      padding: 4.5px 10px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin: 8px 0 6px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-header .tag {
      background: #334155;
      font-size: 9.5px;
      padding: 1.5px 6px;
      border-radius: 2px;
    }

    /* Steps & Lists */
    ul, ol { margin-left: 18px; margin-bottom: 6px; }
    li { margin-bottom: 4px; font-size: 11px; line-height: 1.45; color: #1e293b; }

    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 7px 0;
      font-size: 11px;
    }
    .data-table th, .data-table td {
      border: 1.2px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    .data-table th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 10px;
    }
    .formula-code {
      font-family: "Courier New", Courier, monospace;
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      font-size: 11.5px;
      padding: 2.5px 6px;
      border-radius: 3px;
      border: 1px solid #cbd5e1;
      display: inline-block;
    }

    /* Code Block Box */
    .code-box {
      background: #0f172a;
      color: #38bdf8;
      font-family: "Courier New", Courier, monospace;
      padding: 7px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 700;
      margin: 4px 0 6px 0;
      border-left: 3.5px solid #38bdf8;
    }

    /* Evaluation Grid */
    .eval-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 6px;
    }
    .eval-table th, .eval-table td {
      border: 1.2px solid #cbd5e1;
      padding: 4.5px 8px;
    }
    .eval-table th {
      background: #0f172a;
      color: #fff;
      font-size: 9.5px;
      text-transform: uppercase;
      font-weight: 700;
    }

    /* Sign block */
    .sign-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 7px;
      border: 1.2px dashed #94a3b8;
      border-radius: 4px;
    }
    .sign-table td {
      padding: 7px 12px;
      vertical-align: top;
      font-size: 10px;
    }

    .footer-bar {
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #64748b;
      margin-top: 6px;
    }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="page">
    <div>
      <!-- Header Table -->
      <table class="header-table">
        <tr>
          <td class="logo-cell">
            <img src="${FORE_LOGO_BASE64}" alt="FORE Alternance">
          </td>
          <td class="title-cell">
            <div class="main-title">Fiche de Travaux Pratiques & Cadrage Qualiopi</div>
            <div class="sub-title">Titre Professionnel Technicien Informatique de Proximité (TIP) • Session C26031A</div>
            <div class="tp-badge">Palier 1 : Tableur DSI & Tableau de bord d'obsolescence (KLF)</div>
          </td>
          <td class="ref-cell">
            <div><strong>RÉFÉRENTIEL REAC</strong></div>
            <div>CCP 1 • Qualiopi Ind. 4, 5, 8, 11</div>
            <img src="${FRANCE_TRAVAIL_LOGO_BASE64}" alt="France Travail">
          </td>
        </tr>
      </table>

      <!-- Metadata Bar -->
      <div class="meta-bar">
        <div class="meta-item"><strong>Date séance :</strong> 20/10/2026</div>
        <div class="meta-item"><strong>Horaire :</strong> 13h30 - 15h30 (2h00)</div>
        <div class="meta-item"><strong>Formateur :</strong> David JACQUA</div>
        <div class="meta-item"><strong>Lieu :</strong> METAFORE Jarry</div>
      </div>

      <!-- Contexte Professionnel KLF & Retour de Stage -->
      <div class="callout callout-blue">
        <div class="callout-title">🏢 Contexte professionnel d'entreprise (Karukera Logistique & Fret - Jarry)</div>
        Vous intervenez comme <strong>Technicien Informatique de Proximité junior</strong> au sein de la DSI de KLF.
        À la suite des 2 semaines d'immersion professionnelle en entreprise et du nettoyage de la base brute d'inventaire, le DSI vous confie la conception du <strong>tableau de bord de pilotage du parc</strong> pour le Comité de Direction afin d'anticiper les renouvellements 2027.
      </div>

      <!-- Objectifs Qualiopi -->
      <div class="section-header">
        <span>🎯 Objectifs opérationnels de l'épreuve pratique</span>
        <span class="tag">Qualiopi Indicateur 5</span>
      </div>
      <ul>
        <li><strong>Dénombrer et cartographier les équipements</strong> sans calcul manuel via les formules conditionnelles <code>NB.SI</code>.</li>
        <li><strong>Calculer l'âge dynamique et le taux d'obsolescence</strong> des machines par rapport à la date courante (<code>AUJOURDHUI</code>).</li>
        <li><strong>Paramétrer des alertes visuelles automatiques</strong> (mise en forme conditionnelle) pour isoler les machines critiques hors garantie.</li>
        <li><strong>Capitaliser les interventions réelles</strong> de la période en entreprise (70h PAE) pour alimenter le Dossier Professionnel (DP).</li>
      </ul>

      <!-- Étape 1 -->
      <div class="section-header">
        <span>Étape 1 : Préparation & Standardisation du classeur DSI</span>
        <span class="tag">Hygiène documentaire</span>
      </div>
      <ol>
        <li>Ouvrez votre classeur d'inventaire assaini : <code>KLF_Inventaire_Parc_Jarry_Brut.xlsx</code>.</li>
        <li>Créez un nouvel onglet nommé : <strong><code>TDB_Direction_DSI</code></strong>.</li>
        <li>Appliquez la charte graphique DSI KLF : bandeau bleu nuit (<code>#0F172A</code>), texte blanc gras, police Segoe UI / Arial 10 pt, quadrillage sobre.</li>
      </ol>

      <!-- Étape 2 -->
      <div class="section-header">
        <span>Étape 2 : Répartition des systèmes d'exploitation (Formule NB.SI)</span>
        <span class="tag">Formules statistiques</span>
      </div>
      <p style="margin-bottom: 4px; font-size: 11px;">Construisez dans l'onglet <code>TDB_Direction_DSI</code> le tableau récapitulatif automatisé suivant :</p>
      
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 36%;">Système d'exploitation (OS)</th>
            <th style="width: 20%; text-align: center;">Nombre de postes</th>
            <th style="width: 44%;">Formule exacte à implémenter</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Windows 10</strong> (Parc en migration critique)</td>
            <td style="text-align: center; color: #64748b; font-style: italic;">[Calcul automatique]</td>
            <td><span class="formula-code">=NB.SI(Inventaire!D2:D50; "Windows 10")</span></td>
          </tr>
          <tr>
            <td><strong>Windows 11</strong> (Standard de déploiement DSI)</td>
            <td style="text-align: center; color: #64748b; font-style: italic;">[Calcul automatique]</td>
            <td><span class="formula-code">=NB.SI(Inventaire!D2:D50; "Windows 11")</span></td>
          </tr>
          <tr>
            <td><strong>Autre / Linux / macOS</strong></td>
            <td style="text-align: center; color: #64748b; font-style: italic;">[Calcul automatique]</td>
            <td><span class="formula-code">=NB.SI(Inventaire!D2:D50; "Autre")</span></td>
          </tr>
          <tr style="background: #f8fafc; font-weight: bold;">
            <td>TOTAL GÉNÉRAL DU PARC</td>
            <td style="text-align: center; color: #0f172a;">[Somme]</td>
            <td><span class="formula-code">=SOMME(B4:B6)</span></td>
          </tr>
        </tbody>
      </table>

      <!-- Règle d'or syntaxique -->
      <div class="callout" style="margin-top: 6px;">
        <div class="callout-title">⚠️ Règle d'or syntaxique du technicien support (Anti-Erreurs)</div>
        Dans <code>NB.SI(plage; critère)</code>, n'oubliez <strong>jamais les guillemets</strong> autour des critères textuels ou logiques (ex: <code>"Windows 10"</code> ou <code>">=5"</code>). Si vous cliquez sur une cellule contenant le libellé, les guillemets sont proscrits.
      </div>
    </div>

    <div class="footer-bar">
      <span>Session TIP2 • FORE Alternance Jarry • Document de cadrage TP Qualiopi</span>
      <span>Page 1 / 2</span>
    </div>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page">
    <div>
      <!-- Étape 3 -->
      <div class="section-header">
        <span>Étape 3 : Calcul d'ancienneté dynamique & Taux d'obsolescence</span>
        <span class="tag">Aide à la décision</span>
      </div>
      <p style="margin-bottom: 4px; font-size: 11px;">Le DSI doit anticiper le renouvellement des machines ayant <strong>5 ans d'âge ou plus</strong> :</p>
      
      <ol>
        <li>Dans l'onglet principal <code>Inventaire</code>, insérez une colonne <strong>Âge du poste (années)</strong>.</li>
        <li>Écrivez la formule dynamique calculant l'écart entre l'année de mise en service et l'année courante :</li>
      </ol>
      <div class="code-box">
        =ANNEE(AUJOURDHUI()) - ANNEE(Date_Mise_En_Service)
      </div>

      <ol start="3">
        <li>Dans l'onglet <code>TDB_Direction_DSI</code>, créez le bloc d'indicateurs de pilotage :
          <ul style="margin-top: 3px;">
            <li><strong>Postes vétustes (>= 5 ans) :</strong> <span class="formula-code">=NB.SI(Inventaire!H2:H50; ">=5")</span></li>
            <li><strong>Taux d'obsolescence global (%) :</strong> <span class="formula-code">=(Nombre_Postes_Obsolètes / Total_Parc)</span> <em>(Format Pourcentage 1 décimale)</em>.</li>
          </ul>
        </li>
      </ol>

      <!-- Étape 4 -->
      <div class="section-header">
        <span>Étape 4 : Alertes visuelles automatiques (Mise en forme conditionnelle)</span>
        <span class="tag">Lisibilité DSI</span>
      </div>
      <ol>
        <li>Sélectionnez la colonne d'âge des équipements dans l'inventaire.</li>
        <li>Appliquez une règle de <strong>mise en forme conditionnelle</strong> :
          <ul style="margin-top: 3px;">
            <li><strong>Condition rouge (Urgence) :</strong> Valeur de cellule <code>>= 5</code> ➔ Remplissage rouge pastel, texte rouge foncé.</li>
            <li><strong>Condition verte (Sécurisé) :</strong> Postes sous garantie constructeur active ➔ Remplissage vert clair, texte vert foncé.</li>
          </ul>
        </li>
        <li><strong>Épreuve du crash-test :</strong> Modifiez temporairement une date d'achat ; la cellule doit commuter automatiquement de couleur.</li>
      </ol>

      <!-- Étape 5 -->
      <div class="section-header">
        <span>Étape 5 : Traçabilité documentaire & Dépôt sécurisé Drive</span>
        <span class="tag">Qualiopi Indicateur 11</span>
      </div>
      <ul>
        <li>Enregistrez votre classeur finalisé selon la norme DSI KLF :<br>
          <span class="formula-code" style="font-size: 11.5px; margin-top: 2px;">NOM_Prenom_TP_Tableur_Obsolescence_20102026.xlsx</span>
        </li>
        <li>Déposez le fichier dans votre casier Google Drive de session avant <strong>15h30</strong>.</li>
      </ul>

      <!-- Grille d'évaluation continue Qualiopi -->
      <div class="section-header" style="margin-top: 8px;">
        <span>📊 Grille d'évaluation formative continue & Visa formateur</span>
        <span class="tag">Critère 3 Qualiopi</span>
      </div>

      <table class="eval-table">
        <thead>
          <tr>
            <th style="width: 32%;">Compétence technique observée</th>
            <th style="width: 48%;">Indicateur de réussite Qualiopi (REAC CCP 1)</th>
            <th style="width: 20%; text-align: center;">Évaluation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Restitution & Débriefing Stage</strong></td>
            <td>Capacité à décrire une panne vécue en entreprise exploitable pour le DP.</td>
            <td style="text-align: center;">[ ] Acquis &nbsp; [ ] En cours</td>
          </tr>
          <tr>
            <td><strong>2. Syntaxe & Logique NB.SI</strong></td>
            <td>Utilisation exacte des plages et critères sans erreur de formule (<code>#VALEUR!</code>).</td>
            <td style="text-align: center;">[ ] Acquis &nbsp; [ ] En cours</td>
          </tr>
          <tr>
            <td><strong>3. Calcul dynamique obsolescence</strong></td>
            <td>Emploi correct de <code>AUJOURDHUI()</code> et calcul d'écart d'années par rapport au parc.</td>
            <td style="text-align: center;">[ ] Acquis &nbsp; [ ] En cours</td>
          </tr>
          <tr>
            <td><strong>4. Alertes conditionnelles</strong></td>
            <td>Basculement dynamique de la couleur selon le seuil critique (>= 5 ans).</td>
            <td style="text-align: center;">[ ] Acquis &nbsp; [ ] En cours</td>
          </tr>
          <tr>
            <td><strong>5. Rigueur de dépôt Drive</strong></td>
            <td>Respect de la nomenclature de fichier et livraison à l'heure dans le casier.</td>
            <td style="text-align: center;">[ ] Acquis &nbsp; [ ] En cours</td>
          </tr>
        </tbody>
      </table>

      <!-- Cadre d'émargement / visa formateur -->
      <table class="sign-table">
        <tr>
          <td style="width: 50%;">
            <strong>Observations & Remédiation individualisée :</strong><br>
            <div style="height: 24px; border-bottom: 1px dotted #cbd5e1; margin-top: 4px;"></div>
          </td>
          <td style="width: 50%; text-align: right;">
            <strong>Visa & Signature du Formateur Référent :</strong><br>
            <div style="font-size: 10px; color: #475569; margin-top: 2px;">David JACQUA • METAFORE Jarry</div>
            <div style="height: 18px;"></div>
          </td>
        </tr>
      </table>
    </div>

    <div class="footer-bar">
      <span>Titre Pro Technicien Informatique de Proximité (TIP) • Ministère du Travail • Qualiopi Ind. 11</span>
      <span>Page 2 / 2</span>
    </div>
  </div>

</body>
</html>`;
}

async function run() {
  console.log('🚀 Démarrage de la recompilation du Document TP Qualiopi (Polices agrandies)...');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const html = generateTpHtml();
  const htmlPath = path.join(outDir, 'TP_Consignes_Tableur_DSI_Obsolescence_201026.html');
  const pdfPath = path.join(outDir, 'TP_Consignes_Tableur_DSI_Obsolescence_201026.pdf');

  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('  📄 Fichier HTML généré avec succès !');

  console.log('  ⏳ Compilation Gotenberg Chromium vers PDF...');
  const pdfBuf = await compilePdf(html, 'TP_Consignes_Tableur_DSI_Obsolescence_201026.pdf');
  fs.writeFileSync(pdfPath, pdfBuf);
  console.log(`  ✅ PDF généré avec succès (${(pdfBuf.length / 1024).toFixed(1)} Ko) !`);
}

run().catch(console.error);
