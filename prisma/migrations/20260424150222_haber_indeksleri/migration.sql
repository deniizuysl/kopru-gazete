-- CreateIndex
CREATE INDEX "Haber_yayinlandiMi_createdAt_idx" ON "Haber"("yayinlandiMi", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Haber_yayinlandiMi_kategori_createdAt_idx" ON "Haber"("yayinlandiMi", "kategori", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Haber_yayinlandiMi_bolge_createdAt_idx" ON "Haber"("yayinlandiMi", "bolge", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Haber_onayBekliyor_createdAt_idx" ON "Haber"("onayBekliyor", "createdAt" DESC);
