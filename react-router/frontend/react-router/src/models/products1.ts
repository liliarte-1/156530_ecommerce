// src/models/products.ts

export type ProductRead = {
  title: string;
  slug: string;
  description?: string | null;
  price_cents: number;
  currency?: string; // default USD
  stock: number;
};

export type ProductUpdate = Partial<ProductRead>;

export type ProductPublic = ProductRead & {
  id: number;
  created_at: string;
  updated_at: string;
};
