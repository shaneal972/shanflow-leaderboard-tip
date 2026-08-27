'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, FileText, Lock, Clock, UserCheck } from 'lucide-react';

interface RgpdNoticeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const RgpdNoticeModal: React.FC<RgpdNoticeModalProps> = ({ isOpen: controlledIsOpen, onClose: controlledOnClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const closeModal = controlledOnClose || (() => setInternalIsOpen(false));
  const openModal = () => setInternalIsOpen(true);

  return (
    <>
      {/* Bandeau d'information discret en pied de page */}
      <div className="w-full bg-[#0A192F]/80 border-t border-white/5 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              <strong>Protection des données & RGPD :</strong> Données pseudo-anonymisées sur le classement public.
              Conservation limitée à la session de formation (Juin 2027).
            </span>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="text-teal-400 hover:text-teal-300 underline underline-offset-2 shrink-0 transition-colors"
          >
            Consulter la notice de transparence
          </button>
        </div>
      </div>

      {/* Modale d'information RGPD complète */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-xl border border-white/10 bg-[#0A192F] p-6 shadow-2xl text-slate-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white font-['Lexend']">
                    Notice de Protection des Données Personnelles
                  </h3>
                  <p className="text-xs text-slate-400">
                    Conformité RGPD • Promotion TIP C26031A (METAFORE / FORE Alternance)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu réglementaire */}
            <div className="space-y-4 py-4 text-xs leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
              
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3">
                <FileText className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">1. Finalité du Traitement</h4>
                  <p className="text-slate-300">
                    L'application <strong>« KLF Tech Passport & Leaderboard »</strong> a pour unique finalité le suivi pédagogique,
                    la gamification de l'apprentissage et l'évaluation continue des compétences dans le cadre de la préparation au 
                    <strong> Titre Professionnel Technicien Informatique de Proximité (TIP)</strong> (Arrêté du 22 décembre 2015, Ministère du Travail).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">2. Base Légale & Minimisation des Données</h4>
                  <p className="text-slate-300">
                    Base légale : <em>Exécution d'une mission de formation professionnelle contractuelle</em>.<br />
                    <strong>Minimisation stricte :</strong> Sur le classement public, l'adresse email est strictement invisible.
                    L'identité est pseudo-anonymisée sous la forme <code>Prénom + Initiale du Nom</code> (ex: <em>Jordan M.</em>).
                    Seul l'apprenant connecté (via son lien de passeport unique) et le formateur ont accès au profil complet.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3">
                <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">3. Durée de Conservation & Purge</h4>
                  <p className="text-slate-300">
                    Les données sont conservées pour la durée stricte de la session de formation jusqu'en <strong>Juin 2027</strong>.
                    À l'issue de la délibération du jury de certification du Ministère du Travail, une purge intégrale des données
                    personnelles (noms, emails, logs) est automatiquement exécutée.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3">
                <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">4. Exercice des Droits</h4>
                  <p className="text-slate-300">
                    Conformément au RGPD et à la loi Informatique et Libertés, chaque apprenant dispose d'un droit d'accès, de rectification
                    et de suppression de ses données personnelles, exerçable directement auprès du formateur référent 
                    (<strong>David JACQUA</strong>, référent pédagogique TIP).
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                J'ai compris
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
