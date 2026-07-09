import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AppColors, Spacing } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedEmail = typeof email === "string" ? email : "";

  async function handleVerify() {
    if (!normalizedEmail) {
      setError("Missing email address.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: verifyError } = await authClient.emailOtp.verifyEmail({
      email: normalizedEmail,
      otp: otp.trim(),
    });

    if (verifyError) {
      setError(verifyError.message ?? "Invalid verification code.");
      setLoading(false);
      return;
    }

    router.replace("/(app)");
    setLoading(false);
  }

  async function handleResend() {
    if (!normalizedEmail) {
      return;
    }

    setResending(true);
    setError(null);

    const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
      email: normalizedEmail,
      type: "email-verification",
    });

    if (resendError) {
      setError(resendError.message ?? "Failed to resend code.");
    }

    setResending(false);
  }

  return (
    <AuthScreen>
      <AuthCard>
        <AuthHeader
          title="Verify your email"
          subtitle={
            normalizedEmail
              ? `Enter the 6-digit code sent to ${normalizedEmail}`
              : "Enter the 6-digit code from your email"
          }
        />

        {error ? (
          <Text allowFontScaling={false} style={styles.error}>
            {error}
          </Text>
        ) : null}

        <AuthInput
          label="Verification code"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          style={styles.otpInput}
        />

        <AuthButton title="Verify email" onPress={handleVerify} loading={loading} />

        <Pressable
          onPress={handleResend}
          disabled={resending || loading}
          style={styles.resendButton}
        >
          <Text allowFontScaling={false} style={styles.resendText}>
            {resending ? "Sending..." : "Resend code"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          style={styles.backButton}
        >
          <Text allowFontScaling={false} style={styles.backText}>
            Back to sign in
          </Text>
        </Pressable>
      </AuthCard>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: "#f87171",
    fontSize: 14,
  },
  otpInput: {
    textAlign: "center",
    letterSpacing: 8,
    fontSize: 20,
  },
  resendButton: {
    alignSelf: "center",
    paddingVertical: Spacing.one,
  },
  resendText: {
    color: AppColors.text,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  backButton: {
    alignSelf: "center",
    paddingVertical: Spacing.one,
  },
  backText: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
});
