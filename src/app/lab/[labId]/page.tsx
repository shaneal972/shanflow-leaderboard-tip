import React from 'react';
import { notFound } from 'next/navigation';
import { getLabById } from '@/lib/lab/labData';
import { getActiveTechnicianId } from '@/lib/studentAuth';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getAllApprenantsAdmin, getApprenantById, supabaseServer } from '@/lib/supabase';
import { buildLabParticipantsProgress } from '@/core/domain/labProgress';
import { MOCK_APPRENANTS } from '@/data/mockData';
import { LabWorkbench } from '@/components/lab/LabWorkbench';
import { LabLockScreen } from '@/components/lab/LabLockScreen';
import { LabSubmission } from '@/types/tip';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface LabPageProps {
  params: Promise<{ labId: string }>;
}

export default async function LabDetailPage({ params }: LabPageProps) {
  const { labId } = await params;
  const lab = getLabById(labId);

  if (!lab) {
    notFound();
  }

  const isFormateur = await isAdminAuthenticated();
  const activeTechnicianId = await getActiveTechnicianId();

  // Détermination de l'apprenant actif
  let student = null;
  if (activeTechnicianId) {
    student = await getApprenantById(activeTechnicianId);
  }

  // Si aucun technicien n'est authentifié et qu'on n'est pas en mode formateur :
  // Verrouillage strict par code PIN DSI (comme pour les autres espaces)
  if (!student && !isFormateur) {
    return (
      <div className="w-full">
        <LabLockScreen lab={lab} />
      </div>
    );
  }

  // En mode formateur seul, fallback pour visualisation de test
  const effectiveStudent = student || MOCK_APPRENANTS[0];

  // Chargement parallèle des apprenants de la promotion et des soumissions sur cet atelier
  const [allApprenants, allSubmissions] = await Promise.all([
    getAllApprenantsAdmin(),
    (async (): Promise<LabSubmission[]> => {
      try {
        const { data } = await supabaseServer
          .from('sf_lab_submissions')
          .select('*')
          .eq('lab_id', lab.id);
        return (data || []) as LabSubmission[];
      } catch {
        // Si la table n'est pas encore créée, on retourne une liste vide
        return [];
      }
    })(),
  ]);

  const initialSubmission =
    allSubmissions.find((sub) => sub.apprenant_id === effectiveStudent.id) || null;

  const labParticipants = buildLabParticipantsProgress({
    lab,
    students: allApprenants,
    submissions: allSubmissions,
    isFormateur,
  });

  return (
    <div className="w-full">
      <LabWorkbench
        lab={lab}
        student={effectiveStudent}
        initialSubmission={initialSubmission}
        isFormateur={isFormateur}
        labParticipants={labParticipants}
      />
    </div>
  );
}
