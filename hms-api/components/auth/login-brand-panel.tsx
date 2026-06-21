import { Building2Icon, ShieldCheckIcon, SparklesIcon } from "lucide-react";

export function LoginBrandPanel() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-[oklch(0.28_0.04_250)] px-8 py-10 text-white lg:px-12 lg:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.45_0.08_250),transparent_55%),radial-gradient(circle_at_bottom_left,oklch(0.35_0.06_200),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-24 size-64 rounded-full bg-white/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative z-10">
        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm">
          <Building2Icon className="size-4" />
          <span>Staff Portal</span>
        </div>

        <h1 className="max-w-sm text-3xl font-semibold tracking-tight lg:text-4xl">
          HMS Hotel
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/75 lg:text-base">
          Manage reservations, housekeeping, and guest operations from one
          secure admin dashboard.
        </p>
      </div>

      <ul className="relative z-10 mt-10 space-y-4 text-sm text-white/80">
        <li className="flex items-start gap-3">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-white/90" />
          <span>Protected sign-in with email verification</span>
        </li>
        <li className="flex items-start gap-3">
          <SparklesIcon className="mt-0.5 size-4 shrink-0 text-white/90" />
          <span>Built for front desk and hotel operations teams</span>
        </li>
      </ul>
    </div>
  );
}
