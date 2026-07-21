// ─── PaymentSetting Service — E-wallet Management ──────────
// 📌 Admin pwede mag-add/edit/delete ng e-wallet accounts
//    Buyers makakakita ng active e-wallets sa checkout

import prisma from "../prisma/client";

export interface PaymentSettingInput {
  name: string;
  number: string;
  icon?: string;
  isActive?: boolean;
}

// ─── Get all active e-wallets (public) ──────────────────
export async function getActiveSettings() {
  return prisma.paymentSetting.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

// ─── Get all e-wallets (admin only) ─────────────────────
export async function getAllSettings() {
  return prisma.paymentSetting.findMany({
    orderBy: { createdAt: "asc" },
  });
}

// ─── Create new e-wallet (admin only) ───────────────────
export async function createSetting(data: PaymentSettingInput) {
  return prisma.paymentSetting.create({
    data: {
      name: data.name,
      number: data.number,
      icon: data.icon || "📱",
      isActive: data.isActive ?? true,
    },
  });
}

// ─── Update e-wallet (admin only) ───────────────────────
export async function updateSetting(id: number, data: Partial<PaymentSettingInput>) {
  return prisma.paymentSetting.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.number !== undefined && { number: data.number }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

// ─── Delete e-wallet (admin only) ───────────────────────
export async function deleteSetting(id: number) {
  return prisma.paymentSetting.delete({
    where: { id },
  });
}
