import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { StaffTable } from "@/components/staff/staff-table";
import { getStaffList } from "@/lib/actions/staff";
import { auth } from "@/lib/auth";

export async function StaffList() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const result = await getStaffList();

  if (!result.success) {
    redirect("/dashboard");
  }

  return (
    <StaffTable staff={result.data ?? []} currentUserId={session.user.id} />
  );
}
