/**
 * In-Memory Storage Layer
 * Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi
 * License: MIT
 */

class MemoryStorage {
  constructor(namespace = '') {
    this.namespace = namespace;
    this.data = new Map();
  }

  async set(key, value, ttl = null) {
    const data = {
      value,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      ttl: ttl ? Date.now() + ttl * 1000 : null
    };
    this.data.set(key, data);
  }

  async get(key) {
    const item = this.data.get(key);
    if (!item) return null;

    if (item.ttl && Date.now() > item.ttl) {
      this.data.delete(key);
      return null;
    }

    return item.value;
  }

  async remove(key) {
    this.data.delete(key);
  }

  async clear() {
    this.data.clear();
  }

  async keys() {
    return Array.from(this.data.keys());
  }

  async has(key) {
    const item = this.data.get(key);
    if (!item) return false;

    if (item.ttl && Date.now() > item.ttl) {
      this.data.delete(key);
      return false;
    }

    return true;
  }

  async size() {
    // Clean expired items
    for (const [key, item] of this.data) {
      if (item.ttl && Date.now() > item.ttl) {
        this.data.delete(key);
      }
    }
    return this.data.size;
  }

  async exportAll() {
    const data = {};
    for (const [key, item] of this.data) {
      if (!item.ttl || Date.now() <= item.ttl) {
        data[key] = item.value;
      }
    }
    return data;
  }

  async importAll(data) {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value);
    }
  }

  supports() {
    return true; // Always available
  }
}

module.exports = MemoryStorage;