// examples/vue.js
// Vue.js Composition API Example
// Author & Founder: Ramkrishna Bhatt V (Milagres PU College, Kallianpur, Udupi)

const { LocalStorageAPI } = require('@students-dev/local-storage-api');

// Vue composable for storage
function useStorage(key, initialValue = null) {
  const storage = new LocalStorageAPI();
  let value = initialValue;

  const get = async () => {
    const stored = await storage.get(key);
    return stored !== null ? stored : initialValue;
  };

  const set = async (newValue) => {
    await storage.set(key, newValue);
    value = newValue;
  };

  const remove = async () => {
    await storage.remove(key);
    value = initialValue;
  };

  return {
    get,
    set,
    remove,
    get value() { return value; },
    set value(newValue) { set(newValue); }
  };
}

// Vue component example
const ShoppingCart = {
  template: `
    <div class="shopping-cart">
      <h2>Shopping Cart</h2>

      <div v-for="item in items" :key="item.id" class="cart-item">
        <span>{{ item.name }}</span>
        <span>{{ item.price }}</span>
        <button @click="removeItem(item.id)">Remove</button>
      </div>

      <div class="cart-total">
        Total: {{ total }}
      </div>

      <button @click="clearCart">Clear Cart</button>
    </div>
  `,

  setup() {
    const cartStorage = useStorage('shopping-cart', []);
    const items = cartStorage.value;
    let total = 0;

    const addItem = async (item) => {
      const currentItems = await cartStorage.get();
      const newItems = [...currentItems, { ...item, id: Date.now() }];
      await cartStorage.set(newItems);
      updateTotal(newItems);
    };

    const removeItem = async (id) => {
      const currentItems = await cartStorage.get();
      const newItems = currentItems.filter(item => item.id !== id);
      await cartStorage.set(newItems);
      updateTotal(newItems);
    };

    const clearCart = async () => {
      await cartStorage.set([]);
      total = 0;
    };

    const updateTotal = (items) => {
      total = items.reduce((sum, item) => sum + item.price, 0);
    };

    // Initialize total
    cartStorage.get().then(updateTotal);

    return {
      items,
      total,
      addItem,
      removeItem,
      clearCart
    };
  }
};

// Plugin for global storage access
const StoragePlugin = {
  install(app) {
    app.config.globalProperties.$storage = new LocalStorageAPI();
  }
};

module.exports = { useStorage, ShoppingCart, StoragePlugin };