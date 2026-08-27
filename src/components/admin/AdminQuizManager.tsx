'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  QuizWithStats, 
  QuizSubmission, 
  Apprenant 
} from '@/types/tip';
import { 
  updateQuizStatusAction, 
  publishQuizCorrectionAction, 
  resetStudentQuizAttemptAction,
  importQuizJsonAction 
} from '@/app/admin/actions';
import { 
  BookOpen, 
  Play, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Upload, 
  User, 
  Sparkles, 
  ChevronRight, 
  Award,
  Users,
  RotateCcw,
  Eye,
  FileCode,
  Check,
  X,
  Shield,
  ShieldAlert,
  Ban
} from 'lucide-react';

interface AdminQuizManagerProps {
  quizzes: QuizWithStats[];
  students: Apprenant[];
}

export const AdminQuizManager: React.FC<AdminQuizManagerProps> = ({
  quizzes: initialQuizzes,
  students,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedQuizId, setSelectedQuizId] = useState<string>(
    initialQuizzes[0]?.id || ''
  );

  // État de confirmation pour clôture & publication
  const [confirmPublishQuizId, setConfirmPublishQuizId] = useState<string | null>(null);

  // Modale d'import JSON
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Message d'alerte / succès
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeQuiz = initialQuizzes.find((q) => q.id === selectedQuizId) || initialQuizzes[0];

  const handleUpdateStatus = (quizId: string, newStatus: 'ferme' | 'session_ouverte' | 'correction_publiee') => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateQuizStatusAction(quizId, newStatus);
      if (res.success) {
        setFeedback({ type: 'success', message: `Statut de l'épreuve mis à jour : ${newStatus}` });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erreur de mise à jour.' });
      }
    });
  };

  const handlePublishCorrection = (quizId: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await publishQuizCorrectionAction(quizId);
      setConfirmPublishQuizId(null);
      if (res.success) {
        setFeedback({ 
          type: 'success', 
          message: `📢 Épreuve clôturée ! ${res.countEvaluated || 0} copie(s) évaluée(s), scores et badges crédités.` 
        });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erreur lors de la publication.' });
      }
    });
  };

  const handleResetStudent = (quizId: string, studentId: string, studentName: string) => {
    if (!confirm(`Confirmer la réinitialisation de la tentative pour ${studentName} ? Sa copie actuelle sera supprimée pour lui permettre de recommencer.`)) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await resetStudentQuizAttemptAction(quizId, studentId);
      if (res.success) {
        setFeedback({ type: 'success', message: `Tentative de ${studentName} réinitialisée.` });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erreur serveur.' });
      }
    });
  };

  const handleImportJson = () => {
    if (!jsonInput.trim()) return;
    setImportStatus(null);
    startTransition(async () => {
      const res = await importQuizJsonAction(jsonInput);
      if (res.success) {
        setImportStatus({ success: true, message: `✅ Quiz importé avec succès (${res.count} questions) !` });
        setJsonInput('');
        setTimeout(() => {
          setShowJsonModal(false);
          setImportStatus(null);
          router.refresh();
        }, 1500);
      } else {
        setImportStatus({ success: false, message: res.error || "Erreur lors de l'import." });
      }
    });
  };

  // Calculs d'avancement pour le quiz actif
  const totalStudents = students.filter(s => !s.is_admin).length;
  const submissionsCount = activeQuiz?.total_submissions || 0;
  const progressPercent = totalStudents > 0 ? Math.round((submissionsCount / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* En-tête du cockpit d'évaluation */}
      <div className="p-6 rounded-2xl slate-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Module Évaluation TIP
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Promotion C26031A • Jarry
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Lexend'] tracking-tight">
            Cockpit Formateur : Quiz & Anti-Triche KLF
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Pilotez le cycle d&apos;épreuve en 3 phases : ouverture de session, supervision des copies en direct, et révélation collective des corrigés DSI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowJsonModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-teal-400" />
            <span>Importer un quiz JSON</span>
          </button>
          
          <button
            type="button"
            onClick={() => router.refresh()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin text-teal-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Message de notification */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between gap-3 border ${
          feedback.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sélecteur de Quiz / Grille des Épreuves */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialQuizzes.map((q) => {
          const isSelected = q.id === activeQuiz?.id;
          const isOpen = q.statut === 'session_ouverte';
          const isCorrected = q.statut === 'correction_publiee';

          return (
            <div
              key={q.id}
              onClick={() => setSelectedQuizId(q.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                isSelected
                  ? 'bg-teal-500/10 border-teal-500/50 teal-glow'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
                  {q.palier}
                </span>

                {/* Badge de Statut */}
                {isOpen && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1 animate-pulse">
                    <Play className="w-2.5 h-2.5 fill-current" /> Session ouverte
                  </span>
                )}
                {isCorrected && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Corrigé publié
                  </span>
                )}
                {q.statut === 'ferme' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/20 inline-flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Épreuve fermée
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-['Lexend'] leading-snug">
                  {q.titre}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  {q.questions_count || 20} questions • +{q.points_recompense} PTS
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{q.total_submissions || 0} copie(s)</span>
                {q.average_score ? (
                  <span className="text-teal-400 font-bold">Moy. : {q.average_score}%</span>
                ) : (
                  <span>Seuil : {q.seuil_validation}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Panneau de Pilotage de l'Épreuve Sélectionnée */}
      {activeQuiz && (
        <div className="p-6 md:p-8 rounded-3xl slate-glass border border-white/10 space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {activeQuiz.palier}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Durée : {activeQuiz.duree_minutes} min • Seuil : {activeQuiz.seuil_validation}%
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white font-['Lexend']">
                {activeQuiz.titre}
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                {activeQuiz.description}
              </p>
            </div>

            {/* Boutons d'Action Stratégiques Formateur */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/quiz/${activeQuiz.id}`}
                target="_blank"
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono inline-flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Tester la vue élève</span>
              </Link>

              {activeQuiz.statut === 'ferme' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeQuiz.id, 'session_ouverte')}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>🟢 Ouvrir la session d&apos;examen</span>
                </button>
              )}

              {activeQuiz.statut === 'session_ouverte' && (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmPublishQuizId(activeQuiz.id)}
                    disabled={isPending}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 text-xs font-mono font-bold inline-flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>📢 Clôturer l&apos;épreuve & Publier la correction pour tous</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeQuiz.id, 'ferme')}
                    disabled={isPending}
                    className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 text-xs font-mono transition-colors"
                  >
                    Suspendre
                  </button>
                </>
              )}

              {activeQuiz.statut === 'correction_publiee' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeQuiz.id, 'session_ouverte')}
                  disabled={isPending}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono inline-flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rouvrir la session</span>
                </button>
              )}
            </div>
          </div>

          {/* Supervision en Direct de la Classe : Jauge & Statistiques */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <span className="text-white font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                Avancement de la classe : <strong className="text-teal-300">{submissionsCount}</strong> / {totalStudents} apprenants ont remis leur copie
              </span>
              <span className="text-teal-400 font-bold">{progressPercent}% terminé</span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Liste des Apprenants & Statut de leur copie */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white font-['Lexend'] flex items-center gap-2">
              <span>Supervision individuelle des apprenants</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {students.filter(s => !s.is_admin).map((st) => {
                // Vérifier si cet apprenant a soumis
                const submission = activeQuiz.submissions?.find(s => s.apprenant_id === st.id);
                const hasSub = !!submission;

                return (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-bold text-teal-400 text-xs shrink-0">
                        {st.prenom[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{st.prenom} {st.nom}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{st.equipe}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {hasSub ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            {submission?.closed_for_cheating ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                <Ban className="w-3 h-3 text-rose-400" />
                                Clôturé (Triche)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" />
                                {activeQuiz.statut === 'correction_publiee'
                                  ? `${submission?.score_pourcentage}%`
                                  : 'Rendu'}
                              </span>
                            )}
                          </div>

                          {/* Indicateur de Sécurité & Infractions Sentinel Lock */}
                          <div className="text-right">
                            {submission?.closed_for_cheating ? (
                              <span className="text-[10px] font-mono text-rose-400 font-bold block">
                                🔴 3 infractions (Auto-scellé)
                              </span>
                            ) : (submission?.infractions_count || 0) >= 2 ? (
                              <span 
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1 cursor-help"
                                title={submission?.infractions_log?.map(l => `${new Date(l.timestamp).toLocaleTimeString('fr-FR')}: ${l.type}`).join('\n') || '2 sorties constatées'}
                              >
                                <ShieldAlert className="w-3 h-3 text-rose-400" />
                                🔴 {submission?.infractions_count} sorties (Suspicion)
                              </span>
                            ) : (submission?.infractions_count || 0) === 1 ? (
                              <span 
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 cursor-help"
                                title={submission?.infractions_log?.map(l => `${new Date(l.timestamp).toLocaleTimeString('fr-FR')}: ${l.type}`).join('\n') || '1 sortie constatée'}
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                🟡 1 sortie (Averti)
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-teal-500/5 text-teal-400 border border-teal-500/20 flex items-center gap-1">
                                <Shield className="w-3 h-3 text-teal-400" />
                                🟢 0 sortie (Verrouillé)
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleResetStudent(activeQuiz.id, st.id, `${st.prenom} ${st.nom}`)}
                            title="Réinitialiser la copie et effacer les infractions"
                            className="text-[10px] font-mono text-slate-500 hover:text-rose-400 underline mt-0.5"
                          >
                            Rattrapage
                          </button>
                        </>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" /> En cours
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Modale de Confirmation de Clôture & Publication */}
      {confirmPublishQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl slate-glass border border-teal-500/30 space-y-5 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-['Lexend']">
                Clôturer l&apos;épreuve & Publier le corrigé ?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cette action va instantanément :
              </p>
              <ul className="text-xs text-slate-400 space-y-1 text-left list-disc list-inside bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <li>Calculer les scores réels de toutes les copies remises.</li>
                <li>Débloquer le corrigé didactique complet avec l&apos;œil du DSI.</li>
                <li>Créditer les <strong>+{activeQuiz.points_recompense} points</strong> aux élèves ayant atteint le seuil de {activeQuiz.seuil_validation}%.</li>
                <li>Débloquer le badge KLF officiel sur leur passeport.</li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPublishQuizId(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 border border-white/10"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handlePublishCorrection(confirmPublishQuizId)}
                disabled={isPending}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                {isPending ? 'Publication en cours...' : 'Confirmer & Publier pour tous'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'Import JSON 1-Clic */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl p-6 rounded-3xl slate-glass border border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white font-['Lexend']">
                  Importer un quiz (Format JSON)
                </h3>
              </div>
              <button onClick={() => setShowJsonModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Collez la structure JSON du quiz (champs attendus : <code>title</code>, <code>palier</code>, <code>questions: [&#123; question, options, correct, feedback &#125;]</code>).
            </p>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{\n  "title": "Quiz Palier 1 : Standard DSI KLF",\n  "palier": "Palier 1",\n  "seuil_validation": 75,\n  "points_recompense": 200,\n  "questions": [\n    {\n      "question": "Énoncé...",\n      "options": ["Option A", "Option B", "Option C"],\n      "correct": 0,\n      "feedback": "Explication..."\n    }\n  ]\n}`}
              rows={12}
              className="w-full p-4 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-200 focus:border-teal-500 outline-none resize-none leading-relaxed"
            />

            {importStatus && (
              <div className={`p-3 rounded-xl text-xs font-mono ${
                importStatus.success ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
              }`}>
                {importStatus.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleImportJson}
                disabled={isPending || !jsonInput.trim()}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                {isPending ? 'Importation...' : 'Créer et injecter le quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
