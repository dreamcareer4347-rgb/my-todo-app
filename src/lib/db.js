import { neon, neonConfig } from '@neondatabase/serverless';

// Cloudflare Workers ke liye WebSocket zaroori hai
neonConfig.webSocketConstructor = globalThis.WebSocket;

export function getSql() {
  const sql = neon(process.env.DATABASE_URL);
  return sql;
}

// Table create karne ka helper function
export async function initDb() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}