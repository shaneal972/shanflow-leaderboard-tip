import React from 'react';
import { notFound } from 'next/navigation';
import {
  getQuizForExam,
  getQuizWithCorrection,
  getAllApprenantsAdmin,
  getApprenantById,
  getSubmissionForStudent,
} from '@/lib/supabase';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getActiveTechnicianId, isStudentAuthenticated } from '@/lib/studentAuth';
import { QuizExamRoom } from '@/components/quiz/QuizExamRoom';
import type { Apprenant } from '@/types/tip';

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

function stripSensitiveStudentFields(student: Apprenant, keepEmailForAdmin = false): Apprenant {
  const { pin_code: _pin, ...rest } = student;
  return {
    ...rest,
    email: keepEmailForAdmin ? rest.email : '',
  };
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const { quizId } = await params;
  const resolvedSearchParams = await searchParams;

  const isFormateur = await isAdminAuthenticated();
  const activeTechnicianId = await getActiveTechnicianId();

  // Détection sécurisée de l'élève actif :
  // - Le paramètre ?apprenantId n'est honoré QUE si l'utilisateur est le formateur authentifié
  //   OU si le cookie HMAC de ce passeport précis est actif sur le navigateur.
  let effectiveApprenantId: string | undefined = activeTechnicianId || undefined;
  if (resolvedSearchParams.apprenantId) {
    if (isFormateur || (await isStudentAuthenticated(resolvedSearchParams.apprenantId))) {
      effectiveApprenantId = resolvedSearchParams.apprenantId;
    }
  }

  // 1. Récupérer le quiz et les questions en mode ÉPREUVE (sans is_correct ni dsi_explanation)
  const examData = await getQuizForExam(quizId);
  if (!examData) {
    notFound();
  }

  // 2. Cloisonnement RGPD strict :
  // - Seul le formateur reçoit la liste des apprenants (sans pin_code).
  // - Un élève connecté ne reçoit que son propre profil épuré.
  // - Un visiteur non connecté reçoit une liste vide (affichage du sas PIN sécurisé).
  let safeStudents: Apprenant[] = [];
  if (isFormateur) {
    const allStudents = await getAllApprenantsAdmin();
    safeStudents = allStudents.map((s) => stripSensitiveStudentFields(s, true));
  } else if (effectiveApprenantId) {
    const ownProfile = await getApprenantById(effectiveApprenantId);
    if (ownProfile) {
      safeStudents = [stripSensitiveStudentFields(ownProfile, false)];
    } else {
      effectiveApprenantId = undefined;
    }
  }

  // 3. Vérifier si l'apprenant actif possède une soumission (en cours ou scellée)
  let initialSubmission = null;
  if (effectiveApprenantId) {
    initialSubmission = await getSubmissionForStudent(quizId, effectiveApprenantId);
  }

  const hasFinalizedSubmission = Boolean(
    initialSubmission && (initialSubmission.closed_for_cheating || initialSubmission.submitted_at)
  );

  // 4. Révélation du corrigé UNIQUEMENT si la correction est publiée ET que la copie a bien été remise !
  // (Permet le rattrapage honnête sans fuite de réponses pour les retardataires)
  let questions = examData.questions;
  if (examData.quiz.statut === 'correction_publiee' && effectiveApprenantId && hasFinalizedSubmission) {
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
        students={safeStudents}
        initialApprenantId={effectiveApprenantId}
        initialSubmission={initialSubmission}
        isFormateur={isFormateur}
      />
    </div>
  );
}
