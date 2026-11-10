'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lab,
  LabSubmission,
  LabAuditSummary,
  LabParticipantProgress,
  LabSubmissionStatus,
  Apprenant,
} from '@/types/tip';
import {
  applyLocalAuditToParticipants,
  applyLocalSubmissionStatusToParticipants,
} from '@/core/domain/labProgress';
import { saveLabProgressAction } from '@/app/lab/actions';
import { LabExcelAuditor } from './LabExcelAuditor';
import { LabQuai3DualAuditor } from './LabQuai3DualAuditor';
import { LabQuai3GuidePanel } from './LabQuai3GuidePanel';
import { LabMilestoneList } from './LabMilestoneList';
import { LabNotebookForm } from './LabNotebookForm';
import { LabPromoProgressPanel } from './LabPromoProgressPanel';
import { 
  ArrowLeft, 
  Sparkles, 
  Trophy, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Anchor, 
  Building2,
  FileCheck2,
  Lock,
  UserCheck,
  ShieldCheck,
  Download
} from 'lucide-react';

interface LabWorkbenchProps {
  lab: Lab;
  student: Apprenant;
  initialSubmission?: LabSubmission | null;
  isFormateur?: boolean;
  labParticipants?: LabParticipantProgress[];
}

export const LabWorkbench: React.FC<LabWorkbenchProps> = ({
  lab,
  student,
  initialSubmission,
  isFormateur = false,
  labParticipants = [],
}) => {
  const router = useRouter();
  const [currentAudit, setCurrentAudit] = useState<LabAuditSummary | null>(
    initialSubmission?.audit_results || null
  );
  const [participants, setParticipants] =
    useState<LabParticipantProgress[]>(labParticipants);

  useEffect(() => {
    setParticipants(labParticipants);
  }, [labParticipants]);

  const handleAuditComplete = (summary: LabAuditSummary) => {
    setCurrentAudit(summary);
    setParticipants((prev) =>
      applyLocalAuditToParticipants(prev, student.id, lab, summary)
    );

    // Auto-sauvegarde immédiate en base dès le dépôt et l'audit du fichier
    saveLabProgressAction({
      labId: lab.id,
      studentId: student.id,
      auditResults: summary,
      reponseDemarche: initialSubmission?.reponse_demarche || '',
      reponseDifficultes: initialSubmission?.reponse_difficultes || '',
      reponseEnseignements: initialSubmission?.reponse_enseignements || '',
      isDraft: true,
    })
      .then((res) => {
        if (res.success) {
          if (res.statut) {
            setParticipants((prev) =>
              applyLocalSubmissionStatusToParticipants(prev, student.id, {
                statut: res.statut as LabSubmissionStatus,
                pointsAttribues: res.pointsAttribues ?? 0,
              })
            );
          }
          router.refresh();
        }
      })
      .catch((err) => console.error('Erreur auto-save audit:', err));
  };

  const handleSubmissionSaved = (result: {
    statut: LabSubmissionStatus;
    pointsAttribues: number;
  }) => {
    setParticipants((prev) =>
      applyLocalSubmissionStatusToParticipants(prev, student.id, result)
    );
    router.refresh();
  };

  const auditDetails = currentAudit?.details || [];

  return (
    <div className="space-y-6">
      
      {/* 1. Fil d'Ariane & En-tête de l'Atelier */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link
              href="/lab"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-teal-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour au catalogue des ateliers</span>
            </Link>
            <span className="text-slate-600">•</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">
              {lab.domaine.toUpperCase()} • {lab.palier}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Lexend'] tracking-tight">
            {lab.titre}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {lab.id === 'tp-bur-03-quai3-pack'
                ? 'Logistique Quai n°3 & Support DSI (Jarry)'
                : 'Service Facturation & Douane (Jarry)'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Durée estimée : {lab.duree_estimee}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-mono">
              <Trophy className="w-3.5 h-3.5" />
              +{lab.points_total} pts KLF au total
            </span>
          </div>
        </div>

        {/* Cartouche d'identité technicien connecté */}
        <div className="p-3 rounded-2xl slate-glass border border-white/10 flex items-center gap-3 self-start md:self-center">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0">
            {student.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.avatar_url} alt={student.prenom} className="w-full h-full rounded-full" />
            ) : (
              `${student.prenom[0]}${student.nom[0]}`
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 font-['Lexend'] flex items-center gap-1.5">
              <span>{student.prenom} {student.nom}</span>
              {isFormateur && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                  DSI
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-teal-400">
              Technicien en poste • {student.points_total} pts
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau Formateur DSI si session administrateur */}
      {isFormateur && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Mode formateur DSI actif</strong> : Supervision pédagogique en direct.
            </span>
          </div>
          {lab.id === 'tp-bur-01-corinne' && (
            <a
              href="/api/admin/lab/download-corrige?labId=tp-bur-01-corinne"
              download="KLF_Manifeste_Arrivages_Corinne_CORRIGE_DSI.xlsx"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le corrigé DSI (.xlsx)</span>
            </a>
          )}
          {lab.id === 'tp-bur-03-quai3-pack' && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="/api/admin/lab/download-corrige?labId=tp-bur-03-quai3-pack&part=xlsx"
                download="KLF_Palette_Quai3_CORRIGE_DSI_101126.xlsx"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Corrigé Tableur (.xlsx)</span>
              </a>
              <a
                href="/api/admin/lab/download-corrige?labId=tp-bur-03-quai3-pack&part=docx"
                download="KLF_Guide_Caristes_CORRIGE_DSI_101126.docx"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500/80 hover:bg-amber-400 text-slate-950 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Corrigé Word/Docs (.docx)</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* 2. Mise en situation & Consignes KLF */}
      <div className="p-5 rounded-2xl slate-glass border border-teal-500/20 bg-teal-950/10 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-300">
          <Anchor className="w-4 h-4 text-teal-400" />
          <span>Mise en situation d&apos;entreprise KLF</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {lab.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="font-semibold text-slate-300">Objectifs opérationnels visés :</span>
            <ul className="mt-1 space-y-1 text-slate-400 list-disc list-inside">
              {(lab.objectifs || []).map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-semibold text-slate-300">Protocole de réalisation :</span>
            <ol className="mt-1 space-y-1 text-slate-400 list-decimal list-inside">
              {(lab.consignes_etapes || []).slice(0, 4).map((consigne, i) => (
                <li key={i}>{consigne}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* 2b. Liste des apprenants participants & Jauge /100 */}
      {participants.length > 0 && (
        <LabPromoProgressPanel
          lab={lab}
          participants={participants}
          currentStudentId={student.id}
          isFormateur={isFormateur}
        />
      )}

      {/* Guide Interactif 4h00 « Zéro Jargon » pour le Pack Quai n°3 */}
      {lab.id === 'tp-bur-03-quai3-pack' && <LabQuai3GuidePanel />}

      {/* 3. Établi Technique Écran Scindé (Workbench) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Volet Gauche : Auto-auditeur & Checklist Jalons (7 colonnes) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 sm:p-6 rounded-3xl slate-glass border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white font-['Lexend']">
                  Inspecteur &amp; Auto-audit en direct
                </h2>
                <p className="text-[11px] text-slate-400">
                  {lab.id === 'tp-bur-03-quai3-pack'
                    ? `Déposez votre tableur (.xlsx) et votre guide (.docx) pour valider les ${lab.jalons.length} jalons.`
                    : `Déposez votre fichier .xlsx pour vérifier automatiquement les ${lab.jalons.length} jalons d'inspection.`}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400 border border-white/5">
                Client-Side Engine
              </span>
            </div>

            {/* Zone de glisser-déposer */}
            {lab.id === 'tp-bur-03-quai3-pack' ? (
              <LabQuai3DualAuditor
                lab={lab}
                initialAudit={currentAudit}
                onAuditComplete={handleAuditComplete}
              />
            ) : (
              <LabExcelAuditor
                lab={lab}
                initialAudit={currentAudit}
                onAuditComplete={handleAuditComplete}
              />
            )}

            {/* Liste des jalons */}
            <LabMilestoneList
              milestones={lab.jalons || []}
              auditDetails={auditDetails}
            />
          </div>
        </div>

        {/* Volet Droit : Carnet de Laboratoire & Rédaction Réflexive (5 colonnes) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 sm:p-6 rounded-3xl slate-glass border border-white/10 space-y-4">
            <LabNotebookForm
              lab={lab}
              student={student}
              initialSubmission={initialSubmission}
              currentAudit={currentAudit}
              onSubmissionSaved={handleSubmissionSaved}
            />
          </div>

          {/* Rappel du barème d'atelier */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-mono space-y-2 text-slate-400">
            <div className="text-slate-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Barème & Gratification progressive KLF :
            </div>
            <div className="flex justify-between">
              <span>• Auto-validation technique (5 jalons) :</span>
              <span className="text-teal-400 font-bold">+{lab.points_auto_validation} pts immédiats</span>
            </div>
            <div className="flex justify-between">
              <span>• Homologation qualitative formateur DSI :</span>
              <span className="text-amber-400 font-bold">+{lab.points_total - lab.points_auto_validation} pts + Trophée</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
