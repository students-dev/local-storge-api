# Storage Layers

**Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi**

## Layer Hierarchy

The Local Storage API implements a three-tier storage hierarchy with automatic fallback:

```
IndexedDB (Primary)
    ↓ (if unavailable)
LocalStorage (Fallback)
    ↓ (if unavailable)
Memory (Last Resort)
```

## IndexedDB Layer

### Overview
IndexedDB provides the primary storage mechanism with high capacity and async operations.

### Key Features
- **Capacity**: Typically 50MB+ per origin
- **Persistence**: Survives browser restarts and updates
- **Performance**: Indexed queries and efficient bulk operations
- **Transactions**: ACID-compliant operations
- **Async API**: Non-blocking operations

### Implementation Details
```javascript
// Database structure
const dbName = `LocalStorageAPI_${namespace}`;
const storeName = 'storage';

// Object store schema
{
  key: string,        // Primary key
  value: any,         // Serialized data
  createdAt: number,  // Creation timestamp
  updatedAt: number,  // Last update timestamp
  version: number,    // Schema version
  ttl: number | null  // Expiration timestamp
}
```

### Transaction Management
- Uses readwrite transactions for modifications
- Readonly transactions for queries
- Proper error handling and rollback on failure

### Limitations
- Complex API requiring careful error handling
- Not available in Web Workers without additional setup
- May require user permission in private browsing modes

## LocalStorage Layer

### Overview
LocalStorage provides synchronous fallback storage with browser-native persistence.

### Key Features
- **Simplicity**: Synchronous key-value API
- **Persistence**: Survives browser sessions
- **Compatibility**: Supported in all modern browsers
- **Performance**: Fast synchronous operations

### Implementation Details
```javascript
// Key structure
const prefix = `lsa_${namespace}_`;
const fullKey = prefix + userKey;

// Storage format
{
  "value": serializedData,
  "createdAt": timestamp,
  "updatedAt": timestamp,
  "version": 1,
  "ttl": null
}
```

### Data Handling
- JSON serialization for complex objects
- Base64 encoding for binary data (Blobs, TypedArrays)
- Automatic cleanup of expired entries on access

### Limitations
- **Capacity**: Limited to ~5-10MB per origin
- **Blocking**: Synchronous operations can freeze UI
- **Strings only**: All values must be serializable to strings

## Memory Layer

### Overview
In-memory storage provides basic functionality when persistent storage is unavailable.

### Key Features
- **Speed**: Instant operations with no I/O
- **Capacity**: Limited only by available RAM
- **Compatibility**: Works in any JavaScript environment
- **Type safety**: Native support for all JavaScript types

### Implementation Details
```javascript
// Internal structure
this.data = new Map();

// Entry format
{
  value: any,         // Original data (no serialization needed)
  createdAt: number,
  updatedAt: number,
  version: number,
  ttl: number | null
}
```

### Data Management
- Direct storage of JavaScript values
- Lazy expiration checking
- Automatic cleanup of expired entries

### Limitations
- **Persistence**: Data lost on page reload
- **Sharing**: Not shared between tabs or windows
- **Memory**: Consumes browser memory

## Layer Selection Logic

### Automatic Detection
```javascript
// Layer availability checking
const layers = [
  { name: 'indexeddb', available: typeof indexedDB !== 'undefined' },
  { name: 'localstorage', available: supportsLocalStorage() },
  { name: 'memory', available: true }
];

// Select first available layer
const currentLayer = layers.find(layer => layer.available);
```

### Profile-Based Selection
Different storage profiles may prefer different layers:

- **ultra-fast**: Prefers LocalStorage for speed
- **max-compression**: Prefers IndexedDB for capacity
- **low-memory**: Prefers LocalStorage with compression
- **safe-mode**: Uses most compatible layer

### Runtime Adaptation
The API can dynamically switch layers based on:
- Data size (large data prefers IndexedDB)
- Operation frequency (high frequency prefers LocalStorage)
- Error rates (switches away from failing layers)

## Fallback Behavior

### Automatic Fallback
When a layer becomes unavailable:
1. Detect failure (timeout, quota exceeded, etc.)
2. Log warning with failure reason
3. Switch to next available layer
4. Migrate existing data if possible
5. Emit 'layer-changed' event

### Data Migration
During fallback, the API attempts to:
1. Export data from failing layer
2. Import data to new layer
3. Verify data integrity
4. Clean up old data if migration succeeds

### Error Recovery
- **Quota exceeded**: Switch to lower-capacity layer
- **Corruption**: Attempt data recovery from backups
- **Permission denied**: Fallback to memory storage
- **Timeout**: Retry with exponential backoff

## Performance Characteristics

### IndexedDB
- **Write**: 10-50ms for small objects, 100ms+ for large objects
- **Read**: 5-20ms for indexed access
- **Bulk operations**: Efficient for large datasets
- **Memory usage**: Low (data stored on disk)

### LocalStorage
- **Write**: 1-5ms for small objects
- **Read**: <1ms for cached access
- **Bulk operations**: Inefficient for large datasets
- **Memory usage**: Moderate (all data in memory)

### Memory
- **Write**: <0.1ms
- **Read**: <0.1ms
- **Bulk operations**: Very fast
- **Memory usage**: High (all data in RAM)

## Monitoring and Metrics

Each layer tracks:
- Operation counts (reads/writes/deletes)
- Error rates and types
- Average response times
- Storage utilization
- Cache hit rates

## Testing and Compatibility

### Browser Testing
- Automated tests run against all three layers
- Fallback behavior verified in restricted environments
- Memory layer tested in Node.js environments

### Error Simulation
- IndexedDB failures simulated by disabling APIs
- LocalStorage quota exceeded by filling storage
- Network failures tested with service workers

## Future Extensions

### Additional Layers
- **WebSQL**: Legacy fallback for older browsers
- **Cache API**: Service worker integration
- **File System API**: Large file storage
- **Cloud storage**: Remote backup integration

### Layer Enhancements
- **Compression**: Per-layer compression settings
- **Encryption**: Layer-specific encryption
- **Replication**: Multi-layer data synchronization
- **Indexing**: Advanced query capabilities