import React from 'react';
import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { logoutAdminAction } from '@/app/admin/actions';
import { 
  ShieldCheck, 
  LogOut, 
  ArrowLeft, 
  LayoutDashboard, 
  Users, 
  Ticket, 
  Trophy, 
  FileCheck2 
} from 'lucide-react';

export const metadata = {
  title: 'Administration Formateur • KLF Tech Passport',
  description: 'Cockpit de pilotage et gamification pour le formateur référent TIP.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await isAdminAuthenticated();

  if (!isAuth) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête de l'espace administration */}
      <header className="p-4 sm:p-5 rounded-2xl slate-glass border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white font-['Lexend'] tracking-tight">
                Cockpit formateur • DSI KLF
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Mode superviseur
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Session C26031A • Promotion TIP METAFORE Jarry (Guadeloupe)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voir le classement public</span>
          </Link>

          <form action={logoutAdminAction} noValidate>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
              title="Se déconnecter de l'espace formateur"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </form>
        </div>
      </header>

      {/* Contenu principal */}
      <main>
        {children}
      </main>

    </div>
  );
}
