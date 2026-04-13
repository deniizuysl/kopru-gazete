-- CreateTable
CREATE TABLE "KaydedilenHaber" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kullaniciId" TEXT NOT NULL,
    "haberId" TEXT NOT NULL,

    CONSTRAINT "KaydedilenHaber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KaydedilenHaber_kullaniciId_haberId_key" ON "KaydedilenHaber"("kullaniciId", "haberId");

-- AddForeignKey
ALTER TABLE "KaydedilenHaber" ADD CONSTRAINT "KaydedilenHaber_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KaydedilenHaber" ADD CONSTRAINT "KaydedilenHaber_haberId_fkey" FOREIGN KEY ("haberId") REFERENCES "Haber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
