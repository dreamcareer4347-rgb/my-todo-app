import { getSql, initDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const instant = false;

export default async function TodoApp() {
  // Database aur table ensure karein
  try {
    await initDb();
  } catch (err) {
    console.error("DB Init Error:", err);
  }

  const sql = getSql();

  // Todos fetch karein
  let todos = [];
  let dbError = null;
  try {
    todos = await sql`SELECT * FROM todos ORDER BY id DESC`;
  } catch (error) {
    dbError = error.message;
    console.error("Database fetch error:", error);
  }

  // --- SERVER ACTIONS ---
  async function addTodo(formData) {
    'use server';
    const text = formData.get('text');
    if (!text || text.trim() === "") return;
    const db = getSql();
    await db`INSERT INTO todos (text) VALUES (${text.trim()})`;
    revalidatePath('/');
  }

  async function deleteTodo(formData) {
    'use server';
    const id = formData.get('id');
    const db = getSql();
    await db`DELETE FROM todos WHERE id = ${id}`;
    revalidatePath('/');
  }

  async function toggleTodo(formData) {
    'use server';
    const id = formData.get('id');
    const completed = formData.get('completed') === 'true';
    const db = getSql();
    await db`UPDATE todos SET completed = ${!completed} WHERE id = ${id}`;
    revalidatePath('/');
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-400">✨ Full-Stack Todo App</h1>
          <span className="text-xs bg-blue-950 text-blue-300 px-3 py-1 rounded-full border border-blue-800">
            Next.js + Neon + Cloudflare
          </span>
        </div>
        
        {dbError && (
          <div className="mb-6 bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-lg text-sm">
            <strong>Database Error:</strong> {dbError}
          </div>
        )}

        <form action={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            name="text"
            placeholder="Koi naya task yahan likhein..."
            required
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            Add Task
          </button>
        </form>

        <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {todos.map((todo) => (
            <li 
              key={todo.id} 
              className={`flex items-center justify-between border px-4 py-3 rounded-xl transition ${
                todo.completed 
                  ? 'bg-gray-900/40 border-gray-800/40 opacity-60' 
                  : 'bg-gray-800/60 border-gray-700/60'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 mr-2">
                <form action={toggleTodo}>
                  <input type="hidden" name="id" value={todo.id} />
                  <input type="hidden" name="completed" value={todo.completed.toString()} />
                  <button type="submit" className="flex items-center justify-center w-5 h-5 rounded border border-gray-600 bg-gray-700 hover:border-blue-400 transition cursor-pointer">
                    {todo.completed && <span className="text-blue-400 text-xs font-bold">✓</span>}
                  </button>
                </form>
                <span className={`text-gray-200 break-all ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.text}
                </span>
              </div>

              <form action={deleteTodo}>
                <input type="hidden" name="id" value={todo.id} />
                <button 
                  type="submit" 
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/30 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}

          {todos.length === 0 && !dbError && (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">🎉 Koi task nahi bacha!</p>
              <p className="text-sm mt-1">Upar box mein likhkar naya task add karein.</p>
            </div>
          )}
        </ul>
      </div>
    </main>
  );
}