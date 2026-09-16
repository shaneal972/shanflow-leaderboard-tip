'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TicketKLF, Apprenant, TicketResolution } from '@/types/tip';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Award, 
  X, 
  Check, 
  Ticket, 
  Building2, 
  User,
  Inbox,
  Send,
  MessageSquare,
  Sparkles,
  FileText,
  Filter,
  ArrowRight
} from 'lucide-react';
import { 
  createTicketAction, 
  toggleTicketStatusAction, 
  awardTicketToStudentAction,
  reviewTicketResolutionAction
} from '@/app/admin/actions';

interface AdminTicketManagerProps {
  tickets: TicketKLF[];
  students: Apprenant[];
  resolutions?: TicketResolution[];
  onTicketCreated?: (ticket: TicketKLF) => void;
  onTicketStatusChanged?: (ticketId: string, newStatus: 'ouvert' | 'en_cours' | 'resolu') => void;
  onPointsAdjusted?: (studentId: string, newPoints: number, newPalier: string) => void;
}

export const AdminTicketManager: React.FC<AdminTicketManagerProps> = ({ 
  tickets, 
  students,
  resolutions = [],
  onTicketCreated,
  onTicketStatusChanged,
  onPointsAdjusted,
}) => {
  const router = useRouter();
  const [ticketsList, setTicketsList] = useState<TicketKLF[]>(tickets);
  const [resolutionsList, setResolutionsList] = useState<TicketResolution[]>(resolutions);
  const [activeSection, setActiveSection] = useState<'submissions' | 'scenarios'>('submissions');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setTicketsList(tickets);
  }, [tickets]);

  useEffect(() => {
    setResolutionsList(resolutions);
  }, [resolutions]);

  // Filtres soumissions
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_attente_validation' | 'valide' | 'a_corriger'>('all');
  const [ticketFilter, setTicketFilter] = useState<string>('all');

  // Modal d'évaluation de soumission
  const [evaluatingResolution, setEvaluatingResolution] = useState<TicketResolution | null>(null);
  const [evalFeedback, setEvalFeedback] = useState<string>('');
  const [evalPoints, setEvalPoints] = useState<number>(150);

  // Modal création ticket
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [ticketId, setTicketId] = useState(`TCK-${Math.floor(104 + Math.random() * 800)}`);
  const [service, setService] = useState('Transit Maritime');
  const [demandeur, setDemandeur] = useState('');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [urgence, setUrgence] = useState<'P1' | 'P2' | 'P3'>('P2');
  const [pointsValeur, setPointsValeur] = useState(150);

  // Modal attribution manuelle de ticket
  const [awardingTicket, setAwardingTicket] = useState<TicketKLF | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  const pendingCount = resolutionsList.filter((r) => r.statut === 'en_attente_validation').length;

  const openEvaluationModal = (res: TicketResolution) => {
    setEvaluatingResolution(res);
    setEvalFeedback(res.feedback_formateur || '');
    setEvalPoints(res.points_attribues > 0 ? res.points_attribues : (res.ticket?.points_valeur || 150));
  };

  const handleReviewSubmission = (statut: 'valide' | 'a_corriger') => {
    if (!evaluatingResolution) return;

    const resId = evaluatingResolution.id;
    const targetStudent = students.find((s) => s.id === evaluatingResolution.apprenant_id);

    startTransition(async () => {
      const res = await reviewTicketResolutionAction({
        resolutionId: resId,
        statut,
        feedback: evalFeedback,
        pointsAAttribuer: evalPoints,
      });

      if (res.success) {
        setResolutionsList((prev) =>
          prev.map((r) =>
            r.id === resId
              ? {
                  ...r,
                  statut,
                  feedback_formateur: evalFeedback,
                  points_attribues: statut === 'valide' ? evalPoints : 0,
                  evalue_le: new Date().toISOString(),
                  evalue_par: 'David JACQUA',
                }
              : r
          )
        );

        if (statut === 'valide' && targetStudent && onPointsAdjusted) {
          const newPts = targetStudent.points_total + evalPoints;
          let newPal = targetStudent.palier_actuel;
          if (newPts >= 1000) newPal = 'Palier 4';
          else if (newPts >= 650) newPal = 'Palier 3';
          else if (newPts >= 350) newPal = 'Palier 2';
          else if (newPts >= 150) newPal = 'Palier 1';
          onPointsAdjusted(targetStudent.id, newPts, newPal);
        }

        setMessage({
          type: 'success',
          text: statut === 'valide'
            ? `Intervention validée avec succès ! +${evalPoints} pts crédités à ${targetStudent?.prenom} ${targetStudent?.nom}.`
            : `Demande de correction envoyée à ${targetStudent?.prenom} ${targetStudent?.nom}.`,
        });

        setEvaluatingResolution(null);
        router.refresh();
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur lors de l\'évaluation.' });
      }
    });
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demandeur.trim() || !titre.trim() || !description.trim()) {
      setMessage({ type: 'error', text: 'Veuillez renseigner tous les champs du ticket.' });
      return;
    }

    startTransition(async () => {
      const res = await createTicketAction({
        id: ticketId,
        service,
        demandeur,
        titre,
        description,
        urgence,
        points_valeur: pointsValeur,
      });

      if (res.success) {
        if (res.ticket) {
          setTicketsList((prev) => [res.ticket, ...prev]);
          if (onTicketCreated) onTicketCreated(res.ticket);
        }
        setIsCreateOpen(false);
        setDemandeur('');
        setTitre('');
        setDescription('');
        setTicketId(`TCK-${Math.floor(200 + Math.random() * 700)}`);
        setMessage({ type: 'success', text: `Ticket ${ticketId} créé et publié avec succès.` });
        router.refresh();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur lors de la création du ticket.' });
      }
    });
  };

  const handleToggleStatus = (ticket: TicketKLF, newStatus: 'ouvert' | 'en_cours' | 'resolu') => {
    setTicketsList((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, statut: newStatus } : t))
    );
    if (onTicketStatusChanged) onTicketStatusChanged(ticket.id, newStatus);

    startTransition(async () => {
      const res = await toggleTicketStatusAction(ticket.id, newStatus);
      if (res.success) {
        setMessage({ type: 'success', text: `Statut du ticket ${ticket.id} mis à jour.` });
        router.refresh();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur statut.' });
      }
    });
  };

  const handleAwardTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardingTicket || !selectedStudentId) return;

    const student = students.find((s) => s.id === selectedStudentId);

    startTransition(async () => {
      const res = await awardTicketToStudentAction(awardingTicket.id, selectedStudentId);
      if (res.success) {
        if (student && onPointsAdjusted) {
          const newPts = student.points_total + awardingTicket.points_valeur;
          let newPal = student.palier_actuel;
          if (newPts >= 1000) newPal = 'Palier 4';
          else if (newPts >= 650) newPal = 'Palier 3';
          else if (newPts >= 350) newPal = 'Palier 2';
          else if (newPts >= 150) newPal = 'Palier 1';
          onPointsAdjusted(student.id, newPts, newPal);
        }
        setAwardingTicket(null);
        setMessage({ 
          type: 'success', 
          text: `Ticket résolu avec succès ! +${awardingTicket.points_valeur} pts crédités à ${student?.prenom} ${student?.nom}.` 
        });
        router.refresh();
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur d\'attribution.' });
      }
    });
  };

  const getUrgenceBadge = (urg: string) => {
    switch (urg) {
      case 'P1':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">P1 • Critique</span>;
      case 'P2':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">P2 • Normal</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">P3 • Basse</span>;
    }
  };

  const getStatutBadge = (st: string) => {
    switch (st) {
      case 'valide':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Validé</span>;
      case 'a_corriger':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"><AlertCircle className="w-3 h-3 text-amber-400" /> À corriger</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse"><Clock className="w-3 h-3 text-cyan-400" /> En attente</span>;
    }
  };

  // Filtrage des résolutions
  const filteredResolutions = resolutionsList.filter((r) => {
    if (statusFilter !== 'all' && r.statut !== statusFilter) return false;
    if (ticketFilter !== 'all' && r.ticket_id !== ticketFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">

      {/* Barre de rétroaction */}
      {message && (
        <div className={`p-3 rounded-xl text-xs font-mono flex items-center justify-between border ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* En-tête du gestionnaire avec sous-onglets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl slate-glass border border-white/10">
        <div>
          <h2 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
            <Ticket className="w-4 h-4 text-teal-400" />
            Gestionnaire des tickets d'incidents KLF
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Évaluez les démarches techniques des stagiaires et gérez le catalogue des scénarios Helpdesk.
          </p>
        </div>

        {/* Sous-onglets */}
        <div className="flex items-center gap-2 bg-[#070F1E] p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveSection('submissions')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === 'submissions'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Soumissions des stagiaires</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950 animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('scenarios')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === 'scenarios'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Scénarios ({ticketsList.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1 : SOUMISSIONS DES STAGIAIRES */}
      {activeSection === 'submissions' && (
        <div className="space-y-4">
          
          {/* Barre de filtres */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-mono">
                <Filter className="w-3.5 h-3.5 text-teal-400" />
                Filtrer par statut :
              </span>
              <div className="flex items-center gap-1">
                {(['all', 'en_attente_validation', 'valide', 'a_corriger'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                      statusFilter === st
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {st === 'all' ? 'Toutes' : st === 'en_attente_validation' ? 'En attente' : st === 'valide' ? 'Validées' : 'À corriger'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono">Ticket :</span>
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#070F1E] border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                <option value="all">Tous les tickets</option>
                {ticketsList.map((t) => (
                  <option key={t.id} value={t.id}>{t.id} • {t.demandeur}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Liste des soumissions */}
          {filteredResolutions.length === 0 ? (
            <div className="p-8 rounded-2xl slate-glass border border-white/10 text-center space-y-2">
              <Inbox className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">
                Aucune soumission ne correspond aux filtres sélectionnés.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResolutions.map((res) => {
                const st = res.apprenant || students.find((s) => s.id === res.apprenant_id);
                const tk = res.ticket || ticketsList.find((t) => t.id === res.ticket_id);

                return (
                  <div
                    key={res.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      res.statut === 'en_attente_validation'
                        ? 'bg-cyan-500/5 border-cyan-500/30 shadow-md shadow-cyan-950/20'
                        : res.statut === 'valide'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-amber-500/5 border-amber-500/30'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-white font-['Lexend']">
                          {st ? `${st.prenom} ${st.nom}` : 'Stagiaire'}
                        </span>
                        {st?.equipe && (
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {st.equipe}
                          </span>
                        )}
                        <span className="font-mono text-xs text-teal-400 font-bold ml-2">
                          {res.ticket_id}
                        </span>
                        {getStatutBadge(res.statut)}
                      </div>

                      <div className="text-xs text-slate-300">
                        <strong>{tk?.titre || 'Incident'}</strong> • Demandeur : {tk?.demandeur || 'Usager'}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                        <span>Catégorie : <strong className="text-slate-200 capitalize">{res.diagnostic_categorie}</strong></span>
                        <span>•</span>
                        <span>Urgence : <strong className="text-slate-200">{res.diagnostic_urgence}</strong></span>
                        <span>•</span>
                        <span>Soumis le : {new Date(res.soumis_le).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      {res.statut === 'valide' && (
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          +{res.points_attribues} PTS
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => openEvaluationModal(res)}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          res.statut === 'en_attente_validation'
                            ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md shadow-teal-950/40 hover:scale-105 active:scale-95'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <span>{res.statut === 'en_attente_validation' ? 'Évaluer l\'intervention' : 'Revoir l\'évaluation'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* SECTION 2 : CATALOGUE DES SCÉNARIOS KLF */}
      {activeSection === 'scenarios' && (
        <div className="space-y-4">
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau ticket</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ticketsList.map((ticket) => {
              const resCount = resolutionsList.filter((r) => r.ticket_id === ticket.id).length;
              const valCount = resolutionsList.filter((r) => r.ticket_id === ticket.id && r.statut === 'valide').length;

              return (
                <div
                  key={ticket.id}
                  className="flex flex-col justify-between p-4 rounded-xl slate-glass border border-white/10 hover:border-teal-500/30 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-teal-400">{ticket.id}</span>
                      {getUrgenceBadge(ticket.urgence)}
                    </div>

                    <h3 className="font-semibold text-sm text-white font-['Lexend'] line-clamp-1">
                      {ticket.titre}
                    </h3>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {ticket.demandeur} • {ticket.service}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-400 font-bold">+{ticket.points_valeur} pts</span>
                      <span className="text-slate-400 text-[11px]">{valCount} validés / {resCount} soumissions</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={ticket.statut}
                        disabled={isPending}
                        onChange={(e) => handleToggleStatus(ticket, e.target.value as any)}
                        className="px-2 py-1 rounded bg-[#070F1E] border border-white/10 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-teal-400 cursor-pointer"
                      >
                        <option value="ouvert">Ouvert</option>
                        <option value="en_cours">En cours</option>
                        <option value="resolu">Résolu (Clos)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setAwardingTicket(ticket)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Attribuer</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* MODALE D'ÉVALUATION PAR LE FORMATEUR (DAVID JACQUA) */}
      {evaluatingResolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0A192F] p-6 shadow-2xl text-slate-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-400">
                    {evaluatingResolution.ticket_id}
                  </span>
                  {getStatutBadge(evaluatingResolution.statut)}
                </div>
                <h3 className="text-lg font-bold text-white font-['Lexend'] mt-1">
                  Évaluation de l&apos;intervention • {evaluatingResolution.apprenant?.prenom || 'Stagiaire'} {evaluatingResolution.apprenant?.nom || ''}
                </h3>
              </div>
              <button
                onClick={() => setEvaluatingResolution(null)}
                className="text-slate-400 hover:text-white text-lg p-1.5"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[65vh] overflow-y-auto pr-2 text-xs">
              
              {/* Étape 1 Stagiaire */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px] font-mono">
                  Étape 1 • Qualification & Urgence déclarées
                </span>
                <div className="flex items-center gap-4 text-slate-200 font-mono pt-1">
                  <span>Catégorie : <strong className="capitalize">{evaluatingResolution.diagnostic_categorie}</strong></span>
                  <span>•</span>
                  <span>Urgence : <strong>{evaluatingResolution.diagnostic_urgence}</strong></span>
                </div>
              </div>

              {/* Étape 2 Stagiaire */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px] font-mono">
                  Étape 2 • Démarche technique appliquée
                </span>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap pt-1">
                  {evaluatingResolution.demarche_technique}
                </p>
              </div>

              {/* Étape 3 Stagiaire */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px] font-mono">
                  Étape 3 • Message usager rédigé
                </span>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap pt-1 italic bg-black/20 p-2.5 rounded-lg border border-white/5">
                  &quot;{evaluatingResolution.message_usager}&quot;
                </p>
              </div>

              {/* Formulaire formateur */}
              <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white font-['Lexend'] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-teal-400" />
                    Appréciation & Feedback formateur (David JACQUA) :
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-400 font-mono">Points :</label>
                    <input
                      type="number"
                      value={evalPoints}
                      onChange={(e) => setEvalPoints(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded bg-[#070F1E] border border-white/20 text-white font-mono text-right"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  placeholder="Ex : Très bonne démarche, la formule est propre et la relation usager est bienveillante..."
                  className="w-full p-3 rounded-xl bg-[#070F1E] border border-white/15 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEvaluatingResolution(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleReviewSubmission('a_corriger')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Demander une correction</span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleReviewSubmission('valide')}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Valider (+{evalPoints} PTS)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CRÉATION TICKET */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl slate-glass border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
                <Ticket className="w-4 h-4 text-teal-400" />
                Créer un nouveau ticket d'incident
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} noValidate className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Identifiant du ticket</label>
                  <input
                    type="text"
                    required
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Urgence</label>
                  <select
                    value={urgence}
                    onChange={(e) => setUrgence(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white font-mono cursor-pointer"
                  >
                    <option value="P1">P1 • Urgent (Critique)</option>
                    <option value="P2">P2 • Normal (Intermédiaire)</option>
                    <option value="P3">P3 • Basse (Secondaire)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Demandeur</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Corinne MONROSE"
                    value={demandeur}
                    onChange={(e) => setDemandeur(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Service KLF</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Facturation & Douane"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Titre de l'incident</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Panne de scanner codes-barres quai n°2"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description du problème usager</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Détaillez le comportement anormal constaté par le collaborateur..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Valeur en points</label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={pointsValeur}
                  onChange={(e) => setPointsValeur(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold disabled:opacity-50"
                >
                  Publier le ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ATTRIBUTION MANUELLE */}
      {awardingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl slate-glass border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Attribuer la réussite du ticket
              </h3>
              <button onClick={() => setAwardingTicket(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAwardTicket} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                <div className="text-teal-400 font-mono font-bold">{awardingTicket.id}</div>
                <div className="font-semibold text-white">{awardingTicket.titre}</div>
                <div className="text-amber-400 font-mono">+{awardingTicket.points_valeur} points KLF</div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-medium">
                  Sélectionner le technicien ayant résolu le ticket :
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white text-xs cursor-pointer focus:outline-none focus:border-teal-400"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.prenom} {s.nom} ({s.equipe}) • {s.points_total} pts
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAwardingTicket(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold disabled:opacity-50"
                >
                  Confirmer l'attribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
