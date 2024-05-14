/*
  Warnings:

  - You are about to drop the column `access_token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hub_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hub_domain]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hub_domain` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hub_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_refresh_token_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "access_token",
DROP COLUMN "refresh_token",
ADD COLUMN     "hub_domain" BIGINT NOT NULL,
ADD COLUMN     "hub_id" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_hub_id_key" ON "User"("hub_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_hub_domain_key" ON "User"("hub_domain");
