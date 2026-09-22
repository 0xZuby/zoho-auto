import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * A tiny append-safe, crash-safe JSON document store.
 *
 * Each collection is one JSON file on disk (an array of documents). Writes go
 * through a temp file + rename so a crash mid-write can never leave a
 * half-written, corrupted collection file. All reads/writes for a single
 * collection are serialized through an in-process queue so concurrent
 * requests can't interleave and lose an update ("lost update" race).
 *
 * This is intentionally simple: it is sized for an internal onboarding tool
 * with dozens of requests a day, not a high-throughput production database.
 * Swapping this module for a real database later only requires the calling
 * code (which talks to `Collection` instances) to keep using the same
 * `find/findOne/insertOne/updateOne` surface.
 */

class Collection {
  constructor(filePath) {
    this.filePath = filePath;
    this.queue = Promise.resolve();
    this.cache = null;
  }

  #enqueue(task) {
    const result = this.queue.then(task, task);
    // Swallow rejections in the chain itself so one failed operation doesn't
    // permanently poison the queue for subsequent unrelated operations.
    this.queue = result.then(() => undefined, () => undefined);
    return result;
  }

  async #load() {
    if (this.cache) return this.cache;
    try {
      const raw = await readFile(this.filePath, 'utf8');
      this.cache = raw.trim() ? JSON.parse(raw) : [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.cache = [];
      } else {
        throw error;
      }
    }
    return this.cache;
  }

  async #persist(documents) {
    this.cache = documents;
    await mkdir(dirname(this.filePath), { recursive: true });
    const tmpPath = `${this.filePath}.${randomUUID()}.tmp`;
    await writeFile(tmpPath, JSON.stringify(documents, null, 2), 'utf8');
    await rename(tmpPath, this.filePath);
  }

  find(predicate = () => true) {
    return this.#enqueue(async () => {
      const documents = await this.#load();
      return documents.filter(predicate).map(cloneDocument);
    });
  }

  findOne(predicate) {
    return this.#enqueue(async () => {
      const documents = await this.#load();
      const found = documents.find(predicate);
      return found ? cloneDocument(found) : null;
    });
  }

  insertOne(document) {
    return this.#enqueue(async () => {
      const documents = await this.#load();
      const withId = { id: document.id ?? randomUUID(), ...document };
      documents.push(withId);
      await this.#persist(documents);
      return cloneDocument(withId);
    });
  }

  updateOne(predicate, updater) {
    return this.#enqueue(async () => {
      const documents = await this.#load();
      const index = documents.findIndex(predicate);
      if (index === -1) return null;
      const next = updater(cloneDocument(documents[index]));
      documents[index] = next;
      await this.#persist(documents);
      return cloneDocument(next);
    });
  }

  count(predicate = () => true) {
    return this.#enqueue(async () => {
      const documents = await this.#load();
      return documents.filter(predicate).length;
    });
  }
}

function cloneDocument(document) {
  return JSON.parse(JSON.stringify(document));
}

export function createStore(dataDir) {
  const collections = new Map();
  return {
    collection(name) {
      if (!collections.has(name)) {
        collections.set(name, new Collection(join(dataDir, `${name}.json`)));
      }
      return collections.get(name);
    },
  };
}
