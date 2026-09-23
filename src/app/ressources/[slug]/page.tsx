'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { getRessourceBySlug } from '@/data/ressourcesData';
import {
  BookOpen,
  FileSpreadsheet,
  FileText,
  Presentation,
  Mail,
  Clock,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export default function RessourceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const ressource = getRessourceBySlug(slug);
  if (!ressource) {
    notFound();
  }

  // État local d'assimilation (+15 pts gamification)
  const [isAssimilated, setIsAssimilated] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const isSheets = ressource.outil === 'sheets';
  const isDocs = ressource.outil === 'docs';
  const isSlides = ressource.outil === 'slides';

  const ToolIcon = isSheets
    ? FileSpreadsheet
    : isDocs
    ? FileText
    : isSlides
    ? Presentation
    : Mail;

  const toolColor = isSheets
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    : isDocs
    ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
    : isSlides
    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  const handleSelectQuizOption = (questionIdx: number, optionIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const res = await fetch(`/api/ressources/export-pdf?slug=${slug}`);
      if (!res.ok) throw new Error('Erreur lors du téléchargement');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FICHE_MEMO_DSI_${slug.toUpperCase()}_KLF.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erreur export PDF mémo:', e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Fil d'Ariane & Retour */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link
          href="/ressources"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au catalogue des ressources</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer disabled:opacity-50"
            title="Télécharger la fiche mémo 1-page A4 Gotenberg pour votre classeur de stage"
          >
            {isDownloadingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-teal-400" />
            )}
            <span>Mémo PDF A4 (1 page)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAssimilated(true)}
            disabled={isAssimilated}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isAssimilated
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md shadow-teal-950/30'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isAssimilated ? 'Guide assimilé (+15 pts) !' : 'Marquer comme assimilé (+15 pts)'}</span>
          </button>
        </div>
      </div>

      {/* En-tête de la fiche */}
      <div className="p-6 sm:p-8 rounded-3xl slate-glass border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${toolColor}`}>
            <ToolIcon className="w-4 h-4" />
            <span>{isSheets ? 'Google Sheets & Excel' : isDocs ? 'Google Docs & Word' : isSlides ? 'Google Slides' : 'Gmail'}</span>
          </span>

          <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-slate-300">
            {ressource.palier}
          </span>

          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 ml-auto">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{ressource.tempsLecture} de lecture approfondie</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Lexend'] tracking-tight">
          {ressource.titre}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          {ressource.resume}
        </p>

        {ressource.ticketAssocieId && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Ce tutoriel résout directement l'incident <strong>{ressource.ticketAssocieId}</strong> du catalogue Helpdesk.
              </span>
            </div>
            <Link
              href="/tickets"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
            >
              <span>Voir le ticket</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Fichier d'exercice pratique à télécharger pour l'atelier */}
        {ressource.fichierExerciceUrl && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/20 via-sky-500/15 to-transparent border border-teal-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-teal-950/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Fichier d'exercice pour l'atelier en direct
                </div>
                <p className="text-xs text-slate-300">
                  Téléchargez <strong>{ressource.fichierExerciceNom}</strong> pour réaliser les manipulations sur votre poste.
                </p>
              </div>
            </div>
            <a
              href={ressource.fichierExerciceUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 transition-all shadow-md shadow-teal-950/40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le document brut</span>
            </a>
          </div>
        )}
      </div>

      {/* 1. Mise en situation KLF */}
      <div className="p-6 rounded-2xl bg-[#0A192F]/80 border border-teal-500/20 space-y-2">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider font-mono">
          <Lightbulb className="w-4 h-4" />
          <span>Mise en situation d'entreprise KLF (Contexte réel de quai)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
          "{ressource.miseEnSituationKLF}"
        </p>
      </div>

      {/* Autopsie technique : Avant / Après */}
      {ressource.autopsieAvantApres && (
        <div className="p-6 rounded-2xl slate-glass border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white font-['Lexend'] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Autopsie technique : Les défauts du document brut vs Les solutions DSI</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2.5">
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Défauts constatés (L'anti-pattern poubelle)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {ressource.autopsieAvantApres.defauts.map((d, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Normes DSI KLF appliquées (Le standard pro)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {ressource.autopsieAvantApres.solutionsDSI.map((s, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. Raccourcis indispensables & réflexes clavier */}
      <div className="p-6 rounded-2xl slate-glass border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white font-['Lexend'] flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 text-xs flex items-center justify-center font-mono font-bold">1</span>
          Raccourcis indispensables & réflexes clavier du technicien
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ressource.raccourcisCles.map((rc, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <span className="text-xs text-slate-200 font-medium block">{rc.action}</span>
                {rc.plateforme && rc.plateforme !== 'universel' && (
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{rc.plateforme}</span>
                )}
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-xs font-bold shrink-0">
                {rc.touche}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Déroulé pas-à-pas approfondi (8-10 min) */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 text-xs flex items-center justify-center font-mono font-bold">2</span>
          <h2 className="text-lg font-bold text-white font-['Lexend']">
            Guide pas-à-pas opérationnel ({ressource.etapesDetaillees.length} étapes)
          </h2>
        </div>

        <div className="space-y-4">
          {ressource.etapesDetaillees.map((etape) => (
            <div
              key={etape.numero}
              className="p-6 rounded-2xl slate-glass border border-white/10 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/30 flex items-center justify-center text-teal-300 font-mono text-xs font-bold shrink-0">
                  {etape.numero}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white font-['Lexend']">
                    {etape.titre}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {etape.detail}
                  </p>
                </div>
              </div>

              {etape.exempleCode && (
                <div className="mt-2 p-3 rounded-xl bg-black/50 border border-teal-500/20 font-mono text-xs text-teal-300 space-y-1 overflow-x-auto">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Exemple de formule ou manipulation :</div>
                  <pre className="font-mono text-xs whitespace-pre-wrap">{etape.exempleCode}</pre>
                </div>
              )}

              {etape.astuceDSI && (
                <div className="mt-2 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-2 text-xs text-teal-200">
                  <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Astuce DSI :</strong> {etape.astuceDSI}
                  </div>
                </div>
              )}

              {etape.consigneTech && (
                <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Règle de conformité :</strong> {etape.consigneTech}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Pièges fréquents & erreurs à éviter */}
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 text-sm font-bold uppercase tracking-wider font-mono">
          <ShieldAlert className="w-4 h-4" />
          <span>Pièges fréquents & erreurs à éradiquer</span>
        </div>
        <ul className="space-y-2">
          {ressource.piegesAEviter.map((piege, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
              <span className="text-rose-400 font-bold shrink-0">⚠️</span>
              <span>{piege}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Exercice d'application & Défi KLF */}
      <div className="p-6 rounded-2xl slate-glass border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white font-['Lexend'] flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 text-xs flex items-center justify-center font-mono font-bold">3</span>
          Exercice d'application pratique (Atelier support KLF)
        </h2>

        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {ressource.exerciceApplication.enonce}
          </p>

          {ressource.exerciceApplication.fichierUrl && (
            <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-teal-400 shrink-0" />
                <div className="text-xs text-slate-200">
                  Document de travail dédié au défi : <strong className="text-teal-300 font-mono">{ressource.exerciceApplication.fichierNom || 'Fichier exercice'}</strong>
                </div>
              </div>
              <a
                href={ressource.exerciceApplication.fichierUrl}
                download
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 transition-colors shadow-sm shadow-teal-950/40 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger le sujet ({ressource.exerciceApplication.fichierNom?.endsWith('.txt') ? '.txt' : '.docx'})</span>
              </a>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Critères de validation du formateur :</div>
            <ul className="space-y-1">
              {ressource.exerciceApplication.criteresReussite.map((critere, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{critere}</span>
                </li>
              ))}
            </ul>
          </div>

          {ressource.exerciceApplication.solutionAttendue && (
            <details className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 cursor-pointer">
              <summary className="font-semibold text-teal-400">💡 Consulter la solution attendue du formateur</summary>
              <div className="mt-2 font-mono text-xs text-emerald-300 bg-black/50 p-2.5 rounded-lg border border-white/10">
                {ressource.exerciceApplication.solutionAttendue}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* 6. Micro-Quiz de validation (3 questions) */}
      {ressource.miniQuiz && ressource.miniQuiz.length > 0 && (
        <div className="p-6 rounded-2xl slate-glass border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 text-xs flex items-center justify-center font-mono font-bold">4</span>
              <h2 className="text-base font-bold text-white font-['Lexend']">
                Micro-Quiz de validation des acquis (3 questions)
              </h2>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              +25 PTS
            </span>
          </div>

          <div className="space-y-4">
            {ressource.miniQuiz.map((q, qIdx) => {
              const selectedOpt = quizAnswers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.reponseCorrecte;

              return (
                <div key={qIdx} className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3">
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    {qIdx + 1}. {q.question}
                  </div>

                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                          className={`w-full p-2.5 rounded-lg text-left text-xs font-medium transition-all flex items-center justify-between border cursor-pointer ${
                            isOptionSelected
                              ? 'bg-teal-500/20 border-teal-500/40 text-teal-200'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <span>{opt}</span>
                          {isOptionSelected && (
                            <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div
                      className={`p-3 rounded-lg text-xs font-medium border ${
                        isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Bonne réponse !</span>
                          </>
                        ) : (
                          <>
                            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Explication pédagogique :</span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-300">{q.explication}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Barre d'action finale */}
      <div className="p-6 rounded-2xl slate-glass border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-white font-['Lexend']">Vous maîtrisez ce sujet ?</div>
          <div className="text-xs text-slate-400">Passez à la résolution des tickets d'incidents du terminal de Jarry.</div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/ressources"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Tous les guides
          </Link>

          <Link
            href="/tickets"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-lg shadow-teal-500/20 transition-all"
          >
            <span>Accéder aux tickets KLF</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
