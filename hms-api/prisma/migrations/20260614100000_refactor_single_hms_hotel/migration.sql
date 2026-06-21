-- CreateEnum
CREATE TYPE "ReservationSource" AS ENUM ('FRONT_DESK', 'PHONE', 'WALK_IN');

-- AlterEnum
BEGIN;
CREATE TYPE "CommunicationChannel_new" AS ENUM ('EMAIL', 'SMS');
ALTER TABLE "communication_template" ALTER COLUMN "channel" TYPE "CommunicationChannel_new" USING ("channel"::text::"CommunicationChannel_new");
ALTER TABLE "communication_log" ALTER COLUMN "channel" TYPE "CommunicationChannel_new" USING ("channel"::text::"CommunicationChannel_new");
ALTER TYPE "CommunicationChannel" RENAME TO "CommunicationChannel_old";
ALTER TYPE "CommunicationChannel_new" RENAME TO "CommunicationChannel";
DROP TYPE "public"."CommunicationChannel_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "communication_template" DROP CONSTRAINT "communication_template_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "group_booking" DROP CONSTRAINT "group_booking_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "guest" DROP CONSTRAINT "guest_userId_fkey";

-- DropForeignKey
ALTER TABLE "maintenance_ticket" DROP CONSTRAINT "maintenance_ticket_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "reservation" DROP CONSTRAINT "reservation_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "room_type" DROP CONSTRAINT "room_type_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "shift_report" DROP CONSTRAINT "shift_report_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "staff_profile" DROP CONSTRAINT "staff_profile_hotelId_fkey";

-- DropIndex
DROP INDEX "audit_log_hotelId_createdAt_idx";

-- DropIndex
DROP INDEX "communication_template_hotelId_idx";

-- DropIndex
DROP INDEX "group_booking_hotelId_idx";

-- DropIndex
DROP INDEX "guest_userId_key";

-- DropIndex
DROP INDEX "maintenance_ticket_hotelId_status_idx";

-- DropIndex
DROP INDEX "reservation_hotelId_checkInDate_checkOutDate_idx";

-- DropIndex
DROP INDEX "room_hotelId_housekeepingStatus_idx";

-- DropIndex
DROP INDEX "room_hotelId_number_key";

-- DropIndex
DROP INDEX "room_hotelId_status_idx";

-- DropIndex
DROP INDEX "room_type_hotelId_idx";

-- DropIndex
DROP INDEX "shift_report_hotelId_reportDate_shiftLabel_key";

-- DropIndex
DROP INDEX "staff_profile_hotelId_employeeCode_key";

-- DropIndex
DROP INDEX "staff_profile_hotelId_role_idx";

-- AlterTable
ALTER TABLE "audit_log" DROP COLUMN "hotelId";

-- AlterTable
ALTER TABLE "communication_template" DROP COLUMN "hotelId";

-- AlterTable
ALTER TABLE "group_booking" DROP COLUMN "hotelId";

-- AlterTable
ALTER TABLE "guest" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "hotel" ALTER COLUMN "id" SET DEFAULT 'hms-hotel',
ALTER COLUMN "name" SET DEFAULT 'HMS Hotel';

-- AlterTable
ALTER TABLE "maintenance_ticket" DROP COLUMN "hotelId";

-- AlterTable
ALTER TABLE "reservation" DROP COLUMN "hotelId",
DROP COLUMN "source",
ADD COLUMN     "source" "ReservationSource" NOT NULL DEFAULT 'FRONT_DESK';

-- AlterTable
ALTER TABLE "room" DROP COLUMN "hotelId";

-- AlterTable
ALTER TABLE "room_type" DROP COLUMN "hotelId";

-- AlterTable
ALTER TABLE "shift_report" DROP COLUMN "hotelId";

-- AlterTable
ALTER TABLE "staff_profile" DROP COLUMN "hotelId";

-- DropEnum
DROP TYPE "BookingSource";

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "maintenance_ticket_status_idx" ON "maintenance_ticket"("status");

-- CreateIndex
CREATE INDEX "reservation_checkInDate_checkOutDate_idx" ON "reservation"("checkInDate", "checkOutDate");

-- CreateIndex
CREATE UNIQUE INDEX "room_number_key" ON "room"("number");

-- CreateIndex
CREATE INDEX "room_status_idx" ON "room"("status");

-- CreateIndex
CREATE INDEX "room_housekeepingStatus_idx" ON "room"("housekeepingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "shift_report_reportDate_shiftLabel_key" ON "shift_report"("reportDate", "shiftLabel");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profile_employeeCode_key" ON "staff_profile"("employeeCode");

-- CreateIndex
CREATE INDEX "staff_profile_role_idx" ON "staff_profile"("role");
