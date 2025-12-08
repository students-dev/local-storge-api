# Architecture

**Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi**

## Overview

The Local Storage API implements a layered storage architecture with automatic fallback mechanisms, advanced caching, and comprehensive observability features.

## Core Components

### Storage Layers

The API uses a three-tier storage system with automatic fallback:

#### 1. IndexedDB Layer
**Primary storage layer with async operations and high capacity.**

- **Features**:
  - Asynchronous operations for non-blocking UI
  - Large storage capacity (typically 50MB+)
  - Supports complex queries and indexing
  - Persistent across sessions and browser restarts
  - Transactional semantics

- **Implementation**:
  - Uses a single object store with auto-incrementing keys
  - Metadata includes creation time, update time, version, and TTL
  - Proper error handling and transaction management

- **Limitations**:
  - Complex API requiring promisification
  - Not available in all contexts (Web Workers without setup)
  - User permission may be required in some browsers

#### 2. LocalStorage Layer
**Synchronous fallback with browser-native persistence.**

- **Features**:
  - Synchronous operations for simplicity
  - Simple key-value storage
  - Persistent across sessions
  - Widely supported across browsers

- **Implementation**:
  - Prefixes keys with namespace for isolation
  - Stores JSON-serialized objects with metadata
  - Base64 encoding for binary data

- **Limitations**:
  - Limited capacity (typically 5-10MB)
  - Synchronous operations can block UI
  - String-only values (JSON serialization required)

#### 3. Memory Layer
**In-memory fallback for basic functionality.**

- **Features**:
  - Instant operations
  - No capacity limits
  - Supports all data types natively

- **Limitations**:
  - Non-persistent (lost on page reload)
  - Not shared between tabs/windows
  - No cross-session continuity

### Serialization System

Handles conversion of complex JavaScript types to storable formats:

#### Supported Types
- **Primitives**: string, number, boolean, null, undefined
- **Objects**: Plain objects with recursive serialization
- **Arrays**: Arrays with element serialization
- **Maps**: Converted to { __type: 'Map', value: entries[] }
- **Sets**: Converted to { __type: 'Set', value: items[] }
- **Dates**: Converted to { __type: 'Date', value: ISO string }
- **Blobs**: Converted to base64 data URLs
- **TypedArrays**: Converted to regular arrays

#### Compression Engines
- **lz-string**: Fast string compression
- **none**: No compression (default for ultra-fast profile)

#### Serialization Strategies
- **JSON**: Standard JSON serialization
- **MessagePack**: Binary serialization for better compression

### Caching Layer

Implements a configurable in-memory cache:

- **TTL-based eviction**: Configurable cache lifetime
- **LRU-style management**: Automatic cleanup of expired entries
- **Stale-while-revalidate**: Return cached data while refreshing in background
- **Prefetching**: Predictive loading of frequently accessed keys

### Event System

Built on Node.js EventEmitter with cross-tab synchronization:

- **Local events**: change, delete, clear, import, error
- **Cross-tab sync**: BroadcastChannel for real-time updates
- **Conflict resolution**: Configurable merge strategies
- **Heartbeat system**: Tab liveness detection

### Query Engine

Provides SQL-like querying capabilities:

- **Filter**: Predicate-based filtering
- **Sort**: Comparator-based sorting
- **Limit/Take**: Result pagination
- **Chaining**: Fluent API for complex queries

### Snapshot System

Time travel debugging and backup functionality:

- **Save/Load**: Full state snapshots
- **Comparison**: Diff generation between snapshots
- **Export formats**: JSON, NDJSON, MessagePack
- **Metadata**: Timestamps, versions, sizes

### Metrics & Observability

Comprehensive monitoring system:

- **Performance metrics**: Read/write latency, operation counts
- **Storage usage**: Per-backend capacity tracking
- **Error tracking**: Failed operations and error rates
- **Audit logging**: Complete operation history
- **Configurable logging**: Multiple verbosity levels

### Profile System

Optimization profiles for different use cases:

- **ultra-fast**: No compression, minimal overhead
- **max-compression**: Heavy compression, slower but smaller
- **low-memory**: Balanced compression, memory-conscious
- **safe-mode**: Extra validation, error checking

## Data Flow

### Write Operation
1. **Validation**: Input validation and type checking
2. **Hooks**: beforeSet hook execution
3. **Serialization**: Convert to storable format
4. **Compression**: Apply compression if configured
5. **Encryption**: Apply encryption if configured
6. **Storage**: Write to current layer with fallback
7. **Cache**: Update in-memory cache
8. **Audit**: Log operation
9. **Events**: Emit change event
10. **Sync**: Broadcast to other tabs
11. **Hooks**: afterSet hook execution

### Read Operation
1. **Cache check**: Return cached data if valid
2. **Storage**: Read from current layer
3. **Decryption**: Apply decryption if configured
4. **Decompression**: Apply decompression if configured
5. **Deserialization**: Convert to original format
6. **Cache update**: Store in cache
7. **Metrics**: Record read operation

## Security Considerations

- **No built-in encryption**: Provides hooks for user-provided crypto
- **Input validation**: Safe mode with additional checks
- **Quota monitoring**: Prevents storage exhaustion
- **Namespace isolation**: Prevents cross-app data leakage

## Performance Optimizations

- **Adaptive layer selection**: Choose optimal storage based on data size
- **Batch operations**: Group multiple operations for efficiency
- **Lazy loading**: Load data only when accessed
- **Connection pooling**: Reuse IndexedDB connections
- **Memory management**: Automatic cleanup of expired data

## Error Handling

- **Custom error classes**: Specific error types for different failure modes
- **Graceful degradation**: Automatic fallback to simpler storage
- **Retry logic**: Configurable retry attempts for transient failures
- **Logging**: Comprehensive error logging and reporting

## Browser Compatibility

- **IndexedDB**: Chrome 24+, Firefox 16+, Safari 10+, Edge 12+
- **LocalStorage**: All modern browsers
- **BroadcastChannel**: Chrome 54+, Firefox 38+, Safari 15.4+
- **MessagePack**: All browsers (via polyfill if needed)

## Extensibility

The API is designed for extension through:

- **Plugin hooks**: Custom serialization, compression, encryption
- **Storage adapters**: Additional storage backends
- **Sync providers**: Custom synchronization strategies
- **Migration handlers**: User-defined data migrations