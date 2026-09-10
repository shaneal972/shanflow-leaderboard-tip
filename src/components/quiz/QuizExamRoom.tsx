'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Quiz, 
  QuizQuestion, 
  QuizSubmission, 
  Apprenant 
} from '@/types/tip';
import { submitQuizAnswersAction, logQuizInfractionAction } from '@/app/quiz/actions';
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
  ShieldAlert,
  Shield,
  Monitor,
  Maximize2,
  AlertTriangle,
  Ban,
  EyeOff
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

  // Apprenant actif (100% déterministe en SSR pour éradiquer tout Hydration Mismatch)
  const [studentId, setStudentId] = useState<string>(initialApprenantId || '');

  // Synchronisation avec localStorage UNIQUEMENT après le montage client effectif
  useEffect(() => {
    if (!initialApprenantId) {
      const saved = localStorage.getItem('klf_active_student_id');
      if (saved) {
        setStudentId(saved);
      }
    }
  }, [initialApprenantId]);

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

  /* ==========================================================================
     BOUCLIER ANTI-TRICHE KLF SENTINEL LOCK
     ========================================================================== */
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Compteur d'infractions & Alerte
  const [infractionsCount, setInfractionsCount] = useState<number>(() => {
    return initialSubmission?.infractions_count || 0;
  });
  const [currentAlertInfraction, setCurrentAlertInfraction] = useState<{
    count: number;
    timestamp: string;
  } | null>(null);
  const [isClosedForCheating, setIsClosedForCheating] = useState<boolean>(() => {
    return !!initialSubmission?.closed_for_cheating;
  });
  const lastInfractionTimeRef = useRef<number>(0);

  // 1. Gestion du plein écran (Fullscreen API)
  const handleEnterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      }
      setHasEnteredFullscreen(true);
      setIsFullscreen(true);
    } catch (err) {
      console.warn("Plein écran refusé ou non supporté:", err);
      // Autoriser quand même pour ne pas bloquer les navigateurs stricts
      setHasEnteredFullscreen(true);
      setIsFullscreen(true);
    }
  };

  // Écoute continue de fullscreenchange
  useEffect(() => {
    const onFullscreenChange = () => {
      const inFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(inFs);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  // 2. Détection changement d'onglet & perte de focus (Page Visibility & Blur)
  useEffect(() => {
    if (quiz.statut !== 'session_ouverte' || hasSubmitted || !hasEnteredFullscreen || isClosedForCheating) {
      return;
    }

    const triggerInfraction = async (reason: string) => {
      const now = Date.now();
      // Anti-rebond : au moins 2.5 secondes entre 2 détections pour ne pas doubler blur + visibilitychange
      if (now - lastInfractionTimeRef.current < 2500) {
        return;
      }
      lastInfractionTimeRef.current = now;

      const timeString = new Date().toLocaleTimeString('fr-FR');
      const nextCount = infractionsCount + 1;
      setInfractionsCount(nextCount);

      if (nextCount < 3) {
        setCurrentAlertInfraction({
          count: nextCount,
          timestamp: timeString,
        });

        // Journalisation BDD en direct pour David
        if (studentId) {
          await logQuizInfractionAction({
            quizId: quiz.id,
            apprenantId: studentId,
            infractionType: reason,
            timestamp: new Date().toISOString(),
            currentAnswers: answers,
          });
        }
      } else {
        // 3ème infraction : Auto-clôture punitive immédiate
        setIsClosedForCheating(true);
        if (studentId) {
          await logQuizInfractionAction({
            quizId: quiz.id,
            apprenantId: studentId,
            infractionType: `${reason} - 3ᵉ avertissement : Copie clôturée d'office`,
            timestamp: new Date().toISOString(),
            currentAnswers: answers,
          });
        }
        router.refresh();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerInfraction("Changement d'onglet détecté (Page Visibility API)");
      }
    };

    const handleBlur = () => {
      triggerInfraction("Perte de focus de la fenêtre d'examen (Window Blur)");
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [quiz.statut, hasSubmitted, hasEnteredFullscreen, isClosedForCheating, infractionsCount, studentId, quiz.id, answers, router]);

  // 3. Neutralisation des raccourcis clavier suspects (Ctrl+C, Ctrl+V, Ctrl+U, F12, DevTools)
  useEffect(() => {
    if (quiz.statut !== 'session_ouverte' || hasSubmitted || !hasEnteredFullscreen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlC = (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C');
      const isCtrlV = (e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V');
      const isCtrlU = (e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U');
      const isDevTools = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'i' || e.key === 'I');
      const isF12 = e.key === 'F12';

      if (isCtrlC || isCtrlV || isCtrlU || isDevTools || isF12) {
        e.preventDefault();
        e.stopPropagation();
        setErrorMessage("Action bloquée : Le copier-coller et l'inspection de code sont neutralisés par KLF Sentinel Lock.");
        setTimeout(() => setErrorMessage(null), 3500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [quiz.statut, hasSubmitted, hasEnteredFullscreen]);

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
    if (quiz.statut !== 'session_ouverte' || hasSubmitted || isClosedForCheating) return;
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
  }, [quiz.statut, hasSubmitted, isClosedForCheating]);

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
    if (hasSubmitted || quiz.statut !== 'session_ouverte' || isClosedForCheating) return;
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
     CAS 0 : COPIE CLÔTURÉE POUR TRICHE (3 infractions constatées)
     -------------------------------------------------------------------------- */
  if (isClosedForCheating || initialSubmission?.closed_for_cheating) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="p-8 rounded-3xl slate-glass border border-rose-500/50 text-center space-y-6 relative overflow-hidden shadow-2xl bg-rose-950/20">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl animate-bounce">
            <Ban className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              ⛔ Protocole KLF Sentinel Lock : épreuve interrompue
            </span>
            <h1 className="text-2xl font-bold text-white font-['Lexend'] tracking-tight">
              Copie clôturée pour infractions répétées
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              Votre copie a été automatiquement verrouillée et scellée suite à <strong>3 sorties d&apos;examen non autorisées</strong> (changement d&apos;onglet ou perte de focus).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/30 text-left text-xs font-mono space-y-2 text-slate-300">
            <p className="text-rose-400 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Rapport d&apos;incident transmis à David :
            </p>
            <p>• Sanction : Note conservatoire de 0/20 (0 point attribué)</p>
            <p>• Motif : Non-respect des règles de composition du centre de formation</p>
            <p>• Statut : Entretien obligatoire avec le formateur référent</p>
          </div>

          {activeStudent && (
            <div className="pt-2">
              <Link
                href={`/passport/${activeStudent.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono transition-all"
              >
                <span>Retourner sur mon passeport</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

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
              Copie scellée & horodatée
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
                <p className="text-slate-400 font-mono" suppressHydrationWarning>Remis à {new Date(initialSubmission.submitted_at).toLocaleTimeString('fr-FR')}</p>
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
     CAS 4A : SAS D'ACCUEIL PLEIN ÉCRAN OBLIGATOIRE (SENTINEL LOCK)
     -------------------------------------------------------------------------- */
  if (!hasEnteredFullscreen) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <div className="p-8 rounded-3xl slate-glass border border-teal-500/30 space-y-6 text-center shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xl">
            <Shield className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              Protocole d&apos;examen haute sécurité : KLF Sentinel Lock
            </span>
            <h1 className="text-2xl font-bold text-white font-['Lexend']">
              {quiz.titre}
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
              Pour garantir l&apos;équité de la promotion et le respect des normes d&apos;évaluation, cette épreuve fonctionne sous surveillance active.
            </p>
          </div>

          {/* Sélecteur apprenant dans le sas */}
          <div className="max-w-xs mx-auto p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-left">
            <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
              Confirmez votre identité d&apos;apprenant :
            </label>
            <select
              value={studentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-teal-500 outline-none"
            >
              <option value="">-- Sélectionnez votre nom --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.prenom} {st.nom} ({st.equipe})
                </option>
              ))}
            </select>
          </div>

          {/* Règles de sécurité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left text-xs text-slate-300 max-w-xl mx-auto">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <Monitor className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Mode plein écran exclusif :</strong> Vous devez composer en plein écran continu.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <EyeOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Surveillance d&apos;onglets :</strong> 3 sorties d&apos;épreuve = clôture automatique immédiate.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <Ban className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span><strong>Anti Copier-Coller :</strong> Clic droit, sélection et raccourcis d&apos;inspection neutralisés.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span><strong>Journal en direct :</strong> Toute anomalie est transmise instantanément à David.</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleEnterFullscreen}
              disabled={!studentId}
              className="px-6 py-3.5 rounded-2xl text-xs font-mono font-bold bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 shadow-xl shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>🖥️ Activer le mode examen plein écran pour composer</span>
            </button>
            {!studentId && (
              <p className="text-[11px] text-amber-400 font-mono mt-2">
                Veuillez sélectionner votre nom avant d&apos;activer le mode examen.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     CAS 4B : SALLE D'ÉPREUVE ACTIVE SOUS SENTINEL LOCK
     -------------------------------------------------------------------------- */
  return (
    <div 
      className="max-w-4xl mx-auto py-6 px-4 space-y-6 select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    >
      
      {/* ⚠️ OVERLAY ROUGE BLOQUANT SI SORTIE DU PLEIN ÉCRAN */}
      {!isFullscreen && (
        <div className="fixed inset-0 z-50 bg-rose-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-white font-['Lexend']">
              ⚠️ Plein écran désactivé !
            </h2>
            <p className="text-xs text-rose-200 leading-relaxed">
              Le protocole <strong>KLF Sentinel Lock</strong> exige le maintien strict du plein écran pendant toute l&apos;épreuve. Veuillez le réactiver immédiatement pour poursuivre votre composition.
            </p>
          </div>
          <button
            type="button"
            onClick={handleEnterFullscreen}
            className="px-6 py-3 rounded-xl bg-white text-slate-950 font-mono font-bold text-xs hover:bg-slate-200 transition-all shadow-xl inline-flex items-center gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            <span>🖥️ Réactiver le plein écran</span>
          </button>
        </div>
      )}

      {/* 🚨 MODALE D'ALERTE ROUGE CRITIQUE (Infraction 1/3 ou 2/3) */}
      {currentAlertInfraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-rose-950/90 border border-rose-500 text-center space-y-5 shadow-2xl animate-pulse">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/30 text-rose-200 border border-rose-500/50">
                Avertissement de Sécurité
              </span>
              <h3 className="text-lg font-bold text-white font-['Lexend']">
                🚨 ALERTE ANTI-TRICHE (Infraction {currentAlertInfraction.count}/3)
              </h3>
              <p className="text-xs text-rose-200 leading-relaxed">
                Sortie de l&apos;épreuve détectée à <strong className="text-white font-mono">{currentAlertInfraction.timestamp}</strong> !
              </p>
              <p className="text-xs text-rose-300/80 leading-relaxed">
                Cet événement a été transmis en temps réel au tableau de bord de David. À la <strong>3ᵉ infraction</strong>, votre copie sera automatiquement verrouillée avec une note de 0/20.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentAlertInfraction(null)}
              className="w-full py-2.5 rounded-xl bg-white text-slate-950 font-mono font-bold text-xs hover:bg-slate-200 transition-all shadow-lg"
            >
              J&apos;ai compris, je retourne à mon épreuve
            </button>
          </div>
        </div>
      )}

      {/* Barre supérieure : Identité apprenant, Titre, Chrono & Sentinel Badge */}
      <div className="p-4 rounded-2xl slate-glass border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Identité élève */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-teal-400">
            {activeStudent ? activeStudent.prenom[0] : <User className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-bold text-white font-['Lexend']">
              {activeStudent ? `${activeStudent.prenom} ${activeStudent.nom}` : 'Épreuve KLF'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                <Shield className="w-3 h-3" /> Sentinel Lock actif
              </span>
              {infractionsCount > 0 && (
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  • {infractionsCount}/3 avertissement(s)
                </span>
              )}
            </div>
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
