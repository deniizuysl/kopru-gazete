/*
  Warnings:

  - You are about to drop the column `fotografUrl` on the `Haber` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Haber" DROP COLUMN "fotografUrl",
ADD COLUMN     "fotografUrls" TEXT[];
