import 'server-only';

import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'drishyam_fallback_secret_change_in_production'
);

const ALGORITHM = 'HS256';
const COOKIE_NAME = 'drishyam_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 5; // 5 days

export { COOKIE_NAME, SESSION_DURATION_SECONDS };

export interface AdminPayload {
  email: string;
  role: string;
}

/**
 * Signs a JWT with the admin payload.
 */
export async function signAdminJwt(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
}

/**
 * Verifies a JWT and returns the admin payload, or null on failure.
 */
export async function verifyAdminJwt(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: [ALGORITHM] });
    if (typeof payload.role === 'string' && typeof payload.email === 'string') {
      return { email: payload.email, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Checks plain-text credentials against env vars.
 */
export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!adminEmail || !adminPassword) return false;
  return email.trim() === adminEmail && password === adminPassword;
}
