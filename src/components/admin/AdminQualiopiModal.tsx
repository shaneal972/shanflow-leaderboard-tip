'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  GraduationCap, 
  Award, 
  FileCheck2, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Building2, 
  HelpCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { QualiopiReportData, QualiopiStudentRow } from '@/types/tip';
import { getQualiopiReportDataAction } from '@/app/admin/actions';

interface AdminQualiopiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminQualiopiModal: React.FC<AdminQualiopiModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<QualiopiReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'synthese' | 'cadrage'>('synthese');

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getQualiopiReportDataAction();
      if (res.success && res.report) {
        setData(res.report);
      } else {
        setError(res.error || 'Impossible de récupérer les indicateurs Qualiopi.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau lors de la communication serveur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen]);

  // Fermeture par la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Téléchargement du fichier CSV conforme Excel & Antilles
  const handleDownloadCsv = () => {
    if (!data || !data.students) return;

    const escapeCell = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Identifiant_Apprenant',
      'Nom',
      'Prenom',
      'Email',
      'Equipe',
      'Date_Test_Positionnement',
      'Score_Positionnement_Sur_20',
      'Score_Positionnement_Pourcentage',
      'Statut_Positionnement',
      'Badges_Obtenus_Total',
      'Points_KLF_Total',
      'Palier_Actuel',
      'DP_Rubrique_1_Taches',
      'DP_Rubrique_2_Moyens',
      'DP_Rubrique_3_Equipe',
      'DP_Rubrique_4_Contexte',
      'DP_Rubrique_5_Info_Comp',
      'Statut_Dossier_Professionnel',
    ];

    const formatDPStatus = (status: string) => {
      if (status === 'valide_jury') return 'Validé jury';
      if (status === 'en_revue') return 'En revue';
      return 'Brouillon';
    };

    const rows = data.students.map((s) => [
      escapeCell(s.apprenant_id),
      escapeCell(s.nom),
      escapeCell(s.prenom),
      escapeCell(s.email),
      escapeCell(s.equipe),
      escapeCell(s.date_test_positionnement),
      escapeCell(s.score_positionnement_sur_20 !== null ? s.score_positionnement_sur_20 : 'Non effectué'),
      escapeCell(s.score_positionnement_pourcentage !== null ? `${s.score_positionnement_pourcentage}%` : 'Non effectué'),
      escapeCell(s.statut_positionnement),
      escapeCell(s.badges_obtenus_total),
      escapeCell(s.points_klf_total),
      escapeCell(s.palier_actuel),
      escapeCell(s.dp_rubrique_1 ? 'Validé' : 'Non validé'),
      escapeCell(s.dp_rubrique_2 ? 'Validé' : 'Non validé'),
      escapeCell(s.dp_rubrique_3 ? 'Validé' : 'Non validé'),
      escapeCell(s.dp_rubrique_4 ? 'Validé' : 'Non validé'),
      escapeCell(s.dp_rubrique_5 ? 'Validé' : 'Non validé'),
      escapeCell(formatDPStatus(s.statut_dossier_professionnel)),
    ]);

    // Encodage strict UTF-8 avec BOM (\uFEFF) pour compatibilité Excel Windows/Mac
    const bom = '\uFEFF';
    const csvContent = bom + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `${todayStr}_FORE-Alternance_Bilan-Qualiopi_TIP-C26031A.csv`;

    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtrage des apprenants
  const filteredStudents = (data?.students || []).filter((s) => {
    const matchesSearch = 
      `${s.prenom} ${s.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || s.equipe === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  const teams = Array.from(new Set((data?.students || []).map((s) => s.equipe)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl slate-glass border border-white/15 shadow-2xl shadow-black/80 overflow-hidden bg-[#070F1E]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* En-tête de la modale */}
        <header className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-4 bg-[#0A192F]/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-['Lexend'] tracking-tight">
                  Bilan Qualiopi • Traçabilité et audit réglementaire
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  CFA FORE Alternance
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-300 border border-white/10">
                  Session C26031A
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Éléments de preuve pour les indicateurs 8 (Positionnement initial) et 11 (Progression continue) • TP TIP Jarry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchReport}
              disabled={loading}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
              title="Rafraîchir les données de synthèse"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title="Fermer la modale"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Corps de la modale */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {loading && !data && (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
              <p className="text-sm text-slate-300">Génération du bilan Qualiopi en cours...</p>
              <p className="text-xs text-slate-500">Agrégation des tests Palier 0, badges KLF et dossiers professionnels</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {data && (
            <>
              {/* 3 Cartes de KPI Synthétiques pour l'auditeur */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* KPI 1 : Taux de passage du test d'entrée (Indicateur 8) */}
                <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
                        Indicateur 8 • Test d&apos;entrée
                      </span>
                      <div className="text-2xl font-bold text-white font-['Lexend'] mt-1">
                        {data.kpis.count_passage_test} / {data.kpis.total_stagiaires} <span className="text-xs font-normal text-slate-400 font-sans">stagiaires</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-teal-500 rounded-full transition-all duration-500" 
                        style={{ width: `${data.kpis.taux_passage_test}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-300">
                      {data.kpis.taux_passage_test}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Test de positionnement Palier 0 (Standards RAN)
                  </p>
                </div>

                {/* KPI 2 : Moyenne générale de la promotion */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                        Moyenne de la promotion
                      </span>
                      <div className="text-2xl font-bold text-white font-['Lexend'] mt-1">
                        {data.kpis.moyenne_generale_positionnement} <span className="text-xs font-normal text-slate-400 font-sans">/ 20</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/20">
                      Seuil de validation : 15 / 20 (75%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Diagnostic initial des prérequis bureautiques & DSI
                  </p>
                </div>

                {/* KPI 3 : Taux d'avancement du Dossier Professionnel (Indicateur 11) */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                        Indicateur 11 • Dossier pro
                      </span>
                      <div className="text-2xl font-bold text-white font-['Lexend'] mt-1">
                        {data.kpis.taux_avancement_moyen_dp}% <span className="text-xs font-normal text-slate-400 font-sans">avancement</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${data.kpis.taux_avancement_moyen_dp}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      5 rubriques Cerfa
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Suivi formel REAC Ministère du Travail (CCP 1)
                  </p>
                </div>

              </div>

              {/* Navigation des sous-onglets & filtres */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('synthese')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'synthese'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200 bg-white/5 border border-transparent'
                    }`}
                  >
                    Tableau de synthèse de la promotion ({filteredStudents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cadrage')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === 'cadrage'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'text-slate-400 hover:text-slate-200 bg-white/5 border border-transparent'
                    }`}
                  >
                    Référentiel & critères Qualiopi
                  </button>
                </div>

                {activeTab === 'synthese' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Rechercher un stagiaire..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                    {teams.length > 1 && (
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-white/10 text-slate-300 focus:outline-none focus:border-teal-500/50"
                      >
                        <option value="all">Toutes les équipes</option>
                        {teams.map((team) => (
                          <option key={team} value={team}>{team}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Vue 1 : Tableau de synthèse de la promotion */}
              {activeTab === 'synthese' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto max-w-full -webkit-overflow-scrolling: touch rounded-xl border border-white/10 bg-slate-900/40">
                    <table className="w-full text-left text-xs min-w-[760px]">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px] bg-white/5">
                          <th className="py-3 px-4">Stagiaire</th>
                          <th className="py-3 px-3">Équipe</th>
                          <th className="py-3 px-3">Date diagnostic</th>
                          <th className="py-3 px-3 text-center">Note entrée</th>
                          <th className="py-3 px-3 text-center">Seuil atteint</th>
                          <th className="py-3 px-3 text-center">Badges KLF</th>
                          <th className="py-3 px-3 text-center">Rubriques DP</th>
                          <th className="py-3 px-4">Avis formateur</th>
                          <th className="py-3 px-3 text-right sticky right-0 z-10 bg-[#0A192F] shadow-[-8px_0_12px_rgba(0,0,0,0.5)]">
                            Détail
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-400">
                              Aucun apprenant ne correspond aux critères de recherche.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((s) => {
                            const isExpanded = expandedStudentId === s.apprenant_id;

                            return (
                              <React.Fragment key={s.apprenant_id}>
                                <tr className={`hover:bg-white/5 transition-colors ${isExpanded ? 'bg-white/5' : ''}`}>
                                  {/* Nom & Avatar */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 overflow-hidden shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={s.avatar_url} alt={s.prenom} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                        <div className="font-semibold text-white">
                                          {s.prenom} {s.nom}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono">
                                          {s.email}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Équipe */}
                                  <td className="py-3 px-3 text-slate-300">
                                    <span className="inline-flex items-center gap-1 text-[11px]">
                                      <Building2 className="w-3 h-3 text-slate-400" />
                                      <span>{s.equipe}</span>
                                    </span>
                                  </td>

                                  {/* Date test positionnement */}
                                  <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                                    {s.date_test_positionnement}
                                  </td>

                                  {/* Note sur 20 */}
                                  <td className="py-3 px-3 text-center">
                                    {s.score_positionnement_sur_20 !== null ? (
                                      <span className="font-mono font-bold text-white text-xs">
                                        {s.score_positionnement_sur_20} <span className="text-[10px] text-slate-400">/ 20</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 font-mono text-[11px]">-</span>
                                    )}
                                  </td>

                                  {/* Seuil atteint */}
                                  <td className="py-3 px-3 text-center">
                                    {s.statut_positionnement === 'Validé' && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Oui ({s.score_positionnement_pourcentage}%)</span>
                                      </span>
                                    )}
                                    {s.statut_positionnement === 'À consolider' && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>À consolider ({s.score_positionnement_pourcentage}%)</span>
                                      </span>
                                    )}
                                    {s.statut_positionnement === 'Non effectué' && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/20">
                                        <XCircle className="w-3 h-3" />
                                        <span>Non passé</span>
                                      </span>
                                    )}
                                  </td>

                                  {/* Badges KLF */}
                                  <td className="py-3 px-3 text-center">
                                    <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-300">
                                      <Award className="w-3.5 h-3.5" />
                                      <span className="font-bold">{s.badges_obtenus_total}</span>
                                      <span className="text-[10px] text-slate-400">/ 10</span>
                                    </span>
                                  </td>

                                  {/* Rubriques DP */}
                                  <td className="py-3 px-3 text-center">
                                    <div className="inline-flex items-center gap-1">
                                      <span className="font-mono font-bold text-emerald-300 text-xs">
                                        {s.dp_rubriques_validees_count} / 5
                                      </span>
                                    </div>
                                  </td>

                                  {/* Avis formateur */}
                                  <td className="py-3 px-4 text-xs text-slate-300">
                                    <span className="line-clamp-1" title={s.avis_formateur}>
                                      {s.avis_formateur}
                                    </span>
                                  </td>

                                  {/* Bouton détail par domaine */}
                                  <td className="py-3 px-3 text-right sticky right-0 z-10 bg-[#0A192F] shadow-[-8px_0_12px_rgba(0,0,0,0.5)]">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedStudentId(isExpanded ? null : s.apprenant_id)}
                                      className="p-1 rounded-md text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors"
                                      title="Voir les scores par domaine Qualiopi"
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-teal-400" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </button>
                                  </td>
                                </tr>

                                {/* Détail étendu : 4 Domaines Qualiopi & Rubriques DP */}
                                {isExpanded && (
                                  <tr className="bg-slate-950/60 border-b border-white/10">
                                    <td colSpan={9} className="p-4">
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                                          <span className="font-mono text-teal-300 text-[11px]">
                                            Acquisition par domaine • Indicateur 8 (Positionnement Palier 0)
                                          </span>
                                          <span className="text-[11px] text-slate-400">
                                            Palier actuel : <span className="font-bold text-white">{s.palier_actuel}</span> • Points KLF : <span className="font-bold text-amber-300">{s.points_klf_total} pts</span>
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                          {s.domaines.map((dom) => (
                                            <div
                                              key={dom.domaine}
                                              className="p-2.5 rounded-lg bg-slate-900/80 border border-white/10 flex flex-col justify-between"
                                            >
                                              <span className="text-[10px] font-mono text-slate-400 line-clamp-1" title={dom.domaine}>
                                                {dom.domaine}
                                              </span>
                                              <div className="flex items-baseline justify-between mt-1">
                                                <span className="text-sm font-bold text-white font-mono">
                                                  {s.has_submitted_positionnement ? `${dom.reponses_correctes} / ${dom.total_questions}` : '-'}
                                                </span>
                                                {s.has_submitted_positionnement && (
                                                  <span className={`text-[10px] font-mono font-semibold ${
                                                    dom.acquis ? 'text-emerald-400' : 'text-amber-400'
                                                  }`}>
                                                    {dom.pourcentage}%
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>

                                        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                                          <span className="font-semibold text-slate-300">Détail DP (Ministère du Travail) :</span>
                                          <span className={s.dp_rubrique_1 ? 'text-emerald-400 font-mono' : 'text-slate-500 font-mono'}>
                                            {s.dp_rubrique_1 ? '✓' : '✗'} 1. Tâches
                                          </span>
                                          <span className={s.dp_rubrique_2 ? 'text-emerald-400 font-mono' : 'text-slate-500 font-mono'}>
                                            {s.dp_rubrique_2 ? '✓' : '✗'} 2. Moyens
                                          </span>
                                          <span className={s.dp_rubrique_3 ? 'text-emerald-400 font-mono' : 'text-slate-500 font-mono'}>
                                            {s.dp_rubrique_3 ? '✓' : '✗'} 3. Équipe
                                          </span>
                                          <span className={s.dp_rubrique_4 ? 'text-emerald-400 font-mono' : 'text-slate-500 font-mono'}>
                                            {s.dp_rubrique_4 ? '✓' : '✗'} 4. Contexte
                                          </span>
                                          <span className={s.dp_rubrique_5 ? 'text-emerald-400 font-mono' : 'text-slate-500 font-mono'}>
                                            {s.dp_rubrique_5 ? '✓' : '✗'} 5. Info comp.
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Vue 2 : Cadrage réglementaire Qualiopi */}
              {activeTab === 'cadrage' && (
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-teal-400 font-bold font-['Lexend'] text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Indicateur 8 : Positionnement à l&apos;entrée et adaptation du parcours</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Le prestataire définit et met en œuvre une évaluation des compétences et des acquis préalables à la prestation.
                      Pour la session TIP (C26031A), ce diagnostic est assuré par le <strong>Test de Positionnement Palier 0</strong>, 
                      couvrant 20 questions clés réparties sur 4 domaines opérationnels (Hygiène Windows/Fichiers, Traitement de texte, 
                      Tableur Sheets/Excel, Posture DSI & Support). Le seuil de validation est fixé à <strong>75% (15/20)</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold font-['Lexend'] text-sm">
                      <FileCheck2 className="w-4 h-4" />
                      <span>Indicateur 11 : Évaluation de l&apos;atteinte des objectifs et progression continue</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Le prestataire évalue l&apos;atteinte par les bénéficiaires des objectifs de la prestation. 
                      La traçabilité repose sur le franchissement des <strong>5 Paliers de compétences</strong>, la collection 
                      des <strong>10 badges KLF</strong> liés à des résolutions d&apos;incidents réels d&apos;entreprise, et le suivi 
                      rigoureux des <strong>5 rubriques officielles Cerfa</strong> constitutives du Dossier Professionnel (DP) 
                      présenté devant le jury du Ministère du Travail (CCP 1).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 text-[11px] space-y-1">
                    <div className="font-semibold text-white">Informations d&apos;archivage réglementaire :</div>
                    <div>• <strong>Centre de formation :</strong> {data.kpis.centre_formation}</div>
                    <div>• <strong>Formateur référent :</strong> {data.kpis.formateur_nom}</div>
                    <div>• <strong>Promotion :</strong> {data.kpis.promotion_nom} ({data.kpis.session_code})</div>
                    <div>• <strong>Date du rapport :</strong> {new Date(data.kpis.generated_at).toLocaleString('fr-FR')}</div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Pied de page avec bouton d'export CSV immédiat */}
        <footer className="p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A192F]/80">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Données prêtes pour l&apos;audit qualité • Encodage UTF-8 BOM &amp; séparateur point-virgule</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Fermer
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={!data || data.students.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>📥 Télécharger l&apos;export officiel (.CSV Excel)</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
