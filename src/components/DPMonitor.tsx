'use client';

import React, { useState } from 'react';
import { DPSuivi } from '@/types/tip';
import { 
  FileCheck, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DPMonitorProps {
  initialDPSuivi?: DPSuivi;
  apprenantName?: string;
}

export const DPMonitor: React.FC<DPMonitorProps> = ({ 
  initialDPSuivi, 
  apprenantName = 'Jordan MARIE-JOSEPH' 
}) => {
  const [dp, setDp] = useState<DPSuivi>(
    initialDPSuivi || {
      apprenant_id: '00000000-0000-0000-0000-000000000001',
      rubrique_1: true,
      rubrique_2: true,
      rubrique_3: true,
      rubrique_4: true,
      rubrique_5: false,
      statut_dp: 'en_revue',
    }
  );

  const rubriques = [
    {
      key: 'rubrique_1' as const,
      num: 1,
      title: '1. Décrivez les tâches ou opérations effectuées, et dans quelles conditions',
      desc: 'Récit d\'action concret à la première personne (« J\'ai déployé... j\'ai résolu... »), étapes pas-à-pas et diagnostic méthodique.',
      tips: 'Éviter le « On » impersonnel. Exposer la méthode d\'investigation face au dysfonctionnement.',
    },
    {
      key: 'rubrique_2' as const,
      num: 2,
      title: '2. Précisez les moyens utilisés',
      desc: 'Inventaire précis des matériels, outils logiciels, consoles de gestion (GLPI, M365, Windows 11 Pro, tablettes Zebra, CLI PowerShell).',
      tips: 'Mentionner la version des logiciels et les normes techniques appliquées.',
    },
    {
      key: 'rubrique_3' as const,
      num: 3,
      title: '3. Avec qui avez-vous travaillé ?',
      desc: 'Rôle du tuteur, interlocuteurs KLF accompagnés (Corinne Facturation, Marc Verdier DSI, Sébastien Quai).',
      tips: 'Montrer la dimension relationnelle, l\'écoute active et la pédagogie avec l\'usager.',
    },
    {
      key: 'rubrique_4' as const,
      num: 4,
      title: '4. Contexte',
      desc: 'Entreprise d\'accueil (Karukera Logistique & Fret), localisation (Jarry, Guadeloupe), et dates réelles d\'exercice.',
      tips: 'Les 5 rubriques doivent obligatoirement être consécutives sur la même fiche.',
    },
    {
      key: 'rubrique_5' as const,
      num: 5,
      title: '5. Informations complémentaires (facultatif mais valorisé)',
      desc: 'Analyse réflexive, enseignements tirés, sensibilisation RGPD usagers et règles de sécurité informatique appliquées.',
      tips: 'Le point fort pour décrocher les félicitations du jury du Ministère du Travail.',
    },
  ];

  const validCount = [
    dp.rubrique_1,
    dp.rubrique_2,
    dp.rubrique_3,
    dp.rubrique_4,
    dp.rubrique_5,
  ].filter(Boolean).length;

  const progress = Math.round((validCount / 5) * 100);

  const handleToggle = (key: keyof DPSuivi) => {
    const updated = {
      ...dp,
      [key]: !dp[key],
    };
    
    // Calcul de validation
    const newCount = [
      updated.rubrique_1,
      updated.rubrique_2,
      updated.rubrique_3,
      updated.rubrique_4,
      updated.rubrique_5,
    ].filter(Boolean).length;

    if (newCount === 5) {
      updated.statut_dp = 'valide_jury';
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#00B4D8', '#F59E0B'],
      });
    } else if (newCount >= 3) {
      updated.statut_dp = 'en_revue';
    } else {
      updated.statut_dp = 'brouillon';
    }

    setDp(updated);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valide_jury':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            CONFORME POUR LE JURY
          </span>
        );
      case 'en_revue':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            EN COURS DE REVUE FORMATEUR
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30">
            BROUILLON EN ÉCRITURE
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* En-tête REAC & Conformité Cerfa */}
      <div className="p-6 rounded-2xl slate-glass relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Titre Pro TIP (Ministère du Travail)
              </span>
              <span className="text-xs text-slate-400 font-mono">CCP 1 • Support Utilisateur</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Lexend']">
              Audit Dossier Professionnel (DP) • {apprenantName}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Contrôle de conformité de la <strong>Fiche Exemple de Pratique Professionnelle</strong>.
              Pour être recevable par le Jury, les 5 rubriques officielles Cerfa doivent être consécutives et complètes.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {getStatusBadge(dp.statut_dp)}
            <div className="text-xs font-mono text-slate-400">
              Session C26031A • METAFORE
            </div>
          </div>
        </div>

        {/* Jauge de conformité REAC */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              CONFORMITÉ DES 5 RUBRIQUES MINISTÈRE DU TRAVAIL
            </span>
            <span className={`font-bold ${progress === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {validCount}/5 Validées ({progress}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progress === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-amber-500 to-teal-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Interactive des 5 Rubriques Officielles */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          Grille de Vérification des 5 Rubriques Consécutives
        </h2>

        <div className="space-y-3">
          {rubriques.map((rub) => {
            const isChecked = !!dp[rub.key];

            return (
              <div
                key={rub.key}
                onClick={() => handleToggle(rub.key)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                  isChecked
                    ? 'slate-glass border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/[0.03]'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-label={`Valider ${rub.title}`}
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isChecked
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'border border-white/20 bg-white/5 hover:border-teal-400 text-transparent'
                    }`}
                  >
                    {isChecked ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className={`text-sm font-semibold font-['Lexend'] ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                        {rub.title}
                      </h3>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        isChecked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-500 border border-white/5'
                      }`}>
                        {isChecked ? 'Validée' : 'À rédiger'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {rub.desc}
                    </p>

                    <div className="mt-2 text-[11px] text-teal-400/80 font-mono flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-teal-400 shrink-0" />
                      <span>Conseil Jury : {rub.tips}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synthèse Pédagogique & Remise au Formateur */}
      <div className="p-5 rounded-2xl slate-glass flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white font-['Lexend'] block mb-1">
            Validation Finale du Titre Professionnel TIP :
          </strong>
          Une fois les 5 rubriques validées, le dossier est exportable pour relecture par le formateur référent (David JACQUA)
          avant l&apos;oral blanc de 15 minutes devant le simulateur de jury.
        </div>

        <button
          type="button"
          onClick={() => {
            alert('Votre Fiche d\'Exemple DP a été soumise pour relecture au formateur référent !');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Transmettre au Formateur</span>
        </button>
      </div>

    </div>
  );
};
