import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { FORE_LOGO_BASE64, FRANCE_TRAVAIL_LOGO_BASE64 } from '../src/lib/templates/fichesLogos';
import { LAB_BUR_03_QUAI3 } from '../src/lib/lab/labData';
import { generateQuai3BrutWorkbook, buildQuai3CorrigeWorkbook, QUAI3_ROWS } from '../src/lib/lab/quai3Workbook';
import { buildQuai3BrutDocxBuffer, buildQuai3CorrigeDocxBuffer } from '../src/lib/lab/quai3Docx';
import { auditQuai3Excel, auditQuai3Docx } from '../src/lib/lab/quai3AuditEngine';

const targetBrainDir = path.resolve(
  'c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/03 - Paliers Pédagogiques/101126'
);

const webhookUrl =
  process.env.N8N_QUALIOPI_PDF_WEBHOOK_URL ||
  'https://n8n.shandev.cloud/webhook/qualiopi-pdf-generate';
const bearerToken =
  process.env.KLF_WEBHOOK_BEARER_TOKEN ||
  'klf_tip_bearer_secret_2026_jarry_secure!';

function parseEnvLocal(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const vars: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return vars;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const idx = line.indexOf('=');
    if (idx > 0 && !line.trim().startsWith('#')) {
      vars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return vars;
}

function assertLiveFormulas(filePath: string, expectedCoords: string[]) {
  const wb = XLSX.readFile(filePath, { cellFormula: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const missing: string[] = [];
  for (const coord of expectedCoords) {
    const cell = sheet[coord];
    if (!cell || !cell.f) {
      missing.push(coord);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Échec audit formule : cellules sans .f dans ${path.basename(filePath)} -> ${missing.join(', ')}`);
  }
}

async function compileGotenbergPdf(html: string, outPath: string, filename: string) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({ html, filename }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Erreur Gotenberg HTTP ${res.status}: ${txt}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0 || !buf.slice(0, 5).toString('utf8').includes('%PDF-')) {
    throw new Error(`PDF invalide retourné par Gotenberg pour ${filename}`);
  }
  fs.writeFileSync(outPath, buf);
  console.log(`✅ PDF compilé (${(buf.length / 1024).toFixed(1)} Ko) : ${outPath}`);
}

function buildMemoHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche Mémo Anti-Jargon — Word, Excel, Docs & Sheets</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, "Segoe UI", sans-serif; color: #0f172a; font-size: 9pt; line-height: 1.32; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #0284c7; padding-bottom: 6px; margin-bottom: 8px; }
    .header img { height: 34px; }
    .header-title { text-align: center; }
    .header-title h1 { font-size: 12pt; color: #0369a1; font-weight: 800; }
    .header-title p { font-size: 7.5pt; color: #475569; }
    h2 { font-size: 9.5pt; background: #0369a1; color: #fff; padding: 3px 8px; border-radius: 4px; margin: 7px 0 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 8pt; }
    th, td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
    code { font-family: Consolas, monospace; background: #f1f5f9; padding: 1px 3px; border-radius: 3px; color: #0369a1; font-size: 7.8pt; }
    .page-break { page-break-before: always; }
    .tip { background: #ecfdf5; border-left: 3px solid #10b981; padding: 5px 8px; font-size: 8.2pt; margin: 5px 0; }
    .footer { margin-top: 8px; border-top: 1px solid #cbd5e1; padding-top: 4px; font-size: 7.5pt; color: #64748b; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${FORE_LOGO_BASE64}" alt="FORE" />
    <div class="header-title">
      <h1>FICHE MÉMO « ZÉRO JARGON » — TABLEUR &amp; TRAITEMENT DE TEXTE</h1>
      <p>KLF Technologies • Promotion TIP-2026 (C26031A) • Séance du 10 novembre 2026</p>
    </div>
    <img src="${FRANCE_TRAVAIL_LOGO_BASE64}" alt="France Travail" />
  </div>

  <h2>1. Les 12 mots difficiles traduits en français simple</h2>
  <table>
    <thead>
      <tr><th style="width:26%">Mot technique</th><th style="width:44%">Ce que ça veut vraiment dire</th><th style="width:30%">Exemple concret Quai n°3</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Cellule (G4)</strong></td><td>Une petite « boîte » du tableau qui croise une colonne (lettre) et une ligne (chiffre).</td><td><code>G4</code> = Colonne G, Ligne 4.</td></tr>
      <tr><td><strong>Plage (G4:G15)</strong></td><td>Un groupe de boîtes voisines. Le signe <code>:</code> signifie « jusqu’à ».</td><td>De la case G4 jusqu’à la case G15.</td></tr>
      <tr><td><strong>Référence absolue ($J$2)</strong></td><td>Poser deux « cadenas » (<code>$</code>) avec la touche <code>F4</code> pour bloquer une case lors de la recopie.</td><td>Empêche le taux 8,5 % de glisser en bas.</td></tr>
      <tr><td><strong>Point-virgule ( ; )</strong></td><td>Sépare les différents morceaux d’une formule (en français).</td><td><code>=SI(test ; si_oui ; si_non)</code></td></tr>
      <tr><td><strong>Texte vs Nombre</strong></td><td>Un nombre sert à calculer (aligné à droite). Un mot dans une formule s’écrit entre guillemets <code>" "</code>.</td><td><code>"SURCHARGE"</code> ou code <code>'01234</code>.</td></tr>
      <tr><td><strong>Mise en forme conditionnelle</strong></td><td>Un « feu tricolore automatique » qui colorie une case selon sa valeur.</td><td>Rouge si surcharge, Vert si OK.</td></tr>
      <tr><td><strong>Liste déroulante</strong></td><td>Menu à flèche qui force un choix exact pour éviter toute faute de frappe.</td><td>Choisir <code>Z-A</code>, <code>Z-B</code>, <code>Z-C</code>, <code>Z-D</code>.</td></tr>
      <tr><td><strong>Erreurs #N/A, ###, #VALEUR!</strong></td><td><code>###</code> = colonne trop étroite • <code>#N/A</code> = non trouvé • <code>#VALEUR!</code> = calcul avec un mot.</td><td>Double-clic sur le bord de la colonne contre <code>###</code>.</td></tr>
      <tr><td><strong>Styles (Titre 1 / Titre 2)</strong></td><td>Étiquettes officielles des chapitres pour permettre la création du sommaire automatique.</td><td>Ne jamais juste mettre du gras à la main !</td></tr>
      <tr><td><strong>Saut de page (Ctrl + Entrée)</strong></td><td>Passer proprement à la page suivante d’un seul coup (sans 15 appuis sur Entrée).</td><td>Garde la mise en page fixe.</td></tr>
      <tr><td><strong>Sommaire automatique</strong></td><td>Index qui lit vos Styles et place tout seul les titres avec les bons numéros de page.</td><td>Word : Références • Docs : Insertion.</td></tr>
      <tr><td><strong>Export PDF</strong></td><td>Figer le document comme une photo imprimée pour qu’il ne bouge chez personne.</td><td>Fichier &gt; Exporter / Télécharger en PDF.</td></tr>
    </tbody>
  </table>

  <div class="tip">
    <strong>Astuce d’or :</strong> Tout ce TP fonctionne à l’identique dans <strong>Microsoft Office (Word / Excel)</strong> et dans <strong>Google Workspace (Docs / Sheets)</strong>.
  </div>

  <div class="page-break"></div>

  <h2>2. Les 7 formules lues à voix haute (Excel = Google Sheets)</h2>
  <table>
    <thead>
      <tr><th style="width:36%">Formule à taper</th><th style="width:64%">Traduction en français + Oups ! En cas de souci</th></tr>
    </thead>
    <tbody>
      <tr><td><code>=E4*F4</code></td><td><strong>Multiplie</strong> le nombre de colis par le poids d’un colis.<br><em>Oups :</em> si <code>#VALEUR!</code>, vérifiez qu’aucune lettre n’est tapée en E4 ou F4.</td></tr>
      <tr><td><code>=I4*$J$2</code></td><td><strong>Multiplie</strong> le Montant HT par la TVA bloquée (<code>$J$2</code> via <code>F4</code>).<br><em>Oups :</em> si les lignes suivantes donnent 0 €, vous avez oublié les <code>$</code>.</td></tr>
      <tr><td><code>=SI(G4&gt;$H$2;"SURCHARGE - 2 PASSAGES";"OK CHARIOT")</code></td><td><strong>SI</strong> le poids dépasse 2 500 kg, <strong>ALORS</strong> alerte surcharge, <strong>SINON</strong> OK.<br><em>Oups :</em> si <code>#NOM?</code>, remettez les guillemets autour des textes.</td></tr>
      <tr><td><code>=SIERREUR(RECHERCHEV(SUPPRESPACE(C4);Zones_Quais!$A$3:$C$6;2;FAUX);"Zone inconnue")</code></td><td><strong>Nettoie</strong> les espaces en trop, <strong>cherche</strong> le code zone exact dans le 2e onglet, et affiche un texte propre si absent (<code>SIERREUR</code>).</td></tr>
      <tr><td><code>=SOMME(G4:G15)</code></td><td><strong>Additionne</strong> tous les poids de la plage G4 jusqu’à G15.</td></tr>
      <tr><td><code>=MOYENNE(G4:G15)</code> / <code>=MAX(...)</code> / <code>=MIN(...)</code></td><td>Calcule la <strong>moyenne</strong>, trouve le record (<strong>plus lourd</strong>) et le <strong>plus léger</strong>.</td></tr>
      <tr><td><code>=NB.SI(H4:H15;"SURCHARGE - 2 PASSAGES")</code></td><td><strong>Compte</strong> combien de palettes affichent exactement le texte d’alerte rouge.</td></tr>
    </tbody>
  </table>

  <h2>3. Passerelle des menus : Microsoft Office ↔ Google Workspace</h2>
  <table>
    <thead>
      <tr><th style="width:30%">Je veux faire…</th><th style="width:35%">Dans Microsoft Excel / Word</th><th style="width:35%">Dans Google Sheets / Docs</th></tr>
    </thead>
    <tbody>
      <tr><td>Ouvrir le fichier brut fourni</td><td>Double-clic direct sur le fichier téléchargé</td><td><code>Fichier &gt; Importer</code> (ou Ouvrir avec Sheets/Docs)</td></tr>
      <tr><td>Figer les titres du haut</td><td><code>Affichage &gt; Figer les volets</code></td><td><code>Affichage &gt; Figer &gt; Jusqu’à la ligne 3</code></td></tr>
      <tr><td>Liste déroulante</td><td><code>Données &gt; Validation des données &gt; Liste</code></td><td><code>Insertion &gt; Liste déroulante</code></td></tr>
      <tr><td>Feux rouges/verts automatiques</td><td><code>Accueil &gt; Mise en forme conditionnelle</code></td><td><code>Format &gt; Mise en forme conditionnelle</code></td></tr>
      <tr><td>Voir les espaces cachés</td><td>Bouton <strong>¶ (Afficher tout)</strong> dans Accueil</td><td><code>Affichage &gt; Afficher les caractères non imprimables</code></td></tr>
      <tr><td>Appliquer Titre 1 / Titre 2</td><td><code>Accueil &gt; Styles</code></td><td>Menu déroulant <code>Texte normal &gt; Titre 1 / Titre 2</code></td></tr>
      <tr><td>Sommaire automatique</td><td><code>Références &gt; Table des matières</code></td><td><code>Insertion &gt; Table des matières</code></td></tr>
      <tr><td>Tester dans KLF Tech Lab</td><td>Enregistrer normalement (<code>.xlsx</code> / <code>.docx</code>)</td><td><code>Fichier &gt; Télécharger &gt; Microsoft Excel / Word</code></td></tr>
    </tbody>
  </table>

  <div class="footer">
    <span>Plateforme interactive : klf-leaderboard • Onglet Tech Lab (tp-bur-03-quai3-pack)</span>
    <span>Document pédagogique conforme Qualiopi • David JACQUA</span>
  </div>
</body>
</html>`;
}

function buildTpGuideHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>TP Guidé 4h — Word, Excel, Docs & Sheets (Quai n°3 KLF)</title>
  <style>
    @page { size: A4 portrait; margin: 11mm 13mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, "Segoe UI", sans-serif; color: #0f172a; font-size: 9.2pt; line-height: 1.36; }
    .banner { border: 2px solid #0f172a; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; background: #f8fafc; }
    .banner img { height: 38px; }
    .banner-mid { text-align: center; padding: 0 8px; }
    .banner-mid h1 { font-size: 12pt; color: #0369a1; font-weight: 800; }
    .banner-mid p { font-size: 7.8pt; color: #475569; margin-top: 2px; }
    .context-box { background: #ecfeff; border: 1px solid #06b6d4; border-left: 4px solid #0284c7; padding: 7px 10px; border-radius: 4px; margin-bottom: 10px; font-size: 8.6pt; }
    h2 { font-size: 10.5pt; color: #ffffff; background: #0f172a; padding: 4px 10px; border-radius: 4px; margin: 10px 0 6px; }
    h3 { font-size: 9.5pt; color: #0369a1; margin: 7px 0 3px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; }
    .step-card { border: 1px solid #cbd5e1; border-radius: 5px; padding: 6px 9px; margin-bottom: 6px; page-break-inside: avoid; }
    .formula-bar { font-family: Consolas, monospace; background: #0f172a; color: #fbbf24; padding: 4px 8px; border-radius: 4px; font-size: 8.3pt; margin: 4px 0; }
    .speak { background: #f0fdf4; border-left: 3px solid #16a34a; padding: 3px 7px; font-size: 8.3pt; margin: 3px 0; }
    .oops { background: #fef2f2; border-left: 3px solid #dc2626; padding: 3px 7px; font-size: 8pt; color: #7f1d1d; margin-top: 3px; }
    .page-break { page-break-before: always; }
    ul, ol { margin-left: 18px; margin-bottom: 5px; }
    li { margin-bottom: 2px; }
    .check-row { font-size: 8.3pt; border-bottom: 1px dashed #cbd5e1; padding: 3px 0; }
  </style>
</head>
<body>
  <div class="banner">
    <img src="${FORE_LOGO_BASE64}" alt="FORE" />
    <div class="banner-mid">
      <h1>TP GUIDÉ 4H00 : WORD, EXCEL, GOOGLE DOCS &amp; SHEETS</h1>
      <p>Mission TCK-105 • Sécurité &amp; Documentation du Quai n°3 (Jarry) • 10 novembre 2026 (08h30 – 12h30)</p>
    </div>
    <img src="${FRANCE_TRAVAIL_LOGO_BASE64}" alt="France Travail" />
  </div>

  <div class="context-box">
    <strong>Votre mission sur klf-leaderboard (Tech Lab ➔ Atelier Quai n°3) :</strong> Les caristes de Jarry travaillent sur Excel/Word au bureau et sur Google Sheets/Docs sur tablette.
    Vous disposez de <strong>4h00 (pause 10h00–10h20 incluse)</strong> pour :
    <br/>1) <strong>Acte 1 (08h45–11h00) :</strong> Compléter et sécuriser le classeur de suivi des palettes (<code>KLF_Palette_Quai3_BRUT_101126.xlsx</code>).
    <br/>2) <strong>Acte 2 (11h00–12h10) :</strong> Réparer et illustrer le mode d’emploi cariste (<code>KLF_Guide_Caristes_BRUT_101126.docx</code>).
    <br/>3) <strong>Acte 3 (12h10–12h30) :</strong> Valider vos deux fichiers dans l’auto-auditeur du Tech Lab, compléter votre carnet et déposer vos fichiers dans votre Drive.
  </div>

  <h2>ACTE 1 — Le calculateur sécurité du Quai n°3 (Excel ou Google Sheets)</h2>

  <div class="step-card">
    <h3>Étape 1.1 • Ouvrir le fichier et calculer le Poids Total (Colonne G)</h3>
    <p>Téléchargez <code>KLF_Palette_Quai3_BRUT_101126.xlsx</code> depuis Tech Lab. (Sur Google Sheets : <em>Fichier &gt; Importer</em>).</p>
    <div class="speak"><strong>En français :</strong> « Poids Total = Nombre de colis multiplié par Poids d’un colis ».</div>
    <div class="formula-bar">Cellule G4 : =E4*F4   (puis étirer vers le bas jusqu’en G15)</div>
  </div>

  <div class="step-card">
    <h3>Étape 1.2 • Calculer la TVA 8,5 % bloquée avec le cadenas $ (Colonnes J et K)</h3>
    <p>La TVA Guadeloupe (8,5 %) est écrite en haut dans la case <code>J2</code>. Si vous ne la verrouillez pas, elle va glisser à la recopie !</p>
    <div class="speak"><strong>En français :</strong> « Montant HT multiplié par la case bloquée $J$2 (appuyez sur F4 juste après avoir cliqué sur J2) ».</div>
    <div class="formula-bar">Cellule J4 : =I4*$J$2   |   Cellule K4 (Total TTC) : =I4+J4</div>
    <div class="oops"><strong>Oups !</strong> Si J5 affiche 0 €, c’est que vous avez oublié la touche F4 ($). Corrigez J4 et recopiez.</div>
  </div>

  <div class="step-card">
    <h3>Étape 1.3 • Alerte sécurité chariot &gt; 2 500 kg avec =SI (Colonne H)</h3>
    <p>Un chariot élévateur du quai ne peut soulever plus de 2 500 kg (seuil stocké en case bloquée <code>$H$2</code>).</p>
    <div class="speak"><strong>En français :</strong> « SI le poids G4 dépasse H2 (2 500), ALORS écris SURCHARGE - 2 PASSAGES, SINON écris OK CHARIOT ».</div>
    <div class="formula-bar">Cellule H4 : =SI(G4&gt;$H$2; "SURCHARGE - 2 PASSAGES"; "OK CHARIOT")</div>
    <div class="oops"><strong>Oups !</strong> Si vous voyez #NOM?, vérifiez bien que les deux textes sont entre guillemets <code>" "</code>.</div>
  </div>

  <div class="step-card">
    <h3>Étape 1.4 • Nom de zone automatique sans erreur #N/A (Colonne D)</h3>
    <p>La palette <code>PAL-303</code> a un espace caché après <code>Z-A </code>, et <code>PAL-310</code> a un code erroné <code>Z-99</code>. Utilisons le trio magique <strong>SUPPRESPACE + RECHERCHEV + SIERREUR</strong> :</p>
    <div class="formula-bar">Cellule D4 : =SIERREUR(RECHERCHEV(SUPPRESPACE(C4); Zones_Quais!$A$3:$C$6; 2; FAUX); "Zone inconnue")</div>
  </div>

  <div class="step-card">
    <h3>Étape 1.5 • Statistiques du bas, feux rouges/verts, liste déroulante &amp; graphique</h3>
    <ul>
      <li><strong>Lignes 18 à 23 (colonne B) :</strong> <code>=SOMME(G4:G15)</code> (26 065) • <code>=MOYENNE(G4:G15)</code> (2 172,08) • <code>=MAX(G4:G15)</code> (3 600) • <code>=MIN(G4:G15)</code> (600) • <code>=NB.SI(H4:H15;"SURCHARGE - 2 PASSAGES")</code> (4) • <code>=SOMME(K4:K15)</code> (17 202,68 €).</li>
      <li><strong>Feux tricolores (H4:H15) :</strong> Mise en forme conditionnelle (SURCHARGE en rouge, OK CHARIOT en vert).</li>
      <li><strong>Figer la ligne 3</strong> (Affichage &gt; Figer) + <strong>Liste déroulante</strong> en C4:C15 + <strong>Graphique en barres</strong> (N° Palette + Poids Total).</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <h2>ACTE 2 — Rédiger le guide illustré des caristes (Word ou Google Docs)</h2>

  <div class="step-card">
    <h3>Étape 2.1 • Nettoyer le document brut</h3>
    <ol>
      <li>Téléchargez <code>KLF_Guide_Caristes_BRUT_101126.docx</code> depuis Tech Lab (dans Google Docs : importez-le dans Drive et ouvrez-le avec Docs).</li>
      <li>Activez <strong>¶</strong> (Word) pour voir les défauts cachés. Supprimez les 10 appuis <code>Entrée</code> vides sous l’en-tête et corrigez les doubles espaces (<code>Ctrl + H</code>).</li>
    </ol>
  </div>

  <div class="step-card">
    <h3>Étape 2.2 • Appliquer de vrais Styles, un Saut de page et le Sommaire</h3>
    <ol>
      <li>Appliquez le style <strong>Titre 1</strong> sur le titre principal et les chapitres <code>1.</code>, <code>2.</code>, <code>3.</code>, <code>4.</code> ; appliquez <strong>Titre 2</strong> sur <code>1.1</code>.</li>
      <li>Placez le curseur juste avant le chapitre <code>1.</code> et faites <strong>Ctrl + Entrée</strong> (vrai saut de page).</li>
      <li>Revenez en page 1 et insérez le sommaire : <em>Références &gt; Table des matières</em> (Word) ou <em>Insertion &gt; Table des matières</em> (Google Docs).</li>
    </ol>
  </div>

  <div class="step-card">
    <h3>Étape 2.3 • Captures d’écran (Win + Maj + S), mini-tableau &amp; PDF</h3>
    <ol>
      <li>Sur votre tableur de l’Acte 1, appuyez sur <strong>Win + Maj + S</strong> pour capturer votre tableau avec ses alertes rouges/vertes, puis collez (<code>Ctrl + V</code>) à la place du marqueur Capture 1. Répétez pour votre graphique (Capture 2).</li>
      <li>Copiez la synthèse <code>A18:B23</code> depuis votre tableur et collez-la à la place du marqueur Mini-tableau.</li>
      <li>Ajoutez un <strong>en-tête</strong> (« KLF Technologies — Quai n°3 ») et les <strong>numéros de page</strong> en pied de page, puis exportez en <strong>PDF</strong> (et en <strong>.docx</strong> pour l’auto-audit).</li>
    </ol>
  </div>

  <h2>ACTE 3 — Auto-contrôle 10 points &amp; Dépôt sur klf-leaderboard</h2>
  <div class="step-card">
    <div class="check-row">☐ 1. Aucun message d’erreur (#N/A, #VALEUR!, ###) visible dans mon tableur.</div>
    <div class="check-row">☐ 2. Les formules de TVA et limite 2 500 kg utilisent le cadenas $ ($J$2 et $H$2).</div>
    <div class="check-row">☐ 3. PAL-303 affiche « Quai Conteneurs Nord » et PAL-310 affiche « Zone inconnue ».</div>
    <div class="check-row">☐ 4. Les alertes passent en rouge / vert et un graphique en barres est visible.</div>
    <div class="check-row">☐ 5. Le document Word/Docs n’a plus de lignes vides d’espacement et utilise Ctrl + Entrée.</div>
    <div class="check-row">☐ 6. Vrais Styles Titre 1 / Titre 2 + Sommaire automatique présents.</div>
    <div class="check-row">☐ 7. 2 captures d’écran propres + le mini-tableau de synthèse sont insérés.</div>
    <div class="check-row">☐ 8. J’ai déposé mes deux fichiers (.xlsx et .docx) dans Tech Lab (Score 6/6 jalons = 100 %).</div>
    <div class="check-row">☐ 9. J’ai rédigé mon compte-rendu au « Je » dans le Carnet de Laboratoire et cliqué sur Enregistrer.</div>
    <div class="check-row">☐ 10. J’ai déposé mes fichiers finaux (et export PDF) dans mon casier Google Drive avant 12h30.</div>
  </div>
</body>
</html>`;
}

async function run() {
  fs.mkdirSync(targetBrainDir, { recursive: true });
  const env = parseEnvLocal();

  // 1. Génération & audit strict des classeurs Excel
  const brutXlsxPath = path.join(targetBrainDir, 'KLF_Palette_Quai3_BRUT_101126.xlsx');
  const corrigeXlsxPath = path.join(targetBrainDir, 'KLF_Palette_Quai3_CORRIGE_DSI_101126.xlsx');

  const wbBrut = generateQuai3BrutWorkbook();
  XLSX.writeFile(wbBrut, brutXlsxPath);

  const wbCorrige = buildQuai3CorrigeWorkbook();
  XLSX.writeFile(wbCorrige, corrigeXlsxPath);

  const expectedFormulaCoords = [
    ...QUAI3_ROWS.flatMap((r) => [`D${r.row}`, `G${r.row}`, `H${r.row}`, `J${r.row}`, `K${r.row}`]),
    'B18', 'B19', 'B20', 'B21', 'B22', 'B23',
  ];
  assertLiveFormulas(corrigeXlsxPath, expectedFormulaCoords);
  console.log(`✅ Audit formules OpenXML vives (${expectedFormulaCoords.length}/${expectedFormulaCoords.length} cellules .f OK)`);

  // Test du moteur client-side sur le corrigé
  const corrigeXlsxBuf = fs.readFileSync(corrigeXlsxPath);
  const corrigeXlsxAb = Uint8Array.from(corrigeXlsxBuf).buffer;
  const excelAuditRes = await auditQuai3Excel(
    corrigeXlsxAb,
    'KLF_Palette_Quai3_CORRIGE_DSI_101126.xlsx',
    corrigeXlsxBuf.length
  );
  console.log('🧪 Audit moteur Acte 1 sur CORRIGE:', excelAuditRes.validCount, '/', excelAuditRes.milestonesCount, `(${excelAuditRes.scorePct}%)`);
  if (!excelAuditRes.isFullyValid) {
    console.error(excelAuditRes.details);
    throw new Error('Le corrigé Quai 3 devrait obtenir 4/4 sur le moteur auditQuai3Excel !');
  }

  // 2. Génération des .docx dans Obsidian-Brain/101126
  const brutDocxPath = path.join(targetBrainDir, 'KLF_Guide_Caristes_BRUT_101126.docx');
  const corrigeDocxPath = path.join(targetBrainDir, 'KLF_Guide_Caristes_CORRIGE_DSI_101126.docx');
  const brutDocBuf = buildQuai3BrutDocxBuffer();
  const corrigeDocBuf = buildQuai3CorrigeDocxBuffer();
  fs.writeFileSync(brutDocxPath, brutDocBuf);
  fs.writeFileSync(corrigeDocxPath, corrigeDocBuf);

  const brutDocAb = Uint8Array.from(brutDocBuf).buffer;
  const docxBrutAudit = await auditQuai3Docx(
    brutDocAb,
    'BRUT.docx',
    brutDocBuf.length
  );
  console.log('🧪 Audit moteur Acte 2 sur BRUT:', docxBrutAudit.validCount, '/ 2 (attendu 0)');

  // 2bis. Génération des notes Markdown Obsidian-Brain
  const ficheAnimMd = `---
title: Palier 2 - Séance 09 - Fiche d'animation formateur (10-11-2026)
date: 2026-11-10
type: fiche_animation_formateur
statut: pret_pour_cours
tags:
  - pedagogie
  - animation
  - word
  - excel
  - google-docs
  - google-sheets
  - zero-jargon
  - klf
  - tip2
  - qualiopi
---

# Fiche d'animation formateur : Pack 4h Word, Excel, Google Docs & Google Sheets « Zéro Jargon » (Quai n°3)

> [!IMPORTANT] Cadrage de la matinée (08h30 – 12h30 | 4h00)
> - **Centre :** METAFORE Houelbourg / FORE Alternance Jarry (Guadeloupe)
> - **Promotion :** TIP-2026 (Session C26031A) • **Formateur :** David JACQUA
> - **Atelier interactif sur \`klf-leaderboard\` :** Tech Lab ➔ **\`tp-bur-03-quai3-pack\`**
> - **Fiches Mémo sur le site :** Ressources ➔ \`sheets-excel-decodeur-formules-quai3\` et \`docs-word-guide-illustre-styles\`

## Déroulé minuté (4h00 exactes)
| Horaire | Durée | Étape | Animation en salle |
| :--- | :---: | :--- | :--- |
| **08h30 – 08h45** | 15 min | **Briefing & Décodeur** | Ouverture Tech Lab > Pack 4h Quai n°3. Lecture orale des 12 mots simples. |
| **08h45 – 09h15** | 30 min | **Acte 1a : Poids & TVA** | Téléchargement \`KLF_Palette_Quai3_BRUT_101126.xlsx\` (ou import Sheets). \`=E4*F4\` et cadenas \`F4\` (\`=I4*$J$2\`). |
| **09h15 – 10h00** | 45 min | **Acte 1b : SI & RECHERCHEV** | \`=SI(G4>$H$2;...)\` + \`=SIERREUR(RECHERCHEV(SUPPRESPACE(C4);Zones_Quais!$A$3:$C$6;2;FAUX);"Zone inconnue")\`. |
| **10h00 – 10h20** | **20 min** | **Pause officielle** | Sauvegarde des classeurs avant la pause. |
| **10h20 – 11h00** | 40 min | **Acte 1c : Synthèse & Visuels** | \`SOMME\`, \`MOYENNE\`, \`MAX\`, \`MIN\`, \`NB.SI\`, feux tricolores, liste déroulante, graphique + Auto-audit 4/4. |
| **11h00 – 12h10** | 1h10 | **Acte 2 : Guide Word / Docs** | \`KLF_Guide_Caristes_BRUT_101126.docx\` : bouton ¶, Styles Titre 1/2, \`Ctrl+Entrée\`, Sommaire, 2 captures \`Win+Maj+S\`, mini-tableau & PDF. |
| **12h10 – 12h30** | 20 min | **Audit 6/6, Carnet & Drive** | Double dépôt dans Tech Lab, soumission du Carnet ITIL, Défi Bonus et dépôt Google Drive. |
`;
  fs.writeFileSync(path.join(targetBrainDir, "Palier 2 - Séance 09 - Fiche d'animation formateur (10-11-2026).md"), ficheAnimMd, 'utf8');
  fs.writeFileSync(path.join(targetBrainDir, 'Fiche_Memo_Formules_Et_Mots_Simples_101126.md'), `# Fiche mémo « Zéro Jargon » (10-11-2026)\\n\\nVoir PDF compilé : [[Fiche_Memo_Formules_Et_Mots_Simples_101126.pdf]]\\n`, 'utf8');
  fs.writeFileSync(path.join(targetBrainDir, 'TP_Guide_Word_Excel_Docs_Sheets_Quai3_101126.md'), `# TP guidé 4h00 Quai n°3 — \`klf-leaderboard\`\\n\\nVoir PDF compilé : [[TP_Guide_Word_Excel_Docs_Sheets_Quai3_101126.pdf]]\\n`, 'utf8');

  // 3. Compilation HTML + PDF Gotenberg (Mémo & Livret TP)
  const memoHtml = buildMemoHtml();
  const tpHtml = buildTpGuideHtml();
  fs.writeFileSync(path.join(targetBrainDir, 'Fiche_Memo_Formules_Et_Mots_Simples_101126.html'), memoHtml, 'utf8');
  fs.writeFileSync(path.join(targetBrainDir, 'TP_Guide_Word_Excel_Docs_Sheets_Quai3_101126.html'), tpHtml, 'utf8');

  await compileGotenbergPdf(
    memoHtml,
    path.join(targetBrainDir, 'Fiche_Memo_Formules_Et_Mots_Simples_101126.pdf'),
    'Fiche_Memo_Formules_Et_Mots_Simples_101126.pdf'
  );
  await compileGotenbergPdf(
    tpHtml,
    path.join(targetBrainDir, 'TP_Guide_Word_Excel_Docs_Sheets_Quai3_101126.pdf'),
    'TP_Guide_Word_Excel_Docs_Sheets_Quai3_101126.pdf'
  );

  // 4. Upsert dans Supabase tip.sf_labs pour que l'atelier et les soumissions persistent en BDD
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      db: { schema: 'tip' },
    });

    const { error: upsertErr } = await sb.from('sf_labs').upsert(
      {
        id: LAB_BUR_03_QUAI3.id,
        titre: LAB_BUR_03_QUAI3.titre,
        description: LAB_BUR_03_QUAI3.description,
        domaine: LAB_BUR_03_QUAI3.domaine,
        palier: LAB_BUR_03_QUAI3.palier,
        points_total: LAB_BUR_03_QUAI3.points_total,
        points_auto_validation: LAB_BUR_03_QUAI3.points_auto_validation,
        badge_id: LAB_BUR_03_QUAI3.badge_id,
        ticket_id: LAB_BUR_03_QUAI3.ticket_id,
        fichier_modele_nom: LAB_BUR_03_QUAI3.fichier_modele_nom,
        fichier_modele_url: LAB_BUR_03_QUAI3.fichier_modele_url,
        duree_estimee: LAB_BUR_03_QUAI3.duree_estimee,
        statut: 'ouvert',
      },
      { onConflict: 'id' }
    );

    if (upsertErr) {
      throw new Error(`Échec upsert sf_labs: ${upsertErr.message}`);
    }

    const { data: verifyRow } = await sb.from('sf_labs').select('id, titre, statut').eq('id', LAB_BUR_03_QUAI3.id).single();
    console.log('✅ Supabase sf_labs synchronisé et vérifié (INSERT/SELECT OK):', verifyRow);
  }
}

run().catch((err) => {
  console.error('❌ Erreur script:', err);
  process.exit(1);
});
