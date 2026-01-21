import type { OrderItemCreate, OrderItemRead, OrderItemUpdate } from "../models/orderItems";

const API_BASE_URL = "http://localhost:8000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not logged in");
  return { Authorization: `Bearer ${token}` };
}

export async function createOrderItem(payload: OrderItemCreate): Promise<OrderItemRead> {
  const res = await fetch(`${API_BASE_URL}/order-items/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function listOrderItems(params: { order_id: number }): Promise<OrderItemRead[]> {
  const url = new URL(`${API_BASE_URL}/order-items/`);
  url.searchParams.set("order_id", String(params.order_id));

  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateOrderItem(itemId: number, patch: OrderItemUpdate): Promise<OrderItemRead> {
  const res = await fetch(`${API_BASE_URL}/order-items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteOrderItem(itemId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/order-items/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
