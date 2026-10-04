import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

// Isolated PostgreSQL engine: never connects to the deployed Supabase project.
const db = new PGlite();
const buyer = '00000000-0000-0000-0000-000000000001';
const seller = '00000000-0000-0000-0000-000000000002';
const stranger = '00000000-0000-0000-0000-000000000003';
const admin = '00000000-0000-0000-0000-000000000004';
const product = '00000000-0000-0000-0000-000000000010';
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log(`PASS ${name}`); }
async function scalar(sql, args = []) { return (await db.query(sql, args)).rows[0]?.value; }
async function asUser(id, fn) {
  await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub = '${id}';`);
  try { return await fn(); } finally { await db.exec('RESET ROLE; RESET request.jwt.claim.sub;'); }
}
try {
  await db.exec(`
    CREATE ROLE authenticated; CREATE ROLE anon;
    CREATE SCHEMA auth; CREATE SCHEMA storage;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE TABLE storage.buckets(id text PRIMARY KEY, name text, public boolean);
    CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql AS $$ SELECT string_to_array($1, '/') $$;
    GRANT USAGE ON SCHEMA auth, public TO authenticated, anon;
    GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated, anon;
  `);
  for (const file of readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(`supabase/migrations/${file}`, 'utf8').replace(/^\uFEFF/, ''));
  }
  await check('all historical and upgrade migrations apply', async () => {
    assert.equal(await scalar("SELECT count(*)::int AS value FROM information_schema.tables WHERE table_schema='public'"), 13);
  });
  await db.exec('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated; GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;');
  for (const id of [buyer, seller, stranger, admin]) await db.query('INSERT INTO auth.users(id,email) VALUES ($1,$2)', [id, `${id.slice(-1)}@test.invalid`]);
  await db.query("INSERT INTO public.user_roles(user_id,role) VALUES ($1,'admin'), ($2,'seller')", [admin, seller]);
  await db.query("INSERT INTO public.products(id,sku,name,slug,price,stock,seller_id) VALUES ($1,'K1','Sopol kosa','sopol-kosa',50000,10,$2)", [product, seller]);
  const checkout = async (key, qty = 2, uid = buyer, extra = {}) => asUser(uid, async () => scalar('SELECT public.place_order($1::jsonb,$2,$3,$4,$5) AS value', [JSON.stringify([{ product_id: product, quantity: qty, ...extra }]), 'Ali Valiyev', '+998901234567', 'Denov, Mustaqillik 12', key]));
  let order;
  await check('checkout ignores forged browser prices and decrements inventory', async () => {
    order = await checkout('00000000-0000-0000-0000-000000000100', 2, buyer, { price: 1, seller_id: stranger });
    assert.equal(Number(await scalar('SELECT total AS value FROM public.orders WHERE id=$1', [order])), 100000);
    assert.equal(await scalar('SELECT stock AS value FROM public.products WHERE id=$1', [product]), 8);
    assert.equal(await scalar('SELECT seller_id AS value FROM public.order_items WHERE order_id=$1', [order]), seller);
  });
  await check('same checkout key is idempotent', async () => {
    assert.equal(await checkout('00000000-0000-0000-0000-000000000100'), order);
    assert.equal(await scalar('SELECT stock AS value FROM public.products WHERE id=$1', [product]), 8);
  });
  await check('stock shortage rolls back the entire order', async () => {
    await assert.rejects(() => checkout('00000000-0000-0000-0000-000000000101', 50));
    assert.equal(await scalar('SELECT count(*)::int AS value FROM public.orders'), 1);
  });
  await check('invalid, fractional and negative quantities rejected', async () => {
    for (const qty of [0, -1, 1.5, null]) await assert.rejects(() => checkout('00000000-0000-0000-0000-000000000102', qty));
  });
  await check('unauthenticated checkout rejected', async () => { await assert.rejects(() => db.query("SELECT public.place_order('[]','Ali','+998901234567','Denov',gen_random_uuid())")); });
  await check('buyers cannot directly insert orders or forge order lines', async () => {
    await asUser(buyer, async () => {
      await assert.rejects(() => db.query("INSERT INTO public.orders(user_id,total,shipping_name,shipping_phone,shipping_address) VALUES ($1,1,'Ali','123','Denov')", [buyer]));
      await assert.rejects(() => db.query("INSERT INTO public.order_items(order_id,product_name,unit_price,quantity) VALUES ($1,'fake',1,1)", [order]));
    });
  });
  await check('a buyer cannot read another buyer order', async () => asUser(stranger, async () => { assert.equal(await scalar('SELECT count(*)::int AS value FROM public.orders'), 0); }));
  await check('seller cannot change another seller products or forge ratings', async () => {
    await asUser(stranger, async () => { assert.equal((await db.query('UPDATE public.products SET price=1 WHERE id=$1 RETURNING id', [product])).rows.length, 0); });
    await asUser(seller, async () => { await assert.rejects(() => db.query('UPDATE public.products SET rating_avg=5 WHERE id=$1', [product])); });
  });
  await check('buyers cannot self-approve seller applications', async () => asUser(buyer, async () => {
    await assert.rejects(() => db.query("INSERT INTO public.seller_applications(user_id,full_name,phone,university,product_type,bio,status) VALUES($1,'Ali','123','DTPI','Sopol','Test','approved')", [buyer]));
    await db.query("INSERT INTO public.seller_applications(user_id,full_name,phone,university,product_type,bio) VALUES($1,'Ali','123','DTPI','Sopol','Test')", [buyer]);
    assert.equal((await db.query("UPDATE public.seller_applications SET status='approved' WHERE user_id=$1 RETURNING id", [buyer])).rows.length, 0);
    await assert.rejects(() => db.query('UPDATE public.profiles SET is_verified_seller=true WHERE id=$1', [buyer]));
  }));
  await check('reviews require delivery', async () => asUser(buyer, async () => { await assert.rejects(() => db.query('INSERT INTO public.reviews(product_id,user_id,rating) VALUES($1,$2,5)', [product, buyer])); }));
  const line = await scalar('SELECT id AS value FROM public.order_items WHERE order_id=$1', [order]);
  await check('seller order RPC excludes unrelated sellers and customers', async () => {
    await asUser(seller, async () => { const items = await scalar('SELECT public.seller_orders() AS value'); assert.equal(items.length, 1); assert.equal(items[0].product_name, 'Sopol kosa'); assert.equal('total' in items[0], false); });
    await asUser(stranger, async () => { await assert.rejects(() => db.query('SELECT public.seller_orders()')); await assert.rejects(() => db.query("SELECT public.update_fulfillment($1,'confirmed')", [line])); });
  });
  await check('seller transition rules and delivered order tracking', async () => asUser(seller, async () => {
    await assert.rejects(() => db.query("SELECT public.update_fulfillment($1,'delivered')", [line]));
    for (const status of ['confirmed', 'preparing', 'shipped', 'delivered']) await db.query('SELECT public.update_fulfillment($1,$2)', [line, status]);
  }));
  assert.equal(await scalar('SELECT status AS value FROM public.orders WHERE id=$1', [order]), 'delivered');
  await check('review updates actual product rating after delivery', async () => {
    await asUser(buyer, async () => { await db.query('INSERT INTO public.reviews(product_id,user_id,rating,comment) VALUES($1,$2,4,$3)', [product, buyer, 'Juda chiroyli']); });
    assert.equal(Number(await scalar('SELECT rating_avg AS value FROM public.products WHERE id=$1', [product])), 4);
  });
  await check('admin cancellation restores stock exactly once and is final', async () => {
    const second = await checkout('00000000-0000-0000-0000-000000000103');
    await asUser(admin, async () => {
      await db.query("SELECT public.set_order_status($1,'cancelled')", [second]);
      await db.query("SELECT public.set_order_status($1,'cancelled')", [second]);
      await assert.rejects(() => db.query("SELECT public.set_order_status($1,'confirmed')", [second]));
    });
    assert.equal(await scalar('SELECT stock AS value FROM public.products WHERE id=$1', [product]), 8);
  });
  await check('invalid coupon rolls back order and stock; valid coupon uses server totals', async () => {
    await db.exec("INSERT INTO public.coupons(code,percent,min_total,max_discount,expires_at,usage_limit) VALUES('DTPI10',10,50000,20000,now()+interval '1 day',1)");
    const useCoupon = code => asUser(buyer, () => scalar("SELECT public.place_order($1::jsonb,'Ali Valiyev','+998901234567','Denov, Mustaqillik 12',gen_random_uuid(),$2) AS value", [JSON.stringify([{ product_id: product, quantity: 2 }]), code]));
    await assert.rejects(() => useCoupon('NOTREAL'));
    assert.equal(await scalar('SELECT stock AS value FROM public.products WHERE id=$1', [product]), 8);
    const discounted = await useCoupon('dtpi10');
    assert.equal(Number(await scalar('SELECT total AS value FROM public.orders WHERE id=$1', [discounted])), 90000);
    assert.equal(Number(await scalar('SELECT discount AS value FROM public.orders WHERE id=$1', [discounted])), 10000);
    await assert.rejects(() => useCoupon('DTPI10'));
    assert.equal(await scalar("SELECT used AS value FROM public.coupons WHERE code='DTPI10'"), 1);
  });
  await check('duplicate line entries are combined and checked against total stock', async () => {
    const payload = JSON.stringify([{ product_id: product, quantity: 4 }, { product_id: product, quantity: 4 }]);
    await asUser(buyer, async () => { await assert.rejects(() => db.query("SELECT public.place_order($1::jsonb,'Ali','+998901234567','Denov 12',gen_random_uuid())", [payload])); });
    assert.equal(await scalar('SELECT stock AS value FROM public.products WHERE id=$1', [product]), 6);
  });
  await check('addresses are isolated per buyer', async () => {
    await asUser(buyer, () => db.query("INSERT INTO public.addresses(user_id,label,full_name,phone,region,district,street) VALUES($1,'Uy','Ali Valiyev','+998901234567','Surxondaryo','Denov','Mustaqillik 12')", [buyer]));
    await asUser(stranger, async () => { assert.equal(await scalar('SELECT count(*)::int AS value FROM public.addresses'), 0); });
  });
  await check('private profiles are not exposed in the public catalog', async () => {
    await asUser(stranger, async () => { assert.equal(await scalar('SELECT count(*)::int AS value FROM public.profiles WHERE id=$1', [buyer]), 0); });
    await db.exec('SET ROLE anon');
    assert.equal(await scalar('SELECT count(*)::int AS value FROM public.profiles'), 0);
    await db.exec('RESET ROLE');
  });
  await check('legacy order cancellation never inflates inventory', async () => {
    const legacy = await scalar("INSERT INTO public.orders(user_id,total,shipping_name,shipping_phone,shipping_address) VALUES($1,50000,'Ali','+998901234567','Denov 12') RETURNING id AS value", [buyer]);
    await db.query("INSERT INTO public.order_items(order_id,product_id,product_name,unit_price,quantity,seller_id) VALUES($1,$2,'Kosa',50000,1,$3)", [legacy, product, seller]);
    const before = await scalar('SELECT stock AS value FROM public.products WHERE id=$1', [product]);
    await asUser(admin, () => db.query("SELECT public.set_order_status($1,'cancelled')", [legacy]));
    assert.equal(await scalar('SELECT stock AS value FROM public.products WHERE id=$1', [product]), before);
  });
  await check('seller product CRUD is restricted to their own products', async () => {
    await asUser(seller, async () => {
      const newId = await scalar("INSERT INTO public.products(sku,name,slug,price,stock,seller_id) VALUES('NEW','Yangi sopol','yangi-sopol',60000,5,$1) RETURNING id AS value", [seller]);
      await db.query('UPDATE public.products SET price=65000 WHERE id=$1', [newId]);
      assert.equal(Number(await scalar('SELECT price AS value FROM public.products WHERE id=$1', [newId])), 65000);
      await db.query('DELETE FROM public.products WHERE id=$1', [newId]);
    });
  });
  await check('blocking a seller revokes permissions and hides their products', async () => {
    await db.query("INSERT INTO public.seller_applications(user_id,full_name,phone,university,product_type,bio,status) VALUES($1,'Seller','123','DTPI','Sopol','Test','approved')", [seller]);
    await asUser(admin, () => db.query("UPDATE public.seller_applications SET status='blocked' WHERE user_id=$1", [seller]));
    assert.equal(await scalar("SELECT count(*)::int AS value FROM public.user_roles WHERE user_id=$1 AND role='seller'", [seller]), 0);
    assert.equal(await scalar('SELECT is_active AS value FROM public.products WHERE id=$1', [product]), false);
    await asUser(seller, async () => { await assert.rejects(() => db.query('SELECT public.seller_orders()')); });
  });
  console.log(`Database: ${passed} checks passed.`);
} finally { await db.close(); }
