'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import { loginAdminAction } from '@/app/admin/actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, null);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Lien de retour au leaderboard */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au classement public</span>
        </Link>

        {/* Boîte de connexion formateur */}
        <div className="p-6 sm:p-8 rounded-3xl slate-glass border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 uppercase">
                  Accès restreint DSI
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white font-['Lexend'] tracking-tight">
                Cockpit d&apos;administration formateur
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Veuillez saisir votre clé d&apos;accès formateur pour piloter les scores, les incidents et le suivi des Dossiers Professionnels.
              </p>
            </div>

            {/* Message d'erreur */}
            {state?.error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 font-mono">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            {/* Formulaire de connexion */}
            <form action={formAction} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-300" htmlFor="password">
                  Clé ou mot de passe formateur
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Saisissez votre mot de passe..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#070F1E] border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-teal-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-teal-500/10"
              >
                <span>{isPending ? 'Vérification en cours...' : 'Déverrouiller le cockpit'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-[11px] text-slate-500 font-mono">
                Session C26031A • Promotion TIP METAFORE Jarry
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
