-- CreateTable
CREATE TABLE "Reklam" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "resimUrl" TEXT NOT NULL,
    "tiklamaUrl" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reklam_pkey" PRIMARY KEY ("id")
);
