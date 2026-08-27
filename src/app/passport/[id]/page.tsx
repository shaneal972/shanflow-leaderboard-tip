import React from 'react';
import { notFound } from 'next/navigation';
import { getApprenantById, getBadgesWithStatus, getDPSuiviByApprenant } from '@/lib/supabase';
import { StudentPassport } from '@/components/StudentPassport';

interface PassportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 5;

export default async function PassportPage({ params }: PassportPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const apprenant = await getApprenantById(id);

  if (!apprenant) {
    notFound();
  }

  const badges = await getBadgesWithStatus(id);
  const dpSuivi = await getDPSuiviByApprenant(id);

  return (
    <div className="w-full">
      <StudentPassport
        apprenant={apprenant}
        badges={badges}
        dpSuivi={dpSuivi}
      />
    </div>
  );
}
