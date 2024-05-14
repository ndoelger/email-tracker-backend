/*
  Warnings:

  - A unique constraint covering the columns `[email_id]` on the table `Email` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email_id` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
CREATE SEQUENCE email_id_seq;
ALTER TABLE "Email" ADD COLUMN     "email_id" BIGINT NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('email_id_seq');
ALTER SEQUENCE email_id_seq OWNED BY "Email"."id";

-- CreateIndex
CREATE UNIQUE INDEX "Email_email_id_key" ON "Email"("email_id");
