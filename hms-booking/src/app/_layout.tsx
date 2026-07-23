import { router, Stack, useRootNavigationState, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { LogBox, Text, TextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppColors } from "@/constants/theme";
import { LocaleProvider } from "@/i18n/locale-context";
import { authClient } from "@/lib/auth-client";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Known expo-router / React Navigation race on reload: async getInitialURL
// calls setState before ContextNavigator finishes mounting (useLinking.native).
// Harmless upstream warning; silence both LogBox and Metro console noise.
const MOUNT_RACE_WARNING =
  "Can't perform a React state update on a component that hasn't mounted yet";

LogBox.ignoreLogs([MOUNT_RACE_WARNING]);

if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const text = args
      .map((arg) => {
        if (typeof arg === "string") {
          return arg;
        }
        if (arg && typeof arg === "object" && "message" in arg) {
          return String((arg as { message?: unknown }).message ?? "");
        }
        return "";
      })
      .join(" ");

    if (
      text.includes(MOUNT_RACE_WARNING) ||
      text.toLowerCase().includes("fetch request has been canceled")
    ) {
      return;
    }
    originalConsoleError(...args);
  };
}
export const unstable_settings = {
  initialRouteName: "index",
};

function configureFontScaling() {
  type TextWithDefaults = typeof Text & {
    defaultProps?: {
      allowFontScaling?: boolean;
      maxFontSizeMultiplier?: number;
    };
  };

  type TextInputWithDefaults = typeof TextInput & {
    defaultProps?: {
      allowFontScaling?: boolean;
      maxFontSizeMultiplier?: number;
    };
  };

  const RNText = Text as TextWithDefaults;
  RNText.defaultProps = {
    ...RNText.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };

  const RNTextInput = TextInput as TextInputWithDefaults;
  RNTextInput.defaultProps = {
    ...RNTextInput.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1,
  };
}

function RootNavigator() {
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const lastTargetRef = useRef<string | null>(null);

  const inAuthGroup = segments[0] === "(auth)";
  const inAppGroup = segments[0] === "(app)";
  const isAuthenticated = Boolean(session?.user);
  const navigationReady = Boolean(rootNavigationState?.key);

  useEffect(() => {
    if (navigationReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [navigationReady]);

  useEffect(() => {
    if (!navigationReady || isPending) {
      return;
    }

    let target: "/(app)" | "/(auth)/login" | null = null;

    if (isAuthenticated) {
      if (!inAppGroup) {
        target = "/(app)";
      }
    } else if (!inAuthGroup) {
      target = "/(auth)/login";
    }

    if (!target || lastTargetRef.current === target) {
      return;
    }

    lastTargetRef.current = target;
    const href = target;

    // Defer until the JS thread is idle so we don't navigate during mount.
    let idleId: ReturnType<typeof setTimeout> | number | null = null;
    let cancelled = false;

    const runRedirect = () => {
      if (cancelled) {
        return;
      }
      router.replace(href);
    };

    if (typeof requestIdleCallback === "function") {
      idleId = requestIdleCallback(runRedirect);
    } else {
      idleId = setTimeout(runRedirect, 0);
    }

    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback === "function" && typeof idleId === "number") {
        cancelIdleCallback(idleId);
      } else if (idleId != null) {
        clearTimeout(idleId as ReturnType<typeof setTimeout>);
      }
    };
  }, [navigationReady, isPending, isAuthenticated, inAuthGroup, inAppGroup]);

  // Reset stale target when the user lands on the intended group.
  useEffect(() => {
    if (isAuthenticated && inAppGroup) {
      lastTargetRef.current = "/(app)";
    } else if (!isAuthenticated && inAuthGroup) {
      lastTargetRef.current = "/(auth)/login";
    }
  }, [isAuthenticated, inAppGroup, inAuthGroup]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: AppColors.background },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    configureFontScaling();
  }, []);

  return (
    <SafeAreaProvider>
      <LocaleProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
