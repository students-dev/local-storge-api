/**
 * Local Storage API v1.0.0
 * Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi
 * License: MIT
 */

const IndexedDBStorage = require('./core/indexeddb');
const LocalStorageStorage = require('./core/localstorage');
const MemoryStorage = require('./core/memory');
const { EventEmitter } = require('events');

// Compression and serialization
const lzString = require('lz-string');
const { encode: msgpackEncode, decode: msgpackDecode } = require('@msgpack/msgpack');

// Error classes
class StorageError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
  }
}

class QuotaExceededError extends StorageError {
  constructor() {
    super('Storage quota exceeded', 'QUOTA_EXCEEDED');
  }
}

class MigrationError extends StorageError {
  constructor(message) {
    super(message, 'MIGRATION_ERROR');
  }
}

class SerializationError extends StorageError {
  constructor(message) {
    super(message, 'SERIALIZATION_ERROR');
  }
}

// Compression engines
const CompressionEngines = {
  'lz-string': {
    compress: (data) => lzString.compressToUTF16(data),
    decompress: (data) => lzString.decompressFromUTF16(data)
  },
  'none': {
    compress: (data) => data,
    decompress: (data) => data
  }
};

// Serialization strategies
const SerializationStrategies = {
  json: {
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data)
  },
  msgpack: {
    serialize: (data) => msgpackEncode(data),
    deserialize: (data) => msgpackDecode(data)
  }
};

// Storage profiles
const StorageProfiles = {
  'ultra-fast': {
    compression: 'none',
    serialization: 'json',
    adaptive: false,
    maxRetries: 1
  },
  'max-compression': {
    compression: 'lz-string',
    serialization: 'msgpack',
    adaptive: true,
    maxRetries: 3
  },
  'low-memory': {
    compression: 'lz-string',
    serialization: 'json',
    adaptive: false,
    maxRetries: 1
  },
  'safe-mode': {
    compression: 'none',
    serialization: 'json',
    adaptive: false,
    maxRetries: 5
  }
};

// Main LocalStorageAPI class
class LocalStorageAPI extends EventEmitter {
  constructor(options = {}) {
    super();

    // Founder attribution
    this._founder = 'Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi';

    this.namespace = options.namespace || '';
    this.profile = StorageProfiles[options.profile] || StorageProfiles['safe-mode'];
    this.version = options.version || 1;

    // Advanced options
    this.debug = options.debug || false;
    this.safeMode = options.safeMode || false;
    this.hooks = options.hooks || {};
    this.encryption = options.encryption || null;
    this.sync = options.sync || null;

    // Internal state
    this.layers = [];
    this.currentLayer = null;
    this.cache = new Map();
    this.auditLog = [];
    this.operationHistory = [];
    this.snapshots = new Map();
    this.models = new Map();
    this.migrations = [];
    this.locks = new Map();
    this.metrics = {
      reads: 0,
      writes: 0,
      deletes: 0,
      readLatency: [],
      writeLatency: [],
      errors: []
    };

    this.initLayers();
  }

  initLayers() {
    const isNodeJS = typeof window === 'undefined';

    if (!isNodeJS) {
      this.layers.push(new IndexedDBStorage(this.namespace));
      this.layers.push(new LocalStorageStorage(this.namespace));
    }
    this.layers.push(new MemoryStorage(this.namespace));

    // Select layer based on profile and availability
    for (const layer of this.layers) {
      if (layer.supports()) {
        this.currentLayer = layer;
        break;
      }
    }

    if (!this.currentLayer) {
      this.currentLayer = this.layers[this.layers.length - 1]; // Memory fallback
    }
  }

  // Core API - Simple methods
  async save(key, value, options = {}) {
    return this.set(key, value, options);
  }

  async load(key) {
    return this.get(key);
  }

  async delete(key) {
    return this.remove(key);
  }

  async reset() {
    return this.clear();
  }

  async exists(key) {
    return this.has(key);
  }

  async count() {
    return this.size();
  }

  async all() {
    return this.exportAll();
  }

  saveMany(items, options = {}) {
    return this.setMany(items, options);
  }

  loadMany(keys) {
    return this.getMany(keys);
  }

  deleteMany(keys) {
    return this.deleteMany(keys);
  }

  exportJSON() {
    return this.exportAs('json');
  }

  exportFile() {
    // In browser, this would trigger download
    return this.exportJSON();
  }

  importJSON(json) {
    return this.importFrom(json, 'json');
  }

  supports() {
    const result = {
      indexedDB: false,
      localStorage: false,
      memory: false,
      current: this.currentLayer.constructor.name
    };

    this.layers.forEach(layer => {
      const name = layer.constructor.name.toLowerCase();
      if (name.includes('indexeddb')) result.indexedDB = layer.supports();
      else if (name.includes('localstorage')) result.localStorage = layer.supports();
      else if (name.includes('memory')) result.memory = layer.supports();
    });

    return result;
  }

  // Advanced API implementation
  async set(key, value, options = {}) {
    const startTime = Date.now();

    try {
      // Hooks
      if (this.hooks.beforeSet) {
        const result = await this.hooks.beforeSet(key, value, options);
        if (result === false) return;
        if (result !== undefined) value = result;
      }

      // Safe mode confirmation
      if (this.safeMode && options.force !== true) {
        // In real implementation, this would show confirmation
        this.log('warn', `Safe mode: Confirming set operation for key ${key}`);
      }

      // Serialize
      const serialized = await this.serialize(value, options);

      // Store
      await this.currentLayer.set(key, serialized, options.ttl);

      // Update cache
      this.cache.set(key, { value, timestamp: Date.now() });

      // Audit log
      this.auditLog.push({
        action: 'set',
        key,
        timestamp: Date.now(),
        size: JSON.stringify(value).length
      });

      // History for undo
      this.operationHistory.push({
        type: 'set',
        key,
        value,
        oldValue: await this.get(key) // This might be inefficient
      });

      // Metrics
      this.metrics.writes++;
      this.metrics.writeLatency.push(Date.now() - startTime);

      // Sync
      if (this.sync) {
        this.broadcast('set', { key, value });
      }

      this.emit('change', { key, value, action: 'set' });

      if (this.hooks.afterSet) {
        await this.hooks.afterSet(key, value, options);
      }

    } catch (error) {
      this.metrics.errors.push(error);
      this.emit('error', { action: 'set', key, error });
      throw error;
    }
  }

  async get(key) {
    const startTime = Date.now();

    try {
      // Check cache
      const cached = this.cache.get(key);
      if (cached && (Date.now() - cached.timestamp) < (this.cacheTTL || 300000)) {
        this.metrics.reads++;
        return cached.value;
      }

      const serialized = await this.currentLayer.get(key);
      if (!serialized) return null;

      const value = await this.deserialize(serialized);

      // Update cache
      this.cache.set(key, { value, timestamp: Date.now() });

      this.metrics.reads++;
      this.metrics.readLatency.push(Date.now() - startTime);

      return value;

    } catch (error) {
      this.metrics.errors.push(error);
      this.emit('error', { action: 'get', key, error });
      throw error;
    }
  }

  async remove(key) {
    try {
      if (this.hooks.beforeDelete) {
        const result = await this.hooks.beforeDelete(key);
        if (result === false) return;
      }

      const oldValue = await this.get(key);
      await this.currentLayer.remove(key);

      // Update cache
      this.cache.delete(key);

      // Audit log
      this.auditLog.push({
        action: 'delete',
        key,
        timestamp: Date.now()
      });

      // History
      this.operationHistory.push({
        type: 'delete',
        key,
        oldValue
      });

      // Sync
      if (this.sync) {
        this.broadcast('delete', { key });
      }

      this.emit('delete', { key, action: 'delete' });

      if (this.hooks.afterDelete) {
        await this.hooks.afterDelete(key);
      }

    } catch (error) {
      this.metrics.errors.push(error);
      this.emit('error', { action: 'delete', key, error });
      throw error;
    }
  }

  async clear() {
    try {
      if (this.hooks.beforeClear) {
        const result = await this.hooks.beforeClear();
        if (result === false) return;
      }

      await this.currentLayer.clear();

      // Clear cache
      this.cache.clear();

      // Audit log
      this.auditLog.push({
        action: 'clear',
        timestamp: Date.now()
      });

      // Sync
      if (this.sync) {
        this.broadcast('clear', {});
      }

      this.emit('clear', { action: 'clear' });

      if (this.hooks.afterClear) {
        await this.hooks.afterClear();
      }

    } catch (error) {
      this.metrics.errors.push(error);
      this.emit('error', { action: 'clear', error });
      throw error;
    }
  }

  async has(key) {
    return await this.currentLayer.has(key);
  }

  async size() {
    return await this.currentLayer.size();
  }

  async keys() {
    return await this.currentLayer.keys();
  }

  async exportAll() {
    const data = await this.currentLayer.exportAll();
    const deserialized = {};
    for (const [key, value] of Object.entries(data)) {
      deserialized[key] = await this.deserialize(value);
    }
    return deserialized;
  }

  async importAll(data) {
    this.cache.clear();
    const serialized = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = await this.serialize(value);
    }
    await this.currentLayer.importAll(serialized);
    this.emit('import', { action: 'import' });
  }

  // Serialization with compression
  async serialize(value, options = {}) {
    const strategy = options.serialization || this.profile.serialization;
    const compression = options.compression || this.profile.compression;

    let data = value;

    // Handle special types
    if (value instanceof Map) {
      data = { __type: 'Map', value: Array.from(value.entries()) };
    } else if (value instanceof Set) {
      data = { __type: 'Set', value: Array.from(value) };
    } else if (value instanceof Date) {
      data = { __type: 'Date', value: value.toISOString() };
    } else if (value instanceof Blob) {
      data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ __type: 'Blob', value: reader.result, type: value.type });
        reader.readAsDataURL(value);
      });
    }

    // Serialize
    const serializer = SerializationStrategies[strategy];
    if (!serializer) throw new SerializationError(`Unknown serialization strategy: ${strategy}`);

    let serialized = serializer.serialize(data);

    // Compress
    const compressor = CompressionEngines[compression];
    if (compressor) {
      serialized = compressor.compress(serialized);
    }

    // Encrypt
    if (this.encryption && this.encryption.preWriteEncrypt) {
      serialized = await this.encryption.preWriteEncrypt(serialized);
    }

    return serialized;
  }

  async deserialize(data) {
    if (!data) return data;

    // Decrypt
    if (this.encryption && this.encryption.postReadDecrypt) {
      data = await this.encryption.postReadDecrypt(data);
    }

    // Decompress
    const compressor = CompressionEngines[this.profile.compression];
    if (compressor) {
      data = compressor.decompress(data);
    }

    // Deserialize
    const serializer = SerializationStrategies[this.profile.serialization];
    let parsed = serializer.deserialize(data);

    // Handle special types
    if (typeof parsed === 'object' && parsed !== null && parsed.__type) {
      switch (parsed.__type) {
        case 'Map':
          parsed = new Map(parsed.value);
          break;
        case 'Set':
          parsed = new Set(parsed.value);
          break;
        case 'Date':
          parsed = new Date(parsed.value);
          break;
        case 'Blob':
          const blobData = parsed.value.split(',')[1];
          parsed = new Blob([Uint8Array.from(atob(blobData), c => c.charCodeAt(0))], { type: parsed.type });
          break;
      }
    }

    return parsed;
  }

  // Batch operations
  async setMany(items, options = {}) {
    for (const [key, value] of items) {
      await this.set(key, value, options);
    }
  }

  async getMany(keys) {
    const results = {};
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    return results;
  }

  async deleteMany(keys) {
    for (const key of keys) {
      await this.remove(key);
    }
  }

  // Query API
  query(options = {}) {
    return {
      filter: (fn) => this.query({ ...options, filter: fn }),
      sort: (fn) => this.query({ ...options, sort: fn }),
      limit: (n) => this.query({ ...options, limit: n }),
      take: (n) => this.query({ ...options, take: n }),
      execute: async () => {
        const allData = await this.exportAll();
        let results = Object.entries(allData);

        if (options.filter) {
          results = results.filter(([key, value]) => options.filter(value, key));
        }

        if (options.sort) {
          results.sort(options.sort);
        }

        if (options.limit || options.take) {
          const limit = options.limit || options.take;
          results = results.slice(0, limit);
        }

        return Object.fromEntries(results);
      }
    };
  }

  // Snapshots
  async saveSnapshot(name) {
    const data = await this.exportAll();
    this.snapshots.set(name, {
      data,
      timestamp: Date.now(),
      version: this.version
    });
  }

  async loadSnapshot(name) {
    const snapshot = this.snapshots.get(name);
    if (!snapshot) throw new Error('Snapshot not found');
    await this.importAll(snapshot.data);
  }

  listSnapshots() {
    return Array.from(this.snapshots.keys()).map(name => ({
      name,
      ...this.snapshots.get(name)
    }));
  }

  compareSnapshots(name1, name2) {
    const s1 = this.snapshots.get(name1);
    const s2 = this.snapshots.get(name2);
    if (!s1 || !s2) throw new Error('Snapshot not found');

    const diff = { added: [], removed: [], changed: [] };
    const allKeys = new Set([...Object.keys(s1.data), ...Object.keys(s2.data)]);

    for (const key of allKeys) {
      if (!(key in s1.data)) {
        diff.added.push(key);
      } else if (!(key in s2.data)) {
        diff.removed.push(key);
      } else if (JSON.stringify(s1.data[key]) !== JSON.stringify(s2.data[key])) {
        diff.changed.push(key);
      }
    }

    return diff;
  }

  // Export/Import formats
  async exportAs(format = 'json') {
    const data = await this.exportAll();
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'ndjson':
        return Object.entries(data).map(([k, v]) => JSON.stringify({ key: k, value: v })).join('\n');
      case 'msgpack':
        return msgpackEncode(data);
      default:
        return JSON.stringify(data);
    }
  }

  async importFrom(data, format = 'json') {
    let parsed;
    switch (format) {
      case 'json':
        parsed = JSON.parse(data);
        break;
      case 'ndjson':
        parsed = {};
        data.split('\n').forEach(line => {
          if (line.trim()) {
            const item = JSON.parse(line);
            parsed[item.key] = item.value;
          }
        });
        break;
      case 'msgpack':
        parsed = msgpackDecode(data);
        break;
      default:
        parsed = JSON.parse(data);
    }
    await this.importAll(parsed);
  }

  // Metrics
  getMetrics() {
    return {
      ...this.metrics,
      avgReadLatency: this.metrics.readLatency.length ?
        this.metrics.readLatency.reduce((a, b) => a + b, 0) / this.metrics.readLatency.length : 0,
      avgWriteLatency: this.metrics.writeLatency.length ?
        this.metrics.writeLatency.reduce((a, b) => a + b, 0) / this.metrics.writeLatency.length : 0
    };
  }

  // Audit log
  getAuditLog() {
    return this.auditLog;
  }

  // Logging
  log(level, message, namespace = 'storage') {
    if (!this.debug && level !== 'error') return;
    const logEntry = `[${namespace}] ${level.toUpperCase()}: ${message}`;
    console.log(logEntry);
  }

  // Sync
  broadcast(type, data) {
    if (this.sync && this.sync.channel) {
      this.sync.channel.postMessage({
        type,
        tabId: this.sync.tabId || 'unknown',
        timestamp: Date.now(),
        ...data
      });
    }
  }

  // Utility methods
  freeze() {
    Object.freeze(this);
  }

  unfreeze() {
    return new LocalStorageAPI({
      namespace: this.namespace,
      profile: this.profile,
      version: this.version
    });
  }

  // Benchmark
  async benchmark(iterations = 1000) {
    const results = {
      write: { total: 0, avg: 0 },
      read: { total: 0, avg: 0 }
    };

    // Write benchmark
    const writeStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      await this.set(`bench-write-${i}`, { data: Math.random() });
    }
    results.write.total = Date.now() - writeStart;
    results.write.avg = results.write.total / iterations;

    // Read benchmark
    const readStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      await this.get(`bench-write-${i}`);
    }
    results.read.total = Date.now() - readStart;
    results.read.avg = results.read.total / iterations;

    return results;
  }
}

// Factory function for namespaced instances
function useStore(namespace) {
  return new LocalStorageAPI({ namespace });
}

// Export
module.exports = {
  LocalStorageAPI,
  useStore,
  StorageError,
  QuotaExceededError,
  MigrationError,
  SerializationError
};