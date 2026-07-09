import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthScreen } from "@/components/auth/auth-screen";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AppColors } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";

export default function LoginScreen() {
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

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (signInError) {
      const message = signInError.message ?? "Invalid email or password.";

      if (
        message.toLowerCase().includes("verify") ||
        message.toLowerCase().includes("verification")
      ) {
        await authClient.emailOtp.sendVerificationOtp({
          email: email.trim(),
          type: "email-verification",
        });

        router.push({
          pathname: "/(auth)/verify-email",
          params: { email: email.trim() },
        });
        setLoading(false);
        return;
      }

      setError(message);
      setLoading(false);
      return;
    }

    router.replace("/(app)");
    setLoading(false);
  }

  return (
    <AuthScreen>
      <AuthCard>
        <AuthHeader
          title="Welcome back"
          subtitle="Login with your Google account or email"
        />

        {error ? (
          <Text allowFontScaling={false} style={styles.error}>
            {error}
          </Text>
        ) : null}

        <GoogleSignInButton
          onPress={handleGoogleSignIn}
          loading={googleLoading}
          disabled={loading}
        />

        <AuthDivider />

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
          autoComplete="current-password"
          placeholder="Enter your password"
          labelRight={
            <Pressable disabled>
              <Text allowFontScaling={false} style={styles.forgotPassword}>
                Forgot your password?
              </Text>
            </Pressable>
          }
        />

        <AuthButton title="Login" onPress={handleLogin} loading={loading} />

        <AuthFooterLink
          message="Don't have an account?"
          linkLabel="Sign up"
          onPress={() => router.push("/(auth)/register")}
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
  forgotPassword: {
    color: AppColors.text,
    fontSize: 13,
  },
});
