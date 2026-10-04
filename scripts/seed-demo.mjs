import { createClient } from '@supabase/supabase-js';
import { randomBytes, randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { demoCategories, demoProducts } from './demo-data.mjs';

// Deliberate opt-in to a separate demo Supabase project; never run against production.
const { DEMO_SUPABASE_URL, DEMO_SUPABASE_SERVICE_ROLE_KEY, DEMO_SITE_ORIGIN, ALLOW_DEMO_SEED } = process.env;
if (ALLOW_DEMO_SEED !== 'yes' || !DEMO_SUPABASE_URL || !DEMO_SUPABASE_SERVICE_ROLE_KEY || !DEMO_SITE_ORIGIN) {
  throw new Error('Alohida demo loyiha uchun DEMO_SUPABASE_URL, DEMO_SUPABASE_SERVICE_ROLE_KEY, DEMO_SITE_ORIGIN va ALLOW_DEMO_SEED=yes kerak. Production bazada ishlatmang.');
}
const client = createClient(DEMO_SUPABASE_URL, DEMO_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const fail = result => { if (result.error) throw result.error; return result.data; };
const { count } = await client.from('products').select('id', { head: true, count: 'exact' });
if (count > 0) throw new Error('Demo seed faqat bo‘sh bazaga mo‘ljallangan. Mavjud mahsulotlar saqlanadi.');
const accounts = [];
const users = [];
for (let i = 0; i < 16; i++) {
  const role = i === 0 ? 'admin' : i <= 5 ? 'seller' : 'customer';
  const email = `dtpi-${role}-${i}@demo.invalid`;
  const password = randomBytes(18).toString('base64url');
  const names = ['DTPI administrator', 'Dilnoza kulolchilik', 'Aziza to‘qimalari', 'Javohir ustaxonasi', 'Madina ijodiy do‘koni', 'Shahzod charm buyumlari', 'Ali Valiyev', 'Zarina Akmalova', 'Sardor Karimov', 'Nilufar Oripova', 'Otabek Rustamov', 'Malika Sodiqova', 'Jamshid Asadov', 'Diyora Rasulova', 'Anvar To‘rayev', 'Sevara Norova'];
  const user = fail(await client.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: names[i] } })).user;
  users.push(user.id); accounts.push({ email, password, role });
  // Persist credentials after every user so a partial seed can be recovered. This file is gitignored.
  writeFileSync('demo-accounts.local.json', JSON.stringify(accounts, null, 2));
  if (role !== 'customer') fail(await client.from('user_roles').upsert({ user_id: user.id, role }, { onConflict: 'user_id,role' }));
  if (role === 'seller') fail(await client.from('seller_applications').insert({ user_id: user.id, full_name: names[i], phone: '+998901234567', university: 'DTPI', product_type: 'Qo‘l mehnati', bio: 'Demo do‘kon', status: 'approved' }));
  if (role === 'seller') fail(await client.from('profiles').update({ is_verified_seller: true }).eq('id', user.id));
}
fail(await client.from('categories').upsert(demoCategories, { onConflict: 'id' }));
const products = demoProducts(users.slice(1, 6), DEMO_SITE_ORIGIN.replace(/\/$/, ''));
fail(await client.from('products').insert(products));
for (let i = 6; i < 16; i++) {
  const product = products[i];
  // Use real buyer sessions and real transactional checkout even when seeding.
  const buyer = createClient(DEMO_SUPABASE_URL, process.env.DEMO_SUPABASE_ANON_KEY ?? DEMO_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  fail(await buyer.auth.signInWithPassword({ email: accounts[i].email, password: accounts[i].password }));
  const id = fail(await buyer.rpc('place_order', { p_items: [{ product_id: product.id, quantity: 1 }], p_name: 'Demo xaridor', p_phone: '+998901234567', p_address: 'Surxondaryo, Denov, Mustaqillik 12', p_checkout_key: randomUUID() }));
  if (i % 2 === 0) {
    fail(await client.from('orders').update({ status: 'delivered' }).eq('id', id));
    fail(await client.from('order_items').update({ fulfillment_status: 'delivered' }).eq('order_id', id));
    fail(await buyer.from('reviews').insert({ product_id: product.id, user_id: users[i], rating: i % 3 === 0 ? 4 : 5, comment: 'Mahsulot yoqdi. Qo‘l mehnati juda chiroyli!' }));
  }
}
console.log('Demo tayyor: 1 admin, 5 sotuvchi, 10 xaridor, 10 kategoriya, 40 mahsulot, 10 buyurtma va 5 sharh. Kirish ma’lumotlari demo-accounts.local.json faylida.');
