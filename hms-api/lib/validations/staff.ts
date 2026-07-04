import { z } from "zod";

export const staffRoleValues = [
  "ADMIN",
  "MANAGER",
  "FRONT_DESK",
  "HOUSEKEEPING",
  "MAINTENANCE",
] as const;

export const staffRoleSchema = z.enum(staffRoleValues);

export const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: staffRoleSchema,
  employeeCode: z
    .string()
    .trim()
    .min(2, "Employee code must be at least 2 characters")
    .max(32, "Employee code must be at most 32 characters")
    .optional()
    .or(z.literal("")),
});

export const updateStaffSchema = z.object({
  staffProfileId: z.string().min(1, "Staff profile is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  role: staffRoleSchema,
  employeeCode: z
    .string()
    .trim()
    .min(2, "Employee code must be at least 2 characters")
    .max(32, "Employee code must be at most 32 characters")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

export const setStaffActiveSchema = z.object({
  staffProfileId: z.string().min(1, "Staff profile is required"),
  isActive: z.boolean(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type SetStaffActiveInput = z.infer<typeof setStaffActiveSchema>;

export const staffRoleLabels: Record<(typeof staffRoleValues)[number], string> =
  {
    ADMIN: "Admin",
    MANAGER: "Manager",
    FRONT_DESK: "Front desk",
    HOUSEKEEPING: "Housekeeping",
    MAINTENANCE: "Maintenance",
  };
