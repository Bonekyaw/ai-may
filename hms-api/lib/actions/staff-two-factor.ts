"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/staff-access";
import prisma from "@/lib/prisma";
import { enableStaffTwoFactor } from "@/lib/services/staff-two-factor";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function provisionStaffTwoFactor(
  staffProfileId: string,
  password: string,
): Promise<ActionResult> {
  const access = await requireAdmin();

  if (!access.ok) {
    return { success: false, error: access.error };
  }

  const staff = await prisma.staffProfile.findUnique({
    where: { id: staffProfileId },
    include: {
      user: {
        select: {
          email: true,
          twoFactorEnabled: true,
        },
      },
    },
  });

  if (!staff) {
    return { success: false, error: "Staff member not found." };
  }

  if (staff.user.twoFactorEnabled) {
    return { success: true };
  }

  try {
    await enableStaffTwoFactor(staff.user.email, password);
    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch {
    return {
      success: false,
      error:
        "Failed to enable two-factor authentication. Check the password and try again.",
    };
  }
}
