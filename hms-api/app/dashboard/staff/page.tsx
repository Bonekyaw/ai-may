import { Suspense } from "react";

import { StaffList } from "@/components/staff/staff-list";
import { StaffTableSkeleton } from "@/components/staff/staff-table-skeleton";

export default function StaffPage() {
  return (
    <Suspense fallback={<StaffTableSkeleton />}>
      <StaffList />
    </Suspense>
  );
}
