import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { unauthorized } from '../lib/http-error.js';

export function createAuthRouter({ userRepository, sessionManager, isProduction }) {
  const router = Router();

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const { email, password } = req.body ?? {};
      if (!email || !password) throw unauthorized('Email and password are required.');

      const user = await userRepository.verifyCredentials(email, password);
      if (!user) throw unauthorized('Invalid email or password.');

      const cookieValue = sessionManager.create(user.id);
      res.cookie(sessionManager.cookieName, cookieValue, sessionManager.cookieOptions(isProduction));
      res.json({ user: userRepository.toPublicUser(user) });
    }),
  );

  router.post('/logout', (req, res) => {
    const cookieValue = req.cookies?.[sessionManager.cookieName];
    if (cookieValue) sessionManager.destroy(cookieValue);
    res.clearCookie(sessionManager.cookieName, { path: '/' });
    res.status(204).end();
  });

  router.get('/me', (req, res) => {
    res.json({ user: req.user ? userRepository.toPublicUser(req.user) : null });
  });

  return router;
}
