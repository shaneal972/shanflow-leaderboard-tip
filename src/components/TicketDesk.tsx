'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { TicketKLF, Apprenant, TicketResolution, TicketResolutionCategory, TicketUrgency } from '@/types/tip';
import { 
  Ticket, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Calculator, 
  BookOpen, 
  Mail, 
  Send,
  Sparkles,
  Network,
  AlertCircle,
  ShieldAlert,
  Printer,
  FileText,
  LogOut,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitTicketResolutionAction } from '@/app/admin/actions';
import { TechnicianLoginScreen } from '@/components/tickets/TechnicianLoginScreen';
import { logoutTechnicianAction, getTechnicianResolutionsAction } from '@/app/tickets/actions';

interface TicketDeskProps {
  initialTickets: TicketKLF[];
  currentStudent?: Apprenant | null;
  initialResolutions?: TicketResolution[];
  isFormateur?: boolean;
  adminStudents?: Apprenant[];
}

export const TicketDesk: React.FC<TicketDeskProps> = ({ 
  initialTickets, 
  currentStudent = null,
  initialResolutions = [],
  isFormateur = false,
  adminStudents = [],
}) => {
  const [tickets] = useState<TicketKLF[]>(initialTickets);
  const [student, setStudent] = useState<Apprenant | null>(currentStudent);
  const [resolutions, setResolutions] = useState<TicketResolution[]>(initialResolutions);
  const [activeTicket, setActiveTicket] = useState<TicketKLF | null>(null);
  
  // Apprenant actif ou apprenant supervisé
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (currentStudent) return currentStudent.id;
    if (isFormateur && adminStudents.length > 0) return adminStudents[0].id;
    return '';
  });

  useEffect(() => {
    if (currentStudent) {
      setStudent(currentStudent);
      setSelectedStudentId(currentStudent.id);
    }
  }, [currentStudent]);

  useEffect(() => {
    setResolutions(initialResolutions);
  }, [initialResolutions]);

  const activeStudent = isFormateur
    ? (adminStudents.find((s) => s.id === selectedStudentId) || student)
    : student;

  const handleFormateurStudentChange = (id: string) => {
    setSelectedStudentId(id);
    localStorage.setItem('klf_admin_inspect_student_id', id);
  };

  const handleLoginSuccess = async (newStudent: {
    id: string;
    prenom: string;
    nom: string;
    points_total: number;
    palier_actuel: string;
    equipe: string;
  }) => {
    const fullStudent: Apprenant = {
      id: newStudent.id,
      prenom: newStudent.prenom,
      nom: newStudent.nom,
      email: '',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${newStudent.prenom.toLowerCase()}`,
      points_total: newStudent.points_total,
      palier_actuel: newStudent.palier_actuel as any,
      equipe: newStudent.equipe,
      is_admin: false,
      consentement_rgpd: true,
    };
    setStudent(fullStudent);
    setSelectedStudentId(newStudent.id);

    // Chargement immédiat des résolutions de l'apprenant connecté
    const res = await getTechnicianResolutionsAction(newStudent.id);
    if (res.success && res.resolutions) {
      setResolutions(res.resolutions);
    }
  };

  const handleLogout = async () => {
    await logoutTechnicianAction();
    localStorage.removeItem('klf_active_student_id');
    setStudent(null);
    setSelectedStudentId('');
    setResolutions([]);
    setActiveTicket(null);
  };

  // Résolution pour le ticket actif et l'apprenant sélectionné
  const currentResolution = activeTicket && activeStudent
    ? resolutions.find((r) => r.ticket_id === activeTicket.id && r.apprenant_id === activeStudent.id)
    : null;

  // Champs du formulaire ITIL en 3 étapes
  const [categorie, setCategorie] = useState<TicketResolutionCategory>('applicatif');
  const [urgence, setUrgence] = useState<TicketUrgency>('P2');
  const [demarche, setDemarche] = useState<string>('');
  const [messageUsager, setMessageUsager] = useState<string>('');

  // Initialisation lors de l'ouverture du ticket
  useEffect(() => {
    if (activeTicket) {
      if (currentResolution) {
        setCategorie(currentResolution.diagnostic_categorie);
        setUrgence(currentResolution.diagnostic_urgence);
        setDemarche(currentResolution.demarche_technique);
        setMessageUsager(currentResolution.message_usager);
      } else {
        // Pré-remplissage contextuel
        if (activeTicket.id === 'TCK-101') setCategorie('applicatif');
        else if (activeTicket.id === 'TCK-102') setCategorie('materiel');
        else if (activeTicket.id === 'TCK-103') setCategorie('applicatif');
        else if (activeTicket.id === 'TCK-104') setCategorie('systeme');
        else if (activeTicket.id === 'TCK-105') setCategorie('reseau');
        else setCategorie('systeme');

        setUrgence(activeTicket.urgence);
        setDemarche('');
        setMessageUsager('');
      }
    }
  }, [activeTicket, currentResolution]);

  // Calculateur simulateur pour Ticket #101 (Corinne Facturation)
  const [montantHT, setMontantHT] = useState<number>(1000);
  const [tauxOctroi, setTauxOctroi] = useState<number>(8.5);
  const [tauxTVA, setTauxTVA] = useState<number>(8.5);

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getUrgencyBadge = (urg: string) => {
    switch (urg) {
      case 'P1':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            P1 CRITIQUE
          </span>
        );
      case 'P2':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" />
            P2 NORMAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30">
            P3 BASSE
          </span>
        );
    }
  };

  const getResolutionStatusBadge = (res?: TicketResolution | null) => {
    if (!res) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-white/10">
          À traiter
        </span>
      );
    }
    if (res.statut === 'valide') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Validé (+{res.points_attribues} pts)
        </span>
      );
    }
    if (res.statut === 'a_corriger') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          À corriger (Feedback formateur)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
        <Clock className="w-3 h-3 text-cyan-400" />
        En attente validation formateur
      </span>
    );
  };

  const getNetworkDPSuggestion = (ticketId: string) => {
    switch (ticketId) {
      case 'TCK-101':
        return {
          titre: 'Partage réseau sécurisé & politique de sauvegarde NAS (CCP 1)',
          description: "Pour votre DP, ne décrivez pas seulement la formule Excel, mais la sécurisation du classeur sur le réseau : création d'un partage SMB sur le NAS local, gestion des droits NTFS par groupes d'utilisateurs (Compta vs Commercial) et mise en place d'une tâche de sauvegarde automatique sur le serveur de stockage."
        };
      case 'TCK-102':
        return {
          titre: 'Déploiement et segmentation Wi-Fi industriel (CCP 1)',
          description: "Valorisez devant le jury la couverture sans-fil de l'entrepôt : configuration d'un SSID dédié pour les tablettes Zebra, segmentation réseau via un VLAN Quai isolé, plage DHCP réservée et analyse du signal radio (roaming entre bornes AP pour éviter les coupures)."
        };
      case 'TCK-103':
        return {
          titre: 'Mise en service d\'une imprimante réseau départementale (CCP 1)',
          description: "Raccrochez ce publipostage à une épreuve d'infrastructure : raccordement RJ45 d'une imprimante multifonction, attribution d'une IP statique hors DHCP, configuration du pilote sur le serveur d'impression et déploiement automatisé par stratégie de groupe (GPO)."
        };
      case 'TCK-104':
        return {
          titre: 'Sécurisation des flux de messagerie & filtrage DNS/SMTP (CCP 1)',
          description: "Pour valoriser la cyber en CCP 1 : diagnostic des protocoles de messagerie (relais SMTP, MX), inspection des enregistrements DNS (TXT SPF, clé publique DKIM, politique DMARC), analyse des en-têtes MIME bruts et paramétrage du filtrage antispam sur la passerelle de sécurité (UTM)."
        };
      case 'TCK-105':
        return {
          titre: "Plan d'adressage IP statique & diagnostic de connectivité réseau (CCP 1)",
          description: "L'activité réseau par excellence pour votre DP : analyse du plan d'adressage IP local, exclusion de plage DHCP et réservation par adresse MAC, configuration statique de l'imprimante (IP, masque /24, passerelle par défaut), tests de connectivité (Ping, résolution ARP) et validation du port sur le switch (VLAN Quai)."
        };
      default:
        return {
          titre: 'Diagnostic de connectivité et configuration réseau (CCP 1)',
          description: "Mettez en avant le plan d'adressage IP statique, le paramétrage de la passerelle par défaut et les tests de connectivité (Ping, Traceroute, DNS) pour prouver au jury votre maîtrise des flux réseau."
        };
    }
  };

  const handleSubmitResolution = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveStudentId = activeStudent ? activeStudent.id : selectedStudentId;
    if (!activeTicket || !effectiveStudentId) return;

    setErrorMessage(null);

    startTransition(async () => {
      const res = await submitTicketResolutionAction({
        ticketId: activeTicket.id,
        studentId: effectiveStudentId,
        diagnosticCategorie: categorie,
        diagnosticUrgence: urgence,
        demarcheTechnique: demarche,
        messageUsager: messageUsager,
      });

      if (res.success && res.resolution) {
        setResolutions((prev) => {
          const filtered = prev.filter(
            (r) => !(r.ticket_id === activeTicket.id && r.apprenant_id === effectiveStudentId)
          );
          return [res.resolution, ...filtered];
        });

        setSuccessMessage('Intervention soumise avec succès ! En attente de validation par David JACQUA.');
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#00B4D8', '#F59E0B', '#10B981'],
        });

        setTimeout(() => {
          setActiveTicket(null);
          setSuccessMessage(null);
        }, 2200);
      } else {
        setErrorMessage(res.error || 'Erreur lors de la soumission.');
      }
    });
  };

  // Calculs fiscaux Antilles pour Corinne
  const montantOctroi = (montantHT * tauxOctroi) / 100;
  const montantTVA = ((montantHT + montantOctroi) * tauxTVA) / 100;
  const totalTTC = montantHT + montantOctroi + montantTVA;

  // Si aucun apprenant n'est identifié et qu'on n'est pas formateur -> Affichage du sas PIN
  if (!activeStudent && !isFormateur) {
    return (
      <div className="w-full space-y-6">
        <div className="p-6 rounded-2xl slate-glass relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Simulation helpdesk DSI
            </span>
            <span className="text-xs text-slate-400 font-mono">GLPI / KLF Support Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Lexend'] mt-1">
            KLF ticket desk • Incidents usagers
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Résolvez les incidents réels des collaborateurs de Karukera Logistique & Fret (Jarry).
            Chaque ticket résolu et validé par le formateur crédite des points sur le leaderboard et alimente votre réflexion pour le <strong>Dossier Professionnel (CCP 1 - Support & Réseau)</strong>.
          </p>
        </div>

        <TechnicianLoginScreen onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      
      {/* En-tête du Ticket Desk avec profil individuel sécurisé */}
      <div className="p-6 rounded-2xl slate-glass relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Simulation helpdesk DSI
              </span>
              <span className="text-xs text-slate-400 font-mono">GLPI / KLF Support Desk</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Lexend'] mt-1">
              KLF ticket desk • Incidents usagers
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Résolvez les incidents réels des collaborateurs de Karukera Logistique & Fret (Jarry).
              Chaque ticket résolu et validé par le formateur crédite des points sur le leaderboard et alimente votre réflexion pour le <strong>Dossier Professionnel (CCP 1 - Support & Réseau)</strong>.
            </p>
          </div>

          {/* Profil technicien actif / Superviseur Formateur */}
          {isFormateur ? (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-amber-300 font-mono uppercase font-bold">
                  🛡️ Supervision formateur (David)
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Inspecter un technicien :
                </div>
              </div>

              <select
                value={selectedStudentId}
                onChange={(e) => handleFormateurStudentChange(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#070F1E] border border-amber-500/40 text-xs text-amber-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {adminStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.prenom} {s.nom} ({s.points_total} pts)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm">
                {activeStudent?.prenom ? activeStudent.prenom[0] : 'T'}
              </div>
              <div className="text-left">
                <div className="text-[10px] text-teal-400 font-mono uppercase font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Technicien en poste
                </div>
                <div className="text-sm font-bold text-white font-['Lexend']">
                  {activeStudent ? `${activeStudent.prenom} ${activeStudent.nom}` : 'Agent DSI'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  <span className="text-amber-400 font-semibold">{activeStudent?.points_total || 0} PTS</span>
                  {activeStudent?.equipe && <span> • {activeStudent.equipe}</span>}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Clôturer ma session sur ce poste"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fin de poste</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grille des Tickets d'incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {tickets.map((ticket) => {
          const userRes = resolutions.find(
            (r) => r.ticket_id === ticket.id && r.apprenant_id === (activeStudent?.id || selectedStudentId)
          );
          const isResolved = userRes?.statut === 'valide';
          const isPendingReview = userRes?.statut === 'en_attente_validation';
          const needsCorrection = userRes?.statut === 'a_corriger';

          return (
            <div
              key={ticket.id}
              className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 ${
                isResolved
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : needsCorrection
                  ? 'bg-amber-500/5 border-amber-500/40'
                  : isPendingReview
                  ? 'bg-cyan-500/5 border-cyan-500/30'
                  : 'slate-glass border-white/10 hover:border-teal-400/40'
              }`}
            >
              <div>
                {/* ID & Urgence & Statut Personnel */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-teal-400">
                    {ticket.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getUrgencyBadge(ticket.urgence)}
                  </div>
                </div>

                <div className="mb-2">
                  {getResolutionStatusBadge(userRes)}
                </div>

                {/* Service & Demandeur */}
                <div className="text-xs text-slate-400 font-mono mb-2">
                  <span className="text-slate-200 font-semibold">{ticket.demandeur}</span> • {ticket.service}
                </div>

                {/* Titre */}
                <h3 className="font-semibold text-sm text-white font-['Lexend'] mb-2">
                  {ticket.titre}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {ticket.description}
                </p>
              </div>

              {/* Pied de ticket & Action */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-amber-400">
                  +{ticket.points_valeur} pts
                </div>

                {isResolved ? (
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/api/tickets/export-dp-pdf?ticketId=${ticket.id}&studentId=${activeStudent?.id || selectedStudentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Télécharger ma fiche d'activité DP (PDF 1-page A4)"
                      className="p-1.5 rounded-lg text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveTicket(ticket)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Consulter</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTicket(ticket)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
                      needsCorrection
                        ? 'text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40'
                        : isPendingReview
                        ? 'text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30'
                        : 'text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30'
                    }`}
                  >
                    <span>
                      {needsCorrection ? 'Corriger ma réponse' : isPendingReview ? 'Modifier ma saisie' : 'Prendre en charge'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modale de Résolution Interactive du Ticket (Protocole ITIL en 3 étapes) */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0A192F] p-6 shadow-2xl text-slate-200">
            
            {/* Header Modale */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-400">
                    {activeTicket.id}
                  </span>
                  {getUrgencyBadge(activeTicket.urgence)}
                  {getResolutionStatusBadge(currentResolution)}
                </div>
                <h3 className="text-lg font-bold text-white font-['Lexend'] mt-1">
                  {activeTicket.titre}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Demandeur : {activeTicket.demandeur} ({activeTicket.service})
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTicket(null);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-slate-400 hover:text-white text-lg p-1.5 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {/* Corps de la modale défilable */}
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              
              {/* Message initial usager */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs leading-relaxed text-slate-300">
                <strong className="text-white block mb-1">Message de l'utilisateur :</strong>
                {activeTicket.description}
              </div>

              {/* Feedback formateur si statut a_corriger */}
              {currentResolution?.statut === 'a_corriger' && currentResolution.feedback_formateur && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold font-['Lexend'] text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    Retour du formateur (David JACQUA) :
                  </div>
                  <p className="leading-relaxed pl-6">
                    {currentResolution.feedback_formateur}
                  </p>
                </div>
              )}

              {/* Si validé : affichage de la validation */}
              {currentResolution?.statut === 'valide' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold font-['Lexend'] text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Intervention validée par le formateur (+{currentResolution.points_attribues} PTS)
                  </div>
                  {currentResolution.feedback_formateur && (
                    <p className="leading-relaxed pl-6">
                      Appréciation : &quot;{currentResolution.feedback_formateur}&quot;
                    </p>
                  )}
                  <div className="pt-1 pl-6">
                    <a
                      href={`/api/tickets/export-dp-pdf?ticketId=${activeTicket.id}&studentId=${selectedStudentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    >
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>Télécharger ma fiche d&apos;activité DP (PDF 1-page A4)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Aides techniques spécifiques par scénario */}
              {activeTicket.id === 'TCK-101' && (
                <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 font-['Lexend']">
                    <Calculator className="w-4 h-4 text-teal-400" />
                    Simulateur de formule tableur : Octroi de mer et TVA Antilles (8.5%)
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <label className="text-slate-400 block mb-1 text-[10px]">Montant HT (€)</label>
                      <input
                        type="number"
                        value={montantHT}
                        onChange={(e) => setMontantHT(Number(e.target.value))}
                        className="w-full px-2.5 py-1 rounded bg-[#070F1E] border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 text-[10px]">Taux Octroi (%)</label>
                      <input
                        type="number"
                        value={tauxOctroi}
                        onChange={(e) => setTauxOctroi(Number(e.target.value))}
                        className="w-full px-2.5 py-1 rounded bg-[#070F1E] border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 text-[10px]">TVA Locale (%)</label>
                      <input
                        type="number"
                        value={tauxTVA}
                        onChange={(e) => setTauxTVA(Number(e.target.value))}
                        className="w-full px-2.5 py-1 rounded bg-[#070F1E] border border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-[#070F1E] border border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      Octroi: {montantOctroi.toFixed(2)}€ | TVA: {montantTVA.toFixed(2)}€
                    </span>
                    <span className="text-teal-400 font-bold">
                      Total TTC: {totalTTC.toFixed(2)}€
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Formule corrigée pour Corinne : <code>=SIERREUR(RECHERCHEX(A2; Douane!A:B; 2); 0)</code>
                  </div>
                </div>
              )}

              {activeTicket.id === 'TCK-102' && (
                <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-300 font-semibold font-['Lexend']">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    Consignes pour la fiche réflexe 1-page A4
                  </div>
                  <p>
                    Le tutoriel doit comporter des captures nettes de l'application Zebra, la procédure de redémarrage forcé,
                    et le numéro d'urgence du support IT KLF (Poste 404).
                  </p>
                </div>
              )}

              {activeTicket.id === 'TCK-103' && (
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold font-['Lexend']">
                    <Mail className="w-4 h-4 text-amber-400" />
                    Diagnostic de fusion Word
                  </div>
                  <p>
                    Le décalage provient d'un saut de paragraphe involontaire dans le bloc d'adresses ou d'un format de date non verrouillé <code>\@ &quot;dd/MM/yyyy&quot;</code>.
                  </p>
                </div>
              )}

              {activeTicket.id === 'TCK-104' && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-slate-300 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-rose-300 font-semibold font-['Lexend']">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Analyseur d&apos;en-têtes et authenticité e-mail (Simulation DSI)
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#070F1E] border border-white/5 space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expéditeur affiché :</span>
                      <span className="text-white">compta@cma-cgm-caraibes.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Return-Path réel :</span>
                      <span className="text-rose-400 font-bold">billing-relay-proxy@malicious-node.xyz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IP d&apos;émission :</span>
                      <span className="text-amber-300">185.220.101.4 (Lituanie / Tor Exit Node)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-center font-bold">
                        SPF : FAIL
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-center font-bold">
                        DKIM : INVALID
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-center font-bold">
                        DMARC : QUARANTINE
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Conclusion technique : Usurpation avérée d&apos;identité (Domain Spoofing). Consigne : Aucun virement, blocage IP du relais sur le pare-feu et alerte générale de sensibilisation.
                  </p>
                </div>
              )}

              {activeTicket.id === 'TCK-105' && (
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-xs text-slate-300 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold font-['Lexend']">
                    <Printer className="w-4 h-4 text-cyan-400" />
                    Diagnostic réseau de l&apos;imprimante Zebra ZT410 (Quai Jarry)
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#070F1E] border border-white/5 space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">État initial après reboot EDF :</span>
                      <span className="text-amber-400 font-semibold">IP APIPA 169.254.12.88 (Bail DHCP expiré)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Configuration IP statique requise :</span>
                      <span className="text-emerald-400 font-bold">192.168.10.45 / 255.255.255.0 (/24)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Passerelle par défaut :</span>
                      <span className="text-white">192.168.10.1 (Routeur coeur Jarry)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Test connectivité terminal :</span>
                      <span className="text-teal-300 font-mono font-bold">ping 192.168.10.45 -n 4 → 0% de perte</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Démarche : Passer l&apos;imprimante en IP statique via le panneau tactile Zebra ou l&apos;interface web interne pour éviter qu&apos;elle ne perde son adresse lors des micro-coupures électriques.
                  </p>
                </div>
              )}

              {/* 💡 ENCART PÉDAGOGIQUE : SUGGESTION D'EXTENSION RÉSEAU POUR LE DP */}
              {(() => {
                const suggestion = getNetworkDPSuggestion(activeTicket.id);
                return (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/30 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 font-['Lexend']">
                      <Network className="w-4 h-4 text-indigo-400" />
                      💡 Suggestion d'extension réseau pour votre Dossier Professionnel (DP REAC)
                    </div>
                    <div className="text-xs text-slate-200 font-semibold">
                      {suggestion.titre}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                );
              })()}

              {/* Formulaire de résolution ITIL en 3 étapes */}
              <form noValidate onSubmit={handleSubmitResolution} className="space-y-4 pt-2">
                
                {/* Étape 1 : Qualification ITIL */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white font-['Lexend'] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-[11px] flex items-center justify-center font-mono font-bold">1</span>
                      Étape 1 • Qualification & Catégorisation de l'incident
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Catégorie technique</label>
                      <select
                        disabled={currentResolution?.statut === 'valide'}
                        value={categorie}
                        onChange={(e) => setCategorie(e.target.value as TicketResolutionCategory)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#070F1E] border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-teal-400"
                      >
                        <option value="materiel">Matériel & Périphériques (Zebra, Écrans, PC)</option>
                        <option value="systeme">Système d'exploitation (Windows 11, Pilotes, Boot)</option>
                        <option value="reseau">Réseau & Infrastructure (IP, Wi-Fi, Switch, Câble)</option>
                        <option value="applicatif">Applicatif & Bureautique (Excel, Word, Outlook, M365)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Urgence estimée</label>
                      <select
                        disabled={currentResolution?.statut === 'valide'}
                        value={urgence}
                        onChange={(e) => setUrgence(e.target.value as TicketUrgency)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#070F1E] border border-white/15 text-slate-200 text-xs focus:outline-none focus:border-teal-400"
                      >
                        <option value="P1">P1 • Critique (Bloque la production / délai douane)</option>
                        <option value="P2">P2 • Normal (Gêne importante avec contournement)</option>
                        <option value="P3">P3 • Basse (Amélioration ou incident mineur)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Étape 2 : Démarche technique */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <label className="text-xs font-bold text-white font-['Lexend'] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-[11px] flex items-center justify-center font-mono font-bold">2</span>
                    Étape 2 • Démarche technique & Procédure d'intervention appliquée
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Décrivez pas à pas les manipulations réalisées (ex : formule tableur corrigée, manipulations de paramètres, vérifications effectuées).
                  </p>
                  <textarea
                    disabled={currentResolution?.statut === 'valide'}
                    required
                    rows={3}
                    value={demarche}
                    onChange={(e) => setDemarche(e.target.value)}
                    placeholder="Exemple : 1. Constat du décalage de la cellule de taux lors de l'étirement. 2. Verrouillage absolu de la cellule avec le symbole $ ($E$1 via F4). 3. Figeage des volets de la ligne 1 via le menu Affichage..."
                    className="w-full p-3 rounded-xl bg-[#070F1E] border border-white/15 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors disabled:opacity-60"
                  />
                </div>

                {/* Étape 3 : Message usager */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                  <label className="text-xs font-bold text-white font-['Lexend'] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-[11px] flex items-center justify-center font-mono font-bold">3</span>
                    Étape 3 • Communication usager (Message de clôture bienveillant)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Rédigez le message professionnel que vous envoyez à l'utilisateur pour lui annoncer la résolution avec courtoisie et clarté.
                  </p>
                  <textarea
                    disabled={currentResolution?.statut === 'valide'}
                    required
                    rows={2}
                    value={messageUsager}
                    onChange={(e) => setMessageUsager(e.target.value)}
                    placeholder="Exemple : Bonjour Corinne, votre tableau a été corrigé et recalculé. Le fichier est disponible sur le dossier partagé..."
                    className="w-full p-3 rounded-xl bg-[#070F1E] border border-white/15 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors disabled:opacity-60"
                  />
                </div>

                {/* Alertes d'état */}
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTicket(null);
                      setErrorMessage(null);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white transition-colors"
                  >
                    Fermer
                  </button>

                  {currentResolution?.statut !== 'valide' && (
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isPending ? 'Transmission en cours...' : currentResolution ? 'Mettre à jour ma soumission' : 'Soumettre mon intervention'}
                      </span>
                    </button>
                  )}
                </div>

              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
