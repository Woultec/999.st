import api from "./api";
import type { Order, SalesSummary } from "../types";

export async function createOrder(data: {
  items: { productId: number; quantity: number }[];
  paymentMethod?: string;
  shippingAddress?: string;
}) {
  const response = await api.post<{ success: boolean; data: Order }>(
    "/orders",
    data
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

export async function updatePaymentRef(id: number, paymentRef: string) {
  const response = await api.put<{ success: boolean; data: Order }>(
    `/orders/${id}/payment-ref`,
    { paymentRef }
  );
  return response.data;
}

export async function updatePaymentStatus(id: number, paymentStatus: string) {
  const response = await api.put<{ success: boolean; data: Order }>(
    `/orders/${id}/payment`,
    { paymentStatus }
  );
  return response.data;
}

export async function getSalesSummary() {
  const response = await api.get<{ success: boolean; data: SalesSummary }>(
    "/orders/sales-summary"
  );
  return response.data;
}

export async function deleteOrder(id: number) {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/orders/${id}`
  );
  return response.data;
}
