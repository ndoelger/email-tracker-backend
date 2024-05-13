/*
  Warnings:

  - The primary key for the `Email` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Email" DROP CONSTRAINT "Email_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Email_pkey" PRIMARY KEY ("id");
