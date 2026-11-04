-- ==============================================================================
-- MIGRATION PRODUCTION : MODULE KLF TECH LAB (sf_labs & sf_lab_submissions)
-- Date : 2026-11-04 | Schéma dédié : tip | Serveur : supabase.shandev.cloud
-- ==============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS tip.sf_labs (
  id text PRIMARY KEY,
  titre text NOT NULL,
  description text NOT NULL,
  domaine text NOT NULL CHECK (domaine IN ('bureautique', 'reseau', 'systeme', 'cyber')),
  palier text NOT NULL DEFAULT 'Palier 1',
  points_total integer NOT NULL DEFAULT 200,
  points_auto_validation integer NOT NULL DEFAULT 100,
  badge_id text REFERENCES tip.sf_badges(id) ON DELETE SET NULL,
  ticket_id text REFERENCES tip.sf_tickets_klf(id) ON DELETE SET NULL,
  fichier_modele_nom text NOT NULL,
  fichier_modele_url text NOT NULL,
  duree_estimee text DEFAULT '1h30',
  statut text NOT NULL DEFAULT 'ouvert' CHECK (statut IN ('ouvert', 'a_venir', 'archive')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tip.sf_lab_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id text NOT NULL REFERENCES tip.sf_labs(id) ON DELETE CASCADE,
  apprenant_id uuid NOT NULL REFERENCES tip.sf_apprenants(id) ON DELETE CASCADE,
  audit_results jsonb,
  jalons_valides integer DEFAULT 0,
  score_technique_pct integer DEFAULT 0,
  reponse_demarche text,
  reponse_difficultes text,
  reponse_enseignements text,
  statut text NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_cours', 'soumis_en_revue', 'homologue_dsi', 'a_corriger')),
  points_attribues integer DEFAULT 0,
  feedback_formateur text,
  soumis_le timestamptz DEFAULT now(),
  evalue_le timestamptz,
  evalue_par text,
  UNIQUE(lab_id, apprenant_id)
);

CREATE INDEX IF NOT EXISTS idx_sf_lab_submissions_lab_apprenant ON tip.sf_lab_submissions(lab_id, apprenant_id);
CREATE INDEX IF NOT EXISTS idx_sf_lab_submissions_audit_gin ON tip.sf_lab_submissions USING GIN (audit_results);

-- Sécurité Row Level Security (Zero-Trust)
ALTER TABLE tip.sf_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip.sf_lab_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestion labs" ON tip.sf_labs;
DROP POLICY IF EXISTS "Lecture publique lab submissions" ON tip.sf_lab_submissions;
DROP POLICY IF EXISTS "Gestion lab submissions" ON tip.sf_lab_submissions;

DROP POLICY IF EXISTS "Lecture publique labs" ON tip.sf_labs;
CREATE POLICY "Lecture publique labs" ON tip.sf_labs FOR SELECT TO anon, authenticated USING (true);

-- Droits PostgREST explicites sur le schéma tip
GRANT USAGE ON SCHEMA tip TO anon, authenticated, service_role;
GRANT SELECT ON tip.sf_labs TO anon, authenticated;
GRANT ALL ON tip.sf_labs TO service_role;
GRANT ALL ON tip.sf_lab_submissions TO service_role;
REVOKE ALL ON tip.sf_lab_submissions FROM anon, authenticated;

-- Seed officiel des ateliers KLF Tech Lab
INSERT INTO tip.sf_labs (
  id, titre, description, domaine, palier, points_total, points_auto_validation,
  badge_id, ticket_id, fichier_modele_nom, fichier_modele_url, duree_estimee, statut
) VALUES
(
  'tp-bur-01-corinne',
  'Sauvetage du manifeste d''arrivages maritimes de Corinne & Fiscalité Antilles',
  'Dépannage critique du classeur Excel de suivi des conteneurs portuaires de Corinne (Facturation & Douane). Rétablissement des codes postaux sur 5 chiffres, élimination des erreurs #N/A via SUPPRESPACE/SIERREUR, calcul automatisé de l''Octroi de mer (8.5%) et de la TVA Guadeloupe (8.5%) avec références semi-absolues ($), et figeage des volets.',
  'bureautique',
  'Palier 1',
  200,
  100,
  'corinne_savior',
  'TCK-101',
  'KLF_Manifeste_Arrivages_Corinne_BRUT.xlsx',
  '/api/lab/download-sample?labId=tp-bur-01-corinne',
  '1h30',
  'ouvert'
),
(
  'tp-bur-02-elodie',
  'Gabarit DSI officiel KLF & Publipostage RH sans décalage',
  'Conception du modèle officiel .dotx selon la charte graphique DSI KLF et exécution de la campagne de publipostage Word de 60 convocations médicales pour Élodie avec formatage monétaire et gestion des sauts de section.',
  'bureautique',
  'Palier 1',
  150,
  75,
  'rh_mailmerge_ace',
  'TCK-103',
  'KLF_Modele_Convocations_RH_BRUT.docx',
  '#',
  '1h30',
  'a_venir'
),
(
  'tp-net-01-zebra',
  'Diagnostic d''adressage IPv4 statique & Dépannage imprimante Zebra ZT410',
  'Rétablissement de la connectivité réseau de l''imprimante thermique du quai suite à bascule en adresse APIPA non routable (169.254.x.x). Diagnostic en ligne de commande et réservation DHCP.',
  'reseau',
  'Palier 2',
  200,
  100,
  'quai_tutor_pro',
  'TCK-105',
  'KLF_Topology_Quai_Jarry.pka',
  '#',
  '2h00',
  'a_venir'
)
ON CONFLICT (id) DO UPDATE SET
  titre = EXCLUDED.titre,
  description = EXCLUDED.description,
  domaine = EXCLUDED.domaine,
  palier = EXCLUDED.palier,
  points_total = EXCLUDED.points_total,
  points_auto_validation = EXCLUDED.points_auto_validation,
  badge_id = EXCLUDED.badge_id,
  ticket_id = EXCLUDED.ticket_id,
  fichier_modele_nom = EXCLUDED.fichier_modele_nom,
  fichier_modele_url = EXCLUDED.fichier_modele_url,
  duree_estimee = EXCLUDED.duree_estimee,
  statut = EXCLUDED.statut;

COMMIT;

NOTIFY pgrst, 'reload schema';
