import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

function getStudentSessionSecret(): string {
  return process.env.STUDENT_SESSION_SECRET || 'klf_student_pin_secret_key_antilles_2026!';
}

/**
 * Nom standardisé du cookie de session d'un apprenant.
 */
export function getStudentCookieName(studentId: string): string {
  return `tip_student_session_${studentId}`;
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
 * Active également la session passeport associée pour une UX fluide.
 */
export async function setTechnicianSession(studentId: string): Promise<void> {
  const cookieStore = await cookies();
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
 * Clôture la prise de poste du technicien et supprime le cookie.
 */
export async function clearTechnicianSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TECHNICIAN_COOKIE_NAME);
}
