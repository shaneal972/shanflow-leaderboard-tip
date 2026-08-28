import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  getApprenantById, 
  getBadgesWithStatus, 
  getDPSuiviByApprenant,
  getApprenantQuizzesStatus 
} from '@/lib/supabase';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { isStudentAuthenticated } from '@/lib/studentAuth';
import { StudentPassport } from '@/components/StudentPassport';
import { PassportLockScreen } from '@/components/passport/PassportLockScreen';

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

  // 1. Contrôle Master Formateur (David - Accès Maître Universel)
  const isFormateur = await isAdminAuthenticated();

  // 2. Si non formateur, vérification du cookie de session étudiant
  let isAuthorized = isFormateur;
  if (!isAuthorized) {
    isAuthorized = await isStudentAuthenticated(id);
  }

  // 3. Verrouillage strict si non autorisé : affichage de l'écran PIN
  if (!isAuthorized) {
    return (
      <div className="w-full">
        <PassportLockScreen
          studentId={id}
          studentName={`${apprenant.prenom} ${apprenant.nom}`}
          avatarUrl={apprenant.avatar_url}
          equipe={apprenant.equipe}
        />
      </div>
    );
  }

  // 4. Si autorisé : chargement des données complètes
  const [badges, dpSuivi, quizRes] = await Promise.all([
    getBadgesWithStatus(id),
    getDPSuiviByApprenant(id),
    getApprenantQuizzesStatus(id)
  ]);

  return (
    <div className="w-full">
      {/* Bandeau de supervision formateur DSI (Accès Maître) */}
      {isFormateur && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold font-mono text-amber-300">
              🛡️ Mode supervision formateur DSI — Accès maître actif
            </span>
            <span className="hidden sm:inline text-amber-400/60">•</span>
            <span className="hidden sm:inline text-slate-400">
              Navigation libre formateur (David JACQUA)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              PIN agent : <strong>{apprenant.pin_code || '2026'}</strong>
            </span>
            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] transition-colors"
            >
              Retour cockpit admin
            </Link>
          </div>
        </div>
      )}

      <StudentPassport
        apprenant={apprenant}
        badges={badges}
        dpSuivi={dpSuivi}
        quizzes={quizRes.quizzes}
      />
    </div>
  );
}
