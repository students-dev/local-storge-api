/**
 * Tests for Local Storage API v1.0.0
 * Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi
 * License: MIT
 */

const { LocalStorageAPI, useStore, StorageError } = require('../src/main');

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(() => ({
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
    result: {
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          put: jest.fn(() => ({ onsuccess: null, onerror: null })),
          get: jest.fn(() => ({ onsuccess: null, onerror: null })),
          delete: jest.fn(() => ({ onsuccess: null, onerror: null })),
          clear: jest.fn(() => ({ onsuccess: null, onerror: null })),
          getAll: jest.fn(() => ({ onsuccess: null, onerror: null })),
          getAllKeys: jest.fn(() => ({ onsuccess: null, onerror: null }))
        }))
      }))
    }
  }))
};

global.indexedDB = mockIndexedDB;

// Mock LocalStorage
const mockLocalStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.localStorage = mockLocalStorage;

describe('LocalStorageAPI', () => {
  let storage;

  beforeEach(() => {
    storage = new LocalStorageAPI();
    jest.clearAllMocks();
  });

  test('should save and load a value', async () => {
    await storage.save('key1', 'value1');
    const value = await storage.load('key1');
    expect(value).toBe('value1');
  });

  test('should handle complex data types', async () => {
    const data = { a: 1, b: [2, 3], c: new Map([['d', 4]]) };
    await storage.save('complex', data);
    const retrieved = await storage.load('complex');
    expect(retrieved).toEqual(data);
  });

  test('should delete a value', async () => {
    await storage.save('key1', 'value1');
    await storage.delete('key1');
    const value = await storage.load('key1');
    expect(value).toBeNull();
  });

  test('should clear all values', async () => {
    await storage.save('key1', 'value1');
    await storage.save('key2', 'value2');
    await storage.reset();
    expect(await storage.load('key1')).toBeNull();
    expect(await storage.load('key2')).toBeNull();
  });

  test('should check if key exists', async () => {
    await storage.save('key1', 'value1');
    expect(await storage.exists('key1')).toBe(true);
    expect(await storage.exists('key2')).toBe(false);
  });

  test('should return count', async () => {
    await storage.save('key1', 'value1');
    await storage.save('key2', 'value2');
    const count = await storage.count();
    expect(count).toBe(2);
  });

  test('should return all data', async () => {
    await storage.save('key1', 'value1');
    await storage.save('key2', 'value2');
    const all = await storage.all();
    expect(all).toEqual({ key1: 'value1', key2: 'value2' });
  });

  test('should support batch operations', async () => {
    await storage.saveMany([['key1', 'value1'], ['key2', 'value2']]);
    const values = await storage.loadMany(['key1', 'key2']);
    expect(values).toEqual({ key1: 'value1', key2: 'value2' });

    await storage.deleteMany(['key1']);
    expect(await storage.exists('key1')).toBe(false);
  });

  test('should export and import JSON', async () => {
    await storage.save('key1', 'value1');
    const json = await storage.exportJSON();
    expect(typeof json).toBe('string');

    const newStorage = new LocalStorageAPI();
    await newStorage.importJSON(json);
    expect(await newStorage.load('key1')).toBe('value1');
  });

  test('should report supports', () => {
    const supports = storage.supports();
    expect(supports).toHaveProperty('indexedDB');
    expect(supports).toHaveProperty('localStorage');
    expect(supports).toHaveProperty('memory');
    expect(supports).toHaveProperty('current');
  });

  test('should handle snapshots', async () => {
    await storage.save('snap1', 'value1');
    await storage.saveSnapshot('test-snap');
    await storage.save('snap1', 'value2');

    const snapshots = storage.listSnapshots();
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].name).toBe('test-snap');

    await storage.loadSnapshot('test-snap');
    expect(await storage.load('snap1')).toBe('value1');
  });

  test('should support querying', async () => {
    await storage.save('user1', { name: 'Alice', age: 25 });
    await storage.save('user2', { name: 'Bob', age: 30 });

    const results = await storage.query()
      .filter((value) => value.age > 26)
      .execute();

    expect(results).toHaveProperty('user2');
    expect(results.user2.age).toBe(30);
  });

  test('should provide metrics', async () => {
    await storage.save('metrics1', 'value1');
    await storage.load('metrics1');

    const metrics = storage.getMetrics();
    expect(metrics.reads).toBeGreaterThan(0);
    expect(metrics.writes).toBeGreaterThan(0);
  });

  test('should support export formats', async () => {
    await storage.save('format1', 'value1');
    const jsonExport = await storage.exportAs('json');
    expect(typeof jsonExport).toBe('string');
    expect(JSON.parse(jsonExport)).toHaveProperty('format1');
  });

  test('should handle audit logs', async () => {
    await storage.save('audit1', 'value1');
    const auditLog = storage.getAuditLog();
    expect(auditLog).toHaveLength(1);
    expect(auditLog[0].action).toBe('set');
  });

  test('should support namespacing', () => {
    const nsStorage = useStore('test');
    expect(nsStorage.namespace).toBe('test');
  });

  test('should emit events', async () => {
    const mockCallback = jest.fn();
    storage.on('change', mockCallback);

    await storage.save('event1', 'value1');
    expect(mockCallback).toHaveBeenCalledWith({ key: 'event1', value: 'value1', action: 'set' });
  });

  test('should run benchmark', async () => {
    const results = await storage.benchmark(10); // Small number for test
    expect(results).toHaveProperty('write');
    expect(results).toHaveProperty('read');
    expect(typeof results.write.avg).toBe('number');
    expect(typeof results.read.avg).toBe('number');
  });

  test('should freeze and unfreeze', () => {
    storage.freeze();
    expect(Object.isFrozen(storage)).toBe(true);

    const unfrozen = storage.unfreeze();
    expect(unfrozen).toBeInstanceOf(LocalStorageAPI);
  });
});