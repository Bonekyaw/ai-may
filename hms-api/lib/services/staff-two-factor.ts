import { auth } from "@/lib/auth";
import { getCookieHeader } from "@/lib/auth/cookies";
import prisma from "@/lib/prisma";

export async function enableStaffTwoFactor(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { twoFactorEnabled: true },
  });

  if (existingUser?.twoFactorEnabled) {
    return;
  }

  const signInResponse = await auth.api.signInEmail({
    body: {
      email: normalizedEmail,
      password,
    },
    asResponse: true,
  });

  if (!signInResponse.ok) {
    throw new Error("Failed to sign in staff user for two-factor setup.");
  }

  const signInData = (await signInResponse.json()) as {
    twoFactorRedirect?: boolean;
  };

  if (signInData.twoFactorRedirect) {
    throw new Error("Two-factor authentication is already enabled for this user.");
  }

  const cookieHeader = getCookieHeader(signInResponse.headers.get("set-cookie"));

  const enableResponse = await auth.api.enableTwoFactor({
    body: {
      password,
    },
    headers: {
      cookie: cookieHeader,
    },
    asResponse: true,
  });

  if (!enableResponse.ok) {
    throw new Error("Failed to enable two-factor authentication.");
  }

  const updatedUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { twoFactorEnabled: true },
  });

  if (!updatedUser?.twoFactorEnabled) {
    throw new Error("Two-factor authentication was not enabled.");
  }
}
