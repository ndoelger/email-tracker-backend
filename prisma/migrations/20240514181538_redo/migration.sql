/*
  Warnings:

  - You are about to drop the column `user_id` on the `Email` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email_id]` on the table `Email` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hub_id` to the `Email` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Email" DROP COLUMN "user_id",
ADD COLUMN     "hub_id" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Email_email_id_key" ON "Email"("email_id");

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "User"("hub_id") ON DELETE RESTRICT ON UPDATE CASCADE;
