-- CreateEnum
CREATE TYPE "ReklamDurum" AS ENUM ('BEKLEMEDE', 'ONAYLANDI', 'REDDEDILDI', 'SURESI_DOLDU');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Kategori" ADD VALUE 'YASAM';
ALTER TYPE "Kategori" ADD VALUE 'MANISA';
ALTER TYPE "Kategori" ADD VALUE 'TARIM';

-- AlterTable
ALTER TABLE "Reklam" ADD COLUMN     "aciklama" TEXT,
ADD COLUMN     "adminNotu" TEXT,
ADD COLUMN     "baslangic" TIMESTAMP(3),
ADD COLUMN     "bitis" TIMESTAMP(3),
ADD COLUMN     "durum" "ReklamDurum" NOT NULL DEFAULT 'ONAYLANDI',
ADD COLUMN     "iletisimAd" TEXT,
ADD COLUMN     "isletmeAdi" TEXT,
ADD COLUMN     "odendi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sureGun" INTEGER,
ADD COLUMN     "telefon" TEXT;

-- CreateIndex
CREATE INDEX "Reklam_durum_aktif_bitis_idx" ON "Reklam"("durum", "aktif", "bitis");
