# Standard Industriel de Sécurité Applicative DevSecOps (KLF / ShanFlow)

> **Règle d'or inviolable** : Tout agent modifiant le code de ce dépôt **DOIT IMPÉRATIVEMENT** appliquer les principes Zero-Trust ci-dessous et valider ses modifications via `npx tsx scripts/lib/shan-security-validator.ts` (`npm run security:check`) avant toute annonce de fin de tâche ou commit.

---

## 1. Validation Systématique des Entrées (Input Validation)

1. **Routes API (`src/app/api/**/route.ts`)** :
   - Toute méthode de mutation (`POST`, `PUT`, `DELETE`, `PATCH`) doit être encapsulée dans un bloc `try { ... } catch` robuste.
   - Toute lecture de charge utile (`req.json()`, `req.formData()`, `searchParams`) doit impérativement faire l'objet d'une validation stricte via un schéma **Zod** (`safeParse`) ou une vérification explicite des champs obligatoires, des types et des longueurs maximales.
   - Retourner systématiquement un code HTTP `400 Bad Request` en cas d'invalidation, sans exposer de traces internes ou d'erreurs d'infrastructure.

2. **Server Actions (`src/app/**/actions.ts`)** :
   - Toute Server Action acceptant des paramètres en provenance du client doit valider ces arguments via un schéma Zod (`schema.safeParse(input)`).
   - Sanitiser les champs texte destinés à être persistés ou affichés via `sanitizeString()` ou `.transform(sanitizePlainText)` pour neutraliser toute balise HTML parasite.

---

## 2. Protection des Secrets & Données Sensibles (Zero Client Leak)

1. **Composants Client (`"use client"`)** :
   - **Interdiction absolue** d'importer directement des secrets serveur, des variables d'authentification ou des clients à privilèges élevés :
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `ADMIN_PASSWORD`
     - `ADMIN_SESSION_SECRET`
     - `STUDENT_SESSION_SECRET`
     - `KLF_WEBHOOK_BEARER_TOKEN`
     - `supabaseServer` (`src/supabase/server.ts`)
   - Aucun composant client ne doit contenir de code PIN de formateur ou de stagiaire en dur (ex: `pin_code = '2026'`, `setPin('2026')`).
   - Seules les variables préfixées par `NEXT_PUBLIC_` destinées au navigateur (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) sont autorisées.

2. **Gestion des Sessions & Cryptographie** :
   - Toute signature de jeton (session formateur ou session étudiant) doit être générée côté serveur via `HMAC-SHA256` avec dérivation dynamique sécurisée.
   - La comparaison des mots de passe et des codes PIN doit impérativement s'exécuter en **temps constant** (`crypto.timingSafeEqual`) pour éradiquer les attaques temporelles (*timing attacks*).
   - Protection anti-brute-force obligatoire sur les points d'entrée d'authentification (rate-limiting par couple IP / identifiant).

---

## 3. Anti-XSS & Bannissement du Code Dynamique Dangereux

1. **Interdiction de `dangerouslySetInnerHTML`** :
   - Le rendu React doit utiliser des composants typés et le DOM virtuel natif. L'insertion de HTML brut non contrôlé est proscrite.
2. **Interdiction de `eval()` et `new Function()`** :
   - Tout calcul ou évaluation d'expression dynamique doit s'exécuter via des fonctions pures déclaratives ou des analyseurs AST sécurisés.
3. **Interdiction d'injection dans les commandes Shell** :
   - Aucun appel à `child_process` (`exec`, `execSync`, `spawn`) ne doit être inclus dans le code applicatif web (`src/app/`).
   - Les scripts d'outillage ou d'administration dans `scripts/` ne doivent jamais concaténer d'entrées non filtrées dans des chaînes de commande.

---

## 4. Upload, Gestion des Fichiers & Anti-Path-Traversal

1. **Manipulation de Fichiers Serveur (`fs`)** :
   - Tout chemin de fichier construit dynamiquement doit systématiquement assainir le nom de fichier via `path.basename()` afin de neutraliser toute tentative de traversée de répertoire (`../`, `..\`).
   - Privilégier les listes blanches (whitelists) fermées d'identifiants de fichiers autorisés.
2. **Auditeur et Traitement In-Browser (ex: Fichiers Excel)** :
   - Contrôle strict de l'extension de fichier autorisée (`.xlsx`, `.xls`).
   - Limitation stricte de la taille maximale du buffer (ex: maximum 10 Mo) pour immuniser le navigateur contre les attaques par déni de service (*Zip Bombs*).
   - Protection contre la pollution de prototype : interdiction formelle d'assigner des propriétés dynamiques non filtrées sur des objets JavaScript (`__proto__`, `constructor`, `prototype`).

---

## 5. Autorisation Côté Serveur des Mutations (Access Control)

1. **Contrôle d'Identité Strict (Anti-IDOR)** :
   - Toute route API ou Server Action effectuant une modification d'état (attribution de points, sauvegarde de TP, validation de quiz, mise à jour de PIN ou de dossier professionnel) doit vérifier l'identité de l'appelant côté serveur via :
     - `isAdminAuthenticated()` pour les opérations de supervision formateur DSI.
     - `getActiveTechnicianId()` et `isStudentAuthenticated(studentId)` pour s'assurer que l'apprenant agit exclusivement sur ses propres ressources.
   - Ne jamais se fier à un identifiant transmis par le client (`body.studentId`, `localStorage`) sans corrélation cryptographique avec les cookies HttpOnly de session.
2. **Webhooks Entrants** :
   - Authentification obligatoire par jeton secret `Bearer` (`Authorization: Bearer <KLF_WEBHOOK_BEARER_TOKEN>`).
   - Contrôle d'idempotence strict (vérification `tip.sf_idempotency`) avant toute transaction financière, attribution de points ou déblocage de badge.

---

## 6. Intégrité des Fichiers & Contrôle des Uploads

1. **Auditeur et Traitement In-Browser (ex: Fichiers Excel)** :
   - Contrôle strict de l'extension de fichier autorisée (`.xlsx`, `.xls`).
   - Limitation stricte de la taille maximale du buffer (ex: maximum 10 Mo) pour immuniser le navigateur contre les attaques par déni de service (*Zip Bombs*).
   - Protection contre la pollution de prototype : interdiction formelle d'assigner des propriétés dynamiques non filtrées sur des objets JavaScript (`__proto__`, `constructor`, `prototype`).

---

## 7. Verrouillage Anti-IDOR des Server Actions & Intégrité HMAC (Règle 7)

1. **Garde d'Authentification Obligatoire sur toute Mutation** :
   - Tout fichier `src/app/**/actions.ts` réalisant une mutation Supabase (`supabaseServer`, `.from(...)` avec `.insert()`, `.update()`, `.upsert()` ou `.delete()`) doit impérativement importer et appeler un garde d'authentification (`studentAuth` ou `adminAuth`).
   - Fonctions requises selon le périmètre : `isAdminAuthenticated()`, `isStudentAuthenticated(studentId)` ou `getActiveTechnicianId()`.
2. **Sanctuarisation Cryptographique HMAC & Timing-Safe** :
   - `src/lib/studentAuth.ts` et `src/lib/adminAuth.ts` doivent obligatoirement utiliser :
     - `crypto.timingSafeEqual` pour la vérification des codes PIN et mots de passe afin d'éliminer toute fuite d'information par canal auxiliaire (*timing attack*).
     - `crypto.createHmac('sha256', secret)` pour la génération et validation des jetons de session cryptographiques.

---

## 8. Herméticité SQL PostgREST (`supabase/migrations/*.sql`) (Règle 8)

1. **Principe du Moindre Privilège PostgREST** :
   - Tout fichier de migration SQL (`supabase/migrations/*.sql`) doit confiner strictement les permissions exposées à l'API PostgREST publique.
2. **Interdiction Formelle des Droits `anon` sur les Soumissions** :
   - Aucun fichier `.sql` ne doit accorder `GRANT SELECT` ou `GRANT ALL` au rôle `anon` sur une table contenant des soumissions, devoirs, copies ou résolutions d'apprenants (tables dont le nom inclut `submissions`, `attempts`, `answers`, `copies`, `resolutions`).
   - Règle SQL standard :
     ```sql
     -- Accès exclusif au serveur (service_role)
     GRANT ALL ON tip.sf_lab_submissions TO service_role;
     REVOKE ALL ON tip.sf_lab_submissions FROM anon, authenticated;
     ```

---

## 9. Audit Automatique Obligatoire Avant Commit

Avant de valider ou commiter tout changement sur ce dépôt :
```bash
npm run security:check
```
ou directement :
```bash
npx tsx scripts/lib/shan-security-validator.ts
```

> [!WARNING]
> Tout échec du validateur de sécurité (`exit 1`) bloque impérativement la livraison. Aucune modification ne doit être poussée en production avec une anomalie de sécurité non résolue.
