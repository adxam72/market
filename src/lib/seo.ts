export const SITE_URL = 'https://dtpi.store';
export const SITE_NAME = 'DTPI Market';
export const SITE_IMAGE = `${SITE_URL}/seo/campus-community.webp`;

export type SeoPage = { title: string; description: string; image?: string; noindex?: boolean };
export const publicPages: Record<string, SeoPage> = {
  '/': { title: 'DTPI Market — Denovdagi mahalliy talabalar savdo maydoni', description: 'DTPI Market — DTPI talabalari va mahalliy ijodkorlar mahsulotlari. DTPI hududi va Denovdagi yaqin atrofda xarid qiling, yoningizdagi ijodkorni qo‘llab-quvvatlang.' },
  '/catalog': { title: 'Mahsulotlar katalogi — DTPI Market, Denov', description: 'DTPI Market katalogidan mahalliy mahsulotlarni toping. Kategoriya va narx bo‘yicha qidiring. Xizmat hududi: DTPI va Denovdagi yaqin atrof.' },
  '/about': { title: 'DTPI Market haqida — Bilim, ijod va mahalliy hamkorlik', description: 'DTPI Market talabalar va mahalliy ijodkorlarni birlashtiradi. Bilim, ijod, o‘zaro hurmat va halol hamkorlik — hamjamiyatimiz qadriyatlari.' },
  '/sell': { title: 'Sotuvchi bo‘lish — DTPI Market', description: 'DTPI Market hamjamiyatiga mahsulotingizni tanishtiring. Mahalliy savdo maydonida sotuvchi bo‘lish uchun ariza yuboring.' },
  '/faq': { title: 'Savol va javoblar — DTPI Market yordam markazi', description: 'DTPI Marketda xarid, mahalliy topshirish, naqd to‘lov va sotuvchi bo‘lish haqidagi savollarga javoblar.' },
  '/info/delivery': { title: 'DTPI va Denovda mahalliy topshirish — DTPI Market', description: 'DTPI hududi va Denovdagi yaqin atrofda mahsulotni qabul qilish. Topshirish joyi va vaqti sotuvchi bilan kelishiladi. Respublika bo‘ylab yetkazish mavjud emas.' },
  '/info/payment': { title: 'To‘lov haqida — DTPI Market', description: 'DTPI Marketda mahsulotni qabul qilganda naqd to‘lov qilish va buyurtma summasi haqida ma’lumot.' },
  '/info/returns': { title: 'Qaytarish va murojaatlar — DTPI Market', description: 'DTPI Marketda buyurtma yoki mahsulot bilan bog‘liq muammo yuzaga kelganda murojaat qilish tartibi.' },
  '/info/privacy': { title: 'Maxfiylik siyosati — DTPI Market', description: 'DTPI Marketda foydalanuvchi ma’lumotlari va maxfiylikka oid ma’lumotlar.' },
  '/info/terms': { title: 'Foydalanish shartlari — DTPI Market', description: 'DTPI Market mahalliy savdo maydonidan foydalanish, xarid qilish va sotuvchi bo‘lish shartlari.' },
};

export function routeSeo(pathname: string): SeoPage {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  if (publicPages[path]) return publicPages[path];
  if (/^\/product\/[^/]+$/.test(path)) return { title: 'Mahsulot — DTPI Market', description: 'DTPI Marketdagi mahsulot tavsifi, rasmlari va xarid shartlari. DTPI va Denovdagi yaqin hamjamiyat uchun.' };
  return { title: 'DTPI Market', description: publicPages['/'].description, noindex: true };
}

export function canonicalUrl(pathname: string) {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return `${SITE_URL}${path}`;
}

export function structuredData(pathname: string) {
  if (pathname !== '/') return null;
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, alternateName: ['DTPI Market Denov', 'dtpi.store'], url: `${SITE_URL}/`, inLanguage: 'uz', description: publicPages['/'].description };
}

export function applySeo(pathname: string, page: SeoPage) {
  document.title = page.title;
  const setMeta = (key: string, value: string, property = false) => {
    const attribute = property ? 'property' : 'name';
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attribute, key); document.head.appendChild(tag); }
    tag.content = value;
  };
  setMeta('description', page.description);
  setMeta('robots', page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
  setMeta('og:title', page.title, true);
  setMeta('og:description', page.description, true);
  setMeta('og:url', canonicalUrl(pathname), true);
  setMeta('og:image', page.image || SITE_IMAGE, true);
  setMeta('twitter:title', page.title);
  setMeta('twitter:description', page.description);
  setMeta('twitter:image', page.image || SITE_IMAGE);
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = canonicalUrl(pathname);
  document.getElementById('site-structured-data')?.remove();
  const data = structuredData(pathname);
  if (data) { const script = document.createElement('script'); script.id = 'site-structured-data'; script.type = 'application/ld+json'; script.textContent = JSON.stringify(data); document.head.appendChild(script); }
}
