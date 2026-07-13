// ─── Database CRUD — Order ─────────────────────────────
// 📌 SERVICE LAYER — ito ang kausap ng database gamit ang Prisma
//    Hindi direktang ginagamit ng routes ito, sa controller dumadaan!

import prisma from "../prisma/client";
import type { OrderStatus } from "../controllers/order.controller";

// ─── Interfaces para sa type safety ────────────────────
// 📌 Ginagawa natin ito para siguradong tama ang data na ipapasa

/** Shape ng item na nasa order request */
interface OrderItemInput {
  productId: number;
  quantity: number;
}

// ─── CREATE Order ──────────────────────────────────────
// 📌 Pwedeng mag-order ang buyer — pipili ng products at quantity
//    Awtomatikong kukunin ang presyo ng product at kakalkulahin ang total

export const createOrder = async (userId: number, items: OrderItemInput[]) => {
  // Kunin ang mga product details para malaman ang presyo
  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  // I-verify na lahat ng products ay existing
  if (products.length !== items.length) {
    throw new Error("One or more products not found");
  }

  // Gawing lookup map para mabilis makuha ang presyo
  const productMap = new Map(products.map((p) => [p.id, p.price]));

  // Kalkulahin ang total price at i-prepare ang order items
  let totalPrice = 0;
  const orderItemsData = items.map((item) => {
    const price = productMap.get(item.productId)!;
    totalPrice += price * item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      price, // 📌 Ini-save natin ang presyo ngayon — kung magbago presyo later, ito pa rin ang reference
    };
  });

  // Gumawa ng order kasama ang items (nested create)
  const order = await prisma.order.create({
    data: {
      userId,
      totalPrice,
      items: {
        create: orderItemsData,
      },
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return order;
};

// ─── GET All Orders (Admin) ────────────────────────────
// 📌 Admin lang makakakita ng lahat ng orders

export const getOrders = async () => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return orders;
};

// ─── GET Orders ng isang User (Buyer) ──────────────────
// 📌 Ang buyer ay makikita lang ang sarili niyang orders

export const getUserOrders = async (userId: number) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true },
          },
        },
      },
    },
  });
  return orders;
};

// ─── GET Order by ID ───────────────────────────────────
// 📌 Kunin ang specific order — pwedeng admin o buyer (sarili lang)

export const getOrderById = async (id: number) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return order;
};

// ─── UPDATE Order Status (Admin) ───────────────────────
// 📌 Admin lang ang pwedeng mag-update ng status ng order
//    Statuses: PENDING → PROCESSING → SHIPPED → DELIVERED | CANCELLED

export const updateOrderStatus = async (id: number, status: OrderStatus) => {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    return order;
  } catch {
    return null;
  }
};

// ─── DELETE Order (Admin) ──────────────────────────────
// 📌 Admin lang pwedeng mag-delete ng order
//    Kailangan munang burahin ang order_items bago ang order (cascade)

export const deleteOrder = async (id: number) => {
  try {
    // Burahin muna ang mga order items
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    // Saka burahin ang order
    const order = await prisma.order.delete({ where: { id } });
    return order;
  } catch {
    return null;
  }
};
