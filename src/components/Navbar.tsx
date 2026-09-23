'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Ticket, BookOpen, Anchor, Library, FlaskConical, Compass } from 'lucide-react';
import { Apprenant } from '@/types/tip';
import { TechnicianSessionNav } from './TechnicianSessionNav';

interface NavbarProps {
  currentStudent?: Apprenant | null;
  isFormateur?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentStudent = null,
  isFormateur = false,
}) => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Leaderboard', icon: Trophy, exact: true },
    { href: '/lab', label: 'Tech Lab', icon: FlaskConical, exact: false },
    { href: '/tickets', label: 'Tickets', icon: Ticket, exact: false },
    { href: '/dp', label: 'Dossier pro', icon: BookOpen, exact: false },
    { href: '/ressources', label: 'Ressources', icon: Library, exact: false },
    { href: '/guide', label: 'Guide', icon: Compass, exact: false },
  ];

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#070F1E]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Logo & Identité KLF (Compact & Épuré façon jw.org) */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#008080] flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all">
                <Anchor className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-wider text-white font-['Lexend']">
                  KLF
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/25 font-semibold">
                  Tech
                </span>
              </div>
            </Link>
          </div>

          {/* 2. Navigation Principale (Sobre, Harmonisée & Dynamique) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all group ${
                    active
                      ? 'bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/25 shadow-sm shadow-teal-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Navigation intermédiaire tablette (MD) sans icônes pour respirer */}
          <nav className="hidden md:flex lg:hidden items-center gap-1">
            {navLinks.map((item) => {
              const active = isLinkActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    active
                      ? 'bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 3. Hub Utilisateur & Session DSI Unifié */}
          <div className="flex items-center gap-3 shrink-0">
            <TechnicianSessionNav 
              currentStudent={currentStudent} 
              isFormateur={isFormateur} 
            />
          </div>

        </div>
      </div>

      {/* 4. Barre de Navigation Mobile Tactile (Fluid Scroll) */}
      <div className="md:hidden flex items-center gap-2 border-t border-white/5 bg-[#091427] py-2 px-3 overflow-x-auto no-scrollbar">
        {navLinks.map((item) => {
          const active = isLinkActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs shrink-0 transition-all ${
                active
                  ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
