// ─── Authentication Service — JWT + bcrypt ─────────────
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

export const JWT_SECRET = process.env.JWT_SECRET || "999st-super-secret-key-change-in-production";
const SALT_ROUNDS = 10;

// ─── Register Admin ───────────────────────────────────────
export const registerAdmin = async (name: string, email: string, password: string) => {
  // Check kung may existing user na may parehong email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email already registered" };
  }

  // I-hash ang password bago i-save
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Gumawa ng user na may role ADMIN
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Gumawa ng JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

// ─── Register Buyer ───────────────────────────────────────
export const registerBuyer = async (name: string, email: string, password: string) => {
  // Check kung may existing user na may parehong email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email already registered" };
  }

  // I-hash ang password bago i-save
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Gumawa ng user na may role BUYER
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "BUYER",
    },
  });

  // Gumawa ng JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

// ─── Update Profile (name, email) ──────────────────────────
export const updateProfile = async (userId: number, name: string, email: string) => {
  // Check kung may ibang user na gumagamit na ng email na ito
  const existing = await prisma.user.findFirst({
    where: { email, id: { not: userId } },
  });
  if (existing) {
    return { error: "Email is already taken by another user" };
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name, email },
  });

  return {
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      createdAt: updated.createdAt,
    },
  };
};

// ─── Change Password ──────────────────────────────────────
export const changePassword = async (userId: number, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.password) {
    return { error: "Cannot change password for this account" };
  }

  // I-verify ang current password
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return { error: "Current password is incorrect" };
  }

  // I-hash ang bagong password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
};

// ─── Login (Admin o Buyer) ────────────────────────────────
export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Hindi mahanap ang user o walang password (Google OAuth users)
  if (!user || !user.password) {
    return { error: "Invalid email or password" };
  }

  // I-verify ang password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  // Gumawa ng JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};
