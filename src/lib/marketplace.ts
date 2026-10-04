import { z } from "zod";
import type { Category, Product } from "@/types/db";

export const statusLabels: Record<string, string> = {
  pending: "Kutilmoqda", confirmed: "Tasdiqlandi", preparing: "Tayyorlanmoqda",
  shipped: "Yetkazilmoqda", delivered: "Yetkazildi", cancelled: "Bekor qilindi",
};
export const regions = ["Toshkent shahri", "Toshkent viloyati", "Andijon", "Buxoro", "Farg‘ona", "Jizzax", "Xorazm", "Namangan", "Navoiy", "Qashqadaryo", "Qoraqalpog‘iston Respublikasi", "Samarqand", "Sirdaryo", "Surxondaryo"];
export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Ism va familiyangizni kiriting").max(100, "Ism juda uzun"),
  phone: z.string().transform(v => v.replace(/[\s()-]/g, "")).pipe(z.string().regex(/^\+998\d{9}$/, "Telefonni +998 bilan to‘liq kiriting")),
  region: z.string().refine(v => regions.includes(v), "Viloyatni tanlang"),
  district: z.string().trim().min(2, "Tuman yoki shaharni kiriting").max(100),
  street: z.string().trim().min(3, "Ko‘cha va uy raqamini kiriting").max(250),
  landmark: z.string().trim().max(100, "Mo‘ljal juda uzun"),
});
export const productSchema = z.object({
  name: z.string().trim().min(3, "Mahsulot nomi kamida 3 belgi").max(150),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Havolada kichik lotin harflari, raqam va chiziqcha ishlating"),
  sku: z.string().trim().min(1, "Mahsulot kodi kerak").max(80),
  description: z.string().trim().min(10, "Tavsif kamida 10 belgi").max(5000),
  price: z.number().finite().positive("Narx noldan katta bo‘lsin").max(9999999999),
  compare_at_price: z.number().finite().positive().nullable(),
  stock: z.number().int("Miqdor butun son bo‘lsin").min(0, "Miqdor manfiy bo‘lmasin").max(100000),
  category_id: z.string().uuid("Kategoriya tanlang"),
  images: z.array(z.string().url("Rasm manzili noto‘g‘ri")).min(1, "Kamida bitta rasm yuklang").max(8, "Ko‘pi bilan 8 ta rasm"),
}).refine(p => p.compare_at_price === null || p.compare_at_price > p.price, { message: "Eski narx hozirgi narxdan katta bo‘lsin", path: ["compare_at_price"] });

export function filterProducts(products: Product[], categories: Category[], params: URLSearchParams) {
  const q = (params.get("q") ?? "").toLocaleLowerCase().trim();
  const cat = params.get("cat");
  const min = Number(params.get("min") || 0);
  const max = Number(params.get("max") || Infinity);
  const rating = Number(params.get("rating") || 0);
  const filtered = products.filter(p => {
    const category = categories.find(c => c.id === p.category_id);
    return (!cat || category?.slug === cat)
      && (!q || [p.name, p.description, category?.name, p.seller_name, p.seller?.full_name].filter(Boolean).join(" ").toLocaleLowerCase().includes(q))
      && p.price >= min && p.price <= max && p.rating_avg >= rating
      && (params.get("stock") !== "1" || p.stock > 0)
      && (params.get("sale") !== "1" || (p.compare_at_price ?? 0) > p.price)
      && (params.get("featured") !== "1" || p.is_featured);
  });
  switch (params.get("sort")) {
    case "price-asc": return filtered.sort((a, b) => a.price - b.price);
    case "price-desc": return filtered.sort((a, b) => b.price - a.price);
    case "rating": return filtered.sort((a, b) => b.rating_avg - a.rating_avg);
    default: return filtered;
  }
}
export function errorMessage(error: { message?: string; code?: string } | null) {
  const message = error?.message ?? "";
  if (error?.code === "23505") return "Bu ma’lumot allaqachon mavjud. Mahsulot kodi va havolasini tekshiring.";
  if (/invalid login/i.test(message)) return "Email yoki parol noto‘g‘ri.";
  if (/email not confirmed/i.test(message)) return "Elektron pochtangizdagi tasdiqlash havolasini oching.";
  if (/already registered/i.test(message)) return "Bu email bilan hisob ochilgan. Tizimga kiring.";
  if (/rate limit|too many/i.test(message)) return "Urinishlar ko‘payib ketdi. Birozdan so‘ng qayta urining.";
  if (/[‘’]/.test(message)) return message;
  return "Xatolik yuz berdi. Qayta urinib ko‘ring.";
}
