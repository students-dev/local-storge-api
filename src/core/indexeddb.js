/**
 * IndexedDB Storage Layer
 * Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi
 * License: MIT
 */

class IndexedDBStorage {
  constructor(namespace = '') {
    this.namespace = namespace;
    this.dbName = `LocalStorageAPI_${namespace}`;
    this.db = null;
    this.ready = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('storage')) {
          const store = db.createObjectStore('storage', { keyPath: 'key' });
          store.createIndex('ttl', 'ttl', { unique: false });
        }
      };
    });
  }

  async waitForReady() {
    await this.ready;
  }

  async set(key, value, ttl = null) {
    await this.waitForReady();
    const data = {
      key,
      value,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      ttl: ttl ? Date.now() + ttl * 1000 : null
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(key) {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['storage'], 'readonly');
      const store = transaction.objectStore('storage');
      const request = store.get(key);

      request.onsuccess = () => {
        const data = request.result;
        if (!data) return resolve(null);

        if (data.ttl && Date.now() > data.ttl) {
          this.remove(key);
          return resolve(null);
        }

        resolve(data.value);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async remove(key) {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear() {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async keys() {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['storage'], 'readonly');
      const store = transaction.objectStore('storage');
      const request = store.getAllKeys();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }

  async size() {
    const keys = await this.keys();
    return keys.length;
  }

  async exportAll() {
    await this.waitForReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['storage'], 'readonly');
      const store = transaction.objectStore('storage');
      const request = store.getAll();

      request.onsuccess = () => {
        const data = {};
        request.result.forEach(item => {
          if (!item.ttl || Date.now() <= item.ttl) {
            data[item.key] = item.value;
          }
        });
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async importAll(data) {
    await this.waitForReady();
    const transaction = this.db.transaction(['storage'], 'readwrite');
    const store = transaction.objectStore('storage');

    for (const [key, value] of Object.entries(data)) {
      const item = {
        key,
        value,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
        ttl: null
      };
      store.put(item);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  supports() {
    return typeof indexedDB !== 'undefined';
  }
}

module.exports = IndexedDBStorage;