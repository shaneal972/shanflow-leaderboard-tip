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

-- 9. ROW LEVEL SECURITY (RLS)
alter table tip.sf_apprenants enable row level security;
alter table tip.sf_badges enable row level security;
alter table tip.sf_achievements enable row level security;
alter table tip.sf_tickets_klf enable row level security;
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

drop policy if exists "Lecture publique dp" on tip.sf_dp_suivi;
create policy "Lecture publique dp" on tip.sf_dp_suivi for select using (true);

-- ==============================================================================
-- SEED DATA : BADGES, TICKETS ET APPRENANTS DE DÉMONSTRATION
-- ==============================================================================

-- Insertion des 10 Badges KLF
insert into tip.sf_badges (id, titre, description, palier, points_requis, icone_url, rarete) values
('ran_keyboard_ninja', 'Ninja du clavier', 'Maîtrise des 12 raccourcis essentiels sans toucher à la souris (Ctrl+Shift+V, Ctrl+H, sélection rapide).', 'Palier 0', 50, '⌨️', 'commun'),
('ran_zero_defaut', 'Hygiène de poste DSI', 'Configuration de l''arborescence KLF standardisée et application stricte des règles de nommage.', 'Palier 0', 50, '📁', 'commun'),
('dsi_charte_master', 'Garant de la charte KLF', 'Mise en page de documents techniques aux normes DSI (Styles Titres, sauts de page forcés, zéros espaces parasites).', 'Palier 1', 100, '📄', 'rare'),
('excel_data_cleaner', 'Nettoyeur de parc Jarry', 'Audit, nettoyage et normalisation de l''inventaire brut des 65 postes informatiques KLF sur tableur.', 'Palier 1', 100, '📊', 'rare'),
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
insert into tip.sf_tickets_klf (id, service text, demandeur, titre, description, urgence, points_valeur, statut) values
('TCK-101', 'Facturation & Douane', 'Corinne MONROSE', 'Urgent : Erreurs #N/A et calcul d''Octroi de mer sur manifeste conteneurs', 'Bonjour le support. Mon classeur de suivi des arrivages maritimes affiche #N/A sur toutes les lignes de transit et les taux d''Octroi de mer (8.5% Guadeloupe) ne s''appliquent plus automatiquement. La douane attend les déclarations avant 16h !', 'P1', 150, 'ouvert'),
('TCK-102', 'Quai & Entrepôts', 'Sébastien LEBLANC', 'Confection du tutoriel d''utilisation des tablettes durcies Zebra caristes', 'Salut l''équipe IT. Nos 8 caristes reçoivent leurs nouvelles tablettes Zebra TC57 pour scanner les conteneurs au quai n°3. Il me faut une fiche réflexe 1-page plastifiée avec photos claires pour allumer, scanner et vider le cache en cas de freeze.', 'P2', 200, 'ouvert'),
('TCK-103', 'Ressources Humaines', 'Élodie THEOPHILE', 'Campagne de publipostage des 60 convocations visites médicales', 'Bonjour. Je dois expédier ce soir 60 courriers personnalisés pour les visites médicales périodiques du personnel de Jarry et de Fort-de-France. À chaque tentative de fusion Word, les prénoms sautent d''une ligne.', 'P2', 150, 'ouvert')
on conflict (id) do update set
  service = excluded.service,
  demandeur = excluded.demandeur,
  titre = excluded.titre,
  description = excluded.description,
  urgence = excluded.urgence,
  points_valeur = excluded.points_valeur;

-- Insertion des Apprenants Promotion C26031A (Pseudo-anonymisés sur l'UI publique)
insert into tip.sf_apprenants (id, prenom, nom, email, avatar_url, points_total, palier_actuel, equipe, is_admin) values
('00000000-0000-0000-0000-000000000001', 'Jordan', 'MARIE-JOSEPH', 'jordan.mj@metafore.gp', 'https://api.dicebear.com/7.x/bottts/svg?seed=jordan', 850, 'Palier 3', 'Escouade Alizé', false),
('00000000-0000-0000-0000-000000000002', 'Sarah', 'LAURENT', 'sarah.l@metafore.gp', 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah', 750, 'Palier 2', 'Escouade Alizé', false),
('00000000-0000-0000-0000-000000000003', 'Kevin', 'BEAUPERTHUY', 'kevin.b@metafore.gp', 'https://api.dicebear.com/7.x/bottts/svg?seed=kevin', 650, 'Palier 2', 'Escouade Houelbourg', false),
('00000000-0000-0000-0000-000000000004', 'Maëva', 'CHALUS', 'maeva.c@metafore.gp', 'https://api.dicebear.com/7.x/bottts/svg?seed=maeva', 500, 'Palier 2', 'Escouade Houelbourg', false),
('00000000-0000-0000-0000-000000000005', 'Cédric', 'NANKIN', 'cedric.n@metafore.gp', 'https://api.dicebear.com/7.x/bottts/svg?seed=cedric', 400, 'Palier 1', 'Escouade Baie-Mahault', false),
('00000000-0000-0000-0000-000000000006', 'Daphnée', 'GUSTAVE', 'daphnee.g@metafore.gp', 'https://api.dicebear.com/7.x/bottts/svg?seed=daphnee', 350, 'Palier 1', 'Escouade Baie-Mahault', false),
('00000000-0000-0000-0000-000000000007', 'Alexandre', 'POUMAROUX', 'alexandre.p@metafore.gp', 'https://api.dicebear.com/7.x/bottts/svg?seed=alex', 200, 'Palier 1', 'Escouade Alizé', false),
('00000000-0000-0000-0000-000000000008', 'Kareen', 'VIRAPIN', 'kareen.v@metafore.gp', 'https://api.dicebear.com/7.x/bottts/svg?seed=kareen', 100, 'Palier 0', 'Escouade Houelbourg', false),
('00000000-0000-0000-0000-000000000099', 'David', 'JACQUA', 'david.jacqua@shanflow.cloud', 'https://api.dicebear.com/7.x/bottts/svg?seed=david', 0, 'Formateur Référent', 'Coordination Pédagogique', true)
on conflict (email) do nothing;

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
