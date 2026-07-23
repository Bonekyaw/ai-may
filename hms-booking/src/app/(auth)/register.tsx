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
import { useLocale } from "@/i18n/locale-context";
import { authClient } from "@/lib/auth-client";
import { signInWithGoogle } from "@/lib/google-sign-in";

export default function RegisterScreen() {
  const { t } = useLocale();
  const [name, setName] = useState("");
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
      setError(signUpError.message ?? t("registrationFailed"));
      setLoading(false);
      return;
    }

    const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
      email: normalizedEmail,
      type: "email-verification",
    });

    if (otpError) {
      setError(otpError.message ?? t("verificationSendFailed"));
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
        <AuthHeader title={t("createAccount")} subtitle={t("registerSubtitle")} />

        {error ? (
          <Text allowFontScaling={false} style={styles.error}>
            {error}
          </Text>
        ) : null}

        <GoogleSignInButton
          label={t("continueWithGoogle")}
          onPress={handleGoogleSignIn}
          loading={googleLoading}
          disabled={loading}
        />

        <AuthDivider />

        <AuthInput
          label={t("fullName")}
          value={name}
          onChangeText={setName}
          autoComplete="name"
          placeholder={t("fullNamePlaceholder")}
        />

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
          autoComplete="new-password"
          placeholder={t("passwordMinPlaceholder")}
        />

        <AuthButton
          title={t("createAccountButton")}
          onPress={handleRegister}
          loading={loading}
        />

        <AuthFooterLink
          message={t("haveAccount")}
          linkLabel={t("signIn")}
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
