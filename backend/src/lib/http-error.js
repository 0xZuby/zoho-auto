/**
 * A structured, expected application error. Route handlers throw this for
 * any client-facing failure (validation, not-found, conflict) and a single
 * error-handling middleware turns it into the right HTTP response shape.
 * Anything that is NOT an HttpError is treated as an unexpected server bug
 * and logged with detail that never reaches the client.
 */
export class HttpError extends Error {
  constructor(status, message, { errors, code } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

export function badRequest(message, errors) {
  return new HttpError(400, message, { errors, code: 'BAD_REQUEST' });
}

export function unprocessable(message, errors) {
  return new HttpError(422, message, { errors, code: 'VALIDATION_FAILED' });
}

export function unauthorized(message = 'Authentication required.') {
  return new HttpError(401, message, { code: 'UNAUTHORIZED' });
}

export function forbidden(message = 'You do not have permission to perform this action.') {
  return new HttpError(403, message, { code: 'FORBIDDEN' });
}

export function notFound(message = 'Resource not found.') {
  return new HttpError(404, message, { code: 'NOT_FOUND' });
}

export function conflict(message, errors) {
  return new HttpError(409, message, { errors, code: 'CONFLICT' });
}
