'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { LeaderboardApprenant } from '@/types/tip';
import { Trophy, Medal, Award, ExternalLink, Filter, Search, ShieldCheck } from 'lucide-react';

interface LeaderboardTableProps {
  initialData: LeaderboardApprenant[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ initialData }) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Liste des équipes distinctes
  const teams = useMemo(() => {
    const all = initialData.map((d) => d.equipe).filter(Boolean);
    return Array.from(new Set(all));
  }, [initialData]);

  // Données filtrées et classées
  const filteredData = useMemo(() => {
    return initialData
      .filter((item) => {
        const matchesTeam = selectedTeam === 'all' || item.equipe === selectedTeam;
        const fullName = `${item.prenom} ${item.nom_initial}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase());
        return matchesTeam && matchesSearch;
      })
      .sort((a, b) => b.points_total - a.points_total);
  }, [initialData, selectedTeam, searchQuery]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm shadow-[0_0_12px_rgba(245,158,11,0.4)]">
          <Trophy className="w-4 h-4 text-amber-400" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-lg bg-slate-300/20 border border-slate-300/40 flex items-center justify-center text-slate-300 font-bold text-sm">
          <Medal className="w-4 h-4 text-slate-300" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-700/20 border border-amber-700/40 flex items-center justify-center text-amber-600 font-bold text-sm">
          <Award className="w-4 h-4 text-amber-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-mono text-xs">
        #{rank}
      </div>
    );
  };

  const getPalierColor = (palier: string) => {
    switch (palier) {
      case 'Palier 4':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Palier 3':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'Palier 2':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'Palier 1':
        return 'text-slate-300 bg-slate-500/10 border-slate-500/30';
      default:
        return 'text-slate-400 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Barre de contrôles et filtres */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl slate-glass">
        
        {/* Recherche apprenant (RGPD-safe : cherche sur prénom / initiale) */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer un technicien..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#070F1E] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
          />
        </div>

        {/* Filtre par Escouade / Équipe */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            aria-label="Filtrer par escouade ou équipe"
            className="px-3 py-1.5 rounded-lg bg-[#070F1E] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-teal-400 transition-colors cursor-pointer"
          >
            <option value="all">Toutes les escouades ({initialData.length})</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        {/* Indicateur RGPD */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Vue pseudo-anonymisée (RGPD)</span>
        </div>

      </div>

      {/* Tableau Responsive Tablette & Mobile avec Colonne Actions Sticky */}
      <div className="rounded-xl border border-white/10 bg-[#0A192F]/60 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#112240]/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 w-16 text-center">Rang</th>
                <th className="py-3.5 px-4">Technicien TIP</th>
                <th className="py-3.5 px-4">Escouade</th>
                <th className="py-3.5 px-4">Palier actuel</th>
                <th className="py-3.5 px-4 text-center">Badges</th>
                <th className="py-3.5 px-4 text-right">Points KLF</th>
                <th className="py-3.5 px-4 text-center w-36 sticky-actions-col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredData.map((item, index) => {
                const rank = index + 1;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Rang médaillé */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">
                        {getRankBadge(rank)}
                      </div>
                    </td>

                    {/* Technicien (Pseudo-anonymisé RGPD) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-teal-400">
                          {item.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.avatar_url}
                              alt={`${item.prenom} ${item.nom_initial}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            `${item.prenom[0]}${item.nom_initial[0]}`
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5 font-['Lexend']">
                            <span>{item.prenom} {item.nom_initial}</span>
                            {rank <= 3 && (
                              <span className="text-[10px] text-amber-400 font-mono">TOP {rank}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            ID: {item.id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Escouade */}
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono">
                        {item.equipe}
                      </span>
                    </td>

                    {/* Palier Actuel */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getPalierColor(item.palier_actuel)}`}>
                        {item.palier_actuel}
                      </span>
                    </td>

                    {/* Badges Obtenus */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-xs text-amber-400">
                        <span>🏆</span>
                        <span>{item.badges_count || 0}</span>
                      </div>
                    </td>

                    {/* Points Totaux */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-base font-bold text-white font-['Lexend'] tracking-tight">
                        {item.points_total}
                      </span>
                      <span className="text-[11px] text-teal-400 ml-1 font-mono">pts</span>
                    </td>

                    {/* Colonne Sticky Action avec Ombre Tablette */}
                    <td className="py-3.5 px-4 text-center sticky-actions-col">
                      <Link
                        href={`/passport/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm"
                      >
                        <span>Passeport</span>
                        <ExternalLink className="w-3 h-3 text-teal-400" />
                      </Link>
                    </td>

                  </tr>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs font-mono">
                    Aucun technicien trouvé pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
