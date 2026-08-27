# 🚢 KLF Tech Passport & Leaderboard (Titre Pro TIP)

> **Plateforme web de gamification et de suivi des compétences pour la promotion de Techniciens Informatiques de Proximité (TIP - Session C26031A) du centre METAFORE (FORE Alternance - Jarry, Guadeloupe).**  
> Ancrée dans l'entreprise locale fictive **Karukera Logistique & Fret (KLF)**.

---

## 🌟 Caractéristiques Clés

- **Direction Artistique & Design System :** Esthétique **Linear Stealth x Railway Blueprint** (Liquid Glass, Deep Navy `#070F1E`, Slate Glass `#112240`, accents Caribbean Teal `#00B4D8` et Warm Gold `#F59E0B`).
- **Conformité RGPD Stricte :**
  - Pseudo-anonymisation sur le classement public (`Jordan M.`).
  - L'adresse email est strictement invisible sur les vues publiques.
  - Notice de transparence conforme RGPD (finalité formation, conservation jusqu'en juin 2027 avec purge post-jury).
- **Ergonomie Mobile & Tablette Antilles :**
  - Colonne `Actions` en `position: sticky; right: 0;` avec ombre pour un accès tactile fluide en salle de cours sur tablette.
  - Skeletons Shimmer anti-latence réseau avec la métropole.
- **Les 4 Modules Fonctionnels :**
  1. 🏆 **Leaderboard Promo en Temps Réel :** Classement dynamique, médailles Top 3, filtres par escouade (Alizé, Houelbourg, Baie-Mahault).
  2. 🎖️ **Passeport de Compétences TIP :** Suivi des 5 Paliers REAC (du Palier 0 au Palier 4), armoire des 10 badges KLF (or/teal débloqués, grisés verrouillés) avec célébration `canvas-confetti`.
  3. 🎫 **KLF Ticket Desk :** Simulation d'incidents support réels (Ticket #101 Corinne Facturation avec simulateur Octroi de mer & TVA 8.5%, Ticket #102 Quai Zebra REAC, Ticket #103 RH Publipostage).
  4. 📋 **Suivi Dossier Professionnel (DP REAC) :** Audit des 5 rubriques officielles Cerfa du Ministère du Travail pour le CCP 1 (Support Utilisateur).

---

## 🛠️ Stack Technique

- **Frontend :** Next.js 15 (App Router, Turbopack), React 19, Tailwind CSS.
- **Typage & Validation :** TypeScript strict, Zod avec sanitisation anti-XSS.
- **Base de Données :** Instance Supabase (`https://supabase.shandev.cloud`) avec **schéma dédié `tip`** et Row Level Security (RLS).
- **Automation :** Route Webhook sécurisée (`/api/webhooks`) avec authentification Bearer token et table d'idempotence (`tip.sf_idempotency`).

---

## 🚀 Installation & Démarrage Local

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Compiler pour la production
npm run build
```

L'application s'ouvre sur `http://localhost:3000`.

---

## 🗄️ Déploiement BDD Supabase (Schéma `tip`)

Le fichier `supabase/schema.sql` contient :
1. La création du schéma `tip` et des tables (`sf_apprenants`, `sf_badges`, `sf_achievements`, `sf_tickets_klf`, `sf_dp_suivi`, `sf_idempotency`).
2. La vue publique sécurisée `tip.v_leaderboard_public`.
3. Les politiques de sécurité RLS.
4. Les données initiales (les 10 badges KLF, les 3 tickets incidents, et 8 apprenants démo de la session C26031A).

Pour déployer : copiez le contenu de `supabase/schema.sql` dans le SQL Editor de votre instance Supabase (`https://supabase.shandev.cloud`).

---

## 🔒 Intégration Webhook n8n

- **Endpoint :** `POST /api/webhooks`
- **En-tête requis :** `Authorization: Bearer <KLF_WEBHOOK_BEARER_TOKEN>`
- **Exemple de Payload JSON (Idempotent) :**
```json
{
  "event_id": "quiz_sub_2026_09_01_jordan_01",
  "source": "n8n_google_forms",
  "event_type": "quiz_completed",
  "data": {
    "email": "jordan.mj@metafore.gp",
    "points": 50,
    "badge_id": "ran_keyboard_ninja"
  }
}
```

---

*Développé pour la promotion Technicien Informatique de Proximité (METAFORE / FORE Alternance) • ShanFlow Academy.*
