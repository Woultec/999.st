-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_method" TEXT DEFAULT 'COD',
ADD COLUMN     "payment_ref" TEXT,
ADD COLUMN     "payment_status" TEXT NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "shipping_address" TEXT;
