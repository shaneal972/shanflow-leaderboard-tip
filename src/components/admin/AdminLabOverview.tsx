'use client';

import React, { useState, useTransition } from 'react';
import { LabSubmission, Apprenant, Lab } from '@/types/tip';
import { homologuerLabAction } from '@/app/lab/actions';
import { 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  Download, 
  Award, 
  ExternalLink, 
  Search, 
  Filter,
  Eye,
  ShieldCheck,
  Send,
  AlertCircle
} from 'lucide-react';

interface AdminLabOverviewProps {
  submissions: LabSubmission[];
  students: Apprenant[];
}

export const AdminLabOverview: React.FC<AdminLabOverviewProps> = ({
  submissions: initialSubmissions,
  students,
}) => {
  const [submissions, setSubmissions] = useState<LabSubmission[]>(initialSubmissions);
  const [selectedSub, setSelectedSub] = useState<LabSubmission | null>(null);
  const [feedback, setFeedback] = useState<string>('Démarche technique rigoureuse et formules conformes aux spécifications KLF. Homologation accordée.');
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSubmissions = submissions.filter((sub) => {
    const student = sub.apprenant || students.find((s) => s.id === sub.apprenant_id);
    const fullName = student ? `${student.prenom} ${student.nom}`.toLowerCase() : '';
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleHomologuer = (sub: LabSubmission) => {
    startTransition(async () => {
      const pointsSolde = 100; // Solde pour atteindre 200 pts au total
      const res = await homologuerLabAction({
        submissionId: sub.id,
        labId: sub.lab_id,
        studentId: sub.apprenant_id,
        pointsSolde,
        badgeId: 'corinne_savior',
        feedback,
      });

      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === sub.id
              ? { ...s, statut: 'homologue_dsi', points_attribues: 200, feedback_formateur: feedback }
              : s
          )
        );
        setSelectedSub(null);
      } else {
        alert("Erreur lors de l'homologation : " + (res.error || 'Inconnue'));
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* En-tête & Filtres */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl slate-glass border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-['Lexend']">
              Supervision des ateliers KLF Tech Lab
            </h2>
            <p className="text-[11px] text-slate-400">
              Contrôle des auto-audits, relecture réflexive et homologation des badges de formation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer un apprenant..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#070F1E] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#070F1E] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-teal-400 font-mono cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="soumis_en_revue">À homologuer</option>
            <option value="homologue_dsi">Homologués DSI</option>
            <option value="brouillon">Brouillons</option>
          </select>
        </div>
      </div>

      {/* Tableau des soumissions d'ateliers */}
      <div className="rounded-2xl border border-white/10 bg-[#0A192F]/60 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#112240]/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Technicien TIP</th>
                <th className="py-3 px-4">Atelier KLF</th>
                <th className="py-3 px-4 text-center">Score Audit</th>
                <th className="py-3 px-4 text-center">Points</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center w-48">Actions Formateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    Aucune soumission d&apos;atelier trouvée pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const student = sub.apprenant || students.find((s) => s.id === sub.apprenant_id);
                  const isHomologue = sub.statut === 'homologue_dsi';
                  const isSoumis = sub.statut === 'soumis_en_revue';

                  return (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Apprenant */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-teal-400 shrink-0 text-[10px]">
                            {student?.prenom?.[0]}{student?.nom?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 font-['Lexend']">
                              {student ? `${student.prenom} ${student.nom}` : sub.apprenant_id}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {student?.equipe || 'Support Jarry'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Atelier */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">
                          {sub.lab?.titre || sub.lab_id}
                        </div>
                        <div className="text-[10px] font-mono text-teal-400">
                          {sub.lab_id.toUpperCase()}
                        </div>
                      </td>

                      {/* Score technique */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${
                            sub.score_technique_pct === 100
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {sub.score_technique_pct}% ({sub.jalons_valides}/5)
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                        {sub.points_attribues} pts
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4 text-center font-mono">
                        {isHomologue && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ Homologué DSI
                          </span>
                        )}
                        {isSoumis && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            À homologuer
                          </span>
                        )}
                        {sub.statut === 'brouillon' && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/10">
                            Brouillon
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSub(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
                            title="Inspecter le carnet et les réponses"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspecter</span>
                          </button>

                          <a
                            href={`/api/lab/export-pdf?labId=${sub.lab_id}&studentId=${sub.apprenant_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all"
                            title="Télécharger le compte-rendu A4 Gotenberg"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'inspection & d'homologation formateur */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0A192F] border border-white/15 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Lexend']">
                    Homologation d&apos;Atelier TP • David JACQUA
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Stagiaire : {selectedSub.apprenant?.prenom} {selectedSub.apprenant?.nom} ({selectedSub.lab_id})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {/* Détails de l'audit */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Conformité technique calculée :</span>
                <span className="text-emerald-400 font-bold">{selectedSub.score_technique_pct}% ({selectedSub.jalons_valides}/5 jalons)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Points actuels attribués :</span>
                <span className="text-amber-400 font-bold">{selectedSub.points_attribues} pts / 200</span>
              </div>
            </div>

            {/* Réponses rédigées par l'apprenant */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-300 font-mono">1. Démarche technique :</span>
                <div className="mt-1 p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-slate-200 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {selectedSub.reponse_demarche || 'Aucune démarche rédigée.'}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 font-mono">2. Difficultés & Contournement :</span>
                <div className="mt-1 p-2.5 rounded-lg bg-black/40 border border-white/10 font-mono text-slate-200">
                  {selectedSub.reponse_difficultes || 'Non renseigné.'}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 font-mono">3. Enseignements réflexifs :</span>
                <div className="mt-1 p-2.5 rounded-lg bg-black/40 border border-white/10 font-mono text-slate-200">
                  {selectedSub.reponse_enseignements || 'Non renseigné.'}
                </div>
              </div>
            </div>

            {/* Formulaire de validation formateur */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Avis & Visa formateur DSI :</span>
                <span className="text-[10px] text-amber-400 font-mono">+100 pts de solde + Trophée Sauveur Corinne</span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#070F1E] border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Actions modal */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => handleHomologuer(selectedSub)}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Award className="w-4 h-4" />
                <span>{isPending ? 'Homologation...' : 'Homologuer (+100 pts & Badge KLF)'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
