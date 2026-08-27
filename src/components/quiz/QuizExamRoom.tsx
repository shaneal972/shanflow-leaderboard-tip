'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Quiz, 
  QuizQuestion, 
  QuizSubmission, 
  Apprenant 
} from '@/types/tip';
import { submitQuizAnswersAction } from '@/app/quiz/actions';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  RefreshCw, 
  User, 
  AlertCircle,
  HelpCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface QuizExamRoomProps {
  quiz: Quiz;
  questions: QuizQuestion[];
  students: Apprenant[];
  initialApprenantId?: string;
  initialSubmission?: QuizSubmission | null;
}

export const QuizExamRoom: React.FC<QuizExamRoomProps> = ({
  quiz,
  questions,
  students,
  initialApprenantId,
  initialSubmission,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Apprenant actif
  const [studentId, setStudentId] = useState<string>(() => {
    if (initialApprenantId) return initialApprenantId;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('klf_active_student_id') || '';
    }
    return '';
  });

  const activeStudent = students.find((s) => s.id === studentId);

  // Réponses saisies : { [question_id]: option_id }
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (initialSubmission?.reponses_choisies) {
      return initialSubmission.reponses_choisies;
    }
    return {};
  });

  // Navigation question par question ou mode liste
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Chronomètre dégressif
  const [timeLeft, setTimeLeft] = useState<number>((quiz.duree_minutes || 35) * 60);

  // Déterminer la phase
  // 'exam' | 'waiting' | 'revealed' | 'closed'
  const isRevealed = quiz.statut === 'correction_publiee';
  const hasSubmitted = !!initialSubmission;

  // Effet confettis si validé en mode correction
  useEffect(() => {
    if (isRevealed && initialSubmission?.is_validated) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2dd4bf', '#fbbf24', '#38bdf8', '#34d399']
      });
    }
  }, [isRevealed, initialSubmission?.is_validated]);

  // Sauvegarde apprenant dans localStorage
  const handleStudentSelect = (id: string) => {
    setStudentId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('klf_active_student_id', id);
    }
    router.replace(`/quiz/${quiz.id}?apprenantId=${id}`);
  };

  // Timer
  useEffect(() => {
    if (quiz.statut !== 'session_ouverte' || hasSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz.statut, hasSubmitted]);

  // Polling automatique si en attente
  useEffect(() => {
    if (hasSubmitted && quiz.statut === 'session_ouverte') {
      const poll = setInterval(() => {
        router.refresh();
      }, 7000);
      return () => clearInterval(poll);
    }
  }, [hasSubmitted, quiz.statut, router]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (hasSubmitted || quiz.statut !== 'session_ouverte') return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitAnswers = () => {
    if (!studentId) {
      setErrorMessage("Veuillez sélectionner votre nom d'apprenant avant de soumettre.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await submitQuizAnswersAction({
        apprenantId: studentId,
        quizId: quiz.id,
        answers,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Erreur lors de la remise de votre copie.');
        setShowConfirmModal(false);
      } else {
        setShowConfirmModal(false);
        router.refresh();
      }
    });
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const currentQuestion = questions[currentIndex];

  /* --------------------------------------------------------------------------
     CAS 1 : ÉPREUVE FERMÉE (Et l'apprenant n'a pas composé)
     -------------------------------------------------------------------------- */
  if (quiz.statut === 'ferme' && !hasSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white font-['Lexend']">Épreuve non disponible</h1>
          <p className="text-sm text-slate-400">
            Cette session d&apos;évaluation est actuellement fermée par David. Veuillez attendre l&apos;ouverture officielle de l&apos;épreuve en classe.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 border border-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au classement</span>
        </Link>
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     CAS 2 : SALLE D'ATTENTE SÉCURISÉE (Copie scellée, en attente de David)
     -------------------------------------------------------------------------- */
  if (hasSubmitted && quiz.statut === 'session_ouverte') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="p-8 rounded-3xl slate-glass border border-teal-500/30 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xl animate-pulse">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              Copie scellée & Horodatée
            </span>
            <h1 className="text-2xl font-bold text-white font-['Lexend'] tracking-tight">
              Copie enregistrée avec succès !
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              🔒 En attente de la clôture de la session par David. Vos résultats et le corrigé détaillé seront débloqués simultanément pour toute la classe.
            </p>
          </div>

          {activeStudent && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-teal-300 text-xs">
                {activeStudent.prenom[0]}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-white">{activeStudent.prenom} {activeStudent.nom}</p>
                <p className="text-slate-400 font-mono">Remis à {new Date(initialSubmission.submitted_at).toLocaleTimeString('fr-FR')}</p>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Vérifier si David a publié</span>
            </button>
            {activeStudent && (
              <Link
                href={`/passport/${activeStudent.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono transition-all"
              >
                <span>Aller sur mon passeport</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     CAS 3 : RÉVÉLATION DU CORRIGÉ (Statut = correction_publiee)
     -------------------------------------------------------------------------- */
  if (isRevealed && hasSubmitted) {
    const scorePourcentage = initialSubmission?.score_pourcentage ?? 0;
    const isValidated = initialSubmission?.is_validated ?? false;
    const rawScore20 = (scorePourcentage / 100) * 20;
    const scoreSur20 = Number.isInteger(rawScore20) ? rawScore20.toString() : rawScore20.toFixed(1);

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          <Link
            href={activeStudent ? `/passport/${activeStudent.id}` : '/'}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-teal-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au passeport</span>
          </Link>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Corrigé officiel DSI publié</span>
          </span>
        </div>

        {/* Bilan du Score & Félicitations */}
        <div className={`p-8 rounded-3xl slate-glass border relative overflow-hidden ${
          isValidated ? 'border-emerald-500/30' : 'border-amber-500/30'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className={`min-w-[6.5rem] px-4 py-3.5 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-2xl border ${
                isValidated
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              }`}>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black font-['Lexend'] tracking-tight">
                    {scoreSur20}
                  </span>
                  <span className="text-sm font-mono font-bold opacity-75">
                    /20
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider opacity-60 mt-0.5">
                  Note finale
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white font-['Lexend'] tracking-tight">
                    {isValidated ? 'Épreuve validée avec succès !' : 'Épreuve à rattraper'}
                  </h1>
                  {isValidated && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      +{quiz.points_recompense} PTS
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {quiz.titre} • Seuil de validation : {quiz.seuil_validation}%
                </p>
                <p className="text-xs font-mono text-teal-400">
                  Score final : {scorePourcentage}% ({initialSubmission.score_obtenu} questions réussies sur {questions.length})
                </p>
              </div>
            </div>

            {isValidated && (
              <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-emerald-300">Badge KLF débloqué</p>
                  <p className="text-slate-400">Points crédités au leaderboard promo</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revue Détaillée Question par Question */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold text-white font-['Lexend']">
              Revue didactique & Corrigé question par question
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {questions.length} questions analysées
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q) => {
              const chosenOptionId = initialSubmission.reponses_choisies?.[q.id];
              const correctOption = q.options.find((o) => o.is_correct);
              const isQuestionSuccess = chosenOptionId === correctOption?.id;
              const chosenOption = q.options.find((o) => o.id === chosenOptionId);

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isQuestionSuccess
                      ? 'bg-emerald-950/10 border-emerald-500/30'
                      : 'bg-rose-950/10 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
                        Q{q.ordre}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20">
                        {q.theme}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold">
                      {isQuestionSuccess ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct (+{q.points} pt)
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Erreur (0 pt)
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white mb-4 leading-relaxed">
                    {q.enonce}
                  </p>

                  {/* Options de réponse */}
                  <div className="space-y-2 mb-5">
                    {q.options.map((opt) => {
                      const isChosen = opt.id === chosenOptionId;
                      const isOptCorrect = opt.is_correct;

                      let optStyle = 'border-white/5 bg-white/[0.02] text-slate-400';
                      if (isOptCorrect) {
                        optStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 font-medium shadow-sm';
                      } else if (isChosen && !isOptCorrect) {
                        optStyle = 'border-rose-500/50 bg-rose-500/10 text-rose-200 line-through';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${optStyle}`}
                        >
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                            isOptCorrect
                              ? 'bg-emerald-500 text-slate-950'
                              : isChosen
                              ? 'bg-rose-500 text-white'
                              : 'bg-white/10 text-slate-400'
                          }`}>
                            {opt.lettre}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt.texte}</span>
                          {isOptCorrect && (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider shrink-0">
                              Bonne réponse
                            </span>
                          )}
                          {isChosen && !isOptCorrect && (
                            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider shrink-0">
                              Votre choix
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Encart Didactique : L'œil du DSI Marc Verdier */}
                  {correctOption?.dsi_explanation && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-xs">
                      <div className="flex items-center gap-2 mb-1.5 text-amber-300 font-semibold font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>💡 L&apos;œil du DSI Marc Verdier (Réalité KLF Jarry)</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans pl-5 border-l border-amber-500/30">
                        {correctOption.dsi_explanation}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  /* --------------------------------------------------------------------------
     CAS 4 : PHASE D'ÉPREUVE EN COURS (Accès ouvert, apprenant compose)
     -------------------------------------------------------------------------- */
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Barre supérieure : Identité apprenant, Titre, Chrono */}
      <div className="p-4 rounded-2xl slate-glass border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Sélecteur Apprenant si non défini */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-teal-400">
            {activeStudent ? activeStudent.prenom[0] : <User className="w-5 h-5" />}
          </div>
          <div>
            {students.length > 0 ? (
              <select
                value={studentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-teal-500 outline-none"
              >
                <option value="">-- Sélectionnez votre nom --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.prenom} {st.nom} ({st.equipe})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-400">Session ouverte</p>
            )}
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {quiz.titre}
            </p>
          </div>
        </div>

        {/* Chrono et avancement */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <Clock className={`w-3.5 h-3.5 ${timeLeft < 300 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={timeLeft < 300 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
              {formatTimer(timeLeft)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={answeredCount === 0 || !studentId}
            className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Remettre ma copie
          </button>
        </div>
      </div>

      {/* Barre de Progression Globale */}
      <div className="p-4 rounded-2xl slate-glass border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Question {currentIndex + 1} sur {totalQuestions}</span>
          <span className="text-teal-400">{answeredCount} répondu(es) ({progressPercent}%)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Puces de questions cliquables */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono transition-all ${
                  isCurrent
                    ? 'ring-2 ring-teal-400 bg-teal-500/20 text-white font-bold'
                    : isAnswered
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Message d'erreur éventuel */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Carte de la Question Active */}
      {currentQuestion && (
        <div className="p-6 md:p-8 rounded-3xl slate-glass border border-white/10 space-y-6 relative">
          
          <div className="flex items-center justify-between gap-4">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {currentQuestion.theme}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Valeur : {currentQuestion.points} point(s)
            </span>
          </div>

          <h2 className="text-base md:text-lg font-semibold text-white leading-relaxed">
            {currentQuestion.enonce}
          </h2>

          {/* Options de réponse interactives */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs md:text-sm flex items-start gap-4 transition-all ${
                    isSelected
                      ? 'bg-teal-500/15 border-teal-500/60 text-white shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/50'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 text-slate-300'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-all ${
                    isSelected
                      ? 'bg-teal-400 text-slate-950 shadow-md'
                      : 'bg-white/10 text-slate-400'
                  }`}>
                    {opt.lettre}
                  </span>
                  <span className="flex-1 leading-relaxed pt-0.5">{opt.texte}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Précédent / Suivant */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédente</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-xs font-mono text-teal-300 border border-teal-500/30 transition-colors"
              >
                <span>Suivante</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                <span>Terminer et valider</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modale de Confirmation de remise de copie */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl slate-glass border border-teal-500/30 space-y-5 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-['Lexend']">
                Confirmer la remise définitive ?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vous avez répondu à <strong className="text-teal-400">{answeredCount}</strong> questions sur <strong className="text-white">{totalQuestions}</strong>.
                {answeredCount < totalQuestions && (
                  <span className="block text-amber-400 font-semibold mt-1">
                    ⚠️ Attention : {totalQuestions - answeredCount} question(s) sans réponse !
                  </span>
                )}
                Une fois scellée, votre copie ne pourra plus être modifiée.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 border border-white/10"
              >
                Continuer à relire
              </button>
              <button
                type="button"
                onClick={handleSubmitAnswers}
                disabled={isPending}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                {isPending ? 'Enregistrement...' : 'Confirmer & Sceller ma copie'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
