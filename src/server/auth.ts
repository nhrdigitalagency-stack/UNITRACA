import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type Database from 'better-sqlite3';
import type { UserProfile, UserRole } from '../types/unitraca.ts';

export const SESSION_COOKIE_NAME = 'unitraca_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

export function hashSessionToken(token: string): string {
  const secret = process.env.SESSION_SECRET || 'unitraca-dev-ephemeral-secret';
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

export function createSession(db: Database.Database, userId: number): { rawToken: string; expiresAt: string } {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  db.prepare('INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)').run(
    userId,
    tokenHash,
    expiresAt
  );

  return { rawToken, expiresAt };
}

export function deleteSessionByToken(db: Database.Database, rawToken: string): void {
  const tokenHash = hashSessionToken(rawToken);
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

export function setSessionCookie(res: Response, rawToken: string, req: Request): void {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(rawToken)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (isSecure) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}

export interface AuthenticatedRequest extends Request {
  currentUser?: UserProfile | null;
}

export function attachCurrentUser(db: Database.Database) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    req.currentUser = null;
    const cookies = parseCookies(req.headers.cookie);
    const rawToken = cookies[SESSION_COOKIE_NAME];
    if (!rawToken) {
      return next();
    }

    const tokenHash = hashSessionToken(rawToken);
    const row = db
      .prepare(`
        SELECT u.id, u.email, u.full_name, u.preferred_name, u.country, u.city, u.role, u.preferred_language, u.is_active, u.created_at, s.expires_at
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?
      `)
      .get(tokenHash) as
      | (Omit<UserProfile, 'is_active'> & { is_active: number; expires_at: string })
      | undefined;

    if (!row) {
      return next();
    }

    if (new Date(row.expires_at).getTime() < Date.now() || row.is_active !== 1) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
      return next();
    }

    req.currentUser = {
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      preferred_name: row.preferred_name,
      country: row.country,
      city: row.city,
      role: row.role,
      preferred_language: row.preferred_language,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
    };

    next();
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.currentUser) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).json({ error: 'Authentification requise.' });
    }
    if (!allowedRoles.includes(req.currentUser.role)) {
      return res.status(403).json({ error: 'Permissions insuffisantes pour cette action.' });
    }
    next();
  };
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(keyPrefix: string, maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (bucket.count >= maxRequests) {
      return res.status(429).json({ error: 'Trop de requêtes. Veuillez patienter quelques instants.' });
    }
    bucket.count += 1;
    next();
  };
}

export function writeAuditLog(
  db: Database.Database,
  actor: UserProfile | null | undefined,
  action: string,
  entityType: string,
  entityId: string | number,
  details: Record<string, unknown> = {}
): void {
  db.prepare(
    'INSERT INTO audit_logs (actor_user_id, actor_email, action, entity_type, entity_id, details_json) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(actor?.id ?? null, actor?.email ?? 'system', action, entityType, String(entityId), JSON.stringify(details));
}
