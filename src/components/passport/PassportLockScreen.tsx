'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, ShieldAlert, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { unlockPassportAction } from '@/app/passport/actions';

interface PassportLockScreenProps {
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  equipe?: string;
}

export const PassportLockScreen: React.FC<PassportLockScreenProps> = ({
  studentId,
  studentName,
  avatarUrl,
  equipe,
}) => {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const firstName = studentName.split(' ')[0] || studentName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setError('Veuillez saisir votre code PIN à 4 chiffres.');
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await unlockPassportAction(studentId, pin);
      if (res.success) {
        // Redirection / rafraîchissement immédiat vers le passeport déverrouillé
        router.refresh();
      } else {
        setError(res.error || 'Code PIN incorrect.');
        setPin('');
      }
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md slate-glass rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/80 bg-[#070F1E]/95 backdrop-blur-xl relative overflow-hidden">
        
        {/* Halo décoratif discret KLF */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center relative z-10">
          
          {/* Avatar & Icône cadenas KLF */}
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 p-1 shadow-xl shadow-teal-950/40">
              <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center relative">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={studentName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <KeyRound className="w-8 h-8 text-teal-400" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#0A192F] border border-teal-400/40 flex items-center justify-center text-teal-400 shadow-md">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          {/* Titre & sous-titre officiel */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[11px] font-mono text-teal-300 font-medium">
              <span>Sécurité DSI • KLF Support</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight font-['Lexend'] mt-2">
              Espace personnel protégé
            </h1>
            <p className="text-sm text-slate-300 font-medium">
              {studentName}
            </p>
            {equipe && (
              <p className="text-xs text-slate-400">
                {equipe} • Session TIP C26031A
              </p>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            Bonjour <strong>{firstName}</strong>, veuillez saisir votre <strong>code PIN agent (4 chiffres)</strong> pour déverrouiller votre passeport de compétences et accéder à votre dossier professionnel.
          </p>

          {/* Formulaire PIN avec noValidate obligatoire */}
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label htmlFor="pin-input" className="sr-only">
                Code PIN à 4 chiffres
              </label>
              <div className="relative">
                <input
                  id="pin-input"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="current-password"
                  autoFocus
                  disabled={isPending}
                  value={pin}
                  onChange={(e) => {
                    // Chiffres uniquement
                    const val = e.target.value.replace(/\D/g, '');
                    setPin(val);
                    if (error) setError(null);
                  }}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3.5 px-4 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-600 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
                />
              </div>
            </div>

            {/* Alerte d'erreur contextuelle ShanFlow */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left animate-in fade-in duration-150">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Bouton de validation */}
            <button
              type="submit"
              disabled={isPending || pin.length < 4}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Vérification DSI...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>Accéder à mon passeport</span>
                </>
              )}
            </button>
          </form>

          {/* Assistance & retour public */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2.5 text-xs text-slate-400">
            <p className="text-[11px] text-slate-400">
              💡 <em>PIN oublié ou première connexion ?</em> Demandez instantanément votre code d&apos;accès au formateur en salle.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors mt-1 font-mono text-[11px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour au classement général de la promotion</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
