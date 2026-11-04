/**
 * ==============================================================================
 * SHAN SECURITY VALIDATOR (DevSecOps Zéro-Trust)
 * Projet : klf-leaderboard-tip (Next.js 16 App Router & Supabase)
 * ==============================================================================
 * 
 * Scanner statique de sécurité vérifiant :
 * 1. [NO_CLIENT_SECRETS] : Zéro secret, variable serveur ou PIN en dur dans "use client".
 * 2. [NO_DANGEROUS_EVAL_XSS] : Zéro dangerouslySetInnerHTML, eval(), new Function().
 * 3. [NO_COMMAND_INJECTION] : Zéro child_process ou injection shell dans le code applicatif.
 * 4. [API_MUTATION_SECURITY] : Routes API POST/PUT/DELETE sécurisées (try/catch + validation + auth).
 * 5. [PATH_TRAVERSAL_PROTECTION] : Protection stricte contre path traversal (path.basename, no '..').
 * 6. [FILE_UPLOAD_INTEGRITY] : Validation d'extension et limitation de taille sur uploads/buffers.
 * 7. [SERVER_ACTIONS_IDOR_HMAC] : Verrouillage anti-IDOR Server Actions & intégrité HMAC (timingSafeEqual).
 * 8. [POSTGREST_SQL_HERMETICITY] : Zéro GRANT SELECT/ALL au rôle anon sur les tables de soumissions.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SecurityIssue {
  ruleId: string;
  ruleTitle: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  file: string;
  line: number;
  message: string;
  snippet?: string;
  recommendation: string;
}

export interface SecurityAuditReport {
  filesScanned: number;
  passed: boolean;
  issues: SecurityIssue[];
  ruleStats: Record<string, { title: string; passed: boolean; count: number }>;
}

const RULES = {
  NO_CLIENT_SECRETS: {
    id: 'NO_CLIENT_SECRETS',
    title: 'Sanctuarisation des secrets & PINs (Anti-Client-Leak)',
    severity: 'CRITICAL' as const,
  },
  NO_DANGEROUS_EVAL_XSS: {
    id: 'NO_DANGEROUS_EVAL_XSS',
    title: 'Bannissement XSS & Code Dynamique (eval/Function/dangerouslySetInnerHTML)',
    severity: 'CRITICAL' as const,
  },
  NO_COMMAND_INJECTION: {
    id: 'NO_COMMAND_INJECTION',
    title: 'Protection Injection Commandes Shell (child_process)',
    severity: 'CRITICAL' as const,
  },
  API_MUTATION_SECURITY: {
    id: 'API_MUTATION_SECURITY',
    title: 'Sécurisation Routes API POST/PUT/DELETE (try-catch, validation, auth)',
    severity: 'HIGH' as const,
  },
  PATH_TRAVERSAL_PROTECTION: {
    id: 'PATH_TRAVERSAL_PROTECTION',
    title: 'Protection Traversée de Répertoire (Path Traversal / path.basename)',
    severity: 'HIGH' as const,
  },
  FILE_UPLOAD_INTEGRITY: {
    id: 'FILE_UPLOAD_INTEGRITY',
    title: 'Intégrité Uploads & Fichiers (limite de taille et whitelist d\'extension)',
    severity: 'MEDIUM' as const,
  },
  SERVER_ACTIONS_IDOR_HMAC: {
    id: 'SERVER_ACTIONS_IDOR_HMAC',
    title: 'Verrouillage Anti-IDOR Server Actions & Intégrité HMAC',
    severity: 'CRITICAL' as const,
  },
  POSTGREST_SQL_HERMETICITY: {
    id: 'POSTGREST_SQL_HERMETICITY',
    title: 'Herméticité SQL PostgREST (supabase/migrations/*.sql)',
    severity: 'CRITICAL' as const,
  },
};

/**
 * Parcourt récursivement un dossier et retourne tous les fichiers .ts et .tsx
 */
function getSourceFiles(dir: string, baseDir: string = dir): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === '.git' ||
        entry.name === 'dist' ||
        entry.name === 'build'
      ) {
        continue;
      }
      results.push(...getSourceFiles(fullPath, baseDir));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Parcourt récursivement un dossier et retourne tous les fichiers .sql
 */
function getSqlFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getSqlFiles(fullPath));
    } else if (entry.name.endsWith('.sql')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Découpe un contenu en lignes avec index 1-based
 */
function getLines(content: string): string[] {
  return content.split(/\r?\n/);
}

/**
 * Supprime les commentaires mono et multi-lignes pour éviter les faux-positifs
 */
function stripComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/\/\/.*$/gm, (m) => ' '.repeat(m.length));
}

/**
 * Vérifie si une ligne se trouve dans un commentaire
 */
function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('//') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*') ||
    trimmed.endsWith('*/')
  );
}

/**
 * Exécute l'audit complet du codebase
 */
export async function runSecurityAudit(targetDir?: string): Promise<SecurityAuditReport> {
  const root = targetDir || process.cwd();
  const srcDir = path.join(root, 'src');
  const appDir = path.join(root, 'app');

  const filesToScan: string[] = [];
  if (fs.existsSync(srcDir)) filesToScan.push(...getSourceFiles(srcDir, root));
  if (fs.existsSync(appDir)) filesToScan.push(...getSourceFiles(appDir, root));

  const issues: SecurityIssue[] = [];

  const ruleStats: Record<string, { title: string; passed: boolean; count: number }> = {};
  for (const [key, rule] of Object.entries(RULES)) {
    ruleStats[key] = { title: rule.title, passed: true, count: 0 };
  }

  const recordIssue = (issue: SecurityIssue) => {
    issues.push(issue);
    if (ruleStats[issue.ruleId]) {
      ruleStats[issue.ruleId].passed = false;
      ruleStats[issue.ruleId].count++;
    }
  };

  // =========================================================================
  // RÈGLE 7A : [SERVER_ACTIONS_IDOR_HMAC] — Intégrité Cryptographique HMAC & Timing-Safe
  // =========================================================================
  const studentAuthPath = path.join(root, 'src', 'lib', 'studentAuth.ts');
  const adminAuthPath = path.join(root, 'src', 'lib', 'adminAuth.ts');

  if (!fs.existsSync(studentAuthPath)) {
    recordIssue({
      ruleId: RULES.SERVER_ACTIONS_IDOR_HMAC.id,
      ruleTitle: RULES.SERVER_ACTIONS_IDOR_HMAC.title,
      severity: RULES.SERVER_ACTIONS_IDOR_HMAC.severity,
      file: 'src/lib/studentAuth.ts',
      line: 1,
      message: 'Module d\'authentification apprenant introuvable (src/lib/studentAuth.ts).',
      recommendation:
        'Créez src/lib/studentAuth.ts avec les gardes de session signés HMAC et vérification en temps constant.',
    });
  } else {
    const content = fs.readFileSync(studentAuthPath, 'utf-8');
    if (!content.includes('timingSafeEqual') || !content.includes('createHmac')) {
      recordIssue({
        ruleId: RULES.SERVER_ACTIONS_IDOR_HMAC.id,
        ruleTitle: RULES.SERVER_ACTIONS_IDOR_HMAC.title,
        severity: RULES.SERVER_ACTIONS_IDOR_HMAC.severity,
        file: 'src/lib/studentAuth.ts',
        line: 1,
        message: 'src/lib/studentAuth.ts doit obligatoirement utiliser timingSafeEqual et createHmac.',
        snippet: 'timingSafeEqual / createHmac',
        recommendation:
          'Utilisez crypto.timingSafeEqual pour les PINs et crypto.createHmac pour signer les tokens.',
      });
    }
  }

  if (!fs.existsSync(adminAuthPath)) {
    recordIssue({
      ruleId: RULES.SERVER_ACTIONS_IDOR_HMAC.id,
      ruleTitle: RULES.SERVER_ACTIONS_IDOR_HMAC.title,
      severity: RULES.SERVER_ACTIONS_IDOR_HMAC.severity,
      file: 'src/lib/adminAuth.ts',
      line: 1,
      message: 'Module d\'authentification formateur introuvable (src/lib/adminAuth.ts).',
      recommendation:
        'Créez src/lib/adminAuth.ts avec les gardes de session formateur signés HMAC et vérification timingSafeEqual.',
    });
  } else {
    const content = fs.readFileSync(adminAuthPath, 'utf-8');
    if (!content.includes('timingSafeEqual') || !content.includes('createHmac')) {
      recordIssue({
        ruleId: RULES.SERVER_ACTIONS_IDOR_HMAC.id,
        ruleTitle: RULES.SERVER_ACTIONS_IDOR_HMAC.title,
        severity: RULES.SERVER_ACTIONS_IDOR_HMAC.severity,
        file: 'src/lib/adminAuth.ts',
        line: 1,
        message: 'src/lib/adminAuth.ts doit obligatoirement utiliser timingSafeEqual et createHmac.',
        snippet: 'timingSafeEqual / createHmac',
        recommendation:
          'Utilisez crypto.timingSafeEqual pour les mots de passe et crypto.createHmac pour signer les tokens.',
      });
    }
  }

  for (const filePath of filesToScan) {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const relPath = path.relative(root, filePath).replace(/\\/g, '/');
    const lines = getLines(rawContent);
    const cleanContent = stripComments(rawContent);

    const isClientComponent = /^\s*['"]use client['"]/m.test(rawContent);
    const isApiRoute = relPath.includes('app/api/') && relPath.endsWith('route.ts');
    const isServerAction = /^\s*['"]use server['"]/m.test(rawContent);

    // =========================================================================
    // RÈGLE 1 : [NO_CLIENT_SECRETS]
    // =========================================================================
    if (isClientComponent) {
      const sensitiveKeys = [
        'SUPABASE_SERVICE_ROLE_KEY',
        'ADMIN_PASSWORD',
        'ADMIN_SESSION_SECRET',
        'STUDENT_SESSION_SECRET',
        'KLF_WEBHOOK_BEARER_TOKEN',
      ];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isCommentLine(line)) continue;

        for (const secretKey of sensitiveKeys) {
          if (line.includes(secretKey)) {
            recordIssue({
              ruleId: RULES.NO_CLIENT_SECRETS.id,
              ruleTitle: RULES.NO_CLIENT_SECRETS.title,
              severity: RULES.NO_CLIENT_SECRETS.severity,
              file: relPath,
              line: i + 1,
              message: `Variable secrète serveur "${secretKey}" référencée dans un composant client.`,
              snippet: line.trim(),
              recommendation:
                'Déplacez cette logique côté serveur (Server Component, API Route ou Server Action). Ne jamais exposer de secret au navigateur.',
            });
          }
        }

        // Détection d'imports serveurs interdits sur le client
        if (
          /from\s+['"][^'"]*\/supabase\/server['"]/.test(line) ||
          /from\s+['"][^'"]*\/lib\/adminAuth['"]/.test(line)
        ) {
          recordIssue({
            ruleId: RULES.NO_CLIENT_SECRETS.id,
            ruleTitle: RULES.NO_CLIENT_SECRETS.title,
            severity: RULES.NO_CLIENT_SECRETS.severity,
            file: relPath,
            line: i + 1,
            message: `Import direct d'un module serveur sensible dans un composant client.`,
            snippet: line.trim(),
            recommendation:
              'Ne jamais importer de module d\'authentification serveur ou service_role dans un Client Component.',
          });
        }

        // Détection de codes PIN codés en dur dans le client
        if (
          /(?:pin_code|expectedPin)\s*[:=]\s*['"]\d{4,6}['"]/i.test(line) ||
          /setPin\(['"]\d{4,6}['"]\)/.test(line)
        ) {
          recordIssue({
            ruleId: RULES.NO_CLIENT_SECRETS.id,
            ruleTitle: RULES.NO_CLIENT_SECRETS.title,
            severity: RULES.NO_CLIENT_SECRETS.severity,
            file: relPath,
            line: i + 1,
            message: `Code PIN codé en dur détecté dans un composant client.`,
            snippet: line.trim(),
            recommendation:
              'Ne jamais pré-remplir ni exposer de code PIN en dur dans l\'UI client. L\'utilisateur doit saisir son propre code.',
          });
        }
      }
    }

    // =========================================================================
    // RÈGLE 2 : [NO_DANGEROUS_EVAL_XSS]
    // =========================================================================
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isCommentLine(line)) continue;

      if (line.includes('dangerouslySetInnerHTML')) {
        recordIssue({
          ruleId: RULES.NO_DANGEROUS_EVAL_XSS.id,
          ruleTitle: RULES.NO_DANGEROUS_EVAL_XSS.title,
          severity: RULES.NO_DANGEROUS_EVAL_XSS.severity,
          file: relPath,
          line: i + 1,
          message: 'Utilisation interdite de dangerouslySetInnerHTML.',
          snippet: line.trim(),
          recommendation:
            'Utilisez le rendu React déclaratif natif ou sanitisez strictement le HTML en amont.',
        });
      }

      if (/\beval\s*\(/.test(line)) {
        recordIssue({
          ruleId: RULES.NO_DANGEROUS_EVAL_XSS.id,
          ruleTitle: RULES.NO_DANGEROUS_EVAL_XSS.title,
          severity: RULES.NO_DANGEROUS_EVAL_XSS.severity,
          file: relPath,
          line: i + 1,
          message: 'Utilisation formellement interdite de eval().',
          snippet: line.trim(),
          recommendation: 'Supprimez eval() au profit de fonctions logiques déterministes.',
        });
      }

      if (/\bnew\s+Function\s*\(/.test(line)) {
        recordIssue({
          ruleId: RULES.NO_DANGEROUS_EVAL_XSS.id,
          ruleTitle: RULES.NO_DANGEROUS_EVAL_XSS.title,
          severity: RULES.NO_DANGEROUS_EVAL_XSS.severity,
          file: relPath,
          line: i + 1,
          message: 'Utilisation formellement interdite du constructeur new Function().',
          snippet: line.trim(),
          recommendation: 'Évaluez les expressions via des fonctions prédéfinies pures.',
        });
      }
    }

    // =========================================================================
    // RÈGLE 3 : [NO_COMMAND_INJECTION]
    // =========================================================================
    if (relPath.startsWith('src/app/') || relPath.startsWith('app/')) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isCommentLine(line)) continue;

        if (
          /from\s+['"]child_process['"]/.test(line) ||
          /require\(['"]child_process['"]\)/.test(line) ||
          /\b(?:exec|execSync|spawn)\s*\(/.test(line)
        ) {
          recordIssue({
            ruleId: RULES.NO_COMMAND_INJECTION.id,
            ruleTitle: RULES.NO_COMMAND_INJECTION.title,
            severity: RULES.NO_COMMAND_INJECTION.severity,
            file: relPath,
            line: i + 1,
            message: 'Appel child_process interdit dans le code applicatif web.',
            snippet: line.trim(),
            recommendation:
              'Le code applicatif Next.js (SSR, actions, API) ne doit pas exécuter de binaire système hôte. Réservez cela aux scripts CLI d\'administration.',
          });
        }
      }
    }

    // =========================================================================
    // RÈGLE 4 : [API_MUTATION_SECURITY]
    // =========================================================================
    if (isApiRoute) {
      const mutationMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

      for (const method of mutationMethods) {
        const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(`, 'g');
        if (methodRegex.test(cleanContent)) {
          // 1. Vérification try / catch
          const hasTryCatch = cleanContent.includes('try') && cleanContent.includes('catch');
          if (!hasTryCatch) {
            recordIssue({
              ruleId: RULES.API_MUTATION_SECURITY.id,
              ruleTitle: RULES.API_MUTATION_SECURITY.title,
              severity: RULES.API_MUTATION_SECURITY.severity,
              file: relPath,
              line: 1,
              message: `La méthode ${method} dans ${relPath} ne comporte aucun bloc try/catch global.`,
              snippet: `export async function ${method}(...)`,
              recommendation:
                'Encapsulez la totalité de la méthode dans un bloc try/catch avec renvoi d\'un statut HTTP 500 propre.',
            });
          }

          // 2. Vérification contrôle d'accès / auth
          const hasAuthCheck =
            cleanContent.includes('isAdminAuthenticated') ||
            cleanContent.includes('isStudentAuthenticated') ||
            cleanContent.includes('getActiveTechnicianId') ||
            cleanContent.includes('authorization') ||
            cleanContent.includes('Authorization') ||
            cleanContent.includes('Bearer') ||
            cleanContent.includes('expectedToken');

          if (!hasAuthCheck) {
            recordIssue({
              ruleId: RULES.API_MUTATION_SECURITY.id,
              ruleTitle: RULES.API_MUTATION_SECURITY.title,
              severity: RULES.API_MUTATION_SECURITY.severity,
              file: relPath,
              line: 1,
              message: `La méthode de mutation ${method} dans ${relPath} ne vérifie aucune session ni jeton d'autorisation.`,
              snippet: `export async function ${method}(...)`,
              recommendation:
                'Vérifiez la session (isAdminAuthenticated, isStudentAuthenticated) ou le Bearer token avant tout traitement.',
            });
          }

          // 3. Vérification de validation des entrées si lecture JSON/formData
          const readsBody =
            cleanContent.includes('.json(') || cleanContent.includes('.formData(');
          if (readsBody) {
            const hasValidation =
              cleanContent.includes('safeParse') ||
              cleanContent.includes('parse(') ||
              cleanContent.includes('!ficheData') ||
              cleanContent.includes('!event_id') ||
              cleanContent.includes('if (!') ||
              cleanContent.includes('z.');

            if (!hasValidation) {
              recordIssue({
                ruleId: RULES.API_MUTATION_SECURITY.id,
                ruleTitle: RULES.API_MUTATION_SECURITY.title,
                severity: RULES.API_MUTATION_SECURITY.severity,
                file: relPath,
                line: 1,
                message: `La méthode ${method} lit une charge utile sans valider formellement ses entrées.`,
                snippet: `export async function ${method}(...)`,
                recommendation:
                  'Validez les entrées via Zod (safeParse) ou vérifiez la présence et le type de chaque champ attendu.',
              });
            }
          }
        }
      }
    }

    // =========================================================================
    // RÈGLE 5 : [PATH_TRAVERSAL_PROTECTION]
    // =========================================================================
    if (relPath.startsWith('src/app/') || relPath.startsWith('src/lib/')) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isCommentLine(line)) continue;

        if (
          /\bfs\.(?:readFileSync|readFile|existsSync|createReadStream)\s*\(/.test(line) &&
          !line.includes('process.cwd()') &&
          !line.includes('path.join') &&
          !line.includes('path.resolve')
        ) {
          // Appel fs sans chemin absolu sanctuarisé
          if (/\b(?:req|request|searchParams|query|body)\b/.test(line)) {
            recordIssue({
              ruleId: RULES.PATH_TRAVERSAL_PROTECTION.id,
              ruleTitle: RULES.PATH_TRAVERSAL_PROTECTION.title,
              severity: RULES.PATH_TRAVERSAL_PROTECTION.severity,
              file: relPath,
              line: i + 1,
              message: 'Lecture directe de fichier avec paramètre d\'entrée non assaini.',
              snippet: line.trim(),
              recommendation:
                'Passez systématiquement le nom de fichier par path.basename() et concaténez-le à un dossier racine vérifié.',
            });
          }
        }

        // Vérification de concaténation suspecte avec .. dans path.join
        if (/path\.join\s*\([^)]*\.\./.test(line) && !line.includes('process.cwd()')) {
          recordIssue({
            ruleId: RULES.PATH_TRAVERSAL_PROTECTION.id,
            ruleTitle: RULES.PATH_TRAVERSAL_PROTECTION.title,
            severity: RULES.PATH_TRAVERSAL_PROTECTION.severity,
            file: relPath,
            line: i + 1,
            message: 'Segment ".." suspect détecté dans la résolution de chemin.',
            snippet: line.trim(),
            recommendation:
              'Évitez l\'usage dynamique de ".." qui expose aux risques de traversée de répertoires.',
          });
        }
      }
    }

    // =========================================================================
    // RÈGLE 6 : [FILE_UPLOAD_INTEGRITY]
    // =========================================================================
    if (
      relPath.includes('Auditor') ||
      relPath.includes('upload') ||
      relPath.includes('download')
    ) {
      if (cleanContent.includes('arrayBuffer(') && isClientComponent) {
        const hasSizeCheck =
          cleanContent.includes('.size') ||
          cleanContent.includes('file.size') ||
          cleanContent.includes('maxSize') ||
          cleanContent.includes('MAX_FILE_SIZE');

        const hasExtensionCheck =
          cleanContent.includes('.endsWith(') ||
          cleanContent.includes('.name') ||
          cleanContent.includes('xlsx');

        if (!hasSizeCheck || !hasExtensionCheck) {
          recordIssue({
            ruleId: RULES.FILE_UPLOAD_INTEGRITY.id,
            ruleTitle: RULES.FILE_UPLOAD_INTEGRITY.title,
            severity: RULES.FILE_UPLOAD_INTEGRITY.severity,
            file: relPath,
            line: 1,
            message: 'Manipulation de buffer uploadé sans vérification conjointe de taille et d\'extension.',
            snippet: relPath,
            recommendation:
              'Validez l\'extension de fichier autorisée et limitez la taille maximale du buffer (ex: file.size > 10 Mo).',
          });
        }
      }
    }

    // =========================================================================
    // RÈGLE 7B : [SERVER_ACTIONS_IDOR_HMAC] — Verrouillage Anti-IDOR Server Actions
    // =========================================================================
    const isAppActionFile = relPath.startsWith('src/app/') && /actions\.tsx?$/.test(relPath);
    if (isAppActionFile || isServerAction) {
      const performsMutation =
        (cleanContent.includes('supabaseServer') || cleanContent.includes('.from(')) &&
        (/\.(insert|update|upsert|delete)\s*\(/.test(cleanContent));

      if (performsMutation) {
        // Vérification de l'import d'un module d'auth
        const importsAuth =
          cleanContent.includes('studentAuth') || cleanContent.includes('adminAuth');

        // Vérification de l'appel d'un garde d'auth
        const callsAuthGuard =
          cleanContent.includes('isAdminAuthenticated') ||
          cleanContent.includes('isStudentAuthenticated') ||
          cleanContent.includes('getActiveTechnicianId') ||
          cleanContent.includes('verifyStudentSessionToken') ||
          cleanContent.includes('verifyAdminToken') ||
          cleanContent.includes('validateAdminPassword') ||
          cleanContent.includes('verifyPinTimingSafe');

        if (!importsAuth || !callsAuthGuard) {
          recordIssue({
            ruleId: RULES.SERVER_ACTIONS_IDOR_HMAC.id,
            ruleTitle: RULES.SERVER_ACTIONS_IDOR_HMAC.title,
            severity: RULES.SERVER_ACTIONS_IDOR_HMAC.severity,
            file: relPath,
            line: 1,
            message: `Server Action effectuant une mutation Supabase sans garde d'authentification anti-IDOR (${!importsAuth ? 'import studentAuth/adminAuth manquant' : 'aucun appel de vérification de session'}).`,
            snippet: relPath,
            recommendation:
              'Importez et appelez systématiquement isAdminAuthenticated(), isStudentAuthenticated() ou getActiveTechnicianId() pour vérifier l\'identité de l\'appelant côté serveur avant toute mutation.',
          });
        }
      }
    }
  }

  // =========================================================================
  // RÈGLE 8 : [POSTGREST_SQL_HERMETICITY] — Herméticité SQL PostgREST (supabase/migrations/*.sql)
  // =========================================================================
  const migrationsDir = path.join(root, 'supabase', 'migrations');
  const sqlFilesToScan = getSqlFiles(migrationsDir);

  for (const sqlPath of sqlFilesToScan) {
    const rawSql = fs.readFileSync(sqlPath, 'utf-8');
    const relSqlPath = path.relative(root, sqlPath).replace(/\\/g, '/');
    const cleanSql = rawSql
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/--.*$/gm, ' ');

    const sqlLines = rawSql.split(/\r?\n/);

    // Détection de clauses GRANT (SELECT|ALL) sur des tables de soumissions accordées à anon
    // Exemple sensible : submissions, attempts, answers, copies, devoirs, resolutions
    const sensitiveTablePattern = /(?:submissions|attempts|answers|copies|resolutions)/i;
    
    const statements = cleanSql.split(';');
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (!trimmed) continue;

      const grantMatch = trimmed.match(/GRANT\s+([^ON]+)\s+ON\s+(?:TABLE\s+)?([^\s]+)\s+TO\s+([^;]+)/i);
      if (grantMatch) {
        const privileges = grantMatch[1].trim().toUpperCase();
        const targetTable = grantMatch[2].trim();
        const recipients = grantMatch[3].trim().toLowerCase();

        const isSensitiveTable = sensitiveTablePattern.test(targetTable);
        const grantsAnon = recipients.split(/[,\s]+/).includes('anon');
        const isExcessivePrivilege = privileges.includes('ALL') || privileges.includes('SELECT');

        if (isSensitiveTable && grantsAnon && isExcessivePrivilege) {
          let lineNum = 1;
          for (let li = 0; li < sqlLines.length; li++) {
            if (sqlLines[li].includes(targetTable) && sqlLines[li].toLowerCase().includes('anon')) {
              lineNum = li + 1;
              break;
            }
          }

          recordIssue({
            ruleId: RULES.POSTGREST_SQL_HERMETICITY.id,
            ruleTitle: RULES.POSTGREST_SQL_HERMETICITY.title,
            severity: RULES.POSTGREST_SQL_HERMETICITY.severity,
            file: relSqlPath,
            line: lineNum,
            message: `Droit PostgREST excessif accordé au rôle "anon" sur la table sensible "${targetTable}" (${privileges}).`,
            snippet: trimmed.substring(0, 100),
            recommendation:
              `Révoquez tout droit au rôle anon sur ${targetTable} via REVOKE ALL ON ${targetTable} FROM anon; et réservez l'accès exclusivement à service_role.`,
          });
        }
      }
    }
  }

  const passed = issues.length === 0;
  return {
    filesScanned: filesToScan.length + sqlFilesToScan.length,
    passed,
    issues,
    ruleStats,
  };
}

/**
 * Affiche le rapport formaté dans la console avec tableau récapitulatif
 */
export function printSecurityReport(report: SecurityAuditReport): void {
  const BOLD = '\x1b[1m';
  const RESET = '\x1b[0m';
  const GREEN = '\x1b[32m';
  const RED = '\x1b[31m';
  const YELLOW = '\x1b[33m';
  const CYAN = '\x1b[36m';
  const GRAY = '\x1b[90m';

  console.log('\n' + '='.repeat(82));
  console.log(`${BOLD}${CYAN}  🛡️  [SHAN SECURITY VALIDATOR] • GARDE-FOU DEVSECOPS ZÉRO-TRUST${RESET}`);
  console.log(`${GRAY}  Dépôt : klf-leaderboard-tip | Standard : .agent/rules/security-hardening.md${RESET}`);
  console.log('='.repeat(82) + '\n');

  console.log(`${BOLD}TABLEAU RÉCAPITULATIF DES RÈGLES DE SÉCURITÉ :${RESET}\n`);
  console.log('┌─────┬───────────────────────────────────────────────────────────────┬──────────┬───────────┐');
  console.log('│ N°  │ Règle auditée                                                 │ Gravité  │ Statut    │');
  console.log('├─────┼───────────────────────────────────────────────────────────────┼──────────┼───────────┤');

  let idx = 1;
  for (const [key, stat] of Object.entries(report.ruleStats)) {
    const num = String(idx++).padStart(3, ' ');
    const titlePadded = stat.title.padEnd(61, ' ').substring(0, 61);
    const ruleInfo = (RULES as any)[key];
    const sev = (ruleInfo?.severity || 'HIGH').padEnd(8, ' ');
    const statusText = stat.passed
      ? `${GREEN}✔ PASS   ${RESET}`
      : `${RED}✘ FAIL(${stat.count})${RESET}`;

    console.log(`│ ${num} │ ${titlePadded} │ ${sev} │ ${statusText} │`);
  }
  console.log('└─────┴───────────────────────────────────────────────────────────────┴──────────┴───────────┘\n');

  if (report.issues.length > 0) {
    console.log(`${BOLD}${RED}DÉTAIL DES ANOMALIES DÉTECTÉES (${report.issues.length}) :${RESET}\n`);

    for (let i = 0; i < report.issues.length; i++) {
      const issue = report.issues[i];
      const badge =
        issue.severity === 'CRITICAL'
          ? `${RED}[CRITICAL]${RESET}`
          : issue.severity === 'HIGH'
          ? `${YELLOW}[HIGH]${RESET}`
          : `${CYAN}[MEDIUM]${RESET}`;

      console.log(`  ${i + 1}. ${badge} ${BOLD}${issue.ruleId}${RESET} — ${issue.file}:${issue.line}`);
      console.log(`     ${issue.message}`);
      if (issue.snippet) {
        console.log(`     ${GRAY}Extrait : ${issue.snippet}${RESET}`);
      }
      console.log(`     ${GREEN}→ Correctif : ${issue.recommendation}${RESET}\n`);
    }
  }

  console.log('-'.repeat(82));
  console.log(`  Fichiers scannés : ${report.filesScanned}`);
  console.log(`  Statut global    : ${report.passed ? `${GREEN}${BOLD}✔ 100% CONFORME (ZÉRO DÉFAUT)${RESET}` : `${RED}${BOLD}✘ REJETÉ (${report.issues.length} anomalie(s))${RESET}`}`);
  console.log('-'.repeat(82) + '\n');
}

/**
 * Point d'entrée direct en ligne de commande
 */
async function main() {
  const report = await runSecurityAudit();
  printSecurityReport(report);

  if (!report.passed) {
    console.error('\x1b[31m[SHAN SECURITY VALIDATOR] Échec de l\'audit de sécurité. Corrigez les anomalies ci-dessus avant de commiter.\x1b[0m\n');
    process.exit(1);
  } else {
    console.log('\x1b[32m[SHAN SECURITY VALIDATOR] Validation réussie avec succès. Aucune faiblesse détectée.\x1b[0m\n');
    process.exit(0);
  }
}

if (process.argv[1] && process.argv[1].endsWith('shan-security-validator.ts')) {
  main().catch((err) => {
    console.error('Erreur inattendue shan-security-validator:', err);
    process.exit(1);
  });
}
