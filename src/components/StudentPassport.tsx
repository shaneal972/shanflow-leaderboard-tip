'use client';

import React from 'react';
import Link from 'next/link';
import { Apprenant, Badge, DPSuivi, Quiz, QuizSubmission } from '@/types/tip';
import { BadgeGrid } from './BadgeGrid';
import { 
  ArrowLeft, 
  Trophy, 
  CheckCircle2, 
  Circle, 
  User, 
  FileCheck2,
  Share2,
  BookOpen,
  Play,
  Lock,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface StudentPassportProps {
  apprenant: Apprenant;
  badges: Badge[];
  dpSuivi?: DPSuivi;
  quizzes?: (Quiz & { submission: QuizSubmission | null })[];
}

export const StudentPassport: React.FC<StudentPassportProps> = ({
  apprenant,
  badges,
  dpSuivi,
  quizzes = [],
}) => {
  const paliers = [
    { id: 'Palier 0', name: 'Palier 0 : Raccourcis & Hygiène', desc: 'RAN & Standards clavier', minPoints: 0 },
    { id: 'Palier 1', name: 'Palier 1 : Standard DSI & Parc', desc: 'Mise en page & Nettoyage Tableur', minPoints: 200 },
    { id: 'Palier 2', name: 'Palier 2 : Helpdesk Hero', desc: 'Dépannage Facturation & Quai REAC', minPoints: 400 },
    { id: 'Palier 3', name: 'Palier 3 : TIP Augmenté', desc: 'Prompt Engineering & Copilote IA', minPoints: 700 },
    { id: 'Palier 4', name: 'Palier 4 : NetOps & Automation', desc: 'Workflows n8n & Alertes Helpdesk', minPoints: 1000 },
  ];

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const totalPossiblePoints = badges.reduce((acc, b) => acc + b.points_requis, 0);
  const progressPercent = Math.min(100, Math.round((apprenant.points_total / totalPossiblePoints) * 100));

  // Nombre de rubriques DP validées
  const dpValidCount = dpSuivi 
    ? [dpSuivi.rubrique_1, dpSuivi.rubrique_2, dpSuivi.rubrique_3, dpSuivi.rubrique_4, dpSuivi.rubrique_5].filter(Boolean).length
    : 0;

  return (
    <div className="w-full space-y-6">
      
      {/* Barre de retour et partage */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au leaderboard promo</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('Lien du passeport copié dans le presse-papier !');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-teal-400" />
          <span>Copier le lien</span>
        </button>
      </div>

      {/* Carte d'identité Technicien TIP (Vue Privilégiée du Passeport) */}
      <div className="p-6 rounded-2xl slate-glass relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/30 p-1 shrink-0 flex items-center justify-center text-xl font-bold text-teal-400 shadow-xl">
              {apprenant.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={apprenant.avatar_url}
                  alt={`${apprenant.prenom} ${apprenant.nom}`}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-teal-400" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white font-['Lexend'] tracking-tight">
                  {apprenant.prenom} {apprenant.nom}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {apprenant.palier_actuel}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-white/5 border border-white/10">
                  {apprenant.equipe}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{apprenant.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 self-end md:self-auto border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <div>
              <p className="text-[11px] font-mono text-slate-400">Total KLF Points</p>
              <p className="text-3xl font-bold text-teal-400 font-['Lexend']">{apprenant.points_total}</p>
            </div>
            <div>
              <p className="text-[11px] font-mono text-slate-400">Progression globale</p>
              <p className="text-3xl font-bold text-white font-['Lexend']">{progressPercent}%</p>
            </div>
          </div>

        </div>

        {/* Barre de progression des points */}
        <div className="mt-6 space-y-1.5 relative z-10">
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>{apprenant.points_total} points acquis</span>
            <span>Objectif : {totalPossiblePoints} points</span>
          </div>
        </div>

      </div>

      {/* Module Évaluations & Quiz Interactifs KLF (Anti-Triche & Correction Différée) */}
      <div className="p-6 rounded-2xl slate-glass space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-400" />
            Évaluations & Quiz interactifs KLF
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Correction différée & Standards DSI Marc Verdier
          </span>
        </div>

        {quizzes.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
            Aucune session d&apos;évaluation programmée pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((q) => {
              const hasSub = !!q.submission;
              const isExamOpen = q.statut === 'session_ouverte';
              const isCorrected = q.statut === 'correction_publiee';
              const isClosed = q.statut === 'ferme';
              const scorePct = q.submission?.score_pourcentage ?? 0;
              const isValidated = q.submission?.is_validated ?? false;
              const rawScore20 = (scorePct / 100) * 20;
              const scoreSur20 = Number.isInteger(rawScore20) ? rawScore20.toString() : rawScore20.toFixed(1);

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isCorrected && isValidated
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : isCorrected && !isValidated
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : isExamOpen
                      ? 'bg-teal-500/5 border-teal-500/40 shadow-lg shadow-teal-500/5'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
                          {q.palier}
                        </span>
                        <span className="text-[11px] font-mono text-teal-400">
                          +{q.points_recompense} PTS
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white font-['Lexend'] leading-snug">
                        {q.titre}
                      </h3>
                    </div>

                    {/* Badge de Statut Dynamique */}
                    <div>
                      {!hasSub && isClosed && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-white/5 text-slate-400 border border-white/10 inline-flex items-center gap-1">
                          <Circle className="w-3 h-3 text-slate-500" /> Non commencé
                        </span>
                      )}

                      {!hasSub && isExamOpen && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1 animate-pulse">
                          <Play className="w-3 h-3 text-amber-400 fill-current" /> Épreuve ouverte
                        </span>
                      )}

                      {!hasSub && isCorrected && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-500/10 text-slate-400 border border-slate-500/30 inline-flex items-center gap-1">
                          Non composé
                        </span>
                      )}

                      {hasSub && !isCorrected && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/30 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sky-400" /> Copie scellée • En attente
                        </span>
                      )}

                      {hasSub && isCorrected && isValidated && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Validé ({scoreSur20}/20 - {scorePct}%)
                        </span>
                      )}

                      {hasSub && isCorrected && !isValidated && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-400" /> À rattraper ({scoreSur20}/20)
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {q.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <span className="text-[11px] font-mono text-slate-500">
                      Durée : {q.duree_minutes} min • Seuil : {q.seuil_validation}%
                    </span>

                    {/* Boutons d'Action selon le Statut */}
                    <div>
                      {!hasSub && isExamOpen && (
                        <Link
                          href={`/quiz/${q.id}?apprenantId=${apprenant.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 inline-flex items-center gap-1.5 transition-all"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Démarrer l&apos;épreuve</span>
                        </Link>
                      )}

                      {!hasSub && isClosed && (
                        <span className="text-xs font-mono text-slate-500 inline-flex items-center gap-1">
                          <Lock className="w-3 h-3" /> En attente de David
                        </span>
                      )}

                      {!hasSub && isCorrected && (
                        <Link
                          href={`/quiz/${q.id}?apprenantId=${apprenant.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                        >
                          Composer maintenant
                        </Link>
                      )}

                      {hasSub && !isCorrected && (
                        <Link
                          href={`/quiz/${q.id}?apprenantId=${apprenant.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
                        >
                          Voir salle d&apos;attente
                        </Link>
                      )}

                      {hasSub && isCorrected && (
                        <Link
                          href={`/quiz/${q.id}?apprenantId=${apprenant.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Voir le corrigé DSI</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Frise chronologique des 5 paliers KLF */}
      <div className="p-6 rounded-2xl slate-glass space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white font-['Lexend'] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Les 5 paliers de compétences TIP
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Référentiel REAC Ministère du Travail
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {paliers.map((p, idx) => {
            const isCompleted = apprenant.points_total >= p.minPoints;
            const isCurrent = apprenant.palier_actuel === p.id;

            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-teal-500/10 border-teal-400/40 teal-glow'
                    : isCompleted
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/[0.02] border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Étape 0{idx + 1}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-200 font-['Lexend'] mb-1">
                  {p.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {p.desc}
                </p>

                <div className="mt-3 text-[10px] font-mono text-slate-500">
                  Seuil : {p.minPoints} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Résumé du dossier professionnel (DP REAC) */}
      <div className="p-5 rounded-2xl slate-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white font-['Lexend']">
              Statut du dossier professionnel (fiche CCP 1)
            </h3>
            <p className="text-xs text-slate-400">
              {dpValidCount} sur 5 rubriques officielles Cerfa validées
            </p>
          </div>
        </div>

        <Link
          href="/dp"
          className="px-4 py-2 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
        >
          Ouvrir l&apos;auditeur DP
        </Link>
      </div>

      {/* Grille des badges KLF */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white font-['Lexend']">
            Armoire des trophées KLF ({unlockedBadges.length}/{badges.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Cliquez sur un badge validé pour célébrer
          </span>
        </div>

        <BadgeGrid badges={badges} />
      </div>

    </div>
  );
};
