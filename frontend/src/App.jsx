import { useEffect, useState } from "react";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`/api/todos`);
      if (res.ok) setTodos(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await fetch(`/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    setNewTitle("");
    load();
  };

  const toggleComplete = async (todo) => {
    await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    load();
  };

  const deleteTodo = async (id) => {
    await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Todo List</h2>

      <form onSubmit={addTodo} style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="add something..."
        />
        <button type="submit" style={{ marginLeft: 5 }}>Add</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} style={{ marginBottom: 10 }}>
            <span
              onClick={() => toggleComplete(todo)}
              style={{
                cursor: "pointer"
              }}
            >
              {todo.completed ? "✅ " : "⬜ "}
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: 10 }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}