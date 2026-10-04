import { readFileSync } from 'node:fs';
import { lookup } from 'node:dns/promises';
const values = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => /^VITE_\w+=/.test(l)).map(l => { const at = l.indexOf('='); return [l.slice(0, at), l.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
try { await lookup(new URL(values.VITE_SUPABASE_URL).hostname); console.log('Supabase DNS: resolved'); } catch(e) { console.log('Supabase DNS:', e.code); }
try { const r = await fetch(`${values.VITE_SUPABASE_URL}/rest/v1/categories?select=id&limit=1`, { headers: { apikey: values.VITE_SUPABASE_PUBLISHABLE_KEY }, signal: AbortSignal.timeout(8000) }); console.log('Supabase API status:', r.status); } catch(e) { console.log('Supabase connection:', e.cause?.code ?? e.name); }
