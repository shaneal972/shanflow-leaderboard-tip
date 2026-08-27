import React from 'react';
import Link from 'next/link';
import { getLeaderboardData } from '@/lib/supabase';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { 
  Trophy, 
  Users, 
  Ticket, 
  FileCheck2, 
  Sparkles, 
  ArrowRight, 
  Anchor 
} from 'lucide-react';

export const revalidate = 10; // ISR revalidation toutes les 10 secondes

export default async function HomePage() {
  const leaderboard = await getLeaderboardData();

  const totalPointsPromo = leaderboard.reduce((acc, curr) => acc + curr.points_total, 0);
  const totalBadgesUnlocked = leaderboard.reduce((acc, curr) => acc + (curr.badges_count || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Hero Banner KLF Tech Terminal */}
      <div className="relative p-6 sm:p-8 rounded-3xl slate-glass overflow-hidden border border-white/10">
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              <Anchor className="w-3.5 h-3.5 text-teal-400" />
              Promotion TIP 2026-2027 • METAFORE Jarry
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-400 bg-white/5 border border-white/5">
              Entreprise Fictive : Karukera Logistique & Fret (KLF)
            </span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Lexend'] tracking-tight">
              KLF Tech Passport et classement promo
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Plateforme officielle de simulation et de suivi des compétences pour le 
              <strong> Titre Professionnel Technicien Informatique de Proximité</strong>.
              Résolvez les incidents réels du port de Jarry, débloquez les 5 paliers et préparez votre Dossier Professionnel (CCP 1).
            </p>
          </div>

          {/* Baromètre de performance collective de la promotion */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-white/10 font-mono">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-teal-400" />
                Techniciens TIP
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-['Lexend']">
                {leaderboard.length}
              </div>
              <div className="text-[10px] text-teal-400">Session C26031A</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Points collectifs
              </div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400 font-['Lexend']">
                {totalPointsPromo}
              </div>
              <div className="text-[10px] text-slate-400">pts cumulés promo</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                Badges conquis
              </div>
              <div className="text-xl sm:text-2xl font-bold text-indigo-300 font-['Lexend']">
                {totalBadgesUnlocked}
              </div>
              <div className="text-[10px] text-slate-400">trophées KLF validés</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                Objectif REAC
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-['Lexend']">
                CCP 1
              </div>
              <div className="text-[10px] text-slate-400">Support usagers</div>
            </div>
          </div>

        </div>
      </div>

      {/* Cartes d'accès rapide aux 2 autres modules majeurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Accès Ticket Desk */}
        <Link
          href="/tickets"
          className="p-5 rounded-2xl slate-glass border border-white/10 hover:border-teal-400/40 transition-all group flex items-start justify-between"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Ticket className="w-3.5 h-3.5" />
              Incidents réels KLF
            </div>
            <h2 className="text-lg font-bold text-white font-['Lexend'] group-hover:text-teal-300 transition-colors">
              KLF helpdesk ticket desk
            </h2>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Résolvez le ticket #101 de Corinne (Facturation TVA/Octroi de mer), le tutoriel tablettes Zebra de Sébastien et le publipostage d&apos;Élodie.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:translate-x-1 transition-all shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
        </Link>

        {/* Accès Suivi Dossier Pro (DP) */}
        <Link
          href="/dp"
          className="p-5 rounded-2xl slate-glass border border-white/10 hover:border-emerald-400/40 transition-all group flex items-start justify-between"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCheck2 className="w-3.5 h-3.5" />
              Conformité Ministère du Travail
            </div>
            <h2 className="text-lg font-bold text-white font-['Lexend'] group-hover:text-emerald-300 transition-colors">
              Audit du dossier professionnel (DP)
            </h2>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Vérifiez la conformité Cerfa de votre Fiche Exemple CCP 1 selon les 5 rubriques officielles requises pour l&apos;obtention du Titre.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
        </Link>

      </div>

      {/* Module A : Tableau de Bord & Classement Promo en Temps Réel */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white font-['Lexend'] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Classement officiel de la promotion (leaderboard)
            </h2>
            <p className="text-xs text-slate-400">
              Mise à jour en temps réel • Données pseudo-anonymisées conformes RGPD
            </p>
          </div>

          <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20 self-start sm:self-auto">
            {leaderboard.length} Techniciens en lice
          </span>
        </div>

        <LeaderboardTable initialData={leaderboard} />
      </div>

    </div>
  );
}
