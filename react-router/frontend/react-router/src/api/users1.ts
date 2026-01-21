import type { UserRead, UserAuth} from "../models/users1";
import { API_BASE_URL } from "./config";

type Token = { access_token: string; token_type: string };

export async function createUser(user: UserAuth): Promise<UserRead> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error("Failed to create user");
  }
  return response.json();
}


export async function oauthLogin(email: string, password: string): Promise<Token> {
  const body = new URLSearchParams();
  body.append("username", email); 
  body.append("password", password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail ?? "Login failed");
  }

  return response.json()
}


export function saveToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function getToken() {
  return localStorage.getItem("access_token");
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("active_order_id"); //avoid many ids in ecommerce
}

export async function getMe() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;
  return res.json(); // User
}

(window as any).getMe = getMe;

