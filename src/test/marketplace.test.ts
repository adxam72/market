import { describe, expect, it } from "vitest";
import { checkoutSchema, filterProducts, productSchema } from "@/lib/marketplace";
import type { Product } from "@/types/db";
const categories = [{ id: "craft", name: "Sopol idishlar", slug: "sopol", display_order: 0, icon: null }];
const base: Product = { id: "1", name: "Moviy kosa", slug: "moviy-kosa", description: "Qo‘lda ishlangan", sku: "K1", price: 50000, stock: 4, compare_at_price: 80000, category_id: "craft", seller_id: null, images: [], is_featured: true, is_active: true, rating_avg: 4.8, rating_count: 5, seller: { full_name: "Dilnoza" } };
describe("Katalog", () => {
  it("searches sellers, descriptions and categories and combines every filter", () => {
    expect(filterProducts([base], categories, new URLSearchParams("q=Dilnoza&cat=sopol&min=40000&max=60000&rating=4&stock=1&sale=1"))).toHaveLength(1);
    expect(filterProducts([base], categories, new URLSearchParams("q=sopol"))).toHaveLength(1);
    expect(filterProducts([base], categories, new URLSearchParams("cat=missing"))).toHaveLength(0);
    expect(filterProducts([base], categories, new URLSearchParams("min=60000"))).toHaveLength(0);
  });
  it("sorts numeric prices and excludes unavailable/undiscounted products", () => {
    const other = { ...base, id: "2", price: 90000, stock: 0, compare_at_price: null };
    expect(filterProducts([base, other], categories, new URLSearchParams("sort=price-desc"))[0].id).toBe("2");
    expect(filterProducts([other], categories, new URLSearchParams("stock=1"))).toHaveLength(0);
    expect(filterProducts([other], categories, new URLSearchParams("sale=1"))).toHaveLength(0);
  });
});
describe("Buyurtma ma’lumotlari", () => {
  const valid = { name: "Ali Valiyev", phone: "+998 (90) 123-45-67", region: "Surxondaryo", district: "Denov", street: "Mustaqillik, 12", landmark: "" };
  it("normalizes Uzbekistan phone numbers", () => { expect(checkoutSchema.parse(valid).phone).toBe("+998901234567"); });
  it("rejects incomplete phones, unrecognized regions and empty addresses", () => {
    for (const change of [{ phone: "1234567" }, { region: "Noma’lum" }, { street: "" }]) expect(checkoutSchema.safeParse({ ...valid, ...change }).success).toBe(false);
  });
});
describe("Mahsulot ma’lumotlari", () => {
  const valid = { name: "Sopol kosa", slug: "sopol-kosa", sku: "K1", description: "Qo‘lda ishlangan yangi kosa", price: 50000, compare_at_price: null, stock: 4, category_id: "123e4567-e89b-12d3-a456-426614174000", images: ["https://example.com/image.jpg"] };
  it("rejects negative prices, fractional inventory and invalid discounts", () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
    for (const change of [{ price: -1 }, { stock: 2.5 }, { compare_at_price: 1000 }, { images: [] }]) expect(productSchema.safeParse({ ...valid, ...change }).success).toBe(false);
  });
});
