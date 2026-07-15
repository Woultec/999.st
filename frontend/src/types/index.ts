export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  userId: number;
  user?: {
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

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: number;
  userId: number;
  user?: User;
  items: OrderItem[];
  totalPrice: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentMethod: "COD" | "GCASH" | null;
  paymentStatus: "UNPAID" | "PAID" | "VERIFIED" | "REFUNDED";
  paymentRef: string | null;
  shippingAddress: string | null;
  createdAt: string;
}

export interface SalesSummary {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: { status: string; _count: { id: number } }[];
  recentOrders: Order[];
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
}
