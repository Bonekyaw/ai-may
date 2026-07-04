import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  staffRoleLabels,
  type staffRoleValues,
} from "@/lib/validations/staff";

type StaffRoleValue = (typeof staffRoleValues)[number];

const roleVariants: Record<
  StaffRoleValue,
  "default" | "secondary" | "outline" | "destructive"
> = {
  ADMIN: "default",
  MANAGER: "secondary",
  FRONT_DESK: "outline",
  HOUSEKEEPING: "outline",
  MAINTENANCE: "outline",
};

type RoleBadgeProps = {
  role: string;
  className?: string;
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleKey = role as StaffRoleValue;
  const label = staffRoleLabels[roleKey] ?? role;
  const variant = roleVariants[roleKey] ?? "outline";

  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
    </Badge>
  );
}
