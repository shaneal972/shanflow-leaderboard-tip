const fs = require('fs');

const skillPath = 'C:/Users/shand/.gemini/config/skills/empirical-zero-defect-auditor/SKILL.md';
if (fs.existsSync(skillPath)) {
  const content = fs.readFileSync(skillPath, 'utf8');
  if (!content.includes('Protocole Anti-Chiffre Brut')) {
    const addition = `

### 9. Audit des Fichiers Tableurs & Corrigés Pédagogiques (Protocole Anti-Chiffre Brut)
- **Zéro Chiffre Brut** : Toute cellule calculée dans un corrigé Excel (.xlsx) doit obligatoirement porter une formule active (\`.f\`).
- **Norme OpenXML** : Formules rédigées en anglais (COUNTIF, SUM, IF, YEAR, TODAY) avec séparateur virgule (\`,\`) pour traduction automatique dans Microsoft Excel en français.
- **Assertion Automatisée** : Validation systématique via \`XLSX.readFile()\` vérifiant que \`cell.f !== undefined\` sur 100% des cellules attendues avant toute livraison au formateur ou aux apprenants.
`;
    fs.appendFileSync(skillPath, addition, 'utf8');
    console.log('Appended to empirical-zero-defect-auditor/SKILL.md');
  } else {
    console.log('Already present in empirical-zero-defect-auditor/SKILL.md');
  }
}

const pedagoSkillPath = 'C:/Users/shand/.gemini/config/skills/expertise-pedagogique-ia/SKILL.md';
if (fs.existsSync(pedagoSkillPath)) {
  const content = fs.readFileSync(pedagoSkillPath, 'utf8');
  if (!content.includes('Protocole Anti-Chiffre Brut')) {
    const addition = `

### Verrou 13 : Classeurs Excel Pédagogiques Sans Chiffre Brut (Formules Vives Obligatoires)
- Tout fichier corrigé Excel fourni aux apprenants ou au formateur doit afficher les formules dynamiques natives dans la barre d'édition (\`=NB.SI\`, \`=SOMME\`, \`=SI\`, etc.).
- Interdiction formelle de figer les résultats en valeurs textuelles ou numériques brutes.
`;
    fs.appendFileSync(pedagoSkillPath, addition, 'utf8');
    console.log('Appended to expertise-pedagogique-ia/SKILL.md');
  } else {
    console.log('Already present in expertise-pedagogique-ia/SKILL.md');
  }
}
