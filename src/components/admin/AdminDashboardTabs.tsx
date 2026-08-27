'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Apprenant, TicketKLF, Badge, DPSuivi } from '@/types/tip';
import { Users, Ticket, Trophy, FileCheck2 } from 'lucide-react';
import { AdminStudentTable } from './AdminStudentTable';
import { AdminTicketManager } from './AdminTicketManager';
import { AdminBadgeMatrix } from './AdminBadgeMatrix';
import { AdminDPOverview } from './AdminDPOverview';

interface AdminDashboardTabsProps {
  students: Apprenant[];
  tickets: TicketKLF[];
  badges: Badge[];
  achievements: { apprenant_id: string; badge_id: string }[];
  dpRecords: DPSuivi[];
}

export const AdminDashboardTabs: React.FC<AdminDashboardTabsProps> = ({
  students,
  tickets,
  badges,
  achievements,
  dpRecords,
}) => {
  const router = useRouter();
  const [studentsList, setStudentsList] = useState<Apprenant[]>(students);
  const [ticketsList, setTicketsList] = useState<TicketKLF[]>(tickets);
  const [activeTab, setActiveTab] = useState<'apprenants' | 'tickets' | 'badges' | 'dp'>('apprenants');

  // Synchronisation avec les props serveur reçues
  useEffect(() => {
    setStudentsList(students);
  }, [students]);

  useEffect(() => {
    setTicketsList(tickets);
  }, [tickets]);

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

  const tabs = [
    {
      id: 'apprenants',
      label: 'Gestion des apprenants',
      count: studentsList.length,
      icon: Users,
      color: 'text-teal-400',
      activeBg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
    },
    {
      id: 'tickets',
      label: 'Gestionnaire des tickets KLF',
      count: ticketsList.length,
      icon: Ticket,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    },
    {
      id: 'badges',
      label: 'Matrice des trophées KLF',
      count: badges.length,
      icon: Trophy,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
    },
    {
      id: 'dp',
      label: 'Superviseur du dossier professionnel',
      count: dpRecords.length,
      icon: FileCheck2,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    },
  ] as const;

  return (
    <div className="space-y-6">
      
      {/* Barre d'onglets de navigation rapide */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl slate-glass border border-white/10 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? `${tab.activeBg} shadow-lg shadow-black/20`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.color}`} />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-white/5 border border-white/5 text-slate-300">
                {tab.count}
              </span>
            </button>
          );
        })}
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

        {activeTab === 'tickets' && (
          <AdminTicketManager 
            tickets={ticketsList} 
            students={studentsList} 
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

    </div>
  );
};
