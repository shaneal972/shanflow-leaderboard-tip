import React from 'react';
import { getLabsData } from '@/lib/supabase';
import { getActiveTechnicianId } from '@/lib/studentAuth';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getApprenantById } from '@/lib/supabase';
import { LabCatalogView } from '@/components/lab/LabCatalogView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LabCatalogPage() {
  const isFormateur = await isAdminAuthenticated();
  const activeTechnicianId = await getActiveTechnicianId();
  const currentStudent = activeTechnicianId ? await getApprenantById(activeTechnicianId) : null;
  const labs = await getLabsData();

  return (
    <LabCatalogView
      labs={labs}
      currentStudent={currentStudent}
      isFormateur={isFormateur}
    />
  );
}
