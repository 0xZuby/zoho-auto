import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../../src/lib/store.js';

/**
 * Creates a store backed by a fresh temporary directory and returns a
 * cleanup function. Every test using this helper gets a fully isolated
 * filesystem sandbox so tests can run in parallel without interfering with
 * each other or with a developer's real backend/data directory.
 */
export async function createTempStore() {
  const dir = await mkdtemp(join(tmpdir(), 'onboarding-test-'));
  const store = createStore(dir);
  return {
    store,
    dir,
    async cleanup() {
      await rm(dir, { recursive: true, force: true });
    },
  };
}
