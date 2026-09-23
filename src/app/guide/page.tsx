'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Trophy,
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  FlaskConical,
  Ticket,
  FileSpreadsheet,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  Lock,
  ArrowRight,
  HelpCircle,
  Award,
  Layers,
  FileCheck,
} from 'lucide-react';

export default function GuideApprenantPage() {
  const [activeSection, setActiveSection] = useState<'all' | 'philo' | 'steps' | 'bareme' | 'faq'>('all');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const sections = [
    { id: 'all', label: 'Vue d\'ensemble' },
    { id: 'philo', label: '1. Philosophie & Escouades' },
    { id: 'steps', label: '2. Guide pas-à-pas' },
    { id: 'bareme', label: '3. Points & Paliers' },
    { id: 'faq', label: '4. Questions fréquentes' },
  ] as const;

  const paliers = [
    {
      nom: 'Recrue',
      points: '0 à 149 pts',
      badgeColor: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
      titre: 'Intégration DSI & Diagnostic RAN',
      desc: 'Prise en main des postes, création des arborescences de travail conformes et assimilation de l\'environnement logistique KLF.',
    },
    {
      nom: 'Palier 1',
      points: '150 à 349 pts',
      badgeColor: 'border-teal-500/40 bg-teal-500/10 text-teal-300',
      titre: 'Technicien Support Débutant',
      desc: 'Maîtrise bureautique opérationnelle (tableurs, formules matricielles, M365) et respect strict des règles d\'hygiène informatique.',
    },
    {
      nom: 'Palier 2',
      points: '350 à 649 pts',
      badgeColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
      titre: 'Technicien Exploitation Opérationnel',
      desc: 'Dépannage matériel et réseau local, traitement structuré de tickets de niveau 1 et premières validations de cas d\'usage.',
    },
    {
      nom: 'Palier 3',
      points: '650 à 999 pts',
      badgeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
      titre: 'Technicien Systèmes & Réseaux Confirmé',
      desc: 'Sécurité renforcée (bonnes pratiques ANSSI), autonomie sur la résolution d\'incidents et convention de stage actée.',
    },
    {
      nom: 'Palier 4',
      points: '1000+ pts',
      badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      titre: 'Expert DSI & Prêt pour le Jury Titre Pro',
      desc: 'Couverture intégrale du référentiel REAC, Dossier Professionnel (DP) scellé et capacité avérée à défendre ses projets à l\'oral.',
    },
  ];

  const steps = [
    {
      num: 1,
      title: 'Prise de poste et code PIN personnel',
      desc: 'Connectez-vous avec votre identifiant nominatif et votre code PIN remis en début de session.',
      details: [
        'Cliquez sur « Prendre mon poste » en haut à droite de l\'écran.',
        'Sélectionnez votre nom dans la liste des techniciens de la promotion.',
        'Saisissez votre code PIN à 4 chiffres et validez le consentement RGPD.',
        'Votre session reste mémorisée sur le poste de travail pour toutes vos actions de la journée.',
      ],
      link: '/',
      linkLabel: 'Accéder au Leaderboard',
    },
    {
      num: 2,
      title: 'Consultation de votre passeport technique',
      desc: 'Visualisez en temps réel votre jauge de progression, vos badges et vos jalons de Dossier Professionnel.',
      details: [
        'Depuis votre passeport personnel (/passport/[votre-id]), observez vos points cumulés.',
        'Découvrez votre vitrine de badges (badges de réactivité, d\'analyse ou de collaboration).',
        'Suivez le statut de vos fiches DP pour vous assurer de couvrir les compétences du Ministère du Travail.',
      ],
      link: '/',
      linkLabel: 'Voir mon passeport',
    },
    {
      num: 3,
      title: 'Passation des épreuves Quiz sous surveillance KLF Sentinel Lock',
      desc: 'Participez aux évaluations théoriques dans un environnement sécurisé et équitable.',
      details: [
        'Rendez-vous sur la page du quiz annoncé par le formateur et activez le mode plein écran.',
        'Le protocole Sentinel Lock neutralise le copier-coller et comptabilise chaque sortie d\'écran.',
        'Attention : au 3ᵉ avertissement, votre copie est automatiquement verrouillée pour triche (note 0/20).',
        'Le chronomètre est mesuré en temps réel absolu : recharger la page (F5) ne remet jamais le temps à zéro ! À 00:00, la copie est transmise telle quelle.',
      ],
      link: '/',
      linkLabel: 'Consulter les quiz en cours',
    },
    {
      num: 4,
      title: 'Analyse de la correction différée et de « L\'œil du DSI »',
      desc: 'Comprenez vos erreurs et découvrez les réflexes professionnels attendus en entreprise.',
      details: [
        'Dès la clôture collective de l\'épreuve par le formateur, la correction s\'affiche sur votre copie.',
        'Chaque question comporte l\'encart « 💡 L\'œil du DSI Marc Verdier ».',
        'Cet encart détaille pourquoi la bonne réponse était la plus solide sur le plan opérationnel et démonte les pièges fréquents rencontrés sur le terrain.',
      ],
    },
    {
      num: 5,
      title: 'Traitement des tickets d\'assistance KLF Ticket Desk',
      desc: 'Prenez en charge des demandes d\'utilisateurs simulés (Guadeloupe) et appliquez une méthodologie rigoureuse.',
      details: [
        'Rendez-vous sur /tickets et choisissez un ticket non résolu dans la file d\'attente.',
        'Renseignez la catégorie d\'incident, le niveau de priorité (P1 à P3) et la démarche technique.',
        'Rédigez la communication pour l\'utilisateur avec courtoisie, clarté et bienveillance.',
        'Chaque résolution validée par le formateur crédite immédiatement +150 points à votre compteur !',
      ],
      link: '/tickets',
      linkLabel: 'Ouvrir le Ticket Desk',
    },
    {
      num: 6,
      title: 'Pratique au KLF Tech Lab et génération de fiches de TP',
      desc: 'Réparez des fichiers techniques réels et générez des preuves officielles pour votre jury.',
      details: [
        'Sur /lab, téléchargez le classeur ou document corrompu (ex : Atelier Corinne et fret maritime).',
        'Réparez les formules, le formatage et les calculs selon les consignes du cahier des charges.',
        'Glissez votre fichier dans l\'inspecteur : vos formules sont auditées en local en moins de 200 ms.',
        'Complétez votre carnet de laboratoire réflexif et téléchargez votre fiche TP A4 officielle (PDF Gotenberg) à annexer à votre DP.',
      ],
      link: '/lab',
      linkLabel: 'Explorer le Tech Lab',
    },
    {
      num: 7,
      title: 'Valorisation de la recherche de stage en entreprise',
      desc: 'Faites valider votre lieu de stage pour obtenir des points bonus et un badge officiel.',
      details: [
        'Dès confirmation de votre accueil en entreprise, transmettez vos coordonnées de stage au formateur.',
        'Votre compte sera immédiatement crédité de +100 points avec le badge exclusif « 📑 Convention scellée ».',
        'Cette étape consolide votre préparation au Titre Professionnel.',
      ],
    },
  ];

  const pointRules = [
    {
      action: 'Validation d\'un Quiz KLF',
      points: '+200 pts',
      condition: 'Score minimal de 75% à l\'évaluation théorique (crédité automatiquement lors de la clôture).',
      icon: BookOpen,
      color: 'text-purple-400',
    },
    {
      action: 'Résolution d\'un Ticket DSI',
      points: '+150 pts',
      condition: 'Ticket instruit avec démarche technique structurée et validé par le formateur dans le cockpit.',
      icon: Ticket,
      color: 'text-amber-400',
    },
    {
      action: 'Auto-audit réussi au Tech Lab',
      points: '+100 pts',
      condition: 'Atteinte de 100% (5 jalons verts) lors de l\'inspection instantanée du classeur réparé.',
      icon: Zap,
      color: 'text-teal-400',
    },
    {
      action: 'Homologation officielle du Tech Lab',
      points: '+100 pts',
      condition: 'Carnet de laboratoire et livrable A4 validés par le formateur (débloque également le trophée d\'atelier).',
      icon: FlaskConical,
      color: 'text-emerald-400',
    },
    {
      action: 'Signature de la convention de stage',
      points: '+100 pts',
      condition: 'Accord d\'accueil validé et transmis au secrétariat du centre de formation.',
      icon: Award,
      color: 'text-blue-400',
    },
    {
      action: 'Hygiène de poste & arborescence RAN',
      points: '+50 pts',
      condition: 'Organisation rigoureuse des dossiers de travail et respect de la charte de nommage KLF.',
      icon: ShieldCheck,
      color: 'text-slate-300',
    },
  ];

  const faqs = [
    {
      q: 'Que se passe-t-il si je subis une micro-coupure internet en plein examen ?',
      r: 'L\'interface de quiz est conçue pour être tolérante aux aléas de connectivité. Toutes les questions sont préchargées dans la mémoire de votre navigateur et vos choix sont conservés localement. Dès que le réseau redevient stable, vos réponses sont acheminées sans perte.',
    },
    {
      q: 'Pourquoi ma copie de quiz a-t-elle été soumise toute seule ?',
      r: 'Le chronomètre Sentinel Lock fonctionne en heure réelle absolue. Si le temps imparti (par exemple 35 minutes) arrive à son terme, le système fige automatiquement la saisie et transmet vos réponses au serveur afin de garantir une stricte équité pour l\'ensemble des candidats.',
    },
    {
      q: 'Puis-je utiliser les fiches PDF du Tech Lab pour mon examen final ?',
      r: 'Absolument ! Les fiches TP A4 générées par Gotenberg Chromium comportent le cartouche officiel, l\'en-tête de session, les compétences visées et le visa du formateur. Elles constituent des annexes de premier choix pour enrichir votre Dossier Professionnel (DP) présenté au jury.',
    },
    {
      q: 'J\'ai égaré ou oublié mon code PIN technicien, comment faire ?',
      r: 'Adressez-vous directement à votre formateur David JACQUA. Il dispose des privilèges administratifs dans son cockpit pour consulter ou réinitialiser immédiatement votre code PIN.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16 px-4 sm:px-6">
      
      {/* En-tête principal */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 slate-glass border border-white/10 space-y-5">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gradient-to-bl from-teal-500/15 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 border border-teal-500/25 text-teal-300">
            <Compass className="w-3.5 h-3.5" />
            Manuel de bord de la promotion
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-slate-300">
            Session C26031A • Jarry
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 border border-amber-500/25 text-amber-300">
            Titre Pro TIP
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-['Lexend']">
            Guide d'utilisation du Leaderboard KLF
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Bienvenue sur la plateforme technique de Karukera Logistique & Fret. Ce guide vous détaille 
            l'esprit de l'évaluation continue, le fonctionnement du passeport et les bonnes pratiques pour 
            valoriser vos compétences jusqu'au jury final du Titre Professionnel.
          </p>
        </div>

        {/* Barre de navigation d'onglets rapides */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
          {sections.map((s) => {
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-teal-500/20 border-teal-500/50 text-teal-200 shadow-md shadow-teal-950/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border-white/5'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapitre 1 : Philosophie & Présentation */}
      {(activeSection === 'all' || activeSection === 'philo') && (
        <section id="philo" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">Chapitre 1</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Lexend']">
                Philosophie et esprit d'escouade
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl slate-glass border border-white/10 space-y-3">
              <div className="flex items-center gap-2.5 text-teal-300 font-semibold text-sm">
                <Trophy className="w-4 h-4 text-amber-400" />
                Un compagnon de progression continue (Zéro sanction)
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Le Leaderboard KLF n'a pas vocation à sanctionner les faux pas. Chaque erreur est abordée 
                comme une opportunité d'apprentissage immédiate grâce à la rétroaction didactique 
                fournie dans <strong className="text-teal-200">« L'œil du DSI Marc Verdier »</strong>. 
                Chaque effort concret (dépanner un collègue, assainir un classeur corrompu, documenter sa démarche) 
                vous rapporte des points et construit votre passeport.
              </p>
            </div>

            <div className="p-5 rounded-2xl slate-glass border border-white/10 space-y-3">
              <div className="flex items-center gap-2.5 text-sky-300 font-semibold text-sm">
                <Users className="w-4 h-4 text-sky-400" />
                Immersion professionnelle à Jarry & Escouades
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Vous intervenez en tant que techniciens support au sein de l'entreprise maritime 
                <strong className="text-slate-100"> Karukera Logistique & Fret (KLF)</strong>. 
                La promotion est organisée en 3 escouades territoriales (<em className="text-teal-300">Alizé</em>, 
                <em className="text-sky-300"> Baie-Mahault</em>, <em className="text-indigo-300">Houelbourg</em>) 
                pour encourager l'émulation collective, la solidarité technique et le partage de connaissances.
              </p>
            </div>
          </div>

          {/* Grille des 4 Paliers */}
          <div className="p-6 rounded-2xl slate-glass border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                L'échelle des 4 paliers d'expertise KLF
              </h3>
              <span className="text-xs text-slate-400">Progression dynamique</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {paliers.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 space-y-2 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${p.badgeColor}`}>
                        {p.nom}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{p.points}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200">{p.titre}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chapitre 2 : Guide Pas-à-Pas */}
      {(activeSection === 'all' || activeSection === 'steps') && (
        <section id="steps" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-sky-400 uppercase tracking-wider">Chapitre 2</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Lexend']">
                Guide pas-à-pas du technicien
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const isExpanded = expandedStep === step.num;
              return (
                <div
                  key={step.num}
                  className="rounded-2xl slate-glass border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedStep(isExpanded ? null : step.num)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        0{step.num}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                          {step.title}
                        </h3>
                        <p className="text-xs text-slate-400 hidden sm:block truncate">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500 hidden md:inline">
                        {isExpanded ? 'Masquer les consignes' : 'Voir les détails'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-teal-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-white/5 space-y-4 bg-black/20">
                      <p className="text-xs sm:text-sm text-slate-300 sm:hidden">
                        {step.desc}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>

                      {step.link && (
                        <div className="pt-2">
                          <Link
                            href={step.link}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 transition-all"
                          >
                            <span>{step.linkLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Chapitre 4 : Matrice des Points & Barème */}
      {(activeSection === 'all' || activeSection === 'bareme') && (
        <section id="bareme" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Chapitre 3</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Lexend']">
                Matrice officielle des points et barème
              </h2>
            </div>
          </div>

          <div className="rounded-2xl slate-glass border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 uppercase text-[11px] tracking-wider font-mono">
                    <th className="px-5 py-3.5 font-semibold">Action réalisée</th>
                    <th className="px-5 py-3.5 font-semibold">Gain accordé</th>
                    <th className="px-5 py-3.5 font-semibold">Conditions d'attribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {pointRules.map((rule, idx) => {
                    const Icon = rule.icon;
                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 font-semibold text-white">
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 shrink-0 ${rule.color}`} />
                            <span>{rule.action}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-teal-500/15 border border-teal-500/30 text-teal-300">
                            {rule.points}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400 leading-relaxed">
                          {rule.condition}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Chapitre 5 : FAQ & Bonnes Pratiques */}
      {(activeSection === 'all' || activeSection === 'faq') && (
        <section id="faq" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Chapitre 4</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Lexend']">
                Foire aux questions et conseils pratiques
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {faqs.map((faq, fIdx) => {
              const isOpen = expandedFaq === fIdx;
              return (
                <div
                  key={fIdx}
                  className="rounded-2xl slate-glass border border-white/10 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : fIdx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-200">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-teal-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 bg-black/20">
                      {faq.r}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Encart d'aide formateur */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-transparent border border-teal-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-teal-200">
                Une question sur votre progression ou un point de règlement ?
              </h3>
              <p className="text-xs text-slate-400">
                Votre formateur référent David JACQUA se tient à votre disposition pendant les créneaux d'atelier ou par messagerie pédagogique.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/40 transition-all shrink-0"
            >
              <span>Retour au classement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

    </div>
  );
}
