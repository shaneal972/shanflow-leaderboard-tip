/**
 * Validateur Automatique Pré-Commit des PDF A4 - KLF / ShanFlow (v2026)
 * 
 * Exécute un audit docimologique et géométrique impitoyable sur le binaire PDF
 * et le rendu Chromium headless :
 * 1. Détection binaire stricte du nombre de pages physiques.
 * 2. Détection statique des caractères Unicode fragiles (ex: bouclier rogné).
 * 3. Mesure géométrique Chromium : débordement, taux de remplissage (65%-96%),
 *    intégrité des badges 1-ligne et absence d'orphelins sur les titres.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface PageMetric {
  pageIndex: number;
  pageHeightPx: number;
  contentHeightPx: number;
  footerHeightPx: number;
  totalContentPx: number;
  marginRemainingPx: number;
  fillRatioPct: number;
  isOverflowing: boolean;
  tagOverflows: string[];
  orphanTitles: string[];
}

export interface ValidationReport {
  pdfPageCount: number;
  expectedPages: number;
  pages: PageMetric[];
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Localise l'exécutable Chromium ou Microsoft Edge sur le système hôte
 */
function findChromiumExecutable(): string {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }

  // Tenter de localiser via la commande PATH
  try {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'where.exe msedge.exe || where.exe chrome.exe' : 'which google-chrome || which chromium';
    const out = execSync(cmd, { encoding: 'utf-8' }).trim().split(/\r?\n/)[0];
    if (out && fs.existsSync(out)) {
      return out;
    }
  } catch {
    // Silencieux
  }

  throw new Error(
    "Impossible de localiser un navigateur Chromium (Edge ou Chrome) pour exécuter l'audit géométrique du PDF."
  );
}

/**
 * Audit géométrique en navigateur headless pour mesurer précisément le DOM rendu
 */
function auditChromiumGeometry(htmlPath: string): PageMetric[] {
  const browserPath = findChromiumExecutable();
  const rawHtml = fs.readFileSync(htmlPath, 'utf-8');

  // Script d'injection de métrologie Chromium
  const measurementSnippet = `
<script>
window.addEventListener('DOMContentLoaded', () => {
  const pages = document.querySelectorAll('.page');
  const metrics = [];

  pages.forEach((p, idx) => {
    const mainDiv = p.firstElementChild;
    const footer = p.lastElementChild;
    const pageHeight = p.offsetHeight || 1043;
    const contentH = mainDiv ? mainDiv.scrollHeight : 0;
    const footerH = footer ? footer.offsetHeight : 0;
    const total = contentH + footerH;
    const fillRatio = Math.round((total / pageHeight) * 1000) / 10;

    // Détection de badges sur plus d'une ligne
    const tagOverflows = [];
    p.querySelectorAll('.section-header .tag').forEach(tag => {
      if (tag.offsetHeight > 28) {
        tagOverflows.push(tag.textContent.trim());
      }
    });

    // Détection de titres de section avec mot orphelin court en fin de ligne
    const orphanTitles = [];
    p.querySelectorAll('.section-header > span:first-child').forEach(span => {
      const text = span.textContent.trim();
      const words = text.split(/\\s+/);
      const lastWord = words[words.length - 1] || '';
      // Si le dernier mot est très court (ex: '1)', '11', 'P1') et n'est pas protégé par nowrap
      if (lastWord.length > 0 && lastWord.length <= 4 && !span.innerHTML.includes('white-space: nowrap') && !span.innerHTML.includes('white-space:nowrap')) {
        orphanTitles.push(text);
      }
    });

    metrics.push({
      pageIndex: idx + 1,
      pageHeightPx: pageHeight,
      contentHeightPx: contentH,
      footerHeightPx: footerH,
      totalContentPx: total,
      marginRemainingPx: pageHeight - total,
      fillRatioPct: fillRatio,
      isOverflowing: total > pageHeight,
      tagOverflows,
      orphanTitles
    });
  });

  const pre = document.createElement('pre');
  pre.id = 'klf-pdf-audit-results';
  pre.textContent = JSON.stringify(metrics);
  document.body.appendChild(pre);
});
</script>
`;

  const instrumentedHtml = rawHtml.includes('</body>')
    ? rawHtml.replace('</body>', `${measurementSnippet}</body>`)
    : `${rawHtml}${measurementSnippet}`;

  const tempFile = path.resolve(`temp_audit_${Date.now()}.html`);
  fs.writeFileSync(tempFile, instrumentedHtml, 'utf-8');

  try {
    const fileUrl = `file:///${tempFile.replace(/\\/g, '/')}`;
    const cmd = `"${browserPath}" --headless --dump-dom "${fileUrl}"`;
    const domOutput = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

    const match = domOutput.match(/<pre id="klf-pdf-audit-results">([\s\S]*?)<\/pre>/);
    if (!match) {
      throw new Error("Chromium n'a pas pu restituer le rapport de métrologie dans le DOM dump.");
    }

    return JSON.parse(match[1]) as PageMetric[];
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

/**
 * Valide de manière impitoyable la conformité du document PDF et du HTML source.
 * Lève une exception explicite et détaillée si le moindre critère échoue.
 * 
 * @param htmlPath Chemin absolu du fichier HTML envoyé à Gotenberg
 * @param pdfBuffer Buffer binaire du fichier PDF retourné par Gotenberg
 * @param expectedPages Nombre exact de pages physiques attendues (défaut: 4)
 */
export async function assertPerfectPdf(
  htmlPath: string,
  pdfBuffer: Buffer,
  expectedPages = 4
): Promise<ValidationReport> {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(`\n🔍 [KLF PDF VALIDATOR] Audit de conformité haute-fidélité en cours sur ${path.basename(htmlPath)}...`);

  // 1. Audit Binaire : Nombre exact de pages physiques
  const pdfBinary = pdfBuffer.toString('binary');
  const pageMatches = pdfBinary.match(/\/Type\s*\/Page\b/g);
  const actualPages = pageMatches ? pageMatches.length : 0;

  if (actualPages !== expectedPages) {
    errors.push(
      `Nombre de pages physiques PDF invalide : ${actualPages} page(s) détectée(s) au lieu de strictement ${expectedPages} ! (Vérifiez les débordements de pied de page).`
    );
  } else {
    console.log(`  ✓ Binaire PDF : strictement ${actualPages}/${expectedPages} pages physiques détectées.`);
  }

  // 2. Audit Statique : Absence d'émojis Unicode fragiles (rognés par Noto Color Emoji sur Linux Gotenberg)
  const rawHtml = fs.readFileSync(htmlPath, 'utf-8');
  const FRAGILE_CHARS = [
    { char: '🛡️', label: 'Bouclier Unicode (🛡️) - Remplacer par PDF_ICONS.shield' },
    { char: '🛡', label: 'Bouclier Unicode (🛡) - Remplacer par PDF_ICONS.shield' },
  ];

  for (const item of FRAGILE_CHARS) {
    if (rawHtml.includes(item.char)) {
      errors.push(
        `Caractère Unicode fragile interdit détecté : ${item.label}. Utilisez impérativement les icônes SVG de PDF_ICONS !`
      );
    }
  }

  // 3. Audit Géométrique Chromium Headless
  let metrics: PageMetric[] = [];
  try {
    metrics = auditChromiumGeometry(htmlPath);

    metrics.forEach((m) => {
      // Débordement physique
      if (m.isOverflowing) {
        errors.push(
          `Page ${m.pageIndex} en dépassement de hauteur : ${m.totalContentPx}px / ${m.pageHeightPx}px (+${m.totalContentPx - m.pageHeightPx}px de débordement). Le contenu sera masqué ou provoquera une page fantôme !`
        );
      }

      // Taux d'occupation vertical (Règle du Confort KLF : 65% - 96%)
      if (m.fillRatioPct < 65.0) {
        errors.push(
          `Page ${m.pageIndex} trop vide (${m.fillRatioPct}% de remplissage < seuil minimal 65%). Risque de grand blanc inesthétique au-dessus du pied de page !`
        );
      } else if (m.fillRatioPct > 96.0) {
        errors.push(
          `Page ${m.pageIndex} dangereusement tassée (${m.fillRatioPct}% de remplissage > seuil d'alerte 96%). Risque de rognage sur imprimante physique !`
        );
      }

      // Badges multi-lignes
      if (m.tagOverflows.length > 0) {
        errors.push(
          `Page ${m.pageIndex} : le badge "${m.tagOverflows.join(', ')}" s'étale sur 2 lignes. Ajoutez white-space: nowrap !`
        );
      }

      // Mots orphelins en fin de titre
      if (m.orphanTitles.length > 0) {
        warnings.push(
          `Page ${m.pageIndex} : titre potentiellement coupé avec mot court orphelin : "${m.orphanTitles.join(', ')}". Utilisez nowrap() !`
        );
      }
    });
  } catch (err: any) {
    errors.push(`Échec de l'audit géométrique Chromium : ${err.message}`);
  }

  // Synthèse console élégante
  console.log('  ┌──────┬────────────┬─────────────┬──────────────┬────────────┬─────────────┐');
  console.log('  │ Page │ Hauteur Ut.│ Total Cont. │ Marge Rest.  │ Remplissage│ Débordement │');
  console.log('  ├──────┼────────────┼─────────────┼──────────────┼────────────┼─────────────┤');
  metrics.forEach((m) => {
    const pStr = `  │  ${m.pageIndex}   │`;
    const hStr = `   ${m.pageHeightPx}px   │`;
    const cStr = `    ${m.contentHeightPx + m.footerHeightPx}px   │`;
    const mStr = `    ${m.marginRemainingPx}px     │`;
    const rStr = `    ${m.fillRatioPct.toFixed(1)}%    │`;
    const oStr = m.isOverflowing ? '   OUI 🚨    │' : '   NON ✓     │';
    console.log(`${pStr}${hStr}${cStr}${mStr}${rStr}${oStr}`);
  });
  console.log('  └──────┴────────────┴─────────────┴──────────────┴────────────┴─────────────┘');

  if (warnings.length > 0) {
    warnings.forEach((w) => console.log(`  ⚠️ [AVERTISSEMENT] ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\n❌ [KLF PDF VALIDATOR] ${errors.length} anomalie(s) bloquante(s) détectée(s) :`);
    errors.forEach((e) => console.error(`  - ❌ ${e}`));
    throw new Error(
      `Validation PDF échouée (${errors.length} erreur(s)). Corrigez la feuille de style ou le gabarit HTML avant livraison.`
    );
  }

  console.log(`🎉 [KLF PDF VALIDATOR] VALIDATION 10/10 RÉUSSIE : STRICTEMENT ${actualPages} PAGES, ZÉRO DÉBORDEMENT, CALIBRAGE PARFAIT.\n`);

  return {
    pdfPageCount: actualPages,
    expectedPages,
    pages: metrics,
    isValid: true,
    errors,
    warnings,
  };
}
