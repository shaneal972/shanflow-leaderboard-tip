import React from 'react';
import { notFound } from 'next/navigation';
import { 
  getQuizForExam, 
  getQuizWithCorrection, 
  getAllApprenantsAdmin,
  getSubmissionForStudent 
} from '@/lib/supabase';
import { getActiveTechnicianId } from '@/lib/studentAuth';
import { QuizExamRoom } from '@/components/quiz/QuizExamRoom';

interface QuizPageProps {
  params: Promise<{
    quizId: string;
  }>;
  searchParams: Promise<{
    apprenantId?: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const { quizId } = await params;
  const resolvedSearchParams = await searchParams;
  const activeTechnicianId = await getActiveTechnicianId();

  // Détection de l'élève actif : priorise le paramètre d'URL (supervision) sinon la session technicien connectée
  const effectiveApprenantId = resolvedSearchParams.apprenantId || activeTechnicianId || undefined;

  const students = await getAllApprenantsAdmin();

  // 1. Récupérer le quiz et les questions (en appliquant l'anti-triche serveur)
  const examData = await getQuizForExam(quizId);
  if (!examData) {
    notFound();
  }

  // 2. Si un élève est déterminé, vérifier s'il a déjà soumis
  let initialSubmission = null;
  if (effectiveApprenantId) {
    initialSubmission = await getSubmissionForStudent(quizId, effectiveApprenantId);
  }

  // 3. Si la correction est publiée et que l'élève a une soumission, on charge le corrigé complet
  let questions = examData.questions;
  if (examData.quiz.statut === 'correction_publiee' && effectiveApprenantId) {
    const correctionData = await getQuizWithCorrection(quizId, effectiveApprenantId);
    if (correctionData) {
      questions = correctionData.questions;
      initialSubmission = correctionData.submission;
    }
  }

  return (
    <div className="w-full min-h-screen py-4">
      <QuizExamRoom
        quiz={examData.quiz}
        questions={questions}
        students={students}
        initialApprenantId={effectiveApprenantId}
        initialSubmission={initialSubmission}
      />
    </div>
  );
}
