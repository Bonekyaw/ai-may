"use server";

import { revalidatePath } from "next/cache";

import {
  countActiveAdmins,
  isLastActiveAdmin,
  requireAdmin,
} from "@/lib/auth/staff-access";
import prisma from "@/lib/prisma";
import { createStaffUser } from "@/lib/services/staff-users";
import { enableStaffTwoFactor } from "@/lib/services/staff-two-factor";
import {
  createStaffSchema,
  setStaffActiveSchema,
  updateStaffSchema,
} from "@/lib/validations/staff";

type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export type StaffListItem = {
  staffProfileId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  employeeCode: string | null;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
};

export async function getStaffList(): Promise<ActionResult<StaffListItem[]>> {
  const access = await requireAdmin();

  if (!access.ok) {
    return { success: false, error: access.error };
  }

  const staff = await prisma.staffProfile.findMany({
    select: {
      id: true,
      role: true,
      employeeCode: true,
      isActive: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          twoFactorEnabled: true,
        },
      },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return {
    success: true,
    data: staff.map((item) => ({
      staffProfileId: item.id,
      userId: item.user.id,
      name: item.user.name,
      email: item.user.email,
      role: item.role,
      employeeCode: item.employeeCode,
      isActive: item.isActive,
      twoFactorEnabled: item.user.twoFactorEnabled ?? false,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function createStaff(
  input: unknown,
): Promise<ActionResult<{ staffProfileId: string }>> {
  const access = await requireAdmin();

  if (!access.ok) {
    return { success: false, error: access.error };
  }

  const parsed = createStaffSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, role, employeeCode } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const normalizedEmployeeCode = employeeCode?.trim() || null;

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: { email: ["A staff member with this email already exists."] },
    };
  }

  if (normalizedEmployeeCode) {
    const existingCode = await prisma.staffProfile.findUnique({
      where: { employeeCode: normalizedEmployeeCode },
      select: { id: true },
    });

    if (existingCode) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: {
          employeeCode: ["This employee code is already in use."],
        },
      };
    }
  }

  try {
    const { user, staffProfile } = await createStaffUser({
      name,
      email: normalizedEmail,
      password,
      role,
      employeeCode: normalizedEmployeeCode,
    });

    try {
      await enableStaffTwoFactor(normalizedEmail, password);
    } catch {
      await prisma.user.delete({ where: { id: user.id } });

      return {
        success: false,
        error:
          "Failed to enable two-factor authentication for the new staff member.",
      };
    }

    revalidatePath("/dashboard/staff");

    return {
      success: true,
      data: { staffProfileId: staffProfile.id },
    };
  } catch {
    return {
      success: false,
      error: "Failed to create staff member. Please try again.",
    };
  }
}

export async function updateStaff(input: unknown): Promise<ActionResult> {
  const access = await requireAdmin();

  if (!access.ok) {
    return { success: false, error: access.error };
  }

  const parsed = updateStaffSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { staffProfileId, name, role, employeeCode, isActive } = parsed.data;
  const normalizedEmployeeCode = employeeCode?.trim() || null;

  const target = await prisma.staffProfile.findUnique({
    where: { id: staffProfileId },
    include: {
      user: {
        select: { id: true },
      },
    },
  });

  if (!target) {
    return { success: false, error: "Staff member not found." };
  }

  if (target.userId === access.staffProfile.userId) {
    if (role !== "ADMIN" || !isActive) {
      return {
        success: false,
        error: "You cannot demote or deactivate your own account.",
      };
    }
  }

  if (
    target.role === "ADMIN" &&
    target.isActive &&
    (role !== "ADMIN" || !isActive)
  ) {
    const wouldBeLastAdmin = await isLastActiveAdmin(staffProfileId);

    if (wouldBeLastAdmin) {
      return {
        success: false,
        error: "At least one active admin account is required.",
      };
    }
  }

  if (normalizedEmployeeCode) {
    const existingCode = await prisma.staffProfile.findFirst({
      where: {
        employeeCode: normalizedEmployeeCode,
        id: { not: staffProfileId },
      },
      select: { id: true },
    });

    if (existingCode) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: {
          employeeCode: ["This employee code is already in use."],
        },
      };
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: target.user.id },
      data: { name: name.trim() },
    }),
    prisma.staffProfile.update({
      where: { id: staffProfileId },
      data: {
        role,
        employeeCode: normalizedEmployeeCode,
        isActive,
      },
    }),
  ]);

  revalidatePath("/dashboard/staff");

  return { success: true };
}

export async function setStaffActive(
  input: unknown,
): Promise<ActionResult> {
  const access = await requireAdmin();

  if (!access.ok) {
    return { success: false, error: access.error };
  }

  const parsed = setStaffActiveSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { staffProfileId, isActive } = parsed.data;

  const target = await prisma.staffProfile.findUnique({
    where: { id: staffProfileId },
    select: { id: true, userId: true, role: true, isActive: true },
  });

  if (!target) {
    return { success: false, error: "Staff member not found." };
  }

  if (!isActive && target.userId === access.staffProfile.userId) {
    return {
      success: false,
      error: "You cannot deactivate your own account.",
    };
  }

  if (!isActive && target.role === "ADMIN" && target.isActive) {
    const otherActiveAdmins = await countActiveAdmins(staffProfileId);

    if (otherActiveAdmins === 0) {
      return {
        success: false,
        error: "At least one active admin account is required.",
      };
    }
  }

  await prisma.staffProfile.update({
    where: { id: staffProfileId },
    data: { isActive },
  });

  revalidatePath("/dashboard/staff");

  return { success: true };
}
