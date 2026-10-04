# DTPI Market

DTPI talabalarining ijodi va mahalliy sotuvchilar uchun o‘zbek tilidagi marketplace. Mavjud loyiha asosida yangilandi: **React 18 + TypeScript + Vite**, **Tailwind + shadcn/ui**, **Supabase PostgreSQL + Auth + Storage**, Vercel hosting.

## Ishga tushirish

```powershell
npm ci
Copy-Item .env.example .env
```

`.env` faylida o‘z Supabase loyihangizning URL va publishable/anon kalitini yozing. Bu ikki qiymat brauzer uchun mo‘ljallangan. **Service-role kalitini VITE_ o‘zgaruvchilariga yozmang.** `.env` Git orqali yuborilmaydi.

```powershell
npm run dev
```

Mahalliy manzil: `http://localhost:8080`.

## Mavjud Supabase bazasini yangilash

Mavjud baza nusxasini saqlang. SQL Editor yoki Supabase CLI orqali **faqat yangi** migratsiyalarni tartib bilan qo‘llang:

1. `supabase/migrations/202610030001_marketplace_upgrade.sql`
2. `supabase/migrations/202610030002_addresses.sql`

Avval migratsiyalar, keyin yangi frontendni chiqarish kerak: checkout endi `place_order` RPC dan foydalanadi. Eski frontend bu migratsiyalardan keyin buyurtmani to‘g‘ridan-to‘g‘ri yozolmaydi. Shuning uchun yangilashni bitta xizmat oynasida bajaring. Migratsiyalar mavjud mahsulot va buyurtmalarni o‘chirmaydi; eski buyurtmalardagi ombor hisobi yangi buyurtmalardan alohida saqlanadi.

Yangi, bo‘sh Supabase loyiha uchun `supabase/migrations` ichidagi barcha fayllarni nomi bo‘yicha tartib bilan qo‘llang. Har birini bir marta ishlating. Tarixiy support migratsiyasidagi `has_role` argument tartibi tuzatildi. Yangi migratsiya support jadvali va siyosatlarini ham tiklaydi.

Admin huquqini bazaga egalik qiluvchi administrator ishonchli foydalanuvchi UUIDsi bo‘yicha beradi:

```sql
insert into public.user_roles(user_id, role)
values ('ADMIN_FOYDALANUVCHI_UUID', 'admin')
on conflict (user_id, role) do nothing;
```

Frontend orqali o‘ziga admin yoki sotuvchi huquqini berish mumkin emas.

## Vercel va mavjud domen

1. Shu GitHub repozitoriyni mavjud Vercel loyihasiga ulang. Mavjud domenni shu loyihada qoldiring.
2. Framework: **Vite**. Build: `npm run build`. Output: `dist`.
3. Production va Preview Environment Variables bo‘limlarida `VITE_SUPABASE_URL` va `VITE_SUPABASE_PUBLISHABLE_KEY` ni kiriting.
4. Supabase → Authentication → URL Configuration:
   - Site URL: haqiqiy domeningizning `https://...` manzili;
   - Redirect URLs: haqiqiy domen va sinov Vercel manzillarini kiriting. Mahalliy sinov uchun `http://localhost:8080/**` ni qo‘shing.
5. Ro‘yxatdan o‘tish va parolni tiklash xatlari uchun Supabase SMTP ni sozlang, domen emailini tekshiring.
6. Preview deploymentni tekshiring, so‘ng Production branchni yangilang.

`vercel.json` SPA sahifalarini qayta ochish (`/product/...`, `/seller/...`, `/admin/...`) va himoya sarlavhalarini sozlaydi. Saytning barcha yo‘llari HTTPS domen orqali tekshirilishi kerak. DNS qiymatlari Vercel domen sozlamasidan olinadi; domen noma’lum bo‘lganda taxminiy DNS yozilmaydi.

Hozirgi ish seansida repodagi Supabase manziliga ulanish tasdiqlanmadi. Jonli bazaga migratsiya qo‘llash, jonli foydalanuvchi yaratish yoki Vercel Production deployment bajarilmadi.

## Ishlaydigan qismlar

- O‘zbekcha bosh sahifa, mobil qidiruv va navigatsiya, kategoriya kartalari.
- Mahsulot/sotuvchi/kategoriya/tavsif bo‘yicha qidiruv, narx, reyting, chegirma va ombor filtrlari; saralash va sahifalash.
- Mahsulot galereyasi, reyting, sharhlar, savatcha va sevimlilar.
- Mehmon savatchasi; kirishda saqlangan mahsulotlarni hisobga ko‘chirish.
- Bosqichli checkout, O‘zbekiston viloyatlari, saqlangan manzillar, naqd to‘lov, server tekshiradigan promo kod.
- Buyurtma holati va har bir sotuvchining mahsuloti bo‘yicha alohida tayyorlash holati.
- Profil, manzil CRUD, parolni tiklash va yangilash.
- Sotuvchi arizasi, tasdiqlash/rad etish/bloklash. Bloklanganda mahsulotlar yashiriladi.
- `/seller`: real buyurtmalarga asoslangan savdo grafigi, mahsulot CRUD, rasm yuklash, buyurtmalar va do‘kon ma’lumotlari.
- `/admin`: foydalanuvchilar/rollar, sotuvchilar, mahsulotlar, kategoriyalar, buyurtmalar, savdo grafigi, sharh moderatsiyasi, promo kodlar va murojaatlar.

Mahsulot rang/o‘lcham variantlari uchun alohida ombor modeli, kuryer integratsiyasi, Click/Payme va haqiqiy refund jarayoni bu yangilanishda ulanmagan. Hozir har mahsulot alohida SKU va bitta ombor qoldig‘iga ega; to‘lov yetkazilganda naqd olinadi. Onlayn to‘lov bajarildi deb ko‘rsatilmaydi.

## Backend kafolatlari

`place_order` autentifikatsiyani, aloqa va manzilni, miqdor va omborni tekshiradi. Narx va sotuvchi faqat bazadan olinadi. Mahsulotlar bir xil tartibda bloklanadi, buyurtma va satrlar bitta tranzaksiyada yoziladi, ombor kamayadi. `checkout_key` takroriy yuborishda ikkinchi buyurtma yaratilishining oldini oladi.

`update_fulfillment` faqat tegishli sotuvchi yoki adminga ruxsat beradi va holatlar ketma-ketligini tekshiradi. Bir nechta sotuvchining buyurtmasi alohida satrlarda boshqariladi. Bekor qilish yangi buyurtmadagi rezervni bir marta qaytaradi. Yakunlangan buyurtmani qayta ochib bo‘lmaydi.

RLS xaridorlar ma’lumotlarini ajratadi. Xaridor telefon raqami va profilidagi shaxsiy ma’lumotlar ommaviy katalogda ko‘rsatilmaydi. Katalogda sotuvchining bazadan olingan ko‘rinadigan nomi saqlanadi. Sharhlar yetkazilgan xaridga bog‘lanadi, reyting DB trigger orqali hisoblanadi.

## Demo katalog — alohida bo‘sh loyihada

Production bazaga demo ma’lumot yozmang. Avval alohida Supabase loyihaga migratsiyalarni qo‘llang, so‘ng faqat terminalning shu seansida quyidagilarni belgilang:

```powershell
$env:DEMO_SUPABASE_URL = 'https://DEMO_PROJECT.supabase.co'
$env:DEMO_SUPABASE_SERVICE_ROLE_KEY = 'DEMO_PROJECT_SERVICE_ROLE_KEY'
$env:DEMO_SUPABASE_ANON_KEY = 'DEMO_PROJECT_ANON_KEY'
$env:DEMO_SITE_ORIGIN = 'https://DEMO_SITE.vercel.app'
$env:ALLOW_DEMO_SEED = 'yes'
npm run seed:demo
```

Seed: 1 admin, 5 sotuvchi, 10 xaridor, 10 kategoriya, 40 DTPI yo‘nalishiga mos mahsulot, 10 buyurtma va 5 sharh yaratadi. Parollar tasodifiy yaratiladi va `demo-accounts.local.json` ga yoziladi. Bu faylni Gitga yoki Production saytga yubormang. Bazadagi parollarni Supabase Auth hash qiladi. Namoyish rasmlari `/products` ichida. Seed mavjud mahsulotli bazada to‘xtaydi; uzilgan seedni avtomatik takrorlamang, saqlangan akkauntlar fayli orqali tekshiring.

## Tekshiruvlar

```powershell
npm run typecheck
npm run lint
npm test
npm run test:database
npm run test:ui
npm run build
```

`test:database` PGlite PostgreSQLda migratsiya, RLS, narx/ombor, takroriy buyurtma, sharh, promo kod va sotuvchi huquqlarini **jonli bazaga ulanmasdan** tekshiradi. `test:ui` desktop va mobil Chrome’da bosh sahifa, katalog, savatcha, xaridor va sotuvchi oqimlarini API mock bilan tekshiradi. Jonli Supabase Auth va PostgREST integratsiyasi deploymentdan oldin alohida tekshirilishi kerak.

Playwright testlari o‘rnatilgan Chrome’dan foydalanadi. Chrome mavjud bo‘lmasa, Playwright brauzerini o‘rnating va `playwright.config.ts` dagi channelni moslang. `artifacts/` test suratlari va natijalari uchun; Gitga yuborilmaydi.

Rasmiy texnik manbalar: [Supabase database functions](https://supabase.com/docs/guides/database/functions), [Vercel rewrites](https://vercel.com/docs/routing/rewrites), [GitHub Actions setup-node](https://github.com/actions/setup-node).
