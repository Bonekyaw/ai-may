import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

import prisma from "@/lib/prisma";
import { sendOtpEmail, sendPasswordResetEmail } from "@/lib/email";

export const auth = betterAuth({
  appName: "HMS Hotel",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  plugins: [
    nextCookies(),
    twoFactor({
      issuer: "HMS Hotel",
      skipVerificationOnEnable: true,
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendOtpEmail(user.email, otp);
        },
        period: 5,
        allowedAttempts: 5,
        storeOTP: "encrypted",
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
