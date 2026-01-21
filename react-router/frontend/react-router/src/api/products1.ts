import type { ProductPublic, ProductRead, ProductUpdate } from "../models/products1";

import { API_BASE_URL } from "./config";

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.detail) {
      return typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail);
    }
  } catch {
    // ignore
  }
  return `HTTP ${response.status}`;
}

export async function getProducts(): Promise<ProductPublic[]> {
  const response = await fetch(`${API_BASE_URL}/products/`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function getProduct(productId: number): Promise<ProductPublic> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}


export async function createProduct(product: ProductRead): Promise<ProductPublic> {
  const response = await fetch(`${API_BASE_URL}/products/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}


export async function updateProduct(
  productId: number,
  patch: ProductUpdate
): Promise<ProductPublic> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}


export async function deleteProduct(productId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

}
