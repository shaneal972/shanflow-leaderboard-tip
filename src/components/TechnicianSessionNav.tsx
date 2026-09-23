'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Apprenant } from '@/types/tip';
import { 
  KeyRound, 
  LogOut, 
  Shield, 
  User, 
  X, 
  Lock, 
  ChevronDown, 
  BookOpen, 
  ShieldCheck, 
  Compass, 
  Trophy,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { logoutTechnicianAction } from '@/app/tickets/actions';
import { logoutAdminAction } from '@/app/admin/actions';
import { TechnicianLoginScreen } from '@/components/tickets/TechnicianLoginScreen';

interface TechnicianSessionNavProps {
  currentStudent?: Apprenant | null;
  isFormateur?: boolean;
}

export const TechnicianSessionNav: React.FC<TechnicianSessionNavProps> = ({
  currentStudent = null,
  isFormateur = false,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fermer le dropdown lors d'un clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleStudentLogout = () => {
    setIsDropdownOpen(false);
    startTransition(async () => {
      await logoutTechnicianAction();
      localStorage.removeItem('klf_active_student_id');
      router.refresh();
    });
  };

  const handleAdminLogout = () => {
    setIsDropdownOpen(false);
    startTransition(async () => {
      await logoutAdminAction();
    });
  };

  const handleLoginSuccess = (student: { id: string }) => {
    setIsLoginModalOpen(false);
    localStorage.setItem('klf_active_student_id', student.id);
    router.refresh();
  };

  const handleOpenRgpd = () => {
    setIsDropdownOpen(false);
    window.dispatchEvent(new CustomEvent('open-rgpd-modal'));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* =====================================================================
          1. BOUTONS DÉCLENCHEURS (HEADER COMPACT)
          ===================================================================== */}

      {/* Cas A : Formateur DSI connecté */}
      {isFormateur && (
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer shadow-sm shadow-amber-500/10 active:scale-95"
          title="Ouvrir le menu session DSI"
          aria-expanded={isDropdownOpen}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-semibold text-white">David</span>
          <span className="hidden sm:inline text-amber-400/90 font-medium">(Formateur DSI)</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-amber-300' : ''}`} />
        </button>
      )}

      {/* Cas B : Apprenant Technicien connecté */}
      {!isFormateur && currentStudent && (
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-mono bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:border-teal-400 hover:bg-teal-500/20 transition-all cursor-pointer shadow-sm shadow-teal-500/10 active:scale-95"
          title="Ouvrir mon menu technicien"
          aria-expanded={isDropdownOpen}
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
          <span className="font-semibold text-white truncate max-w-[110px] sm:max-w-[140px]">
            {currentStudent.prenom} {currentStudent.nom ? currentStudent.nom.charAt(0) + '.' : ''}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/25 text-teal-200 font-bold border border-teal-500/30">
            {currentStudent.points_total} pts
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-teal-300' : ''}`} />
        </button>
      )}

      {/* Cas C : Visiteur non connecté */}
      {!isFormateur && !currentStudent && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:border-teal-400 transition-all cursor-pointer active:scale-95"
          >
            <KeyRound className="w-3.5 h-3.5 text-teal-400" />
            <span>Prise de poste</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
            title="Détails de la session et accès formateur"
            aria-expanded={isDropdownOpen}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* =====================================================================
          2. MENU DÉROULANT / HUB SESSION DSI (POPOVER)
          ===================================================================== */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 rounded-2xl bg-[#081226]/98 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/90 p-4 z-50 text-slate-200 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Section Profil / Identité */}
          <div className="flex items-start justify-between pb-3 border-b border-white/10">
            {isFormateur ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 font-bold flex items-center justify-center font-['Lexend'] text-base shadow-sm">
                  D
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">David Jacqua</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Superviseur
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Formateur référent & DSI</p>
                </div>
              </div>
            ) : currentStudent ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-teal-300 font-bold flex items-center justify-center font-['Lexend'] text-base shadow-sm">
                  {currentStudent.prenom.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {currentStudent.prenom} {currentStudent.nom}
                  </h4>
                  <p className="text-xs text-slate-400">Technicien TIP • {currentStudent.equipe}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center">
                  <Laptop className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Session invité</h4>
                  <p className="text-xs text-slate-400">Technicien non identifié</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsDropdownOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section Cadre Académique & Infrastructure */}
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Promotion</span>
              <span className="font-mono font-semibold text-slate-200">Session C26031A</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Formation</span>
              <span className="text-slate-200 font-medium">Titre Pro TIP (Niv. 4)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Organisme</span>
              <span className="text-slate-200">METAFORE Guadeloupe</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Infrastructure
              </span>
              <span className="text-emerald-400 font-medium">DSI opérationnel</span>
            </div>
          </div>

          {/* Section Raccourcis et Actions rapides */}
          <div className="space-y-1 text-xs">
            {isFormateur && (
              <Link
                href="/admin"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Cockpit de supervision DSI
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400/80" />
              </Link>
            )}

            {currentStudent && (
              <Link
                href={`/passport/${currentStudent.id}`}
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-teal-500/10 text-teal-200 hover:bg-teal-500/20 border border-teal-500/20 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Trophy className="w-4 h-4 text-teal-400" />
                  Mon passeport technique ({currentStudent.points_total} pts)
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-teal-400/80" />
              </Link>
            )}

            {!isFormateur && !currentStudent && (
              <Link
                href="/admin"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400/80" />
                  Espace formateur DSI
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            )}

            <button
              type="button"
              onClick={handleOpenRgpd}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Notice de conformité RGPD
              </span>
            </button>

            <Link
              href="/guide"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                Guide et barème TIP
              </span>
            </Link>
          </div>

          {/* Section Déconnexion */}
          {(isFormateur || currentStudent) && (
            <div className="pt-2 border-t border-white/10">
              {isFormateur ? (
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Clôturer l'accès formateur</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStudentLogout}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Clôturer ma prise de poste</span>
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* =====================================================================
          3. MODAL DE PRISE DE POSTE (PORTAL)
          ===================================================================== */}
      {mounted && isLoginModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] overflow-y-auto p-4 sm:p-6 bg-black/85 backdrop-blur-md flex min-h-full items-center justify-center animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsLoginModalOpen(false)} 
          />
          <div className="relative w-full max-w-md my-auto p-5 sm:p-6 rounded-3xl slate-glass border border-teal-500/40 shadow-2xl shadow-black/95 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 border border-teal-500/30 shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Lexend']">
                    Prise de poste technicien KLF
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Session C26031A • Support IT Jarry
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <TechnicianLoginScreen compact={true} onSuccess={handleLoginSuccess} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
