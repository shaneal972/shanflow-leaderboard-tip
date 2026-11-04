# Standard Industriel de Génération PDF A4 Zéro-Défaut (KLF / ShanFlow)

> **Règle d'or inviolable** : Tout script de génération de PDF pédagogique, officiel ou Qualiopi dans ce dépôt **DOIT IMPÉRATIVEMENT** utiliser le Design System PDF officiel (`scripts/lib/klf-pdf-design-system.ts`) et être validé empiriquement par `assertPerfectPdf()` (`scripts/lib/klf-pdf-validator.ts`).

---

## 1. Principes d'Ingénierie Géométrique (Architecture A4)

1. **Marges d'impression sanctuarisées** :
   - `@page { size: A4 portrait; margin: 10mm 14mm 10mm 14mm; }`
   - Hauteur brute A4 : `297mm`. Hauteur utile garantie : `277mm`.

2. **Verrouillage strict du conteneur `.page` (Anti-Pages Fantômes)** :
   - Chaque page virtuelle doit impérativement respecter cette règle CSS exacte :
     ```css
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
     ```
   - **Pourquoi ?** Si le conteneur dépasse `276mm` ne serait-ce que de 1 pixel, Chromium/Gotenberg pousse le pied de page sur une page blanche isolée. Avec ce verrouillage, chaque page tient exactement sur une feuille A4 et le pied de page est ancré en bas.

---

## 2. Typographie Aérée de Confort & Interlignage

Pour éviter tout document étouffant ou au contraire vide :
- **Corps de texte général (`body`, `p`)** : `font-size: 10.5pt` (`14px`), `line-height: 1.65;`, `margin-bottom: 6px;`.
- **Listes (`ol li`, `ul li`)** : `line-height: 1.62;`, avec `margin-bottom: 8px;` entre chaque item.
- **Encarts pédagogiques (`.callout`, `.notion-box`)** : `font-size: 10.2pt`, `line-height: 1.6;`, `padding: 12px 16px;`, `margin-bottom: 14px;`.
- **Bandeaux de titre (`.section-header`)** : `font-size: 11pt;`, `padding: 8px 14px;`, `margin-top: 14px;`, `margin-bottom: 12px;`.
- **Badges de jalon (`.section-header .tag`)** : `white-space: nowrap;` obligatoire.
- **Tableaux (`.data-table`, `.eval-table`)** : `padding: 9px 12px;`, `line-height: 1.5;`.
- **Taux de remplissage vertical cible** : entre **65 % et 96 %** de chaque page.

---

## 3. Bannissement des Émojis Unicode Fragiles

- **Interdiction formelle de l'émoji bouclier `🛡️` / `🛡`** : le moteur Noto Color Emoji sur les serveurs Linux/Chromium (Gotenberg) rogne systématiquement sa moitié gauche.
- **Obligation** : Utiliser les icônes vectorielles SVG inline fournies par `PDF_ICONS` :
  - `PDF_ICONS.shield` pour les réflexes professionnels et la sécurité.
  - `PDF_ICONS.alert` pour les alertes incident et points d'attention.
  - `PDF_ICONS.bulb` pour les astuces pédagogiques.
  - `PDF_ICONS.lock` pour les blocages et sécurisations.
  - `PDF_ICONS.check` pour les validations et coches.

---

## 4. Protection Anti-Orphelins (`nowrap`)

- Tout identifiant court susceptible d'être coupé entre deux lignes doit être protégé via le helper `nowrap(text)` :
  - Numéros de ticket : `nowrap('TCK-101')`
  - Blocs de certification : `nowrap('(CCP 1)')`
  - Indicateurs Qualiopi : `nowrap('Ind. 11')`
  - Montants monétaires : `nowrap('14 905,00 €')`

---

## 5. Validation Automatique Obligatoire avant Clôture

Tout script générant un PDF doit obligatoirement inclure :
```typescript
import { KLF_A4_PDF_STYLES, PDF_ICONS, nowrap } from './lib/klf-pdf-design-system';
import { assertPerfectPdf } from './lib/klf-pdf-validator';

// ... Génération du HTML avec KLF_A4_PDF_STYLES ...
// ... Compilation Gotenberg -> pdfBuffer ...

// VALIDATION OBLIGATOIRE (Lève une exception bloquante si non conforme)
await assertPerfectPdf(htmlFilePath, pdfBuffer, expectedPagesCount);
```
