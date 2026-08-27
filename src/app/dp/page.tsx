import React from 'react';
import { getDPSuiviByApprenant } from '@/lib/supabase';
import { DPMonitor } from '@/components/DPMonitor';

export const revalidate = 10;

export default async function DPPage() {
  const initialDPSuivi = await getDPSuiviByApprenant('00000000-0000-0000-0000-000000000001');

  return (
    <div className="w-full">
      <DPMonitor 
        initialDPSuivi={initialDPSuivi}
        apprenantName="Jordan MARIE-JOSEPH (Exemple Démo)"
      />
    </div>
  );
}
