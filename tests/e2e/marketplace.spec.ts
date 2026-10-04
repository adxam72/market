import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { demoCategories, demoProducts } from '../../scripts/demo-data.mjs';

// Frontend integration tests use an explicitly mocked API. Database authorization
// and transactional behavior are independently exercised in test-database.mjs.
const uid = '00000000-0000-0000-0000-000000000001';
const products = demoProducts([uid]).map(p => ({ ...p, seller: { full_name: 'Dilnoza do‘koni' } }));
async function mockApi(page: Page, role = 'guest') {
  let inventory = products.slice();
  const cart: { id: string; user_id: string; product_id: string; quantity: number; product?: typeof products[number] }[] = [];
  let placed: Record<string, unknown> | null = null;
  const user = { id: uid, aud: 'authenticated', role: 'authenticated', email: 'demo@test.invalid', email_confirmed_at: new Date().toISOString(), app_metadata: {}, user_metadata: { full_name: 'Ali Valiyev' }, created_at: new Date().toISOString() };
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS' } }); return; }
    if (url.hostname.includes('fonts.google')) { await route.abort(); return; }
    if (url.pathname.includes('/storage/v1/')) {
      if (route.request().method() === 'POST') await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ Key: 'product-images/test.jpg' }) });
      else await route.fulfill({ status: 200, contentType: 'image/jpeg', body: readFileSync('public/products/p-bowl.jpg') });
      return;
    }
    if (!url.pathname.includes('/rest/v1/') && !url.pathname.includes('/auth/v1/')) { await route.continue(); return; }
    if (route.request().method() === 'OPTIONS') { await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } }); return; }
    const name = url.pathname.split('/').pop();
    const headers = { 'access-control-allow-origin': '*', 'content-type': 'application/json', 'content-range': '0-39/40' };
    let data: unknown = [];
    if (url.pathname.includes('/auth/v1/')) {
      if (name === 'token' || name === 'signup') data = { access_token: 'test-access-token', refresh_token: 'test-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user };
      else data = user;
    } else if (name === 'categories') data = demoCategories;
    else if (name === 'products') {
      const id = url.searchParams.get('id')?.replace('eq.', '');
      if (route.request().method() === 'POST') inventory.push({ ...route.request().postDataJSON(), id: 'created-product', rating_avg: 0, rating_count: 0, seller: { full_name: 'Dilnoza do‘koni' } });
      if (route.request().method() === 'PATCH') inventory = inventory.map(p => p.id === id ? { ...p, ...route.request().postDataJSON() } : p);
      if (route.request().method() === 'DELETE') inventory = inventory.filter(p => p.id !== id);
      let list = inventory.slice();
      for (const [field, value] of url.searchParams) {
        if (value.startsWith('eq.')) list = list.filter(p => String(p[field as keyof typeof p]) === value.slice(3));
        if (value.startsWith('neq.')) list = list.filter(p => String(p[field as keyof typeof p]) !== value.slice(4));
        if (field === 'id' && value.startsWith('in.')) list = list.filter(p => value.includes(p.id));
      }
      data = url.searchParams.has('limit') ? list.slice(0, Number(url.searchParams.get('limit'))) : list;
    } else if (name === 'user_roles') data = role === 'guest' ? [] : [{ role }];
    else if (name === 'cart_items') {
      if (route.request().method() === 'POST') { const row = route.request().postDataJSON(); cart.push({ ...row, id: `cart-${row.product_id}` }); }
      if (route.request().method() === 'DELETE') cart.length = 0;
      data = cart.map(row => ({ ...row, product: products.find(p => p.id === row.product_id) }));
    } else if (name === 'place_order') { placed = route.request().postDataJSON(); cart.length = 0; data = '00000000-0000-0000-0000-000000000999'; }
    else if (name === 'orders') data = placed ? [{ id: 'order', order_number: 'DTPI-TEST', status: 'pending', total: products[0].price, payment_method: 'cod', created_at: new Date().toISOString(), order_items: [{ product_name: products[0].name, quantity: 1, unit_price: products[0].price, fulfillment_status: 'pending' }] }] : [];
    else if (name === 'profiles') data = { id: uid, full_name: 'Ali Valiyev', phone: '+998901234567', university: 'DTPI', bio: '', is_verified_seller: role === 'seller' };
    else if (name === 'seller_orders') data = [];
    if (route.request().headers().accept?.includes('application/vnd.pgrst.object+json') && Array.isArray(data)) data = data[0] ?? null;
    await route.fulfill({ status: 200, headers, body: JSON.stringify(data) });
  });
  return { placed: () => placed };
}
test('homepage and catalog respond on desktop and mobile', async ({ page }, info) => {
  await mockApi(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Katta g/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: products[0].name })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  mkdirSync('artifacts', { recursive: true });
  await page.screenshot({ path: `artifacts/home-${info.project.name}.png`, scale: 'css' });
  await page.goto('/catalog?q=Dilnoza&cat=sopol-idishlar&sale=1', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('2 ta mahsulot', { exact: true })).toBeVisible();
  await page.goto('/catalog?q=notfound', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Hech narsa topilmadi' })).toBeVisible();
  await page.getByRole('button', { name: 'Filtrlarni tozalash', exact: true }).last().click();
  await expect(page.getByText('40 ta mahsulot', { exact: true })).toBeVisible();
});

test('campus motion can be paused and respects reduced motion', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  const illustration = page.locator('.campus-illustration');
  await expect(illustration).toHaveCSS('animation-name', 'campus-float');
  await illustration.evaluate((img: HTMLImageElement) => img.decode());
  await page.getByRole('button', { name: 'Harakatni to‘xtatish', exact: true }).click();
  await expect(illustration).toHaveCSS('animation-play-state', 'paused');
  await expect(page.getByRole('button', { name: 'Harakatni yoqish' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Harakatni yoqish' }).click();
  await expect(illustration).toHaveCSS('animation-play-state', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('.ambient-orb').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.campus-illustration')).toHaveCSS('animation-name', 'none');
  const values = page.getByRole('heading', { name: 'Savdodan ko‘ra ko‘proq.' });
  await values.scrollIntoViewIfNeeded();
  await expect(values).toBeVisible();
  await expect(page.locator('.reveal').last()).toHaveCSS('opacity', '1');
});
test('guest adds a product, keeps it on reload and reaches checkout', async ({ page }) => {
  await mockApi(page);
  await page.goto(`/product/${products[0].slug}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: products[0].name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: "Savatga qo'shish", exact: true }).click();
  await page.goto('/cart', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Savatim (1)' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Savatim (1)' })).toBeVisible();
  await page.getByRole('link', { name: 'Rasmiylashtirish', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Buyurtmani rasmiylashtirish' })).toBeVisible();
});
test('buyer signs up, checks out and tracks order; no price is submitted', async ({ page }) => {
  const api = await mockApi(page, 'customer');
  await page.goto('/auth?next=/catalog', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Ro‘yxatdan o‘tish', exact: true }).click();
  await page.getByLabel('Ism va familiya').fill('Ali Valiyev');
  await page.getByLabel('Email', { exact: true }).fill('demo@test.invalid');
  await page.getByLabel('Parol', { exact: true }).fill('LongPassword123');
  await page.getByRole('button', { name: 'Hisob yaratish', exact: true }).click();
  await expect(page).toHaveURL(/catalog/);
  await page.getByRole('button', { name: 'Savatchaga qo‘shish' }).first().click();
  await expect(page.getByRole('link', { name: 'Savatcha', exact: true })).toContainText('1');
  await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Ism va familiya', { exact: true }).fill('Ali Valiyev');
  await page.getByLabel('Telefon raqami').fill('+998 90 123 45 67');
  await page.getByRole('button', { name: 'Davom etish' }).click();
  await page.getByLabel('Viloyat', { exact: true }).selectOption('Surxondaryo');
  await page.getByLabel('Tuman / shahar').fill('Denov');
  await page.getByLabel('Ko‘cha, uy va xonadon').fill('Mustaqillik 12');
  await page.getByRole('button', { name: 'Davom etish' }).click();
  await page.getByRole('button', { name: 'Davom etish' }).click();
  await page.getByRole('button', { name: 'Buyurtma berish', exact: true }).click();
  await expect(page).toHaveURL(/account\/orders/);
  await expect(page.getByText('DTPI-TEST', { exact: true })).toBeVisible();
  expect(api.placed()).toMatchObject({ p_phone: '+998901234567', p_items: [{ product_id: products[0].id, quantity: 1 }] });
  expect(JSON.stringify(api.placed())).not.toContain('price');
});
test('seller dashboard and product create, edit and delete', async ({ page }) => {
  await mockApi(page, 'seller');
  await page.goto('/auth?next=/seller', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Email', { exact: true }).fill('demo@test.invalid');
  await page.getByLabel('Parol', { exact: true }).fill('LongPassword123');
  await page.getByRole('button', { name: 'Kirish', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Boshqaruv paneli', exact: true })).toBeVisible();
  await page.goto('/seller/products', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Yangi mahsulot' }).click();
  await expect(page.getByRole('heading', { name: 'Yangi mahsulot' })).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Tanlangan', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Mahsulotni saqlash' }).click();
  await expect(page.getByText('Nom va narx kerak', { exact: true })).toBeVisible();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nom', { exact: true }).fill('Sinov sopol mahsuloti');
  await dialog.getByLabel("Narx (so'm)", { exact: true }).fill('99000');
  await dialog.getByLabel('Tavsif', { exact: true }).fill('Qo‘lda yasalgan yangi sopol mahsuloti.');
  await dialog.getByRole('combobox').click();
  await page.getByRole('option', { name: demoCategories[0].name, exact: true }).click();
  await dialog.locator('input[type=file]').setInputFiles('public/products/p-bowl.jpg');
  await expect(dialog.locator('img')).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Mahsulotni saqlash' }).click();
  await expect(dialog).not.toBeVisible();
  const card = page.locator('div.group').filter({ has: page.getByText('Sinov sopol mahsuloti', { exact: true }) });
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Tahrir', exact: true }).click();
  await page.getByRole('dialog').getByLabel("Narx (so'm)", { exact: true }).fill('109000');
  await page.getByRole('button', { name: 'Mahsulotni saqlash' }).click();
  await expect(card.getByText('109 000 so‘m', { exact: true })).toBeVisible();
  page.once('dialog', d => d.accept());
  await card.getByRole('button').last().click();
  await expect(page.getByText('Sinov sopol mahsuloti', { exact: true })).toHaveCount(0);
});
test('guest is redirected from admin and seller entry remains protected', async ({ page }) => {
  await mockApi(page);
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/auth/);
  await expect(page.getByRole('heading', { name: 'Tizimga kirish' })).toBeVisible();
  await page.goto('/seller', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/auth/);
});
