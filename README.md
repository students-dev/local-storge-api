# Local Storage API v1.0.0

**Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi**

A comprehensive, production-ready client-side storage API with advanced features, automatic fallbacks, and developer tooling. Store any data type including Objects, Arrays, Blobs, Files, Buffers, TypedArrays, JSON, numbers, strings, booleans, Maps, and Sets.

## Installation

```bash
npm install @students-dev/local-storage-api
```

## Quick Start

```javascript
const { LocalStorageAPI, useStore } = require('@students-dev/local-storage-api');

const storage = new LocalStorageAPI();

// Simple API
await storage.save('user', { name: 'Alice', age: 25 });
const user = await storage.load('user');
await storage.delete('user');

// Namespaced storage
const appStorage = useStore('myapp');
await appStorage.save('config', { theme: 'dark' });

// Batch operations
await storage.saveMany([
  ['setting1', 'value1'],
  ['setting2', 'value2']
]);
const values = await storage.loadMany(['setting1', 'setting2']);

// Export/Import
const data = await storage.exportJSON();
await storage.importJSON(data);
```

## Features

### Core Features
- **Automatic Fallbacks**: IndexedDB → LocalStorage → In-memory
- **Any Data Type**: Supports all JavaScript data types with auto-serialization
- **TTL Support**: Time-to-live for automatic expiration
- **Batch Operations**: Efficient bulk operations
- **Namespacing**: Isolated storage scopes
- **Event System**: Real-time change notifications
- **TypeScript Support**: Full type definitions included

### Advanced Features
- **Compression**: lz-string and MessagePack serialization
- **Storage Profiles**: ultra-fast, max-compression, low-memory, safe-mode
- **Snapshots**: Save/load/compare storage states
- **Query Engine**: SQL-like querying with filter, sort, limit
- **Metrics & Monitoring**: Read/write counts, latency tracking
- **Audit Logging**: Complete operation history
- **Cross-tab Sync**: BroadcastChannel real-time synchronization
- **Encryption Hooks**: User-provided crypto integration
- **Migration System**: Versioned schema migrations
- **Benchmark API**: Performance testing utilities

## API Reference

### Simple API

```javascript
// Core operations
await storage.save(key, value, options?)
await storage.load(key) // -> value or null
await storage.delete(key)
await storage.reset() // Clear all

// Utility
await storage.exists(key) // -> boolean
await storage.count() // -> number
await storage.all() // -> { key: value, ... }

// Batch
await storage.saveMany([[key1, value1], [key2, value2]])
await storage.loadMany([key1, key2]) // -> { key1: value1, ... }
await storage.deleteMany([key1, key2])

// Import/Export
await storage.exportJSON() // -> JSON string
await storage.importJSON(jsonString)
await storage.exportFile() // Browser download
```

### Advanced API

```javascript
// Direct access
await storage.set(key, value, { ttl: 3600 })
await storage.get(key)
await storage.remove(key)
await storage.clear()

// Querying
const results = await storage.query()
  .filter(value => value.price > 100)
  .sort((a, b) => a.price - b.price)
  .limit(10)
  .execute()

// Snapshots
await storage.saveSnapshot('backup')
await storage.loadSnapshot('backup')
const diff = storage.compareSnapshots('snap1', 'snap2')

// Metrics
const metrics = storage.getMetrics()
// { reads: 10, writes: 5, avgReadLatency: 2.3, ... }

// Events
storage.on('change', (event) => {
  console.log('Storage changed:', event);
});
```

### Configuration

```javascript
const storage = new LocalStorageAPI({
  namespace: 'myapp',
  profile: 'max-compression', // ultra-fast, max-compression, low-memory, safe-mode
  debug: true,
  safeMode: false,
  hooks: {
    beforeSet: (key, value) => {
      // Validate or transform
      return value;
    }
  },
  encryption: {
    preWriteEncrypt: (data) => encrypt(data),
    postReadDecrypt: (data) => decrypt(data)
  },
  sync: {
    channel: new BroadcastChannel('my-app-sync')
  }
});
```

## Browser Support

- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+

## CLI Tool

```bash
# Install globally
npm install -g @students-dev/local-storage-api

# Commands
local-storage-api inspect          # Show storage stats
local-storage-api export data.json # Export to file
local-storage-api import data.json # Import from file
local-storage-api visualize        # Data type charts
local-storage-api benchmark        # Performance test
```

## VS Code Extension

Install the "Local Storage API" extension for advanced debugging:

- **Storage Explorer**: Tree view of all storage
- **Inspector Panel**: Real-time storage inspection
- **Metrics Dashboard**: Performance monitoring
- **Snapshot Management**: Save/compare/restore states
- **Diff Viewer**: Side-by-side snapshot comparison

## Examples

See the `examples/` directory:

- `examples/plain-js.js` - Vanilla JavaScript
- `examples/react.js` - React hooks
- `examples/vue.js` - Vue composables
- `examples/svelte.js` - Svelte stores

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint

# Format code
npm run format
```

## Architecture

The API implements a layered storage architecture:

1. **IndexedDB Layer**: Primary async storage with high capacity
2. **LocalStorage Layer**: Sync fallback with browser persistence
3. **Memory Layer**: In-memory fallback for basic functionality

Automatic fallback ensures reliability across all environments.

## Migration Guide

### From v0.x to v1.0.0

The v1.0.0 introduces breaking changes:

- `store()` renamed to `save()`
- `retrieve()` renamed to `load()`
- New advanced features available
- Improved error handling

```javascript
// Old v0.x
await store('key', 'value');
const value = await retrieve('key');

// New v1.0.0
await storage.save('key', 'value');
const value = await storage.load('key');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Copyright

© 2025 Ramkrishna Bhatt V (Milagres PU College, Kallianpur, Udupi). All rights reserved.
