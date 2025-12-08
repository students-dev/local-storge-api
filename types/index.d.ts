/**
 * TypeScript Definitions for Local Storage API v1.0.0
 * Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi
 * License: MIT
 */

export interface StorageOptions {
  namespace?: string;
  profile?: 'ultra-fast' | 'max-compression' | 'low-memory' | 'safe-mode';
  version?: number;
  debug?: boolean;
  safeMode?: boolean;
  hooks?: StorageHooks;
  encryption?: EncryptionHooks;
  sync?: SyncOptions;
  cacheTTL?: number;
}

export interface StorageHooks {
  beforeSet?: (key: string, value: any, options?: any) => Promise<any> | any;
  afterSet?: (key: string, value: any, options?: any) => Promise<void> | void;
  beforeDelete?: (key: string) => Promise<boolean> | boolean;
  afterDelete?: (key: string) => Promise<void> | void;
  beforeClear?: () => Promise<boolean> | boolean;
  afterClear?: () => Promise<void> | void;
}

export interface EncryptionHooks {
  preWriteEncrypt?: (data: string) => Promise<string> | string;
  postReadDecrypt?: (data: string) => Promise<string> | string;
}

export interface SyncOptions {
  channel?: BroadcastChannel;
  tabId?: string;
}

export interface StorageEvent {
  key?: string;
  value?: any;
  action: 'set' | 'delete' | 'clear' | 'import';
}

export interface SupportsResult {
  indexedDB: boolean;
  localStorage: boolean;
  memory: boolean;
  current: string;
}

export interface Metrics {
  reads: number;
  writes: number;
  deletes: number;
  readLatency: number[];
  writeLatency: number[];
  errors: Error[];
  avgReadLatency: number;
  avgWriteLatency: number;
}

export interface Snapshot {
  name: string;
  data: Record<string, any>;
  timestamp: number;
  version: number;
}

export interface QueryOptions {
  filter?: (value: any, key: string) => boolean;
  sort?: (a: [string, any], b: [string, any]) => number;
  limit?: number;
  take?: number;
}

export interface BenchmarkResult {
  write: { total: number; avg: number };
  read: { total: number; avg: number };
}

export declare class LocalStorageAPI {
  constructor(options?: StorageOptions);

  // Core API
  save(key: string, value: any, options?: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  reset(): Promise<void>;
  exists(key: string): Promise<boolean>;
  count(): Promise<number>;
  all(): Promise<Record<string, any>>;
  saveMany(items: [string, any][], options?: any): Promise<void>;
  loadMany(keys: string[]): Promise<Record<string, any>>;
  deleteMany(keys: string[]): Promise<void>;
  exportJSON(): Promise<string>;
  exportFile(): Promise<string>;
  importJSON(json: string): Promise<void>;
  supports(): SupportsResult;

  // Advanced API
  set(key: string, value: any, options?: any): Promise<void>;
  get(key: string): Promise<any>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  size(): Promise<number>;
  keys(): Promise<string[]>;
  exportAll(): Promise<Record<string, any>>;
  importAll(data: Record<string, any>): Promise<void>;

  // Query API
  query(options?: QueryOptions): {
    filter(fn: (value: any, key: string) => boolean): any;
    sort(fn: (a: [string, any], b: [string, any]) => number): any;
    limit(n: number): any;
    take(n: number): any;
    execute(): Promise<Record<string, any>>;
  };

  // Snapshots
  saveSnapshot(name: string): Promise<void>;
  loadSnapshot(name: string): Promise<void>;
  listSnapshots(): Snapshot[];
  compareSnapshots(name1: string, name2: string): {
    added: string[];
    removed: string[];
    changed: string[];
  };

  // Export/Import formats
  exportAs(format?: 'json' | 'ndjson' | 'msgpack'): Promise<string>;
  importFrom(data: string, format?: 'json' | 'ndjson' | 'msgpack'): Promise<void>;

  // Observability
  getMetrics(): Metrics;
  getAuditLog(): any[];
  log(level: string, message: string, namespace?: string): void;

  // Utility
  freeze(): void;
  unfreeze(): LocalStorageAPI;
  benchmark(iterations?: number): Promise<BenchmarkResult>;

  // Events
  on(event: 'change', listener: (event: StorageEvent) => void): this;
  on(event: 'delete', listener: (event: StorageEvent) => void): this;
  on(event: 'clear', listener: (event: StorageEvent) => void): this;
  on(event: 'import', listener: (event: StorageEvent) => void): this;
  on(event: 'error', listener: (event: StorageEvent) => void): this;
}

export declare function useStore(namespace: string): LocalStorageAPI;

export declare class StorageError extends Error {
  code: string;
}

export declare class QuotaExceededError extends StorageError {}
export declare class MigrationError extends StorageError {}
export declare class SerializationError extends StorageError {}

export default LocalStorageAPI;