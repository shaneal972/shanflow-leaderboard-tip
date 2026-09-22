import type { Metadata } from 'next';
import { Lexend, Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { RgpdNoticeModal } from '@/components/RgpdNoticeModal';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getActiveTechnicianId } from '@/lib/studentAuth';
import { getApprenantById } from '@/lib/supabase';
import { Apprenant } from '@/types/tip';

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KLF Tech Passport et classement promo | Titre Pro TIP METAFORE',
  description:
    'Plateforme d\'évaluation et de gamification des compétences pour la promotion Techniciens Informatiques de Proximité (Session C26031A) - Karukera Logistique & Fret (KLF).',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isFormateur = await isAdminAuthenticated();
  const activeTechnicianId = await getActiveTechnicianId();
  
  let currentStudent: Apprenant | null = null;
  if (activeTechnicianId) {
    currentStudent = await getApprenantById(activeTechnicianId);
  }

  return (
    <html lang="fr" className={`${lexend.variable} ${inter.variable} dark`}>
      <body className="min-h-screen flex flex-col bg-[#070F1E] text-slate-100 blueprint-grid antialiased">
        <Navbar currentStudent={currentStudent} isFormateur={isFormateur} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="w-full mt-auto">
          <RgpdNoticeModal />
        </footer>
      </body>
    </html>
  );
}
