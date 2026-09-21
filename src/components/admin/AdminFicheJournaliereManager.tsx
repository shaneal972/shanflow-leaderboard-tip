'use client';

import React, { useState, useTransition } from 'react';
import {
  CHRONOGRAMME_SESSIONS,
  ChronogrammeSession,
  SessionItem,
} from '@/lib/data/chronogrammeSessions';
import { FicheJournaliereData } from '@/lib/templates/ficheJournalierePdfTemplate';
import {
  FileText,
  Download,
  Copy,
  Check,
  RotateCcw,
  Calendar,
  User,
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  Layers,
  ChevronRight,
  Printer,
  CheckCircle2,
} from 'lucide-react';

export const AdminFicheJournaliereManager: React.FC = () => {
  // Trouver la séance par défaut (par exemple séance 3 ou 4 ou la plus proche de la date courante)
  const [selectedSeanceNum, setSelectedSeanceNum] = useState<number>(() => {
    // Par défaut, séance 3 (15/09/2026) ou séance 4 (22/09/2026)
    return 3;
  });

  const currentDefaultSession =
    CHRONOGRAMME_SESSIONS.find((s) => s.seanceNum === selectedSeanceNum) ||
    CHRONOGRAMME_SESSIONS[0];

  // État local éditable de la fiche
  const [nomFormateur, setNomFormateur] = useState<string>(
    currentDefaultSession.nomFormateur || 'David JACQUA'
  );
  const [module, setModule] = useState<string>(
    currentDefaultSession.module || 'Bureautique & Pratiques Collaboratives'
  );
  const [filiere, setFiliere] = useState<string>(
    currentDefaultSession.filiere || 'TIP - Technicien Installateur de Poste'
  );
  const [date, setDate] = useState<string>(currentDefaultSession.date);
  const [seanceStr, setSeanceStr] = useState<string>(String(currentDefaultSession.seanceNum));

  const [objectifs, setObjectifs] = useState<SessionItem[]>(
    currentDefaultSession.objectifs.map((item) => ({ ...item }))
  );
  const [contenu, setContenu] = useState<SessionItem[]>(
    currentDefaultSession.contenu.map((item) => ({ ...item }))
  );
  const [supports, setSupports] = useState<SessionItem[]>(
    currentDefaultSession.supports.map((item) => ({ ...item }))
  );
  const [remarques, setRemarques] = useState<SessionItem[]>(
    currentDefaultSession.remarques.map((item) => ({ ...item }))
  );

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Changement de séance dans le sélecteur
  const handleSelectSession = (seanceId: number) => {
    const session = CHRONOGRAMME_SESSIONS.find((s) => s.seanceNum === seanceId);
    if (!session) return;

    setSelectedSeanceNum(seanceId);
    setNomFormateur(session.nomFormateur || 'David JACQUA');
    setModule(session.module || 'Bureautique & Pratiques Collaboratives');
    setFiliere(session.filiere || 'TIP - Technicien Installateur de Poste');
    setDate(session.date);
    setSeanceStr(String(session.seanceNum));
    setObjectifs(session.objectifs.map((i) => ({ ...i })));
    setContenu(session.contenu.map((i) => ({ ...i })));
    setSupports(session.supports.map((i) => ({ ...i })));
    setRemarques(session.remarques.map((i) => ({ ...i })));

    setFeedbackMessage({
      type: 'info',
      text: `Séance N°${session.seanceNum} chargée : "${session.titre}"`,
    });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Réinitialisation aux valeurs officielles du chronogramme
  const handleResetToDefault = () => {
    const session =
      CHRONOGRAMME_SESSIONS.find((s) => s.seanceNum === selectedSeanceNum) ||
      CHRONOGRAMME_SESSIONS[0];

    setNomFormateur(session.nomFormateur || 'David JACQUA');
    setModule(session.module || 'Bureautique & Pratiques Collaboratives');
    setFiliere(session.filiere || 'TIP - Technicien Installateur de Poste');
    setDate(session.date);
    setSeanceStr(String(session.seanceNum));
    setObjectifs(session.objectifs.map((i) => ({ ...i })));
    setContenu(session.contenu.map((i) => ({ ...i })));
    setSupports(session.supports.map((i) => ({ ...i })));
    setRemarques(session.remarques.map((i) => ({ ...i })));

    setFeedbackMessage({
      type: 'success',
      text: `Séance N°${session.seanceNum} rétablie selon le chronogramme officiel.`,
    });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Gestion des items dans les listes
  const handleItemChange = (
    listType: 'objectifs' | 'contenu' | 'supports' | 'remarques',
    index: number,
    field: 'bold' | 'text',
    value: string
  ) => {
    const updater = (prev: SessionItem[]) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    };

    if (listType === 'objectifs') setObjectifs(updater);
    if (listType === 'contenu') setContenu(updater);
    if (listType === 'supports') setSupports(updater);
    if (listType === 'remarques') setRemarques(updater);
  };

  const handleAddItem = (listType: 'objectifs' | 'contenu' | 'supports' | 'remarques') => {
    const newItem: SessionItem = { bold: 'Point abordé : ', text: 'Description...' };
    if (listType === 'objectifs') setObjectifs((prev) => [...prev, newItem]);
    if (listType === 'contenu') setContenu((prev) => [...prev, newItem]);
    if (listType === 'supports') setSupports((prev) => [...prev, newItem]);
    if (listType === 'remarques') setRemarques((prev) => [...prev, newItem]);
  };

  const handleDeleteItem = (
    listType: 'objectifs' | 'contenu' | 'supports' | 'remarques',
    index: number
  ) => {
    const remover = (prev: SessionItem[]) => prev.filter((_, i) => i !== index);
    if (listType === 'objectifs') setObjectifs(remover);
    if (listType === 'contenu') setContenu(remover);
    if (listType === 'supports') setSupports(remover);
    if (listType === 'remarques') setRemarques(remover);
  };

  // Téléchargement du PDF via l'API Gotenberg
  const handleExportPdf = async () => {
    setIsExporting(true);
    setFeedbackMessage({
      type: 'info',
      text: 'Génération du PDF A4 en cours via Gotenberg Chromium...',
    });

    const payload: FicheJournaliereData = {
      nomFormateur,
      module,
      filiere,
      date,
      seance: seanceStr,
      objectifs,
      contenu,
      supports,
      remarques,
    };

    try {
      const response = await fetch('/api/fiches-journalieres/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ficheData: payload }),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || `Erreur serveur (${response.status})`);
      }

      // Réception du blob binaire et téléchargement automatique
      const blob = await response.blob();
      const cleanDate = (date || 'session').replace(/[\/\\]/g, '-').trim();
      const cleanNom = (nomFormateur || 'FORMATEUR').trim().replace(/\s+/g, '_');
      const filename = `FICHE_JOURNALIERE_ACTIVITE_FORMATEUR_${cleanDate}_${cleanNom}.pdf`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setFeedbackMessage({
        type: 'success',
        text: `Fiche journalière téléchargée avec succès : ${filename}`,
      });
    } catch (err: any) {
      console.error('Erreur export PDF fiche journalière:', err);
      setFeedbackMessage({
        type: 'error',
        text: `Échec du téléchargement : ${err.message || 'Erreur inconnue'}`,
      });
    } finally {
      setIsExporting(false);
      setTimeout(() => setFeedbackMessage(null), 6000);
    }
  };

  // Copie du récapitulatif textuel
  const handleCopySummary = async () => {
    const summary = `FICHE JOURNALIÈRE D'ACTIVITÉ FORMATEUR (EN-19)
------------------------------------------------------
Formateur : ${nomFormateur}
Filière   : ${filiere}
Module    : ${module}
Date      : ${date} | Séance N°${seanceStr}

1. OBJECTIFS DE LA SÉANCE :
${objectifs.map((o) => `• ${o.bold}${o.text || ''}`).join('\n')}

2. CONTENU DE LA SÉANCE :
${contenu.map((c) => `• ${c.bold}${c.text || ''}`).join('\n')}

3. SUPPORTS UTILISÉS :
${supports.map((s) => `• ${s.bold}${s.text || ''}`).join('\n')}

4. REMARQUES PARTICULIÈRES & BILAN :
${remarques.map((r) => `• ${r.bold}${r.text || ''}`).join('\n')}
`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch (e) {
      console.error('Impossible de copier dans le presse-papier', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête du module */}
      <div className="p-5 rounded-2xl slate-glass border border-white/10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Fiches journalières de formation (EN-19 Qualiopi)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Génération automatisée conforme au chronogramme officiel de 85h de David JACQUA (30 séances de formation TIP).
            </p>
          </div>

          {/* Actions d'export & copie */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              title="Copier le récapitulatif textuel de la séance"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copier le texte</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
              title="Réinitialiser avec le contenu officiel du chronogramme 85h"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Rétablir le défaut</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 border border-teal-400/40 shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Compiler et télécharger le PDF A4 1-page via Gotenberg Chromium"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Compilation Gotenberg...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Exporter le PDF officiel (A4 1 page)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message de notification contextuel */}
        {feedbackMessage && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium border ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : feedbackMessage.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-teal-500/10 border-teal-500/30 text-teal-300'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : feedbackMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0 text-teal-400" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Sélecteur de séance du chronogramme */}
        <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-2">
          <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>Sélectionner la séance du chronogramme (30 séances prévues) :</span>
          </label>
          <select
            value={selectedSeanceNum}
            onChange={(e) => handleSelectSession(Number(e.target.value))}
            className="w-full bg-[#070F1E] border border-white/20 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-400 transition-colors cursor-pointer"
          >
            {CHRONOGRAMME_SESSIONS.map((s) => (
              <option key={s.seanceNum} value={s.seanceNum} className="bg-[#070F1E] text-slate-200 py-1">
                Séance {String(s.seanceNum).padStart(2, '0')} ({s.date}) : {s.titre} — [{s.module}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulaire complet de la fiche journalière */}
      <form noValidate className="space-y-6">
        {/* Métadonnées administratives */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-2xl slate-glass border border-white/10">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-teal-400" />
              <span>Nom du formateur</span>
            </label>
            <input
              type="text"
              value={nomFormateur}
              onChange={(e) => setNomFormateur(e.target.value)}
              className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-teal-400" />
              <span>Filière</span>
            </label>
            <input
              type="text"
              value={filiere}
              onChange={(e) => setFiliere(e.target.value)}
              className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 font-medium"
            />
          </div>

          <div className="space-y-1 lg:col-span-2">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-teal-400" />
              <span>Module</span>
            </label>
            <input
              type="text"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-teal-400" />
                <span>Date</span>
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-teal-400" />
                <span>Séance N°</span>
              </label>
              <input
                type="text"
                value={seanceStr}
                onChange={(e) => setSeanceStr(e.target.value)}
                className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white text-center focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
        </div>

        {/* 4 Rubriques réglementaires EN-19 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. Objectifs de la séance */}
          <RubriqueEditor
            title="1. Objectifs de la séance"
            badge="Pédagogique"
            badgeColor="bg-teal-500/20 text-teal-300 border-teal-500/30"
            items={objectifs}
            onItemChange={(idx, field, val) => handleItemChange('objectifs', idx, field, val)}
            onAddItem={() => handleAddItem('objectifs')}
            onDeleteItem={(idx) => handleDeleteItem('objectifs', idx)}
          />

          {/* 2. Contenu de la séance */}
          <RubriqueEditor
            title="2. Contenu de la séance"
            badge="Acquis & TP"
            badgeColor="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
            items={contenu}
            onItemChange={(idx, field, val) => handleItemChange('contenu', idx, field, val)}
            onAddItem={() => handleAddItem('contenu')}
            onDeleteItem={(idx) => handleDeleteItem('contenu', idx)}
          />

          {/* 3. Supports utilisés */}
          <RubriqueEditor
            title="3. Supports utilisés"
            badge="Ressources"
            badgeColor="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
            items={supports}
            onItemChange={(idx, field, val) => handleItemChange('supports', idx, field, val)}
            onAddItem={() => handleAddItem('supports')}
            onDeleteItem={(idx) => handleDeleteItem('supports', idx)}
          />

          {/* 4. Remarques particulières & bilan */}
          <RubriqueEditor
            title="4. Remarques particulières & bilan"
            badge="Terrain & Suivi"
            badgeColor="bg-amber-500/20 text-amber-300 border-amber-500/30"
            items={remarques}
            onItemChange={(idx, field, val) => handleItemChange('remarques', idx, field, val)}
            onAddItem={() => handleAddItem('remarques')}
            onDeleteItem={(idx) => handleDeleteItem('remarques', idx)}
          />
        </div>

        {/* Prévisualisation synthétique en bas de page */}
        <div className="p-5 rounded-2xl slate-glass border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-4 h-4 text-teal-400" />
              <span>Aperçu de la fiche journalière prête pour Gotenberg (A4 1 page)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              {nomFormateur} • {date} • Séance N°{seanceStr}
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 text-black text-[11px] space-y-2 border border-slate-300 shadow-inner overflow-hidden font-sans">
            <div className="border border-black p-2 flex justify-between items-center text-[10px] font-bold">
              <div>ORGANISME DE FORMATION : KLF FORE ALTERNANCE</div>
              <div>FICHE JOURNALIERE D'ACTIVITÉ FORMATEUR (EN-19)</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] border-b pb-2">
              <div><strong>Formateur :</strong> {nomFormateur} | <strong>Filière :</strong> {filiere}</div>
              <div className="text-right"><strong>Module :</strong> {module} | <strong>Date :</strong> {date} (Séance {seanceStr})</div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="font-bold text-[10px] text-teal-900 border-b border-teal-800 mb-1">1. Objectifs</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {objectifs.slice(0, 3).map((o, idx) => (
                    <li key={idx}><strong>{o.bold}</strong> {(o.text || '').substring(0, 60)}...</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-bold text-[10px] text-teal-900 border-b border-teal-800 mb-1">2. Contenu</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {contenu.slice(0, 3).map((c, idx) => (
                    <li key={idx}><strong>{c.bold}</strong> {(c.text || '').substring(0, 60)}...</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// Sous-composant éditeur de rubrique modulaire
interface RubriqueEditorProps {
  title: string;
  badge: string;
  badgeColor: string;
  items: SessionItem[];
  onItemChange: (index: number, field: 'bold' | 'text', value: string) => void;
  onAddItem: () => void;
  onDeleteItem: (index: number) => void;
}

const RubriqueEditor: React.FC<RubriqueEditorProps> = ({
  title,
  badge,
  badgeColor,
  items,
  onItemChange,
  onAddItem,
  onDeleteItem,
}) => {
  return (
    <div className="p-4 rounded-2xl slate-glass border border-white/10 space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-white tracking-wide">{title}</h3>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${badgeColor}`}>
              {badge}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {items.length} {items.length > 1 ? 'points' : 'point'}
          </span>
        </div>

        {/* Liste des items */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-black/30 border border-white/10 space-y-1.5 group hover:border-teal-500/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Intitulé gras (ex: Module ou Action : )"
                  value={item.bold}
                  onChange={(e) => onItemChange(idx, 'bold', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold text-teal-300 focus:outline-none focus:border-teal-400"
                />
                <button
                  type="button"
                  onClick={() => onDeleteItem(idx)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Supprimer cette ligne"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                rows={2}
                placeholder="Détail factuel du point..."
                value={item.text}
                onChange={(e) => onItemChange(idx, 'text', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-teal-400 resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onAddItem}
        className="w-full mt-2 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-teal-400/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 text-teal-400" />
        <span>Ajouter un point</span>
      </button>
    </div>
  );
};
