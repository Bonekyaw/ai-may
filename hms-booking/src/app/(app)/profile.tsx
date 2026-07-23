import { SymbolView } from "expo-symbols";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppColors, BottomTabInset, Spacing } from "@/constants/theme";
import { useLocale } from "@/i18n/locale-context";
import type { Locale } from "@/i18n/translations";
import { authClient } from "@/lib/auth-client";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function ProfileScreen() {
  const { data: session } = authClient.useSession();
  const { locale, setLocale, t } = useLocale();
  const [loggingOut, setLoggingOut] = useState(false);

  const accountName =
    session?.user.name?.trim() || session?.user.email?.trim() || "—";
  const accountEmail = session?.user.email?.trim() ?? "";
  const initials = useMemo(() => getInitials(accountName), [accountName]);

  function applyLocale(next: Locale) {
    if (next === locale) {
      return;
    }
    void setLocale(next);
  }

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await authClient.signOut();

    if (error) {
      Alert.alert(t("logOut"), error.message ?? "Failed to log out.");
      setLoggingOut(false);
      return;
    }

    router.replace("/(auth)/login");
    setLoggingOut(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.atmosphere} pointerEvents="none" />
      <View style={styles.atmosphereGlow} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <Animated.View entering={FadeInDown.duration(420)} style={styles.header}>
          <View style={styles.avatar}>
            <Text allowFontScaling={false} style={styles.avatarText}>
              {initials}
            </Text>
          </View>

          <Text allowFontScaling={false} style={styles.name}>
            {accountName}
          </Text>

          {accountEmail ? (
            <Text allowFontScaling={false} style={styles.email}>
              {accountEmail}
            </Text>
          ) : null}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(160).duration(420)}
          style={styles.section}
        >
          <Text allowFontScaling={false} style={styles.sectionLabel}>
            {t("currentLanguage")}
          </Text>

          <View style={styles.segment}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: locale === "en" }}
              onPress={() => applyLocale("en")}
              style={({ pressed }) => [
                styles.segmentOption,
                locale === "en" && styles.segmentOptionActive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.segmentText,
                  locale === "en" && styles.segmentTextActive,
                ]}
              >
                {t("english")}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: locale === "my" }}
              onPress={() => applyLocale("my")}
              style={({ pressed }) => [
                styles.segmentOption,
                locale === "my" && styles.segmentOptionActive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.segmentText,
                  locale === "my" && styles.segmentTextActive,
                ]}
              >
                {t("myanmar")}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(240).duration(420)}
          style={styles.footer}
        >
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.pressed,
              loggingOut && styles.disabled,
            ]}
          >
            <SymbolView
              name={{
                ios: "rectangle.portrait.and.arrow.right",
                android: "logout",
                web: "logout",
              }}
              size={18}
              tintColor="#B42318"
            />
            <Text allowFontScaling={false} style={styles.logoutText}>
              {loggingOut ? t("loggingOut") : t("logOut")}
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  atmosphere: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage:
      "linear-gradient(180deg, #E8F3FC 0%, #F7F8FA 42%, #F7F8FA 100%)",
  },
  atmosphereGlow: {
    position: "absolute",
    top: -80,
    alignSelf: "center",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(32, 138, 239, 0.12)",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  header: {
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    marginBottom: Spacing.two,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1,
  },
  name: {
    color: AppColors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    textAlign: "center",
  },
  email: {
    color: AppColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: Spacing.one,
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 4,
  },
  segmentOption: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOptionActive: {
    backgroundColor: "#0F172A",
  },
  segmentText: {
    color: AppColors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  footer: {
    marginTop: "auto",
    paddingTop: Spacing.five,
  },
  logoutButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(180, 35, 24, 0.22)",
    backgroundColor: "rgba(180, 35, 24, 0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  logoutText: {
    color: "#B42318",
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.55,
  },
});
