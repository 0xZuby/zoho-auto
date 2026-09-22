import { HttpError } from '../lib/http-error.js';

export function errorHandler(logger = console) {
  // eslint-disable-next-line no-unused-vars
  return (error, req, res, _next) => {
    if (error instanceof HttpError) {
      const body = { error: error.message };
      if (error.errors) body.errors = error.errors;
      if (error.code) body.code = error.code;
      res.status(error.status).json(body);
      return;
    }

    logger.error('[unhandled error]', error);
    res.status(500).json({ error: 'An unexpected server error occurred.', code: 'INTERNAL_ERROR' });
  };
}
