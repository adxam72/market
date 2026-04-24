# DTPI Market

DTPI (Davlat texnika va pedagogika instituti) talabalari tomonidan qo'lda yasalgan noyob mahsulotlar bozori.

## Texnologiyalar

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui + Lucide Icons
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **State:** React Context (Auth, Cart, Favorites)
- **Font:** Fraunces (sarlavhalar) + Inter (asosiy matn)

## Loyihani kompyuterda ishga tushirish

### 1. Repo'ni klonlash
```bash
git clone https://github.com/adxam72/student-sparkle-shop.git
cd student-sparkle-shop
```

### 2. Paketlarni o'rnatish
```bash
npm install
```

### 3. Environment sozlash
`.env` fayli repoda bor. Agar o'z Supabase loyihangizni ishlatsangiz, `.env` dagi qiymatlarni o'zgartiring:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### 4. Supabase migratsiyalarni ishlatish
Supabase Dashboard → SQL Editor ga kirib, `supabase/migrations/` papkasidagi SQL fayllarni ketma-ket ishga tushiring.

**Muhim:** `20260424_support_and_admin.sql` migratsiyasini ishga tushiring — bu:
- `support_tickets` jadvalini yaratadi
- Admin rollarni beradi
- Review unique constraint qo'shadi

### 5. Ishga tushirish
```bash
npm run dev
```
Brauzerda `http://localhost:5173` ochiladi.

### 6. Production build
```bash
npm run build
npm run preview
```

## Loyiha tuzilishi

```
src/
├── assets/          # Rasmlar va logo
├── components/
│   ├── admin/       # Admin layout
│   ├── layout/      # Header, Footer, Layout
│   └── ui/          # shadcn/ui komponentlari
├── context/         # Auth, Cart, Favorites kontekstlari
├── hooks/           # useRole, useMobile, useToast
├── integrations/    # Supabase client va tiplar
├── lib/             # Yordamchi funksiyalar (format, utils)
├── pages/
│   ├── admin/       # Admin panel sahifalari
│   ├── info/        # Info sahifalar (delivery, payment, returns...)
│   ├── Auth.tsx     # Kirish / Ro'yxatdan o'tish
│   ├── Catalog.tsx  # Katalog
│   ├── Checkout.tsx # Buyurtma berish
│   ├── Support.tsx  # Yordam / Shikoyat
│   └── ...
└── types/           # TypeScript tiplar
```

## Asosiy funksiyalar

- **Katalog** — kategoriya bo'yicha filter, qidiruv
- **Savat** — mahsulot qo'shish, miqdor o'zgartirish
- **Checkout** — buyurtma berish (naqd to'lov)
- **Sharhlar** — faqat mahsulotni qabul qilgan foydalanuvchilar sharh yoza oladi (yulduzcha bilan)
- **Sevimlilar** — mahsulotni tanlanganlarga qo'shish
- **Sotuvchi bo'lish** — ariza yuborish, admin tasdiqlaydi
- **Yordam / Shikoyat** — foydalanuvchi murojaat yuboradi (aniq mahsulotni tanlab), admin javob beradi
- **Admin panel** — buyurtmalar, mahsulotlar, kategoriyalar, foydalanuvchilar, sotuvchi arizalari, shikoyatlar boshqaruvi

## Admin panel

`/admin` sahifasiga kirish uchun foydalanuvchiga `admin` roli berilgan bo'lishi kerak.

Admin Supabase SQL Editor orqali yoki admin paneldagi "Foydalanuvchilar" bo'limidan rol bera oladi.

## Dizayn o'zgartirish

Ranglar `src/index.css` dagi CSS custom properties orqali boshqariladi. Asosiy rang sxemasi binafsha-ko'k gradient.

---

Toshkentda muhabbat bilan yaratildi 💜
