import React from 'react';
import Link from 'next/link';
import { StatusDot } from './ui/StatusDot';
import { ShieldCheck, Trophy, Ticket, BookOpen, Anchor, Lock, Library } from 'lucide-react';

interface NavbarProps {
  onOpenRgpd?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRgpd }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070F1E]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Marque KLF */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00B4D8] to-[#008080] flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Anchor className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-wider text-white font-['Lexend']">KLF</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    Tech Passport
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Karukera Logistique & Fret • Support IT Jarry
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Principale */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              Leaderboard
            </Link>
            <Link
              href="/tickets"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Ticket className="w-4 h-4 text-teal-400" />
              Ticket Desk
            </Link>
            <Link
              href="/dp"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Suivi dossier pro
            </Link>
            <Link
              href="/ressources"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Library className="w-4 h-4 text-cyan-400" />
              Ressources
            </Link>
          </nav>

          {/* Statut & Session Promo */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs font-mono font-semibold text-slate-300">Session C26031A</span>
              <span className="text-[10px] text-slate-500">Titre Pro TIP • METAFORE</span>
            </div>

            <StatusDot status="operational" label="DSI en ligne" />

            <Link
              href="/admin"
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
              title="Cockpit d'administration formateur"
            >
              <Lock className="w-4 h-4 text-amber-400/80 hover:text-amber-400" />
            </Link>

            {onOpenRgpd && (
              <button
                type="button"
                onClick={onOpenRgpd}
                className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
                title="Conformité RGPD et données"
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Barre de navigation mobile */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 bg-[#0A192F] py-2 px-4">
        <Link href="/" className="flex items-center gap-1 text-xs text-slate-300 hover:text-teal-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Leaderboard
        </Link>
        <Link href="/tickets" className="flex items-center gap-1 text-xs text-slate-300 hover:text-teal-400">
          <Ticket className="w-3.5 h-3.5 text-teal-400" />
          Tickets
        </Link>
        <Link href="/dp" className="flex items-center gap-1 text-xs text-slate-300 hover:text-teal-400">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          Dossier pro
        </Link>
        <Link href="/ressources" className="flex items-center gap-1 text-xs text-slate-300 hover:text-teal-400">
          <Library className="w-3.5 h-3.5 text-cyan-400" />
          Ressources
        </Link>
      </div>
    </header>
  );
};
