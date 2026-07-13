// ─── Setup Route — One-time database seeding via API ────────
// 📌 Ito ang tinatawag mo para magkaroon ng admin account
//    at sample products sa production database (Render).
//
// 🚀 Gamitin: POST https://nine99-st-api.onrender.com/api/setup
//    Hindi kailangan ng token — isang beses lang ito gagana!
//
// ⚠️ Security: Pag may admin na sa database, mag-e-error na ito

import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma/client";

const router = Router();

router.post("/", async (_req, res) => {
  try {
    // ─── Check kung may admin na ──────────────────────
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: "Setup already completed. Admin account already exists.",
      });
      return;
    }

    // ─── 1. Gumawa ng Admin ───────────────────────────
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@email.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // ─── 2. Gumawa ng Sample Products ────────────────
    const products = [
      { name: "Classic White T-Shirt", description: "Timeless white cotton t-shirt", price: 599 },
      { name: "Black Hoodie", description: "Comfortable black oversized hoodie", price: 1299 },
      { name: "Denim Jacket", description: "Stylish blue denim jacket", price: 2499 },
      { name: "Running Shoes", description: "Lightweight running shoes with cushioned sole", price: 3499 },
      { name: "Leather Backpack", description: "Durable genuine leather backpack", price: 1899 },
      { name: "Wireless Earbuds", description: "Bluetooth 5.3 earbuds with noise cancellation", price: 2499 },
      { name: "Sunglasses", description: "Polarized UV400 protection aviator sunglasses", price: 899 },
      { name: "Analog Watch", description: "Minimalist leather strap analog watch", price: 3999 },
    ];

    for (const product of products) {
      await prisma.product.create({
        data: { ...product, userId: admin.id },
      });
    }

    res.status(201).json({
      success: true,
      message: "🎉 Setup complete!",
      data: {
        admin: { email: "admin@email.com", password: "admin123", role: "ADMIN" },
        productsCreated: products.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Setup error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Setup failed",
    });
  }
});

export default router;
