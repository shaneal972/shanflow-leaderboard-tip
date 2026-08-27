import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'klf_admin_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 heures

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || 'klf_secret_session_key_formateur_jarry_2026!';
}

function getExpectedPassword(): string {
  return process.env.ADMIN_PASSWORD || 'klf_admin_2026';
}

/**
 * Valide le mot de passe formateur en temps constant (anti timing-attacks).
 */
export function validateAdminPassword(password: string): boolean {
  const expected = getExpectedPassword();
  if (password.length !== expected.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}

/**
 * Génère un jeton de session signé HMAC-SHA256.
 */
export function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const secret = getSecretKey();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Vérifie la validité cryptographique et l'expiration du jeton.
 */
export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Vérification expiration (24h)
  const now = Date.now();
  if (now - timestamp > SESSION_DURATION_MS || timestamp > now + 60000) {
    return false;
  }

  // Vérification de la signature HMAC
  const secret = getSecretKey();
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(timestampStr)
    .digest('hex');

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Vérifie si la requête actuelle dispose d'une session formateur valide.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    return verifyAdminToken(sessionCookie?.value);
  } catch {
    return false;
  }
}

/**
 * Enregistre le cookie de session sécurisé.
 */
export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = generateAdminToken();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60, // 24h en secondes
  });
}

/**
 * Supprime le cookie de session (déconnexion).
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
