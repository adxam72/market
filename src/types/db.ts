export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  category_id: string | null;
  seller_id: string | null;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
};

export type CartItemRow = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
};

export type Profile = {
  id: string;
  full_name: string | null;
  university: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_verified_seller: boolean;
};
