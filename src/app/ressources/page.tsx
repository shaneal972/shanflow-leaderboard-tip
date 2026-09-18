'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { RESSOURCES_DATA } from '@/data/ressourcesData';
import { BureautiqueTool } from '@/types/ressource';
import {
  BookOpen,
  FileSpreadsheet,
  FileText,
  Presentation,
  Mail,
  Search,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export default function RessourcesPage() {
  const [selectedTool, setSelectedTool] = useState<'all' | BureautiqueTool>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toolTabs = [
    { id: 'all', label: 'Toutes les ressources', icon: BookOpen, count: RESSOURCES_DATA.length },
    { id: 'sheets', label: 'Sheets & Excel', icon: FileSpreadsheet, color: 'text-emerald-400', count: RESSOURCES_DATA.filter(r => r.outil === 'sheets').length },
    { id: 'docs', label: 'Docs & Word', icon: FileText, color: 'text-blue-400', count: RESSOURCES_DATA.filter(r => r.outil === 'docs').length },
    { id: 'slides', label: 'Slides & Présentations', icon: Presentation, color: 'text-amber-400', count: RESSOURCES_DATA.filter(r => r.outil === 'slides').length },
    { id: 'gmail', label: 'Gmail & Workspace', icon: Mail, color: 'text-rose-400', count: RESSOURCES_DATA.filter(r => r.outil === 'gmail').length },
  ] as const;

  const filteredRessources = useMemo(() => {
    return RESSOURCES_DATA.filter((r) => {
      const matchTool = selectedTool === 'all' || r.outil === selectedTool;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.titre.toLowerCase().includes(q) ||
        r.resume.toLowerCase().includes(q) ||
        r.categorie.toLowerCase().includes(q) ||
        r.raccourcisCles.some((rc) => rc.touche.toLowerCase().includes(q) || rc.action.toLowerCase().includes(q));

      return matchTool && matchSearch;
    });
  }, [selectedTool, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* En-tête Principal */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 slate-glass border border-white/10 space-y-4">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-widest font-mono text-teal-400 font-semibold">
                Support DSI • Titre Professionnel TIP
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Lexend'] tracking-tight">
              Académie bureautique & pratiques collaboratives
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Fiches réflexes techniques, guides pas-à-pas et mémos de référence KLF pour maîtriser la bureautique d'entreprise, réussir vos tickets d'incidents et préparer les livrables de votre Dossier Professionnel (DP).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-black/30 p-3 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-xs font-mono text-slate-400">Guides opérationnels</div>
              <div className="text-lg font-mono font-bold text-teal-400">8 à 10 min / guide</div>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une formule, un raccourci, un outil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 font-medium transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
            {toolTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTool === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTool(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-teal-500/20 border-teal-500/40 text-teal-200 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${'color' in tab ? tab.color : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/10 text-slate-300">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grille des Ressources */}
      {filteredRessources.length === 0 ? (
        <div className="p-12 text-center rounded-2xl slate-glass border border-white/10 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">Aucun guide ne correspond à votre recherche</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Essayez avec d'autres mots-clés comme "RECHERCHEV", "figeage", "saut de page" ou réinitialisez les filtres.
          </p>
          <button
            type="button"
            onClick={() => { setSelectedTool('all'); setSearchQuery(''); }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRessources.map((ressource) => {
            const isSheets = ressource.outil === 'sheets';
            const isDocs = ressource.outil === 'docs';
            const isSlides = ressource.outil === 'slides';

            const ToolIcon = isSheets
              ? FileSpreadsheet
              : isDocs
              ? FileText
              : isSlides
              ? Presentation
              : Mail;

            const toolColor = isSheets
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : isDocs
              ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
              : isSlides
              ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
              : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

            return (
              <div
                key={ressource.id}
                className="flex flex-col justify-between p-5 rounded-2xl slate-glass border border-white/10 hover:border-teal-500/40 transition-all group hover:shadow-xl hover:shadow-teal-500/5 space-y-4"
              >
                <div className="space-y-3">
                  {/* Badges en-tête */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${toolColor}`}>
                      <ToolIcon className="w-3.5 h-3.5" />
                      <span>{isSheets ? 'Google Sheets' : isDocs ? 'Google Docs' : isSlides ? 'Google Slides' : 'Gmail'}</span>
                    </span>

                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-teal-400" />
                      <span>{ressource.tempsLecture}</span>
                    </span>
                  </div>

                  {/* Titre & résumé */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors font-['Lexend'] line-clamp-2">
                      {ressource.titre}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                      {ressource.resume}
                    </p>
                  </div>

                  {/* Raccourcis en avant-première */}
                  {ressource.raccourcisCles && ressource.raccourcisCles.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                        Raccourcis clés du technicien :
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ressource.raccourcisCles.slice(0, 2).map((rc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300"
                          >
                            <strong className="text-teal-300">{rc.touche}</strong> : {rc.action.substring(0, 25)}...
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ticket KLF associé */}
                  {ressource.ticketAssocieId && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 font-mono bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Applicable sur le ticket <strong>{ressource.ticketAssocieId}</strong></span>
                    </div>
                  )}
                </div>

                {/* Bouton d'accès */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {ressource.palier} • {ressource.etapesDetaillees.length} étapes
                  </span>

                  <Link
                    href={`/ressources/${ressource.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-300 hover:text-white bg-teal-500/10 hover:bg-teal-500/25 border border-teal-500/30 transition-all group-hover:translate-x-0.5"
                  >
                    <span>Consulter le guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
