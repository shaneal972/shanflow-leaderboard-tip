'use client';

import React, { useState, useTransition } from 'react';
import { Lab, LabSubmission, LabAuditSummary, Apprenant } from '@/types/tip';
import { saveLabProgressAction } from '@/app/lab/actions';
import { 
  FileText, 
  Send, 
  Save, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  ClipboardPaste
} from 'lucide-react';

interface LabNotebookFormProps {
  lab: Lab;
  student: Apprenant;
  initialSubmission?: LabSubmission | null;
  currentAudit: LabAuditSummary | null;
}

export const LabNotebookForm: React.FC<LabNotebookFormProps> = ({
  lab,
  student,
  initialSubmission,
  currentAudit,
}) => {
  const [isPending, startTransition] = useTransition();

  const [demarche, setDemarche] = useState<string>(
    initialSubmission?.reponse_demarche || ''
  );
  const [difficultes, setDifficultes] = useState<string>(
    initialSubmission?.reponse_difficultes || ''
  );
  const [enseignements, setEnseignements] = useState<string>(
    initialSubmission?.reponse_enseignements || ''
  );

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Injection automatique de la preuve d'audit dans la démarche technique
  const handleInjectAuditEvidence = () => {
    if (!currentAudit) {
      alert("Veuillez d'abord déposer et faire auditer votre classeur Excel.");
      return;
    }

    const auditSnippet = `[PREUVE D'AUDIT KLF ENGINE - ${currentAudit.fileName}]
- Conformité globale : ${currentAudit.scorePct}% (${currentAudit.validCount}/5 jalons atteints)
${currentAudit.details.map((d) => `• ${d.status === 'valide' ? '✓' : '✗'} ${d.message}`).join('\n')}

DÉMARCHE TECHNIQUE OPÉRATIONNELLE :
1. Rétablissement des codes postaux : application du format texte sur 5 positions sans perte des zéros.
2. Éradication des #N/A : utilisation de SUPPRESPACE pour purger les espaces parasites en fin de chaîne.
3. Fiscalité locale : calcul dynamique Octroi de mer (8.5%) et TVA (8.5%) avec références bloquées ($H$2 et $I$2).
4. Ergonomie usager : figeage des volets et recette du total général TTC.`;

    setDemarche((prev) => (prev ? `${prev}\n\n${auditSnippet}` : auditSnippet));
    setNotification({
      type: 'success',
      message: 'Preuve technique d\'audit injectée dans votre démarche !',
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = (isDraft: boolean) => {
    setNotification(null);

    if (!isDraft && (!demarche || demarche.length < 20)) {
      setNotification({
        type: 'error',
        message: 'Veuillez rédiger une démarche technique d\'au moins 20 caractères avant de soumettre.',
      });
      return;
    }

    startTransition(async () => {
      const res = await saveLabProgressAction({
        labId: lab.id,
        studentId: student.id,
        auditResults: currentAudit || initialSubmission?.audit_results || null,
        reponseDemarche: demarche,
        reponseDifficultes: difficultes,
        reponseEnseignements: enseignements,
        isDraft,
      });

      if (res.success) {
        setNotification({
          type: 'success',
          message: isDraft
            ? 'Brouillon sauvegardé avec succès.'
            : `Compte-rendu transmis à David JACQUA ! (${res.pointsAttribues} pts attribués)`,
        });
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Erreur lors de la sauvegarde.',
        });
      }
    });
  };

  // Téléchargement du PDF officiel A4 Gotenberg
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const url = `/api/lab/export-pdf?labId=${lab.id}&studentId=${student.id}`;
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erreur lors de la génération Gotenberg');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Compte-Rendu_KLF-Lab_${lab.id}_${student.nom}_${student.prenom}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert('Échec de la génération PDF : ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <form noValidate onSubmit={(e) => e.preventDefault()} className="space-y-4">
      
      {/* En-tête du carnet */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Carnet de laboratoire & analyse réflexive</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Documentez votre raisonnement pour le Dossier Professionnel et le jury du Titre Pro.
          </p>
        </div>

        {currentAudit && (
          <button
            type="button"
            onClick={handleInjectAuditEvidence}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 border border-teal-500/30 transition-all"
            title="Injecte la synthèse des jalons validés dans le champ Démarche technique"
          >
            <ClipboardPaste className="w-3 h-3" />
            <span>Injecter la preuve</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 border animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Champ 1 : Démarche d'investigation et formules */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span>1. Démarche technique d&apos;investigation et formules appliquées</span>
          <span className="text-[10px] text-slate-400 font-mono">Obligatoire</span>
        </label>
        <textarea
          value={demarche}
          onChange={(e) => setDemarche(e.target.value)}
          rows={5}
          placeholder="Ex : 1. Constat des erreurs #N/A dues aux espaces parasites en fin de chaîne. 2. Utilisation de =SUPPRESPACE(...) et =SIERREUR(...). 3. Formule Octroi de mer =F4*$H$2 avec le signe $ pour bloquer la ligne de taux..."
          className="w-full p-3 rounded-xl bg-[#070F1E] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors font-mono resize-y"
        />
      </div>

      {/* Champ 2 : Difficultés & Contournement */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span>2. Difficultés rencontrées et solutions de contournement</span>
          <span className="text-[10px] text-slate-400 font-mono">Réflexivité</span>
        </label>
        <textarea
          value={difficultes}
          onChange={(e) => setDifficultes(e.target.value)}
          rows={3}
          placeholder="Ex : Difficulté à identifier le décalage de cellule lors de l'étirement sans le symbole $, et compréhension de la perte du zéro initial sur les codes postaux 971..."
          className="w-full p-3 rounded-xl bg-[#070F1E] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors font-mono resize-y"
        />
      </div>

      {/* Champ 3 : Enseignements pour l'oral */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span>3. Enseignements DSI pour la pratique professionnelle</span>
          <span className="text-[10px] text-slate-400 font-mono">Posture pro</span>
        </label>
        <textarea
          value={enseignements}
          onChange={(e) => setEnseignements(e.target.value)}
          rows={3}
          placeholder="Ex : Ne jamais coder de taux fiscal en dur dans un tableau partagé en entreprise. Toujours figer les lignes d'en-tête pour les utilisateurs finaux..."
          className="w-full p-3 rounded-xl bg-[#070F1E] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors font-mono resize-y"
        />
      </div>

      {/* Boutons d'action */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Brouillon</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all shadow-[0_0_15px_rgba(0,180,216,0.25)] disabled:opacity-50 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transmettre à David</span>
          </button>
        </div>

        {/* Bouton d'export Gotenberg A4 */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all disabled:opacity-50 active:scale-95 ml-auto"
          title="Génère un compte-rendu officiel 1-page A4 certifié KLF via Gotenberg"
        >
          {isGeneratingPdf ? (
            <Clock className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          ) : (
            <Download className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>{isGeneratingPdf ? 'Génération A4...' : 'Fiche TP A4 (Gotenberg)'}</span>
        </button>
      </div>

    </form>
  );
};
