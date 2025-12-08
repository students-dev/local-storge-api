// examples/svelte.js
// Svelte Store with Local Storage
// Author & Founder: Ramkrishna Bhatt V (Milagres PU College, Kallianpur, Udupi)

const { LocalStorageAPI } = require('@students-dev/local-storage-api');

// Svelte store with persistence
function persistentStore(key, initialValue) {
  const storage = new LocalStorageAPI();
  let value = initialValue;

  const subscribers = new Set();

  const subscribe = (subscriber) => {
    subscribers.add(subscriber);
    subscriber(value);

    // Cleanup
    return () => subscribers.delete(subscriber);
  };

  const set = async (newValue) => {
    value = newValue;
    await storage.set(key, newValue);

    // Notify subscribers
    subscribers.forEach(subscriber => subscriber(value));
  };

  const update = async (updater) => {
    const newValue = updater(value);
    await set(newValue);
  };

  // Initialize from storage
  storage.get(key).then(stored => {
    if (stored !== null) {
      value = stored;
      subscribers.forEach(subscriber => subscriber(value));
    }
  });

  return { subscribe, set, update };
}

// Writable store for complex data
function writableStore(key, initialValue) {
  const store = persistentStore(key, initialValue);

  return {
    ...store,
    reset: () => store.set(initialValue)
  };
}

// Example Svelte component (pseudo-code)
const Counter = `
<script>
  import { writableStore } from './storage.js';

  const count = writableStore('counter', 0);

  function increment() {
    count.update(n => n + 1);
  }

  function decrement() {
    count.update(n => n - 1);
  }

  function reset() {
    count.reset();
  }
</script>

<div class="counter">
  <button on:click={decrement}>-</button>
  <span>{$count}</span>
  <button on:click={increment}>+</button>
  <button on:click={reset}>Reset</button>
</div>
`;

// Advanced example with reactive queries
function reactiveQueryStore(queryFn, dependencies = []) {
  const storage = new LocalStorageAPI();
  let value = [];

  const subscribers = new Set();

  const subscribe = (subscriber) => {
    subscribers.add(subscriber);
    subscriber(value);
    return () => subscribers.delete(subscriber);
  };

  const refresh = async () => {
    value = await queryFn(storage);
    subscribers.forEach(subscriber => subscriber(value));
  };

  // Watch dependencies
  dependencies.forEach(dep => {
    storage.on('change', (event) => {
      if (event.key === dep) {
        refresh();
      }
    });
  });

  // Initial load
  refresh();

  return { subscribe, refresh };
}

module.exports = { persistentStore, writableStore, reactiveQueryStore, Counter };