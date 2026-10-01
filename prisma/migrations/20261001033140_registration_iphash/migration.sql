-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "ipHash" TEXT;

-- CreateIndex
CREATE INDEX "Registration_ipHash_createdAt_idx" ON "Registration"("ipHash", "createdAt");
