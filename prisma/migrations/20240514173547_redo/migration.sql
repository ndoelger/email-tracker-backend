-- DropIndex
DROP INDEX "User_hub_domain_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "hub_domain" SET DATA TYPE TEXT;
