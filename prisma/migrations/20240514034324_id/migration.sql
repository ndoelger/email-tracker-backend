/*
  Warnings:

  - You are about to drop the column `email_id` on the `Email` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Email_email_id_key";

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "email_id",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "email_id_seq";
