/**
 * LocalStorage Storage Layer
 * Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi
 * License: MIT
 */

class LocalStorageStorage {
  constructor(namespace = '') {
    this.namespace = namespace;
    this.prefix = `lsa_${this.namespace}_`;
  }

  async set(key, value, ttl = null) {
    const data = {
      value,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      ttl: ttl ? Date.now() + ttl * 1000 : null
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  }

  async get(key) {
    const item = localStorage.getItem(this.prefix + key);
    if (!item) return null;

    try {
      const data = JSON.parse(item);
      if (data.ttl && Date.now() > data.ttl) {
        this.remove(key);
        return null;
      }
      return data.value;
    } catch (e) {
      return null;
    }
  }

  async remove(key) {
    localStorage.removeItem(this.prefix + key);
  }

  async clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  async keys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }
    return keys;
  }

  async has(key) {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  async size() {
    const keys = await this.keys();
    return keys.length;
  }

  async exportAll() {
    const data = {};
    const keys = await this.keys();
    for (const key of keys) {
      const value = await this.get(key);
      if (value !== null) {
        data[key] = value;
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
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = LocalStorageStorage;