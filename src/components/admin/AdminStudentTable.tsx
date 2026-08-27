'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Apprenant } from '@/types/tip';
import { 
  UserPlus, 
  Edit3, 
  Trash2, 
  Plus, 
  Minus, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { 
  createStudentAction, 
  updateStudentAction, 
  deleteStudentAction, 
  adjustPointsAction 
} from '@/app/admin/actions';

interface AdminStudentTableProps {
  students: Apprenant[];
  onStudentCreated?: (student: Apprenant) => void;
  onStudentUpdated?: (student: Apprenant) => void;
  onStudentDeleted?: (studentId: string) => void;
  onPointsAdjusted?: (studentId: string, newPoints: number, newPalier: string) => void;
}

export const AdminStudentTable: React.FC<AdminStudentTableProps> = ({ 
  students,
  onStudentCreated,
  onStudentUpdated,
  onStudentDeleted,
  onPointsAdjusted,
}) => {
  const router = useRouter();
  const [studentsList, setStudentsList] = useState<Apprenant[]>(students);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Synchronisation avec les props serveur
  useEffect(() => {
    setStudentsList(students);
  }, [students]);

  // Modal Ajout
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPrenom, setNewPrenom] = useState('');
  const [newNom, setNewNom] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEquipe, setNewEquipe] = useState('Escouade Alizé');

  // Modal Édition
  const [editingStudent, setEditingStudent] = useState<Apprenant | null>(null);

  const teams = Array.from(new Set(studentsList.map((s) => s.equipe)));

  const filtered = studentsList.filter((s) => {
    const matchSearch = `${s.prenom} ${s.nom} ${s.email}`.toLowerCase().includes(search.toLowerCase());
    const matchTeam = selectedTeam === 'all' || s.equipe === selectedTeam;
    return matchSearch && matchTeam;
  });

  const handleAdjustPoints = (studentId: string, delta: number) => {
    startTransition(async () => {
      const res = await adjustPointsAction({
        studentId,
        deltaPoints: delta,
        reason: `Ajustement formateur direct (${delta > 0 ? '+' : ''}${delta} pts)`,
      });
      if (res.success) {
        const newPts = res.newPoints !== undefined ? res.newPoints : 0;
        const newPal = (res.newPalier as any) || 'Palier 0';

        setStudentsList((prev) =>
          prev.map((s) =>
            s.id === studentId
              ? { ...s, points_total: newPts, palier_actuel: newPal }
              : s
          )
        );
        if (onPointsAdjusted) {
          onPointsAdjusted(studentId, newPts, newPal);
        }
        setMessage({ type: 'success', text: `Points ajustés avec succès (${delta > 0 ? '+' : ''}${delta} pts).` });
        router.refresh();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur lors de l\'ajustement.' });
      }
    });
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrenom.trim() || !newNom.trim() || !newEmail.trim()) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    startTransition(async () => {
      const res = await createStudentAction({
        prenom: newPrenom,
        nom: newNom,
        email: newEmail,
        equipe: newEquipe,
      });
      if (res.success && res.student) {
        setStudentsList((prev) => [res.student, ...prev]);
        if (onStudentCreated) {
          onStudentCreated(res.student);
        }
        setIsAddOpen(false);
        setNewPrenom('');
        setNewNom('');
        setNewEmail('');
        setMessage({ type: 'success', text: `Apprenant ${newPrenom} ${newNom} ajouté avec succès.` });
        router.refresh();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur lors de la création.' });
      }
    });
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    startTransition(async () => {
      const res = await updateStudentAction({
        id: editingStudent.id,
        prenom: editingStudent.prenom,
        nom: editingStudent.nom,
        email: editingStudent.email,
        equipe: editingStudent.equipe,
        palier_actuel: editingStudent.palier_actuel,
      });
      if (res.success && res.student) {
        setStudentsList((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? res.student : s))
        );
        if (onStudentUpdated) {
          onStudentUpdated(res.student);
        }
        setEditingStudent(null);
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
        router.refresh();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur lors de la mise à jour.' });
      }
    });
  };

  const handleDeleteStudent = (student: Apprenant) => {
    if (!confirm(`Supprimer définitivement l'apprenant ${student.prenom} ${student.nom} ?`)) {
      return;
    }

    // Disparition immédiate de l'écran à 0ms
    setStudentsList((prev) => prev.filter((s) => s.id !== student.id));
    if (onStudentDeleted) {
      onStudentDeleted(student.id);
    }
    setMessage({ type: 'success', text: `Apprenant ${student.prenom} ${student.nom} supprimé.` });

    startTransition(async () => {
      const res = await deleteStudentAction(student.id);
      if (!res.success) {
        // En cas d'erreur de suppression, on réintègre l'apprenant
        setStudentsList((prev) => [student, ...prev]);
        if (onStudentCreated) {
          onStudentCreated(student);
        }
        setMessage({ type: 'error', text: res.error || 'Erreur lors de la suppression.' });
      } else {
        router.refresh();
        setTimeout(() => setMessage(null), 3000);
      }
    });
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

      {/* Barre d'outils et filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl slate-glass border border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher nom, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#070F1E] border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-400 w-48 sm:w-64"
            />
          </div>

          {/* Filtre escouade */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#070F1E] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-teal-400 cursor-pointer"
          >
            <option value="all">Toutes les escouades ({students.length})</option>
            {teams.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Ajouter un apprenant</span>
        </button>
      </div>

      {/* Tableau des apprenants avec colonne actions sticky */}
      <div className="rounded-xl border border-white/10 bg-[#0A192F]/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#112240] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-12 text-center">N°</th>
                <th className="py-3 px-4">Identité réelle</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Escouade</th>
                <th className="py-3 px-4">Palier</th>
                <th className="py-3 px-4 text-center">Score KLF</th>
                <th className="py-3 px-4 text-center">Ajustement rapide</th>
                <th className="py-3 px-4 text-center w-28 sticky-actions-col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filtered.map((student, idx) => (
                <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-bold text-teal-400 shrink-0">
                        {student.prenom[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-white font-['Lexend']">
                          {student.prenom} {student.nom}
                        </div>
                        {student.is_admin && (
                          <span className="text-[10px] font-mono text-amber-400">Formateur DSI</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {student.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/5 text-slate-300">
                      {student.equipe}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      {student.palier_actuel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-amber-400 text-sm">
                    {student.points_total} pts
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-mono">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleAdjustPoints(student.id, 25)}
                        className="px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all text-[11px]"
                        title="Ajouter 25 points"
                      >
                        +25
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleAdjustPoints(student.id, 50)}
                        className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all text-[11px]"
                        title="Ajouter 50 points"
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        disabled={isPending || student.points_total < 25}
                        onClick={() => handleAdjustPoints(student.id, -25)}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all text-[11px] disabled:opacity-30"
                        title="Retirer 25 points"
                      >
                        -25
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center sticky-actions-col">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingStudent(student)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-teal-400 border border-white/5 transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout Apprenant */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl slate-glass border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-400" />
                Ajouter un nouvel apprenant
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} noValidate className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={newPrenom}
                  onChange={(e) => setNewPrenom(e.target.value)}
                  placeholder="Ex: Jordan"
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Nom de famille</label>
                <input
                  type="text"
                  required
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  placeholder="Ex: MARIE-JOSEPH"
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Adresse email officielle</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ex: jordan.mj@metafore.gp"
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Escouade assignée</label>
                <select
                  value={newEquipe}
                  onChange={(e) => setNewEquipe(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                >
                  <option value="Escouade Alizé">Escouade Alizé</option>
                  <option value="Escouade Houelbourg">Escouade Houelbourg</option>
                  <option value="Escouade Baie-Mahault">Escouade Baie-Mahault</option>
                  <option value="Support Jarry">Support Jarry</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? 'Enregistrement...' : 'Créer l\'apprenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modification Apprenant */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl slate-glass border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-400" />
                Modifier le profil de l&apos;apprenant
              </h3>
              <button onClick={() => setEditingStudent(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} noValidate className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.prenom}
                    onChange={(e) => setEditingStudent({ ...editingStudent, prenom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.nom}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Escouade</label>
                  <select
                    value={editingStudent.equipe}
                    onChange={(e) => setEditingStudent({ ...editingStudent, equipe: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                  >
                    <option value="Escouade Alizé">Escouade Alizé</option>
                    <option value="Escouade Houelbourg">Escouade Houelbourg</option>
                    <option value="Escouade Baie-Mahault">Escouade Baie-Mahault</option>
                    <option value="Support Jarry">Support Jarry</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Palier actuel</label>
                  <select
                    value={editingStudent.palier_actuel}
                    onChange={(e) => setEditingStudent({ ...editingStudent, palier_actuel: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#070F1E] border border-white/10 text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                  >
                    <option value="Palier 0">Palier 0</option>
                    <option value="Palier 1">Palier 1</option>
                    <option value="Palier 2">Palier 2</option>
                    <option value="Palier 3">Palier 3</option>
                    <option value="Palier 4">Palier 4</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? 'Mise à jour...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
