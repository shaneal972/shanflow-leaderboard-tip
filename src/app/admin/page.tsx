import React from 'react';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { 
  getAllApprenantsAdmin, 
  getTicketsData, 
  getAllBadgesAdmin, 
  getAllAchievementsAdmin, 
  getAllDPSuiviAdmin 
} from '@/lib/supabase';
import { AdminDashboardTabs } from '@/components/admin/AdminDashboardTabs';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Données temps réel pour l'administration

export default async function AdminPage() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

  // Chargement parallèle des 4 jeux de données
  const [students, tickets, badges, achievements, dpRecords] = await Promise.all([
    getAllApprenantsAdmin(),
    getTicketsData(),
    getAllBadgesAdmin(),
    getAllAchievementsAdmin(),
    getAllDPSuiviAdmin(),
  ]);

  return (
    <AdminDashboardTabs
      students={students}
      tickets={tickets}
      badges={badges}
      achievements={achievements}
      dpRecords={dpRecords}
    />
  );
}
