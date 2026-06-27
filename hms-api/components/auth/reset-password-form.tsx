"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { authClient } from "@/lib/auth-client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
      {children}
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  if (error === "INVALID_TOKEN" || (!token && error)) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Link expired or invalid
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            This password reset link is no longer valid. Request a new one to
            continue.
          </p>
        </div>

        <Button asChild className="h-10 w-full">
          <Link href="/forgot-password">Request a new reset link</Link>
        </Button>

        <Button asChild variant="ghost" size="sm" className="px-0">
          <Link href="/login">
            <ArrowLeftIcon />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Invalid reset link
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            This page requires a valid password reset link from your email.
          </p>
        </div>

        <Button asChild className="h-10 w-full">
          <Link href="/forgot-password">Request a reset link</Link>
        </Button>

        <Button asChild variant="ghost" size="sm" className="px-0">
          <Link href="/login">
            <ArrowLeftIcon />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  function onSubmit(values: ResetPasswordInput) {
    if (!token) {
      return;
    }

    startTransition(async () => {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (resetError) {
        toast.error(resetError.message ?? "Failed to reset password.");
        return;
      }

      toast.success("Password updated. Sign in with your new password.");
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Set a new password
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Choose a new password for your HMS Hotel staff account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <FieldIcon>
                      <LockIcon className="size-4" />
                    </FieldIcon>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className="h-10 pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <FieldIcon>
                      <LockIcon className="size-4" />
                    </FieldIcon>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      className="h-10 pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-2 h-10 w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2Icon className="animate-spin" />
                Updating password...
              </>
            ) : (
              <>
                <KeyRoundIcon />
                Reset password
              </>
            )}
          </Button>
        </form>
      </Form>

      <Button asChild variant="ghost" size="sm" className="px-0">
        <Link href="/login">
          <ArrowLeftIcon />
          Back to sign in
        </Link>
      </Button>
    </div>
  );
}
