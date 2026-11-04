const fs = require('fs');

const content = `# Standard Zéro-Défaut des Classeurs Excel Pédagogiques (Protocole Anti-Chiffre Brut)

Cette règle s'applique impérativement à toute génération, modification ou audit de fichiers tableurs (.xlsx, .xlsm, .csv) à vocation pédagogique, administrative ou professionnelle créés pour ShanFlow et KLF.

---

## 1. Règle d'or du "Zéro Chiffre Brut"
- **Interdiction Formelle des Valeurs Foncées/Statiques** : Dans tout fichier de correction ou corrigé type destiné au formateur ou aux apprenants, aucune cellule résultant d'un calcul (totaux, pourcentages, conditions SI, comptages NB.SI, extractions de date) ne doit contenir un nombre ou texte brut figé.
- **Formule Native Obligatoire** : Chaque cellule attendue doit obligatoirement comporter une formule dynamique active dans la barre de formules d'Excel. En cliquant sur la cellule, l'apprenant ou le formateur doit voir la formule et ses dépendances colorées.

---

## 2. Standard Technique d'Implémentation (SheetJS / OpenXML)
Pour toute génération programmatique de classeurs via Node.js, TypeScript ou Python :
1. **Propriété f Explicite** :
   - Ne JAMAIS s'en remettre à l'injection de texte brut dans aoa_to_sheet (ex: ['=NB.SI(...)']), car SheetJS encode cela sous la forme { t: 's', v: '=NB.SI(...)' } (libellé textuel sans exécution).
   - Toujours déclarer l'objet cellule avec sa formule OpenXML (f) et sa valeur initiale calculée (v) :
     \`ws['B6'] = { t: 'n', f: 'COUNTIF(Inventaire!D2:D26,"Windows 10 Pro")', v: 10 };\`
2. **Grammaire OpenXML Anglophone & Séparateur Virgule** :
   - Dans le standard international OpenXML (.xlsx), les noms de fonctions doivent impérativement être en anglais : COUNTIF, SUM, IF, YEAR, TODAY, VLOOKUP, AVERAGE.
   - Le séparateur d'arguments interne doit être la virgule (,).
   - Microsoft Excel traduit automatiquement ces formules dans la langue de l'utilisateur à l'ouverture (ex: COUNTIF devient =NB.SI(Inventaire!D2:D26; "Windows 10 Pro") dans Excel en français).
3. **Format Numérique et Pourcentage (z)** :
   - Assigner systématiquement le masque de formatage pour les ratios : \`ws['B14'].z = '0.0%'\` ou \`'0%'\`.

---

## 3. Protocole d'Audit Pré-Livraison Automatisé
Avant de déclarer un classeur Excel finalisé ou de le mettre à disposition dans les ressources pédagogiques :
1. **Assertion Empirique sur le Fichier Disque** :
   - Relire le fichier généré avec XLSX.readFile(filePath).
   - Boucler sur la liste des cellules cibles et exécuter :
     \`\`\`typescript
     if (!cell || !cell.f) {
       throw new Error(\`Échec audit formule : la cellule \${coord} ne contient pas de formule active (.f absent)\`);
     }
     \`\`\`
2. **Gestion des Conflits de Verrouillage Windows (EBUSY)** :
   - Si le formateur ou l'utilisateur a déjà le fichier ouvert dans Microsoft Excel, Windows pose un verrou exclusif (EBUSY).
   - Le script doit intercepter l'erreur, alerter l'utilisateur et générer une copie datée/déverrouillée (ex: ..._FORMULES.xlsx) pour ne jamais laisser l'ancien fichier sans formule en place sans notification.
`;

const targetPath = 'C:/Users/shand/.gemini/antigravity/Obsidian-Brain/.agents/rules/standard_classeurs_excel_pedagogiques.md';
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully written to:', targetPath);
