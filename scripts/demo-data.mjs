// DTPI's local craft focus is retained instead of replacing it with an electronics store.
export const demoCategories = [
  ['Sopol idishlar', 'sopol-idishlar', '🏺'], ['Kiyim-kechak', 'kiyim-kechak', '🧣'],
  ['Sumka va aksessuarlar', 'sumka-aksessuarlar', '👜'], ['Uy bezaklari', 'uy-bezaklari', '🏡'],
  ['Taqinchoqlar', 'taqinchoqlar', '💍'], ['Daftar va kitoblar', 'daftar-kitoblar', '📚'],
  ['Xushbo‘y shamlar', 'shamlar', '🕯️'], ['Charm buyumlar', 'charm-buyumlar', '👝'],
  ['Sovg‘alar', 'sovgalar', '🎁'], ['Bolalar uchun', 'bolalar', '🧸'],
].map(([name, slug, icon], i) => ({ id: `10000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`, name, slug, icon, display_order: i }));
const groups = [
  ['p-bowl.jpg', 85000, ['Moviy naqshli sopol kosa', 'Rishton uslubidagi lagan', 'Sopol non likopchasi', 'Qo‘lda ishlangan piyola to‘plami']],
  ['p-scarf.jpg', 140000, ['Yumshoq jun sharf', 'Qo‘lda to‘qilgan kardigan', 'Paxta ipli yozgi ro‘mol', 'Qishki qalpoq va sharf to‘plami']],
  ['p-tote.jpg', 95000, ['Paxta matoli eko sumka', 'Kashtali yelka sumkasi', 'Minimalistik kundalik sumka', 'Tabiiy matoli xarid sumkasi']],
  ['p-macrame.jpg', 160000, ['Makrame devor bezagi', 'O‘simliklar uchun to‘qima osma', 'Qo‘lda to‘qilgan stol yo‘lakchasi', 'Tabiiy ipli dekor panel']],
  ['p-earrings.jpg', 65000, ['Sopol sirg‘alar', 'Qo‘lda terilgan munchoq bilaguzuk', 'Milliy naqshli marjon', 'Yengil polimer sirg‘a to‘plami']],
  ['p-notebook.jpg', 45000, ['Kraft muqovali kundalik', 'Qo‘lda muqovalangan eskiz daftar', 'Talaba uchun reja daftari', 'Ism yoziladigan sovg‘a daftar']],
  ['p-candle.jpg', 70000, ['Lavanda hidli soya sham', 'Vanil hidli dekorativ sham', 'Tabiiy mumli kichik sham', 'Sovg‘abop xushbo‘y sham to‘plami']],
  ['p-tote.jpg', 180000, ['Qo‘lda tikilgan charm hamyon', 'Charm kartalar g‘ilofi', 'Tabiiy charm kalitdon', 'Charm muqovali bloknot']],
  ['p-mug.jpg', 110000, ['Ism yoziladigan sopol krujka', 'Ustoz uchun sovg‘a to‘plami', 'Bayram uchun ijodiy to‘plam', 'Do‘stlar uchun juft krujka']],
  ['p-scarf.jpg', 125000, ['Bolalar uchun yumshoq qalpoq', 'To‘qilgan bolalar sharfchasi', 'Qo‘lda ishlangan yumshoq o‘yinchoq', 'Bolalar uchun iliq to‘plam']],
];
export function demoProducts(sellerIds = [], origin = '') {
  return groups.flatMap(([image, price, names], category) => names.map((name, i) => {
    const n = category * 4 + i + 1;
    return { id: `20000000-0000-0000-0000-${String(n).padStart(12, '0')}`, sku: `DTPI-DEMO-${String(n).padStart(3, '0')}`, name, slug: `dtpi-demo-${n}`, description: `${name} — mahalliy ijodkor tomonidan tayyorlangan mahsulot. Material va o‘lcham haqida sotuvchi bilan aniqlashtiring. Bu namoyish katalogidagi mahsulot.`, price: price + i * 15000, compare_at_price: i % 2 === 0 ? price + i * 15000 + 30000 : null, stock: 5 + i * 3, category_id: demoCategories[category].id, seller_id: sellerIds[n % sellerIds.length] ?? null, images: [`${origin}/products/${image}`], is_featured: n <= 8, is_active: true, rating_avg: 0, rating_count: 0 };
  }));
}
