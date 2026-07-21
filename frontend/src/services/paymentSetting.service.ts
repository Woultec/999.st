// ─── Payment Setting Service — E-wallet Management ──────
// 📌 Tawag sa backend para sa e-wallet CRUD

import api from "./api";
import type { PaymentSetting } from "../types";

/** Kunin ang active e-wallets (public) */
export async function getActivePaymentSettings() {
  const response = await api.get<{
    success: boolean;
    data: PaymentSetting[];
  }>("/payment-settings");
  return response.data;
}

/** Kunin lahat ng e-wallets (admin only) */
export async function getAllPaymentSettings() {
  const response = await api.get<{
    success: boolean;
    data: PaymentSetting[];
  }>("/payment-settings/admin");
  return response.data;
}

/** Gumawa ng bagong e-wallet (admin only) */
export async function createPaymentSetting(data: {
  name: string;
  number: string;
  icon?: string;
  isActive?: boolean;
}) {
  const response = await api.post<{
    success: boolean;
    data: PaymentSetting;
  }>("/payment-settings", data);
  return response.data;
}

/** I-update ang e-wallet (admin only) */
export async function updatePaymentSetting(
  id: number,
  data: {
    name?: string;
    number?: string;
    icon?: string;
    isActive?: boolean;
  }
) {
  const response = await api.put<{
    success: boolean;
    data: PaymentSetting;
  }>(`/payment-settings/${id}`, data);
  return response.data;
}

/** Burahin ang e-wallet (admin only) */
export async function deletePaymentSetting(id: number) {
  const response = await api.delete<{
    success: boolean;
    message: string;
  }>(`/payment-settings/${id}`);
  return response.data;
}
