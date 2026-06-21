import "dotenv/config";

import { generateId } from "@better-auth/core/utils/id";
import { hashPassword } from "better-auth/crypto";

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "../lib/auth";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function getCookieHeader(setCookie: string | null) {
  if (!setCookie) {
    return "";
  }

  return setCookie
    .split(/,(?=\s*[^;]+=[^;]+)/)
    .map((cookie) => cookie.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

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

  let userId = existingUser?.id;

  if (!existingUser) {
    const userIdGenerated = generateId();
    const passwordHash = await hashPassword(adminPassword);

    const user = await prisma.user.create({
      data: {
        id: userIdGenerated,
        name: "HMS Admin",
        email: normalizedEmail,
        emailVerified: true,
      },
    });

    await prisma.account.create({
      data: {
        id: generateId(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });

    userId = user.id;
  }

  if (!userId) {
    throw new Error("Failed to resolve admin user id during seeding.");
  }

  await prisma.staffProfile.upsert({
    where: { userId },
    update: {
      role: "ADMIN",
      isActive: true,
    },
    create: {
      userId,
      role: "ADMIN",
      employeeCode: "ADMIN001",
      isActive: true,
    },
  });

  if (existingUser?.twoFactorEnabled) {
    return;
  }

  const signInResponse = await auth.api.signInEmail({
    body: {
      email: normalizedEmail,
      password: adminPassword,
    },
    asResponse: true,
  });

  if (!signInResponse.ok) {
    throw new Error("Failed to sign in seeded admin user.");
  }

  const cookieHeader = getCookieHeader(signInResponse.headers.get("set-cookie"));

  await auth.api.enableTwoFactor({
    body: {
      password: adminPassword,
    },
    headers: {
      cookie: cookieHeader,
    },
  });
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
