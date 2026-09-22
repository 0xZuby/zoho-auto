import { unauthorized, forbidden } from '../lib/http-error.js';

/**
 * Populates `req.user` from the signed session cookie when present. Does
 * NOT reject unauthenticated requests by itself — use `requireAuth` /
 * `requireRole` on routes that need to enforce it. This split lets a route
 * (like the public form submission endpoints) run without any session.
 */
export function attachUser(sessionManager, userRepository) {
  return async (req, _res, next) => {
    try {
      const cookieValue = req.cookies?.[sessionManager.cookieName];
      const userId = sessionManager.resolve(cookieValue);
      req.user = userId ? await userRepository.findById(userId) : null;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireAuth(req, _res, next) {
  if (!req.user) return next(unauthorized());
  next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
}
