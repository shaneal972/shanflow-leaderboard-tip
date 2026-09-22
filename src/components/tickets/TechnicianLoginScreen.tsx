'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  KeyRound, 
  User, 
  Loader2, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { loginTechnicianAction } from '@/app/tickets/actions';

interface TechnicianLoginScreenProps {
  onSuccess?: (student: {
    id: string;
    prenom: string;
    nom: string;
    points_total: number;
    palier_actuel: string;
    equipe: string;
  }) => void;
  compact?: boolean;
}

export const TechnicianLoginScreen: React.FC<TechnicianLoginScreenProps> = ({ onSuccess, compact = false }) => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Veuillez renseigner votre identifiant ou adresse e-mail d'agent.");
      return;
    }
    if (!pin.trim() || pin.trim().length < 4) {
      setError('Veuillez saisir votre code PIN DSI à 4 chiffres.');
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await loginTechnicianAction(identifier.trim(), pin.trim());
      if (res.success && res.student) {
        // Enregistrer l'ID dans le localStorage pour l'accessibilité client immédiate
        localStorage.setItem('klf_active_student_id', res.student.id);
        if (onSuccess) {
          onSuccess(res.student);
        } else {
          router.refresh();
        }
      } else {
        setError(res.error || 'Identifiant ou code PIN incorrect.');
      }
    });
  };

  if (compact) {
    return (
      <div className="w-full space-y-4">
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
          {/* Champ Identifiant */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>Identifiant ou e-mail KLF</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ex : Chloé SAHA ou son e-mail KLF"
                disabled={isPending}
                className="w-full bg-[#0A1324] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 transition-colors disabled:opacity-50"
                autoComplete="username"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Saisissez votre prénom, votre nom ou l&apos;e-mail utilisé lors de votre inscription.
            </p>
          </div>

          {/* Champ Code PIN */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                <span>Code PIN DSI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">4 chiffres</span>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  if (error) setError(null);
                }}
                placeholder="••••"
                disabled={isPending}
                className="w-full bg-[#0A1324] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-400 transition-colors disabled:opacity-50 pr-10"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Vérification des accès DSI...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Prendre mon poste d&apos;intervention</span>
              </>
            )}
          </button>
        </form>

        {/* Reassurance RGPD */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Session étanche & conforme RGPD • Aucun nom public exposé</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto py-10 px-4">
      <div className="slate-glass rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/70 bg-[#070F1E]/90 backdrop-blur-xl relative overflow-hidden">
        
        {/* Halos décoratifs KLF */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-5">
          
          {/* Badge Icon */}
          <div className="relative inline-block">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-950/50">
              <Headphones className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[#0A192F] border border-teal-400/50 flex items-center justify-center text-teal-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Helpdesk KLF • Karukera Logistique & Fret
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight font-['Lexend'] mt-1">
              Prise de poste technicien support
            </h1>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Connectez-vous avec votre identifiant agent et votre code PIN pour accéder à vos tickets d&apos;incidents et enregistrer vos interventions.
            </p>
          </div>

          {/* Formulaire de prise de poste */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left pt-2">
            
            {/* Champ Identifiant */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span>Identifiant ou e-mail KLF</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Ex : Chloé SAHA ou son e-mail KLF"
                  disabled={isPending}
                  className="w-full bg-[#0A1324] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-400 transition-colors disabled:opacity-50"
                  autoComplete="username"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Saisissez votre prénom, votre nom ou l&apos;e-mail utilisé lors de votre inscription.
              </p>
            </div>

            {/* Champ Code PIN */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                  <span>Code PIN DSI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">4 chiffres</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''));
                    if (error) setError(null);
                  }}
                  placeholder="••••"
                  disabled={isPending}
                  className="w-full bg-[#0A1324] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-400 transition-colors disabled:opacity-50 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Vérification des accès DSI...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Prendre mon poste d&apos;intervention</span>
                </>
              )}
            </button>
          </form>

          {/* Reassurance RGPD */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Session étanche & conforme RGPD • Aucun nom public exposé</span>
          </div>
        </div>
      </div>
    </div>
  );
};
