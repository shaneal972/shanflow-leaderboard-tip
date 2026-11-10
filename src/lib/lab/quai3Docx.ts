import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

function escXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pNormal(text: string, opts: { bold?: boolean; font?: string; sz?: number; style?: string } = {}): string {
  const bold = opts.bold ? '<w:b/>' : '';
  const font = opts.font ? `<w:rFonts w:ascii="${opts.font}" w:hAnsi="${opts.font}"/>` : '';
  const sz = opts.sz ? `<w:sz w:val="${opts.sz * 2}"/><w:szCs w:val="${opts.sz * 2}"/>` : '';
  const rPr = bold || font || sz ? `<w:rPr>${font}${bold}${sz}</w:rPr>` : '';
  const pPr = opts.style ? `<w:pPr><w:pStyle w:val="${opts.style}"/></w:pPr>` : '';
  if (!text) return `<w:p>${pPr}</w:p>`;
  return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${escXml(text)}</w:t></w:r></w:p>`;
}

function pPageBreak(): string {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

function makeTable(rows: string[][]): string {
  const trs = rows
    .map((cols, rIdx) => {
      const cells = cols
        .map((val) => {
          const shd = rIdx === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/>' : '';
          const b = rIdx === 0 ? '<w:b/>' : '';
          return `<w:tc><w:tcPr><w:tcW w:w="3100" w:type="dxa"/>${shd}</w:tcPr><w:p><w:r><w:rPr>${b}</w:rPr><w:t xml:space="preserve">${escXml(val)}</w:t></w:r></w:p></w:tc>`;
        })
        .join('');
      return `<w:tr>${cells}</w:tr>`;
    })
    .join('');

  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableNormal"/><w:tblW w:w="9300" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/><w:left w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/><w:right w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/></w:tblBorders></w:tblPr>${trs}</w:tbl>`;
}

function buildDocxBufferFromBody(bodyXml: string): Buffer {
  const templatePath = path.join(process.cwd(), 'src', 'data', 'samples', 'KLF_Notice_Zebra_v2_CORRIGEE_DSI.docx');
  const templateBuf = fs.readFileSync(templatePath);
  const zip = XLSX.CFB.read(new Uint8Array(templateBuf), { type: 'array' });
  const docEntry = XLSX.CFB.find(zip, '/word/document.xml');
  if (!docEntry || !docEntry.content) {
    throw new Error('Modèle de base DOCX introuvable.');
  }

  const origXml = new TextDecoder().decode(new Uint8Array(docEntry.content));
  const bodyStart = origXml.indexOf('<w:body>') + '<w:body>'.length;
  const sectStart = origXml.indexOf('<w:sectPr');
  const newDocXml = `${origXml.slice(0, bodyStart)}${bodyXml}${origXml.slice(sectStart)}`;

  const outZip = XLSX.CFB.utils.cfb_new();
  for (let i = 0; i < zip.FullPaths.length; i++) {
    const fullPath = zip.FullPaths[i];
    if (!fullPath || fullPath.endsWith('/') || fullPath.includes('\x01')) continue;
    const relPath = fullPath.replace(/^Root Entry\//, '');
    const fileObj = zip.FileIndex[i];
    if (!fileObj || !fileObj.content) continue;
    if (relPath === 'word/document.xml') {
      XLSX.CFB.utils.cfb_add(outZip, '/' + relPath, Buffer.from(newDocXml, 'utf8'));
    } else {
      XLSX.CFB.utils.cfb_add(outZip, '/' + relPath, Buffer.from(fileObj.content));
    }
  }

  return Buffer.from(XLSX.CFB.write(outZip, { type: 'buffer', fileType: 'zip' }) as Uint8Array);
}

/**
 * Document BRUT volontairement mal mis en page pour l'Acte 2 (Word / Google Docs).
 */
export function buildQuai3BrutDocxBuffer(): Buffer {
  const brutBody = [
    pNormal('        GUIDE   DES CARISTES - QUAI NUMERO 3 KLF JARRY   ', { font: 'Comic Sans MS', sz: 18, bold: true }),
    pNormal('document de travail pour les agents du quai , ne pas diffuser sans mise en page .', { sz: 11 }),
    ...Array.from({ length: 10 }, () => pNormal('')),
    pNormal('1. Pourquoi utilisons-nous ce nouveau tableau   ?', { bold: true, sz: 15 }),
    pNormal('Au port de Jarry , chaque cariste doit verifier le poids des palettes avant de les soulever avec le chariot elevateur . Ce nouveau classeur Excel / Google Sheets calcule automatiquement le poids total , les taxes de Guadeloupe et affiche un voyant rouge si la palette depasse la limite de securite de 2500 kg .'),
    pNormal(''),
    pNormal('1.1 Comment lire les colonnes importantes', { bold: true, sz: 13 }),
    pNormal("- Colonne Code Zone : tapez le code de la zone (Z-A, Z-B, Z-C ou Z-D) sans ajouter d'espace a la fin ."),
    pNormal("- Colonne Poids Total : ne modifiez pas cette case , la formule multiplie toute seule le nombre de colis par le poids d'un colis ."),
    pNormal("- Colonne Alerte Chariot : si la case passe au ROUGE avec le texte SURCHARGE - 2 PASSAGES , il est interdit de soulever la palette en une seule fois ."),
    pNormal(''),
    pNormal("[A FAIRE : EFFACER CETTE LIGNE ET COLLER ICI LA CAPTURE D'ECRAN 1 DE VOTRE TABLEAU EXCEL / SHEETS]", { bold: true }),
    pNormal(''),
    pNormal('2. Les chiffres cles et statistiques du quai', { bold: true, sz: 15 }),
    pNormal('Chaque fin de matinee , le chef de quai consulte le bloc des statistiques en bas du tableau pour connaitre le poids total manipule , la moyenne par palette et le nombre exact de palettes en alerte rouge .'),
    pNormal(''),
    pNormal('[A FAIRE : EFFACER CETTE LIGNE ET COLLER ICI LE MINI-TABLEAU DES STATISTIQUES COPIE DEPUIS EXCEL / SHEETS]', { bold: true }),
    pNormal(''),
    pNormal('3. Visualiser rapidement la charge par cariste', { bold: true, sz: 15 }),
    pNormal('Le graphique en barres permet de reperer en 2 secondes quelles palettes pesent le plus lourd afin d equilibrer le travail entre les caristes du quai numero 3 .'),
    pNormal(''),
    pNormal("[A FAIRE : EFFACER CETTE LIGNE ET COLLER ICI LA CAPTURE D'ECRAN 2 DE VOTRE GRAPHIQUE]", { bold: true }),
    pNormal(''),
    pNormal('4. Que faire si une case affiche un message bizarre (#N/A ou ###) ?', { bold: true, sz: 15 }),
    pNormal("Ne paniquez pas ! Si vous voyez ### , la colonne est simplement trop serree : double-cliquez entre deux lettres en haut . Si vous voyez Zone inconnue , verifiez que le code zone est bien Z-A, Z-B, Z-C ou Z-D . En cas de souci persistant , appelez le support informatique KLF au poste 404 ."),
  ].join('');

  return buildDocxBufferFromBody(brutBody);
}

/**
 * Modèle CORRIGÉ DSI avec vrais Styles Heading1/Heading2, saut de page et tableau structuré.
 */
export function buildQuai3CorrigeDocxBuffer(): Buffer {
  const corrigeBody = [
    pNormal('Guide officiel des caristes — Suivi des palettes au Quai n°3', { style: 'Heading1' }),
    pNormal('Émetteur : Service Support Informatique KLF (Jarry, Baie-Mahault) • Public : Caristes & Chefs de quai • Version 1.0'),
    pNormal('Note DSI : utilisez Références > Table des matières (Word) ou Insertion > Table des matières (Google Docs) juste ici pour insérer le sommaire cliquable automatique.'),
    pPageBreak(),
    pNormal('1. Objectif du calculateur de quai (Excel et Google Sheets)', { style: 'Heading1' }),
    pNormal('Au terminal de Jarry, la sécurité des caristes passe avant tout. Ce classeur automatisé calcule en temps réel le poids exact de chaque palette, applique la TVA locale de Guadeloupe (8,5 %) et déclenche une alerte visuelle dès que la charge dépasse 2 500 kg.'),
    pNormal('1.1 Les 3 colonnes clés à surveiller avant de charger', { style: 'Heading2' }),
    pNormal('• Code Zone (Col C) : utilisez la liste déroulante (Z-A, Z-B, Z-C ou Z-D) pour éviter toute faute de frappe.'),
    pNormal('• Poids Total (Col G) : calculé automatiquement (Nombre de colis × Poids d’un colis).'),
    pNormal('• Alerte Chariot (Col H) : si la mention « SURCHARGE - 2 PASSAGES » apparaît en rouge, séparez la palette en deux voyages.'),
    pNormal('2. Tableau de synthèse des indicateurs du Quai n°3', { style: 'Heading1' }),
    pNormal('Ci-dessous figurent les indicateurs de contrôle calculés automatiquement sur les 12 palettes du manifeste :'),
    makeTable([
      ['Indicateur du Quai n°3', 'Formule utilisée (en français)', 'Résultat attendu'],
      ['Poids total manipulé (kg)', '=SOMME(G4:G15)', '26 065 kg'],
      ['Poids moyen par palette (kg)', '=MOYENNE(G4:G15)', '2 172,08 kg'],
      ['Palette la plus lourde (kg)', '=MAX(G4:G15)', '3 600 kg'],
      ['Palette la plus légère (kg)', '=MIN(G4:G15)', '600 kg'],
      ['Palettes en surcharge (> 2 500 kg)', '=NB.SI(H4:H15; "SURCHARGE - 2 PASSAGES")', '4 palettes'],
      ['Chiffre d’affaires Total TTC', '=SOMME(K4:K15)', '17 202,68 €'],
    ]),
    pNormal(''),
    pNormal('3. Dépannage express et réflexes support DSI', { style: 'Heading1' }),
    pNormal('• Colonne affichant ### : la colonne est trop étroite ; double-cliquez sur le bord droit entre deux lettres d’en-tête.'),
    pNormal('• Mention « Zone inconnue » : un code zone n’existe pas dans la liste ; sélectionnez un code valide avec la liste déroulante.'),
  ].join('');

  return buildDocxBufferFromBody(corrigeBody);
}
