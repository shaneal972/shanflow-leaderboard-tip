'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileSpreadsheet,
  FileText,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  CheckSquare,
  Square,
  Lightbulb,
  Clock,
  Camera,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

type PlatformMode = 'both' | 'office' | 'google';
type GuideTab = 'decodeur' | 'acte1' | 'acte2' | 'checklist';

interface FormulaGuideItem {
  id: string;
  cellTarget: string;
  formulaFr: string;
  formulaEn?: string;
  purpose: string;
  readAloud: string;
  stepOffice: string;
  stepGoogle: string;
  oopsTip: string;
}

const MOTS_DIFFICILES = [
  {
    mot: 'Cellule (ex : G4)',
    traduction: 'Une « boîte » du tableau qui croise une colonne (lettre G) et une ligne (chiffre 4).',
    exemple: 'G4 = colonne G, ligne 4.',
  },
  {
    mot: 'Plage de cellules (G4:G15)',
    traduction: 'Un groupe de cases qui se suivent. Les deux-points « : » veulent dire « jusqu’à ».',
    exemple: '=SOMME(G4:G15) veut dire : additionne de G4 jusqu’à G15.',
  },
  {
    mot: 'Référence absolue ($J$2) / Touche F4',
    traduction: 'Poser deux « cadenas » ($) devant la lettre et le chiffre pour empêcher la case de glisser quand on recopie vers le bas.',
    exemple: 'Sans $, TVA glisse sur la ligne d’en dessous (vide !). Avec F4, le cadenas $J$2 reste figé.',
  },
  {
    mot: 'Point-virgule ( ; )',
    traduction: 'Le séparateur qui découpe les morceaux d’une formule en français (comme les ingrédients d’une recette).',
    exemple: '=SI(condition ; si_vrai ; si_faux)',
  },
  {
    mot: 'Texte vs Nombre',
    traduction: 'Un nombre sert à calculer (aligné à droite). Un texte est un mot ou un code comme un code postal (aligné à gauche).',
    exemple: 'Pour écrire un mot dans une formule, on l’entoure toujours de guillemets : "SURCHARGE".',
  },
  {
    mot: 'Mise en forme conditionnelle',
    traduction: 'Un « feu tricolore automatique » qui colorie une case en rouge ou vert selon son résultat.',
    exemple: 'Si le texte contient SURCHARGE ➔ fond rouge. Si OK ➔ fond vert.',
  },
  {
    mot: 'Liste déroulante (Validation)',
    traduction: 'Un menu fermé à flèche qui force à choisir une valeur propre (Z-A, Z-B, Z-C, Z-D) sans faute de frappe.',
    exemple: 'Empêche d’écrire « Z-A » avec un espace invisible à la fin !',
  },
  {
    mot: 'Erreurs #N/A, #VALEUR!, ###',
    traduction: 'Les voyants de panne : #N/A = pas trouvé ; #VALEUR! = calcul impossible avec un mot ; ### = colonne trop serrée.',
    exemple: 'Contre ### : double-cliquez entre deux lettres en haut de colonne.',
  },
  {
    mot: 'Styles (Titre 1, Titre 2)',
    traduction: 'Des étiquettes intelligentes pour dire au logiciel : « ceci est un grand chapitre ».',
    exemple: 'Indispensable pour que le sommaire se crée tout seul en 2 clics.',
  },
  {
    mot: 'Saut de page (Ctrl + Entrée)',
    traduction: 'Passer proprement à la page suivante d’un seul coup, sans appuyer 15 fois sur Entrée.',
    exemple: 'Évite que tout votre texte se décale quand vous ajoutez une image !',
  },
  {
    mot: 'Sommaire automatique',
    traduction: 'La table des matières qui lit vos Styles (Titre 1, Titre 2) et inscrit les numéros de page automatiquement.',
    exemple: 'Word : Références > Table des matières | Docs : Insertion > Table des matières.',
  },
  {
    mot: 'Export PDF',
    traduction: 'Transformer le fichier en « feuille imprimée numérique » figée pour que la mise en page ne bouge jamais chez le lecteur.',
    exemple: 'Word : Fichier > Exporter > PDF | Docs : Fichier > Télécharger > Document PDF.',
  },
];

const FORMULES_SIMPLES: FormulaGuideItem[] = [
  {
    id: 'f1',
    cellTarget: 'Colonne G (G4 à G15)',
    formulaFr: '=E4*F4',
    purpose: 'Calcule le poids total d’une palette (nombre de colis × poids d’un colis).',
    readAloud: '« Prends la case E4 (nb colis) et multiplie (*) par la case F4 (poids d’un colis). »',
    stepOffice: 'Cliquez en G4, tapez =E4*F4 puis Entrée. Double-cliquez sur le petit carré vert en bas à droite de G4 pour recopier jusqu’en G15.',
    stepGoogle: 'Cliquez en G4, tapez =E4*F4 puis Entrée (Sheets peut même proposer le remplissage automatique : appuyez sur Entrée ou tirez le point bleu jusqu’en G15).',
    oopsTip: 'Si vous voyez #VALEUR!, vérifiez qu’il n’y a pas une lettre ou un espace tapé dans E4 ou F4.',
  },
  {
    id: 'f2',
    cellTarget: 'Colonne J (J4 à J15) & Colonne K (K4 à K15)',
    formulaFr: '=I4*$J$2   puis en K4 :   =I4+J4',
    purpose: 'Calcule la TVA de Guadeloupe (8,5 %) en bloquant la case J2, puis calcule le Total TTC.',
    readAloud: '« Multiplie le montant HT (I4) par le taux de TVA bloqué avec des cadenas ($J$2). »',
    stepOffice: 'En J4 : tapez =I4* puis cliquez sur J2, appuyez sur la touche F4 (les $ apparaissent !), puis Entrée. En K4 : =I4+J4.',
    stepGoogle: 'En J4 : tapez =I4* puis cliquez sur J2, appuyez sur F4 (ou tapez $J$2 à la main sur portable), puis Entrée. En K4 : =I4+J4.',
    oopsTip: 'Si J5 affiche 0 €, vous avez oublié les cadenas $ ! J2 a glissé en J3 (qui est du texte). Remettez $J$2.',
  },
  {
    id: 'f3',
    cellTarget: 'Colonne H (H4 à H15)',
    formulaFr: '=SI(G4>$H$2; "SURCHARGE - 2 PASSAGES"; "OK CHARIOT")',
    purpose: 'Vérifie automatiquement si une palette dépasse 2 500 kg (limite de sécurité du chariot).',
    readAloud: '« SI le poids total G4 est plus grand que le seuil bloqué H2 (2 500), ALORS écris SURCHARGE - 2 PASSAGES, SINON écris OK CHARIOT. »',
    stepOffice: 'Tapez la formule en H4 avec les guillemets autour des textes et ; entre les 3 parties. Étirez jusqu’en H15.',
    stepGoogle: 'Identique ! Attention : si votre Google Sheets est paramétré en anglais, remplacez SI par IF et ; par , (sinon gardez =SI(...; ...)).',
    oopsTip: 'Si Excel affiche #NOM?, vous avez oublié les guillemets " " autour des phrases de texte.',
  },
  {
    id: 'f4',
    cellTarget: 'Colonne D (D4 à D15)',
    formulaFr: '=SIERREUR(RECHERCHEV(SUPPRESPACE(C4); Zones_Quais!$A$3:$C$6; 2; FAUX); "Zone inconnue")',
    purpose: 'Va chercher le vrai nom de la zone dans le 2e onglet, enlève les espaces en trop et évite les erreurs #N/A.',
    readAloud: '« Nettoie C4 (SUPPRESPACE), cherche ce code dans le tableau Zones_Quais (RECHERCHEV) et ramène la 2e colonne en correspondance exacte (FAUX). S’il y a une erreur (SIERREUR), écris Zone inconnue. »',
    stepOffice: 'Saisissez la formule en D4 puis étirez jusqu’en D15. Vérifiez que PAL-303 (Z-A ) affiche bien Quai Conteneurs Nord et PAL-310 (Z-99) affiche Zone inconnue.',
    stepGoogle: 'Saisissez la formule exactement de la même manière en D4 et tirez jusqu’en D15.',
    oopsTip: 'Toujours mettre FAUX (ou 0) à la fin de RECHERCHEV pour exiger le code exact, et bloquer le tableau $A$3:$C$6 avec F4 !',
  },
  {
    id: 'f5',
    cellTarget: 'Synthèse bas du tableau (B18 à B23)',
    formulaFr: '=SOMME(G4:G15) | =MOYENNE(G4:G15) | =MAX(G4:G15) | =MIN(G4:G15) | =NB.SI(H4:H15; "SURCHARGE - 2 PASSAGES")',
    purpose: 'Calcule les 5 indicateurs de pilotage du Quai n°3 pour le rapport du chef de quai.',
    readAloud: '« Additionne (SOMME), fais la moyenne (MOYENNE), trouve le record (MAX), trouve le plus petit (MIN), compte les alertes (NB.SI). »',
    stepOffice: 'Placez-vous en B18 puis tapez chaque formule face à son libellé jusqu’en B23 (et =SOMME(K4:K15) en B23 pour le Total TTC).',
    stepGoogle: 'Exactement les mêmes formules en français dans Google Sheets.',
    oopsTip: 'Si =NB.SI renvoie 0 au lieu de 4, vérifiez que le texte entre guillemets est écrit à la lettre près : "SURCHARGE - 2 PASSAGES".',
  },
];

const CHECKLIST_10_POINTS = [
  'Mon tableur ne contient aucune erreur #N/A, #VALEUR!, #REF! ni ###.',
  'Toutes les formules de TVA et de seuil chariot utilisent le cadenas $ (ex: $J$2 et $H$2).',
  'La palette PAL-303 (avec espace parasite) trouve bien sa zone grâce à SUPPRESPACE.',
  'La palette PAL-310 (code Z-99) affiche proprement "Zone inconnue" grâce à SIERREUR.',
  'Les alertes SURCHARGE sont coloriées en rouge et OK CHARIOT en vert (feu tricolore automatique).',
  'Un graphique clair compare les poids ou les montants des palettes et reste lisible.',
  'Dans mon document Word / Google Docs, les 10 lignes vides du début ont été supprimées et remplacées par un saut de page (Ctrl + Entrée).',
  'Les chapitres utilisent de vrais Styles (Titre 1, Titre 2) et j’ai généré un sommaire automatique.',
  'J’ai inséré 2 captures d’écran propres (Win + Maj + S) et collé le mini-tableau de synthèse.',
  'J’ai exporté/téléchargé mes fichiers (.xlsx et .docx), passé les 2 auto-audits ci-dessous et sauvegardé mon compte-rendu.',
];

export const LabQuai3GuidePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuideTab>('decodeur');
  const [platform, setPlatform] = useState<PlatformMode>('both');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [searchWord, setSearchWord] = useState<string>('');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const filteredMots = MOTS_DIFFICILES.filter(
    (m) =>
      !searchWord.trim() ||
      m.mot.toLowerCase().includes(searchWord.toLowerCase()) ||
      m.traduction.toLowerCase().includes(searchWord.toLowerCase())
  );

  return (
    <div className="rounded-3xl slate-glass border border-teal-500/30 bg-[#0A1628]/80 overflow-hidden shadow-xl">
      {/* Barre supérieure chronomètre & choix logiciel */}
      <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-teal-950/40 via-[#0A1628] to-indigo-950/30 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Atelier guidé 4h00 (08h30 – 12h30 • Pause 10h00–10h20)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-['Lexend']">
              Parcours pas-à-pas « Zéro Jargon » — Word, Excel, Docs &amp; Sheets
            </h2>
            <p className="text-xs text-slate-300">
              Suivez les 4 onglets dans l’ordre. Chaque mot difficile et chaque formule est traduit en français simple.
            </p>
          </div>

          {/* Téléchargement direct des 2 fichiers sources + Fiches Mémo PDF */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/api/lab/download-sample?labId=tp-bur-03-quai3-pack&part=xlsx"
              download="KLF_Palette_Quai3_BRUT_101126.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Acte 1 : Tableur (.xlsx)</span>
            </a>
            <a
              href="/api/lab/download-sample?labId=tp-bur-03-quai3-pack&part=docx"
              download="KLF_Guide_Caristes_BRUT_101126.docx"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Acte 2 : Document (.docx)</span>
            </a>
          </div>
        </div>

        {/* Sélecteur de logiciel utilisé par l'apprenant */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Je travaille sur :</span>
            {[
              { id: 'both', label: 'Les 2 côte à côte (Recommandé)' },
              { id: 'office', label: 'Microsoft Word & Excel' },
              { id: 'google', label: 'Google Docs & Google Sheets' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setPlatform(mode.id as PlatformMode)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer border ${
                  platform === mode.id
                    ? 'bg-teal-500/20 text-teal-200 border-teal-400/50 font-bold'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <Link
              href="/ressources/sheets-excel-decodeur-formules-quai3"
              className="text-emerald-300 hover:underline flex items-center gap-1"
            >
              <span>Mémo Tableur PDF</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              href="/ressources/docs-word-guide-illustre-styles"
              className="text-sky-300 hover:underline flex items-center gap-1"
            >
              <span>Mémo Word/Docs PDF</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation des 4 Onglets */}
      <div className="flex flex-wrap border-b border-white/10 bg-black/20 px-4 pt-3 gap-2">
        {[
          { id: 'decodeur', label: '1. Décodeur Mots & Formules', icon: BookOpen, badge: 'Commencez ici' },
          { id: 'acte1', label: '2. Acte 1 : Tableur (Excel / Sheets)', icon: FileSpreadsheet, badge: '08h45–11h00' },
          { id: 'acte2', label: '3. Acte 2 : Guide Illustré (Word / Docs)', icon: FileText, badge: '11h00–12h10' },
          { id: 'checklist', label: `4. Checklist & Défi Bonus (${checkedCount}/10)`, icon: CheckSquare, badge: '12h10–12h30' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as GuideTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-b-2 ${
                isActive
                  ? 'bg-white/[0.06] text-teal-300 border-teal-400'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/[0.03]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenu dynamique de l'onglet actif */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* ONGLET 1 : DÉCODEUR ANTI-JARGON */}
        {activeTab === 'decodeur' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Lexend'] flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Les 12 mots difficiles expliqués en français simple</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gardez cet onglet sous les yeux dès qu’un mot de la consigne vous semble technique.
                </p>
              </div>
              <input
                type="text"
                placeholder="Filtrer un mot (ex: $, saut de page, #N/A)..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="w-full sm:w-72 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMots.map((item, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                  <div className="text-xs font-bold text-teal-300 font-['Lexend']">{item.mot}</div>
                  <p className="text-xs text-slate-200 leading-relaxed">{item.traduction}</p>
                  <div className="text-[11px] font-mono text-amber-300/90 bg-amber-500/5 border border-amber-500/15 rounded-lg p-2">
                    💡 {item.exemple}
                  </div>
                </div>
              ))}
            </div>

            {/* Tableau passerelle Express */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-indigo-300">
                Passerelle rapide : Où cliquer selon votre logiciel ?
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-mono">
                      <th className="py-2 pr-3">Action souhaitée</th>
                      <th className="py-2 pr-3 text-emerald-300">Microsoft Excel / Word</th>
                      <th className="py-2 text-sky-300">Google Sheets / Docs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    <tr>
                      <td className="py-2 pr-3 font-semibold">Ouvrir le fichier brut fourni</td>
                      <td className="py-2 pr-3">Double-clic sur le fichier téléchargé</td>
                      <td className="py-2">Drive &gt; Nouveau &gt; Importer un fichier (ou Fichier &gt; Importer)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold">Bloquer une cellule (cadenas $)</td>
                      <td className="py-2 pr-3 font-mono">Touche F4</td>
                      <td className="py-2 font-mono">Touche F4 (ou taper $ devant lettre et chiffre)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold">Figer les titres du haut</td>
                      <td className="py-2 pr-3">Affichage &gt; Figer les volets</td>
                      <td className="py-2">Affichage &gt; Figer &gt; Jusqu’à la ligne 3</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold">Liste déroulante (Code Zone)</td>
                      <td className="py-2 pr-3">Données &gt; Validation des données &gt; Liste</td>
                      <td className="py-2">Insertion &gt; Liste déroulante</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold">Appliquer Titre 1 / Titre 2</td>
                      <td className="py-2 pr-3">Accueil &gt; Styles &gt; Titre 1 / Titre 2</td>
                      <td className="py-2">Menu « Texte normal » &gt; Titre 1 / Titre 2</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold">Sommaire automatique</td>
                      <td className="py-2 pr-3">Références &gt; Table des matières</td>
                      <td className="py-2">Insertion &gt; Table des matières</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold">Déposer dans l’auto-auditeur ici</td>
                      <td className="py-2 pr-3">Enregistrer (.xlsx / .docx)</td>
                      <td className="py-2">Fichier &gt; Télécharger &gt; Microsoft Excel (.xlsx) / Word (.docx)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('acte1')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all cursor-pointer"
              >
                <span>Passer à l’Acte 1 (Tableur Quai n°3)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ONGLET 2 : ACTE 1 TABLEUR (EXCEL & GOOGLE SHEETS) */}
        {activeTab === 'acte1' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 text-xs">
                <div className="font-bold text-emerald-300">
                  Étape 0 : Récupérer le classeur de départ (KLF_Palette_Quai3_BRUT_101126.xlsx)
                </div>
                <p className="text-slate-300">
                  <strong>Sur Excel :</strong> ouvrez directement le fichier téléchargé.{' '}
                  <strong>Sur Google Sheets :</strong> ouvrez un nouveau Sheets vide &gt; <em>Fichier &gt; Importer &gt; Importer un fichier</em> &gt; sélectionnez le fichier `.xlsx`.
                </p>
              </div>
              <a
                href="/api/lab/download-sample?labId=tp-bur-03-quai3-pack&part=xlsx"
                download="KLF_Palette_Quai3_BRUT_101126.xlsx"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger .xlsx</span>
              </a>
            </div>

            {/* Les 5 étapes de formules traduites en français */}
            <div className="space-y-4">
              {FORMULES_SIMPLES.map((f, idx) => (
                <div key={f.id} className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center text-xs font-mono font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white font-['Lexend']">{f.cellTarget}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(f.id, f.formulaFr.split('|')[0].split('puis')[0].trim())}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/5 hover:bg-white/10 text-teal-300 border border-white/10 cursor-pointer self-start"
                    >
                      {copiedId === f.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === f.id ? 'Copié !' : 'Copier la formule'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">
                    <strong className="text-slate-100">À quoi elle sert :</strong> {f.purpose}
                  </p>

                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200">
                    <strong>🗣️ Lue à voix haute :</strong> {f.readAloud}
                  </div>

                  <div className="p-3 rounded-xl bg-[#070F1E] border border-white/15 font-mono text-xs text-amber-300 overflow-x-auto">
                    {f.formulaFr}
                  </div>

                  <div className={`grid gap-3 text-xs ${platform === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {(platform === 'both' || platform === 'office') && (
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-slate-200">
                        <div className="font-bold text-emerald-300 mb-1 font-mono text-[11px]">Dans Microsoft Excel :</div>
                        {f.stepOffice}
                      </div>
                    )}
                    {(platform === 'both' || platform === 'google') && (
                      <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/20 text-slate-200">
                        <div className="font-bold text-sky-300 mb-1 font-mono text-[11px]">Dans Google Sheets :</div>
                        {f.stepGoogle}
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-[11px] text-rose-200 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Oups ! Que faire si…</strong> {f.oopsTip}</span>
                  </div>
                </div>
              ))}

              {/* Étape 6 : Feux tricolores + Liste déroulante + Graphique */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/25 space-y-3">
                <h4 className="text-sm font-bold text-amber-300 font-['Lexend']">
                  6. Finitions pro du Quai n°3 : Feux tricolores, Liste déroulante &amp; Graphique
                </h4>
                <ul className="space-y-2 text-xs text-slate-200 list-disc list-inside">
                  <li>
                    <strong>Feux tricolores (Mise en forme conditionnelle sur H4:H15) :</strong>{' '}
                    {platform !== 'google' && (
                      <span>
                        <em>Excel :</em> Accueil &gt; Mise en forme conditionnelle &gt; Règles de mise en surbrillance &gt; Texte qui contient… <code>SURCHARGE</code> en rouge, puis <code>OK CHARIOT</code> en vert.{' '}
                      </span>
                    )}
                    {platform !== 'office' && (
                      <span>
                        <em>Google Sheets :</em> Format &gt; Mise en forme conditionnelle &gt; Le texte contient <code>SURCHARGE</code> (fond rouge clair).
                      </span>
                    )}
                  </li>
                  <li>
                    <strong>Liste déroulante sur Code Zone (C4:C15) :</strong>{' '}
                    <em>Excel :</em> Données &gt; Validation des données &gt; Autoriser : Liste &gt; Source : <code>=Zones_Quais!$A$3:$A$6</code>.{' '}
                    <em>Google Sheets :</em> Insertion &gt; Liste déroulante (sélectionnez la plage de l’onglet Zones_Quais). Puis corrigez <code>Z-99</code> si besoin pour tester !
                  </li>
                  <li>
                    <strong>Figer les volets (Ligne 3) :</strong> cliquez sur <code>A4</code> &gt; <em>Affichage &gt; Figer les volets</em> (Excel) ou <em>Affichage &gt; Figer &gt; Jusqu’à la ligne 3</em> (Sheets).
                  </li>
                  <li>
                    <strong>Créer un graphique en barres :</strong> sélectionnez les colonnes <code>N° Palette (A3:A15)</code> + <code>Poids Total (G3:G15)</code> (en maintenant la touche <code>Ctrl</code>) &gt; <em>Insertion &gt; Graphique en histogramme/barres</em>. Donnez-lui le titre : <em>« Charge des palettes — Quai n°3 »</em>.
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('acte2')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all cursor-pointer"
              >
                <span>Passer à l’Acte 2 (Guide Illustré Word / Docs)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ONGLET 3 : ACTE 2 DOCUMENT (WORD & GOOGLE DOCS) */}
        {activeTab === 'acte2' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sky-300">
                  Étape 0 : Ouvrir le brouillon à réparer (KLF_Guide_Caristes_BRUT_101126.docx)
                </div>
                <p className="text-slate-300">
                  <strong>Sur Word :</strong> double-clic sur le fichier.{' '}
                  <strong>Sur Google Docs :</strong> ouvrez un nouveau document &gt; <em>Fichier &gt; Ouvrir</em> (ou glissez le `.docx` dans votre Google Drive et cliquez sur <em>Ouvrir avec Google Docs</em>).
                </p>
              </div>
              <a
                href="/api/lab/download-sample?labId=tp-bur-03-quai3-pack&part=docx"
                download="KLF_Guide_Caristes_BRUT_101126.docx"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger .docx</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">Étape 1</span>
                  <span>Chasser les lignes vides et faux espaces</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Word :</strong> activez le bouton <strong>¶ (Afficher tout)</strong> dans l’onglet Accueil pour voir les caractères invisibles. Supprimez les 10 appuis sur <code>Entrée</code> du haut et les espaces en trop avant les points/virgules.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Google Docs :</strong> utilisez <code>Ctrl + H</code> (Rechercher et remplacer) pour remplacer deux espaces par un seul, et effacez les grandes lignes vides sous l’introduction.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">Étape 2</span>
                  <span>Remplacer le gras manuel par de vrais Styles</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Appliquez le style <strong>Titre 1</strong> aux grands chapitres (<code>1.</code>, <code>2.</code>, <code>3.</code>, <code>4.</code>) et <strong>Titre 2</strong> au sous-chapitre (<code>1.1</code>).
                </p>
                <p className="text-slate-400">
                  <em>Pourquoi ?</em> Sans vrais Styles, Word et Google Docs sont incapables de générer un sommaire automatique !
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">Étape 3</span>
                  <span>Saut de page &amp; Sommaire automatique</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Placez votre curseur juste avant le chapitre <code>1.</code> et appuyez sur <strong>Ctrl + Entrée</strong> (saut de page propre). Revenez sur la page 1 et insérez le sommaire :
                </p>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li><strong>Word :</strong> <em>Références &gt; Table des matières</em></li>
                  <li><strong>Google Docs :</strong> <em>Insertion &gt; Table des matières</em></li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">Étape 4</span>
                  <span>Prendre 2 captures d’écran (Win + Maj + S)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Affichez votre tableur Acte 1 à l’écran. Appuyez sur <strong className="text-amber-300">Win + Maj + S</strong>, dessinez un rectangle autour de votre tableau (avec les feux rouges/verts), cliquez sur le texte <code>[A FAIRE ... CAPTURE 1]</code> dans votre document, effacez-le et appuyez sur <strong>Ctrl + V</strong> !
                </p>
                <p className="text-slate-400">
                  Faites de même pour la <strong>Capture 2</strong> (votre graphique en barres), puis ajoutez une courte légende en dessous de chaque image.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">Étape 5</span>
                  <span>Coller le mini-tableau des statistiques</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Dans Excel / Sheets, sélectionnez les cellules <code>A17:B23</code> (les 6 chiffres clés) et appuyez sur <code>Ctrl + C</code>. Dans Word / Docs, remplacez le repère <code>[A FAIRE ... MINI-TABLEAU]</code> avec <code>Ctrl + V</code> (choisissez <em>Conserver la mise en forme source</em> ou ajustez les bordures pour que tout reste lisible).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">Étape 6</span>
                  <span>En-tête, numéros de page &amp; Export PDF</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Double-cliquez tout en haut d’une page pour écrire <em>« KLF Technologies — Guide Caristes Quai n°3 »</em>. Tout en bas, insérez le <strong>Numéro de page</strong>. Terminez par <em>Fichier &gt; Exporter en PDF</em> (ou <em>Télécharger en .docx</em> pour passer l’auto-audit ci-dessous).
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-2.5">
              <Camera className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Rappel Google Docs pour l’auto-audit :</strong> une fois votre guide terminé dans Google Docs, cliquez sur{' '}
                <em>Fichier &gt; Télécharger &gt; Microsoft Word (.docx)</em> puis glissez-le dans la zone d’audit Acte 2 en bas de cette page !
              </span>
            </div>
          </div>
        )}

        {/* ONGLET 4 : CHECKLIST 10 POINTS & DÉFI BONUS */}
        {activeTab === 'checklist' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white font-['Lexend'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Auto-contrôle en 10 points avant dépôt final</span>
              </h3>
              <p className="text-xs text-slate-400">
                Cochez chaque étape vérifiée sur vos deux fichiers avant de les passer dans l’auto-auditeur et de les déposer dans votre casier Google Drive.
              </p>
            </div>

            <div className="space-y-2">
              {CHECKLIST_10_POINTS.map((item, idx) => {
                const isDone = !!checkedItems[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleCheck(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-3 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-100'
                        : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <span className={isDone ? 'line-through opacity-80' : ''}>{item}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2 text-xs">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Défi Bonus (pour ceux qui ont terminé en avance !)</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                1) Dans le tableur, ajoutez une colonne <code>Prime Sécurité Cariste</code> qui affiche <code>50 €</code> si le poids total de la palette est inférieur à <code>2 000 kg</code> et <code>0 €</code> sinon (<code>=SI(G4&lt;2000; 50; 0)</code>).
                <br />
                2) Dans le document Word / Docs, ajoutez un encadré coloré « Numéros d’urgence du Quai n°3 » en bas de la dernière page puis mettez à jour votre sommaire automatique.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
