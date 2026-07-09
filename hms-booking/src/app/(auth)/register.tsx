import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthScreen } from "@/components/auth/auth-screen";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { authClient } from "@/lib/auth-client";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/(app)",
    });

    if (signInError) {
      setError(signInError.message ?? "Google sign-in failed.");
    }

    setGoogleLoading(false);
  }

  async function handleRegister() {
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    const { error: signUpError } = await authClient.signUp.email({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    if (signUpError) {
      setError(signUpError.message ?? "Registration failed.");
      setLoading(false);
      return;
    }

    const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
      email: normalizedEmail,
      type: "email-verification",
    });

    if (otpError) {
      setError(otpError.message ?? "Failed to send verification code.");
      setLoading(false);
      return;
    }

    router.push({
      pathname: "/(auth)/verify-email",
      params: { email: normalizedEmail },
    });

    setLoading(false);
  }

  return (
    <AuthScreen>
      <AuthCard>
        <AuthHeader
          title="Create your account"
          subtitle="Register with Google or your email address"
        />

        {error ? (
          <Text allowFontScaling={false} style={styles.error}>
            {error}
          </Text>
        ) : null}

        <GoogleSignInButton
          label="Continue with Google"
          onPress={handleGoogleSignIn}
          loading={googleLoading}
          disabled={loading}
        />

        <AuthDivider />

        <AuthInput
          label="Full name"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          placeholder="Jane Doe"
        />

        <AuthInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="m@example.com"
        />

        <AuthInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />

        <AuthButton
          title="Create account"
          onPress={handleRegister}
          loading={loading}
        />

        <AuthFooterLink
          message="Already have an account?"
          linkLabel="Sign in"
          onPress={() => router.push("/(auth)/login")}
        />
      </AuthCard>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: "#f87171",
    fontSize: 14,
  },
});
