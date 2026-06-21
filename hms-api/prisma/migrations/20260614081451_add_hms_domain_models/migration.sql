-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'MANAGER', 'FRONT_DESK', 'HOUSEKEEPING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'OUT_OF_ORDER');

-- CreateEnum
CREATE TYPE "HousekeepingStatus" AS ENUM ('DIRTY', 'CLEANING_IN_PROGRESS', 'READY', 'INSPECTED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('DIRECT', 'PHONE', 'WALK_IN');

-- CreateEnum
CREATE TYPE "GroupBookingType" AS ENUM ('CORPORATE', 'WEDDING', 'TOUR', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "HousekeepingTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FolioStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ChargeCategory" AS ENUM ('ROOM', 'RESTAURANT', 'BAR', 'SPA', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('PRE_ARRIVAL', 'POST_STAY_REVIEW', 'MARKETING', 'TRANSACTIONAL');

-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('SCHEDULED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "hotel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_type" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseRate" DECIMAL(10,2) NOT NULL,
    "maxOccupancy" INTEGER NOT NULL,
    "bedCount" INTEGER NOT NULL DEFAULT 1,
    "amenities" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "housekeepingStatus" "HousekeepingStatus" NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nationality" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "idDocument" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_preference" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "guest_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_booking" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GroupBookingType" NOT NULL,
    "primaryGuestId" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "groupBookingId" TEXT,
    "confirmationCode" TEXT NOT NULL,
    "checkInDate" DATE NOT NULL,
    "checkOutDate" DATE NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "source" "BookingSource" NOT NULL DEFAULT 'DIRECT',
    "specialRequests" TEXT,
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_room" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "nightlyRate" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_key" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "housekeeping_task" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "status" "HousekeepingTaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "housekeeping_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_ticket" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "roomId" TEXT,
    "reportedById" TEXT,
    "assignedToId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folio" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "status" "FolioStatus" NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "folio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folio_charge" (
    "id" TEXT NOT NULL,
    "folioId" TEXT NOT NULL,
    "category" "ChargeCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "posReference" TEXT,
    "postedById" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folio_charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "folioId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "folioId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "receivedById" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_template" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_log" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "reservationId" TEXT,
    "templateId" TEXT,
    "type" "CommunicationType" NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "status" "CommunicationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communication_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_report" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "reportDate" DATE NOT NULL,
    "shiftLabel" TEXT NOT NULL,
    "openedById" TEXT NOT NULL,
    "closedById" TEXT,
    "openingCash" DECIMAL(10,2) NOT NULL,
    "closingCash" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "shift_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "employeeCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "room_type_hotelId_idx" ON "room_type"("hotelId");

-- CreateIndex
CREATE INDEX "room_hotelId_status_idx" ON "room"("hotelId", "status");

-- CreateIndex
CREATE INDEX "room_hotelId_housekeepingStatus_idx" ON "room"("hotelId", "housekeepingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "room_hotelId_number_key" ON "room"("hotelId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "guest_userId_key" ON "guest"("userId");

-- CreateIndex
CREATE INDEX "guest_email_idx" ON "guest"("email");

-- CreateIndex
CREATE INDEX "guest_phone_idx" ON "guest"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "guest_preference_guestId_category_key" ON "guest_preference"("guestId", "category");

-- CreateIndex
CREATE INDEX "group_booking_hotelId_idx" ON "group_booking"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_confirmationCode_key" ON "reservation"("confirmationCode");

-- CreateIndex
CREATE INDEX "reservation_hotelId_checkInDate_checkOutDate_idx" ON "reservation"("hotelId", "checkInDate", "checkOutDate");

-- CreateIndex
CREATE INDEX "reservation_guestId_idx" ON "reservation"("guestId");

-- CreateIndex
CREATE INDEX "reservation_status_idx" ON "reservation"("status");

-- CreateIndex
CREATE INDEX "reservation_groupBookingId_idx" ON "reservation"("groupBookingId");

-- CreateIndex
CREATE INDEX "reservation_room_roomId_idx" ON "reservation_room"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_room_reservationId_roomId_key" ON "reservation_room"("reservationId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "digital_key_code_key" ON "digital_key"("code");

-- CreateIndex
CREATE INDEX "digital_key_reservationId_idx" ON "digital_key"("reservationId");

-- CreateIndex
CREATE INDEX "housekeeping_task_roomId_idx" ON "housekeeping_task"("roomId");

-- CreateIndex
CREATE INDEX "housekeeping_task_assignedToId_status_idx" ON "housekeeping_task"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "maintenance_ticket_hotelId_status_idx" ON "maintenance_ticket"("hotelId", "status");

-- CreateIndex
CREATE INDEX "maintenance_ticket_assignedToId_idx" ON "maintenance_ticket"("assignedToId");

-- CreateIndex
CREATE UNIQUE INDEX "folio_reservationId_key" ON "folio"("reservationId");

-- CreateIndex
CREATE INDEX "folio_guestId_idx" ON "folio"("guestId");

-- CreateIndex
CREATE INDEX "folio_charge_folioId_idx" ON "folio_charge"("folioId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_folioId_key" ON "invoice"("folioId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "payment_folioId_idx" ON "payment"("folioId");

-- CreateIndex
CREATE INDEX "communication_template_hotelId_idx" ON "communication_template"("hotelId");

-- CreateIndex
CREATE INDEX "communication_log_guestId_idx" ON "communication_log"("guestId");

-- CreateIndex
CREATE INDEX "communication_log_status_scheduledAt_idx" ON "communication_log"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "audit_log_hotelId_createdAt_idx" ON "audit_log"("hotelId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "shift_report_hotelId_reportDate_shiftLabel_key" ON "shift_report"("hotelId", "reportDate", "shiftLabel");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profile_userId_key" ON "staff_profile"("userId");

-- CreateIndex
CREATE INDEX "staff_profile_hotelId_role_idx" ON "staff_profile"("hotelId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profile_hotelId_employeeCode_key" ON "staff_profile"("hotelId", "employeeCode");

-- AddForeignKey
ALTER TABLE "room_type" ADD CONSTRAINT "room_type_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "room_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest" ADD CONSTRAINT "guest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_preference" ADD CONSTRAINT "guest_preference_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_booking" ADD CONSTRAINT "group_booking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_booking" ADD CONSTRAINT "group_booking_primaryGuestId_fkey" FOREIGN KEY ("primaryGuestId") REFERENCES "guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_groupBookingId_fkey" FOREIGN KEY ("groupBookingId") REFERENCES "group_booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_room" ADD CONSTRAINT "reservation_room_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_room" ADD CONSTRAINT "reservation_room_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_room" ADD CONSTRAINT "reservation_room_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "room_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_key" ADD CONSTRAINT "digital_key_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_key" ADD CONSTRAINT "digital_key_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "housekeeping_task" ADD CONSTRAINT "housekeeping_task_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "housekeeping_task" ADD CONSTRAINT "housekeeping_task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "staff_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_ticket" ADD CONSTRAINT "maintenance_ticket_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_ticket" ADD CONSTRAINT "maintenance_ticket_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_ticket" ADD CONSTRAINT "maintenance_ticket_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "staff_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_ticket" ADD CONSTRAINT "maintenance_ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "staff_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folio" ADD CONSTRAINT "folio_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folio" ADD CONSTRAINT "folio_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folio_charge" ADD CONSTRAINT "folio_charge_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folio_charge" ADD CONSTRAINT "folio_charge_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "staff_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_folioId_fkey" FOREIGN KEY ("folioId") REFERENCES "folio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "staff_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_template" ADD CONSTRAINT "communication_template_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "communication_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_report" ADD CONSTRAINT "shift_report_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_report" ADD CONSTRAINT "shift_report_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "staff_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_report" ADD CONSTRAINT "shift_report_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "staff_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profile" ADD CONSTRAINT "staff_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profile" ADD CONSTRAINT "staff_profile_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
