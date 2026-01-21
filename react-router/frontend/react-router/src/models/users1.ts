export type UserAuth = {
  username: string;
  email: string;
  password: string;
};

export type UserRead = {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string; 
};

