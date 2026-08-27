'use client';

import React, { useState, useTransition } from 'react';
import { Apprenant, DPSuivi } from '@/types/tip';
import { 
  FileCheck2, 
  Check, 
  Circle, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Send, 
  Building2 
} from 'lucide-react';
import { updateDPChecklistAction } from '@/app/admin/actions';

interface AdminDPOverviewProps {
  students: Apprenant[];
  dpRecords: DPSuivi[];
}

export const AdminDPOverview: React.FC<AdminDPOverviewProps> = ({ 
  students, 
  dpRecords: initialRecords 
}) => {
  const [dpMap, setDpMap] = useState<Record<string, DPSuivi>>(() => {
    const map: Record<string, DPSuivi> = {};
    initialRecords.forEach((r) => {
      map[r.apprenant_id] = r;
    });
    return map;
  });

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getStudentRecord = (studentId: string): DPSuivi => {
    return dpMap[studentId] || {
      apprenant_id: studentId,
      rubrique_1: false,
      rubrique_2: false,
      rubrique_3: false,
      rubrique_4: false,
      rubrique_5: false,
      statut_dp: 'brouillon',
    };
  };

  const handleToggleRubrique = (
    studentId: string, 
    rubriqueKey: 'rubrique_1' | 'rubrique_2' | 'rubrique_3' | 'rubrique_4' | 'rubrique_5'
  ) => {
    const current = getStudentRecord(studentId);
    const updated = {
      ...current,
      [rubriqueKey]: !current[rubriqueKey],
    };

    setDpMap((prev) => ({ ...prev, [studentId]: updated }));

    startTransition(async () => {
      const res = await updateDPChecklistAction({
        studentId,
        rubrique_1: updated.rubrique_1,
        rubrique_2: updated.rubrique_2,
        rubrique_3: updated.rubrique_3,
        rubrique_4: updated.rubrique_4,
        rubrique_5: updated.rubrique_5,
        statut_dp: updated.statut_dp,
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Mise à jour DP enregistrée.' });
        setTimeout(() => setMessage(null), 2500);
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur d\'enregistrement DP.' });
      }
    });
  };

  const handleChangeStatus = (
    studentId: string, 
    newStatus: 'brouillon' | 'en_revue' | 'valide_jury'
  ) => {
    const current = getStudentRecord(studentId);
    const updated = { ...current, statut_dp: newStatus };

    setDpMap((prev) => ({ ...prev, [studentId]: updated }));

    startTransition(async () => {
      const res = await updateDPChecklistAction({
        studentId,
        rubrique_1: updated.rubrique_1,
        rubrique_2: updated.rubrique_2,
        rubrique_3: updated.rubrique_3,
        rubrique_4: updated.rubrique_4,
        rubrique_5: updated.rubrique_5,
        statut_dp: newStatus,
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Statut DP changé vers « ${newStatus} ».` });
        setTimeout(() => setMessage(null), 2500);
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur statut DP.' });
      }
    });
  };

  const rubriquesHeaders = [
    { key: 'rubrique_1', label: '1. Tâches (1ère personne)' },
    { key: 'rubrique_2', label: '2. Moyens & outils' },
    { key: 'rubrique_3', label: '3. Collaboration' },
    { key: 'rubrique_4', label: '4. Contexte & dates' },
    { key: 'rubrique_5', label: '5. Sécurité & réflexivité' },
  ] as const;

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

      {/* En-tête superviseur DP */}
      <div className="p-4 rounded-xl slate-glass border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            Superviseur du dossier professionnel (DP REAC)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivi de la conformité des 5 rubriques officielles Cerfa Ministère du Travail (CCP 1 - Support Utilisateur).
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
          Référentiel officiel Ministère du Travail
        </span>
      </div>

      {/* Tableau de bord DP */}
      <div className="rounded-xl border border-white/10 bg-[#0A192F]/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#112240] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 text-left w-48 sticky left-0 z-20 bg-[#112240] shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                  Technicien TIP
                </th>
                {rubriquesHeaders.map((h) => (
                  <th key={h.key} className="py-3 px-3 text-center text-[10px]">
                    {h.label}
                  </th>
                ))}
                <th className="py-3 px-4 text-center">Progression</th>
                <th className="py-3 px-4 text-center w-36 sticky-actions-col">
                  Statut officiel
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {students.map((student) => {
                const rec = getStudentRecord(student.id);
                const validCount = [
                  rec.rubrique_1,
                  rec.rubrique_2,
                  rec.rubrique_3,
                  rec.rubrique_4,
                  rec.rubrique_5,
                ].filter(Boolean).length;
                const percent = Math.round((validCount / 5) * 100);

                return (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Colonne Apprenant Sticky à gauche */}
                    <td className="py-3 px-4 sticky left-0 z-10 bg-[#0A192F] shadow-[4px_0_12px_rgba(0,0,0,0.4)]">
                      <div className="font-semibold text-white font-['Lexend'] truncate">
                        {student.prenom} {student.nom}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {student.equipe}
                      </div>
                    </td>

                    {/* Les 5 Cases à cocher interactives */}
                    {rubriquesHeaders.map((h) => {
                      const isChecked = !!rec[h.key];

                      return (
                        <td key={h.key} className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleToggleRubrique(student.id, h.key)}
                            className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                              isChecked
                                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                : 'bg-white/5 border border-white/15 text-transparent hover:border-emerald-400'
                            }`}
                            title={`Basculer ${h.label}`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </td>
                      );
                    })}

                    {/* Jauge de progression */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-mono text-xs font-bold ${
                          percent === 100 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {validCount}/5 ({percent}%)
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percent === 100 ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Sélecteur de statut sticky à droite */}
                    <td className="py-3 px-4 text-center sticky-actions-col">
                      <select
                        value={rec.statut_dp}
                        disabled={isPending}
                        onChange={(e) => handleChangeStatus(student.id, e.target.value as any)}
                        className={`px-2 py-1 rounded text-[11px] font-mono border focus:outline-none cursor-pointer ${
                          rec.statut_dp === 'valide_jury'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : rec.statut_dp === 'en_revue'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        <option value="brouillon">Brouillon</option>
                        <option value="en_revue">En revue</option>
                        <option value="valide_jury">Validé jury</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
