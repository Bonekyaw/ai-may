import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";

import { authClient } from "@/lib/auth-client";
import { establishSession } from "@/lib/wait-for-session";

// Required so auth redirects can finish cleanly (esp. web; harmless on native).
WebBrowser.maybeCompleteAuthSession();

/**
 * Prefer a scheme-only return URL. Paths like "/(app)" become awkward deep links
 * (e.g. hmsbooking:///(app)) that Android often fails to match to the auth
 * session, which surfaces an "Open with…" chooser (Gmail/Chrome/etc.).
 */
export function getOAuthCallbackURL() {
  return Linking.createURL("/");
}

export async function signInWithGoogle() {
  const { error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: getOAuthCallbackURL(),
  });

  if (error) {
    return { error };
  }

  const ready = await establishSession();

  if (!ready) {
    return {
      error: {
        message: "Google sign-in completed, but session could not be loaded.",
      },
    };
  }

  router.replace("/(app)");
  return { error: null };
}
