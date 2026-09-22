import React from 'react';
import { 
  getDPSuiviByApprenant, 
  getApprenantById, 
  getAllApprenantsAdmin, 
  getAllDPSuiviAdmin 
} from '@/lib/supabase';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getActiveTechnicianId } from '@/lib/studentAuth';
import { DPMonitor } from '@/components/DPMonitor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DPPage() {
  const isFormateur = await isAdminAuthenticated();
  const activeTechnicianId = await getActiveTechnicianId();

  // 1. Mode Formateur Référent (David JACQUA) : Accès complet de supervision à toute la promotion
  if (isFormateur) {
    const [students, allDPSuivi] = await Promise.all([
      getAllApprenantsAdmin(),
      getAllDPSuiviAdmin(),
    ]);

    const activeStudent = students[0] || null;
    const studentDP = activeStudent 
      ? (allDPSuivi.find((dp) => dp.apprenant_id === activeStudent.id) || await getDPSuiviByApprenant(activeStudent.id))
      : undefined;

    return (
      <div className="w-full">
        <DPMonitor 
          initialDPSuivi={studentDP}
          apprenantName={activeStudent ? `${activeStudent.prenom} ${activeStudent.nom}` : 'Apprenant'}
          apprenantId={activeStudent?.id}
          isFormateur={true}
          adminStudents={students}
          allDPSuivi={allDPSuivi}
          currentStudent={activeStudent}
        />
      </div>
    );
  }

  // 2. Mode Apprenant Authentifié (Technicien connecté sur le poste)
  if (activeTechnicianId) {
    const currentStudent = await getApprenantById(activeTechnicianId);
    if (currentStudent) {
      const dpSuivi = await getDPSuiviByApprenant(currentStudent.id);
      return (
        <div className="w-full">
          <DPMonitor 
            initialDPSuivi={dpSuivi}
            apprenantName={`${currentStudent.prenom} ${currentStudent.nom}`}
            apprenantId={currentStudent.id}
            isFormateur={false}
            currentStudent={currentStudent}
          />
        </div>
      );
    }
  }

  // 3. Mode Non Connecté : Fiche exemple de démonstration (Jordan M.) avec sas d'authentification
  const demoDP = await getDPSuiviByApprenant('00000000-0000-0000-0000-000000000001');

  return (
    <div className="w-full">
      <DPMonitor 
        initialDPSuivi={demoDP}
        apprenantName="Jordan MARIE-JOSEPH (Exemple Démo)"
        apprenantId="00000000-0000-0000-0000-000000000001"
        isFormateur={false}
        isUnauthenticated={true}
      />
    </div>
  );
}
