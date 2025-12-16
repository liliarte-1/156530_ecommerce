export interface Product {
  id: number;              // int PK
  title: string;           // required
  slug: string;            // unique
  description?: string;    // optional
  price_cents: number;     // integer
  currency: string;        // "USD" por defecto
  stock: number;           // current inventory
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
