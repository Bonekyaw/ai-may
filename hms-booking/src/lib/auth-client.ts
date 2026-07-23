import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  Constants.expoConfig?.extra?.apiUrl ??
  "http://localhost:3000";

function isCanceledFetchError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    ("name" in error && error.name === "AbortError") ||
    message.includes("abort") ||
    message.includes("cancel")
  );
}

/**
 * Expo aborts superseded auth fetches after login. Never reject those — return
 * empty JSON so Better Auth can check `signal.aborted` and keep prior session data.
 */
async function fetchIgnoringAbort(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (isCanceledFetchError(error) || init?.signal?.aborted) {
      return new Response("null", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw error;
  }
}

export const authClient = createAuthClient({
  baseURL: apiUrl,
  fetchOptions: {
    timeout: 8_000,
    retry: 0,
    customFetchImpl: fetchIgnoringAbort,
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
