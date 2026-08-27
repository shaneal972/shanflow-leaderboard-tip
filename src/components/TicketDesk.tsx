'use client';

import React, { useState } from 'react';
import { TicketKLF } from '@/types/tip';
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
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TicketDeskProps {
  initialTickets: TicketKLF[];
}

export const TicketDesk: React.FC<TicketDeskProps> = ({ initialTickets }) => {
  const [tickets, setTickets] = useState<TicketKLF[]>(initialTickets);
  const [activeTicket, setActiveTicket] = useState<TicketKLF | null>(null);
  
  // Calculateur simulateur pour Ticket #101 (Corinne Facturation)
  const [montantHT, setMontantHT] = useState<number>(1000);
  const [tauxOctroi, setTauxOctroi] = useState<number>(8.5);
  const [tauxTVA, setTauxTVA] = useState<number>(8.5);

  // État de soumission de ticket
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
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
            P3 MINEUR
          </span>
        );
    }
  };

  const handleResolveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === activeTicket.id ? { ...t, statut: 'resolu' } : t
        )
      );
      setIsSubmitting(false);
      setSuccessMessage(`Ticket ${activeTicket.id} validé avec succès ! +${activeTicket.points_valeur} pts`);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00B4D8', '#F59E0B', '#10B981'],
      });
      setTimeout(() => {
        setActiveTicket(null);
        setSuccessMessage(null);
        setResolutionNote('');
      }, 2000);
    }, 800);
  };

  // Calculs fiscaux Antilles pour Corinne
  const montantOctroi = (montantHT * tauxOctroi) / 100;
  const montantTVA = ((montantHT + montantOctroi) * tauxTVA) / 100;
  const totalTTC = montantHT + montantOctroi + montantTVA;

  return (
    <div className="w-full space-y-6">
      
      {/* En-tête du Ticket Desk */}
      <div className="p-6 rounded-2xl slate-glass relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Simulation Helpdesk DSI
              </span>
              <span className="text-xs text-slate-400 font-mono">GLPI / KLF Support Desk</span>
            </div>
            <h1 className="text-2xl font-bold text-white font-['Lexend'] mt-1">
              KLF Ticket Desk • Incidents Usagers
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Résolvez les incidents réels des collaborateurs de Karukera Logistique & Fret (Jarry).
              Chaque ticket résolu débloque des points au classement et valide les compétences du <strong>CCP 1 (Support Utilisateur)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="text-xl font-bold text-amber-400 font-mono">
                {tickets.filter((t) => t.statut === 'resolu').length} / {tickets.length}
              </div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Résolus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des Tickets d'incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {tickets.map((ticket) => {
          const isResolved = ticket.statut === 'resolu';

          return (
            <div
              key={ticket.id}
              className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 ${
                isResolved
                  ? 'bg-white/[0.02] border-emerald-500/30'
                  : 'slate-glass border-white/10 hover:border-teal-400/40'
              }`}
            >
              <div>
                {/* ID & Urgence */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-teal-400">
                    {ticket.id}
                  </span>
                  {getUrgencyBadge(ticket.urgence)}
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
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Résolu
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTicket(ticket)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Prendre en charge</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modale de Résolution Interactive du Ticket */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0A192F] p-6 shadow-2xl text-slate-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-400">
                    {activeTicket.id}
                  </span>
                  {getUrgencyBadge(activeTicket.urgence)}
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
                onClick={() => setActiveTicket(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Description détaillée */}
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs leading-relaxed text-slate-300">
                <strong className="text-white block mb-1">Message de l&apos;utilisateur :</strong>
                {activeTicket.description}
              </div>

              {/* Module Métier Spécifique : Simulateur Fiscal pour Corinne (Ticket #101) */}
              {activeTicket.id === 'TCK-101' && (
                <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 font-['Lexend']">
                    <Calculator className="w-4 h-4 text-teal-400" />
                    Simulateur de Formule Tableur : Octroi de Mer & TVA Antilles (8.5%)
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

              {/* Conseils pour Ticket #102 (Zebra Quai REAC) */}
              {activeTicket.id === 'TCK-102' && (
                <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-300 font-semibold font-['Lexend']">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    Critères d&apos;évaluation REAC (Fiche Réflexe 1-page A4)
                  </div>
                  <p>
                    Le tutoriel doit comporter des captures nettes de l&apos;application Zebra, la procédure de redémarrage forcé,
                    et le numéro d&apos;urgence du support IT KLF (Poste 404).
                  </p>
                </div>
              )}

              {/* Conseils pour Ticket #103 (RH Publipostage) */}
              {activeTicket.id === 'TCK-103' && (
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold font-['Lexend']">
                    <Mail className="w-4 h-4 text-amber-400" />
                    Diagnostic Fusion Word
                  </div>
                  <p>
                    Le décalage provient d&apos;un saut de paragraphe involontaire dans le bloc d&apos;adresses ou d&apos;un format de date non verrouillé <code>\@ &quot;dd/MM/yyyy&quot;</code>.
                  </p>
                </div>
              )}

              {/* Formulaire de résolution */}
              <form noValidate onSubmit={handleResolveTicket} className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-200">
                  Rapport de résolution & Procédure appliquée :
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Décrivez l'intervention technique menée (ex: formule corrigée, fiche rédigée, publipostage testé)..."
                  className="w-full p-3 rounded-xl bg-[#070F1E] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
                />

                {successMessage && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {successMessage}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTicket(null)}
                    className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Validation...' : 'Valider la résolution'}</span>
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
