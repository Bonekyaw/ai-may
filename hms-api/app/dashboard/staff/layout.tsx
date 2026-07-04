import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getStaffProfile } from "@/lib/auth/staff-access";
import { auth } from "@/lib/auth";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const staffProfile = await getStaffProfile(session.user.id);

  if (!staffProfile || staffProfile.role !== "ADMIN" || !staffProfile.isActive) {
    redirect("/dashboard");
  }

  return children;
}
