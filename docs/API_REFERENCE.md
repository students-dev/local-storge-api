# API Reference

**Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi**

## LocalStorageAPI Class

### Constructor

```javascript
new LocalStorageAPI(options?: StorageOptions)
```

#### Options

- `namespace?: string` - Storage namespace
- `profile?: 'ultra-fast' | 'max-compression' | 'low-memory' | 'safe-mode'` - Storage profile
- `version?: number` - Schema version
- `debug?: boolean` - Enable debug logging
- `safeMode?: boolean` - Enable safe mode
- `hooks?: StorageHooks` - Lifecycle hooks
- `encryption?: EncryptionHooks` - Encryption hooks
- `sync?: SyncOptions` - Sync configuration
- `cacheTTL?: number` - Cache TTL in milliseconds

### Simple API Methods

#### save(key, value, options?)
Stores a value.

- `key` (string): The storage key
- `value` (any): The value to store
- `options.ttl` (number?): TTL in seconds

#### load(key)
Retrieves a value.

- `key` (string): The storage key
- Returns: The stored value or null

#### delete(key)
Removes a value.

- `key` (string): The storage key

#### reset()
Clears all stored values.

#### exists(key)
Checks if a key exists.

- `key` (string): The storage key
- Returns: boolean

#### count()
Returns the number of stored items.

- Returns: number

#### all()
Returns all stored data.

- Returns: Object with key-value pairs

#### saveMany(items, options?)
Batch save operation.

- `items` (Array<[string, any]>): Key-value pairs
- `options.ttl` (number?): TTL for all items

#### loadMany(keys)
Batch load operation.

- `keys` (Array<string>): Keys to retrieve
- Returns: Object with key-value pairs

#### deleteMany(keys)
Batch delete operation.

- `keys` (Array<string>): Keys to delete

#### exportJSON()
Exports all data as JSON string.

- Returns: JSON string

#### exportFile()
Triggers browser download of exported data.

- Returns: JSON string

#### importJSON(json)
Imports data from JSON string.

- `json` (string): JSON data to import

#### supports()
Returns storage capability information.

- Returns: SupportsResult object

### Advanced API Methods

#### set(key, value, options?)
Advanced save with full options.

#### get(key)
Advanced load.

#### remove(key)
Advanced delete.

#### clear()
Advanced clear.

#### has(key)
Advanced exists check.

#### size()
Advanced count.

#### keys()
Returns all keys.

- Returns: Array of strings

#### exportAll()
Returns all data as object.

#### importAll(data)
Imports data from object.

### Query API

#### query(options?)
Creates a query builder.

```javascript
const results = await storage.query()
  .filter(value => value.price > 100)
  .sort((a, b) => a[1].price - b[1].price)
  .limit(10)
  .execute()
```

### Snapshot API

#### saveSnapshot(name)
Saves current state as snapshot.

- `name` (string): Snapshot identifier

#### loadSnapshot(name)
Loads a snapshot.

- `name` (string): Snapshot identifier

#### listSnapshots()
Returns all snapshots.

- Returns: Array of snapshot metadata

#### compareSnapshots(name1, name2)
Compares two snapshots.

- Returns: Object with added/removed/changed keys

### Export/Import Formats

#### exportAs(format)
Exports in specified format.

- `format` ('json' | 'ndjson' | 'msgpack'): Export format
- Returns: Formatted string

#### importFrom(data, format)
Imports from specified format.

### Observability

#### getMetrics()
Returns performance metrics.

- Returns: Metrics object

#### getAuditLog()
Returns audit log entries.

- Returns: Array of audit entries

#### log(level, message, namespace?)
Logs a message.

- `level` (string): Log level
- `message` (string): Log message
- `namespace` (string): Log namespace

### Utility Methods

#### freeze()
Freezes the storage instance.

#### unfreeze()
Creates a new unfrozen instance.

#### benchmark(iterations?)
Runs performance benchmark.

- `iterations` (number): Number of operations (default: 1000)
- Returns: Benchmark results

### Events

- `change`: Emitted when a value is set
- `delete`: Emitted when a value is removed
- `clear`: Emitted when storage is cleared
- `import`: Emitted when data is imported
- `error`: Emitted on operation errors

Event listeners are added with `storage.on(event, callback)`.

## useStore Function

```javascript
useStore(namespace: string): LocalStorageAPI
```

Creates a namespaced storage instance.

## Error Classes

- `StorageError`: Base storage error
- `QuotaExceededError`: Storage quota exceeded
- `MigrationError`: Migration failure
- `SerializationError`: Serialization failure

## Storage Profiles

- `ultra-fast`: No compression, JSON serialization
- `max-compression`: lz-string compression, MessagePack serialization
- `low-memory`: lz-string compression, JSON serialization
- `safe-mode`: No compression, JSON serialization, extra safety checks

## Hooks

### StorageHooks

- `beforeSet(key, value, options)`: Called before setting a value
- `afterSet(key, value, options)`: Called after setting a value
- `beforeDelete(key)`: Called before deleting a value
- `afterDelete(key)`: Called after deleting a value
- `beforeClear()`: Called before clearing storage
- `afterClear()`: Called after clearing storage

### EncryptionHooks

- `preWriteEncrypt(data)`: Encrypt data before writing
- `postReadDecrypt(data)`: Decrypt data after reading

## Sync Options

- `channel`: BroadcastChannel instance for cross-tab sync
- `tabId`: Unique identifier for this tab

## TypeScript Support

Full TypeScript definitions are included in `types/index.d.ts`.