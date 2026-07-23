import * as SecureStore from "expo-secure-store";

import { authClient } from "@/lib/auth-client";

const COOKIE_STORAGE_KEY = "hmsbooking_cookie";
const SESSION_CACHE_KEY = "hmsbooking_session_data";
const SESSION_TOKEN_COOKIE = "better-auth.session_token";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  [key: string]: unknown;
};

type EstablishSessionInput = {
  user: SessionUser;
  token?: string;
};

function writeSessionAtom(data: {
  user: SessionUser;
  session: Record<string, unknown>;
}) {
  const sessionAtom = authClient.$store.atoms.session;
  if (!sessionAtom) {
    return;
  }

  const current = sessionAtom.get();
  sessionAtom.set({
    ...current,
    data,
    error: null,
    isPending: false,
    isRefetching: false,
    refetch: current.refetch,
  });
}

/**
 * Persist the session token the same way @better-auth/expo stores Set-Cookie.
 * RN often does not expose Set-Cookie on fetch responses, so email sign-in can
 * succeed in JSON while leaving SecureStore empty — which makes get-session fail.
 */
function persistSessionToken(token: string, user: SessionUser) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  let existing: Record<string, { value: string; expires: string | null }> = {};
  try {
    const raw = SecureStore.getItem(COOKIE_STORAGE_KEY);
    if (raw) {
      existing = JSON.parse(raw) as typeof existing;
    }
  } catch {
    existing = {};
  }

  existing[SESSION_TOKEN_COOKIE] = {
    value: token,
    expires,
  };

  SecureStore.setItem(COOKIE_STORAGE_KEY, JSON.stringify(existing));

  const sessionPayload = {
    user,
    session: {
      id: token,
      token,
      userId: user.id,
      expiresAt: expires,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  SecureStore.setItem(SESSION_CACHE_KEY, JSON.stringify(sessionPayload));
  writeSessionAtom(sessionPayload);
}

/**
 * After sign-in / email verify, ensure cookies + session atom are ready.
 */
export async function establishSession(fromAuth?: EstablishSessionInput) {
  if (fromAuth?.user && fromAuth.token) {
    persistSessionToken(fromAuth.token, fromAuth.user);
  } else if (fromAuth?.user) {
    writeSessionAtom({
      user: fromAuth.user,
      session: {
        id: "pending",
        token: "",
        userId: fromAuth.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 50));

  try {
    const result = await authClient.getSession();
    const data =
      result && typeof result === "object" && "data" in result
        ? result.data
        : result;

    if (data && typeof data === "object" && "user" in data && data.user) {
      writeSessionAtom(
        data as { user: SessionUser; session: Record<string, unknown> },
      );
      try {
        SecureStore.setItem(SESSION_CACHE_KEY, JSON.stringify(data));
      } catch {
        // ignore cache write failures
      }
      return true;
    }
  } catch {
    // Keep seeded session if refresh fails.
  }

  return Boolean(authClient.$store.atoms.session?.get()?.data?.user);
}

/** @deprecated Use establishSession */
export async function waitForSession() {
  return establishSession();
}
