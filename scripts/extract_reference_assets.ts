import * as fs from 'fs';
import * as path from 'path';

// 1. Lire la fiche de référence du 09/09/2026
const refPath = 'c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/06 - Ressources/FichesJournalières/09-09-26/FICHE_JOURNALIERE_ACTIVITE_FORMATEUR_2026-09-09_David_JACQUA.html';
const refHtml = fs.readFileSync(refPath, 'utf8');

// Extraction des 2 logos en base64
const foreLogoStart = refHtml.indexOf('src="data:image');
const foreLogoEnd = refHtml.indexOf('"', foreLogoStart + 5);
const foreLogoBase64 = refHtml.substring(foreLogoStart + 5, foreLogoEnd);

const ftLogoStart = refHtml.indexOf('src="data:image', foreLogoEnd + 1);
const ftLogoEnd = refHtml.indexOf('"', ftLogoStart + 5);
const ftLogoBase64 = refHtml.substring(ftLogoStart + 5, ftLogoEnd);

console.log('✅ FORE Logo extrait, taille :', foreLogoBase64.length);
console.log('✅ France Travail Logo extrait, taille :', ftLogoBase64.length);

// Extraction du CSS complet
const styleStart = refHtml.indexOf('<style>');
const styleEnd = refHtml.indexOf('</style>');
const refCss = refHtml.substring(styleStart, styleEnd + 8);

console.log('✅ CSS de référence extrait, longueur :', refCss.length);

// Sauvegarde dans un module pour réutilisation propre
const outModule = `export const FORE_LOGO_BASE64 = "${foreLogoBase64}";\nexport const FRANCE_TRAVAIL_LOGO_BASE64 = "${ftLogoBase64}";\n`;
fs.writeFileSync(path.resolve(__dirname, '../src/lib/templates/fichesLogos.ts'), outModule, 'utf-8');
console.log('✅ Module fichesLogos.ts généré avec succès !');
