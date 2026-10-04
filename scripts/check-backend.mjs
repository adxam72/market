import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const values = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => /^VITE_\w+=/.test(l)).map(l => { const at = l.indexOf('='); return [l.slice(0, at), l.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
const client = createClient(values.VITE_SUPABASE_URL, values.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
for (const table of ['categories', 'products']) {
  const { count, error } = await client.from(table).select('id', { head: true, count: 'exact' });
  console.log(JSON.stringify({ table, count, connected: !error, error: error ? { code: error.code, message: error.message.includes('fetch') ? 'Network unavailable' : error.message } : null }));
}
