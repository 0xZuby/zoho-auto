import { randomUUID, createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE = 'onboarding_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Minimal signed, server-side session store for the auditor/admin portal.
 *
 * The cookie only carries an opaque, HMAC-signed session id. All session
 * state (which user, which role, expiry) lives server-side in memory, so a
 * tampered or forged cookie value can never grant access: the signature
 * check fails, or the id simply isn't present in the store.
 *
 * A single-process in-memory Map is an intentional MVP simplification (see
 * PRD "AI Dependency: None" / small internal tool scope). Restarting the API
 * process signs everyone out, which is acceptable for this workflow.
 */
export function createSessionManager(secret) {
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET must be set to a random string of at least 16 characters.');
  }
  const sessions = new Map();

  function sign(sessionId) {
    return createHmac('sha256', secret).update(sessionId).digest('hex');
  }

  function serializeCookieValue(sessionId) {
    return `${sessionId}.${sign(sessionId)}`;
  }

  function parseCookieValue(cookieValue) {
    if (!cookieValue || typeof cookieValue !== 'string') return null;
    const separatorIndex = cookieValue.lastIndexOf('.');
    if (separatorIndex === -1) return null;
    const sessionId = cookieValue.slice(0, separatorIndex);
    const signature = cookieValue.slice(separatorIndex + 1);
    const expectedSignature = sign(sessionId);
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    if (signatureBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;
    return sessionId;
  }

  function purgeExpired() {
    const now = Date.now();
    for (const [id, session] of sessions) {
      if (session.expiresAt <= now) sessions.delete(id);
    }
  }

  return {
    cookieName: SESSION_COOKIE,

    create(userId) {
      purgeExpired();
      const sessionId = randomUUID();
      sessions.set(sessionId, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
      return serializeCookieValue(sessionId);
    },

    resolve(cookieValue) {
      const sessionId = parseCookieValue(cookieValue);
      if (!sessionId) return null;
      const session = sessions.get(sessionId);
      if (!session) return null;
      if (session.expiresAt <= Date.now()) {
        sessions.delete(sessionId);
        return null;
      }
      // Sliding expiration: an active user stays signed in.
      session.expiresAt = Date.now() + SESSION_TTL_MS;
      return session.userId;
    },

    destroy(cookieValue) {
      const sessionId = parseCookieValue(cookieValue);
      if (sessionId) sessions.delete(sessionId);
    },

    cookieOptions(isProduction) {
      return {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: SESSION_TTL_MS,
        path: '/',
      };
    },
  };
}
