-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pushToken" TEXT;

-- CreateTable
CREATE TABLE "Etkinlik" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL,
    "konum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Etkinlik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anket" (
    "id" TEXT NOT NULL,
    "soru" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnketSecenegi" (
    "id" TEXT NOT NULL,
    "metin" TEXT NOT NULL,
    "anketId" TEXT NOT NULL,

    CONSTRAINT "AnketSecenegi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnketOyu" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "secenekId" TEXT NOT NULL,
    "anketId" TEXT NOT NULL,
    "kullaniciId" TEXT NOT NULL,

    CONSTRAINT "AnketOyu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnketOyu_anketId_kullaniciId_key" ON "AnketOyu"("anketId", "kullaniciId");

-- AddForeignKey
ALTER TABLE "AnketSecenegi" ADD CONSTRAINT "AnketSecenegi_anketId_fkey" FOREIGN KEY ("anketId") REFERENCES "Anket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnketOyu" ADD CONSTRAINT "AnketOyu_secenekId_fkey" FOREIGN KEY ("secenekId") REFERENCES "AnketSecenegi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
