import React from 'react';
import { notFound } from 'next/navigation';
import { 
  getApprenantById, 
  getBadgesWithStatus, 
  getDPSuiviByApprenant,
  getApprenantQuizzesStatus 
} from '@/lib/supabase';
import { StudentPassport } from '@/components/StudentPassport';

interface PassportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PassportPage({ params }: PassportPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const apprenant = await getApprenantById(id);

  if (!apprenant) {
    notFound();
  }

  const [badges, dpSuivi, quizRes] = await Promise.all([
    getBadgesWithStatus(id),
    getDPSuiviByApprenant(id),
    getApprenantQuizzesStatus(id)
  ]);

  return (
    <div className="w-full">
      <StudentPassport
        apprenant={apprenant}
        badges={badges}
        dpSuivi={dpSuivi}
        quizzes={quizRes.quizzes}
      />
    </div>
  );
}
