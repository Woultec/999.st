// ─── Database CRUD — Product ─────────────────────────
import prisma from "../prisma/client";

/** POST /api/products — Gumawa ng bagong product */
export const createProduct = async (
  name: string,
  description: string,
  price: number,
  userId: number,
  imageUrl?: string,
) => {
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      userId,
      ...(imageUrl !== undefined && { imageUrl }),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return product;
};

/** GET /api/products — Kunin ang lahat ng products */
export const getProducts = async () => {
  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return products;
};

/** GET /api/products/:id — Kunin ang isang product */
export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return product;
};

/** PUT /api/products/:id — I-update ang product */
export const updateProduct = async (
  id: number,
  name: string,
  description: string,
  price: number,
  imageUrl?: string,
) => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });
    return product;
  } catch {
    return null;
  }
};

/** DELETE /api/products/:id — Burahin ang product */
export const deleteProduct = async (id: number) => {
  try {
    const product = await prisma.product.delete({
      where: { id },
    });
    return product;
  } catch {
    return null;
  }
};
