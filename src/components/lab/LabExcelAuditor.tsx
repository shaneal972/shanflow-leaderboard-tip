'use client';

import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Lab, LabAuditSummary } from '@/types/tip';
import { auditCorinneManifesteExcel } from '@/lib/lab/excelAuditEngine';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  FileCheck2,
  HardDrive
} from 'lucide-react';

interface LabExcelAuditorProps {
  lab: Lab;
  initialAudit: LabAuditSummary | null;
  onAuditComplete: (summary: LabAuditSummary) => void;
  disabled?: boolean;
}

export const LabExcelAuditor: React.FC<LabExcelAuditorProps> = ({
  lab,
  initialAudit,
  onAuditComplete,
  disabled = false,
}) => {
  const [audit, setAudit] = useState<LabAuditSummary | null>(initialAudit);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert("Format non supporté : Veuillez déposer un classeur Excel valide (.xlsx).");
      return;
    }

    setIsAuditing(true);
    try {
      const buffer = await file.arrayBuffer();
      // Exécution de l'audit 100% en mémoire dans le navigateur
      const summary = await auditCorinneManifesteExcel(buffer, file.name, file.size);
      setAudit(summary);
      onAuditComplete(summary);

      // Célébration confettis si 100% de conformité atteinte
      if (summary.isFullyValid) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00B4D8', '#F59E0B', '#10B981'],
        });
      }
    } catch (err: any) {
      console.error("Erreur lors de l'audit Excel :", err);
      alert("Erreur lors de l'analyse du fichier : " + (err.message || 'Fichier corrompu'));
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) handleProcessFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) handleProcessFile(file);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Bloc de téléchargement du classeur brut KLF */}
      <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white font-['Lexend']">
              Fichier source de travail
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {lab.fichier_modele_nom} • Manifeste portuaire avec erreurs réelles
            </div>
          </div>
        </div>

        <a
          href={lab.fichier_modele_url}
          download={lab.fichier_modele_nom}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)] shrink-0 active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Télécharger le classeur brut</span>
        </a>
      </div>

      {/* 2. Zone de dépôt & auto-audit in-browser */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled) fileInputRef.current?.click();
        }}
        className={`relative p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
          isDragging
            ? 'border-teal-400 bg-teal-500/10 scale-[1.01]'
            : audit?.isFullyValid
            ? 'border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-400'
            : 'border-white/15 bg-white/[0.02] hover:border-teal-400/50 hover:bg-white/[0.04]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
          disabled={disabled}
        />

        <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-teal-400">
          {isAuditing ? (
            <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
          ) : audit?.isFullyValid ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : (
            <UploadCloud className="w-6 h-6 text-slate-300" />
          )}
        </div>

        <div className="space-y-1">
          <div className="text-sm font-bold text-white font-['Lexend']">
            {isAuditing
              ? "Inspection fine du classeur en cours..."
              : audit?.isFullyValid
              ? "Classeur audité et 100% conforme !"
              : "Glissez votre classeur Excel réparé ici"}
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isAuditing
              ? "Vérification des codes postaux, formules #N/A, Octroi de mer 8.5% et TVA..."
              : "ou cliquez pour sélectionner votre fichier .xlsx depuis votre poste. Analyse instantanée en mémoire sans stockage cloud."}
          </p>
        </div>

        {/* Indicateur de fichier analysé */}
        {audit && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-teal-400" />
            <span>{audit.fileName}</span>
            <span className="text-slate-500">({Math.round(audit.fileSize / 1024)} Ko)</span>
            <span className="text-slate-500">•</span>
            <span className={audit.isFullyValid ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {audit.scorePct}% conforme ({audit.validCount}/5 jalons)
            </span>
          </div>
        )}
      </div>

      {/* 3. Jauge de progression technique */}
      {audit && (
        <div className="p-4 rounded-xl slate-glass border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Conformité technique d&apos;atelier :
            </span>
            <span className={`font-bold ${audit.isFullyValid ? 'text-emerald-400' : 'text-amber-400'}`}>
              {audit.validCount} / {audit.milestonesCount} jalons validés ({audit.scorePct}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                audit.isFullyValid
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-amber-500 to-teal-400'
              }`}
              style={{ width: `${audit.scorePct}%` }}
            />
          </div>

          {audit.isFullyValid && (
            <div className="text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Les 5 critères techniques sont atteints ! Vous avez débloqué <strong>+{lab.points_auto_validation} points</strong> immédiats.</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
