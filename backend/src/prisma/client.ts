import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// Konek sa PostgreSQL gamit ang connection string
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in .env file!");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

// Singleton pattern — iisa lang ang PrismaClient sa buong app
const prisma = new PrismaClient({ adapter });

export default prisma;
