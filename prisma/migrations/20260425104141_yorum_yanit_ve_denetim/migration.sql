-- AlterTable
ALTER TABLE "Yorum" ADD COLUMN     "gizli" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "YorumBildiri" (
    "id" TEXT NOT NULL,
    "sebep" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "yorumId" TEXT NOT NULL,
    "bildirenId" TEXT NOT NULL,

    CONSTRAINT "YorumBildiri_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YorumBildiri_yorumId_bildirenId_key" ON "YorumBildiri"("yorumId", "bildirenId");

-- CreateIndex
CREATE INDEX "Yorum_haberId_parentId_createdAt_idx" ON "Yorum"("haberId", "parentId", "createdAt");

-- AddForeignKey
ALTER TABLE "Yorum" ADD CONSTRAINT "Yorum_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Yorum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YorumBildiri" ADD CONSTRAINT "YorumBildiri_yorumId_fkey" FOREIGN KEY ("yorumId") REFERENCES "Yorum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YorumBildiri" ADD CONSTRAINT "YorumBildiri_bildirenId_fkey" FOREIGN KEY ("bildirenId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
