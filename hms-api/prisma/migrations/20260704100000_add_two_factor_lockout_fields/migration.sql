-- AlterTable
ALTER TABLE "twoFactor" ADD COLUMN "failedVerificationCount" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "twoFactor" ADD COLUMN "lockedUntil" TIMESTAMP(3);
