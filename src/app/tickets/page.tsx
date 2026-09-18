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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TicketsPage() {
  const isFormateur = await isAdminAuthenticated();
  const activeTechnicianId = await getActiveTechnicianId();

  const tickets = await getTicketsData();

  if (isFormateur) {
    // Mode Maître Formateur : David JACQUA peut superviser et corriger n'importe quel apprenant
    const [students, allResolutions] = await Promise.all([
      getAllApprenantsAdmin(),
      getAllTicketResolutionsAdmin(),
    ]);

    return (
      <div className="w-full">
        <TicketDesk 
          initialTickets={tickets} 
          currentStudent={students[0] || null}
          initialResolutions={allResolutions}
          isFormateur={true}
          adminStudents={students}
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
