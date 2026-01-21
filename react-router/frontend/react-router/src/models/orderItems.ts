// src/models/orderItems.ts

export type OrderItemCreate = {
  order_id: number;
  product_id: number;
  quantity: number; // >= 1
};

export type OrderItemRead = {
  id: number;
  order_id: number;
  name: string;
  product_id: number;
  unit_price_cents: number;
  quantity: number;
};

export type OrderItemUpdate = {
  quantity?: number; // >= 1
};
