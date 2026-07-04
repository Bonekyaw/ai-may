import { headers } from "next/headers";

import type { StaffProfile, StaffRole } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type StaffAccessResult =
  | {
      ok: true;
      session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
      staffProfile: StaffProfile;
    }
  | {
      ok: false;
      error: string;
    };

export async function getStaffProfile(userId: string) {
  return prisma.staffProfile.findUnique({
    where: { userId },
  });
}

export async function requireAdmin(): Promise<StaffAccessResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { ok: false, error: "Unauthorized" };
  }

  const staffProfile = await getStaffProfile(session.user.id);

  if (!staffProfile || staffProfile.role !== "ADMIN") {
    return { ok: false, error: "Forbidden" };
  }

  if (!staffProfile.isActive) {
    return { ok: false, error: "Forbidden" };
  }

  return { ok: true, session, staffProfile };
}

export async function countActiveAdmins(excludeStaffProfileId?: string) {
  return prisma.staffProfile.count({
    where: {
      role: "ADMIN" satisfies StaffRole,
      isActive: true,
      ...(excludeStaffProfileId
        ? { id: { not: excludeStaffProfileId } }
        : {}),
    },
  });
}

export async function isLastActiveAdmin(staffProfileId: string) {
  const profile = await prisma.staffProfile.findUnique({
    where: { id: staffProfileId },
    select: { role: true, isActive: true },
  });

  if (!profile || profile.role !== "ADMIN" || !profile.isActive) {
    return false;
  }

  const otherActiveAdmins = await countActiveAdmins(staffProfileId);
  return otherActiveAdmins === 0;
}
