// src/models/orders.ts
export type OrderCreate = {
  currency?: string;
};

export type OrderRead = {
  id: number;
  user_id: number;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
};
