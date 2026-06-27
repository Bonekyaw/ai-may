"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader2Icon, MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";

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
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
      {children}
    </div>
  );
}

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            If an account exists for this email, we&apos;ve sent reset
            instructions. The link expires in 1 hour.
          </p>
        </div>

        <Button asChild variant="outline" className="h-10 w-full">
          <Link href="/login">
            <ArrowLeftIcon />
            Back to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Forgot your password?
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Enter your staff email address and we&apos;ll send you a link to
          reset your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <FieldIcon>
                      <MailIcon className="size-4" />
                    </FieldIcon>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="email"
                      placeholder="admin@hmshotel.com"
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
                Sending reset link...
              </>
            ) : (
              "Send reset link"
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
