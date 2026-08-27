'use client';

import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'apprenants' | 'tickets' | 'badges' | 'dp'>('apprenants');

  const tabs = [
    {
      id: 'apprenants',
      label: 'Gestion des apprenants',
      count: students.length,
      icon: Users,
      color: 'text-teal-400',
      activeBg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
    },
    {
      id: 'tickets',
      label: 'Gestionnaire des tickets KLF',
      count: tickets.length,
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
          <AdminStudentTable students={students} />
        )}

        {activeTab === 'tickets' && (
          <AdminTicketManager tickets={tickets} students={students} />
        )}

        {activeTab === 'badges' && (
          <AdminBadgeMatrix 
            students={students} 
            badges={badges} 
            achievements={achievements} 
          />
        )}

        {activeTab === 'dp' && (
          <AdminDPOverview 
            students={students} 
            dpRecords={dpRecords} 
          />
        )}
      </div>

    </div>
  );
};
