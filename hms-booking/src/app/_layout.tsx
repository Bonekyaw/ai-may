import {
  Redirect,
  Stack,
  useRootNavigationState,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppColors } from "@/constants/theme";
import { authClient } from "@/lib/auth-client";

SplashScreen.preventAutoHideAsync().catch(() => {});

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

  const inAuthGroup = segments[0] === "(auth)";
  const inAppGroup = segments[0] === "(app)";
  const isAuthenticated = Boolean(session?.user);

  useEffect(() => {
    if (rootNavigationState?.key) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [rootNavigationState?.key]);

  if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/(app)" />;
  }

  if (!isAuthenticated && !isPending && inAppGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: AppColors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
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
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
