import React from 'react';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { 
  getAllApprenantsAdmin, 
  getTicketsData, 
  getAllBadgesAdmin, 
  getAllAchievementsAdmin, 
  getAllDPSuiviAdmin,
  getAllQuizzesAdmin,
  getAllTicketResolutionsAdmin
} from '@/lib/supabase';
import { AdminDashboardTabs } from '@/components/admin/AdminDashboardTabs';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Données temps réel pour l'administration

export default async function AdminPage() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

  // Chargement parallèle des jeux de données cockpit
  const [students, tickets, badges, achievements, dpRecords, quizzes, resolutions] = await Promise.all([
    getAllApprenantsAdmin(),
    getTicketsData(),
    getAllBadgesAdmin(),
    getAllAchievementsAdmin(),
    getAllDPSuiviAdmin(),
    getAllQuizzesAdmin(),
    getAllTicketResolutionsAdmin(),
  ]);

  return (
    <AdminDashboardTabs
      students={students}
      tickets={tickets}
      badges={badges}
      achievements={achievements}
      dpRecords={dpRecords}
      quizzes={quizzes}
      resolutions={resolutions}
    />
  );
}
