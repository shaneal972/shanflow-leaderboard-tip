'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Lab, LabAuditSummary } from '@/types/tip';
import { auditQuai3Excel, auditQuai3Docx, mergeQuai3Audits } from '@/lib/lab/quai3AuditEngine';
import {
  FileSpreadsheet,
  FileText,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface LabQuai3DualAuditorProps {
  lab: Lab;
  initialAudit: LabAuditSummary | null;
  onAuditComplete: (summary: LabAuditSummary) => void;
  disabled?: boolean;
}

export const LabQuai3DualAuditor: React.FC<LabQuai3DualAuditorProps> = ({
  initialAudit,
  onAuditComplete,
  disabled = false,
}) => {
  const [excelAudit, setExcelAudit] = useState<LabAuditSummary | null>(() => {
    if (!initialAudit?.details) return null;
    const excelDetails = initialAudit.details.filter((d) => d.milestoneId.startsWith('q1') || d.milestoneId.startsWith('q2') || d.milestoneId.startsWith('q3') || d.milestoneId.startsWith('q4'));
    if (excelDetails.length === 0) return null;
    const valid = excelDetails.filter((d) => d.status === 'valide').length;
    return {
      timestamp: initialAudit.timestamp,
      fileName: 'Classeur enregistré',
      fileSize: 0,
      validCount: valid,
      milestonesCount: 4,
      scorePct: Math.round((valid / 4) * 100),
      isFullyValid: valid === 4,
      details: excelDetails,
    };
  });

  const [docxAudit, setDocxAudit] = useState<LabAuditSummary | null>(() => {
    if (!initialAudit?.details) return null;
    const docxDetails = initialAudit.details.filter((d) => d.milestoneId.startsWith('q5') || d.milestoneId.startsWith('q6'));
    if (docxDetails.length === 0) return null;
    const valid = docxDetails.filter((d) => d.status === 'valide').length;
    return {
      timestamp: initialAudit.timestamp,
      fileName: 'Document enregistré',
      fileSize: 0,
      validCount: valid,
      milestonesCount: 2,
      scorePct: Math.round((valid / 2) * 100),
      isFullyValid: valid === 2,
      details: docxDetails,
    };
  });

  const [isAuditingXlsx, setIsAuditingXlsx] = useState(false);
  const [isAuditingDocx, setIsAuditingDocx] = useState(false);
  const xlsxRef = useRef<HTMLInputElement>(null);
  const docxRef = useRef<HTMLInputElement>(null);

  const handleTriggerMerge = (nextExcel: LabAuditSummary | null, nextDocx: LabAuditSummary | null) => {
    const merged = mergeQuai3Audits(nextExcel, nextDocx);
    if (merged) {
      onAuditComplete(merged);
      if (merged.isFullyValid) {
        confetti({
          particleCount: 110,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#00B4D8', '#F59E0B', '#10B981'],
        });
      }
    }
  };

  const processExcel = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      alert('Format attendu pour l’Acte 1 : .xlsx (depuis Excel ou Google Sheets > Fichier > Télécharger > Excel .xlsx).');
      return;
    }
    setIsAuditingXlsx(true);
    try {
      const buf = await file.arrayBuffer();
      const summary = await auditQuai3Excel(buf, file.name, file.size);
      setExcelAudit(summary);
      handleTriggerMerge(summary, docxAudit);
    } catch (err: any) {
      alert('Erreur analyse tableur : ' + (err?.message || 'Fichier invalide'));
    } finally {
      setIsAuditingXlsx(false);
    }
  };

  const processDocx = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.docx')) {
      alert('Format attendu pour l’Acte 2 : .docx (depuis Word ou Google Docs > Fichier > Télécharger > Word .docx).');
      return;
    }
    setIsAuditingDocx(true);
    try {
      const buf = await file.arrayBuffer();
      const summary = await auditQuai3Docx(buf, file.name, file.size);
      setDocxAudit(summary);
      handleTriggerMerge(excelAudit, summary);
    } catch (err: any) {
      alert('Erreur analyse document : ' + (err?.message || 'Fichier invalide'));
    } finally {
      setIsAuditingDocx(false);
    }
  };

  const mergedScore = mergeQuai3Audits(excelAudit, docxAudit);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dépôt 1 : Tableur .xlsx */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!disabled && e.dataTransfer.files?.[0]) processExcel(e.dataTransfer.files[0]);
          }}
          onClick={() => !disabled && xlsxRef.current?.click()}
          className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2.5 ${
            excelAudit?.isFullyValid
              ? 'border-emerald-500/50 bg-emerald-950/15'
              : 'border-white/15 bg-white/[0.02] hover:border-emerald-400/50 hover:bg-emerald-500/5'
          }`}
        >
          <input
            type="file"
            ref={xlsxRef}
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processExcel(e.target.files[0])}
            disabled={disabled}
          />
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {isAuditingXlsx ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : excelAudit?.isFullyValid ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <FileSpreadsheet className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-white font-['Lexend']">
              Acte 1 : Déposer le tableur (.xlsx)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Excel ou Google Sheets (Télécharger .xlsx)
            </div>
          </div>
          {excelAudit ? (
            <div className="text-xs font-mono font-bold text-emerald-300">
              {excelAudit.validCount}/4 jalons validés ({excelAudit.fileName})
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Cliquer ou glisser ici</span>
            </div>
          )}
        </div>

        {/* Dépôt 2 : Document .docx */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!disabled && e.dataTransfer.files?.[0]) processDocx(e.dataTransfer.files[0]);
          }}
          onClick={() => !disabled && docxRef.current?.click()}
          className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-2.5 ${
            docxAudit?.isFullyValid
              ? 'border-sky-500/50 bg-sky-950/15'
              : 'border-white/15 bg-white/[0.02] hover:border-sky-400/50 hover:bg-sky-500/5'
          }`}
        >
          <input
            type="file"
            ref={docxRef}
            accept=".docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processDocx(e.target.files[0])}
            disabled={disabled}
          />
          <div className="w-10 h-10 mx-auto rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            {isAuditingDocx ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : docxAudit?.isFullyValid ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-white font-['Lexend']">
              Acte 2 : Déposer le document (.docx)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Word ou Google Docs (Télécharger .docx)
            </div>
          </div>
          {docxAudit ? (
            <div className="text-xs font-mono font-bold text-sky-300">
              {docxAudit.validCount}/2 jalons validés ({docxAudit.fileName})
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Cliquer ou glisser ici</span>
            </div>
          )}
        </div>
      </div>

      {/* Barre de score consolidé */}
      {mergedScore && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-mono ${
            mergedScore.isFullyValid
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              : 'bg-teal-500/10 border-teal-500/30 text-teal-200'
          }`}
        >
          <span className="flex items-center gap-2 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              Score cumulé Acte 1 + Acte 2 : {mergedScore.validCount}/6 jalons ({mergedScore.scorePct} %)
            </span>
          </span>
          <span>
            {mergedScore.isFullyValid ? '100 % prêt pour soumission !' : 'Complétez les jalons restants'}
          </span>
        </div>
      )}
    </div>
  );
};
