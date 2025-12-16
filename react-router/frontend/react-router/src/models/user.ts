export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password_hash: string;
}

export interface UserLogin {
  email: string;
  password_hash: string;
}
