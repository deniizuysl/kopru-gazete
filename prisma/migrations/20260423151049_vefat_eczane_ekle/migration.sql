-- CreateTable
CREATE TABLE "Vefat" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "yakinlari" TEXT,
    "vefatTarihi" TIMESTAMP(3) NOT NULL,
    "cenazeTarihi" TIMESTAMP(3) NOT NULL,
    "cenazeYeri" TEXT NOT NULL,
    "bolge" TEXT,
    "fotograf" TEXT,
    "ilaveBilgi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vefat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eczane" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "telefon" TEXT,
    "adres" TEXT,
    "nobetBaslangic" TIMESTAMP(3),
    "nobetBitis" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Eczane_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vefat_cenazeTarihi_idx" ON "Vefat"("cenazeTarihi");
