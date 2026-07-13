// ─── Database CRUD — User ────────────────────────────
import prisma from "../prisma/client";

/** POST /api/users — Gumawa ng bagong user */
export const createUser = async (name: string, email: string) => {
  const user = await prisma.user.create({
    data: { name, email },
  });
  return user;
};

/** GET /api/users — Kunin ang lahat ng users */
export const getUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
  });
  return users;
};

/** GET /api/users/:id — Kunin ang isang user */
export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
};

/** PUT /api/users/:id — I-update ang user */
export const updateUser = async (id: number, name: string, email: string) => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name, email },
    });
    return user;
  } catch {
    return null;
  }
};

/** DELETE /api/users/:id — Burahin ang user */
export const deleteUser = async (id: number) => {
  try {
    const user = await prisma.user.delete({
      where: { id },
    });
    return user;
  } catch {
    return null;
  }
};
