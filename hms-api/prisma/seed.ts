import "dotenv/config";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { createStaffUser } from "../lib/services/staff-users";
import { enableStaffTwoFactor } from "../lib/services/staff-two-factor";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@hmshotel.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin1234!";
  const normalizedEmail = adminEmail.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { staffProfile: true },
  });

  if (existingUser?.twoFactorEnabled && existingUser.staffProfile) {
    return;
  }

  if (!existingUser) {
    await createStaffUser({
      name: "HMS Admin",
      email: normalizedEmail,
      password: adminPassword,
      role: "ADMIN",
      employeeCode: "ADMIN001",
    });
  } else {
    await prisma.staffProfile.upsert({
      where: { userId: existingUser.id },
      update: {
        role: "ADMIN",
        isActive: true,
      },
      create: {
        userId: existingUser.id,
        role: "ADMIN",
        employeeCode: "ADMIN001",
        isActive: true,
      },
    });
  }

  if (existingUser?.twoFactorEnabled) {
    return;
  }

  await enableStaffTwoFactor(normalizedEmail, adminPassword);
}

async function main() {
  await prisma.hotel.upsert({
    where: { id: "hms-hotel" },
    update: {
      name: "HMS Hotel",
    },
    create: {
      id: "hms-hotel",
      name: "HMS Hotel",
      address: "123 Hospitality Lane",
      city: "Metro City",
      country: "US",
      phone: "+1-555-0100",
      email: "info@hmshotel.com",
      timezone: "UTC",
      currency: "USD",
    },
  });

  await seedAdminUser();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
