// ─── Admin Password Reset Script ─────────────────────────
// Gamitin: npx tsx src/scripts/reset-admin-password.ts [newPassword]
//
// Examples:
//   npx tsx src/scripts/reset-admin-password.ts              → password: admin123
//   npx tsx src/scripts/reset-admin-password.ts MyNewPass123  → password: MyNewPass123

import bcrypt from "bcrypt";
import prisma from "../prisma/client";

const SALT_ROUNDS = 10;

async function main() {
  const adminEmail = "admin@email.com";
  const newPassword = process.argv[2] || "admin123"; // Default: admin123

  // Validate password length
  if (newPassword.length < 6) {
    console.error("❌ Password must be at least 6 characters long!");
    await prisma.$disconnect();
    process.exit(1);
  }

  // Hanapin ang admin user
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    console.error(`❌ Hindi mahanap ang admin user na may email: ${adminEmail}`);
    console.log("Gumawa ka muna ng admin via POST /api/auth/register");
    await prisma.$disconnect();
    process.exit(1);
  }

  // I-hash ang bagong password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // I-update ang password
  await prisma.user.update({
    where: { id: admin.id },
    data: { password: hashedPassword },
  });

  console.log(`✅ Password ng admin (${adminEmail}) ay na-reset na!`);
  console.log(`   Bagong password: ${newPassword}`);
  console.log(`   Role: ${admin.role}`);
  console.log();
  console.log("📝 Pwede ka nang mag-login sa:");
  console.log("   POST http://localhost:5000/api/auth/login");
  console.log(`   Body: { "email": "admin@email.com", "password": "${newPassword}" }`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ Error:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
