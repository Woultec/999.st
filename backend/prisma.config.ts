// ─── Prisma Config — 999.st Ecommerce ─────────────────────
// Prisma 7 requires datasource config in a separate file

import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

// Load .env file para mabasa ang DATABASE_URL
config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});
