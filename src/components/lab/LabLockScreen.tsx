'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lab } from '@/types/tip';
import { 
  ArrowLeft, 
  Lock, 
  KeyRound, 
  FlaskConical, 
  Trophy, 
  Clock, 
  Building2 
} from 'lucide-react';
import { TechnicianLoginScreen } from '@/components/tickets/TechnicianLoginScreen';

interface LabLockScreenProps {
  lab: Lab;
}

export const LabLockScreen: React.FC<LabLockScreenProps> = ({ lab }) => {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Bouton retour & Fil d'Ariane */}
      <div>
        <Link
          href="/lab"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au catalogue des ateliers</span>
        </Link>
      </div>

      {/* 2. En-tête de l'atelier verrouillé */}
      <div className="p-6 rounded-3xl slate-glass border border-white/10 space-y-3 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">
            {lab.domaine.toUpperCase()} • {lab.palier}
          </span>
          <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            +{lab.points_total} pts KLF
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {lab.duree_estimee}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white font-['Lexend']">
          {lab.titre}
        </h1>

        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          {lab.description}
        </p>
      </div>

      {/* 3. Sas de verrouillage avec saisie du code PIN */}
      <div className="p-6 rounded-3xl slate-glass border border-teal-500/30 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 mx-auto shadow-lg shadow-teal-950/40">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white font-['Lexend']">
          Établi technique verrouillé
        </h2>
        <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
          Pour manipuler cet atelier, lancer l&apos;auto-audit et valider vos points au classement, veuillez entrer votre identifiant et votre code PIN DSI.
        </p>
      </div>

      <TechnicianLoginScreen onSuccess={handleLoginSuccess} />
    </div>
  );
};
