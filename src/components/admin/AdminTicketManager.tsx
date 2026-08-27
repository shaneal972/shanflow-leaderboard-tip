'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TicketKLF, Apprenant } from '@/types/tip';
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
  User 
} from 'lucide-react';
import { 
  createTicketAction, 
  toggleTicketStatusAction, 
  awardTicketToStudentAction 
} from '@/app/admin/actions';

interface AdminTicketManagerProps {
  tickets: TicketKLF[];
  students: Apprenant[];
}

export const AdminTicketManager: React.FC<AdminTicketManagerProps> = ({ tickets, students }) => {
  const router = useRouter();
  const [ticketsList, setTicketsList] = useState<TicketKLF[]>(tickets);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setTicketsList(tickets);
  }, [tickets]);

  // Modal création
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [ticketId, setTicketId] = useState(`TCK-${Math.floor(104 + Math.random() * 800)}`);
  const [service, setService] = useState('Transit Maritime');
  const [demandeur, setDemandeur] = useState('');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [urgence, setUrgence] = useState<'P1' | 'P2' | 'P3'>('P2');
  const [pointsValeur, setPointsValeur] = useState(150);

  // Modal attribution
  const [awardingTicket, setAwardingTicket] = useState<TicketKLF | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

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
    startTransition(async () => {
      const res = await toggleTicketStatusAction(ticket.id, newStatus);
      if (res.success) {
        setTicketsList((prev) =>
          prev.map((t) => (t.id === ticket.id ? { ...t, statut: newStatus } : t))
        );
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
        setTicketsList((prev) =>
          prev.map((t) => (t.id === awardingTicket.id ? { ...t, statut: 'resolu' } : t))
        );
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
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">P1 • Urgent</span>;
      case 'P2':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">P2 • Normal</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">P3 • Basse</span>;
    }
  };

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

      {/* En-tête du gestionnaire */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl slate-glass border border-white/10">
        <div>
          <h2 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
            <Ticket className="w-4 h-4 text-teal-400" />
            Gestionnaire des tickets d&apos;incidents KLF
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Publiez de nouveaux scénarios de dépannage ou attribuez la réussite d&apos;un ticket aux techniciens en formation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Créer un incident KLF</span>
        </button>
      </div>

      {/* Grille des tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ticketsList.map((ticket) => {
          const isResolved = ticket.statut === 'resolu';

          return (
            <div
              key={ticket.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                isResolved
                  ? 'bg-white/[0.02] border-emerald-500/30'
                  : 'slate-glass border-white/10 hover:border-teal-400/30'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-teal-400">{ticket.id}</span>
                  <div className="flex items-center gap-2">
                    {getUrgenceBadge(ticket.urgence)}
                    <span className="text-xs font-mono font-bold text-amber-400">+{ticket.points_valeur} pts</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-white font-['Lexend'] leading-snug">
                    {ticket.titre}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {ticket.demandeur}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {ticket.service}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {ticket.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                {/* Bascule de statut rapide */}
                <select
                  value={ticket.statut}
                  disabled={isPending}
                  onChange={(e) => handleToggleStatus(ticket, e.target.value as any)}
                  className="px-2 py-1 rounded bg-[#070F1E] border border-white/10 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-teal-400 cursor-pointer"
                >
                  <option value="ouvert">Ouvert</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolu">Résolu</option>
                </select>

                {/* Bouton d'attribution de la réussite */}
                <button
                  type="button"
                  onClick={() => setAwardingTicket(ticket)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
                  title="Attribuer la résolution à un technicien"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Attribuer</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Création Ticket */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl slate-glass border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
                <Ticket className="w-4 h-4 text-teal-400" />
                Créer un nouveau ticket d&apos;incident
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
                <label className="text-slate-300 block mb-1">Titre de l&apos;incident</label>
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
                <label className="text-slate-300 block mb-1">Description détaillée du problème</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Expliquez la situation et les symptômes observés par l'usager..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Valeur en points KLF ({pointsValeur} pts)</label>
                <input
                  type="range"
                  min={50}
                  max={300}
                  step={25}
                  value={pointsValeur}
                  onChange={(e) => setPointsValeur(Number(e.target.value))}
                  className="w-full cursor-pointer accent-teal-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? 'Création...' : 'Publier le ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Attribution Réussite Ticket */}
      {awardingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl slate-glass border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Valider la résolution du ticket
              </h3>
              <button onClick={() => setAwardingTicket(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAwardTicket} noValidate className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="font-mono text-teal-400 font-bold">{awardingTicket.id}</div>
                <div className="font-semibold text-white">{awardingTicket.titre}</div>
                <div className="text-amber-400 font-mono">Récompense : +{awardingTicket.points_valeur} points</div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Technicien ayant résolu l&apos;incident</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.prenom} {student.nom} ({student.equipe} - {student.points_total} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAwardingTicket(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? 'Validation...' : 'Valider et créditer les points'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
