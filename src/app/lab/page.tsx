import React from 'react';
import Link from 'next/link';
import { ALL_LABS } from '@/lib/lab/labData';
import { getActiveTechnicianId } from '@/lib/studentAuth';
import { getApprenantById } from '@/lib/supabase';
import { 
  FlaskConical, 
  Sparkles, 
  ArrowRight, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileText, 
  Network, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';

export const revalidate = 10;

export default async function LabCatalogPage() {
  const activeTechnicianId = await getActiveTechnicianId();
  const currentStudent = activeTechnicianId ? await getApprenantById(activeTechnicianId) : null;

  return (
    <div className="space-y-8">
      
      {/* Hero Banner KLF Tech Lab */}
      <div className="relative p-6 sm:p-8 rounded-3xl slate-glass overflow-hidden border border-white/10">
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
              KLF Virtual Tech Lab • Ateliers Pratiques TIP
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-400 bg-white/5 border border-white/5">
              Promotion C26031A • METAFORE Jarry
            </span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Lexend'] tracking-tight">
              Ateliers et travaux pratiques KLF
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Mettez en pratique vos compétences techniques directement dans l&apos;interface. Téléchargez les fichiers de production de Karukera Logistique &amp; Fret, appliquez vos remédiations en conditions réelles et faites auto-auditer vos classeurs et livrables en direct.
            </p>
          </div>

          {currentStudent ? (
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-teal-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Session active : <strong>{currentStudent.prenom} {currentStudent.nom}</strong> ({currentStudent.points_total} pts)</span>
            </div>
          ) : (
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-amber-300">
              <span>⚠️ Prise de poste recommandée via le bouton en haut à droite pour enregistrer vos points.</span>
            </div>
          )}
        </div>
      </div>

      {/* Catalogue des Ateliers TP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-['Lexend'] flex items-center gap-2">
            <span>Catalogue des ateliers disponibles</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-mono">
              {ALL_LABS.length} ateliers
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_LABS.map((lab) => {
            const isOpen = lab.statut === 'ouvert';

            return (
              <div
                key={lab.id}
                className={`p-5 rounded-3xl slate-glass border flex flex-col justify-between transition-all ${
                  isOpen
                    ? 'border-white/10 hover:border-teal-500/40 hover:shadow-[0_8px_30px_rgba(0,180,216,0.15)] group'
                    : 'border-white/5 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      {lab.domaine.toUpperCase()} • {lab.palier}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      +{lab.points_total} pts
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white font-['Lexend'] group-hover:text-teal-300 transition-colors">
                      {lab.titre}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {lab.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lab.duree_estimee}
                    </span>
                    <span>
                      {lab.jalons.length > 0 ? `${lab.jalons.length} jalons d'audit` : 'En préparation'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  {isOpen ? (
                    <Link
                      href={`/lab/${lab.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border border-teal-500/30 transition-all shadow-sm active:scale-95"
                    >
                      <span>Ouvrir l&apos;établi technique</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono text-slate-500 bg-white/5 border border-white/5 cursor-not-allowed">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bientôt disponible</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
