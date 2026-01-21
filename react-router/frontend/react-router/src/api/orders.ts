import type { OrderCreate, OrderRead } from "../models/orders";

const API_BASE_URL = "http://localhost:8000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not logged in");
  return { Authorization: `Bearer ${token}` };
}

export async function createOrder(payload: OrderCreate): Promise<OrderRead> {
  const res = await fetch(`${API_BASE_URL}/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getOrder(orderId: number): Promise<OrderRead> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateOrderStatus(orderId: number, statusValue: string): Promise<OrderRead> {
  const url = new URL(`${API_BASE_URL}/orders/${orderId}`);
  url.searchParams.set("status_value", statusValue);

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
