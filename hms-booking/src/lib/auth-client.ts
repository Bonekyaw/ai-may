import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  Constants.expoConfig?.extra?.apiUrl ??
  "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: apiUrl,
  fetchOptions: {
    timeout: 5_000,
    retry: 0,
  },
  plugins: [
    expoClient({
      scheme: "hmsbooking",
      storagePrefix: "hmsbooking",
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
});

export { apiUrl };
