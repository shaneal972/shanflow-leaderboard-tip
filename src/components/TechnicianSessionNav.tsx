'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Apprenant } from '@/types/tip';
import { 
  KeyRound, 
  LogOut, 
  Shield, 
  User, 
  X, 
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { logoutTechnicianAction } from '@/app/tickets/actions';
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutTechnicianAction();
      localStorage.removeItem('klf_active_student_id');
      router.refresh();
    });
  };

  const handleLoginSuccess = (student: { id: string }) => {
    setIsLoginModalOpen(false);
    localStorage.setItem('klf_active_student_id', student.id);
    router.refresh();
  };

  return (
    <>
      {/* 1. Mode Formateur DSI Connecté */}
      {isFormateur && (
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all group"
          title="Cockpit de supervision formateur DSI"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline font-semibold">Formateur DSI</span>
          <span className="text-amber-400 font-bold">(David)</span>
        </Link>
      )}

      {/* 2. Mode Technicien Apprenant Connecté */}
      {!isFormateur && currentStudent && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href={`/passport/${currentStudent.id}`}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:border-teal-400 hover:bg-teal-500/20 transition-all group"
            title="Accéder à mon passeport technique KLF"
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
            <span className="font-semibold text-white group-hover:text-teal-200 truncate max-w-[120px] sm:max-w-none">
              {currentStudent.prenom} {currentStudent.nom ? currentStudent.nom.charAt(0) + '.' : ''}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
              {currentStudent.points_total} pts
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-white/5 transition-colors"
            title="Clôturer ma prise de poste"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Mode Non Connecté : Bouton de Prise de Poste Global */}
      {!isFormateur && !currentStudent && (
        <button
          type="button"
          onClick={() => setIsLoginModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-white/5 hover:bg-teal-500/10 text-slate-300 hover:text-teal-300 border border-white/10 hover:border-teal-500/30 transition-all active:scale-95"
        >
          <KeyRound className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden xs:inline">Prise de poste</span>
        </button>
      )}

      {/* MODAL DE PRISE DE POSTE SSO UNIFIÉE */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/80 backdrop-blur-md flex min-h-full items-center justify-center animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsLoginModalOpen(false)} 
          />
          <div className="relative w-full max-w-md my-auto p-5 sm:p-6 rounded-3xl slate-glass border border-teal-500/40 shadow-2xl shadow-black/90 z-10 space-y-4">
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
        </div>
      )}
    </>
  );
};
