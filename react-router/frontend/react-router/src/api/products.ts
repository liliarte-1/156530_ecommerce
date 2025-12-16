import type { Product } from "../models/products";

const API_BASE_URL = "http://localhost:8000";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}

export async function getProduct(productId: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    throw new Error("Failed to fetch product");
  }
  return response.json();
}

export async function createProduct(product: Product): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    throw new Error("Failed to create product");
  }
  return response.json();
}