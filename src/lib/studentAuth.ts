import { cookies, headers } from 'next/headers';
import crypto from 'crypto';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
const STUDENT_COOKIE_PREFIX = 'tip_student_session_';

// Garde anti-brute-force léger côté serveur (par couple IP + cible)
const PIN_MAX_ATTEMPTS = 5;
const PIN_LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes
const pinAttemptsStore = new Map<string, { count: number; lockedUntil: number }>();

function getStudentSessionSecret(): string {
  if (process.env.STUDENT_SESSION_SECRET) {
    return process.env.STUDENT_SESSION_SECRET;
  }
  // Dérivation cryptographique stricte depuis un secret serveur existant (jamais une chaîne publique Git en prod)
  const masterSeed =
    process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (masterSeed) {
    return crypto
      .createHmac('sha256', masterSeed)
      .update('klf-tip-student-session-v1')
      .digest('hex');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Configuration critique manquante : STUDENT_SESSION_SECRET requis en production.');
  }
  return 'dev_only_local_klf_student_secret';
}

/**
 * Compare deux codes PIN en temps constant (SHA-256 + timingSafeEqual) pour éviter toute fuite temporelle.
 */
export function verifyPinTimingSafe(enteredPin: string, expectedPin: string): boolean {
  const hashEntered = crypto.createHash('sha256').update(enteredPin.trim()).digest();
  const hashExpected = crypto.createHash('sha256').update(expectedPin.trim()).digest();
  return crypto.timingSafeEqual(hashEntered, hashExpected);
}

/**
 * Extrait une empreinte IP client pour le rate-limiting des tentatives de code PIN.
 */
export async function getClientRateLimitKey(targetScope: string): Promise<string> {
  try {
    const hdrs = await headers();
    const forwarded = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim();
    const realIp = hdrs.get('x-real-ip')?.trim();
    const ip = forwarded || realIp || 'local';
    return `${ip}:${targetScope}`;
  } catch {
    return `local:${targetScope}`;
  }
}

export function checkPinRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = pinAttemptsStore.get(key);
  if (!entry) return { allowed: true };

  if (entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.lockedUntil - now) / 1000)),
    };
  }

  if (entry.lockedUntil !== 0 && entry.lockedUntil <= now) {
    pinAttemptsStore.delete(key);
  }
  return { allowed: true };
}

export function recordPinFailure(key: string): void {
  const now = Date.now();
  const current = pinAttemptsStore.get(key);
  const nextCount = (current && current.lockedUntil <= now ? current.count : 0) + 1;
  pinAttemptsStore.set(key, {
    count: nextCount,
    lockedUntil: nextCount >= PIN_MAX_ATTEMPTS ? now + PIN_LOCKOUT_MS : 0,
  });
}

export function resetPinFailures(key: string): void {
  pinAttemptsStore.delete(key);
}

/**
 * Nom standardisé du cookie de session d'un apprenant.
 */
export function getStudentCookieName(studentId: string): string {
  return `${STUDENT_COOKIE_PREFIX}${studentId}`;
}

/**
 * Génère un jeton de session étudiant signé HMAC-SHA256.
 */
export function generateStudentSessionToken(studentId: string): string {
  const timestamp = Date.now().toString();
  const secret = getStudentSessionSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${studentId}:${timestamp}`)
    .digest('hex');

  return `${timestamp}.${signature}`;
}

/**
 * Vérifie l'authenticité et la validité d'un jeton de session étudiant.
 */
export function verifyStudentSessionToken(studentId: string, token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Vérification d'expiration (30 jours)
  const now = Date.now();
  if (now - timestamp > SESSION_DURATION_MS || timestamp > now + 60000) {
    return false;
  }

  // Vérification de signature HMAC (temps constant)
  const secret = getStudentSessionSecret();
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${studentId}:${timestampStr}`)
    .digest('hex');

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Vérifie si l'apprenant actuel est authentifié pour le passeport donné.
 */
export async function isStudentAuthenticated(studentId: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookieName = getStudentCookieName(studentId);
    const token = cookieStore.get(cookieName)?.value;
    return verifyStudentSessionToken(studentId, token);
  } catch {
    return false;
  }
}

/**
 * Dépose le cookie de session sécurisé pour l'apprenant (30 jours).
 */
export async function setStudentSession(studentId: string): Promise<void> {
  const cookieStore = await cookies();
  const token = generateStudentSessionToken(studentId);
  const cookieName = getStudentCookieName(studentId);

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  });
}

/**
 * Supprime le cookie de session de l'apprenant.
 */
export async function clearStudentSession(studentId: string): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getStudentCookieName(studentId);
  cookieStore.delete(cookieName);
}

const TECHNICIAN_COOKIE_NAME = 'tip_technician_session';

export function getTechnicianCookieName(): string {
  return TECHNICIAN_COOKIE_NAME;
}

/**
 * Dépose le cookie de session du technicien connecté sur le poste (30 jours).
 * Purge au préalable toute session passeport résiduelle d'un autre apprenant sur un poste partagé.
 */
export async function setTechnicianSession(studentId: string): Promise<void> {
  const cookieStore = await cookies();

  // Purger tout cookie de passeport appartenant à un autre apprenant (sécurité salle informatique)
  for (const existingCookie of cookieStore.getAll()) {
    if (
      existingCookie.name.startsWith(STUDENT_COOKIE_PREFIX) &&
      existingCookie.name !== getStudentCookieName(studentId)
    ) {
      cookieStore.delete(existingCookie.name);
    }
  }

  const timestamp = Date.now().toString();
  const secret = getStudentSessionSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${studentId}:${timestamp}`)
    .digest('hex');

  const token = `${studentId}.${timestamp}.${signature}`;

  cookieStore.set(TECHNICIAN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  });

  // Déposer également le cookie de passeport individuel
  await setStudentSession(studentId);
}

/**
 * Récupère l'ID de l'apprenant/technicien actuellement connecté sur la machine.
 * Retourne null si aucune session valide n'est active.
 */
export async function getActiveTechnicianId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TECHNICIAN_COOKIE_NAME)?.value;
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [studentId, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return null;

    const now = Date.now();
    if (now - timestamp > SESSION_DURATION_MS || timestamp > now + 60000) {
      return null;
    }

    const secret = getStudentSessionSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${studentId}:${timestampStr}`)
      .digest('hex');

    if (signature.length !== expectedSignature.length) {
      return null;
    }

    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    return isValid ? studentId : null;
  } catch {
    return null;
  }
}

/**
 * Clôture la prise de poste du technicien et supprime à la fois le cookie global
 * et tout cookie de passeport individuel ouvert sur ce navigateur (sécurité salle informatique).
 */
export async function clearTechnicianSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TECHNICIAN_COOKIE_NAME);
  for (const existingCookie of cookieStore.getAll()) {
    if (existingCookie.name.startsWith(STUDENT_COOKIE_PREFIX)) {
      cookieStore.delete(existingCookie.name);
    }
  }
}
