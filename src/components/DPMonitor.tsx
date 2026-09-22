'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { DPSuivi, Apprenant, DPStatus } from '@/types/tip';
import { 
  FileCheck, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Send,
  Lock,
  KeyRound,
  Users,
  Shield,
  Loader2,
  Check,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateDPSuiviAction } from '@/app/actions';
import { TechnicianLoginScreen } from '@/components/tickets/TechnicianLoginScreen';

interface DPMonitorProps {
  initialDPSuivi?: DPSuivi;
  apprenantName?: string;
  apprenantId?: string;
  isFormateur?: boolean;
  adminStudents?: Apprenant[];
  allDPSuivi?: DPSuivi[];
  currentStudent?: Apprenant | null;
  isUnauthenticated?: boolean;
}

export const DPMonitor: React.FC<DPMonitorProps> = ({ 
  initialDPSuivi, 
  apprenantName = 'Jordan MARIE-JOSEPH',
  apprenantId = '00000000-0000-0000-0000-000000000001',
  isFormateur = false,
  adminStudents = [],
  allDPSuivi = [],
  currentStudent = null,
  isUnauthenticated = false,
}) => {
  const [isPending, startTransition] = useTransition();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gestion du stagiaire sélectionné en mode formateur
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (apprenantId) return apprenantId;
    if (adminStudents.length > 0) return adminStudents[0].id;
    return '00000000-0000-0000-0000-000000000001';
  });

  const activeStudent = isFormateur
    ? (adminStudents.find((s) => s.id === selectedStudentId) || currentStudent)
    : currentStudent;

  const currentDisplayName = isFormateur && activeStudent
    ? `${activeStudent.prenom} ${activeStudent.nom}`
    : apprenantName;

  const effectiveApprenantId = isFormateur && activeStudent
    ? activeStudent.id
    : apprenantId;

  // État du suivi DP
  const [dp, setDp] = useState<DPSuivi>(() => {
    if (initialDPSuivi) return initialDPSuivi;
    return {
      apprenant_id: effectiveApprenantId,
      rubrique_1: true,
      rubrique_2: true,
      rubrique_3: true,
      rubrique_4: true,
      rubrique_5: false,
      statut_dp: 'en_revue',
    };
  });

  // Synchronisation lors d'un changement d'élève par le formateur
  useEffect(() => {
    if (isFormateur && allDPSuivi.length > 0) {
      const found = allDPSuivi.find((d) => d.apprenant_id === selectedStudentId);
      if (found) {
        setDp(found);
      } else {
        setDp({
          apprenant_id: selectedStudentId,
          rubrique_1: false,
          rubrique_2: false,
          rubrique_3: false,
          rubrique_4: false,
          rubrique_5: false,
          statut_dp: 'brouillon',
        });
      }
    }
  }, [selectedStudentId, isFormateur, allDPSuivi]);

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

  const persistDP = (updated: DPSuivi) => {
    // Si non connecté (mode démo public), on met à jour uniquement l'état local
    if (isUnauthenticated) {
      setDp(updated);
      setFeedbackMsg({
        type: 'success',
        text: 'Modification locale (Mode Démonstration). Connectez-vous pour sauvegarder votre fiche.',
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    startTransition(async () => {
      const res = await updateDPSuiviAction({
        apprenantId: effectiveApprenantId,
        rubrique_1: updated.rubrique_1,
        rubrique_2: updated.rubrique_2,
        rubrique_3: updated.rubrique_3,
        rubrique_4: updated.rubrique_4,
        rubrique_5: updated.rubrique_5,
        statut_dp: updated.statut_dp as any,
      });

      if (res.success) {
        setDp(updated);
        setFeedbackMsg({ type: 'success', text: 'Progression sauvegardée en base Supabase.' });
        setTimeout(() => setFeedbackMsg(null), 2500);
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Erreur de synchronisation' });
      }
    });
  };

  const handleToggle = (key: keyof DPSuivi) => {
    const updated = {
      ...dp,
      [key]: !dp[key],
    };
    
    // Calcul de validation automatique du statut si en mode apprenant
    if (!isFormateur) {
      const newCount = [
        updated.rubrique_1,
        updated.rubrique_2,
        updated.rubrique_3,
        updated.rubrique_4,
        updated.rubrique_5,
      ].filter(Boolean).length;

      if (newCount === 5) {
        updated.statut_dp = 'en_revue';
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10B981', '#00B4D8', '#F59E0B'],
        });
      } else if (newCount >= 3) {
        updated.statut_dp = 'en_revue';
      } else {
        updated.statut_dp = 'brouillon';
      }
    }

    persistDP(updated);
  };

  const handleTransmettre = () => {
    if (isUnauthenticated) {
      setShowLoginModal(true);
      return;
    }

    const updated: DPSuivi = {
      ...dp,
      statut_dp: 'en_revue',
    };

    persistDP(updated);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#00B4D8', '#F59E0B'],
    });
    setFeedbackMsg({
      type: 'success',
      text: 'Fiche d\'Exemple DP transmise pour relecture officielle à David JACQUA !',
    });
  };

  const handleFormateurStatutChange = (newStatut: DPStatus) => {
    const updated: DPSuivi = {
      ...dp,
      statut_dp: newStatut,
    };
    persistDP(updated);
    if (newStatut === 'valide_jury') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10B981', '#F59E0B', '#6366F1'],
      });
    }
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

      {/* BANDEAU FORMATEUR DSI : Contrôle & Supervision Multi-Apprenants */}
      {isFormateur && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <div>
              <span className="font-semibold font-mono text-amber-300 text-xs sm:text-sm">
                🛡️ Cockpit de supervision formateur DSI (David JACQUA)
              </span>
              <p className="text-[11px] text-amber-400/80">
                Audit de conformité Cerfa et validation finale des 5 rubriques CCP 1 pour la promotion.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Stagiaire :</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-900 border border-amber-500/40 text-amber-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
              >
                {adminStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.prenom} {st.nom} ({st.equipe})
                  </option>
                ))}
              </select>
            </label>

            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] transition-colors"
            >
              Cockpit admin
            </Link>
          </div>
        </div>
      )}

      {/* BANDEAU VISITEUR NON CONNECTÉ : Invitation Prise de Poste */}
      {isUnauthenticated && !showLoginModal && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold font-mono text-cyan-300 text-xs sm:text-sm">
                Exemple de démonstration • Fiche Jordan MARIE-JOSEPH
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Vous visualisez un exemple type de fiche validée. Pour suivre et sauvegarder votre propre Dossier Professionnel, prenez votre poste avec votre code PIN DSI.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition-all active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Prendre mon poste</span>
          </button>
        </div>
      )}

      {/* MODAL DE PRISE DE POSTE TECHNICIEN */}
      {showLoginModal && (
        <div className="p-6 rounded-2xl slate-glass border border-cyan-500/40 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white font-['Lexend'] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Prise de poste technicien KLF
            </h3>
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="text-xs text-slate-400 hover:text-white font-mono px-2 py-1 rounded bg-white/5"
            >
              Fermer (Continuer en démo)
            </button>
          </div>
          <TechnicianLoginScreen />
        </div>
      )}

      {/* FEEDBACK DE PERSISTANCE */}
      {feedbackMsg && (
        <div className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 transition-all ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{feedbackMsg.text}</span>
          </div>
        </div>
      )}
      
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
              Audit du dossier professionnel (DP) • {currentDisplayName}
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

            {/* Actions Formateur pour validation officielle */}
            {isFormateur && (
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => handleFormateurStatutChange('valide_jury')}
                  disabled={isPending}
                  className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono transition-colors"
                >
                  Valider pour jury
                </button>
                <button
                  type="button"
                  onClick={() => handleFormateurStatutChange('en_revue')}
                  disabled={isPending}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono transition-colors"
                >
                  En revue
                </button>
                <button
                  type="button"
                  onClick={() => handleFormateurStatutChange('brouillon')}
                  disabled={isPending}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-[11px] font-mono transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Jauge de conformité REAC */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Conformité des 5 rubriques Ministère du Travail
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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Grille de vérification des 5 rubriques consécutives
          </h2>
          {isPending && (
            <span className="text-xs font-mono text-teal-400 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Enregistrement...
            </span>
          )}
        </div>

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
            Validation finale du titre professionnel TIP :
          </strong>
          Une fois les 5 rubriques validées, le dossier est exportable pour relecture par le formateur référent (David JACQUA)
          avant l&apos;oral blanc de 15 minutes devant le simulateur de jury.
        </div>

        <button
          type="button"
          onClick={handleTransmettre}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all active:scale-95 shrink-0 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Transmettre au formateur</span>
        </button>
      </div>

    </div>
  );
};
