import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <div className="hidden w-[44%] shrink-0 lg:block">
        <LoginBrandPanel />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="border-b bg-[oklch(0.28_0.04_250)] px-6 py-8 text-white lg:hidden">
          <p className="text-sm text-white/70">Staff Portal</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            HMS Hotel
          </h1>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
