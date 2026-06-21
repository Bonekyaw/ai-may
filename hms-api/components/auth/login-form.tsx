"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import {
  loginSchema,
  otpSchema,
  type LoginInput,
  type OtpInput,
} from "@/lib/validations/auth";
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
import { cn } from "@/lib/utils";

type LoginStep = "credentials" | "otp";

function StepIndicator({ step }: { step: LoginStep }) {
  const steps = [
    { id: "credentials", label: "Sign in" },
    { id: "otp", label: "Verify" },
  ] as const;

  return (
    <div className="flex items-center gap-3">
      {steps.map((item, index) => {
        const isActive = item.id === step;
        const isComplete =
          step === "otp" && item.id === "credentials";

        return (
          <div key={item.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isActive || isComplete
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div className="h-px w-8 bg-border sm:w-12" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
      {children}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [isPending, startTransition] = useTransition();
  const otpSentRef = useRef(false);

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const otpForm = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  const emailValue = loginForm.watch("email");

  useEffect(() => {
    if (step !== "otp" || otpSentRef.current) {
      return;
    }

    otpSentRef.current = true;

    void authClient.twoFactor.sendOtp().then(({ error }) => {
      if (error) {
        toast.error(error.message ?? "Failed to send verification code.");
        otpSentRef.current = false;
        return;
      }

      toast.success("Verification code sent to your email.");
    });
  }, [step]);

  function onLoginSubmit(values: LoginInput) {
    startTransition(async () => {
      const { error } = await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL: "/dashboard",
        },
        {
          onSuccess(context) {
            if (context.data.twoFactorRedirect) {
              setStep("otp");
            } else {
              router.push("/dashboard");
              router.refresh();
            }
          },
        },
      );

      if (error) {
        toast.error(error.message ?? "Invalid email or password.");
      }
    });
  }

  function onOtpSubmit(values: OtpInput) {
    startTransition(async () => {
      const { error } = await authClient.twoFactor.verifyOtp({
        code: values.code,
      });

      if (error) {
        toast.error(error.message ?? "Invalid verification code.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  function handleResendCode() {
    otpSentRef.current = false;
    void authClient.twoFactor.sendOtp().then(({ error }) => {
      if (error) {
        toast.error(error.message ?? "Failed to resend code.");
        return;
      }
      otpSentRef.current = true;
      toast.success("Verification code resent.");
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <StepIndicator step={step} />

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {step === "credentials" ? "Welcome back" : "Check your email"}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {step === "credentials"
              ? "Enter your staff credentials to access the HMS Hotel dashboard."
              : `We sent a 6-digit code to ${emailValue || "your email"}. Enter it below to finish signing in.`}
          </p>
        </div>
      </div>

      {step === "otp" ? (
        <div className="space-y-6">
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(onOtpSubmit)}
              className="space-y-5"
            >
              <FormField
                control={otpForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="000000"
                        maxLength={6}
                        className="h-12 text-center text-lg tracking-[0.35em] tabular-nums"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="h-10 w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <KeyRoundIcon />
                    Verify and sign in
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="flex items-center justify-between gap-3 border-t pt-5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => {
                otpSentRef.current = false;
                otpForm.reset();
                setStep("credentials");
              }}
            >
              <ArrowLeftIcon />
              Back
            </Button>
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={isPending}
              onClick={handleResendCode}
              className="px-0"
            >
              Resend code
            </Button>
          </div>
        </div>
      ) : (
        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="space-y-5"
          >
            <FormField
              control={loginForm.control}
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

            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FieldIcon>
                        <LockIcon className="size-4" />
                      </FieldIcon>
                      <Input
                        {...field}
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="h-10 pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-2 h-10 w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Continue to verification"
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
