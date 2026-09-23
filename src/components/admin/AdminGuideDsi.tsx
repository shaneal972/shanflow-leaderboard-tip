'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  FileCheck2, 
  FlaskConical, 
  Ticket, 
  Trophy, 
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';

export const AdminGuideDsi: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    quiz: true,
    tickets: false,
    labs: false,
    points: false,
    qualiopi: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* En-tête du Manuel Formateur */}
      <div className="p-6 rounded-3xl slate-glass border border-amber-500/30 relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-transparent to-teal-500/10 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Espace Confidentiel Formateur
              </span>
              <span className="text-xs text-slate-400 font-mono">• Titre Pro TIP (Session C26031A)</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-['Lexend'] tracking-tight">
              Guide opérationnel du formateur référent / DSI
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Ce manuel vous accompagne pas-à-pas pour piloter les sessions de quiz sécurisées avec <strong>KLF Sentinel Lock</strong>, homologuer les tickets et les ateliers du <strong>Tech Lab</strong>, gérer les paliers et générer vos exports <strong>Qualiopi (Indicateur 3)</strong>.
            </p>
          </div>

          <div className="shrink-0 bg-black/40 border border-white/10 p-3.5 rounded-2xl text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Superviseur DSI</div>
            <div className="text-sm font-bold text-teal-400 font-['Lexend']">David JACQUA</div>
            <div className="text-[11px] font-mono text-slate-500">Coordination Pédagogique</div>
          </div>
        </div>
      </div>

      {/* Accordéons des Procédures Opérationnelles */}
      <div className="space-y-4">
        
        {/* Module 1 : Pilotage des Quiz & Sentinel Lock */}
        <div className="rounded-2xl slate-glass border border-white/10 overflow-hidden shadow-lg">
          <button
            type="button"
            onClick={() => toggleSection('quiz')}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-['Lexend'] flex items-center gap-2">
                  1. Pilotage des Quiz KLF & Bouclier Anti-Triche (Sentinel Lock)
                </h3>
                <p className="text-xs text-slate-400">
                  Ouverture de session, surveillance en temps réel des infractions et publication synchronisée.
                </p>
              </div>
            </div>
            {openSections.quiz ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {openSections.quiz && (
            <div className="p-5 pt-0 border-t border-white/5 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5 text-xs uppercase font-mono">
                    <span className="w-2 h-2 rounded-full bg-purple-400" /> Phase 1 : Avant l'épreuve
                  </div>
                  <p className="text-xs text-slate-300">
                    Basculez le statut du quiz sur <strong>« Session ouverte »</strong>. Les élèves voient le quiz s'afficher et doivent activer le mode plein écran pour composer.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs uppercase font-mono">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Phase 2 : Pendant l'épreuve
                  </div>
                  <p className="text-xs text-slate-300">
                    Surveillez en direct les badges d'infractions : 🟢 0 sortie, 🟡 1 sortie, 🔴 2 sorties. Au 3ᵉ avertissement, la copie est scellée d'office pour triche (note 0/20).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 space-y-1.5">
                  <div className="font-bold text-teal-300 flex items-center gap-1.5 text-xs uppercase font-mono">
                    <span className="w-2 h-2 rounded-full bg-teal-400" /> Phase 3 : Clôture & Révélation
                  </div>
                  <p className="text-xs text-slate-300">
                    Cliquez sur <strong>« Clôturer l'épreuve & Publier la correction »</strong>. Le serveur calcule les notes, attribue +200 pts (seuil &ge; 75%) et débloque le corrigé « L'œil du DSI ».
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 font-mono text-xs">
                <div className="text-teal-400 font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Spécificité du chronomètre absolu immuable :
                </div>
                <p className="text-slate-300 font-sans">
                  Le temps est calculé en heure absolue dès l'ouverture du quiz par l'élève. Même s'il tente d'appuyer sur <strong>F5</strong> ou de rafraîchir son navigateur, le temps restant exact est maintenu. À <strong>00:00</strong>, la copie se verrouille et est soumise automatiquement.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-slate-300 space-y-1">
                <span className="text-rose-400 font-bold uppercase font-mono">Rattrapage d'urgence :</span>
                <p>
                  Si un apprenant a subi un bug matériel réel ou une déconnexion involontaire, utilisez le bouton <strong>« Réinitialiser la tentative »</strong> sur sa ligne dans l'onglet Quiz pour remettre ses compteurs à zéro et lui permettre de recomposer.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Module 2 : Homologation des Tickets KLF */}
        <div className="rounded-2xl slate-glass border border-white/10 overflow-hidden shadow-lg">
          <button
            type="button"
            onClick={() => toggleSection('tickets')}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-['Lexend'] flex items-center gap-2">
                  2. Homologation des Tickets de Support DSI (/tickets)
                </h3>
                <p className="text-xs text-slate-400">
                  Relecture des démarches techniques, posture client et attribution des +150 points.
                </p>
              </div>
            </div>
            {openSections.tickets ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {openSections.tickets && (
            <div className="p-5 pt-0 border-t border-white/5 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/20">
              <p className="pt-4">
                Dans l'onglet <strong>« Tickets KLF »</strong>, filtrez les tickets par <em>« En attente de validation »</em>. Chaque résolution soumise par un élève doit être examinée sous deux angles :
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
                <li><strong>La démarche technique :</strong> L'élève a-t-il bien diagnostiqué la cause racine (matériel, système, réseau ou applicatif) et ordonné ses étapes logiques ?</li>
                <li><strong>Le message à l'usager :</strong> Le ton est-il courtois, rassurant et professionnel (pas de jargon agressif ou d'abréviations familières) ?</li>
              </ul>
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
                ✅ Lorsque vous cliquez sur <strong>« Valider la résolution »</strong>, le système crédite automatiquement <strong>+150 points</strong> à l'élève et enregistre la preuve pour son suivi DP.
              </div>
            </div>
          )}
        </div>

        {/* Module 3 : Homologation du Tech Lab */}
        <div className="rounded-2xl slate-glass border border-white/10 overflow-hidden shadow-lg">
          <button
            type="button"
            onClick={() => toggleSection('labs')}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-['Lexend'] flex items-center gap-2">
                  3. Homologation des Ateliers Pratiques KLF Tech Lab (/lab)
                </h3>
                <p className="text-xs text-slate-400">
                  Validation des carnets de laboratoire, téléchargement du PDF Gotenberg A4 et attribution des trophées.
                </p>
              </div>
            </div>
            {openSections.labs ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {openSections.labs && (
            <div className="p-5 pt-0 border-t border-white/5 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/20">
              <p className="pt-4">
                Dans l'onglet <strong>« Ateliers TP »</strong>, vous inspectez les réalisations pratiques des techniciens :
              </p>
              <div className="space-y-2 text-xs">
                <p>1. <strong>Contrôle de l'auto-audit :</strong> Vérifiez que les 5 jalons techniques sont atteints à 100%.</p>
                <p>2. <strong>Inspection du carnet réflexif :</strong> Lisez les difficultés et enseignements notés par l'élève.</p>
                <p>3. <strong>Téléchargement du compte-rendu officiel :</strong> Cliquez sur <em>« Fiche TP A4 »</em> pour vérifier le PDF Gotenberg avec le cadre de visa formateur.</p>
                <p>4. <strong>Homologation :</strong> Cliquez sur <strong>« Homologuer le TP »</strong> pour solder les <strong>+100 points finaux</strong> et décerner le trophée officiel (ex: <em>Nettoyeur de parc</em> ou <em>Sauveur de Corinne</em>).</p>
              </div>
            </div>
          )}
        </div>

        {/* Module 4 : Gestion des Apprenants, Paliers & Stages */}
        <div className="rounded-2xl slate-glass border border-white/10 overflow-hidden shadow-lg">
          <button
            type="button"
            onClick={() => toggleSection('points')}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-['Lexend'] flex items-center gap-2">
                  4. Gestion des Apprenants, Attribution Manuelle & Conventions de Stage
                </h3>
                <p className="text-xs text-slate-400">
                  Ajustement des points, réinitialisation de code PIN et valorisation des stages trouvés (+100 pts).
                </p>
              </div>
            </div>
            {openSections.points ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {openSections.points && (
            <div className="p-5 pt-0 border-t border-white/5 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/20">
              <div className="pt-4 space-y-3">
                <p>
                  Dans l'onglet <strong>« Apprenants »</strong>, cliquez sur le bouton de configuration sur la ligne de l'élève souhaité :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-amber-400 font-bold uppercase font-mono">Convention de stage signée :</span>
                    <p className="text-slate-300">
                      Attribuez le badge <strong>« Convention scellée »</strong> (<code>stage_convention_signee</code>) et créditez <strong>+100 points</strong>. Le palier de l'élève se recalcule instantanément.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-teal-400 font-bold uppercase font-mono">Oubli de code PIN :</span>
                    <p className="text-slate-300">
                      Consultez ou modifiez le code PIN de prise de poste en 2 secondes pour débloquer un élève en début de journée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Module 5 : Exports Qualiopi & Fiches Journalières EN-19 */}
        <div className="rounded-2xl slate-glass border border-white/10 overflow-hidden shadow-lg">
          <button
            type="button"
            onClick={() => toggleSection('qualiopi')}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-['Lexend'] flex items-center gap-2">
                  5. Exports Administratifs, Qualiopi & Fiches Journalières EN-19
                </h3>
                <p className="text-xs text-slate-400">
                  Génération des bilans officiels d'émargement et des indicateurs de conformité METAFORE.
                </p>
              </div>
            </div>
            {openSections.qualiopi ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {openSections.qualiopi && (
            <div className="p-5 pt-0 border-t border-white/5 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/20">
              <div className="pt-4 space-y-3 text-xs">
                <p>
                  La plateforme centralise toutes les exigences administratives exigées par <strong>FORE Alternance / METAFORE</strong> :
                </p>
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
                  <div className="font-bold text-cyan-300 uppercase font-mono">Bilan Qualiopi Promo (Indicateur 3) :</div>
                  <p className="text-slate-300">
                    Cliquez sur le bouton <em>« 📊 Bilan Qualiopi Promo »</em> situé en haut à droite du tableau de bord. Il génère un rapport consolidé des taux de réussite, moyennes et progression globale pour les auditeurs.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="font-bold text-teal-300 uppercase font-mono">Fiches Journalières d'Activité :</div>
                  <p className="text-slate-300">
                    Dans l'onglet <strong>« Fiches journalières »</strong>, téléchargez en 1 clic les synthèses d'activité quotidiennes pré-formatées pour l'administration.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
