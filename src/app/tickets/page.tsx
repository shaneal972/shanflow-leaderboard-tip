import React from 'react';
import { 
  getTicketsData, 
  getApprenantById, 
  getTicketResolutionsForStudent, 
  getAllApprenantsAdmin, 
  getAllTicketResolutionsAdmin 
} from '@/lib/supabase';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getActiveTechnicianId } from '@/lib/studentAuth';
import { TicketDesk } from '@/components/TicketDesk';
import { Apprenant } from '@/types/tip';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const VIRTUAL_FORMATEUR_PROFILE: Apprenant = {
  id: 'e9e8382e-92e0-45b5-bea9-988a8ba32771',
  prenom: 'David',
  nom: 'JACQUA (Mode Test)',
  email: 'david.jacqua@shanflow.cloud',
  avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=david',
  points_total: 0,
  palier_actuel: 'Formateur Référent',
  equipe: 'Direction DSI',
  is_admin: true,
  consentement_rgpd: true,
};

export default async function TicketsPage() {
  const isFormateur = await isAdminAuthenticated();
  const activeTechnicianId = await getActiveTechnicianId();

  const tickets = await getTicketsData();

  if (isFormateur) {
    // Mode Maître Formateur : David JACQUA en première position (Mode Test) suivi des apprenants
    const [students, allResolutions] = await Promise.all([
      getAllApprenantsAdmin(),
      getAllTicketResolutionsAdmin(),
    ]);

    const existingAdmin = students.find((s) => s.is_admin);
    const formateurProfile: Apprenant = existingAdmin
      ? {
          ...existingAdmin,
          equipe: existingAdmin.equipe || 'Direction DSI',
          palier_actuel: 'Formateur Référent',
          is_admin: true,
        }
      : VIRTUAL_FORMATEUR_PROFILE;

    const learnerStudents = students.filter((s) => !s.is_admin);
    const orderedAdminStudents = [formateurProfile, ...learnerStudents];

    return (
      <div className="w-full">
        <TicketDesk 
          initialTickets={tickets} 
          currentStudent={formateurProfile}
          initialResolutions={allResolutions}
          isFormateur={true}
          adminStudents={orderedAdminStudents}
        />
      </div>
    );
  }

  // Mode Apprenant / Public : RGPD Strict (Aucune liste de camarades, aucune résolution d'autrui)
  let currentStudent = null;
  let resolutions: Awaited<ReturnType<typeof getTicketResolutionsForStudent>> = [];

  if (activeTechnicianId) {
    currentStudent = await getApprenantById(activeTechnicianId);
    if (currentStudent) {
      resolutions = await getTicketResolutionsForStudent(currentStudent.id);
    }
  }

  return (
    <div className="w-full">
      <TicketDesk 
        initialTickets={tickets} 
        currentStudent={currentStudent}
        initialResolutions={resolutions}
        isFormateur={false}
      />
    </div>
  );
}
