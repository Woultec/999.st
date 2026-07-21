// ─── Seed Script — 999.st Ecommerce ────────────────────────
// 📌 Ito ang i-run mo para magkaroon ng admin at sample products
//    sa database mo (local man o production sa Render)
//
// 🔧 Paano gamitin:
//    npm run seed
//
// ⚠️ Siguraduhin na ang DATABASE_URL sa .env ay nakaturo
//    sa database na gusto mong i-seed!

import bcrypt from "bcrypt";
import prisma from "../src/prisma/client";

async function main() {
  console.log("🌱 Starting seed...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // ─── 1. Admin User ─────────────────────────────────
  console.log("\n👤 Creating admin user...");

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@email.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@email.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`   ✅ Admin created:`);
  console.log(`      ID:    ${admin.id}`);
  console.log(`      Email: ${admin.email}`);
  console.log(`      Role:  ${admin.role}`);
  console.log(`      Pass:  admin123`);

  // ─── 2. Sample Products ────────────────────────────
  console.log("\n📦 Creating sample products...");

  const products = [
    {
      name: "Classic White T-Shirt",
      description: "Timeless white cotton t-shirt — perfect for everyday wear",
      price: 599,
    },
    {
      name: "Black Hoodie",
      description: "Comfortable black oversized hoodie with front pocket",
      price: 1299,
    },
    {
      name: "Denim Jacket",
      description: "Stylish blue denim jacket with a modern fit",
      price: 2499,
    },
    {
      name: "Running Shoes",
      description: "Lightweight running shoes with cushioned sole",
      price: 3499,
    },
    {
      name: "Leather Backpack",
      description: "Durable genuine leather backpack — fits 15-inch laptop",
      price: 1899,
    },
    {
      name: "Wireless Earbuds",
      description: "Bluetooth 5.3 earbuds with noise cancellation",
      price: 2499,
    },
    {
      name: "Sunglasses",
      description: "Polarized UV400 protection aviator sunglasses",
      price: 899,
    },
    {
      name: "Analog Watch",
      description: "Minimalist leather strap analog watch — water resistant",
      price: 3999,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        userId: admin.id,
      },
    });
    console.log(`   ✅ ${created.name.padEnd(25)} ₱${product.price}`);
  }

  // ─── 3. Default Payment Settings ──────────────────────
  console.log("\n💳 Setting up default e-wallet...");

  await prisma.paymentSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "GCash",
      number: "09297041003",
      icon: "📱",
      isActive: true,
    },
  });

  console.log(`   ✅ GCash: 09297041003`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed complete!");
  console.log(`   👑 Admin: admin@email.com / admin123`);
  console.log(`   📦 Products: ${products.length} items`);
  console.log(`   💳 GCash: 09297041003`);
  console.log(`   🛒 Buyer: buyer@email.com / password123 (kung naka-register na)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
