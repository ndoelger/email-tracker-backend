/*
  Warnings:

  - Added the required column `user_id` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "user_id" BIGINT NOT NULL;
