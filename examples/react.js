// examples/react.js
// React Example with Hooks
// Author & Founder: Ramkrishna Bhatt V (Milagres PU College, Kallianpur, Udupi)

const { LocalStorageAPI } = require('@students-dev/local-storage-api');
const React = { useState, useEffect }; // Mock for example

// Custom hook for storage
function useStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storage = new LocalStorageAPI();

    // Load initial value
    storage.get(key).then(value => {
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
  }, [key]);

  const setValue = async (value) => {
    const storage = new LocalStorageAPI();
    await storage.set(key, value);
    setStoredValue(value);
  };

  return [storedValue, setValue, loading];
}

// Component example
function App() {
  const [user, setUser, loading] = useStorage('user', { name: '', email: '' });
  const [todos, setTodos] = useStorage('todos', []);

  const addTodo = async (text) => {
    const newTodos = [...todos, { id: Date.now(), text, completed: false }];
    await setTodos(newTodos);
  };

  const toggleTodo = async (id) => {
    const newTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    await setTodos(newTodos);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Todo App with Persistent Storage</h1>

      <div>
        <h2>User Profile</h2>
        <input
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          placeholder="Name"
        />
        <input
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="Email"
        />
      </div>

      <div>
        <h2>Todos</h2>
        <input
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addTodo(e.target.value);
              e.target.value = '';
            }
          }}
          placeholder="Add todo..."
        />

        {todos.map(todo => (
          <div key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

module.exports = { useStorage, App };