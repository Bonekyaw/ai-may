import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

import {
  isLocale,
  translations,
  type Locale,
  type TranslationKey,
} from "@/i18n/translations";

const LOCALE_STORAGE_KEY = "hmsbooking_locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: TranslationKey) => string;
  isReady: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

async function readStoredLocale(): Promise<Locale | null> {
  try {
    if (Platform.OS === "web") {
      const value =
        typeof localStorage !== "undefined"
          ? localStorage.getItem(LOCALE_STORAGE_KEY)
          : null;
      return isLocale(value) ? value : null;
    }

    const value = await SecureStore.getItemAsync(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

async function writeStoredLocale(locale: Locale) {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      }
      return;
    }

    await SecureStore.setItemAsync(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore persistence failures; in-memory locale still works.
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readStoredLocale().then((stored) => {
      if (cancelled) {
        return;
      }
      if (stored) {
        setLocaleState(stored);
      }
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    await writeStoredLocale(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[locale][key] ?? translations.en[key],
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      isReady,
    }),
    [locale, setLocale, t, isReady],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
