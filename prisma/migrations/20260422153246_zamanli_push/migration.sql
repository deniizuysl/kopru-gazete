-- CreateTable
CREATE TABLE "ZamanliPush" (
    "id" TEXT NOT NULL,
    "haberId" TEXT,
    "baslik" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "zamanlanan" TIMESTAMP(3) NOT NULL,
    "gonderildi" BOOLEAN NOT NULL DEFAULT false,
    "gonderimTarihi" TIMESTAMP(3),
    "olusturanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZamanliPush_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ZamanliPush_zamanlanan_gonderildi_idx" ON "ZamanliPush"("zamanlanan", "gonderildi");

-- AddForeignKey
ALTER TABLE "ZamanliPush" ADD CONSTRAINT "ZamanliPush_haberId_fkey" FOREIGN KEY ("haberId") REFERENCES "Haber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
