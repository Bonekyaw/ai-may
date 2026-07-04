import { generateId } from "@better-auth/core/utils/id";
import { hashPassword } from "better-auth/crypto";

import type { StaffRole } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";

type CreateStaffUserInput = {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  employeeCode?: string | null;
};

export async function createStaffUser(input: CreateStaffUserInput) {
  const normalizedEmail = input.email.toLowerCase().trim();
  const employeeCode = input.employeeCode?.trim() || null;
  const userId = generateId();
  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        id: userId,
        name: input.name.trim(),
        email: normalizedEmail,
        emailVerified: true,
      },
    });

    await tx.account.create({
      data: {
        id: generateId(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: passwordHash,
      },
    });

    const staffProfile = await tx.staffProfile.create({
      data: {
        userId: user.id,
        role: input.role,
        employeeCode,
        isActive: true,
      },
    });

    return { user, staffProfile };
  });
}
