'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Apprenant, TicketKLF, Badge, DPSuivi, QuizWithStats, TicketResolution } from '@/types/tip';
import { Users, Ticket, Trophy, FileCheck2, BookOpen, FileSpreadsheet, FileText } from 'lucide-react';
import { AdminStudentTable } from './AdminStudentTable';
import { AdminTicketManager } from './AdminTicketManager';
import { AdminBadgeMatrix } from './AdminBadgeMatrix';
import { AdminDPOverview } from './AdminDPOverview';
import { AdminQuizManager } from './AdminQuizManager';
import { AdminQualiopiModal } from './AdminQualiopiModal';

interface AdminDashboardTabsProps {
  students: Apprenant[];
  tickets: TicketKLF[];
  badges: Badge[];
  achievements: { apprenant_id: string; badge_id: string }[];
  dpRecords: DPSuivi[];
  quizzes?: QuizWithStats[];
  resolutions?: TicketResolution[];
}

export const AdminDashboardTabs: React.FC<AdminDashboardTabsProps> = ({
  students,
  tickets,
  badges,
  achievements,
  dpRecords,
  quizzes = [],
  resolutions = [],
}) => {
  const router = useRouter();
  const [studentsList, setStudentsList] = useState<Apprenant[]>(students);
  const [ticketsList, setTicketsList] = useState<TicketKLF[]>(tickets);
  const [resolutionsList, setResolutionsList] = useState<TicketResolution[]>(resolutions);
  const [activeTab, setActiveTab] = useState<'apprenants' | 'tickets' | 'badges' | 'dp' | 'quiz'>('apprenants');
  const [isQualiopiOpen, setIsQualiopiOpen] = useState<boolean>(false);

  // Synchronisation avec les props serveur reçues
  useEffect(() => {
    setStudentsList(students);
  }, [students]);

  useEffect(() => {
    setTicketsList(tickets);
  }, [tickets]);

  useEffect(() => {
    setResolutionsList(resolutions);
  }, [resolutions]);

  // Callbacks de mise à jour instantanée (Optimistic UI 0ms)
  const handleStudentCreated = (newStudent: Apprenant) => {
    setStudentsList((prev) => [newStudent, ...prev]);
    router.refresh();
  };

  const handleStudentUpdated = (updated: Apprenant) => {
    setStudentsList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    router.refresh();
  };

  const handleStudentDeleted = (studentId: string) => {
    setStudentsList((prev) => prev.filter((s) => s.id !== studentId));
    router.refresh();
  };

  const handlePointsAdjusted = (studentId: string, newPoints: number, newPalier: string) => {
    setStudentsList((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, points_total: newPoints, palier_actuel: (newPalier as any) || s.palier_actuel }
          : s
      )
    );
    router.refresh();
  };

  const handleTicketCreated = (newTicket: TicketKLF) => {
    setTicketsList((prev) => [newTicket, ...prev]);
    router.refresh();
  };

  const handleTicketStatusChanged = (ticketId: string, newStatus: 'ouvert' | 'en_cours' | 'resolu') => {
    setTicketsList((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, statut: newStatus } : t))
    );
    router.refresh();
  };

  const pendingTicketsCount = resolutionsList.filter((r) => r.statut === 'en_attente_validation').length;

  const tabs = [
    {
      id: 'apprenants',
      label: 'Apprenants',
      count: studentsList.length,
      icon: Users,
      color: 'text-teal-400',
      activeBg: 'bg-teal-500/15 border-teal-500/40 text-teal-200',
    },
    {
      id: 'quiz',
      label: 'Quiz KLF',
      count: quizzes.length,
      icon: BookOpen,
      color: 'text-purple-400',
      activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-200',
    },
    {
      id: 'tickets',
      label: 'Tickets KLF',
      count: pendingTicketsCount > 0 ? `${ticketsList.length} (${pendingTicketsCount} ⏳)` : ticketsList.length,
      icon: Ticket,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-200',
    },
    {
      id: 'badges',
      label: 'Badges KLF',
      count: badges.length,
      icon: Trophy,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200',
    },
    {
      id: 'dp',
      label: 'Dossier pro (DP)',
      count: dpRecords.length,
      icon: FileCheck2,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200',
    },
  ] as const;

  return (
    <div className="space-y-5">
      
      {/* Contrôle principal : Onglets en grille 100% visible (zéro scroll) + Actions Qualiopi */}
      <div className="space-y-3">
        {/* Navigation par onglets en grille fluide */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 rounded-2xl slate-glass border border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center sm:justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? `${tab.activeBg} shadow-lg shadow-black/30 ring-1 ring-white/10`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${tab.color}`} />
                  <span className="truncate">{tab.label}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-white/10 border border-white/10 text-slate-300 shrink-0">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bandeau d'actions Qualiopi officiel & export */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0A192F]/60 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Conformité Qualiopi</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">Traçabilité des acquis (Ind. 8) &amp; Dossier Pro (Ind. 11)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/admin/qualiopi/pdf"
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-teal-500/10 hover:from-teal-500/30 hover:to-teal-500/20 text-teal-300 hover:text-white border border-teal-500/30 hover:border-teal-500/50 text-xs font-mono font-semibold transition-all shadow-md shadow-teal-500/10 cursor-pointer"
              title="Générer et télécharger le bilan Qualiopi officiel en PDF A4 paysage via Gotenberg Chromium"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>📄 Exporter bilan Qualiopi (PDF Gotenberg)</span>
            </a>

            <button
              type="button"
              onClick={() => setIsQualiopiOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 shadow-md shadow-emerald-950/30 transition-all cursor-pointer whitespace-nowrap"
              title="Consulter le tableau d'audit en ligne et exporter au format CSV Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>📊 Bilan interactif (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rendu dynamique du module sélectionné */}
      <div>
        {activeTab === 'apprenants' && (
          <AdminStudentTable 
            students={studentsList} 
            onStudentCreated={handleStudentCreated}
            onStudentUpdated={handleStudentUpdated}
            onStudentDeleted={handleStudentDeleted}
            onPointsAdjusted={handlePointsAdjusted}
          />
        )}

        {activeTab === 'quiz' && (
          <AdminQuizManager 
            quizzes={quizzes} 
            students={studentsList} 
          />
        )}

        {activeTab === 'tickets' && (
          <AdminTicketManager 
            tickets={ticketsList} 
            students={studentsList} 
            resolutions={resolutionsList}
            onTicketCreated={handleTicketCreated}
            onTicketStatusChanged={handleTicketStatusChanged}
            onPointsAdjusted={handlePointsAdjusted}
          />
        )}

        {activeTab === 'badges' && (
          <AdminBadgeMatrix 
            students={studentsList} 
            badges={badges} 
            achievements={achievements} 
          />
        )}

        {activeTab === 'dp' && (
          <AdminDPOverview 
            students={studentsList} 
            dpRecords={dpRecords} 
          />
        )}
      </div>

      {/* Modale d'audit Qualiopi pour le formateur */}
      <AdminQualiopiModal
        isOpen={isQualiopiOpen}
        onClose={() => setIsQualiopiOpen(false)}
      />

    </div>
  );
};
