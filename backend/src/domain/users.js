import { randomUUID } from 'node:crypto';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { notFound, conflict } from '../lib/http-error.js';

export const ROLE = Object.freeze({
  AUDITOR: 'AUDITOR',
  ADMINISTRATOR: 'ADMINISTRATOR',
  HR: 'HR',
});

/**
 * Auditor/Administrator accounts (PRD "User Types" -> Auditor, Administrator).
 * Employees never authenticate; they only ever hold a one-time submission
 * link, so there is no employee record here.
 */
export function createUserRepository(store) {
  const collection = store.collection('users');

  async function findByEmail(email) {
    const normalized = String(email ?? '').trim().toLowerCase();
    return collection.findOne((user) => user.email === normalized);
  }

  async function findById(id) {
    return collection.findOne((user) => user.id === id);
  }

  async function create({ name, email, password, role }) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await findByEmail(normalizedEmail);
    if (existing) throw conflict('A user with this email already exists.');

    const passwordHash = await hashPassword(password);
    return collection.insertOne({
      id: randomUUID(),
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
    });
  }

  async function verifyCredentials(email, password) {
    const user = await findByEmail(email);
    if (!user) return null;
    const isValid = await verifyPassword(password, user.passwordHash);
    return isValid ? user : null;
  }

  async function list() {
    const users = await collection.find(() => true);
    return users.map(toPublicUser);
  }

  async function ensureExists(id) {
    const user = await findById(id);
    if (!user) throw notFound('User not found.');
    return user;
  }

  function toPublicUser(user) {
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  return { findByEmail, findById, create, verifyCredentials, list, ensureExists, toPublicUser };
}
