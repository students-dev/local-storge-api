# Examples

**Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi**

## Plain JavaScript

### Basic Usage
```javascript
const { LocalStorageAPI, useStore } = require('@students-dev/local-storage-api');

const storage = new LocalStorageAPI();

// Store different data types
await storage.save('user', {
  name: 'Alice',
  profile: new Map([['theme', 'dark']]),
  avatar: await fetch('/avatar.jpg').then(r => r.blob())
});

// Retrieve data
const user = await storage.load('user');
console.log(user.name); // Alice

// Batch operations
await storage.saveMany([
  ['setting1', 'value1'],
  ['setting2', 'value2']
]);

// Namespaced storage
const appStorage = useStore('myapp');
await appStorage.save('config', { version: '1.0.0' });
```

### Advanced Features
```javascript
const storage = new LocalStorageAPI({
  profile: 'max-compression',
  sync: { channel: new BroadcastChannel('my-app') },
  debug: true
});

// Complex queries
const expensiveItems = await storage.query()
  .filter(item => item.price > 100)
  .sort((a, b) => a.price - b.price)
  .execute();

// Snapshots for backup
await storage.saveSnapshot('backup');
await storage.clear();
// Restore from snapshot
await storage.loadSnapshot('backup');

// Metrics monitoring
const metrics = storage.getMetrics();
console.log(`Operations: ${metrics.reads + metrics.writes}`);

// Event handling
storage.on('change', (event) => {
  console.log('Storage changed:', event.key);
});
```

## React

### Custom Hook
```javascript
import { useState, useEffect } from 'react';
const { LocalStorageAPI } = require('@students-dev/local-storage-api');

function useStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [storage] = useState(() => new LocalStorageAPI());

  useEffect(() => {
    // Load initial value
    storage.load(key).then(value => {
      if (value !== null) {
        setStoredValue(value);
      }
      setLoading(false);
    });

    // Listen for changes
    const handleChange = (event) => {
      if (event.key === key) {
        setStoredValue(event.value);
      }
    };

    storage.on('change', handleChange);

    return () => {
      storage.off('change', handleChange);
    };
  }, [key, storage]);

  const setValue = async (value) => {
    await storage.save(key, value);
    setStoredValue(value);
  };

  return [storedValue, setValue, loading];
}
```

### Todo App Component
```javascript
import React, { useState } from 'react';
import { useStorage } from './useStorage';

function TodoApp() {
  const [todos, setTodos] = useStorage('todos', []);
  const [input, setInput] = useState('');

  const addTodo = async () => {
    if (input.trim()) {
      const newTodos = [...todos, {
        id: Date.now(),
        text: input,
        completed: false
      }];
      await setTodos(newTodos);
      setInput('');
    }
  };

  const toggleTodo = async (id) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    await setTodos(newTodos);
  };

  return (
    <div>
      <h1>Persistent Todo App</h1>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none'
            }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
```

## Vue.js

### Composable
```javascript
import { ref, onMounted, onUnmounted } from 'vue';
const { LocalStorageAPI } = require('@students-dev/local-storage-api');

export function useStorage(key, initialValue = null) {
  const storage = new LocalStorageAPI();
  const value = ref(initialValue);

  const load = async () => {
    const stored = await storage.load(key);
    if (stored !== null) {
      value.value = stored;
    }
  };

  const save = async (newValue) => {
    await storage.save(key, newValue);
    value.value = newValue;
  };

  onMounted(async () => {
    await load();

    const handleChange = (event) => {
      if (event.key === key) {
        value.value = event.value;
      }
    };

    storage.on('change', handleChange);

    onUnmounted(() => {
      storage.off('change', handleChange);
    });
  });

  return {
    value: readonly(value),
    save
  };
}
```

### Shopping Cart Component
```vue
<template>
  <div class="shopping-cart">
    <h2>Shopping Cart</h2>

    <div v-for="item in items" :key="item.id" class="cart-item">
      <span>{{ item.name }}</span>
      <span>${{ item.price }}</span>
      <button @click="removeItem(item.id)">Remove</button>
    </div>

    <div class="cart-total">
      Total: ${{ total }}
    </div>

    <button @click="clearCart">Clear Cart</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStorage } from './useStorage';

const { value: items, save: saveItems } = useStorage('cart', []);

const total = computed(() =>
  items.value.reduce((sum, item) => sum + item.price, 0)
);

const addItem = async (item) => {
  const newItems = [...items.value, { ...item, id: Date.now() }];
  await saveItems(newItems);
};

const removeItem = async (id) => {
  const newItems = items.value.filter(item => item.id !== id);
  await saveItems(newItems);
};

const clearCart = async () => {
  await saveItems([]);
};

// Expose methods for parent components
defineExpose({ addItem });
</script>
```

## Svelte

### Store with Persistence
```javascript
import { writable } from 'svelte/store';
const { LocalStorageAPI } = require('@students-dev/local-storage-api');

export function persistentStore(key, initialValue) {
  const storage = new LocalStorageAPI();
  const store = writable(initialValue);

  // Load initial value
  storage.load(key).then(value => {
    if (value !== null) {
      store.set(value);
    }
  });

  // Subscribe to store changes
  const unsubscribe = store.subscribe(async (value) => {
    await storage.save(key, value);
  });

  return {
    ...store,
    destroy: unsubscribe
  };
}
```

### Counter Component
```svelte
<script>
  import { persistentStore } from './persistentStore.js';

  const count = persistentStore('counter', 0);

  function increment() {
    count.update(n => n + 1);
  }

  function decrement() {
    count.update(n => n - 1);
  }

  function reset() {
    count.set(0);
  }
</script>

<div class="counter">
  <button on:click={decrement}>-</button>
  <span>{$count}</span>
  <button on:click={increment}>+</button>
  <button on:click={reset}>Reset</button>
</div>
```

### Reactive Query Store
```javascript
import { writable } from 'svelte/store';
const { LocalStorageAPI } = require('@students-dev/local-storage-api');

export function reactiveQueryStore(queryFn, dependencies = []) {
  const storage = new LocalStorageAPI();
  const store = writable([]);

  const refresh = async () => {
    const results = await queryFn(storage);
    store.set(results);
  };

  // Initial load
  refresh();

  // Watch dependencies
  dependencies.forEach(dep => {
    storage.on('change', (event) => {
      if (event.key.startsWith(dep)) {
        refresh();
      }
    });
  });

  return {
    ...store,
    refresh
  };
}

// Usage
const expensiveProducts = reactiveQueryStore(
  (storage) => storage.query()
    .filter(item => item.price > 100)
    .execute(),
  ['products']
);
```

## Advanced Patterns

### Form Persistence
```javascript
class PersistentForm {
  constructor(formKey) {
    this.storage = new LocalStorageAPI();
    this.formKey = formKey;
    this.draftKey = `${formKey}_draft`;
  }

  async saveDraft(data) {
    await this.storage.save(this.draftKey, {
      ...data,
      savedAt: Date.now()
    });
  }

  async loadDraft() {
    return await this.storage.load(this.draftKey);
  }

  async submit(data) {
    // Save final version
    await this.storage.save(this.formKey, data);
    // Clear draft
    await this.storage.delete(this.draftKey);

    // Create submission record
    const submissions = await this.storage.load('submissions') || [];
    submissions.push({
      id: Date.now(),
      formKey: this.formKey,
      data,
      submittedAt: Date.now()
    });
    await this.storage.save('submissions', submissions);
  }

  async getSubmissions() {
    return await this.storage.load('submissions') || [];
  }
}
```

### Cache with TTL
```javascript
class Cache {
  constructor(namespace = 'cache') {
    this.storage = new LocalStorageAPI({ namespace });
  }

  async get(key, ttl = 300000) { // 5 minutes default
    const cached = await this.storage.load(key);
    if (cached && (Date.now() - cached.timestamp) < ttl) {
      return cached.data;
    }
    return null;
  }

  async set(key, data) {
    await this.storage.save(key, {
      data,
      timestamp: Date.now()
    });
  }

  async invalidate(pattern) {
    const allKeys = await this.storage.all();
    const keysToDelete = Object.keys(allKeys).filter(key =>
      key.includes(pattern)
    );
    await this.storage.deleteMany(keysToDelete);
  }

  async clear() {
    await this.storage.reset();
  }
}
```

### Real-time Collaboration
```javascript
class CollaborativeStorage {
  constructor(channelName) {
    this.storage = new LocalStorageAPI({
      sync: {
        channel: new BroadcastChannel(channelName)
      }
    });
    this.operations = [];
    this.conflictResolver = 'last-write-wins';
  }

  async applyOperation(operation) {
    const { type, key, value, id, userId } = operation;

    // Record operation for conflict resolution
    this.operations.push({
      ...operation,
      timestamp: Date.now()
    });

    // Apply locally
    switch (type) {
      case 'set':
        await this.storage.save(key, { ...value, _userId: userId });
        break;
      case 'delete':
        await this.storage.delete(key);
        break;
    }

    // Broadcast to other users
    this.storage.sync.channel.postMessage({
      type: 'operation',
      operation
    });
  }

  onRemoteOperation(callback) {
    this.storage.sync.channel.onmessage = (event) => {
      if (event.data.type === 'operation') {
        callback(event.data.operation);
      }
    };
  }
}
```

## Testing Examples

### Unit Test
```javascript
const { LocalStorageAPI } = require('@students-dev/local-storage-api');

test('storage operations', async () => {
  const storage = new LocalStorageAPI();

  await storage.save('test', { data: 'value' });
  const loaded = await storage.load('test');

  expect(loaded.data).toBe('value');
});
```

### Integration Test
```javascript
const { LocalStorageAPI } = require('@students-dev/local-storage-api');

describe('Storage Integration', () => {
  let storage;

  beforeEach(() => {
    storage = new LocalStorageAPI({ namespace: 'test' });
  });

  afterEach(async () => {
    await storage.reset();
  });

  test('persists data across operations', async () => {
    await storage.save('user', { name: 'Alice' });
    await storage.save('settings', { theme: 'dark' });

    const user = await storage.load('user');
    const settings = await storage.load('settings');

    expect(user.name).toBe('Alice');
    expect(settings.theme).toBe('dark');
  });
});
```

## Performance Examples

### Benchmarking
```javascript
const storage = new LocalStorageAPI();

console.log('Running benchmark...');
const results = await storage.benchmark(10000);

console.log('Write performance:', results.write.avg, 'ms/op');
console.log('Read performance:', results.read.avg, 'ms/op');
```

### Memory Monitoring
```javascript
const storage = new LocalStorageAPI();

setInterval(async () => {
  const metrics = storage.getMetrics();
  console.log('Storage usage:', {
    operations: metrics.reads + metrics.writes,
    avgLatency: metrics.avgReadLatency,
    errors: metrics.errors.length
  });
}, 5000);
```

## Migration Examples

### Simple Migration
```javascript
const storage = new LocalStorageAPI();

// Register migration
storage.registerMigration('User', 1, 2, (data) => ({
  ...data,
  fullName: `${data.firstName} ${data.lastName}`,
  version: 2
}));

// Migrate all users
await storage.migrateModel('User', 1, 2);
```

### Complex Migration
```javascript
storage.registerMigration('Order', 1, 2, async (data) => {
  // Fetch related user data
  const user = await storage.load(`user:${data.userId}`);

  return {
    ...data,
    userName: user ? user.name : 'Unknown',
    total: data.items.reduce((sum, item) => sum + item.price, 0),
    version: 2
  };
});
```

These examples demonstrate the versatility and power of the Local Storage API across different frameworks and use cases.