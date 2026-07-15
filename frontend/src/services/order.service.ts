import api from "./api";
import type { Order } from "../types";

export async function createOrder(items: { productId: number; quantity: number }[]) {
  const response = await api.post<{ success: boolean; data: Order }>(
    "/orders",
    { items }
  );
  return response.data;
}

export async function getMyOrders() {
  const response = await api.get<{ success: boolean; data: Order[] }>(
    "/orders/my-orders"
  );
  return response.data;
}

export async function getOrderById(id: number) {
  const response = await api.get<{ success: boolean; data: Order }>(
    `/orders/${id}`
  );
  return response.data;
}

export async function getAllOrders() {
  const response = await api.get<{ success: boolean; data: Order[] }>(
    "/orders"
  );
  return response.data;
}

export async function updateOrderStatus(id: number, status: string) {
  const response = await api.put<{ success: boolean; data: Order }>(
    `/orders/${id}/status`,
    { status }
  );
  return response.data;
}

export async function deleteOrder(id: number) {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/orders/${id}`
  );
  return response.data;
}
