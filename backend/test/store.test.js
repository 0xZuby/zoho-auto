import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createTempStore } from './helpers/temp-store.js';

describe('store (atomic JSON collection)', () => {
  test('insertOne assigns an id and findOne retrieves it back', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const collection = store.collection('widgets');
      const inserted = await collection.insertOne({ name: 'Widget A' });
      assert.ok(inserted.id);
      const found = await collection.findOne((doc) => doc.id === inserted.id);
      assert.equal(found.name, 'Widget A');
    } finally {
      await cleanup();
    }
  });

  test('find returns all documents matching a predicate', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const collection = store.collection('widgets');
      await collection.insertOne({ name: 'A', active: true });
      await collection.insertOne({ name: 'B', active: false });
      await collection.insertOne({ name: 'C', active: true });
      const active = await collection.find((doc) => doc.active);
      assert.equal(active.length, 2);
    } finally {
      await cleanup();
    }
  });

  test('updateOne mutates the matching document and persists it', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const collection = store.collection('widgets');
      const inserted = await collection.insertOne({ name: 'A', count: 0 });
      const updated = await collection.updateOne(
        (doc) => doc.id === inserted.id,
        (doc) => ({ ...doc, count: doc.count + 1 }),
      );
      assert.equal(updated.count, 1);
      const reloaded = await collection.findOne((doc) => doc.id === inserted.id);
      assert.equal(reloaded.count, 1);
    } finally {
      await cleanup();
    }
  });

  test('updateOne returns null when no document matches', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const collection = store.collection('widgets');
      const result = await collection.updateOne((doc) => doc.id === 'missing', (doc) => doc);
      assert.equal(result, null);
    } finally {
      await cleanup();
    }
  });

  test('serializes concurrent updates without losing an update (no lost-update race)', async () => {
    const { store, cleanup } = await createTempStore();
    try {
      const collection = store.collection('counters');
      const inserted = await collection.insertOne({ count: 0 });

      // Fire 25 concurrent increments; each must see the previous one's
      // result because the queue serializes read-modify-write cycles.
      await Promise.all(
        Array.from({ length: 25 }, () =>
          collection.updateOne(
            (doc) => doc.id === inserted.id,
            (doc) => ({ ...doc, count: doc.count + 1 }),
          ),
        ),
      );

      const final = await collection.findOne((doc) => doc.id === inserted.id);
      assert.equal(final.count, 25);
    } finally {
      await cleanup();
    }
  });

  test('data survives being reloaded from a fresh Collection instance pointed at the same file', async () => {
    const { store, dir, cleanup } = await createTempStore();
    try {
      const collection = store.collection('widgets');
      await collection.insertOne({ name: 'Persisted' });

      const { createStore } = await import('../src/lib/store.js');
      const reloadedStore = createStore(dir);
      const reloadedCollection = reloadedStore.collection('widgets');
      const all = await reloadedCollection.find(() => true);
      assert.equal(all.length, 1);
      assert.equal(all[0].name, 'Persisted');
    } finally {
      await cleanup();
    }
  });
});
