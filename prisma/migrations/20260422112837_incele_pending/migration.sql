-- AlterTable
ALTER TABLE "Haber" ADD COLUMN     "incelemeNedeni" TEXT,
ADD COLUMN     "onayBekliyor" BOOLEAN NOT NULL DEFAULT false;
