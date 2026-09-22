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
  Loader2, 
  Check, 
  RotateCcw,
  Network,
  ShieldAlert,
  Tablet,
  Server,
  Printer,
  Download,
  FileText,
  ExternalLink,
  ChevronRight,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateDPSuiviAction } from '@/app/actions';
import { TechnicianLoginScreen } from '@/components/tickets/TechnicianLoginScreen';
import { getDpDetailsForTicket } from '@/lib/templates/ticketDpPdfTemplate';

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

const TECHNICAL_INTERVENTIONS = [
  {
    ticketId: 'TCK-105',
    category: 'Réseau IPv4 & Routage',
    badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    icon: Network,
    shortTitle: 'Plan d\'adressage IP statique & APIPA (Zebra)',
    equipement: 'Imprimante Zebra ZT410 • Switch manageable • Quai n°3',
    ccp: 'CCP 1 • Support Utilisateur & Réseau',
    summary: 'Rétablissement de la connectivité réseau de l\'imprimante thermique suite à une coupure EDF. Diagnostic de l\'adresse APIPA 169.254.x.x et attribution d\'un bail statique permanent.',
  },
  {
    ticketId: 'TCK-104',
    category: 'Cybersécurité & DNS',
    badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    icon: ShieldAlert,
    shortTitle: 'Sécurisation DNS/SMTP & Anti-phishing',
    equipement: 'Pare-feu UTM • En-têtes RFC 5322 • Microsoft 365 Defender',
    ccp: 'CCP 1 • Sécurité & Posture DSI',
    summary: 'Neutralisation d\'une tentative d\'escroquerie au faux virement maritime (24 500 €). Analyse forensique des en-têtes MIME, validation DNS (SPF, DKIM, DMARC) et blocage IP.',
  },
  {
    ticketId: 'TCK-102',
    category: 'Parc mobile & Wi-Fi',
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    icon: Tablet,
    shortTitle: 'Terminaux durcis Zebra & Wi-Fi industriel',
    equipement: 'Tablettes Zebra TC57 Android • VLAN 30 Quai • MDM',
    ccp: 'CCP 1 • Exploitation & Parc Mobile',
    summary: 'Déploiement de 8 terminaux durcis, isolation sur VLAN 30 Quai avec roaming 802.11r, enrôlement MDM et conception du guide visuel de maintien en condition opérationnelle (MCO).',
  },
  {
    ticketId: 'TCK-101',
    category: 'Système & Stockage',
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    icon: Server,
    shortTitle: 'Partage réseau SMBv3, NTFS & Sauvegardes NAS',
    equipement: 'NAS Synology RAID 5 • ACL NTFS • Active Directory',
    ccp: 'CCP 1 • Données & Continuité de Service',
    summary: 'Migration des classeurs de manifestes maritimes sur NAS centralisé, sécurisation des droits NTFS (groupes AD) et automatisation de sauvegardes journalières.',
  },
  {
    ticketId: 'TCK-103',
    category: 'Périphériques & AD',
    badgeClass: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
    icon: Printer,
    shortTitle: 'Copieur multifonction, Serveur d\'impression & GPO',
    equipement: 'Pilote PCL6 • Windows Server 2022 • Code PIN',
    ccp: 'CCP 1 • Déploiement & Impression Sécurisée',
    summary: 'Mise en service d\'un copieur multifonction départemental, déploiement automatisé par GPO Active Directory et sécurisation par code PIN pour les flux RH confidentiels.',
  },
];

export const DPMonitor: React.FC<DPMonitorProps> = ({ 
  initialDPSuivi, 
  apprenantName = 'Jordan MARIE-JOSEPH',
  apprenantId = '8d100934-5303-4e1e-8ecf-8372bc032c66',
  isFormateur = false,
  adminStudents = [],
  allDPSuivi = [],
  currentStudent = null,
  isUnauthenticated = false,
}) => {
  const [isPending, startTransition] = useTransition();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Onglet actif : 'generator' (Fiches techniques Gotenberg) ou 'checklist' (Vérification des 5 rubriques)
  const [activeTab, setActiveTab] = useState<'generator' | 'checklist'>('generator');

  // Ticket technique sélectionné pour le générateur Cerfa A4
  const [selectedTicketId, setSelectedTicketId] = useState<string>('TCK-105');

  // Gestion du stagiaire sélectionné en mode formateur
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (apprenantId) return apprenantId;
    if (adminStudents.length > 0) return adminStudents[0].id;
    return '8d100934-5303-4e1e-8ecf-8372bc032c66';
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

  // État du suivi DP (Checklist)
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
      desc: 'Récit d\'action concret à la première personne (« J\'ai diagnostiqué... j\'ai configuré... »), étapes pas-à-pas et diagnostic méthodique par couches.',
      tips: 'Éviter le « On » impersonnel. Exposer la méthode d\'investigation technique face au dysfonctionnement.',
    },
    {
      key: 'rubrique_2' as const,
      num: 2,
      title: '2. Précisez les moyens utilisés',
      desc: 'Inventaire précis des matériels, outils logiciels, switchs manageables, consoles de gestion (DHCP, Active Directory, UTM, MDM, CLI PowerShell/Ping).',
      tips: 'Mentionner la version des protocoles (SMBv3, IPv4, RFC 5322, 802.11r) et les équipements réels.',
    },
    {
      key: 'rubrique_3' as const,
      num: 3,
      title: '3. Avec qui avez-vous travaillé ?',
      desc: 'Rôle du tuteur, interlocuteurs KLF accompagnés (Sébastien Quai, Corinne Facturation, Marc Verdier DSI, Élodie RH).',
      tips: 'Montrer la dimension relationnelle, l\'écoute active et la vulgarisation technique auprès de l\'usager.',
    },
    {
      key: 'rubrique_4' as const,
      num: 4,
      title: '4. Contexte',
      desc: 'Entreprise d\'accueil (Karukera Logistique & Fret), localisation (Jarry, Guadeloupe), et dates réelles d\'exercice.',
      tips: 'Les 5 rubriques doivent obligatoirement être consécutives sur la même fiche A4.',
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
    if (isUnauthenticated) {
      setDp(updated);
      setFeedbackMsg({
        type: 'success',
        text: 'Modification locale (Mode Démonstration). Prenez votre poste pour sauvegarder votre fiche.',
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

  // Récupération des détails de l'intervention technique sélectionnée
  const currentIntervention = TECHNICAL_INTERVENTIONS.find((i) => i.ticketId === selectedTicketId) || TECHNICAL_INTERVENTIONS[0];
  const dpDetails = getDpDetailsForTicket(selectedTicketId);

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
                Audit de conformité Cerfa et validation finale des 5 fiches techniques CCP 1 pour la promotion.
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
                Vous visualisez un exemple type de fiche technique validée. Pour suivre et exporter votre propre Dossier Professionnel nominatif, prenez votre poste avec votre code PIN DSI.
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
              <span className="text-xs text-slate-400 font-mono">CCP 1 • Support Utilisateur & Réseau</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Lexend']">
              Dossier professionnel (DP) • {currentDisplayName}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Générateur officiel des <strong>Fiches Descriptives d&apos;Exemples de Pratique Professionnelle</strong>.
              Les interventions proposées sont 100% orientées techniques (Réseaux, Maintenance, Matériel, Cybersécurité) conformément aux exigences du Jury du Titre Professionnel.
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

        {/* SWITCHER DES DEUX MODES : GÉNÉRATEUR A4 GOTENBERG vs AUDIT RUBRIQUES */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Générateur Cerfa A4 (Gotenberg)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'checklist'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Grille de conformité ({validCount}/5)</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Service Gotenberg actif (Single-Page A4 Portrait)</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VUE 1 : GÉNÉRATEUR DE FICHES D'ACTIVITÉ CERFA A4 GOTENBERG     */}
      {/* ============================================================== */}
      {activeTab === 'generator' && (
        <div className="space-y-6">

          {/* SÉLECTEUR DES 5 INTERVENTIONS TECHNIQUES REAC TIP */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Sélectionnez une intervention technique pour votre fiche DP
              </h2>
              <span className="text-xs font-mono text-slate-400">
                5 fiches techniques calibrées REAC TIP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {TECHNICAL_INTERVENTIONS.map((item) => {
                const isSelected = selectedTicketId === item.ticketId;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.ticketId}
                    type="button"
                    onClick={() => setSelectedTicketId(item.ticketId)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'slate-glass border-cyan-400 ring-1 ring-cyan-400/50 bg-cyan-500/[0.08] shadow-lg shadow-cyan-500/10'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${item.badgeClass}`}>
                          {item.ticketId}
                        </span>
                        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      </div>

                      <h3 className={`text-xs font-bold font-['Lexend'] line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {item.shortTitle}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-400">
                      {item.category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARTOUCHE DÉTAILLÉ DE L'INTERVENTION TECHNIQUE SÉLECTIONNÉE */}
          <div className="p-6 rounded-2xl slate-glass border border-cyan-500/30 space-y-6 relative overflow-hidden">
            
            {/* Header du ticket technique */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${currentIntervention.badgeClass}`}>
                    {currentIntervention.ticketId} • {currentIntervention.category.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentIntervention.ccp}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-['Lexend']">
                  « {dpDetails.titreDp} »
                </h3>
                <p className="text-xs text-slate-300">
                  Équipements & contexte : <span className="text-cyan-300 font-mono">{currentIntervention.equipement}</span>
                </p>
              </div>

              {/* BOUTON D'ACTION PRINCIPAL : EXPORT GOTENBERG PDF EN 1-CLIC */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <a
                  href={`/api/tickets/export-dp-pdf?ticketId=${selectedTicketId}&studentId=${effectiveApprenantId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger ma fiche Cerfa A4 (PDF Gotenberg)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>

            {/* APERÇU STRUCTURÉ DES 5 RUBRIQUES MINISTÈRE DU TRAVAIL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Rubrique 1 & 2 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">1</span>
                    <span>Intitulé & Compétences REAC mobilisées</span>
                  </div>
                  <p className="text-xs text-slate-200 font-semibold">
                    {dpDetails.titreDp}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Diagnostic d&apos;incident technique, rétablissement de connectivité, isolation réseau et traçabilité d&apos;intervention.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">2</span>
                    <span>Contexte professionnel & Environnement d&apos;entreprise</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dpDetails.contexteDp}
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-cyan-300/90 bg-cyan-500/10 p-2 rounded border border-cyan-500/20">
                    <strong>Moyens & Outils :</strong> {dpDetails.outilsMobilises}
                  </div>
                </div>
              </div>

              {/* Rubrique 3 & 4 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">3</span>
                    <span>Démarche technique appliquée (Investigation & Rétablissement)</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 bg-black/40 p-3 rounded border border-white/10 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                    {currentIntervention.summary}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">4</span>
                    <span>Communication usager & Posture de service ITIL</span>
                  </div>
                  <p className="text-xs text-slate-300 italic bg-white/5 p-2.5 rounded border-l-2 border-cyan-400">
                    Accompagnement des utilisateurs KLF (Jarry), vulgarisation technique sans jargon, compte-rendu d&apos;intervention et validation conjointe du rétablissement.
                  </p>
                </div>
              </div>

            </div>

            {/* Rubrique 5 : Analyse réflexive valorisée */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">5</span>
                <span>Bilan personnel & Analyse réflexive pour l&apos;oral d&apos;examen (Rubrique 5 Cerfa)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 block mb-1">
                    ✓ Réussite marquante
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dpDetails.reussiteReflexive}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <span className="text-[11px] font-mono font-bold text-amber-400 block mb-1">
                    ⚠ Difficultés & Contournement
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dpDetails.difficulteReflexive}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <span className="text-[11px] font-mono font-bold text-blue-400 block mb-1">
                    💡 Enseignement professionnel
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dpDetails.enseignementReflexive}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer d'information Cerfa */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-[11px] font-mono text-slate-400 border-t border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Norme : Cerfa Dossier Professionnel (Ministère du Travail • RNCP 37674)</span>
              </div>
              <div>
                Rendu : <strong className="text-slate-200">Strict Single-Page A4 (Zéro débordement)</strong>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* VUE 2 : GRILLE DE CONFORMITÉ DES 5 RUBRIQUES OFFICIELLES       */}
      {/* ============================================================== */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          
          {/* Jauge de conformité REAC */}
          <div className="p-5 rounded-2xl slate-glass">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Conformité des 5 rubriques consécutives
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
      )}

    </div>
  );
};
