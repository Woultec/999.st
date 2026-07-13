export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "BUYER";
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
