"use client";

import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createStaff, updateStaff, type StaffListItem } from "@/lib/actions/staff";
import {
  createStaffSchema,
  staffRoleLabels,
  staffRoleValues,
  updateStaffSchema,
  type CreateStaffInput,
  type UpdateStaffInput,
} from "@/lib/validations/staff";

type StaffFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  staff?: StaffListItem | null;
  onSuccess?: () => void;
};

export function StaffFormSheet({
  open,
  onOpenChange,
  mode,
  staff,
  onSuccess,
}: StaffFormSheetProps) {
  const [isPending, startTransition] = useTransition();

  const createForm = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "FRONT_DESK",
      employeeCode: "",
    },
  });

  const editForm = useForm<UpdateStaffInput>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: {
      staffProfileId: "",
      name: "",
      role: "FRONT_DESK",
      employeeCode: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "create") {
      createForm.reset({
        name: "",
        email: "",
        password: "",
        role: "FRONT_DESK",
        employeeCode: "",
      });
      return;
    }

    if (staff) {
      editForm.reset({
        staffProfileId: staff.staffProfileId,
        name: staff.name,
        role: staff.role as UpdateStaffInput["role"],
        employeeCode: staff.employeeCode ?? "",
        isActive: staff.isActive,
      });
    }
  }, [open, mode, staff, createForm, editForm]);

  function applyFieldErrors(
    fieldErrors: Record<string, string[] | undefined> | undefined,
    setError: (field: string, error: { message: string }) => void,
  ) {
    if (!fieldErrors) {
      return;
    }

    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (messages?.[0]) {
        setError(field, { message: messages[0] });
      }
    }
  }

  function onCreateSubmit(values: CreateStaffInput) {
    startTransition(async () => {
      const result = await createStaff(values);

      if (!result.success) {
        if (result.fieldErrors) {
          applyFieldErrors(result.fieldErrors, (field, error) =>
            createForm.setError(field as keyof CreateStaffInput, error),
          );
        }

        toast.error(result.error ?? "Failed to create staff member.");
        return;
      }

      toast.success("Staff member created.");
      onOpenChange(false);
      onSuccess?.();
    });
  }

  function onEditSubmit(values: UpdateStaffInput) {
    startTransition(async () => {
      const result = await updateStaff(values);

      if (!result.success) {
        if (result.fieldErrors) {
          applyFieldErrors(result.fieldErrors, (field, error) =>
            editForm.setError(field as keyof UpdateStaffInput, error),
          );
        }

        toast.error(result.error ?? "Failed to update staff member.");
        return;
      }

      toast.success("Staff member updated.");
      onOpenChange(false);
      onSuccess?.();
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add staff member" : "Edit staff member"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Create a staff account with an initial password."
              : "Update staff details, role, and account status."}
          </SheetDescription>
        </SheetHeader>

        {mode === "create" ? (
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="flex flex-col gap-4 px-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffRoleValues.map((role) => (
                          <SelectItem key={role} value={role}>
                            {staffRoleLabels[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="employeeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee code (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter className="px-0">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create staff member"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        ) : (
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="flex flex-col gap-4 px-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffRoleValues.map((role) => (
                          <SelectItem key={role} value={role}>
                            {staffRoleLabels[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="employeeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee code (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "true")}
                      value={field.value ? "true" : "false"}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter className="px-0">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
