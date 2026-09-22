'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileCheck2, 
  KeyRound, 
  Lock, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { TechnicianLoginScreen } from '@/components/tickets/TechnicianLoginScreen';

export const DPLockScreen: React.FC = () => {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. En-tête officiel du Dossier Professionnel */}
      <div className="p-6 sm:p-8 rounded-3xl slate-glass border border-white/10 space-y-3 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Titre Pro TIP (Ministère du Travail)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              CCP 1 • Support Utilisateur & Réseau
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-white/5 border border-white/5">
              Session C26031A • METAFORE Jarry
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Lexend'] tracking-tight">
            Dossier professionnel (DP) • Suivi & Fiches Cerfa A4
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Cet espace vous permet d&apos;auditer la conformité de vos 5 rubriques réglementaires et de générer vos fiches descriptives d&apos;activité technique Cerfa A4 (Gotenberg PDF). Pour garantir la stricte confidentialité de votre dossier d&apos;examen, veuillez vous identifier avec votre code PIN DSI.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>5 rubriques consécutives</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Strict Single-Page A4</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Validation formateur DSI</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sas de verrouillage avec saisie du code PIN */}
      <div className="p-6 rounded-3xl slate-glass border border-teal-500/30 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 mx-auto shadow-lg shadow-teal-950/40">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white font-['Lexend']">
          Prise de poste requise pour le DP
        </h2>
        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
          Saisissez votre identifiant agent et votre code PIN DSI pour accéder à votre grille de conformité personnelle et télécharger vos fiches nominatives.
        </p>
      </div>

      <TechnicianLoginScreen onSuccess={handleLoginSuccess} />
    </div>
  );
};
