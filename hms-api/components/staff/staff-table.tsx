"use client";

import { useState, useTransition } from "react";
import {
  MoreHorizontalIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "lucide-react";
import { toast } from "sonner";

import { RoleBadge } from "@/components/staff/role-badge";
import { StaffFormSheet } from "@/components/staff/staff-form-sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { setStaffActive, type StaffListItem } from "@/lib/actions/staff";
import { provisionStaffTwoFactor } from "@/lib/actions/staff-two-factor";

type StaffTableProps = {
  staff: StaffListItem[];
  currentUserId: string;
};

export function StaffTable({ staff, currentUserId }: StaffTableProps) {
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selectedStaff, setSelectedStaff] = useState<StaffListItem | null>(
    null,
  );
  const [confirmTarget, setConfirmTarget] = useState<StaffListItem | null>(
    null,
  );
  const [twoFactorTarget, setTwoFactorTarget] = useState<StaffListItem | null>(
    null,
  );
  const [twoFactorPassword, setTwoFactorPassword] = useState("");

  function openCreateSheet() {
    setSheetMode("create");
    setSelectedStaff(null);
    setSheetOpen(true);
  }

  function openEditSheet(member: StaffListItem) {
    setSheetMode("edit");
    setSelectedStaff(member);
    setSheetOpen(true);
  }

  function handleToggleActive(member: StaffListItem) {
    if (member.isActive) {
      setConfirmTarget(member);
      return;
    }

    startTransition(async () => {
      const result = await setStaffActive({
        staffProfileId: member.staffProfileId,
        isActive: true,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to reactivate staff member.");
        return;
      }

      toast.success(`${member.name} is now active.`);
    });
  }

  function confirmDeactivate() {
    if (!confirmTarget) {
      return;
    }

    const member = confirmTarget;

    startTransition(async () => {
      const result = await setStaffActive({
        staffProfileId: member.staffProfileId,
        isActive: false,
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to deactivate staff member.");
        return;
      }

      toast.success(`${member.name} has been deactivated.`);
      setConfirmTarget(null);
    });
  }

  function confirmEnableTwoFactor() {
    if (!twoFactorTarget || !twoFactorPassword) {
      return;
    }

    const member = twoFactorTarget;

    startTransition(async () => {
      const result = await provisionStaffTwoFactor(
        member.staffProfileId,
        twoFactorPassword,
      );

      if (!result.success) {
        toast.error(result.error ?? "Failed to enable two-factor authentication.");
        return;
      }

      toast.success(`Two-factor authentication enabled for ${member.name}.`);
      setTwoFactorTarget(null);
      setTwoFactorPassword("");
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Staff management
            </h2>
            <p className="text-sm text-muted-foreground">
              Create and manage HMS Hotel staff accounts, roles, and access
              status.
            </p>
          </div>
          <Button onClick={openCreateSheet}>Add staff</Button>
        </div>

        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Employee code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No staff members found.
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((member) => (
                  <TableRow key={member.staffProfileId}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={member.role} />
                    </TableCell>
                    <TableCell>{member.employeeCode ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={member.isActive ? "secondary" : "outline"}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.twoFactorEnabled ? "secondary" : "destructive"
                        }
                      >
                        {member.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={isPending}
                          >
                            <MoreHorizontalIcon />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditSheet(member)}
                          >
                            <PencilIcon />
                            Edit
                          </DropdownMenuItem>
                          {!member.twoFactorEnabled ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setTwoFactorPassword("");
                                setTwoFactorTarget(member);
                              }}
                            >
                              <ShieldCheckIcon />
                              Enable 2FA
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant={
                              member.isActive ? "destructive" : "default"
                            }
                            disabled={member.userId === currentUserId}
                            onClick={() => handleToggleActive(member)}
                          >
                            {member.isActive ? (
                              <>
                                <UserMinusIcon />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserPlusIcon />
                                Reactivate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <StaffFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        staff={selectedStaff}
      />

      <AlertDialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate staff member?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget
                ? `${confirmTarget.name} will no longer be able to sign in until reactivated.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={confirmDeactivate}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(twoFactorTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setTwoFactorTarget(null);
            setTwoFactorPassword("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable two-factor authentication</AlertDialogTitle>
            <AlertDialogDescription>
              {twoFactorTarget
                ? `Enter ${twoFactorTarget.name}'s account password to require email OTP at sign-in.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="two-factor-password">Account password</Label>
            <Input
              id="two-factor-password"
              type="password"
              value={twoFactorPassword}
              onChange={(event) => setTwoFactorPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending || !twoFactorPassword}
              onClick={confirmEnableTwoFactor}
            >
              Enable 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
