import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { AuthButton } from "@/components/auth/auth-button";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthScreen } from "@/components/auth/auth-screen";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AppColors } from "@/constants/theme";
import { useLocale } from "@/i18n/locale-context";
import { authClient } from "@/lib/auth-client";
import { signInWithGoogle } from "@/lib/google-sign-in";
import { establishSession } from "@/lib/wait-for-session";

export default function LoginScreen() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);

    const { error: signInError } = await signInWithGoogle();

    if (signInError) {
      setError(signInError.message ?? t("googleSignInFailed"));
    }

    setGoogleLoading(false);
  }

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (signInError) {
      const message = signInError.message ?? t("invalidCredentials");

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

    const ready = await establishSession(
      data?.user
        ? { user: data.user, token: data.token }
        : undefined,
    );

    if (!ready) {
      setError(t("sessionLoadFailed"));
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <AuthScreen>
      <AuthCard>
        <AuthHeader title={t("welcomeBack")} subtitle={t("loginSubtitle")} />

        {error ? (
          <Text allowFontScaling={false} style={styles.error}>
            {error}
          </Text>
        ) : null}

        <GoogleSignInButton
          label={t("loginWithGoogle")}
          onPress={handleGoogleSignIn}
          loading={googleLoading}
          disabled={loading}
        />

        <AuthDivider />

        <AuthInput
          label={t("email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder={t("emailPlaceholder")}
        />

        <AuthInput
          label={t("password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          labelRight={
            <Pressable disabled>
              <Text allowFontScaling={false} style={styles.forgotPassword}>
                {t("forgotPassword")}
              </Text>
            </Pressable>
          }
        />

        <AuthButton title={t("login")} onPress={handleLogin} loading={loading} />

        <AuthFooterLink
          message={t("noAccount")}
          linkLabel={t("signUp")}
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
