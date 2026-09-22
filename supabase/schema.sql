-- ==============================================================================
-- SCHÉMA OFFICIEL SUPABASE : KLF TECH PASSPORT & LEADERBOARD (TIP 2026)
-- Session C26031A - Techniciens Informatiques de Proximité - METAFORE Jarry
-- Hébergement : https://supabase.shandev.cloud | Schéma dédié : tip
-- ==============================================================================

-- 1. CRÉATION DU SCHÉMA DÉDIÉ
create schema if not exists tip;
set search_path to tip, public;

-- 2. TABLE DES APPRENANTS
create table if not exists tip.sf_apprenants (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  email text unique not null,
  avatar_url text,
  points_total integer default 0,
  palier_actuel text default 'Palier 0',
  equipe text default 'Support Jarry',
  is_admin boolean default false,
  pin_code varchar(6) default '2026',
  consentement_rgpd boolean default true,
  created_at timestamptz default now()
);

-- 3. VUE PUBLIQUE SÉCURISÉE (CONFORMITÉ RGPD & PSEUDO-ANONYMISATION)
-- Règle : Aucun email, affichage "Prénom N.", exclusion du profil formateur
create or replace view tip.v_leaderboard_public as
select 
  id,
  prenom,
  concat(substring(nom from 1 for 1), '.') as nom_initial,
  avatar_url,
  points_total,
  palier_actuel,
  equipe
from tip.sf_apprenants
where is_admin = false
order by points_total desc;

-- 4. RÉFÉRENTIEL DES 10 BADGES OFFICIELS KLF (5 PALIERS REAC)
create table if not exists tip.sf_badges (
  id text primary key,
  titre text not null,
  description text not null,
  palier text not null,
  points_requis integer default 0,
  icone_url text not null,
  rarete text check (rarete in ('commun', 'rare', 'epique', 'legendaire'))
);

-- 5. OBTENTION DES BADGES (ACHIEVEMENTS)
create table if not exists tip.sf_achievements (
  id uuid primary key default gen_random_uuid(),
  apprenant_id uuid references tip.sf_apprenants(id) on delete cascade,
  badge_id text references tip.sf_badges(id) on delete cascade,
  obtenu_le timestamptz default now(),
  unique(apprenant_id, badge_id)
);

-- 6. TICKETS D'INCIDENTS HELPDESK KLF (SIMULATION MÉTIER)
create table if not exists tip.sf_tickets_klf (
  id text primary key,
  service text not null,
  demandeur text not null,
  titre text not null,
  description text not null,
  urgence text check (urgence in ('P1', 'P2', 'P3')),
  points_valeur integer not null,
  statut text default 'ouvert' check (statut in ('ouvert', 'en_cours', 'resolu'))
);

-- 7. SUIVI DU DOSSIER PROFESSIONNEL (DP REAC - 5 RUBRIQUES MINISTÈRE DU TRAVAIL)
create table if not exists tip.sf_dp_suivi (
  apprenant_id uuid primary key references tip.sf_apprenants(id) on delete cascade,
  rubrique_1 boolean default false, -- 1. Tâches et opérations effectuées à la 1ère personne
  rubrique_2 boolean default false, -- 2. Moyens utilisés (matériels, outils, GLPI, M365)
  rubrique_3 boolean default false, -- 3. Interlocuteurs et collaboration (Corinne, Marc...)
  rubrique_4 boolean default false, -- 4. Contexte entreprise & dates réelles d'exercice
  rubrique_5 boolean default false, -- 5. Informations complémentaires (sécurité, RGPD, réflexivité)
  statut_dp text default 'brouillon' check (statut_dp in ('brouillon', 'en_revue', 'valide_jury')),
  updated_at timestamptz default now()
);

-- 8. TABLE D'IDEMPOTENCE N8N
create table if not exists tip.sf_idempotency (
  event_id text primary key,
  source text not null,
  traite_le timestamptz default now()
);

-- 9. RÉSOLUTIONS DES TICKETS PAR LES APPRENANTS (ITIL EN 3 ÉTAPES)
create table if not exists tip.sf_ticket_resolutions (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null references tip.sf_tickets_klf(id) on delete cascade,
  apprenant_id uuid not null references tip.sf_apprenants(id) on delete cascade,
  diagnostic_categorie text not null check (diagnostic_categorie in ('materiel', 'systeme', 'reseau', 'applicatif')),
  diagnostic_urgence text not null check (diagnostic_urgence in ('P1', 'P2', 'P3')),
  demarche_technique text not null,
  message_usager text not null,
  statut text not null default 'en_attente_validation' check (statut in ('en_attente_validation', 'valide', 'a_corriger')),
  feedback_formateur text,
  points_attribues integer default 0,
  soumis_le timestamptz default now(),
  evalue_le timestamptz,
  evalue_par text,
  unique(ticket_id, apprenant_id)
);

-- ==============================================================================
-- MODULE KLF QUIZ ENGINE & SENTINEL EXAM (ÉVALUATIONS & ANTI-TRICHE)
-- ==============================================================================

-- 10. TABLE DES QUIZ OFFICIELS KLF
create table if not exists tip.sf_quizzes (
  id text primary key,
  titre text not null,
  description text,
  palier text not null default 'Palier 0',
  seuil_validation integer default 75,
  points_recompense integer default 200,
  duree_minutes integer default 20,
  badge_recompense text references tip.sf_badges(id) on delete set null,
  statut text not null default 'ferme' check (statut in ('ferme', 'session_ouverte', 'correction_publiee')),
  created_at timestamptz default now()
);

-- 11. TABLE DES QUESTIONS DE QUIZ
create table if not exists tip.sf_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null references tip.sf_quizzes(id) on delete cascade,
  ordre integer not null,
  theme text default 'Général',
  enonce text not null,
  points integer default 1
);

-- 12. TABLE DES OPTIONS DE RÉPONSES AUX QUESTIONS
create table if not exists tip.sf_quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references tip.sf_quiz_questions(id) on delete cascade,
  lettre varchar(1) not null check (lettre in ('A', 'B', 'C', 'D')),
  texte text not null,
  is_correct boolean default false,
  dsi_explanation text
);

-- 13. TABLE DES COPIES D'EXAMEN & SOUMISSIONS DES STAGIAIRES
create table if not exists tip.sf_quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null references tip.sf_quizzes(id) on delete cascade,
  apprenant_id uuid not null references tip.sf_apprenants(id) on delete cascade,
  reponses_choisies jsonb default '{}'::jsonb,
  score_obtenu integer default 0,
  score_pourcentage integer default 0,
  is_validated boolean default false,
  submitted_at timestamptz default now(),
  points_attribues integer default 0,
  infractions_count integer default 0,
  infractions_log jsonb default '[]'::jsonb,
  closed_for_cheating boolean default false,
  unique(quiz_id, apprenant_id)
);

-- INDEX DE PERFORMANCE
create index if not exists idx_sf_quiz_questions_quiz_id on tip.sf_quiz_questions(quiz_id);
create index if not exists idx_sf_quiz_options_question_id on tip.sf_quiz_options(question_id);
create index if not exists idx_sf_quiz_submissions_quiz_apprenant on tip.sf_quiz_submissions(quiz_id, apprenant_id);

-- ==============================================================================
-- MODULE KLF TECH LAB (TRAVAUX PRATIQUES & AUTO-AUDIT IN-APP)
-- ==============================================================================

-- 14. TABLE DES ATELIERS PRATIQUES (KLF TECH LAB)
create table if not exists tip.sf_labs (
  id text primary key,
  titre text not null,
  description text not null,
  domaine text not null check (domaine in ('bureautique', 'reseau', 'systeme', 'cyber')),
  palier text not null default 'Palier 1',
  points_total integer not null default 200,
  points_auto_validation integer not null default 100,
  badge_id text references tip.sf_badges(id) on delete set null,
  ticket_id text references tip.sf_tickets_klf(id) on delete set null,
  fichier_modele_nom text not null,
  fichier_modele_url text not null,
  duree_estimee text default '1h30',
  statut text not null default 'ouvert' check (statut in ('ouvert', 'a_venir', 'archive')),
  created_at timestamptz default now()
);

-- 15. TABLE DES SOUMISSIONS D'ATELIERS TP & CARNETS DE LABORATOIRE
create table if not exists tip.sf_lab_submissions (
  id uuid primary key default gen_random_uuid(),
  lab_id text not null references tip.sf_labs(id) on delete cascade,
  apprenant_id uuid not null references tip.sf_apprenants(id) on delete cascade,
  audit_results jsonb,
  jalons_valides integer default 0,
  score_technique_pct integer default 0,
  reponse_demarche text,
  reponse_difficultes text,
  reponse_enseignements text,
  statut text not null default 'brouillon' check (statut in ('brouillon', 'en_cours', 'soumis_en_revue', 'homologue_dsi', 'a_corriger')),
  points_attribues integer default 0,
  feedback_formateur text,
  soumis_le timestamptz default now(),
  evalue_le timestamptz,
  evalue_par text,
  unique(lab_id, apprenant_id)
);

create index if not exists idx_sf_lab_submissions_lab_apprenant on tip.sf_lab_submissions(lab_id, apprenant_id);

-- ==============================================================================
-- 16. POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table tip.sf_apprenants enable row level security;
alter table tip.sf_badges enable row level security;
alter table tip.sf_achievements enable row level security;
alter table tip.sf_tickets_klf enable row level security;
alter table tip.sf_ticket_resolutions enable row level security;
alter table tip.sf_dp_suivi enable row level security;
alter table tip.sf_idempotency enable row level security;

-- Politiques de lecture publique
drop policy if exists "Lecture publique apprenants" on tip.sf_apprenants;
create policy "Lecture publique apprenants" on tip.sf_apprenants for select using (true);

drop policy if exists "Lecture publique badges" on tip.sf_badges;
create policy "Lecture publique badges" on tip.sf_badges for select using (true);

drop policy if exists "Lecture publique achievements" on tip.sf_achievements;
create policy "Lecture publique achievements" on tip.sf_achievements for select using (true);

drop policy if exists "Lecture publique tickets" on tip.sf_tickets_klf;
create policy "Lecture publique tickets" on tip.sf_tickets_klf for select using (true);

drop policy if exists "Lecture publique résolutions" on tip.sf_ticket_resolutions;
create policy "Lecture publique résolutions" on tip.sf_ticket_resolutions for select using (true);

drop policy if exists "Gestion résolutions" on tip.sf_ticket_resolutions;
create policy "Gestion résolutions" on tip.sf_ticket_resolutions for all using (true);

drop policy if exists "Lecture publique dp" on tip.sf_dp_suivi;
create policy "Lecture publique dp" on tip.sf_dp_suivi for select using (true);

alter table tip.sf_quizzes enable row level security;
alter table tip.sf_quiz_questions enable row level security;
alter table tip.sf_quiz_options enable row level security;
alter table tip.sf_quiz_submissions enable row level security;

drop policy if exists "Lecture publique quizzes" on tip.sf_quizzes;
create policy "Lecture publique quizzes" on tip.sf_quizzes for select using (true);

drop policy if exists "Gestion quizzes" on tip.sf_quizzes;
create policy "Gestion quizzes" on tip.sf_quizzes for all using (true);

drop policy if exists "Lecture publique questions" on tip.sf_quiz_questions;
create policy "Lecture publique questions" on tip.sf_quiz_questions for select using (true);

drop policy if exists "Gestion questions" on tip.sf_quiz_questions;
create policy "Gestion questions" on tip.sf_quiz_questions for all using (true);

drop policy if exists "Lecture publique options" on tip.sf_quiz_options;
create policy "Lecture publique options" on tip.sf_quiz_options for select using (true);

drop policy if exists "Gestion options" on tip.sf_quiz_options;
create policy "Gestion options" on tip.sf_quiz_options for all using (true);

drop policy if exists "Lecture publique submissions" on tip.sf_quiz_submissions;
create policy "Lecture publique submissions" on tip.sf_quiz_submissions for select using (true);

drop policy if exists "Gestion submissions" on tip.sf_quiz_submissions;
create policy "Gestion submissions" on tip.sf_quiz_submissions for all using (true);

-- Politiques Labs
drop policy if exists "Lecture publique labs" on tip.sf_labs;
create policy "Lecture publique labs" on tip.sf_labs for select using (true);

drop policy if exists "Gestion labs" on tip.sf_labs;
create policy "Gestion labs" on tip.sf_labs for all using (true);

drop policy if exists "Lecture publique lab submissions" on tip.sf_lab_submissions;
create policy "Lecture publique lab submissions" on tip.sf_lab_submissions for select using (true);

drop policy if exists "Gestion lab submissions" on tip.sf_lab_submissions;
create policy "Gestion lab submissions" on tip.sf_lab_submissions for all using (true);

-- ==============================================================================
-- SEED DATA : BADGES, TICKETS ET APPRENANTS DE DÉMONSTRATION
-- ==============================================================================

-- Insertion des 10 Badges KLF
insert into tip.sf_badges (id, titre, description, palier, points_requis, icone_url, rarete) values
('ran_keyboard_ninja', 'Ninja du clavier', 'Maîtrise des 12 raccourcis essentiels sans toucher à la souris (Ctrl+Shift+V, Ctrl+H, sélection rapide).', 'Palier 0', 50, '⌨️', 'commun'),
('ran_zero_defaut', 'Hygiène de poste DSI', 'Configuration de l''arborescence KLF standardisée et application stricte des règles de nommage.', 'Palier 0', 50, '📁', 'commun'),
('dsi_charte_master', 'Garant de la charte KLF', 'Mise en page de documents techniques aux normes DSI (Styles Titres, sauts de page forcés, zéros espaces parasites).', 'Palier 1', 100, '📄', 'rare'),
('excel_data_cleaner', 'Nettoyeur de parc Jarry', 'Audit, nettoyage et normalisation de l''inventaire brut des 65 postes informatiques KLF sur tableur.', 'Palier 1', 100, '📊', 'rare'),
('stage_convention_signee', 'Convention scellée', 'Signature officielle et remise de la convention de stage en entreprise.', 'Palier 1', 100, '📑', 'rare'),
('office_collab_pilot', 'Pilote collaboratif M365 & Google', 'Maîtrise opérationnelle des messageries d''entreprise et outils collaboratifs en ligne.', 'Palier 1', 100, '📫', 'rare'),
('rigueur_consigne_pro', 'Garant des spécifications', 'Application scrupuleuse de l''ensemble des contraintes d''un cahier des charges, d''un TP ou d''un ticket sans omission ni déviation.', 'Palier 1', 100, '🎯', 'rare'),
('corinne_savior', 'Sauveur de facturation', 'Dépannage critique de Corinne : correction des erreurs #N/A et paramétrage de l''Octroi de mer & TVA 8.5%.', 'Palier 2', 150, '💡', 'epique'),
('quai_tutor_pro', 'Pédagogue de quai Zebra', 'Création du tutoriel illustré pas-à-pas pour les tablettes durcies des caristes de Sébastien (Épreuve REAC).', 'Palier 2', 200, '📱', 'epique'),
('rh_mailmerge_ace', 'As du publipostage RH', 'Exécution de la campagne de publipostage de 60 contrats et attestations sans aucun décalage pour Élodie.', 'Palier 2', 150, '✉️', 'rare'),
('ia_prompt_copilot', 'Prompt crafter TIP', 'Utilisation augmentée de Claude & Copilot pour accélérer le diagnostic support et générer des scripts d''assistance.', 'Palier 3', 150, '🤖', 'epique'),
('audit_securite_ia', 'Sentinelle RGPD et données', 'Audit de sécurité des données sensibles usagers et filtrage préventif des prompts IA (Prompt Masking).', 'Palier 3', 150, '🛡️', 'epique'),
('n8n_flow_master', 'Maître de l''automatisation', 'Conception et mise en production d''un workflow n8n d''aiguillage automatique des tickets avec alertes WhatsApp.', 'Palier 4', 250, '⚡', 'legendaire')
on conflict (id) do update set 
  titre = excluded.titre,
  description = excluded.description,
  palier = excluded.palier,
  points_requis = excluded.points_requis,
  icone_url = excluded.icone_url,
  rarete = excluded.rarete;

-- Insertion des Tickets Support KLF
insert into tip.sf_tickets_klf (id, service, demandeur, titre, description, urgence, points_valeur, statut) values
('TCK-101', 'Facturation & Douane', 'Corinne MONROSE', 'Urgent : Erreurs #N/A et calcul d''Octroi de mer sur manifeste conteneurs', 'Bonjour le support. Mon classeur de suivi des arrivages maritimes affiche #N/A sur toutes les lignes de transit et les taux d''Octroi de mer (8.5% Guadeloupe) ne s''appliquent plus automatiquement. La douane attend les déclarations avant 16h !', 'P1', 150, 'ouvert'),
('TCK-102', 'Quai & Entrepôts', 'Sébastien LEBLANC', 'Confection du tutoriel d''utilisation des tablettes durcies Zebra caristes', 'Salut l''équipe IT. Nos 8 caristes reçoivent leurs nouvelles tablettes Zebra TC57 pour scanner les conteneurs au quai n°3. Il me faut une fiche réflexe 1-page plastifiée avec photos claires pour allumer, scanner et vider le cache en cas de freeze.', 'P2', 200, 'ouvert'),
('TCK-103', 'Ressources Humaines', 'Élodie THEOPHILE', 'Campagne de publipostage des 60 convocations visites médicales', 'Bonjour. Je dois expédier ce soir 60 courriers personnalisés pour les visites médicales périodiques du personnel de Jarry et de Fort-de-France. À chaque tentative de fusion Word, les prénoms sautent d''une ligne.', 'P2', 150, 'ouvert'),
('TCK-104', 'Direction & Finance', 'Marc VINCENOT (DSI)', 'Alerte phishing : faux virement maritime et analyse en-têtes SPF/DKIM', 'Bonjour l''équipe support. Notre comptable a reçu un e-mail prétendant venir de la compagnie maritime CMA-CGM réclamant un virement urgent de 24 500 € sur un nouveau compte bancaire en Lituanie suite à un "changement de banque". L''adresse d''expédition affichée est "compta@cma-cgm-caraibes.com". Analysez les en-têtes de l''e-mail, vérifiez l''authenticité du domaine (SPF/DKIM) et rédigez la consigne de sécurité immédiate pour l''ensemble des services.', 'P1', 150, 'ouvert'),
('TCK-105', 'Expéditions & Logistique', 'Sébastien LEBLANC', 'Imprimante thermique Zebra réseau injoignable suite à coupure EDF', 'Salut le support IT. Suite à la micro-coupure EDF de 11h à Jarry, l''imprimante thermique d''étiquettes Zebra ZT410 du quai d''expédition ne répond plus (IP 192.168.10.45). Les préparateurs de commandes ne peuvent plus éditer les étiquettes code-barres de colisage. Le voyant réseau clignote en orange. Diagnostiquez la perte de connectivité, attribuez une configuration IP statique pérenne et validez la passerelle par des tests de connectivité.', 'P2', 200, 'ouvert')
on conflict (id) do update set
  service = excluded.service,
  demandeur = excluded.demandeur,
  titre = excluded.titre,
  description = excluded.description,
  urgence = excluded.urgence,
  points_valeur = excluded.points_valeur;

-- Insertion des Ateliers KLF Tech Lab
insert into tip.sf_labs (id, titre, description, domaine, palier, points_total, points_auto_validation, badge_id, ticket_id, fichier_modele_nom, fichier_modele_url, duree_estimee, statut) values
('tp-bur-01-corinne', 'Sauvetage du manifeste d''arrivages maritimes de Corinne & Fiscalité Antilles', 'Dépannage critique du classeur Excel de suivi des conteneurs portuaires de Corinne (Facturation & Douane). Rétablissement des codes postaux sur 5 chiffres, élimination des erreurs #N/A via SUPPRESPACE/SIERREUR, calcul automatisé de l''Octroi de mer (8.5%) et de la TVA Guadeloupe (8.5%) avec références semi-absolues ($), et figeage des volets.', 'bureautique', 'Palier 1', 200, 100, 'corinne_savior', 'TCK-101', 'KLF_Manifeste_Arrivages_Corinne_BRUT.xlsx', '/api/lab/download-sample?labId=tp-bur-01-corinne', '1h30', 'ouvert')
on conflict (id) do update set
  titre = excluded.titre,
  description = excluded.description,
  points_total = excluded.points_total,
  points_auto_validation = excluded.points_auto_validation;

-- Insertion des Apprenants Promotion C26031A (Promotion Réelle METAFORE Jarry)
insert into tip.sf_apprenants (id, prenom, nom, email, avatar_url, points_total, palier_actuel, equipe, is_admin, pin_code, consentement_rgpd) values
('3a8aa397-267e-4c93-bb46-e236b7f0876a', 'Chrys', 'ARÇON', 'arcon-chrys-tech@proton.me', 'https://api.dicebear.com/7.x/bottts/svg?seed=arcon', 450, 'Palier 2', 'Escouade Alizé', false, '2026', true),
('3c2267b3-83f4-422e-b5f1-2c176361627a', 'Thomas', 'BAUDOIN', 'tbaudoin623@gmail.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=baudoin', 50, 'Palier 0', 'Escouade Houelbourg', false, '2026', true),
('9b41d8c5-ee0f-4b4c-8af3-4664ad70efde', 'Jordan', 'DAL-LAGO', 'dlg-jordan-tech@proton.me', 'https://api.dicebear.com/7.x/bottts/svg?seed=dallago', 450, 'Palier 2', 'Escouade Alizé', false, '2026', true),
('d6c88c6f-9920-4090-9f7c-501f99364945', 'Kehyann', 'DESPOIS', 'despois-kehyann-tech@proton.me', 'https://api.dicebear.com/7.x/bottts/svg?seed=despois', 50, 'Palier 0', 'Escouade Baie-Mahault', false, '2026', true),
('f1d6ed91-2b2c-433b-ae7a-b0d9614244eb', 'Tristan', 'ELMACIN OBERTAN', 'elmacin-tristan-tech@proton.me', 'https://api.dicebear.com/7.x/bottts/svg?seed=elmacin', 250, 'Palier 1', 'Escouade Houelbourg', false, '2026', true),
('894e2113-3c57-423c-a731-8ccbe5ae2831', 'Olivier', 'GIBRIEN', 'gibrien-olivier-tech@proton.me', 'https://api.dicebear.com/7.x/bottts/svg?seed=gibrien', 150, 'Palier 1', 'Escouade Baie-Mahault', false, '2026', true),
('0c581de6-9948-4a19-8f14-cca4b65fb041', 'Wilfried', 'JOSEPH', 'azerty7111@gmail.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=joseph', 150, 'Palier 1', 'Escouade Alizé', false, '2026', true),
('485bea34-74dc-4e57-a1e1-17b856376c84', 'Jessy', 'JUDOR', 'jjudor05@gmail.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=judor', 150, 'Palier 1', 'Escouade Houelbourg', false, '2026', true),
('8d100934-5303-4e1e-8ecf-8372bc032c66', 'Steeven', 'MATIGNON', 'matignon-steeven-tech@proton.me', 'https://api.dicebear.com/7.x/bottts/svg?seed=matignon', 250, 'Palier 1', 'Escouade Baie-Mahault', false, '2026', true),
('0c82c301-004a-469b-8bfa-448dd03b21cf', 'Thomas', 'PLUMAIN', 'plumain-thomas-tech@proton.me', 'https://api.dicebear.com/7.x/bottts/svg?seed=plumain', 450, 'Palier 2', 'Escouade Alizé', false, '2026', true),
('8728ce3c-f335-432d-a60f-e564495a7eed', 'Thomas', 'RABORD', 'thomasrabord898@gmail.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=rabord', 50, 'Palier 0', 'Escouade Houelbourg', false, '2026', true),
('97064618-36c0-4315-964c-412c9d8170cd', 'Chloé', 'SAHA', '2026taiclo@gmail.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=saha', 650, 'Palier 3', 'Escouade Baie-Mahault', false, '2026', true),
('e9e8382e-92e0-45b5-bea9-988a8ba32771', 'David', 'JACQUA', 'david.jacqua@shanflow.cloud', 'https://api.dicebear.com/7.x/bottts/svg?seed=david', 0, 'Formateur Référent', 'Coordination Pédagogique', true, '2026', true),
('00000000-0000-0000-0000-000000000099', 'David', 'JACQUA', 'oshaneal@gmail.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=david', 200, 'Formateur Référent', 'Coordination Pédagogique', true, '2089', true)
on conflict (email) do update set
  prenom = excluded.prenom,
  nom = excluded.nom,
  avatar_url = excluded.avatar_url,
  points_total = excluded.points_total,
  palier_actuel = excluded.palier_actuel,
  equipe = excluded.equipe,
  is_admin = excluded.is_admin,
  pin_code = excluded.pin_code;

-- Insertion des Achievements pour les premiers apprenants
insert into tip.sf_achievements (apprenant_id, badge_id) values
('00000000-0000-0000-0000-000000000001', 'ran_keyboard_ninja'),
('00000000-0000-0000-0000-000000000001', 'ran_zero_defaut'),
('00000000-0000-0000-0000-000000000001', 'dsi_charte_master'),
('00000000-0000-0000-0000-000000000001', 'excel_data_cleaner'),
('00000000-0000-0000-0000-000000000001', 'corinne_savior'),
('00000000-0000-0000-0000-000000000001', 'quai_tutor_pro'),
('00000000-0000-0000-0000-000000000001', 'ia_prompt_copilot'),

('00000000-0000-0000-0000-000000000002', 'ran_keyboard_ninja'),
('00000000-0000-0000-0000-000000000002', 'ran_zero_defaut'),
('00000000-0000-0000-0000-000000000002', 'dsi_charte_master'),
('00000000-0000-0000-0000-000000000002', 'excel_data_cleaner'),
('00000000-0000-0000-0000-000000000002', 'corinne_savior'),
('00000000-0000-0000-0000-000000000002', 'rh_mailmerge_ace'),

('00000000-0000-0000-0000-000000000003', 'ran_keyboard_ninja'),
('00000000-0000-0000-0000-000000000003', 'ran_zero_defaut'),
('00000000-0000-0000-0000-000000000003', 'dsi_charte_master'),
('00000000-0000-0000-0000-000000000003', 'excel_data_cleaner'),
('00000000-0000-0000-0000-000000000003', 'corinne_savior'),

('00000000-0000-0000-0000-000000000004', 'ran_keyboard_ninja'),
('00000000-0000-0000-0000-000000000004', 'ran_zero_defaut'),
('00000000-0000-0000-0000-000000000004', 'dsi_charte_master'),
('00000000-0000-0000-0000-000000000004', 'excel_data_cleaner'),

('00000000-0000-0000-0000-000000000005', 'ran_keyboard_ninja'),
('00000000-0000-0000-0000-000000000005', 'ran_zero_defaut'),
('00000000-0000-0000-0000-000000000005', 'dsi_charte_master')
on conflict do nothing;

-- Suivi DP pour Jordan M. (Exemple presque validé)
insert into tip.sf_dp_suivi (apprenant_id, rubrique_1, rubrique_2, rubrique_3, rubrique_4, rubrique_5, statut_dp) values
('00000000-0000-0000-0000-000000000001', true, true, true, true, false, 'en_revue'),
('00000000-0000-0000-0000-000000000002', true, true, true, false, false, 'brouillon'),
('00000000-0000-0000-0000-000000000003', true, true, false, false, false, 'brouillon'),
('00000000-0000-0000-0000-000000000004', true, false, false, false, false, 'brouillon')
on conflict (apprenant_id) do nothing;

-- Insertion des 4 Quiz Officiels KLF (Palier 0 RAN + Trinité Bureautique Palier 1)
insert into tip.sf_quizzes (id, titre, description, palier, seuil_validation, points_recompense, duree_minutes, badge_recompense, statut) values
('quiz-p0-ran', 'Quiz Palier 0 : Diagnostic Initial & Standards RAN', 'Évaluation diagnostique initiale des compétences bureautiques, réflexes clavier et standards DSI pour la promotion TIP (KLF Jarry).', 'Palier 0', 75, 200, 35, 'ran_zero_defaut', 'correction_publiee'),
('quiz-p1-word-docs', 'Quiz Palier 1 : Traitement de texte professionnel (Word & Docs)', 'Évaluation technique avancée : styles hiérarchiques, pagination et sauts de section, publipostage RH et logistique, révision collaborative, modèles normalisés et export PDF/A.', 'Palier 1', 75, 200, 35, 'dsi_charte_master', 'correction_publiee'),
('quiz-p1-excel-sheets', 'Quiz Palier 1 : Tableur & Modélisation de données (Excel & Sheets)', 'Évaluation technique avancée : adressage absolu, calculs fiscaux locaux (Octroi de mer & TVA 8.5%), RECHERCHEX/INDEX-EQUIV, fonctions logiques, TCD, audit d''erreurs et normalisation d''imports.', 'Palier 1', 75, 200, 35, 'excel_data_cleaner', 'correction_publiee'),
('quiz-p1-outlook-gmail', 'Quiz Palier 1 : Messagerie, Agendas & Collaboration (Outlook & Gmail)', 'Évaluation technique avancée : protocoles IMAP/POP/Exchange, fichiers .ost/.pst, gestion des fuseaux horaires Caraïbes, sécurité anti-phishing, conformité RGPD (Cci), règles de messagerie et quotas.', 'Palier 1', 75, 200, 35, 'office_collab_pilot', 'ferme')
on conflict (id) do update set
  titre = excluded.titre,
  description = excluded.description,
  palier = excluded.palier,
  seuil_validation = excluded.seuil_validation,
  points_recompense = excluded.points_recompense,
  duree_minutes = excluded.duree_minutes,
  badge_recompense = excluded.badge_recompense,
  statut = excluded.statut;


-- Insertion des 80 Questions Officielles KLF
insert into tip.sf_quiz_questions (id, quiz_id, ordre, theme, enonce, points) values
('cb370eb4-93f4-4dc4-b280-0164ef84b931', 'quiz-p0-ran', 1, 'Gestion de Fichiers & Nommage', 'Q1. Que signifie l''extension d''un fichier .csv et quel est son délimiteur habituel dans les versions françaises d''Excel / Calc ?', 1),
('7b2407c2-591d-4024-8c68-0c2f2a227f18', 'quiz-p0-ran', 2, 'Raccourcis & Capture Clavier', 'Q2. Sur un poste Windows 11 en entreprise, quel raccourci clavier universel permet d''ouvrir instantanément la boîte de dialogue ''Rechercher et Remplacer'' dans un document ?', 1),
('ecb7b2e8-e8ec-4747-a179-a15fd351a669', 'quiz-p0-ran', 3, 'Raccourcis & Capture Clavier', 'Q3. Pour illustrer une fiche d''incident destinée au DSI, quelle méthode permet de capturer rapidement une zone précise de l''écran sans capturer tout le bureau ?', 1),
('e9238216-4c02-4bae-8093-01a43432590f', 'quiz-p0-ran', 4, 'Gestion de Fichiers & Nommage', 'Q4. Quelle est la différence fondamentale entre les commandes ''Enregistrer'' (Ctrl+S) et ''Enregistrer sous'' (F12) ?', 1),
('01e51db6-ecee-4ffc-802d-21bb3cf28046', 'quiz-p0-ran', 5, 'Gestion de Fichiers & Nommage', 'Q5. Selon la charte de qualité informatique de Karukera Logistique & Fret (KLF), quel est le nom de fichier professionnellement conforme ?', 1),
('ca02acd1-f48d-4830-afa2-fcafe431babc', 'quiz-p0-ran', 6, 'Traitement de Texte & Normes KLF', 'Q6. Dans Microsoft Word ou Google Docs, pourquoi est-il strictement interdit d''appuyer 15 fois sur la touche ''Entrée'' pour passer à la page suivante ?', 1),
('95a4d994-b243-45a4-902e-b7d5c91b1669', 'quiz-p0-ran', 7, 'Traitement de Texte & Normes KLF', 'Q7. Quelle est l''utilité principale d''utiliser les styles prédéfinis (''Titre 1'', ''Titre 2'', ''Titre 3'') plutôt que de mettre le texte en gras et d''augmenter la taille de police manuellement ?', 1),
('b5380b8d-b297-4793-a2cb-e6b6dc52a745', 'quiz-p0-ran', 8, 'Traitement de Texte & Normes KLF', 'Q8. Comment aligner proprement deux blocs de texte sur la même ligne (ex: adresse expéditeur à gauche, adresse destinataire à droite) sans risquer de décalage ?', 1),
('63eb29b6-4aeb-48ef-8f67-8928431d9e22', 'quiz-p0-ran', 9, 'Traitement de Texte & Normes KLF', 'Q9. À quoi sert le bouton ''Afficher tout'' (représenté par le symbole de paragraphe ¶) dans un traitement de texte ?', 1),
('9ea599d5-5d52-401e-89ef-79b9c1b45832', 'quiz-p0-ran', 10, 'Traitement de Texte & Normes KLF', 'Q10. Avant de transmettre une procédure officielle au DSI Marc Verdier ou aux clients de KLF, pourquoi convertit-on le document DOCX en format PDF ?', 1),
('dae0b1bf-4b6a-4f79-a571-941a08e27985', 'quiz-p0-ran', 11, 'Tableur, Formules & Diagnostic', 'Q11. Dans Excel ou Google Sheets, par quel caractère obligatoire doit impérativement débuter toute formule ou calcul ?', 1),
('39b8f5ff-2a34-4a6a-80bd-1787fee242b0', 'quiz-p0-ran', 12, 'Tableur, Formules & Diagnostic', 'Q12. Quelle formule permet d''additionner correctement toutes les valeurs contenues entre la cellule B2 et la cellule B20 ?', 1),
('f4395f9e-ebd0-48f5-a126-0dbc2ff1d5c9', 'quiz-p0-ran', 13, 'Tableur, Formules & Diagnostic', 'Q13. Dans une formule de calcul de taxe d''Octroi de mer (ex: =B5*$C$2), que signifie la présence des symboles dollars ($C$2) ?', 1),
('1d937f5a-bc18-45e3-aaaa-6156b6beb46b', 'quiz-p0-ran', 14, 'Tableur, Formules & Diagnostic', 'Q14. Corinne (Facturation KLF) panique car son tableau affiche l''erreur #DIV/0!. Quel est le diagnostic technique de cette anomalie ?', 1),
('65e2c3d0-b1d0-4e8e-a8b0-03b4a6322162', 'quiz-p0-ran', 15, 'Tableur, Formules & Diagnostic', 'Q15. Sur un inventaire de 500 ordinateurs, les en-têtes de colonnes disparaissent dès qu''on descend dans la feuille. Quelle option permet de les maintenir fixes à l''écran ?', 1),
('a6a4be49-e939-4236-bc47-9bbc3a57dce7', 'quiz-p0-ran', 16, 'Helpdesk & Support Utilisateur', 'Q16. Un responsable de service vous appelle en panique : ''Mon fichier de paie ne marche plus, arrangez-moi ça tout de suite !''. Quelle est votre PREMIÈRE action professionnelle de TIP ?', 1),
('fc4ebbd3-d5ba-4571-bcd7-7b99a0705ac1', 'quiz-p0-ran', 17, 'Cloud & Travail Collaboratif', 'Q17. Sur un document partagé en ligne (Google Drive ou OneDrive/SharePoint), comment retrouver le texte supprimé par erreur par un collègue il y a deux heures ?', 1),
('0bc1d6d6-6f22-4a0e-b710-6b47a8363c70', 'quiz-p0-ran', 18, 'Helpdesk & Support Utilisateur', 'Q18. Un cariste du quai de Jarry n''arrive pas à ouvrir un fichier ''.xlsx'' sur sa tablette durcie. Quel diagnostic et solution rapide proposez-vous ?', 1),
('02e4a898-cc07-4880-bbd0-b6e20c9e496f', 'quiz-p0-ran', 19, 'Sécurité des Données & RGPD', 'Q19. Quelle est la règle impérative de sécurité et de conformité RGPD lorsqu''un technicien TIP utilise un assistant IA (comme ChatGPT, Claude ou Gemini) pour résoudre un incident bureautique ?', 1),
('7f12a8b7-974c-4922-b4e4-a7eeb383eef9', 'quiz-p0-ran', 20, 'Automatisation & Publipostage', 'Q20. L''assistante RH Élodie doit envoyer 60 convocations personnalisées avec nom, date et poste différents. Quel procédé bureautique automatique évite de créer 60 fichiers à la main ?', 1),
('5488e563-56fd-40c2-8285-9dac4f1e9329', 'quiz-p1-excel-sheets', 1, 'Adressage absolu & Fiscalité locale', 'Dans le classeur de fret de KLF, la cellule B2 contient le taux d''Octroi de mer de Guadeloupe (8,5%). La colonne D contient les valeurs en douane des marchandises. Corinne saisit en E5 la formule ''=D5*B2'' puis l''étire vers le bas. Toutes les lignes suivantes affichent 0,00 €. Quelle formule doit-elle utiliser ?', 1),
('40d5758d-a2c8-4834-a8b9-1c8615404c2c', 'quiz-p1-excel-sheets', 2, 'Adressage semi-absolu & Grilles de fret', 'Pour calculer une grille tarifaire de fret maritime à double entrée (lignes = poids en tonnes de 1 à 10 en colonne B, colonnes = zones portuaires A, B, C sur la ligne 2), quelle formule unique saisie en C3 peut être étirée à la fois vers le bas ET vers la droite sans aucune distorsion ?', 1),
('5cc9a161-ae21-4aa8-9ef0-ffc0542ec097', 'quiz-p1-excel-sheets', 3, 'Fiscalité Antilles & Calcul de prix', 'En Guadeloupe, une marchandise informatique importée a un prix Hors Taxe (HT) de 1 000,00 €. L''Octroi de mer est de 8,5% et la TVA locale est de 8,5% (calculée sur la base HT majorée de l''Octroi de mer conformément aux règles douanières antillaises). Quelle formule calcule le montant Total TTC exact si la cellule A2 est le prix HT ?', 1),
('38232967-b80d-41b7-bdd6-70dfb282e700', 'quiz-p1-excel-sheets', 4, 'Recherche moderne RECHERCHEX', 'Dans l''inventaire du parc de KLF, vous devez retrouver le nom du cariste (colonne A) à partir du numéro de série de sa tablette Zebra (colonne C). Pourquoi la fonction RECHERCHEX est-elle techniquement supérieure à l''ancienne fonction RECHERCHEV ?', 1),
('b2dab8c3-aa5a-4b40-8f02-9aedd47ef2f8', 'quiz-p1-excel-sheets', 5, 'Recherche classique INDEX & EQUIV', 'Sur un poste utilisateur équipé d''une ancienne version d''Excel ne disposant pas de RECHERCHEX, quelle combinaison de fonctions permet d''effectuer une recherche vers la gauche pour trouver l''adresse IP (colonne A) en fonction de l''adresse MAC (colonne B, recherchée en cellule D2) ?', 1),
('02f5bbea-0ef7-4530-ab12-a83e7171f72c', 'quiz-p1-excel-sheets', 6, 'Recherche exacte vs approximative', 'Corinne utilise la formule ''=RECHERCHEV(A2; TarifsDouane; 3)'' sans renseigner le 4ème argument optionnel. Que se passe-t-il techniquement si la référence saisie en A2 n''existe pas dans la table ?', 1),
('f3656438-85b1-4161-beb6-80b3e19b9c13', 'quiz-p1-excel-sheets', 7, 'Recherche matricielle bidirectionnelle', 'Dans une matrice de fret KLF (lignes = types de conteneurs, colonnes = destinations maritimes Fort-de-France, Gustavia, Marigot), comment trouver dynamiquement le tarif croisé selon le conteneur sélectionné en A10 et la destination sélectionnée en B10 ?', 1),
('5ca40835-8059-4004-9b66-ff668656c029', 'quiz-p1-excel-sheets', 8, 'Logique conditionnelle imbriquée', 'La DSI KLF classe les incidents support : si la demande concerne le serveur central et que l''impact bloque le quai de Jarry, priorité ''P1'' ; sinon si le poste utilisateur est bloqué, ''P2'' ; dans tous les autres cas, ''P3''. Quelle formule imbriquée applique cette règle si Serveur=B2 et BloqueQuai=C2 et PosteBloque=D2 ?', 1),
('4dcfd3f8-d8cc-464e-bbdb-ce0c4c09659a', 'quiz-p1-excel-sheets', 9, 'Agrégation conditionnelle multicritère', 'Sébastien (chef de quai) doit calculer la somme totale du poids des conteneurs (colonne D) qui sont arrivés au port de ''Jarry'' (colonne B) ET dont le transporteur est ''CMA-CGM'' (colonne C). Quelle fonction est requise ?', 1),
('6392644e-83d2-441d-8501-bde70cb3793b', 'quiz-p1-excel-sheets', 10, 'Comptage conditionnel multicritère', 'Pour l''audit de renouvellement du parc informatique, vous devez compter le nombre d''ordinateurs portables (colonne B = ''PC Portable'') dont l''année d''achat (colonne C) est strictement inférieure à 2022. Quelle est la formule ?', 1),
('cc94f0f2-e78a-4de3-af3b-5a4849da901c', 'quiz-p1-excel-sheets', 11, 'Gestion et sécurisation des erreurs', 'Un tableau de bord d''alerte DSI effectue des divisions par le nombre de tickets résolus. Lorsque ce nombre est 0 en début de journée, la feuille est polluée par l''erreur ''#DIV/0!''. Quelle fonction permet de remplacer cette erreur par le texte ''En attente'' ?', 1),
('dd7e8d74-7769-4553-b141-e822974dfdab', 'quiz-p1-excel-sheets', 12, 'Diagnostic d''erreur #N/A', 'Une RECHERCHEX ou RECHERCHEV renvoie ''#N/A'' sur un numéro de châssis conteneur pourtant visiblement présent dans la base. Le technicien constate qu''un espace insécable a été copié en fin de référence dans la cellule de recherche. Quel diagnostic et correction technique s''imposent ?', 1),
('a471f2ef-dde3-4367-9c9a-2895521b8f15', 'quiz-p1-excel-sheets', 13, 'Diagnostic d''erreur #REF!', 'Après que Corinne a supprimé la colonne C (''Ancien Barème 2025''), l''ensemble des colonnes de facturation finale affiche immédiatement ''#REF!''. Quelle est la cause technique et la conduite à tenir pour le TIP ?', 1),
('55d13874-c90f-4f90-a09b-25754e4f1146', 'quiz-p1-excel-sheets', 14, 'Tableaux structurés d''entreprise', 'Pourquoi la DSI de KLF impose-t-elle de transformer toute liste brute de données en ''Tableau structuré'' (raccourci Ctrl+L ou Ctrl+T sous Excel) pour le suivi des expéditions ?', 1),
('4cc8522c-1ec0-4bf0-a052-a008d57102c0', 'quiz-p1-excel-sheets', 15, 'Validation des données & Ergonomie', 'Dans la colonne ''Quai de déchargement'', les caristes écrivent parfois ''Jarry 1'', ''j1'', ''QUAI 1'', ''Quai n°1'', ce qui rend impossible les tris et les statistiques. Comment contraindre techniquement les utilisateurs à choisir exclusivement entre ''Quai 1 - Houelbourg'' et ''Quai 2 - Port Maritime'' ?', 1),
('8d1a43e5-6e09-4146-bfd9-947c710f3946', 'quiz-p1-excel-sheets', 16, 'Contrôle d''intégrité & Anti-doublons', 'Vous devez configurer une colonne pour empêcher formellement tout utilisateur de saisir deux fois le même numéro de série de badge KLF dans la plage A2:A100. Quelle formule personnalisée saisissez-vous dans la ''Validation des données'' ?', 1),
('09c552c2-5ac0-42e1-b6c7-decab123963a', 'quiz-p1-excel-sheets', 17, 'Tableaux Croisés Dynamiques (TCD)', 'La direction de KLF demande une analyse des 1 200 incidents du mois : ils veulent visualiser la part en pourcentage de chaque service demandeur (Facturation, Quai, RH) par rapport au volume total d''incidents. Comment obtenir ce calcul en 2 clics dans un TCD ?', 1),
('fa4451ee-f0c9-4ba5-92d6-7531ddcc8db5', 'quiz-p1-excel-sheets', 18, 'Actualisation & Périmètre TCD', 'Ce matin, 40 nouveaux conteneurs ont été saisis dans la feuille ''Données''. Pourtant, le Tableau Croisé Dynamique de synthèse du DSI n''affiche toujours que les chiffres de la veille. Quelles sont les DEUX actions de maintenance à exécuter ?', 1),
('cd709961-55e2-44b1-ad80-ca89f5f4b4a5', 'quiz-p1-excel-sheets', 19, 'Nettoyage & Normalisation de données', 'Dans un fichier d''inventaire exporté d''un vieil ERP portuaire, les numéros de téléphone et codes postaux apparaissent sous forme textuelle avec des espaces insécables parasites et des zéros initiaux disparus (ex: ''7122'' au lieu de ''97122''). Quelle fonction permet de formater un code postal sur 5 chiffres avec les zéros initiaux ?', 1),
('47c2777f-0a3a-4e9d-8cef-9a761aa112f9', 'quiz-p1-excel-sheets', 20, 'Imports CSV & Délimiteurs régionaux', 'Un cariste ouvre un fichier ''douane_fret.csv'' sous Excel sur un PC francophone. Toutes les colonnes se retrouvent agglomérées dans la seule colonne A, séparées par des points-virgules. Quel outil natif d''Excel permet de séparer instantanément ces données dans leurs colonnes respectives ?', 1),
('d103f964-25fd-4b73-8adb-02f007f716d7', 'quiz-p1-outlook-gmail', 1, 'Architecture & Protocoles de messagerie', 'Un agent d''escale de KLF utilise Outlook sur son PC fixe à Jarry et l''application mobile sur son smartphone lors des tournées sur les quais. Il signale que lorsqu''il lit, classe ou supprime un e-mail sur son smartphone, l''opération n''apparaît pas sur son ordinateur fixe et les messages réapparaissent en non lu. Quel protocole de relève est en cause ?', 1),
('8ac64ffd-9209-4665-a1c1-8634e4e0cf97', 'quiz-p1-outlook-gmail', 2, 'Fichiers de données Outlook (.ost vs .pst)', 'Suite à un crash matériel imprévu du disque dur d''un ordinateur portable chez KLF, la direction craint d''avoir perdu 3 années de correspondance professionnelle hébergée sur Microsoft 365. En tant que technicien TIP, que leur expliquez-vous concernant la nature du fichier ''.ost'' ?', 1),
('146a7e86-4e4c-4767-9546-ce70867a39b3', 'quiz-p1-outlook-gmail', 3, 'Ports réseau & Sécurisation SMTP sortant', 'Lors d''une télé-assistance chez un collaborateur de KLF en Guadeloupe, l''envoi de messages échoue systématiquement avec une erreur d''accès au serveur sortant, alors que la réception fonctionne parfaitement. Quel blocage de port par les FAI résidentiels est la cause classique de cet incident ?', 1),
('8d63b860-0d15-4c66-ab0d-c5daf4806e5e', 'quiz-p1-outlook-gmail', 4, 'Fuseaux horaires Caraïbes & Agendas partagés', 'La responsable des approvisionnements à Jarry (Guadeloupe, fuseau UTC-4 toute l''année) organise un point stratégique d''urgence avec les transitaires maritimes à Paris (fuseau UTC+2 en heure d''été). Elle planifie le créneau à 10h00 heure locale dans son agenda d''entreprise. À quelle heure ce rendez-vous s''affichera-t-il automatiquement dans l''agenda du correspondant parisien ?', 1),
('dc907012-d13e-4d99-8cae-3eafd4a93593', 'quiz-p1-outlook-gmail', 5, 'Réservation de salles & Équipements partagés', 'Pour coordonner une opération portuaire complexe, le chef d''entrepôt souhaite réserver la salle de visioconférence du bâtiment administratif ainsi qu''un vidéoprojecteur mobile. Dans un environnement professionnel Exchange ou Google Workspace, quelle méthode respecte les bonnes pratiques DSI ?', 1),
('084610a9-bea0-443e-807b-358a08204bea', 'quiz-p1-outlook-gmail', 6, 'Délégation d''agenda & Droits d''accès', 'Un chef de service de KLF souhaite que son assistante administrative puisse consulter ses rendez-vous, créer de nouvelles réunions et répondre aux invitations d''agenda pour son compte sans jamais avoir accès à son mot de passe de session. Quel niveau d''autorisation doit être attribué dans Outlook ?', 1),
('128257a1-a632-42d5-877f-a171a4eb77ec', 'quiz-p1-outlook-gmail', 7, 'Règles de messagerie serveur vs règles client', 'Un technicien support configure une règle Outlook pour déplacer automatiquement les e-mails d''alerte de pannes dans un sous-dossier dédié. Pendant ses congés, alors que son ordinateur portable professionnel reste éteint, les e-mails s''accumulent dans sa boîte de réception sans être déplacés. Quelle est la cause technique de cette anomalie ?', 1),
('a516d2fa-2c5e-42b8-94ad-90d4958c1bb9', 'quiz-p1-outlook-gmail', 8, 'Dossiers de recherche virtuels (Search Folders)', 'La responsable comptable manipule des centaines d''e-mails répartis dans une trentaine de sous-dossiers clients. Elle souhaite visualiser en un clic l''intégralité des factures contenant des pièces jointes et marquées d''un drapeau de suivi, sans devoir les déplacer ni altérer son classement existant. Quelle fonctionnalité native de messagerie répond à son besoin ?', 1),
('e5ae9cb0-c790-4264-a6a9-c2fd4555d7e8', 'quiz-p1-outlook-gmail', 9, 'Dépannage de boîte d''envoi bloquée (Outbox freeze)', 'Un agent logistique contacte le support : son logiciel Outlook est totalement bloqué à l''envoi et plus aucun message ne part. En examinant la file d''attente, vous découvrez qu''un e-mail contenant un fichier vidéo de 85 Mo tente de s''émettre en boucle et verrouille la transmission des courriers suivants. Quelle procédure débloque la situation immédiatement ?', 1),
('3b85cee9-f9a0-46f5-9511-89865863577e', 'quiz-p1-outlook-gmail', 10, 'Cybersécurité e-mail : Enregistrement DNS SPF', 'Le service financier reçoit un e-mail semblant émaner de la direction générale sollicitant un virement international urgent de 35 000 €. En inspectant les en-têtes RFC 5322 bruts du courriel, le technicien TIP relève : ''Received-SPF: Fail (domain of sender does not designate IP 185.220.101.4 as permitted sender)''. Quelle est la conclusion technique indiscutable ?', 1),
('af04ed4e-8658-4467-9c9b-871591bd6854', 'quiz-p1-outlook-gmail', 11, 'Cryptographie de messagerie : Signature numérique DKIM', 'Pour attester de l''authenticité des messages émis par l''entreprise et garantir au destinataire que le contenu du courriel n''a pas été altéré en cours de route par un tiers, quel mécanisme cryptographique basé sur une paire de clés asymétriques est déployé dans les zones DNS ?', 1),
('9ad4b801-3de9-4277-9b26-158c46b9992d', 'quiz-p1-outlook-gmail', 12, 'Gouvernance de sécurité e-mail : Politique DMARC', 'La DSI de KLF souhaite que tout e-mail usurpant le nom de domaine de l''entreprise qui échoue aux tests combinés SPF et DKIM soit automatiquement bloqué et rejeté par les serveurs de messagerie du monde entier, sans jamais atteindre la boîte de réception des destinataires. Quelle politique DMARC doit être configurée sur le DNS ?', 1),
('2c9190ea-6bb9-4abd-998f-1744660be177', 'quiz-p1-outlook-gmail', 13, 'Détection de phishing & Inspection de liens masqués', 'Un agent de saisie de Jarry reçoit un courriel urgent affirmant que son compte Microsoft 365 sera désactivé sous 2 heures s''il ne clique pas sur le bouton « Conserver mon accès ». Quel réflexe technique élémentaire permet de vérifier la légitimité du lien avant toute interaction ?', 1),
('a8f0482a-0770-42ed-afa9-c0ef28d0b629', 'quiz-p1-outlook-gmail', 14, 'Procédure d''urgence face à une pièce jointe malveillante', 'Un cariste appelle le guichet de support informatique en panique : il vient d''ouvrir une pièce jointe nommée ''Facture_Maritime.exe'' reçue par e-mail et des invites de commandes suspectes s''ouvrent en boucle sur son écran. En tant que technicien TIP, quelle est votre TOUTE PREMIÈRE consigne immédiate ?', 1),
('c5c253cf-7c76-470e-9d93-4eec5f7437f7', 'quiz-p1-outlook-gmail', 15, 'Conformité RGPD & Diffusion de masse d''e-mails', 'Le service commercial de KLF doit adresser la nouvelle grille des tarifs d''escale à 150 clients partenaires maritimes. Quelle règle technique impérative le technicien support doit-il prescrire pour respecter le RGPD et prévenir une sanction de la CNIL ?', 1),
('e3783350-2967-4261-925a-dcb1af4cd86b', 'quiz-p1-outlook-gmail', 16, 'Groupes de distribution Exchange vs Listes de contacts locales', 'Quelle est la différence structurelle entre une ''Liste de contacts locale'' créée par un utilisateur dans son logiciel Outlook et un ''Groupe de distribution'' configuré par la DSI sur le serveur Exchange ?', 1),
('06dae0e2-4624-4f7c-8a7f-2a0a882caddd', 'quiz-p1-outlook-gmail', 17, 'Signatures d''entreprise & Mentions légales obligatoires', 'Dans le cadre de la charte de communication de KLF, le technicien TIP doit paramétrer le modèle de signature électronique normalisé. Selon le Code de commerce français, quelles informations doivent impérativement figurer dans les courriers d''entreprise ?', 1),
('c57d12a7-28db-44ce-b309-f7cb1139763f', 'quiz-p1-outlook-gmail', 18, 'Pièces jointes volumineuses & Erreur SMTP 552', 'Un transitaire de KLF tente d''expédier un dossier de douane zippé de 55 Mo. Le message lui revient instantanément avec le code d''erreur ''552 5.3.4 Message size exceeds fixed maximum limit''. Quelle solution technique pérenne le technicien TIP doit-il lui prescrire ?', 1),
('3c381312-a57f-4ca0-8f66-22020040c983', 'quiz-p1-outlook-gmail', 19, 'Boîtes aux lettres partagées (Shared Mailbox)', 'Le service d''assistance de KLF exploite une boîte partagée ''support@klf-logistique.gp''. Quelle est la différence technique entre les autorisations ''Envoyer en tant que'' (Send As) et ''Envoyer de la part de'' (Send on behalf of) lorsqu''un technicien répond à une demande usager ?', 1),
('41d0cb01-054f-482a-a4f1-ddbfe6d21003', 'quiz-p1-outlook-gmail', 20, 'Quotas de boîte aux lettres & Stratégie d''archivage', 'La boîte de réception principale du responsable des achats affiche ''49,6 Go utilisés sur 50 Go'', bloquant la réception de nouveaux courriels. L''utilisateur doit impérativement conserver l''historique de ses 5 dernières années de devis et contrats. Quelle procédure de maintenance DSI pérenne doit être activée ?', 1),
('554be693-5a31-4cbe-bfd8-1a653d26ebc1', 'quiz-p1-word-docs', 1, 'Styles & Normalisation DSI', 'Dans le rapport d''incident de 30 pages rédigé par un technicien pour le DSI de KLF, la table des matières automatique insérée affiche le message : ''Aucune entrée de table des matières n''a été trouvée''. Quelle est la cause technique de ce problème ?', 1),
('95139638-923b-4f06-8926-fe4e58e5e7eb', 'quiz-p1-word-docs', 2, 'Mise en page & Sauts de section', 'Dans une procédure d''intervention KLF, vous devez insérer au milieu du document un grand tableau de synthèse en mode Paysage (pages 5 et 6), alors que tout le reste du document doit rester en mode Portrait. Quelle manipulation technique est obligatoire ?', 1),
('20c58b74-3313-4c20-b5d2-971a30b7fce9', 'quiz-p1-word-docs', 3, 'En-têtes & Pagination', 'Sur une procédure officielle KLF de 10 pages, la page 1 est la page de garde. La DSI exige qu''aucun en-tête ni numéro n''apparaisse sur la page 1, et que la page 2 affiche ''Page 1 sur 9''. Quelle est la configuration correcte ?', 1),
('ef4cbaef-14ce-4090-ae69-2932a81ebd88', 'quiz-p1-word-docs', 4, 'Publipostage & Commutateurs', 'Élodie (RH KLF) fusionne des courriers de convocation Word à partir d''un fichier Excel. Dans le courrier généré, la date d''embauche s''affiche sous la forme ''09/15/2026 12:00:00 AM'' au lieu de ''15/09/2026''. Quel commutateur de champ doit être ajouté dans le code de champ Word ?', 1),
('653850fa-f983-4488-ad95-a599236bdd6e', 'quiz-p1-word-docs', 5, 'Publipostage & Commutateurs', 'Lors du publipostage des quittances et primes de transport, les montants importés d''Excel affichent 1500.5 au lieu de 1 500,50 €. Quel commutateur numérique résout définitivement ce problème ?', 1),
('73e648de-f3ec-49dd-b64b-df40c0567f8d', 'quiz-p1-word-docs', 6, 'Publipostage conditionnel', 'Vous devez insérer automatiquement un paragraphe d''avertissement sur l''Octroi de mer uniquement si le destinataire est localisé en Guadeloupe (CodePostal commençant par 971). Quel champ Word utilisez-vous ?', 1),
('3b0cdd49-e668-4fdd-a03a-ae76975ce208', 'quiz-p1-word-docs', 7, 'Collaboration & Historique', 'Sur une procédure de maintenance rédigée sur Google Docs par 3 techniciens de Jarry, un paragraphe essentiel rédigé ce matin à 09h00 a été effacé par erreur par un collègue à 11h00. Plusieurs autres techniciens ont continué à écrire entre 11h00 et 11h30. Comment restaurer le paragraphe perdu sans écraser le travail fait entre 11h00 et 11h30 ?', 1),
('3d2addae-0057-4d4e-9f8d-8ba85b954d01', 'quiz-p1-word-docs', 8, 'Mode Révision & Traçabilité', 'Vous transmettez une proposition de contrat de fret à un client externe. La DSI KLF exige que le client puisse proposer des modifications visibles sans pouvoir supprimer définitivement le texte d''origine à votre insu. Quelle fonction activez-vous dans Word ?', 1),
('8acfdf6e-52b4-478e-be3c-b78319caed36', 'quiz-p1-word-docs', 9, 'Comparaison de documents', 'Deux techniciens ont travaillé chacun de leur côté sur une copie séparée de la procédure de sécurité réseau (Procedure_V1_Jordan.docx et Procedure_V1_Thomas.docx). Quel outil natif de Word permet de fusionner leurs modifications dans un document unique en visualisant chaque différence ?', 1),
('f5e773a8-496b-4432-a705-97fd0592cad0', 'quiz-p1-word-docs', 10, 'Modèles d''entreprise & Sécurité', 'La DSI KLF crée une matrice officielle pour les fiches d''intervention. Pour éviter que les techniciens n''écrasent accidentellement le fichier original lorsqu''ils le remplissent, sous quelle extension devez-vous enregistrer et déployer cette matrice ?', 1),
('3e6e1699-ebb2-4f65-ab1e-d2fd1baabb19', 'quiz-p1-word-docs', 11, 'Tableaux & Pagination', 'Dans un rapport de contrôle du parc informatique, un tableau de 150 lignes s''étend sur 4 pages. La DSI constate que sur les pages 2, 3 et 4, on ne comprend plus à quoi correspondent les colonnes car les en-têtes ont disparu. Quelle option Word activez-vous ?', 1),
('154ffa33-c1e1-4ce6-af8f-0b9f8645d887', 'quiz-p1-word-docs', 12, 'Objets & Habillage graphique', 'Lors de la création d''une fiche réflexe d''incident, un technicien insère une capture d''écran. Dès qu''il appuie sur Entrée pour rédiger le texte, l''image saute de manière erratique sur la page suivante. Quel habillage d''image garantit une stabilité absolue dans le flux de texte ?', 1),
('c8f054bf-2937-453d-8aa9-a199072f7a26', 'quiz-p1-word-docs', 13, 'Accessibilité & Qualiopi', 'Dans le cadre de la conformité Qualiopi et de l''accessibilité numérique aux personnes malvoyantes, quelle est l''obligation technique pour tout schéma ou capture d''écran inséré dans les supports de cours TIP ?', 1),
('3639f009-1a83-431d-9c4e-cea44dc326c3', 'quiz-p1-word-docs', 14, 'Dépannage & Fichiers corrompus', 'Corinne tente d''ouvrir une procédure vitale ''Procedure_Fret.docx'' et Word renvoie l''erreur fatale : ''Word a trouvé du contenu illisible dans... Impossible d''ouvrir le fichier''. En tant que TIP, quelle démarche technique avancée tentez-vous en premier ?', 1),
('7c245727-214e-40be-a049-d45401f01c28', 'quiz-p1-word-docs', 15, 'Sécurité & Confidentialité RGPD', 'Avant d''envoyer un rapport d''audit technique à un sous-traitant externe, quelle fonctionnalité de Word permet de détecter et supprimer définitivement les commentaires masqués, les révisions antérieures et le nom de l''auteur original ?', 1),
('a9335e44-5a5b-45ee-85ec-f898cd1d54dc', 'quiz-p1-word-docs', 16, 'Typographie & Ergonomie de saisie', 'Dans une liste à puces ou une cellule de tableau, quelle est la différence essentielle entre appuyer sur ''Entrée'' et appuyer sur ''Maj + Entrée'' (Shift + Enter) ?', 1),
('554847a5-fd9d-4578-8c7b-c4e92c6edd50', 'quiz-p1-word-docs', 17, 'Formulaires & Protection', 'La DSI souhaite créer un formulaire Word de demande de matériel informatique. Les utilisateurs doivent pouvoir remplir uniquement les zones prévues (nom, service, matériel) sans pouvoir modifier le texte fixe, le logo ou la mise en page. Comment procéder ?', 1),
('1241a495-d522-4ac1-b3ba-82e21dc2a52e', 'quiz-p1-word-docs', 18, 'Automatisation & QuickParts', 'Les techniciens support de KLF doivent insérer plusieurs fois par jour le bloc officiel d''avertissement de sécurité DSI (logo, texte juridique, contacts d''astreinte). Quel outil permet de stocker ce bloc préformaté et de l''insérer d''un simple clic ou mot-clé ?', 1),
('6c732df0-73f5-4f81-b016-7965a5bb2f30', 'quiz-p1-word-docs', 19, 'Archivage & Norme PDF/A', 'Pour l''archivage légal des contrats d''armateurs et des attestations de formation Qualiopi, la DSI KLF impose l''export au format ''PDF/A''. Quelle est la particularité fondamentale de cette norme ISO ?', 1),
('12e69e9d-0e80-4239-a410-06dcca4ca7b7', 'quiz-p1-word-docs', 20, 'Raccourcis productivité DSI', 'Un technicien TIP doit reproduire la mise en forme complexe (police spécifique, retrait, bordure gauche bleue, couleur) d''un titre vers 15 autres paragraphes du document. Quel enchaînement de raccourcis clavier sans souris est le plus rapide ?', 1)
on conflict (id) do update set
  quiz_id = excluded.quiz_id,
  ordre = excluded.ordre,
  theme = excluded.theme,
  enonce = excluded.enonce,
  points = excluded.points;

-- Insertion des 300 Options Officielles KLF
insert into tip.sf_quiz_options (id, question_id, lettre, texte, is_correct, dsi_explanation) values
('2e9b889a-dd80-47bc-a2d1-d8b9c440862c', '8d1a43e5-6e09-4146-bfd9-947c710f3946', 'A', '=UNIQUE($A$2:$A$100)', false, 'UNIQUE est une fonction matricielle de restitution de valeurs, pas une formule de validation conditionnelle de saisie unitaire.'),
('85e95aaa-2764-4098-b088-63888cdee695', '3d2addae-0057-4d4e-9f8d-8ba85b954d01', 'A', 'Enregistrer le fichier en lecture seule sur une clé USB chiffrée.', false, 'La lecture seule totale empêcherait le client de formuler ses propositions de modifications.'),
('cfbf3530-57f0-412d-9c6e-b57f670e53a0', '084610a9-bea0-443e-807b-358a08204bea', 'A', 'La délégation d''agenda avec droit d''accès « Délégué » (Éditeur) et permission d''envoi « De la part de » (Send on behalf of).', true, 'La délégation permet à un collaborateur d''administrer l''agenda d''un tiers et de répondre officiellement aux réunions tout en préservant l''étanchéité des mots de passe personnels.'),
('41a553aa-85c2-4cad-b6c1-c454054f989d', '4cc8522c-1ec0-4bf0-a052-a008d57102c0', 'A', 'Mettre le texte en rouge clignotant grâce au langage CSS.', false, 'Excel n''utilise pas de CSS pour le contrôle de saisie en temps réel.'),
('99067af2-8158-427d-bf09-0a9511f7a925', '55d13874-c90f-4f90-a09b-25754e4f1146', 'A', 'Cela transforme automatiquement le fichier Excel en application mobile iOS téléchargeable sur l''App Store.', false, 'Un tableau structuré reste un objet tableur interne sans générer d''application binaire mobile.'),
('7dd6a28f-db3d-48fa-851d-1af822bbaeb3', '8acfdf6e-52b4-478e-be3c-b78319caed36', 'A', 'Le collage spécial avec l''option ''Fusionner la mise en forme''.', false, 'Le collage spécial ne compare pas le contenu ligne par ligne et risque d''écraser des données sans avertissement.'),
('1f5ae43d-5df5-417e-8370-49868970a476', 'dae0b1bf-4b6a-4f79-a571-941a08e27985', 'A', 'Par le signe égal (=)', true, 'Le signe ''='' indique au moteur de calcul qu''il ne s''agit pas de texte brut mais d''une expression à interpréter.'),
('fb8723a7-997a-4d61-b8b9-8f0af36046f8', 'a471f2ef-dde3-4367-9c9a-2895521b8f15', 'A', 'Il suffit d''attendre 10 minutes que le fichier se synchronise automatiquement avec le serveur.', false, 'La synchronisation ne réparera pas une formule dont la cellule source a été physiquement effacée.'),
('9875b21d-1ed0-4eba-9de3-be4b653f523d', 'cc94f0f2-e78a-4de3-af3b-5a4849da901c', 'A', '=SIERREUR(formule; "En attente")', true, 'La fonction SIERREUR intercepte toute anomalie (#DIV/0!, #N/A, #VALEUR!, #REF!) et renvoie la valeur de substitution propre sans interrompre le calcul.'),
('d88a6497-1af4-4522-a86a-812cbe88b9a5', 'f5e773a8-496b-4432-a705-97fd0592cad0', 'A', 'En document texte brut (.txt).', false, 'Le format .txt détruit toute la mise en page, les logos, les styles et les tableaux.'),
('cd5840ce-19fd-45c6-9a02-471a563ab050', '01e51db6-ecee-4ffc-802d-21bb3cf28046', 'A', 'Rapport_Final_v2_corrige_DSI_OK.docx', false, 'Cette option est incorrecte. Le format ISO AAAA-MM-JJ avec préfixe d''entreprise, objet clair, versioning et initiales garantit un tri chronologique et une traçabilité parfaite.'),
('93c2c76d-c31a-4712-9f01-f057ac9b6e31', '6392644e-83d2-441d-8501-bde70cb3793b', 'A', '=COMPTER(B:B = "PC Portable" ET C:C < 2022)', false, 'COMPTER n''est pas une fonction de calcul conditionnel dans Excel.'),
('5b08a3bb-68df-4e92-a03b-07b553423b09', '4dcfd3f8-d8cc-464e-bbdb-ce0c4c09659a', 'A', '=SOMME(D:D) * SI(B:B="Jarry")', false, 'Cette syntaxe ne filtre pas les lignes et produit une erreur matricielle sur des colonnes entières.'),
('87546000-89b3-4c97-b797-966a4615f166', '3e6e1699-ebb2-4f65-ab1e-d2fd1baabb19', 'A', 'Convertir le tableau en objet graphique vectoriel SVG non modifiable.', false, 'Cela figerait les données et empêcherait toute recherche textuelle ou mise à jour.'),
('1b2a87ab-9d49-444f-9c34-630ec8bac22c', 'dc907012-d13e-4d99-8cae-3eafd4a93593', 'A', 'Envoyer un e-mail collectif avec mention URGENT dans l''objet à l''ensemble des collaborateurs du site.', false, 'Cette pratique sature inutilement les boîtes aux lettres et ne garantit aucun verrouillage effectif du créneau.'),
('99d5d3dc-fdd1-4ab2-a11c-5e8699b28762', '5ca40835-8059-4004-9b66-ff668656c029', 'A', '=SI(B2=C2; "P1"; "P2"; "P3")', false, 'La fonction SI n''accepte que 3 arguments (Test logique, Valeur si VRAI, Valeur si FAUX). Quatre arguments provoquent une erreur de syntaxe.'),
('edd573e9-9563-418a-865d-b87e397d0e58', 'f3656438-85b1-4161-beb6-80b3e19b9c13', 'A', '=CROISER(A10; B10; MatriceTarifs)', false, 'La fonction CROISER n''existe pas dans le référentiel de calcul Excel ou Google Sheets.'),
('9bb21773-efca-4f28-832e-5a0e624aa35d', '154ffa33-c1e1-4ce6-af8f-0b9f8645d887', 'A', 'Définir la transparence de l''image à 50% dans les filtres artistiques.', false, 'La transparence modifie le canal alpha visuel, pas l''ancrage géométrique dans la page.'),
('f3f93bff-f637-457e-b2a5-843822054db6', '39b8f5ff-2a34-4a6a-80bd-1787fee242b0', 'A', '=TOTAL.PLAGE(B2;B20)', false, 'Cette option est incorrecte. Le séparateur '':'' définit une plage continue, alors que ''+'' entre deux cellules n''additionne que ces deux valeurs isolées.'),
('6f7e6ba9-8e57-4d24-a5b6-339dcb19a709', '02f5bbea-0ef7-4530-ab12-a83e7171f72c', 'A', 'Excel applique une recherche approximative (VRAI par défaut) et renvoie le tarif d''une marchandise différente sans avertir l''utilisateur si la table n''est pas triée.', true, 'C''est l''un des pièges les plus dangereux d''Excel : par défaut, le 4ème argument est VRAI (approximatif). Il faut toujours forcer 0 ou FAUX pour garantir une recherche exacte et éviter des erreurs de facturation.'),
('70135f62-2875-4752-aa17-126cf866fcc5', 'b2dab8c3-aa5a-4b40-8f02-9aedd47ef2f8', 'A', '=TROUVER(D2; B:B)*A:A', false, 'La fonction TROUVER localise une sous-chaîne dans un texte et ne renvoie pas de cellule matricielle.'),
('6cc87b21-fd1b-459d-8cd3-cc5e9df8e759', 'c8f054bf-2937-453d-8aa9-a199072f7a26', 'A', 'Convertir toutes les images en noir et blanc à fort contraste.', false, 'Le contraste est important mais ne dispense absolument pas de la description sémantique alternative.'),
('22e5a5d9-85e7-4a40-b18f-3976c6335375', '3c381312-a57f-4ca0-8f66-22020040c983', 'A', 'L''envoi ''En tant que'' transmet le courriel par télex alors que ''De la part de'' utilise le réseau Internet classique.', false, 'Les deux options utilisent le protocole de messagerie électronique standard SMTP.'),
('8ca95437-68d9-45ea-a40a-cfb8c0818a2e', '5cc9a161-ae21-4aa8-9ef0-ffc0542ec097', 'A', '=A2*(1 + 0,085)*(1 + 0,085)', true, 'Fiscalement aux Antilles, l''Octroi de mer s''ajoute au prix HT pour constituer l''assiette soumise à la TVA locale. La formule applique successivement les deux taux (soit Prix HT * 1,085 * 1,085 = 1 177,22 €).'),
('64571d22-47e5-468c-97a5-fc32183341d7', '40d5758d-a2c8-4834-a8b9-1c8615404c2c', 'A', '=B$3*$C2', false, 'Inversion des axes : la ligne du poids glisserait et la colonne de la zone se figerait anormalement.'),
('6d8aafe3-b7fa-4123-996a-5f5b0df43056', '3639f009-1a83-431d-9c4e-cea44dc326c3', 'A', 'Formater le disque dur du poste utilisateur en NTFS sécurisé.', false, 'Action destructrice disproportionnée qui détruirait toutes les données du poste !'),
('0bb5d201-09f7-4a4a-8753-8ab1a7d72cad', '8d63b860-0d15-4c66-ab0d-c5daf4806e5e', 'A', 'À 10h00 heure de Paris, car les agendas professionnels ignorent les décalages géographiques.', false, 'Cela engendrerait un manquement grave : 10h00 à Paris correspond à 04h00 du matin en Guadeloupe !'),
('7d3929e0-22de-463a-9321-cf39151936be', '5488e563-56fd-40c2-8285-9dac4f1e9329', 'A', '=D5*$B$2', true, 'Les symboles dollars ($B$2) verrouillent la référence à la cellule de taux (référence absolue). Lors de l''étirement vers le bas, D5 devient D6, mais $B$2 reste figée sur le taux de 8,5%.'),
('dd6de7ac-52eb-4423-b172-e6be48fdb77f', '12e69e9d-0e80-4239-a410-06dcca4ca7b7', 'A', 'Ctrl + C puis Ctrl + V sur chaque paragraphe.', false, 'Ctrl+C/V copie le texte lui-même et écraserait le contenu du paragraphe cible !'),
('a3289be0-7eca-4f6d-b613-f6df94c6e72b', '6c732df0-73f5-4f81-b016-7965a5bb2f30', 'A', 'Elle rend le document modifiable uniquement sur un smartphone Android.', false, 'Le PDF/A est un format ouvert universel indépendant de tout système d''exploitation.'),
('03beb1ff-84a0-4804-a8e1-1c00f5b86ea6', 'f4395f9e-ebd0-48f5-a126-0dbc2ff1d5c9', 'A', 'Une conversion monétaire automatique de la valeur en dollars américains (USD)', false, 'Cette option est incorrecte. Les $ figent les coordonnées (ligne et colonne) lors de l''incrémentation (touche F4 pour basculer rapidement).'),
('88318d62-8c8d-408d-843a-74beec81ffef', '1241a495-d522-4ac1-b3ba-82e21dc2a52e', 'A', 'Le presse-papier de Windows 95.', false, 'Le presse-papier est volatil et n''est pas persistant dans le profil bureautique d''entreprise.'),
('4d563ad2-2912-4db2-ba1c-73f8ab192ee8', '554847a5-fd9d-4578-8c7b-c4e92c6edd50', 'A', 'Mettre le texte fixe en taille 1 point pour que les utilisateurs ne puissent pas cliquer dessus.', false, 'Pratique farfelue qui rendrait le formulaire illisible.'),
('3eb1b1c7-668f-4342-b335-fcbf4a9f79df', 'a9335e44-5a5b-45ee-85ec-f898cd1d54dc', 'A', 'Les deux combinaisons produisent un code binaire strictement identique.', false, 'Faux : en typographie Word, le saut de paragraphe est le caractère ¶ (ASCII 13/10) alors que le saut de ligne manuel est le symbole ↵ (ASCII 11).'),
('cddb5002-2608-4973-9933-5ac57a2952e1', 'e3783350-2967-4261-925a-dcb1af4cd86b', 'A', 'Une liste locale Outlook permet d''envoyer des e-mails chiffrés avec les serveurs de la NASA.', false, 'Affirmation fantaisiste sans aucun fondement dans les architectures de messagerie d''entreprise.'),
('158d7b0f-e1bc-483e-872a-64166adf64ec', '146a7e86-4e4c-4767-9546-ce70867a39b3', 'A', 'Le port 80 (HTTP) est saturé par les connexions Wi-Fi domestiques de la résidence.', false, 'Le port 80 concerne la navigation Web non chiffrée et n''intervient pas dans les flux de messagerie sortante.'),
('b9d9bc1e-0aab-4e8b-b653-90bbd8bac52a', '1d937f5a-bc18-45e3-aaaa-6156b6beb46b', 'A', 'La formule tente de diviser par zéro ou par une cellule vide non renseignée', true, 'La division par zéro est mathématiquement indéfinie. On la corrige en intégrant une condition ou la fonction SIERREUR().'),
('4b108d8c-f085-46e6-aff5-700d9c4e0253', 'ca02acd1-f48d-4830-afa2-fcafe431babc', 'A', 'Parce que le moindre ajout ou suppression de texte en amont décalera l''intégralité des pages suivantes (il faut utiliser un Saut de page forcé Ctrl+Entrée)', true, 'Le saut de paragraphe multiple est un réflexe amateur destructeur pour la pagination. Le saut de page (Ctrl + Entrée) isole définitivement les sections.'),
('504e42ac-5b6c-437b-87e6-61424f2f6073', '8ac64ffd-9209-4665-a1c1-8634e4e0cf97', 'A', 'Le fichier .ost est un simple cache local synchronisé : la totalité des e-mails, calendriers et dossiers réside sur le serveur cloud Exchange et sera restaurée à 100% lors de la reconnexion sur un nouveau poste.', true, 'Le fichier .ost (Offline Storage Table) est un miroir local temporaire du cloud. Les données d''origine sont sécurisées sur les serveurs distants de Microsoft 365.'),
('f0b373fd-0b78-4f31-8a89-f5e6b2764dd6', '65e2c3d0-b1d0-4e8e-a8b0-03b4a6322162', 'A', 'Utiliser l''option ''Figer les volets'' (ou Figer la 1ère ligne)', true, 'L''option ''Figer les lignes'' conserve les intitulés visibles lors du défilement, indispensable pour tout tableau de données.'),
('3f5e9882-ad88-47d2-826b-3f259458384d', 'ecb7b2e8-e8ec-4747-a179-a15fd351a669', 'A', 'Utiliser la combinaison de touches Windows + Maj + S (Outil Capture d''écran)', true, 'Windows + Shift + S lance l''outil capture rectangulaire immédiate qui place l''image directement dans le presse-papiers.'),
('58fbf357-7824-4911-89cb-c43add191988', 'd103f964-25fd-4b73-8adb-02f007f716d7', 'A', 'Le smartphone utilise une connexion 4G instable qui désactive automatiquement le chiffrement TLS du serveur.', false, 'La qualité du réseau mobile ne modifie pas les règles de synchronisation logique de la boîte aux lettres.'),
('69c987f2-13ed-4639-8d0b-077a44dbb6c8', 'a6a4be49-e939-4236-bc47-9bbc3a57dce7', 'A', 'Supprimer immédiatement les formules suspectes et les réécrire de mémoire', false, 'Cette option est incorrecte. Règle absolue du technicien : sauvegarder l''état existant avant intervention pour éviter toute perte irrémédiable de données.'),
('f64299db-7b07-4cef-8861-71f7b4106505', 'c5c253cf-7c76-470e-9d93-4eec5f7437f7', 'A', 'Renseigner l''ensemble des 150 adresses e-mails professionnelles dans le champ ''À'' (Destinataires principaux).', false, 'Cette pratique expose publiquement les adresses de tous les partenaires à des tiers, constituant une violation de données.'),
('f77b431d-1649-4b1d-b191-f8eeaf81b2d8', 'dd7e8d74-7769-4553-b141-e822974dfdab', 'A', 'L''erreur #N/A indique que la feuille de calcul a atteint sa date d''expiration légale.', false, 'Un classeur Excel n''a aucune notion de date de péremption native.'),
('30f4f587-8b80-4e29-8ac1-00859806350c', 'fc4ebbd3-d5ba-4571-bcd7-7b99a0705ac1', 'A', 'Consulter l''Historique des versions du document et restaurer la révision souhaitée', true, 'Le versioning automatique des suites collaboratives permet de remonter dans le temps et de comparer les modifications horodatées.'),
('cffd9f5d-95e6-4c7f-a375-aebb464dceb1', '95a4d994-b243-45a4-902e-b7d5c91b1669', 'A', 'Uniquement empêcher les autres utilisateurs de modifier le document', false, 'Cette option est incorrecte. Les styles permettent la table des matières automatique, le plan hiérarchique et la modification globale du design en un clic.'),
('914998b9-e83b-4617-a5d7-e251b93a6b82', '38232967-b80d-41b7-bdd6-70dfb282e700', 'A', 'RECHERCHEX fonctionne uniquement si le classeur est connecté à Internet par fibre optique.', false, 'RECHERCHEX est une fonction de calcul local intégrée au moteur d''Excel et de Sheets.'),
('90c8550e-19c1-47c3-828b-0f79d6a3ee76', '0bc1d6d6-6f22-4a0e-b710-6b47a8363c70', 'A', 'Formater immédiatement la tablette', false, 'Cette option est incorrecte. L''extension détermine l''application associée. En mobilité, une visionneuse web ou l''application mobile dédiée résout immédiatement le blocage.'),
('fba70140-52e2-49e5-84b2-c04afb906183', '7b2407c2-591d-4024-8c68-0c2f2a227f18', 'A', 'Ctrl + H', true, 'Ctrl + F ouvre la recherche simple, tandis que Ctrl + H ouvre directement la boîte ''Remplacer'' (essentiel pour corriger des lots de données erronées).')
on conflict (id) do update set
  question_id = excluded.question_id,
  lettre = excluded.lettre,
  texte = excluded.texte,
  is_correct = excluded.is_correct,
  dsi_explanation = excluded.dsi_explanation;

insert into tip.sf_quiz_options (id, question_id, lettre, texte, is_correct, dsi_explanation) values
('3e7fbed6-1d02-4fd4-bc02-3622c6d42312', '02e4a898-cc07-4880-bbd0-b6e20c9e496f', 'A', 'Ne jamais copier-coller de données réelles nominatives, bancaires, mots de passe ou informations confidentielles de l''entreprise dans le prompt', true, 'L''anonymisation stricte des données est une obligation légale (RGPD) et professionnelle pour tout intervenant informatique.'),
('3febd3e0-78ef-4261-b825-9015449d69b3', '7c245727-214e-40be-a049-d45401f01c28', 'A', 'L''Inspecteur de document (Fichier > Informations > Vérifier la présence de problèmes > Inspecter le document).', true, 'L''Inspecteur de document analyse et purge les métadonnées sensibles, révisions masquées, informations personnelles et propriétés du document.'),
('e83c8f6f-081c-431b-bf65-239c6fa73ff9', '7f12a8b7-974c-4922-b4e4-a7eeb383eef9', 'A', 'Copier-coller le texte 60 fois dans 60 fenêtres différentes', false, 'Cette option est incorrecte. Le publipostage automatise la génération en masse de documents individualisés à partir d''une source de données propre.'),
('ce3575c9-cca6-4666-b90e-46e131988b34', 'a8f0482a-0770-42ed-afa9-c0ef28d0b629', 'A', 'Isoler immédiatement l''ordinateur du réseau (débrancher le câble réseau RJ45 et désactiver le Wi-Fi) pour bloquer la propagation latérale d''un éventuel ransomware vers les serveurs de l''entreprise.', true, 'L''isolation réseau physique immédiate est la règle d''or en réponse à incident (ANSSI/CERT) : elle coupe la liaison avec le serveur de contrôle (C2) et empêche le chiffrement des partages réseau.'),
('30a46936-7ec2-4856-89bf-737bc653a041', '3b0cdd49-e668-4fdd-a03a-ae76975ce208', 'A', 'Faire une demande de restauration de sauvegarde auprès du support Google sous 48 heures.', false, 'L''historique des versions est autonome, instantané et directement accessible à l''utilisateur.'),
('9d2849af-272d-4256-ab01-d367595cb2c5', '554be693-5a31-4cbe-bfd8-1a653d26ebc1', 'A', 'Les titres comportent des caractères accentués incompatibles avec la table de caractères par défaut.', false, 'Word gère nativement l''Unicode et les caractères accentués français dans les tables des matières.'),
('b790e507-f377-400f-bf6a-2ff102f1ea1e', 'b5380b8d-b297-4793-a2cb-e6b6dc52a745', 'A', 'En appuyant sur la barre d''espace jusqu''à ce que le texte arrive à droite', false, 'Cette option est incorrecte. La barre d''espace varie selon la police (police proportionnelle). Seuls les tableaux masqués ou les taquets assurent un alignement strict.'),
('503b16a1-655e-4f6c-80a8-31d66916dcf9', '9ea599d5-5d52-401e-89ef-79b9c1b45832', 'A', 'Parce que le format DOCX ne peut pas être envoyé par courrier électronique', false, 'Cette option est incorrecte. Le PDF (Portable Document Format) garantit l''intégrité visuelle exacte et l''impossibilité de modifier le contenu par mégarde.'),
('114b15e6-f074-4e30-9367-0ded0f351f16', 'e9238216-4c02-4bae-8093-01a43432590f', 'A', '''Enregistrer'' sauvegarde sur le disque dur local, alors qu''''Enregistrer sous'' envoie obligatoirement le document sur un serveur Cloud', false, 'Cette option est incorrecte. ''Enregistrer sous'' est l''action clé pour créer une copie de sauvegarde avant intervention technique risquée.'),
('f90f39c2-fc25-475e-aaef-e9cc145e040d', '95139638-923b-4f06-8926-fe4e58e5e7eb', 'A', 'Créer un second document séparé en paysage et le fusionner dans Adobe Acrobat.', false, 'C''est un contournement artisanal qui brise la continuité de numérotation des pages et la table des matières.'),
('9b3814ad-5484-42cd-b778-a9c70040a7f0', 'c57d12a7-28db-44ce-b309-f7cb1139763f', 'A', 'Renommer l''extension du fichier en ''.jpg'' pour dissimuler la taille réelle du document au serveur.', false, 'Le serveur SMTP mesure le poids réel en octets du flux MIME et non l''extension de fichier déclarée.'),
('2cdb522f-c07e-4df3-a477-dc67f3c4fef7', 'cb370eb4-93f4-4dc4-b280-0164ef84b931', 'A', 'Comma-Separated Values (texte structuré par séparateurs) / Point-virgule (;) en environnement FR', true, 'Le CSV est un fichier texte tabulaire. En France, la virgule étant le séparateur décimal (ex: 12,50 €), Excel utilise le point-virgule (;) comme délimiteur de champs.'),
('ccaa306f-83b1-4b58-87c1-2d2089efed1e', 'af04ed4e-8658-4467-9c9b-871591bd6854', 'A', 'Le protocole DHCP (Dynamic Host Configuration Protocol) avec bail dynamique de 24 heures.', false, 'DHCP attribue des adresses IP locales et n''a aucune fonction cryptographique de signature de courriels.'),
('9d803e39-e11b-47f7-9e65-77910e05f41d', '20c58b74-3313-4c20-b5d2-971a30b7fce9', 'A', 'Supprimer manuellement le chiffre 1 sur la première page avec la touche Retour arrière.', false, 'Par défaut, les pieds de page sont liés : effacer le numéro sur la page 1 le supprime sur l''intégralité du document.'),
('6db9e028-ee4d-4d8d-aa35-c5299a7bda39', '2c9190ea-6bb9-4abd-998f-1744660be177', 'A', 'Cliquer sur le lien pour tester si la page Web demande un mot de passe ou un code à usage unique.', false, 'Cliquer expose la machine à des attaques par rebond (Drive-by) et risque de compromettre les identifiants de session.'),
('11bc6d69-131b-4b99-8ebb-7e04c46b3990', '3b85cee9-f9a0-46f5-9511-89865863577e', 'A', 'L''ordinateur de l''émetteur a oublié de renouveler son mot de passe de session Windows ce matin.', false, 'L''enregistrement SPF concerne les adresses IP des serveurs SMTP, sans lien avec les sessions Windows locales.'),
('418c15a6-b168-48c9-9fe5-2491f33c2806', 'e5ae9cb0-c790-4264-a6a9-c2fd4555d7e8', 'A', 'Activer l''option « Travailler hors connexion » dans Outlook, redémarrer l''application pour libérer le verrou sur le message lourd, supprimer le message de la Boîte d''envoi, puis réactiver le mode en ligne.', true, 'Le passage en mode hors connexion coupe immédiatement la tentative d''émission en cours et libère le fichier bloqué, autorisant sa suppression instantanée avant la reprise du trafic normal.'),
('e910f22a-d72e-47ed-91ae-da4025bb17d5', 'ef4cbaef-14ce-4090-ae69-2932a81ebd88', 'A', '{ MERGEFIELD DateEmbauche \# "FRENCH_DATE" }', false, 'Le commutateur \# est réservé aux formats numériques (monnaie, pourcentages), pas aux dates.'),
('4c57e579-4216-47bb-bcb2-24a6eb691955', '63eb29b6-4aeb-48ef-8f67-8928431d9e22', 'A', 'À rendre visibles les caractères non imprimables (espaces, tabulations, sauts de ligne, sauts de page) pour diagnostiquer les erreurs de mise en page', true, 'C''est l''outil d''investigation n°1 du technicien pour réparer un document déstructuré par un utilisateur.'),
('acd4f733-b95f-4814-b579-66588f941d91', 'a516d2fa-2c5e-42b8-94ad-90d4958c1bb9', 'A', 'L''exportation manuelle quotidienne de toute la boîte aux lettres au format tableur CSV.', false, 'Procédure fastidieuse, génératrice d''erreurs et incapable de fournir une vue interactive en temps réel.'),
('4f05852b-0c88-4dee-84f0-a70266e5f097', '128257a1-a632-42d5-877f-a171a4eb77ec', 'A', 'Le serveur de messagerie suspend l''exécution des automatisations durant les congés légaux.', false, 'Les serveurs informatiques appliquent les règles de tri 24h/24 et 7j/7, indépendamment des congés des salariés.'),
('1a1cd5a5-87cf-4436-b82b-92908ad5046f', '653850fa-f983-4488-ad95-a599236bdd6e', 'A', 'Convertir les cellules Excel au format Image avant d''exécuter la fusion.', false, 'Une image ne peut pas être injectée comme valeur textuelle ou numérique dans un champ de fusion.'),
('92cd7e47-a980-457a-ba8e-6da9a8b10896', '41d0cb01-054f-482a-a4f1-ddbfe6d21003', 'A', 'Sélectionner tous les e-mails de plus de 2 ans et appuyer sur Maj + Suppr pour les détruire définitivement.', false, 'Détruire des pièces contractuelles et des devis professionnels engage la responsabilité légale de l''entreprise.'),
('65d0002f-bca2-4dd2-ac4a-5a7694086364', '47c2777f-0a3a-4e9d-8cef-9a761aa112f9', 'A', 'La commande ''Rechercher et remplacer'' en remplaçant les points-virgules par des sauts de page.', false, 'Remplacer par des sauts de page créerait un document de 5000 pages blanches illisibles.'),
('132a5ab1-2bbb-4451-b0ea-8305ace08c2d', 'cd709961-55e2-44b1-ad80-ca89f5f4b4a5', 'A', '=A2 + 00000', false, 'En mathématique, additionner zéro ne modifie pas le nombre et ne restaure aucun formatage de texte.'),
('d2952e32-3ccc-4050-9711-4c7e81930268', '73e648de-f3ec-49dd-b64b-df40c0567f8d', 'A', 'Le champ macro { VLOOKUP CodePostal 971 }', false, 'VLOOKUP est une fonction tableur Excel, inexistante comme champ Word natif.'),
('cccd24a0-6f70-4d06-bb94-5820305d6139', '9ad4b801-3de9-4277-9b26-158c46b9992d', 'A', 'v=DMARC1; p=none; sp=none; (politique d''observation passive sans aucun blocage actif).', false, 'La politique p=none se contente de générer des rapports statistiques sans filtrer ni rejeter les courriels frauduleux.'),
('af7b351a-b49d-456d-bc69-9cd6b9fd8221', 'fa4451ee-f0c9-4ba5-92d6-7531ddcc8db5', 'A', 'Redémarrer le serveur DNS de la Guadeloupe et vider le cache du navigateur Chrome.', false, 'L''actualisation d''un classeur Excel local n''a strictement aucun rapport avec les serveurs DNS ou le cache web.'),
('cdd966a4-cd0a-4f83-97a5-5f9f834ba8f4', '09c552c2-5ac0-42e1-b6c7-decab123963a', 'A', 'Les TCD ne peuvent afficher que des sommes en euros et jamais de pourcentages.', false, 'Les TCD disposent d''un arsenal complet d''analyses statistiques et de pourcentages relatifs.'),
('bfd9110a-f1fd-4db8-915e-2adfbf9be812', '06dae0e2-4624-4f7c-8a7f-2a0a882caddd', 'A', 'La dénomination sociale de l''entreprise, sa forme juridique (SAS, SARL, SA), son numéro d''immatriculation (SIREN/RCS), la ville du greffe et la mention de confidentialité RGPD.', true, 'L''article R. 123-237 du Code de commerce rend obligatoire la mention des informations légales d''identification d''entreprise sur l''ensemble de ses correspondances électroniques professionnelles.'),
('d99b0121-4dd5-445d-80fb-7f37e0375192', 'cb370eb4-93f4-4dc4-b280-0164ef84b931', 'B', 'Command Script Variable (fichier exécutable de commande) / Virgule (,)', false, 'Cette option est incorrecte. Le CSV est un fichier texte tabulaire. En France, la virgule étant le séparateur décimal (ex: 12,50 €), Excel utilise le point-virgule (;) comme délimiteur de champs.'),
('7630c2d2-7f29-4217-bb92-098ecab39eaa', '7b2407c2-591d-4024-8c68-0c2f2a227f18', 'B', 'Ctrl + S', false, 'Cette option est incorrecte. Ctrl + F ouvre la recherche simple, tandis que Ctrl + H ouvre directement la boîte ''Remplacer'' (essentiel pour corriger des lots de données erronées).'),
('9d01929e-50c0-4545-bcb4-4079b8d1d74d', 'ecb7b2e8-e8ec-4747-a179-a15fd351a669', 'B', 'Appuyer sur la touche ''Impr Écran'', ouvrir Paint, coller et rogner', false, 'Cette option est incorrecte. Windows + Shift + S lance l''outil capture rectangulaire immédiate qui place l''image directement dans le presse-papiers.'),
('96931b89-ac42-4ed1-88c0-95719add4d10', 'e9238216-4c02-4bae-8093-01a43432590f', 'B', '''Enregistrer sous'' permet de dupliquer le fichier sous un nouveau nom, un nouvel emplacement ou un autre format (.pdf, .csv), sans modifier l''original', true, '''Enregistrer sous'' est l''action clé pour créer une copie de sauvegarde avant intervention technique risquée.'),
('2f011087-a9c9-4fa7-bc36-8ca83097b8a7', '01e51db6-ecee-4ffc-802d-21bb3cf28046', 'B', '2026-09-09_KLF_Audit-Parc-Jarry_v1.0_DJ.xlsx', true, 'Le format ISO AAAA-MM-JJ avec préfixe d''entreprise, objet clair, versioning et initiales garantit un tri chronologique et une traçabilité parfaite.'),
('30d01a31-e129-4bda-a87c-f67288ff3789', 'ca02acd1-f48d-4830-afa2-fcafe431babc', 'B', 'Parce que cela sature la mémoire vive (RAM) de l''ordinateur', false, 'Cette option est incorrecte. Le saut de paragraphe multiple est un réflexe amateur destructeur pour la pagination. Le saut de page (Ctrl + Entrée) isole définitivement les sections.'),
('344b74c4-0898-4df2-9f12-833747fd1aff', '95a4d994-b243-45a4-902e-b7d5c91b1669', 'B', 'Structurer le document de façon sémantique, permettre la génération dynamique du sommaire automatique et le volet de navigation', true, 'Les styles permettent la table des matières automatique, le plan hiérarchique et la modification globale du design en un clic.'),
('4c85a540-36b0-4e05-a1c9-b404c256f804', 'b5380b8d-b297-4793-a2cb-e6b6dc52a745', 'B', 'En insérant un tableau à 2 colonnes sans bordures (ou en utilisant un taquet de tabulation droit)', true, 'La barre d''espace varie selon la police (police proportionnelle). Seuls les tableaux masqués ou les taquets assurent un alignement strict.'),
('11c8bb32-c934-4008-a85d-9577fe324475', '63eb29b6-4aeb-48ef-8f67-8928431d9e22', 'B', 'À afficher la liste de tous les périphériques connectés', false, 'Cette option est incorrecte. C''est l''outil d''investigation n°1 du technicien pour réparer un document déstructuré par un utilisateur.'),
('89f8c009-18e4-42f0-83e1-19b15a1e24e1', '9ea599d5-5d52-401e-89ef-79b9c1b45832', 'B', 'Pour figer la mise en page quel que soit l''ordinateur ou le système du destinataire et empêcher toute modification involontaire', true, 'Le PDF (Portable Document Format) garantit l''intégrité visuelle exacte et l''impossibilité de modifier le contenu par mégarde.'),
('7d982cb6-9bc1-4c4c-a4b5-b2a8fe3404ba', 'dae0b1bf-4b6a-4f79-a571-941a08e27985', 'B', 'Par le caractère dièse (#)', false, 'Cette option est incorrecte. Le signe ''='' indique au moteur de calcul qu''il ne s''agit pas de texte brut mais d''une expression à interpréter.'),
('24718182-f8e0-4970-8f94-0e0ff7e9fe91', '39b8f5ff-2a34-4a6a-80bd-1787fee242b0', 'B', '=B2+B20', false, 'Cette option est incorrecte. Le séparateur '':'' définit une plage continue, alors que ''+'' entre deux cellules n''additionne que ces deux valeurs isolées.'),
('107d996a-5624-43de-9c11-7156ca1ab412', 'f4395f9e-ebd0-48f5-a126-0dbc2ff1d5c9', 'B', 'Une référence absolue : la cellule C2 reste verrouillée et ne se décale pas lorsqu''on étire la formule vers le bas', true, 'Les $ figent les coordonnées (ligne et colonne) lors de l''incrémentation (touche F4 pour basculer rapidement).'),
('faaffbc2-7b02-4e98-9dd4-c78e0bc7b994', '1d937f5a-bc18-45e3-aaaa-6156b6beb46b', 'B', 'Le disque dur de la machine est saturé et ne peut plus calculer', false, 'Cette option est incorrecte. La division par zéro est mathématiquement indéfinie. On la corrige en intégrant une condition ou la fonction SIERREUR().'),
('a3c7913c-4e75-4cac-b904-14f9b9428cde', '65e2c3d0-b1d0-4e8e-a8b0-03b4a6322162', 'B', 'Augmenter la luminosité de l''écran', false, 'Cette option est incorrecte. L''option ''Figer les lignes'' conserve les intitulés visibles lors du défilement, indispensable pour tout tableau de données.'),
('0357075c-58d4-4759-b459-1bdfda0ecdc8', 'a6a4be49-e939-4236-bc47-9bbc3a57dce7', 'B', 'Réaliser une copie de sauvegarde (Backup) du fichier avant toute manipulation, puis questionner calmement l''usager sur l''anomalie constatée', true, 'Règle absolue du technicien : sauvegarder l''état existant avant intervention pour éviter toute perte irrémédiable de données.'),
('b990f11d-b0f6-404f-8f1b-052df10a3037', 'fc4ebbd3-d5ba-4571-bcd7-7b99a0705ac1', 'B', 'C''est impossible, tout texte supprimé sur un Cloud est définitivement perdu', false, 'Cette option est incorrecte. Le versioning automatique des suites collaboratives permet de remonter dans le temps et de comparer les modifications horodatées.'),
('fb095268-4785-4404-b9eb-c7a9d55d2b56', '0bc1d6d6-6f22-4a0e-b710-6b47a8363c70', 'B', 'Renommer simplement l''extension du fichier en ''.mp3''', false, 'Cette option est incorrecte. L''extension détermine l''application associée. En mobilité, une visionneuse web ou l''application mobile dédiée résout immédiatement le blocage.'),
('ebb728c7-c5e8-45a1-bdc3-7d63916992ba', '7f12a8b7-974c-4922-b4e4-a7eeb383eef9', 'B', 'Utiliser le Publipostage (ou fusion et publipostage) en reliant un modèle Word/Docs à une liste de destinataires Excel/Sheets', true, 'Le publipostage automatise la génération en masse de documents individualisés à partir d''une source de données propre.'),
('1def3a0d-fe0b-4ec7-9fdf-7ea60bad8702', '554be693-5a31-4cbe-bfd8-1a653d26ebc1', 'B', 'Le document n''a pas été préalablement enregistré au format PDF/A dans les options de sécurité.', false, 'Le format PDF/A est une norme d''archivage pérenne, il n''a aucun impact sur la génération de la table des matières dans Word ou Docs.')
on conflict (id) do update set
  question_id = excluded.question_id,
  lettre = excluded.lettre,
  texte = excluded.texte,
  is_correct = excluded.is_correct,
  dsi_explanation = excluded.dsi_explanation;

insert into tip.sf_quiz_options (id, question_id, lettre, texte, is_correct, dsi_explanation) values
('b187bc71-1a4e-4c57-8a67-a72739ee3fda', '95139638-923b-4f06-8926-fe4e58e5e7eb', 'B', 'Sélectionner le tableau et activer l''option ''Rotation à 90° du texte'' dans les propriétés du tableau.', false, 'Pivoter le texte ne change pas l''orientation de la page et rend la lecture et la saisie très inconfortables pour l''utilisateur.'),
('2fe2a6a0-75df-4771-b669-dceb1a81602a', '20c58b74-3313-4c20-b5d2-971a30b7fce9', 'B', 'Dessiner un rectangle blanc opaque par-dessus l''en-tête de la première page pour masquer le numéro.', false, 'Méthode ''bricolage'' formellement proscrite par la DSI : le masque se décale à la moindre modification du texte.'),
('526c93ef-9f92-4b6f-aac2-e1085ea07bd9', 'ef4cbaef-14ce-4090-ae69-2932a81ebd88', 'B', 'Il faut réinstaller le pack linguistique français de Windows sur le poste de travail.', false, 'Word communique avec Excel via OLE DB qui transmet les données brutes non formatées ; le commutateur de champ est le seul moyen robuste de formater.'),
('50f56149-3813-4c37-bc14-0037db9c0fc1', '653850fa-f983-4488-ad95-a599236bdd6e', 'B', '{ MERGEFIELD Prime \@ "EURO_CURRENCY" }', false, '\@ est dédié aux dates, \# aux nombres.'),
('8b8b02e2-d909-4f99-a16a-cc45a59b4359', '73e648de-f3ec-49dd-b64b-df40c0567f8d', 'B', 'Le champ conditionnel { IF { MERGEFIELD CodePostal } = "971*" "Texte Octroi de mer" "" }', true, 'Le champ Word IF (Si... Alors... Sinon) permet d''insérer dynamiquement des blocs textuels conditionnés par la valeur d''une variable de fusion.'),
('db1c2d77-d615-47c3-8066-abb53110a093', '3b0cdd49-e668-4fdd-a03a-ae76975ce208', 'B', 'Appuyer frénétiquement sur Ctrl+Z jusqu''à retrouver le paragraphe.', false, 'Ctrl+Z annule uniquement vos propres actions locales de la session active et écraserait vos modifications récentes.'),
('6898bfff-2359-4a8f-a94e-4de090aa40e7', '3d2addae-0057-4d4e-9f8d-8ba85b954d01', 'B', 'Activer le ''Suivi des modifications'' et cliquer sur ''Verrouiller le suivi'' avec un mot de passe.', true, 'Le verrouillage du suivi empêche quiconque de désactiver le mode révision ou d''accepter/rejeter les modifications sans le mot de passe.'),
('643f8c13-8aa3-4e8f-8b41-1252589ab6eb', '8acfdf6e-52b4-478e-be3c-b78319caed36', 'B', 'L''outil ''Publipostage de fichiers'' de l''onglet Envois.', false, 'Le publipostage sert à injecter des données d''un tableau dans une matrice, pas à comparer deux textes.'),
('de9224a5-0b9e-4da3-8966-44848178882a', 'f5e773a8-496b-4432-a705-97fd0592cad0', 'B', 'En page web filtrée (.htm).', false, 'Le format HTML altère les marges et la structure d''impression Word professionnelle.'),
('72e6b5a5-054a-4a7f-935d-c1a32bf1f608', '3e6e1699-ebb2-4f65-ab1e-d2fd1baabb19', 'B', 'Sélectionner la ligne d''en-tête et cocher ''Répéter les lignes d''en-tête'' dans les Outils de tableau (Disposition).', true, 'Cette fonction native répercute automatiquement l''en-tête en haut de chaque nouvelle page, de manière 100% dynamique.'),
('84c9ead8-2bc6-4f11-8259-e51844a65cdc', '154ffa33-c1e1-4ce6-af8f-0b9f8645d887', 'B', 'Habillage ''Derrière le texte'' (Behind Text).', false, 'L''image sert de fond mais devient très difficile à resélectionner et rend le texte peu lisible.'),
('df34365f-ae2f-4b7a-bdc8-104b553ab12c', 'c8f054bf-2937-453d-8aa9-a199072f7a26', 'B', 'Renseigner un ''Texte de remplacement'' (Alt Text) descriptif et explicite dans les propriétés de l''image.', true, 'L''Alt Text est lu par les lecteurs d''écran (synthèse vocale) pour restituer l''information aux personnes en situation de handicap visuel.'),
('fa5d58a6-d153-4685-b782-40cbf8ef8bce', '3639f009-1a83-431d-9c4e-cea44dc326c3', 'B', 'Renommer l''extension en .zip, décompresser l''archive et extraire le texte brut contenu dans le fichier interne ''word/document.xml''.', true, 'Un fichier .docx est un conteneur ZIP d''arborescences XML. Même si le style est corrompu, le texte brut reste intact dans ''word/document.xml''.'),
('bd913120-4eab-40f5-a2f3-cc94746b6a25', '7c245727-214e-40be-a049-d45401f01c28', 'B', 'L''enregistrement sous un nom de fichier contenant la mention ''[ANONYME]''.', false, 'Changer le nom du fichier ne nettoie en rien les métadonnées internes du conteneur XML.'),
('8221c504-89e2-4b08-a55c-3b48392afd7f', 'a9335e44-5a5b-45ee-85ec-f898cd1d54dc', 'B', '''Maj + Entrée'' active automatiquement le verrouillage des majuscules.', false, 'Le verrouillage des majuscules se fait par la touche Verr.Maj (Caps Lock).'),
('70c56efb-1812-43f7-aa34-d2086d8a3ec9', '554847a5-fd9d-4578-8c7b-c4e92c6edd50', 'B', 'Utiliser les ''Contrôles de contenu'' (onglet Développeur) puis activer ''Restreindre la modification'' avec l''option ''Remplissage de formulaires''.', true, 'La restriction ''Remplissage de formulaires'' verrouille 100% de la structure du document et ne laisse que les contrôles de contenu accessibles à la saisie.'),
('5ee560e9-1589-4aa1-9c23-98ae35f24e99', '1241a495-d522-4ac1-b3ba-82e21dc2a52e', 'B', 'Un fichier texte posé sur le bureau que chaque technicien doit copier-coller.', false, 'C''est une perte de temps productive, source d''erreurs et de dérives de charte.'),
('95afc2af-1aef-4d8d-ac0e-30311adbf5eb', '6c732df0-73f5-4f81-b016-7965a5bb2f30', 'B', 'Elle divise la taille du fichier PDF par 10 en compressant les images en format GIF.', false, 'Le PDF/A n''est pas un algorithme de surcompression mais une norme de pérennité.'),
('faaf046f-c370-4f17-a8fd-c63a18e364bd', '12e69e9d-0e80-4239-a410-06dcca4ca7b7', 'B', 'Alt + F4 suivi de la touche Entrée.', false, 'Alt+F4 fermerait l''application Word sans enregistrer !'),
('50a8b88f-3325-45a8-b1ce-cc44a4800834', '5488e563-56fd-40c2-8285-9dac4f1e9329', 'B', '=D$5*B2', false, 'D$5 bloquerait la ligne 5 de la valeur douane, produisant un calcul erroné pour les autres marchandises.'),
('2d007fca-77a3-4027-9499-3e9a1effd63a', '40d5758d-a2c8-4834-a8b9-1c8615404c2c', 'B', '=B3*C2', false, 'Un adressage 100% relatif dérive immédiatement sur les cellules adjacentes et multiplie des cellules vides ou textuelles.'),
('a279f128-ee4c-4461-b898-ea04f1b6efd7', '38232967-b80d-41b7-bdd6-70dfb282e700', 'B', 'RECHERCHEX arrondit automatiquement tous les montants à l''entier supérieur.', false, 'RECHERCHEX est une fonction de recherche et renvoi, sans altération des valeurs trouvées.'),
('e70caf32-2e0d-4276-a203-87dc6f8fc466', 'b2dab8c3-aa5a-4b40-8f02-9aedd47ef2f8', 'B', '=RECHERCHEV(D2; A:B; -1; FAUX)', false, 'L''indice de colonne dans RECHERCHEV doit obligatoirement être un entier strictement positif (>= 1). Un indice négatif renvoie l''erreur #VALEUR!.'),
('b510ee08-0bb1-4024-a302-15d5d2553c02', '02f5bbea-0ef7-4530-ab12-a83e7171f72c', 'B', 'Excel renvoie automatiquement 0,00 € sans faire de calcul.', false, 'La recherche approximative renvoie la valeur immédiatement inférieure si la plage est triée, ou une valeur imprévisible.'),
('d7ad9944-60a2-4f33-a0b7-15be1861f093', 'f3656438-85b1-4161-beb6-80b3e19b9c13', 'B', '=INDEX(MatriceTarifs; EQUIV(A10; PlageConteneurs; 0); EQUIV(B10; PlageDestinations; 0))', true, 'La fonction INDEX prend en argument la matrice globale, la position de la ligne calculée par le premier EQUIV, et la position de la colonne calculée par le second EQUIV.'),
('1f987e70-7007-4527-9866-0b42236568f3', '5ca40835-8059-4004-9b66-ff668656c029', 'B', '=SI(ET(B2="OUI"; C2="OUI"); "P1"; SI(D2="OUI"; "P2"; "P3"))', true, 'La condition composée ET() vérifie les deux critères cumulatifs pour P1, puis la branche FAUX évalue la seconde condition SI() pour P2, avec P3 comme valeur de repli.'),
('dc7ac82e-e112-4b44-b72e-43ba3099ea23', '4dcfd3f8-d8cc-464e-bbdb-ce0c4c09659a', 'B', '=SOMME.SI(B:B; "Jarry"; D:D; C:C; "CMA-CGM")', false, 'La fonction SOMME.SI classique n''accepte qu''un seul critère et génère une erreur avec des arguments multiples.'),
('cc82f471-2ab5-4a04-8ec0-5c04065166f1', '6392644e-83d2-441d-8501-bde70cb3793b', 'B', '=NB.SI(B:C; "PC Portable < 2022")', false, 'NB.SI ne permet pas de fusionner deux critères distincts dans une seule chaîne textuelle.'),
('3f404536-d260-4adc-9c45-8baff5aa7485', 'cc94f0f2-e78a-4de3-af3b-5a4849da901c', 'B', '=EFFACER.ERREUR(formule)', false, 'Cette fonction n''existe pas dans les tableurs standards.'),
('fd361ff0-d208-414a-a4eb-6c7129c91963', 'dd7e8d74-7769-4553-b141-e822974dfdab', 'B', 'Il faut redémarrer la box Internet de l''agence de Jarry.', false, 'Le calcul de recherche se fait en mémoire RAM locale sans dépendre du routeur FAI.'),
('b4e8ffaa-4a21-4d0b-a544-303142bc0b6a', 'a471f2ef-dde3-4367-9c9a-2895521b8f15', 'B', 'La mémoire vive du PC est saturée, il faut ajouter une barrette de RAM de 16 Go.', false, 'L''erreur est purement logicielle et liée à l''intégrité du graphe de dépendance des formules.'),
('001ee887-2afc-4823-ba82-dc19ea1339db', '55d13874-c90f-4f90-a09b-25754e4f1146', 'B', 'Les formules se propagent automatiquement à toute la colonne, les nouvelles lignes ajoutées sont instantanément intégrées dans les calculs et les TCD, et les formules utilisent des noms explicites ([@Poids]*[@Taux]).', true, 'Les tableaux structurés professionnalisent la gestion de données : fini les plages fixes (A2:A100) qui oublient les nouvelles lignes, et les références structurées rendent les formules auditables.'),
('b9587565-26dc-4714-abd1-fe6cd0f36235', '4cc8522c-1ec0-4bf0-a052-a008d57102c0', 'B', 'Sélectionner la colonne, ouvrir ''Données > Validation des données'', autoriser ''Liste'', et saisir la liste autorisée ou pointer vers une plage de référence.', true, 'La validation des données par liste déroulante verrouille la saisie utilisateur et garantit la conformité stricte des données pour les extractions futures.'),
('8082f543-3a79-4a00-bbc7-f1592bb19efc', '8d1a43e5-6e09-4146-bfd9-947c710f3946', 'B', '=A2 <> A1', false, 'Cette formule compare uniquement la cellule avec celle située juste au-dessus, ignorant les doublons situés ailleurs dans la colonne.'),
('0bb92e49-ecfa-4356-9c2c-6e40e8a3f65a', '09c552c2-5ac0-42e1-b6c7-decab123963a', 'B', 'Créer un graphique circulaire sur un bloc-notes et colorier les parts au feutre.', false, 'Pratique évidemment non professionnelle.'),
('5c7ae845-7ea6-43d7-bc8c-a2541ac53b53', 'fa4451ee-f0c9-4ba5-92d6-7531ddcc8db5', 'B', 'Vérifier que la ''Source de données'' englobe bien les nouvelles lignes (ou s''appuie sur un Tableau structuré dynamique), puis faire un clic droit sur le TCD et cliquer sur ''Actualiser''.', true, 'Un TCD ne recalcule pas en temps réel pour préserver les performances : il doit être actualisé. De plus, si la plage source était fixée à la ligne 100, les lignes 101 à 140 restent hors du périmètre tant que la source n''est pas ajustée.'),
('fb65ee97-2176-4791-b254-115cfa8d1f7e', 'cd709961-55e2-44b1-ad80-ca89f5f4b4a5', 'B', '=ZERO(A2; 5)', false, 'La fonction ZERO n''existe pas dans la syntaxe des tableurs.'),
('aac3b729-6b6f-4931-9075-baed0157a3ac', '128257a1-a632-42d5-877f-a171a4eb77ec', 'B', 'Le pare-feu réseau de l''entreprise bloque les flux de messagerie le week-end et la nuit.', false, 'Le trafic réseau de messagerie d''entreprise est permanent et ininterrompu.'),
('ed797a58-be2a-4e75-81a0-f52c66ef6616', 'a516d2fa-2c5e-42b8-94ad-90d4958c1bb9', 'B', 'La création d''un « Dossier de recherche » personnalisé (Search Folder), qui génère une vue filtrée dynamique en temps réel sans duplication physique des messages.', true, 'Les dossiers de recherche sont des requêtes virtuelles dynamiques : ils affichent instantanément les messages correspondant aux critères sans modifier leur emplacement réel.'),
('9f322703-94f3-4ebd-8cd2-e6039927f215', 'e5ae9cb0-c790-4264-a6a9-c2fd4555d7e8', 'B', 'Désinstaller la suite bureautique et reformater entièrement le système d''exploitation du poste.', false, 'Réinstallation disproportionnée et inutile pour un simple message coincé dans une file d''attente locale.'),
('36a84fd6-50cb-43b1-bf58-aab23647806a', '3b85cee9-f9a0-46f5-9511-89865863577e', 'B', 'Le serveur de la banque réceptrice est saturé et refuse temporairement les transactions financières.', false, 'L''en-tête SPF authentifie le serveur d''émission du courriel, indépendamment de toute plateforme bancaire.'),
('5ccde291-b35b-495c-ab66-a0ac1e0f49fa', 'af04ed4e-8658-4467-9c9b-871591bd6854', 'B', 'Le standard DKIM (DomainKeys Identified Mail), qui insère une signature numérique dans l''en-tête du message vérifiable via la clé publique publiée sur le DNS de l''émetteur.', true, 'DKIM scelle cryptographiquement les en-têtes et le corps du message avec la clé privée du serveur d''envoi. Le destinataire vérifie la signature grâce à la clé publique DNS, garantissant l''intégrité du courriel.'),
('81332c60-813d-4e37-918f-607fa2b05fbd', '02e4a898-cc07-4880-bbd0-b6e20c9e496f', 'B', 'Les techniciens ont le droit d''envoyer toute la base de données client si cela permet de résoudre le ticket plus vite', false, 'Cette option est incorrecte. L''anonymisation stricte des données est une obligation légale (RGPD) et professionnelle pour tout intervenant informatique.'),
('6fc80392-35d0-4936-aaca-6e3e2120e9b1', '5cc9a161-ae21-4aa8-9ef0-ffc0542ec097', 'B', '=A2*(0,085 + 0,085)', false, 'Cette formule calcule uniquement le montant cumulé des taxes (sans le prix de base marchandise).'),
('4f0e1fdf-e503-4d49-9755-0a77414a1cb6', '47c2777f-0a3a-4e9d-8cef-9a761aa112f9', 'B', 'L''outil ''Convertir'' (onglet Données > Outils de données > Délimité > cocher ''Point-virgule'').', true, 'L''assistant ''Convertir'' (Texte en colonnes) permet de fractionner des flux textuels selon le délimiteur spécifique (point-virgule sous Windows FR, virgule dans le monde anglo-saxon).'),
('ef0f2111-1ea5-4c32-b41c-289d28791f2a', 'd103f964-25fd-4b73-8adb-02f007f716d7', 'B', 'L''antivirus du poste fixe bloque les requêtes de notifications push provenant du serveur de messagerie.', false, 'Les antivirus inspectent les fichiers et les flux de données, sans altérer la logique de relève des dossiers de messagerie.'),
('e57a59b8-e1cd-40a7-9be2-4aa297374414', '8ac64ffd-9209-4665-a1c1-8634e4e0cf97', 'B', 'Le fichier .ost contient l''unique exemplaire physique des messages, qui est définitivement perdu sans sauvegarde sur bande magnétique.', false, 'C''est la caractéristique des archives locales indépendantes (.pst), et non du fichier cache synchronisé .ost.'),
('2e100fcc-cd3a-435d-b7f6-46fb986ee8a9', '146a7e86-4e4c-4767-9546-ce70867a39b3', 'B', 'Le port 443 (HTTPS) a été révoqué par le gestionnaire de réseau local de l''opérateur.', false, 'Le port 443 est ouvert sur toutes les box Internet pour sécuriser les sites Web bancaires et commerciaux.'),
('4838976b-7ae6-4690-aec4-83fcad01cbd0', '8d63b860-0d15-4c66-ab0d-c5daf4806e5e', 'B', 'À 16h00 heure de Paris, car le serveur de messagerie stocke l''horodatage en temps universel (UTC) et effectue automatiquement la conversion (+6 heures de décalage en période estivale).', true, '10h00 UTC-4 équivaut à 14h00 UTC. Le correspondant parisien situé en UTC+2 voit donc la réunion positionnée à 16h00 sans aucune manipulation manuelle.'),
('52edc884-b7a6-4956-a776-8c726efde35e', 'dc907012-d13e-4d99-8cae-3eafd4a93593', 'B', 'Coller une note manuscrite sur la porte vitrée de la salle de réunion le matin de la séance.', false, 'Procédé artisanal qui ne résout aucun conflit de réservation dans les agendas numériques partagés.')
on conflict (id) do update set
  question_id = excluded.question_id,
  lettre = excluded.lettre,
  texte = excluded.texte,
  is_correct = excluded.is_correct,
  dsi_explanation = excluded.dsi_explanation;

insert into tip.sf_quiz_options (id, question_id, lettre, texte, is_correct, dsi_explanation) values
('f56c621b-2fee-40aa-af85-88a1bc0dfe29', '084610a9-bea0-443e-807b-358a08204bea', 'B', 'Le rôle de « Relecteur » en lecture seule sans aucune option d''écriture ou de modification.', false, 'Le relecteur peut uniquement visualiser les créneaux, sans pouvoir créer ou valider un rendez-vous.'),
('ad30d3fc-1712-425c-925a-4758420f89d1', '9ad4b801-3de9-4277-9b26-158c46b9992d', 'B', 'v=DMARC1; p=audit-only; mode=permissive; (directive d''autorisation universelle des flux).', false, 'Syntaxe non standard et inefficace pour contrer les attaques par usurpation de nom de domaine.'),
('9faddd7f-a6b8-4961-a357-c4029c4864bc', '2c9190ea-6bb9-4abd-998f-1744660be177', 'B', 'Transférer immédiatement le message à l''ensemble de ses collègues de service pour leur demander conseil.', false, 'Transférer un courriel d''hameçonnage multiplie les risques d''infection accidentelle au sein du réseau d''entreprise.'),
('cdc17810-6895-468e-8943-613db76456e3', 'a8f0482a-0770-42ed-afa9-c0ef28d0b629', 'B', 'Éteindre l''écran de l''ordinateur et attendre la fin de la journée pour voir si le problème disparaît.', false, 'Laisser une machine compromise connectée au réseau donne le champ libre au malware pour infecter toute l''infrastructure.'),
('eb2dff3e-7fba-4fb6-a265-3195172f8d9e', 'c5c253cf-7c76-470e-9d93-4eec5f7437f7', 'B', 'Insérer les adresses des partenaires dans le champ ''Cc'' (Copie carbone visible) pour encourager les échanges collectifs.', false, 'C''est l''erreur la plus fréquente en entreprise : chaque destinataire voit la liste des clients concurrents, violant la confidentialité commerciale et le RGPD.'),
('d4962d56-faf5-4f0c-8474-c6e30c9e51d6', 'e3783350-2967-4261-925a-dcb1af4cd86b', 'B', 'Le groupe de distribution possède une adresse e-mail d''entreprise unique gérée de façon centralisée par la DSI, visible dans le carnet d''adresses global (GAL) et accessible à tous les salariés habilités.', true, 'Les groupes de distribution Exchange sont centralisés : ils garantissent la mise à jour des membres lors des mouvements de personnel, évitant les listes locales obsolètes.'),
('601653b7-094d-4774-a461-3619e3c1d4f3', '06dae0e2-4624-4f7c-8a7f-2a0a882caddd', 'B', 'Le mot de passe de la boîte aux lettres pour certifier auprès des clients l''authenticité de l''expéditeur.', false, 'Faute de sécurité critique : un mot de passe ne doit jamais être divulgué ni intégré dans une signature publique.'),
('900ead2a-c1ac-4790-8dfb-357678e2bcee', 'c57d12a7-28db-44ce-b309-f7cb1139763f', 'B', 'Découper le fichier en 40 disquettes informatiques de 1,44 Mo et les expédier par coursier terrestre.', false, 'Méthode obsolète et totalement inopérante dans un contexte logistique portuaire en temps réel.'),
('aed55909-be0b-4366-aa71-4451b3bf4bc0', '3c381312-a57f-4ca0-8f66-22020040c983', 'B', 'L''autorisation ''De la part de'' exige obligatoirement de souscrire une licence utilisateur payante supplémentaire.', false, 'Les boîtes partagées (Shared Mailboxes) sont gratuites sous Microsoft 365 jusqu''à 50 Go de stockage.'),
('697064c8-8f22-44fd-a7d6-4b547eef1be2', '41d0cb01-054f-482a-a4f1-ddbfe6d21003', 'B', 'Activer la ''Boîte aux lettres d''archivage en ligne'' (Online Archive Exchange) et appliquer une stratégie de rétention déplaçant automatiquement les éléments de plus de 1 an vers l''archive cloud sécurisée.', true, 'L''archivage en ligne M365 fournit un espace de stockage cloud complémentaire transparent pour l''utilisateur, éliminant les risques de corruption ou de perte associés aux fichiers .pst locaux non sauvegardés.'),
('496f1c49-c3e4-445d-9717-57fef7a9d349', '65e2c3d0-b1d0-4e8e-a8b0-03b4a6322162', 'C', 'Verrouiller le classeur avec un mot de passe administrateur', false, 'Cette option est incorrecte. L''option ''Figer les lignes'' conserve les intitulés visibles lors du défilement, indispensable pour tout tableau de données.'),
('b6b0a0d6-e1f5-4b4e-b5d3-b01f610eaa45', 'cb370eb4-93f4-4dc4-b280-0164ef84b931', 'C', 'Compressed System Vector (format d''archive compressée) / Espace', false, 'Cette option est incorrecte. Le CSV est un fichier texte tabulaire. En France, la virgule étant le séparateur décimal (ex: 12,50 €), Excel utilise le point-virgule (;) comme délimiteur de champs.'),
('a3d06b84-f979-4a4c-b1b0-382914ba6316', 'd103f964-25fd-4b73-8adb-02f007f716d7', 'C', 'Le compte est configuré avec le protocole historique POP3 (unidirectionnel sans répercussion des états de lecture ni des dossiers) au lieu d''IMAP ou Exchange (synchronisation bidirectionnelle permanente).', true, 'POP3 télécharge les courriers localement sans synchroniser les statuts (lu/non lu, dossiers, suppressions) entre les multiples terminaux d''un même utilisateur.'),
('7241fecf-3019-4602-a83b-141dcf7f2691', '2c9190ea-6bb9-4abd-998f-1744660be177', 'C', 'Survoler le bouton avec le curseur de la souris (Hover) sans cliquer pour observer l''URL réelle de destination affichée dans la barre d''état et vérifier l''authenticité du nom de domaine.', true, 'Le survol d''un lien révèle la véritable cible hypertexte masquée derrière le texte d''ancrage, permettant de détecter immédiatement un domaine frauduleux (ex: login-m365-verify.xyz).'),
('51676054-77a9-44f4-b583-0f357659b624', '1d937f5a-bc18-45e3-aaaa-6156b6beb46b', 'C', 'La colonne est simplement trop étroite pour afficher les chiffres (il faut élargir la colonne)', false, 'Cette option est incorrecte. La division par zéro est mathématiquement indéfinie. On la corrige en intégrant une condition ou la fonction SIERREUR().'),
('58821cca-888d-4596-9843-220f02da8324', '06dae0e2-4624-4f7c-8a7f-2a0a882caddd', 'C', 'L''adresse IP privée du poste de travail et les identifiants de connexion Wi-Fi de l''agence.', false, 'Les informations de réseau local relèvent de la confidentialité interne et n''ont aucune place dans une correspondance commerciale.'),
('64e348c2-45b3-4cbd-9a8a-e05611ff02d9', '8ac64ffd-9209-4665-a1c1-8634e4e0cf97', 'C', 'Le fichier .ost est une base de données propriétaire chiffrée qui ne peut être décryptée que par le fabricant du disque dur.', false, 'Le fichier .ost est recréé automatiquement par Outlook dès que l''utilisateur s''authentifie sur un nouveau terminal.'),
('0c8b900d-1a7e-4019-830d-7b213a9e35b6', 'fa4451ee-f0c9-4ba5-92d6-7531ddcc8db5', 'C', 'Enregistrer le classeur sous format Word puis le réimporter.', false, 'Word ne gère pas les moteurs de calcul croisé dynamique.'),
('d1e8100e-72f0-4409-bb32-ea20a651783e', 'f4395f9e-ebd0-48f5-a126-0dbc2ff1d5c9', 'C', 'Une formule de sécurité qui crypte la cellule contre le piratage', false, 'Cette option est incorrecte. Les $ figent les coordonnées (ligne et colonne) lors de l''incrémentation (touche F4 pour basculer rapidement).'),
('34f82427-b40a-4159-9100-dfa380aa8789', 'a471f2ef-dde3-4367-9c9a-2895521b8f15', 'C', 'Une formule faisait explicitement référence à une cellule de la colonne supprimée. La coordonnée n''existant plus en mémoire, Excel la remplace par #REF!. Il faut annuler immédiatement (Ctrl+Z) et masquer la colonne plutôt que la supprimer.', true, 'La suppression physique d''une plage source détruit le pointeur mémoire des formules dépendantes. Masquer la colonne ou remplacer ses formules par des valeurs figées est la bonne pratique.'),
('3bb7864f-5036-4351-8dc6-443e3ec5cb26', '146a7e86-4e4c-4767-9546-ce70867a39b3', 'C', 'Le port 110 (POP3) est désactivé par le protocole de routage du fournisseur d''accès.', false, 'Le port 110 est un port de réception historique non sécurisé, sans rapport avec l''émission sortante SMTP.'),
('44ca134b-7720-4960-a5dc-a153d3c97101', '6392644e-83d2-441d-8501-bde70cb3793b', 'C', '=NB.SI.ENS(B:B; "PC Portable"; C:C; "<2022")', true, 'NB.SI.ENS dénombre les lignes satisfaisant simultanément les deux critères : type de matériel et opérateur de comparaison ''<2022''.'),
('8461eceb-79e4-4718-82a3-9671ea7da029', '39b8f5ff-2a34-4a6a-80bd-1787fee242b0', 'C', '=SOMME(B2:B20)', true, 'Le séparateur '':'' définit une plage continue, alors que ''+'' entre deux cellules n''additionne que ces deux valeurs isolées.'),
('79d1447a-5ed5-4f42-b63a-33b142e5f35d', 'ecb7b2e8-e8ec-4747-a179-a15fd351a669', 'C', 'Faire Ctrl + Alt + Suppr puis choisir ''Capture''', false, 'Cette option est incorrecte. Windows + Shift + S lance l''outil capture rectangulaire immédiate qui place l''image directement dans le presse-papiers.'),
('a3e96d58-8a56-4d31-b112-7b5ba03bce79', '8d63b860-0d15-4c66-ab0d-c5daf4806e5e', 'C', 'À 04h00 du matin heure de Paris, le serveur considérant la zone Caraïbe en avance sur l''Europe.', false, 'La métropole est en avance horaire par rapport aux Antilles, jamais en retard.'),
('e94dc330-4c8f-4efa-b50f-3126eb216f34', 'a9335e44-5a5b-45ee-85ec-f898cd1d54dc', 'C', '''Entrée'' crée un nouveau paragraphe (avec sa puce et ses espacements avant/après), tandis que ''Maj + Entrée'' crée un saut de ligne manuel au sein du même paragraphe.', true, 'Maj+Entrée effectue un retour à la ligne sans changer de paragraphe, conservant l''espacement et évitant de générer une puce surnuméraire.'),
('3fcd2674-a1ea-430e-b78e-59dc2bf08a6d', 'ca02acd1-f48d-4830-afa2-fcafe431babc', 'C', 'Parce que l''imprimante réseau refusera d''imprimer les lignes vides', false, 'Cette option est incorrecte. Le saut de paragraphe multiple est un réflexe amateur destructeur pour la pagination. Le saut de page (Ctrl + Entrée) isole définitivement les sections.'),
('3eb493e0-5e63-4455-b2e1-cb4dfa28861e', 'cd709961-55e2-44b1-ad80-ca89f5f4b4a5', 'C', '=SUPPRIME(A2)', false, 'Cette fonction effacerait la cellule au lieu de corriger son affichage.'),
('4f45f79b-3405-425e-b8e5-c8e812365594', '9ad4b801-3de9-4277-9b26-158c46b9992d', 'C', 'v=DMARC1; p=forward; to=postmaster@klf.gp; (transfert automatique des flux malveillants).', false, 'La norme RFC 7489 ne reconnaît pas de politique p=forward pour le traitement des messages illégitimes.'),
('69c2c636-9e4f-48d0-9080-6b0204c8e871', '554847a5-fd9d-4578-8c7b-c4e92c6edd50', 'C', 'Word ne permet pas de verrouiller partiellement un document.', false, 'Word gère la protection de formulaires depuis les premières versions Office.'),
('02f69f1e-fbaa-4bb2-af23-8276b3861f82', '653850fa-f983-4488-ad95-a599236bdd6e', 'C', '{ MERGEFIELD Prime \# "# ##0,00 €" }', true, 'Le commutateur \# applique un masque numérique : séparateur de milliers, deux décimales forcées par le ''00'' et symbole monétaire.'),
('fadd0ca3-4a71-4485-a59f-23f488a368da', '7c245727-214e-40be-a049-d45401f01c28', 'C', 'Le correcteur orthographique et grammatical avancé.', false, 'Le correcteur orthographique ne traite que la linguistique, pas les métadonnées de sécurité.'),
('2dfc2abf-89d6-4aa0-8b60-ceb06124bbb2', 'dae0b1bf-4b6a-4f79-a571-941a08e27985', 'C', 'Par deux points (:)', false, 'Cette option est incorrecte. Le signe ''='' indique au moteur de calcul qu''il ne s''agit pas de texte brut mais d''une expression à interpréter.'),
('b036caac-de46-4468-a4bf-560492d893fd', '1241a495-d522-4ac1-b3ba-82e21dc2a52e', 'C', 'Les composants ''QuickPart'' / ''Blocs de construction'' (AutoText) de Word.', true, 'Les blocs QuickParts enregistrent du texte et des visuels préformatés dans le modèle Normal.dotm pour une réinsertion instantanée par mot-clé (touche F3).'),
('8bbbf72a-d3a0-42f0-9afb-5d4f0cd3311a', '47c2777f-0a3a-4e9d-8cef-9a761aa112f9', 'C', 'Créer manuellement 15 colonnes et retaper les 500 lignes une par une.', false, 'C''est une hérésie productive totalement contraire aux attendus d''un technicien TIP.'),
('25044df8-729c-4875-94a1-27895d0371d4', '5cc9a161-ae21-4aa8-9ef0-ffc0542ec097', 'C', '=A2*1,20', false, '20% est le taux de TVA métropolitain normal, inapplicable en Guadeloupe où le taux normal de TVA est de 8,5%.'),
('1beb1087-8ecd-49e9-90e6-6c6ece97ecd3', 'f5e773a8-496b-4432-a705-97fd0592cad0', 'C', 'En document Word standard (.docx) en cochant ''Archive''.', false, 'Un .docx s''ouvre directement en modification ; un simple Ctrl+S écrase le modèle d''origine.'),
('08f00e87-96b2-4cc4-aa23-9685e2cf82e0', '6c732df0-73f5-4f81-b016-7965a5bb2f30', 'C', 'Elle supprime automatiquement le document au bout de 5 ans pour respecter le RGPD.', false, 'PDF/A vise au contraire la conservation illimitée sans altération.'),
('d50edded-cbb8-4f63-b41d-e5e8a415f289', '55d13874-c90f-4f90-a09b-25754e4f1146', 'C', 'Cela crypte le document avec un algorithme de niveau militaire interdit aux douanes.', false, 'Les tableaux structurés ne modifient pas le chiffrement du fichier.'),
('586b81ac-4334-4c08-b60d-55fc53eb596a', 'dc907012-d13e-4d99-8cae-3eafd4a93593', 'C', 'Bloquer le créneau sur son calendrier personnel sans mentionner la salle ni les participants.', false, 'La salle apparaîtra toujours disponible pour tous les autres collaborateurs de l''entreprise.'),
('e7951b2b-8b49-4fbd-a2de-818ea1415363', '12e69e9d-0e80-4239-a410-06dcca4ca7b7', 'C', 'Ctrl + Alt + Suppr à chaque paragraphe.', false, 'Cette combinaison ouvre le gestionnaire de tâches et les options de sécurité Windows.'),
('bbc1baa7-427c-412f-8f8e-403b87fa83bd', '3c381312-a57f-4ca0-8f66-22020040c983', 'C', 'Il n''y a aucune différence technique, ce sont deux termes synonymes désignant la même manipulation.', false, 'La distinction visuelle et la traçabilité de l''émetteur sont radicalement différentes entre ces deux modes.'),
('cb02c774-d663-4bba-aff7-ab63302eb613', '3639f009-1a83-431d-9c4e-cea44dc326c3', 'C', 'Changer l''extension en .mp4 pour forcer la lecture par VLC Media Player.', false, 'Absurde : un fichier traitement de texte ne se lit pas avec un lecteur vidéo multimédia.'),
('e42d2f59-c4d7-4f56-889a-f0d5fd477b34', '128257a1-a632-42d5-877f-a171a4eb77ec', 'C', 'La règle a été créée avec une condition exécutable exclusivement « côté client » (ex: liée à un son local, une action de machine ou un fichier local) au lieu d''une règle « côté serveur ».', true, 'Une règle côté client nécessite que l''application Outlook locale soit active sur le poste. Pour s''exécuter poste éteint, la règle doit être 100% exécutable côté serveur Exchange.'),
('e8b83063-6cb2-47f2-b5d9-667befa98e9f', '5488e563-56fd-40c2-8285-9dac4f1e9329', 'C', '=$D5*B2', false, 'Bloquer la colonne D n''empêche pas la cellule B2 de dériver en B3, B4... qui sont vides (valant 0).'),
('50f66d38-3de4-44be-9449-402050d1dfe3', 'b5380b8d-b297-4793-a2cb-e6b6dc52a745', 'C', 'En zoomant sur la page pour ajuster visuellement', false, 'Cette option est incorrecte. La barre d''espace varie selon la police (police proportionnelle). Seuls les tableaux masqués ou les taquets assurent un alignement strict.'),
('c65af755-b6dd-4965-84f7-57e4f3642ee8', 'ef4cbaef-14ce-4090-ae69-2932a81ebd88', 'C', '{ MERGEFIELD DateEmbauche \@ "dd/MM/yyyy" }', true, 'Le commutateur \@ permet de forcer le format de date dans Word. ''dd/MM/yyyy'' assure l''affichage jour/mois/année conforme aux normes françaises.'),
('1f0c934f-19e9-4dca-9e8a-e1f27b51b043', '9ea599d5-5d52-401e-89ef-79b9c1b45832', 'C', 'Pour permettre aux utilisateurs d''exécuter des scripts dans le document', false, 'Cette option est incorrecte. Le PDF (Portable Document Format) garantit l''intégrité visuelle exacte et l''impossibilité de modifier le contenu par mégarde.'),
('2f9f318c-0608-4259-83e5-f1b6f9321248', '40d5758d-a2c8-4834-a8b9-1c8615404c2c', 'C', '=$B$3*$C$2', false, 'Un adressage 100% absolu produirait exactement le même résultat dans toutes les cellules de la table.'),
('cfc28f6e-7769-4656-955e-12d2f8ac4552', 'c5c253cf-7c76-470e-9d93-4eec5f7437f7', 'C', 'Écrire les 150 adresses directement dans le corps de texte du message sous forme de liste à puces.', false, 'Cela ne garantit ni l''acheminement individuel ni la protection de la vie privée des contacts professionnels.')
on conflict (id) do update set
  question_id = excluded.question_id,
  lettre = excluded.lettre,
  texte = excluded.texte,
  is_correct = excluded.is_correct,
  dsi_explanation = excluded.dsi_explanation;

insert into tip.sf_quiz_options (id, question_id, lettre, texte, is_correct, dsi_explanation) values
('383d5d58-3671-47b1-87da-5a08b2a7c66c', 'c8f054bf-2937-453d-8aa9-a199072f7a26', 'C', 'Appliquer une bordure noire de 3 points autour de chaque illustration.', false, 'C''est un choix esthétique sans valeur fonctionnelle d''accessibilité.'),
('bb59d697-5b31-43b2-b13a-83c30b64b379', 'a516d2fa-2c5e-42b8-94ad-90d4958c1bb9', 'C', 'Le regroupement forcé de tous les courriels dans un dossier unique à la racine de la boîte de réception.', false, 'Cela détruirait l''organisation du classement de l''utilisatrice et créerait un désordre administratif ingérable.'),
('61f1f87a-46b7-49ba-b09c-d960ff3bd6a8', 'c57d12a7-28db-44ce-b309-f7cb1139763f', 'C', 'Déposer le fichier sur l''espace cloud sécurisé de l''entreprise (OneDrive ou Google Drive d''entreprise) et insérer dans le courriel un lien de partage sécurisé avec date d''expiration et accès restreint.', true, 'Les serveurs de messagerie mondiaux limitent les pièces jointes entre 20 et 25 Mo. L''usage de liens de partage cloud sécurisés est la norme recommandée pour le partage de gros volumes de données.'),
('c7738e96-a6cd-4400-8284-5eb2f4e6291a', '38232967-b80d-41b7-bdd6-70dfb282e700', 'C', 'RECHERCHEX supprime automatiquement les virus sur la feuille de calcul.', false, 'Totalement faux : aucune fonction de formule tableur ne remplace un antivirus d''entreprise.'),
('59126081-c915-415f-96e2-3c44f27fac3e', '3d2addae-0057-4d4e-9f8d-8ba85b954d01', 'C', 'Masquer le texte d''origine en utilisant une police de couleur blanche.', false, 'Pratique absurde et non professionnelle qui n''offre aucune sécurité technique.'),
('9b9b0139-5e77-4b08-8e6e-47bfb8b5a2e5', '084610a9-bea0-443e-807b-358a08204bea', 'C', 'Lui communiquer son mot de passe administrateur du domaine Active Directory.', false, 'Violation formelle de la charte informatique et compromission critique de la sécurité de l''entreprise.'),
('ea8c28a4-585a-4298-b217-fe3e1651f430', 'b2dab8c3-aa5a-4b40-8f02-9aedd47ef2f8', 'C', '=INDEX(A:A; EQUIV(D2; B:B; 0))', true, 'EQUIV trouve la position exacte (numéro de ligne) de l''adresse MAC en colonne B, puis INDEX extrait la valeur située sur cette même ligne en colonne A.'),
('e3654699-fbc3-4391-8222-fd9c1c68c518', '95a4d994-b243-45a4-902e-b7d5c91b1669', 'C', 'Diminuer la taille du fichier Word de plus de 50%', false, 'Cette option est incorrecte. Les styles permettent la table des matières automatique, le plan hiérarchique et la modification globale du design en un clic.'),
('d28529a6-7482-4b8f-8e6b-6b563c0dfb39', '154ffa33-c1e1-4ce6-af8f-0b9f8645d887', 'C', 'Habillage ''Devant le texte'' (In Front of Text).', false, 'Ce mode masque le texte situé derrière et ne suit pas les retours à la ligne du paragraphe.'),
('9e65fb4a-3062-46f2-b061-db44dfc140ed', '4cc8522c-1ec0-4bf0-a052-a008d57102c0', 'C', 'Supprimer les droits d''écriture sur l''ordinateur de tous les caristes.', false, 'Empêcher les agents de travailler bloque la logistique du quai !'),
('d8b730ca-e5e9-442d-baab-33598cbfe2b2', '02f5bbea-0ef7-4530-ab12-a83e7171f72c', 'C', 'Excel affiche une fenêtre popup rouge bloquant la fermeture du fichier.', false, 'Excel n''affiche aucune alerte modale lors d''un calcul de formule standard.'),
('6d1a5848-79e5-4f87-84a2-0c6061607438', 'e5ae9cb0-c790-4264-a6a9-c2fd4555d7e8', 'C', 'Laisser l''ordinateur allumé pendant 72 heures consécutives en espérant que le transfert aboutisse.', false, 'Le serveur SMTP continuera de rejeter le message pour dépassement de quota (erreur 552), paralysant indéfiniment l''envoi.'),
('9f3f28f8-ed26-403f-bcf0-f7a757872d37', 'cc94f0f2-e78a-4de3-af3b-5a4849da901c', 'C', '=SI(formule="ERREUR"; "En attente")', false, 'Une cellule en erreur ne renvoie pas la chaîne de texte ''ERREUR'' mais un code d''interruption système qu''un test classique d''égalité ne peut intercepter.'),
('707da832-efcb-4a82-bbc5-bf8f551032cc', '63eb29b6-4aeb-48ef-8f67-8928431d9e22', 'C', 'À traduire le document automatiquement en plusieurs langues', false, 'Cette option est incorrecte. C''est l''outil d''investigation n°1 du technicien pour réparer un document déstructuré par un utilisateur.'),
('081b7d41-f4fe-41f8-8847-4f9946a6da74', 'f3656438-85b1-4161-beb6-80b3e19b9c13', 'C', '=A10 * B10', false, 'Multiplier deux chaînes de texte renvoie immédiatement l''erreur #VALEUR!.'),
('5bea43e4-c679-4e40-957e-4cd6ca6061c5', '20c58b74-3313-4c20-b5d2-971a30b7fce9', 'C', 'Cocher ''Première page différente'', et dans ''Format des numéros de page'', définir la numérotation en ''À partir de 0''.', true, '''Première page différente'' rend la page 1 vierge d''en-tête/pied. Démarrer à 0 fait en sorte que la page physique 2 porte le numéro 1.'),
('c8fc4541-ef01-4d6a-a5d8-0abb155e1e82', '3e6e1699-ebb2-4f65-ab1e-d2fd1baabb19', 'C', 'Copier-coller manuellement la première ligne en haut de chaque page.', false, 'Dès qu''une ligne est ajoutée en amont, les en-têtes collés manuellement se retrouvent au milieu des pages.'),
('1db294f1-8a0e-457c-9537-338bd6d8c75b', '01e51db6-ecee-4ffc-802d-21bb3cf28046', 'C', 'doc1_nouveau (3).pdf', false, 'Cette option est incorrecte. Le format ISO AAAA-MM-JJ avec préfixe d''entreprise, objet clair, versioning et initiales garantit un tri chronologique et une traçabilité parfaite.'),
('8de61244-0295-4eef-b483-5152d08b7ea0', '5ca40835-8059-4004-9b66-ff668656c029', 'C', '=CHOISIR(B2; "P1"; "P2"; "P3")', false, 'La fonction CHOISIR requiert un index numérique (1, 2, 3) et ne sait pas évaluer des conditions textuelles logiques.'),
('742f770c-72ad-40ce-886e-937e88f4baa0', '3b85cee9-f9a0-46f5-9511-89865863577e', 'C', 'L''adresse IP émettrice n''est pas répertoriée dans l''enregistrement DNS TXT (SPF) officiel du domaine expéditeur : il s''agit d''une tentative d''usurpation d''identité (Spoofing) et d''un faux ordre de virement.', true, 'Le protocole SPF (Sender Policy Framework) valide que le serveur qui a émis le message est officiellement autorisé par les administrateurs du domaine. Un statut Fail atteste d''une falsification malveillante.'),
('b5df4688-16b3-43c5-a98f-a4b079f8b6e4', '4dcfd3f8-d8cc-464e-bbdb-ce0c4c09659a', 'C', '=SOMME.SI.ENS(D:D; B:B; "Jarry"; C:C; "CMA-CGM")', true, 'Dans SOMME.SI.ENS, la plage à additionner est placée en tout premier argument (D:D), suivie des paires (plage_critère; critère). C''est la fonction idéale pour les bilans logistiques multi-filtres.'),
('d32406c1-8371-46b1-b838-66b27217cc9f', '41d0cb01-054f-482a-a4f1-ddbfe6d21003', 'C', 'Agrandir la résolution de l''écran d''ordinateur pour augmenter virtuellement la capacité de la boîte.', false, 'La résolution d''affichage n''a aucun rapport avec l''espace de stockage alloué sur les serveurs de messagerie.'),
('ddb243f1-4cd1-44b2-b6dd-d6cc7765a29f', '8d1a43e5-6e09-4146-bfd9-947c710f3946', 'C', '=NB.SI($A$2:$A$100; A2)=1', true, 'La règle de validation vérifie que le nombre d''occurrences de la valeur saisie dans la plage globale est strictement égal à 1. Dès qu''un doublon apparaît (compteur = 2), Excel rejette immédiatement la saisie.'),
('84e1fe3a-8856-4099-934b-7e2e9a8fa996', 'af04ed4e-8658-4467-9c9b-871591bd6854', 'C', 'Le protocole FTP en mode passif pour le stockage des pièces jointes d''entreprise.', false, 'FTP est un ancien protocole de transfert de fichiers non sécurisé sans rapport avec les signatures électroniques.'),
('fe723589-a235-499c-b964-01fc8bcfd69a', '7b2407c2-591d-4024-8c68-0c2f2a227f18', 'C', 'Alt + F4', false, 'Cette option est incorrecte. Ctrl + F ouvre la recherche simple, tandis que Ctrl + H ouvre directement la boîte ''Remplacer'' (essentiel pour corriger des lots de données erronées).'),
('da013132-bfc6-4114-95d0-0cdd60ac5e1e', '95139638-923b-4f06-8926-fe4e58e5e7eb', 'C', 'Insérer un saut de section ''Page suivante'' avant et après le tableau, puis appliquer l''orientation Paysage uniquement à cette nouvelle section.', true, 'Seul le saut de section permet d''isoler des paramètres géométriques (orientation, marges, colonnes, en-têtes) au sein d''un même fichier.'),
('6b024744-75e9-4fbe-9850-6bd8a46ea928', 'dd7e8d74-7769-4553-b141-e822974dfdab', 'C', 'L''erreur #N/A signifie que la carte graphique de l''ordinateur surchauffe.', false, '#N/A est une erreur logique de tableur, sans rapport avec le matériel vidéo.'),
('75cc239e-2239-486c-8ed2-298733f9f794', '554be693-5a31-4cbe-bfd8-1a653d26ebc1', 'C', 'Le nombre de pages dépasse la limite indexable par le moteur de mise en page sans le module Microsoft Access.', false, 'Word et Docs indexent sans difficulté des centaines de pages sans nécessiter de base de données externe.'),
('dc8b1f37-8ce9-4c82-a1d8-02b6ee64db43', '0bc1d6d6-6f22-4a0e-b710-6b47a8363c70', 'C', 'Vérifier si un tableur compatible (Excel Mobile, Google Sheets ou suite Office) est installé, ou lui ouvrir le document en lecture via son navigateur web', true, 'L''extension détermine l''application associée. En mobilité, une visionneuse web ou l''application mobile dédiée résout immédiatement le blocage.'),
('94891ca8-1259-40bc-9ed6-671697b54c3d', 'e3783350-2967-4261-925a-dcb1af4cd86b', 'C', 'Un groupe de distribution est facturé 50 € par e-mail envoyé par le fournisseur de messagerie.', false, 'Les groupes de distribution Exchange ou Microsoft 365 sont des fonctionnalités natives incluses sans facturation à l''envoi.'),
('e8a20849-a263-48e7-91d7-386b026a2225', '7f12a8b7-974c-4922-b4e4-a7eeb383eef9', 'C', 'Demander aux 60 salariés de venir taper eux-mêmes leur convocation', false, 'Cette option est incorrecte. Le publipostage automatise la génération en masse de documents individualisés à partir d''une source de données propre.'),
('9edb9a40-377b-4691-bfb2-8a213bf5a1dc', '3b0cdd49-e668-4fdd-a03a-ae76975ce208', 'C', 'Ouvrir l''Historique des versions, sélectionner la version de 09h00, copier le paragraphe manuellement, revenir à la version active et le coller.', true, 'Restaurer brutalement la version de 09h00 supprimerait le travail de 11h à 11h30. Copier le bloc ciblé depuis l''historique préserve l''intégrité du document.'),
('ba2a40f4-9430-43a5-8cd3-14e2da54b847', '02e4a898-cc07-4880-bbd0-b6e20c9e496f', 'C', 'Il est obligatoire de donner le numéro de sécurité sociale des utilisateurs pour que l''IA comprenne le contexte', false, 'Cette option est incorrecte. L''anonymisation stricte des données est une obligation légale (RGPD) et professionnelle pour tout intervenant informatique.'),
('0f6ff9b3-e1d8-49fd-a5d6-4a3c9afd3918', 'a8f0482a-0770-42ed-afa9-c0ef28d0b629', 'C', 'Transférer le fichier exécutable sur sa boîte personnelle pour tester son comportement à domicile.', false, 'Transférer sciemment un exécutable suspect dissémine la menace et constitue une faute professionnelle majeure.'),
('b60feea3-456d-43cb-9564-5bf4f7f6ab78', '09c552c2-5ac0-42e1-b6c7-decab123963a', 'C', 'Écrire manuellement une formule de division sur le côté du tableau en tapant le chiffre total sur sa calculatrice.', false, 'Méthode bannie par la DSI : dès que le TCD est filtré ou réactualisé, la formule manuelle devient totalement fausse.'),
('79ad9bfe-cedf-4e11-b25c-236fd2aea46c', 'fc4ebbd3-d5ba-4571-bcd7-7b99a0705ac1', 'C', 'Éteindre et redémarrer la box Internet du bureau', false, 'Cette option est incorrecte. Le versioning automatique des suites collaboratives permet de remonter dans le temps et de comparer les modifications horodatées.'),
('5f6098eb-99db-4b10-b186-38163c3729d9', '8acfdf6e-52b4-478e-be3c-b78319caed36', 'C', 'La commande DOS ''fc /b'' dans l''invite de commande Windows.', false, 'La commande fc binaire compare des octets bruts et est illisible pour un fichier compressé XML (.docx).'),
('ba693052-0578-4612-a903-7ec56fb06ce6', 'a6a4be49-e939-4236-bc47-9bbc3a57dce7', 'C', 'Lui répondre que ce n''est pas du ressort du service informatique et clôturer le ticket', false, 'Cette option est incorrecte. Règle absolue du technicien : sauvegarder l''état existant avant intervention pour éviter toute perte irrémédiable de données.'),
('4df83e54-9e70-4f9f-897b-9683e9a41791', '73e648de-f3ec-49dd-b64b-df40c0567f8d', 'C', 'Il est impossible de conditionner du texte en publipostage sans développer un plugin en C#.', false, 'Le champ IF est une fonctionnalité standard intégrée à Word depuis plus de 25 ans.'),
('03bd9ef4-7a24-4922-8faa-4288c8465225', 'e9238216-4c02-4bae-8093-01a43432590f', 'C', 'Il n''y a aucune différence technique, ce sont deux raccourcis pour la même fonction', false, 'Cette option est incorrecte. ''Enregistrer sous'' est l''action clé pour créer une copie de sauvegarde avant intervention technique risquée.'),
('85d3864d-5db2-48c0-9b29-3fd2bb364813', '8ac64ffd-9209-4665-a1c1-8634e4e0cf97', 'D', 'Le fichier .ost ne stocke que les pièces jointes volumineuses, les e-mails textuels étant envoyés par SMS sécurisé.', false, 'Le fichier .ost encapsule l''ensemble des éléments de la boîte (textes, pièces jointes, calendriers, contacts).'),
('df238e5a-2e39-407f-9c34-bf8d72e818b2', '4dcfd3f8-d8cc-464e-bbdb-ce0c4c09659a', 'D', '=TOTAL.MULTIPLE(D:D; "Jarry"; "CMA-CGM")', false, 'Cette fonction est fictive et n''existe ni sous Excel ni sous Google Sheets.'),
('727a8ccb-ad27-44cc-be15-c379c5767d8a', '9ad4b801-3de9-4277-9b26-158c46b9992d', 'D', 'v=DMARC1; p=reject; rua=mailto:dmarc-reports@klf.gp; (directive de rejet strict des courriels non alignés avec envoi des rapports agrégés).', true, 'La politique p=reject intime l''ordre aux serveurs de messagerie destinataires de refuser net tout courriel non conforme aux enregistrements SPF et DKIM de l''entreprise.'),
('241b8f4a-a940-4a86-9951-633006243d44', '6392644e-83d2-441d-8501-bde70cb3793b', 'D', '=NB(B:B; C:C)', false, 'La fonction NB compte uniquement le nombre de cellules contenant des valeurs numériques brutes sans filtrage.'),
('6378a463-be33-49a4-bd58-9a85f8dda24a', '8acfdf6e-52b4-478e-be3c-b78319caed36', 'D', 'L''outil ''Comparer'' (ou ''Combiner'') situé dans l''onglet ''Révision''.', true, 'L''outil Comparer/Combiner analyse deux fichiers DOCX et génère automatiquement un troisième document avec les marques de révision explicites.'),
('78c3afb5-4a01-4cc2-bd7e-7416c14e00b5', 'cc94f0f2-e78a-4de3-af3b-5a4849da901c', 'D', 'Changer la couleur du texte en blanc pour que l''erreur ne se voie pas.', false, 'Mauvaise pratique éliminatoire : l''erreur subsiste et fera planter tous les totaux ou graphiques dépendants.'),
('277a152c-f550-40ca-8bdf-936dd0ecfcec', 'a471f2ef-dde3-4367-9c9a-2895521b8f15', 'D', 'Excel signale simplement que le document est prêt pour être référencé dans Google.', false, '#REF! est une erreur critique de référence détruite, pas une fonction de référencement web (SEO).'),
('323ffc1e-3af1-419e-af5b-40b12ba15949', '3d2addae-0057-4d4e-9f8d-8ba85b954d01', 'D', 'Activer le mode ''Brouillon'' dans l''onglet Affichage.', false, 'Le mode Brouillon change seulement la disposition visuelle à l''écran, sans aucun impact sur la traçabilité.'),
('bed7917f-0b79-4d1d-a7db-766471bbd7dd', '2c9190ea-6bb9-4abd-998f-1744660be177', 'D', 'Répondre à l''expéditeur en lui demandant de prouver son identité par téléphone.', false, 'Répondre confirme aux cyberattaquants que la boîte aux lettres cible est active et surveillée par un utilisateur crédule.'),
('5faaee1b-8322-4abc-9a47-dad002850a42', '55d13874-c90f-4f90-a09b-25754e4f1146', 'D', 'C''est une obligation imposée par la charte graphique de Windows 11 pour activer le mode sombre.', false, 'C''est une fonctionnalité métier de calcul et d''organisation de données.')
on conflict (id) do update set
  question_id = excluded.question_id,
  lettre = excluded.lettre,
  texte = excluded.texte,
  is_correct = excluded.is_correct,
  dsi_explanation = excluded.dsi_explanation;

insert into tip.sf_quiz_options (id, question_id, lettre, texte, is_correct, dsi_explanation) values
('4f78d0e6-c857-4797-8152-837536d4949a', '4cc8522c-1ec0-4bf0-a052-a008d57102c0', 'D', 'Insérer un commentaire jaune sur chaque cellule demandant poliment d''éviter les abréviations.', false, 'Un commentaire textuel ne bloque aucune erreur de frappe et est ignoré par les utilisateurs pressés.'),
('469d8780-71f4-425e-a767-77ef14c4a94b', '3b0cdd49-e668-4fdd-a03a-ae76975ce208', 'D', 'Restaurer immédiatement la version de 09h00 en écrasant la version en cours.', false, 'Cette action détruirait toutes les contributions valides saisies par l''équipe entre 11h00 et 11h30.'),
('446ed088-7165-45ae-80ca-497df30a6bc1', '8d1a43e5-6e09-4146-bfd9-947c710f3946', 'D', '=DOUBLON(A2) = FAUX', false, 'La fonction DOUBLON n''existe pas dans le moteur de validation d''Excel.'),
('964af655-14b7-43a9-b9c5-d03b7d0a21d3', '73e648de-f3ec-49dd-b64b-df40c0567f8d', 'D', 'La balise HTML <script>if (cp == 971)</script> dans le pied de page.', false, 'Word n''exécute pas de scripts JavaScript dans le corps d''un document DOCX.'),
('6bbaa3e4-99b5-4696-82d7-211b4a11f3f1', '09c552c2-5ac0-42e1-b6c7-decab123963a', 'D', 'Dans les paramètres du champ de valeur, aller dans l''onglet ''Afficher les valeurs'' et choisir ''% du total général''.', true, 'Le moteur TCD gère nativement les calculs de proportions relatives (% du total, % de la colonne, cumulé) sans avoir à écrire la moindre formule manuelle.'),
('69c9f369-bc90-40ef-bb68-24ae56fba77f', 'a8f0482a-0770-42ed-afa9-c0ef28d0b629', 'D', 'Lancer un nettoyage du disque dur avec un utilitaire d''optimisation téléchargé sur Internet.', false, 'Les utilitaires tiers ne neutralisent pas les cyberattaques actives et risquent d''aggraver la compromission du poste.'),
('e146ffc1-f36b-4f92-852d-0a7b334c351b', 'fa4451ee-f0c9-4ba5-92d6-7531ddcc8db5', 'D', 'Supprimer définitivement le TCD et le reconstruire intégralement à zéro chaque matin.', false, 'C''est une perte de temps inacceptable en entreprise : l''actualisation native prend moins d''une seconde.'),
('a6672524-e9ab-4510-a313-55000116b40d', '653850fa-f983-4488-ad95-a599236bdd6e', 'D', '{ MERGEFIELD Prime \$ EURO }', false, 'Ce commutateur n''existe pas dans le moteur de publipostage Microsoft Word.'),
('18c265d1-71df-4b3a-982b-5f73fa6fb1fe', 'cd709961-55e2-44b1-ad80-ca89f5f4b4a5', 'D', '=TEXTE(A2; "00000")', true, 'La fonction TEXTE applique un masque de formatage numérique : le code ''00000'' force l''affichage sur 5 positions et comble les chiffres manquants à gauche avec des zéros (ex: 97122 reste 97122, mais 1234 devient 01234).'),
('64c0cdfe-dab6-4cba-b451-6c62c5f55ac0', '47c2777f-0a3a-4e9d-8cef-9a761aa112f9', 'D', 'La fonction ''Zoom 200%'' de l''onglet Affichage.', false, 'Le zoom agrandit l''affichage des caractères à l''écran sans dissocier les colonnes.'),
('f6825a1f-1735-4815-85bc-bd22bcdd09a7', 'ef4cbaef-14ce-4090-ae69-2932a81ebd88', 'D', '{ MERGEFIELD DateEmbauche \* Caps }', false, 'Le commutateur \* Caps sert à mettre en majuscule la première lettre de chaque mot.'),
('a63c0aa4-6000-4d3a-89b3-19b4fc6abed7', '128257a1-a632-42d5-877f-a171a4eb77ec', 'D', 'La boîte de messagerie nécessite l''achat d''un abonnement logiciel complémentaire pour le travail nocturne.', false, 'Les licences Microsoft 365 ou Google Workspace incluent nativement les règles serveur en continu sans surcoût.'),
('5a1371f4-f970-4dc2-87e3-c125b85c92f6', 'a516d2fa-2c5e-42b8-94ad-90d4958c1bb9', 'D', 'L''impression sur papier de chaque courrier entrant pour archivage dans des classeurs d''entreprise.', false, 'Méthode obsolète, contraire aux objectifs environnementaux et inadaptée au travail numérique moderne.'),
('4d5323b9-3e8d-4013-ac1c-096d4b6b90a3', '20c58b74-3313-4c20-b5d2-971a30b7fce9', 'D', 'Insérer un saut de colonne après la page de garde et désactiver le mode relecture.', false, 'Le saut de colonne gère la disposition du texte dans les colonnes d''une page, pas la pagination globale.'),
('ad686552-3cdd-41f1-934c-e2ce27ddf0ba', 'c5c253cf-7c76-470e-9d93-4eec5f7437f7', 'D', 'Renseigner impérativement les 150 adresses dans le champ ''Cci'' (Copie conforme invisible / Bcc) afin qu''aucun destinataire ne puisse voir les coordonnées des autres contacts.', true, 'L''usage du champ Cci masque l''identité et les coordonnées des tiers, respectant scrupuleusement l''obligation de confidentialité imposée par le RGPD.'),
('3350fd48-5f11-4e2b-b31b-9039dae9ac8e', 'e5ae9cb0-c790-4264-a6a9-c2fd4555d7e8', 'D', 'Désactiver la carte réseau dans le Gestionnaire de périphériques de Windows de manière définitive.', false, 'Cela supprimerait tout accès Internet sur la machine sans résoudre le problème applicatif d''Outlook.'),
('d1c741c9-5557-43b8-955c-c42fa2708c17', '3b85cee9-f9a0-46f5-9511-89865863577e', 'D', 'Le message a été envoyé avec une version obsolète du navigateur Web de l''expéditeur.', false, 'Le résultat d''un contrôle SPF dépend des serveurs de messagerie et de la zone DNS, et non du navigateur client.'),
('5bf4e9a3-dd83-4ac3-a87d-44ca8576d39e', '95139638-923b-4f06-8926-fe4e58e5e7eb', 'D', 'Insérer un saut de page avant et après le tableau, puis modifier l''orientation globale du document.', false, 'Un saut de page simple ne crée pas de zone d''isolation de mise en page ; changer l''orientation basculerait l''intégralité du document.'),
('174db3dd-7309-4be4-ae23-3b60843f4435', '3c381312-a57f-4ca0-8f66-22020040c983', 'D', '''Envoyer en tant que'' affiche uniquement l''adresse générique de l''équipe (support@klf-logistique.gp), tandis que ''Envoyer de la part de'' affiche le nom de l''agent ayant rédigé la réponse pour le compte du guichet de support.', true, 'L''envoi ''En tant que'' garantit l''anonymisation du technicien au profit du guichet unique, tandis que ''De la part de'' préserve la traçabilité nominative de l''interlocuteur.'),
('c2ddbb66-93a4-4a78-a028-024faab94590', 'af04ed4e-8658-4467-9c9b-871591bd6854', 'D', 'L''annuaire d''adresses LDAP de l''imprimante multifonction du rez-de-chaussée.', false, 'LDAP est un protocole de consultation d''annuaire et ne fournit aucun certificat de signature de messages.'),
('3dfa6f60-e96a-4980-a590-97d914d8349a', '554be693-5a31-4cbe-bfd8-1a653d26ebc1', 'D', 'Les titres ont été mis en forme manuellement (gras, taille 16) au lieu d''utiliser les styles hiérarchiques ''Titre 1'', ''Titre 2'' de la feuille de style.', true, 'La table des matières automatique scrute exclusivement les paragraphes auxquels est affecté un style de plan (Titre 1, Titre 2...). Une mise en forme manuelle (gras, taille) n''attribue aucun niveau hiérarchique au paragraphe.'),
('e38bcbe6-d9a6-4897-8fb6-76b222c9d3f4', '6c732df0-73f5-4f81-b016-7965a5bb2f30', 'D', 'Elle intègre obligatoirement toutes les polices de caractères et métadonnées dans le fichier pour garantir un affichage 100% identique dans 20 ans, tout en interdisant les scripts dynamiques externes.', true, 'La norme ISO 19005 (PDF/A) est spécifiquement conçue pour l''archivage électronique pérenne : polices incorporées, interdiction de Flash/JavaScript et de références externes.'),
('a9760a28-4fb9-4365-8415-1c0ff792f089', 'e3783350-2967-4261-925a-dcb1af4cd86b', 'D', 'Les listes locales Outlook sont synchronisées avec le serveur Active Directory de l''entreprise.', false, 'Les listes locales sont stockées uniquement dans le profil personnel de l''utilisateur et ne modifient pas l''annuaire Active Directory.'),
('694bdc31-17a3-4ec6-96b0-0507f7ebf583', '38232967-b80d-41b7-bdd6-70dfb282e700', 'D', 'RECHERCHEX peut effectuer des recherches vers la gauche (la valeur renvoyée peut être située avant la colonne de recherche), intègre la gestion des erreurs par défaut et ne casse pas si des colonnes sont insérées.', true, 'RECHERCHEV était limitée aux recherches vers la droite avec un index numérique rigide. RECHERCHEX utilise des plages vectorielles indépendantes, sécurisées contre toute modification structurelle du tableau.'),
('3aa2a737-4ff2-49b8-870e-c5e6cc627869', 'dd7e8d74-7769-4553-b141-e822974dfdab', 'D', 'L''erreur #N/A (Non Applicable) signifie que la valeur exacte n''est pas trouvée. Il faut encapsuler la cellule de recherche dans la fonction SUPPRESPACE (ex: SUPPRESPACE(A2)) pour purger les espaces invisibles.', true, '#N/A indique une absence de correspondance stricte. Un espace en fin de chaîne (''CONT123 '') est différent de ''CONT123''. SUPPRESPACE élimine les espaces superflus.'),
('c021a7ff-c7db-4ff5-9aa8-07540b60735f', 'd103f964-25fd-4b73-8adb-02f007f716d7', 'D', 'Il faut augmenter la mémoire vive (RAM) de l''ordinateur fixe pour forcer la synchronisation avec le cloud.', false, 'La capacité de mémoire vive matérielle n''a aucun lien avec le protocole de communication réseau applicatif.'),
('2d9db02d-82fd-414c-950c-6cb8194d06cf', 'f5e773a8-496b-4432-a705-97fd0592cad0', 'D', 'En modèle Word (.dotx).', true, 'Le format .dotx (Document Template) ordonne à Word d''ouvrir un nouveau document vierge (''Document 1'') basé sur le modèle, protégeant ainsi l''original de tout écrasement.'),
('f46e7fd6-f0c1-4a75-9aba-245a1041e404', '06dae0e2-4624-4f7c-8a7f-2a0a882caddd', 'D', 'Une image animée GIF de 20 Mo accompagnée d''un extrait musical en lecture automatique.', false, 'Pratique prohibée qui alourdit les messages, dégrade l''image de marque et provoque le classement du courrier dans les spams.'),
('a0f98153-b744-4e9e-bd1d-e7c016f80fad', '146a7e86-4e4c-4767-9546-ce70867a39b3', 'D', 'Le port historique non sécurisé 25 est bloqué par les opérateurs Internet grand public ; il faut basculer l''envoi sur le port 587 (Submission STARTTLS) ou 465 (SSL/TLS) avec authentification obligatoire.', true, 'Pour endiguer les réseaux de machines zombies (botnets) émettant du spam, les FAI bloquent le port 25 sortant. Les normes modernes imposent le port 587 sécurisé.'),
('40dffd36-2d0d-4618-967a-eb4cb4cea058', 'a9335e44-5a5b-45ee-85ec-f898cd1d54dc', 'D', '''Entrée'' sauvegarde le document dans le cloud tandis que ''Maj + Entrée'' le ferme.', false, 'Aucune touche Entrée n''exécute la fermeture d''un document.'),
('63b3b8a9-5054-4bef-872f-ffc87a032983', '7c245727-214e-40be-a049-d45401f01c28', 'D', 'La désactivation de la connexion Wi-Fi au moment de l''enregistrement.', false, 'La connexion réseau n''a aucun lien avec le contenu interne du document bureautique.'),
('290067c2-2814-49e3-96b5-b359182f6595', '8d63b860-0d15-4c66-ab0d-c5daf4806e5e', 'D', 'L''invitation est rejetée par le serveur car deux fuseaux distincts ne peuvent coexister dans un même système d''agenda.', false, 'Les serveurs Exchange et Google Agenda gèrent nativement les multi-fuseaux horaires mondiaux.'),
('48a45148-24db-425c-a1cb-c065de72f2ec', '554847a5-fd9d-4578-8c7b-c4e92c6edd50', 'D', 'Convertir le document en image PNG et demander aux utilisateurs d''écrire dessus avec Paint.', false, 'Non conforme aux pratiques d''entreprise et rend l''exploitation des données impossible.'),
('a52ad10d-afaf-4355-9279-07781c1283d5', '1241a495-d522-4ac1-b3ba-82e21dc2a52e', 'D', 'La commande ''Filigrane personnalisé''.', false, 'Un filigrane est un arrière-plan estompé sur toute la page, pas un bloc textuel d''assistance.'),
('de40414a-1be8-455b-81da-e699215ec0b7', '41d0cb01-054f-482a-a4f1-ddbfe6d21003', 'D', 'Créer un mot de passe plus court pour compresser la base de données de l''utilisateur.', false, 'La longueur d''un mot de passe n''influence aucunement le volume de données stocké dans une boîte aux lettres.'),
('4fd1337e-5b8b-4b7b-a9b7-a8544ce1b431', '3639f009-1a83-431d-9c4e-cea44dc326c3', 'D', 'Ouvrir le fichier avec le Bloc-notes et supprimer tous les caractères bizarres au hasard.', false, 'Le Bloc-notes ne comprend pas la compression ZIP et corromprait davantage l''archive.'),
('8774a4f3-2253-4801-8a64-310669a360b9', '12e69e9d-0e80-4239-a410-06dcca4ca7b7', 'D', 'Ctrl + Maj + C (copier le style) sur le titre source, puis sélectionner les cibles et faire Ctrl + Maj + V (appliquer le style).', true, 'Ctrl+Maj+C et Ctrl+Maj+V constituent le raccourci du ''Pinceau de reproduction de mise en forme'', indispensable pour l''efficacité d''un technicien.'),
('711caecf-bf69-4c57-83c2-68c1c0590354', 'dc907012-d13e-4d99-8cae-3eafd4a93593', 'D', 'Ajouter la salle et le matériel en tant que « Boîtes de ressource » (Room/Equipment Mailbox) dans l''invitation, le système acceptant ou refusant automatiquement la demande selon le planning d''occupation.', true, 'Les boîtes de ressources disposent d''un moteur de réservation automatisé qui gère les conflits et confirme instantanément la disponibilité du matériel.'),
('12334e1b-7e83-4496-9a49-1d68b48c0f3b', '5488e563-56fd-40c2-8285-9dac4f1e9329', 'D', '=SOMME(D5:B2)', false, 'La fonction SOMME additionne les cellules au lieu de multiplier la base par le taux de taxe.'),
('027b72ef-c1cd-4dde-ba21-24d6f181eb22', 'c8f054bf-2937-453d-8aa9-a199072f7a26', 'D', 'Héberger l''image sur un serveur FTP externe avec lien direct.', false, 'L''hébergement externe n''a aucun lien avec la norme d''accessibilité documentaire.'),
('a60a23be-4061-4816-aeb2-2a1b4f839430', '40d5758d-a2c8-4834-a8b9-1c8615404c2c', 'D', '=$B3*C$2', true, 'Dans $B3, la colonne du poids est bloquée ($B). Dans C$2, la ligne de la zone portuaire est bloquée ($2). Cette formule semi-absolue fonctionne parfaitement sur toute la matrice.'),
('005d19c1-b1f5-4c5a-915d-99427c42dce1', '5cc9a161-ae21-4aa8-9ef0-ffc0542ec097', 'D', '=A2 + 8,5 + 8,5', false, 'Additionner la valeur 8,5 ajoute 17 euros fixes et non 17% proportionnels au montant.'),
('0f07c034-8a9a-4859-8a7a-64a65776217c', '154ffa33-c1e1-4ce6-af8f-0b9f8645d887', 'D', 'Habillage ''Aligné sur le texte'' (In Line with Text).', true, 'En mode ''Aligné sur le texte'', l''image se comporte comme un caractère typographique géant dans le paragraphe, évitant tout décrochage chaotique.'),
('0e4bb580-878d-4c2a-ab28-1b74977b7d00', 'b2dab8c3-aa5a-4b40-8f02-9aedd47ef2f8', 'D', '=EQUIV(INDEX(D2; B:B); A:A; 0)', false, 'L''imbrication est inversée : EQUIV renvoie un nombre entier, qui ne peut pas servir de matrice pour INDEX.'),
('d0ce2a83-de9d-4968-bf49-71508ca2eb8f', '084610a9-bea0-443e-807b-358a08204bea', 'D', 'Lui attribuer le rôle d''administrateur général du tenant cloud de l''entreprise.', false, 'L''administration globale est disproportionnée et présente un risque systémique pour la messagerie d''entreprise.'),
('5a8b1825-9216-464c-8081-05ae5392b8c6', '02f5bbea-0ef7-4530-ab12-a83e7171f72c', 'D', 'Le tableur s''arrête et demande l''authentification de l''administrateur DSI.', false, 'Aucun privilège administrateur n''est requis pour une fonction de recherche de données.'),
('98560814-ae69-42d0-9935-6ba7344f3ca4', '3e6e1699-ebb2-4f65-ab1e-d2fd1baabb19', 'D', 'Réduire la taille de la police à 4 points pour faire tenir tout le tableau sur une seule page.', false, 'Le document deviendrait illisible et non conforme aux règles ergonomiques élémentaires.'),
('2c298ac6-b91b-4f51-a6c1-b69893992f00', 'f3656438-85b1-4161-beb6-80b3e19b9c13', 'D', '=RECHERCHEV(A10; MatriceTarifs; B10; FAUX)', false, 'Le 3ème argument de RECHERCHEV doit être un numéro de colonne numérique et ne peut pas être un nom de ville en texte.'),
('227ad2ce-d11c-4dad-9689-0b007bdc7a2b', 'c57d12a7-28db-44ce-b309-f7cb1139763f', 'D', 'Utiliser une plateforme de transfert public gratuite et non certifiée sans chiffrement ni accord de la DSI.', false, 'L''hébergement de données douanières confidentielles sur des services grand public non audités viole la charte de sécurité et le RGPD.'),
('3d892b39-f9cf-4dff-a840-5c35715045fd', '5ca40835-8059-4004-9b66-ff668656c029', 'D', '=OU(B2; C2; D2) = "P1"', false, 'La fonction OU renvoie un booléen (VRAI ou FAUX), pas une chaîne de texte personnalisée.')
on conflict (id) do update set
  question_id = excluded.question_id,
  lettre = excluded.lettre,
  texte = excluded.texte,
  is_correct = excluded.is_correct,
  dsi_explanation = excluded.dsi_explanation;

-- ==============================================================================
-- 15. PERMISSIONS ET DROITS SUR LE SCHÉMA TIP
-- ==============================================================================
grant usage on schema tip to anon, authenticated, service_role;
grant all on all tables in schema tip to anon, authenticated, service_role;
grant all on all sequences in schema tip to anon, authenticated, service_role;
grant all on all routines in schema tip to anon, authenticated, service_role;
alter default privileges in schema tip grant all on tables to anon, authenticated, service_role;
alter default privileges in schema tip grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema tip grant all on routines to anon, authenticated, service_role;
