// examples/plain-js.js
// Plain JavaScript Example
// Author & Founder: Ramkrishna Bhatt V (Milagres PU College, Kallianpur, Udupi)

const { LocalStorageAPI, StorageNamespace } = require('@students-dev/local-storage-api');

// Basic usage
const storage = new LocalStorageAPI();

async function basicExample() {
  // Store different data types
  await storage.set('user', {
    name: 'Alice',
    profile: new Map([['theme', 'dark']]),
    avatar: await fetch('/avatar.jpg').then(r => r.blob())
  });

  // Retrieve data
  const user = await storage.get('user');
  console.log('User:', user);

  // TTL support
  await storage.set('temp', 'expires soon', { ttl: 300 }); // 5 minutes

  // Batch operations
  await storage.setMany([
    ['setting1', 'value1'],
    ['setting2', 'value2']
  ]);

  // Namespacing
  const appStorage = StorageNamespace('myapp');
  await appStorage.set('config', { version: '1.0.0' });
}

// Advanced features
async function advancedExample() {
  const storage = new LocalStorageAPI({
    profile: 'ultra-fast',
    sync: { channel: 'my-app-sync' },
    debug: true
  });

  // Define a model
  storage.defineModel('Product', {
    name: { type: 'string', required: true },
    price: { type: 'number', required: true }
  });

  // Store with validation
  await storage.set('product1', {
    _model: 'Product',
    name: 'Widget',
    price: 29.99
  });

  // Querying
  const expensiveProducts = await storage.query({
    filter: (value) => value.price > 20
  });

  // Snapshots
  await storage.saveSnapshot('backup');
  await storage.clear();
  await storage.loadSnapshot('backup');

  // Metrics
  const metrics = storage.getMetrics();
  console.log('Storage metrics:', metrics);
}

module.exports = { basicExample, advancedExample };