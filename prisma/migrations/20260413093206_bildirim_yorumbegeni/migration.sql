/*
  Warnings:

  - You are about to drop the column `anonim` on the `Yorum` table. All the data in the column will be lost.
  - You are about to drop the column `yazarAdi` on the `Yorum` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Yorum" DROP COLUMN "anonim",
DROP COLUMN "yazarAdi";

-- CreateTable
CREATE TABLE "YorumBegeni" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "yorumId" TEXT NOT NULL,
    "kullaniciId" TEXT NOT NULL,

    CONSTRAINT "YorumBegeni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bildirim" (
    "id" TEXT NOT NULL,
    "mesaj" TEXT NOT NULL,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "haberId" TEXT,
    "yorumId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kullaniciId" TEXT NOT NULL,

    CONSTRAINT "Bildirim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YorumBegeni_yorumId_kullaniciId_key" ON "YorumBegeni"("yorumId", "kullaniciId");

-- AddForeignKey
ALTER TABLE "YorumBegeni" ADD CONSTRAINT "YorumBegeni_yorumId_fkey" FOREIGN KEY ("yorumId") REFERENCES "Yorum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YorumBegeni" ADD CONSTRAINT "YorumBegeni_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bildirim" ADD CONSTRAINT "Bildirim_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
