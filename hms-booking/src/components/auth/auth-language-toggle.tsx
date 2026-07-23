import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppColors, Spacing } from "@/constants/theme";
import { useLocale } from "@/i18n/locale-context";
import type { Locale } from "@/i18n/translations";

export function AuthLanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  function selectLocale(next: Locale) {
    if (next === locale) {
      return;
    }
    void setLocale(next);
  }

  return (
    <View style={styles.segment} accessibilityLabel={t("changeLanguage")}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: locale === "en" }}
        onPress={() => selectLocale("en")}
        style={({ pressed }) => [
          styles.option,
          locale === "en" && styles.optionActive,
          pressed && styles.pressed,
        ]}
      >
        <Text
          allowFontScaling={false}
          style={[styles.optionText, locale === "en" && styles.optionTextActive]}
        >
          EN
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: locale === "my" }}
        onPress={() => selectLocale("my")}
        style={({ pressed }) => [
          styles.option,
          locale === "my" && styles.optionActive,
          pressed && styles.pressed,
        ]}
      >
        <Text
          allowFontScaling={false}
          style={[styles.optionText, locale === "my" && styles.optionTextActive]}
        >
          MY
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.background,
    gap: 2,
  },
  option: {
    minWidth: 36,
    height: 28,
    paddingHorizontal: Spacing.two,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  optionActive: {
    backgroundColor: AppColors.text,
  },
  optionText: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  optionTextActive: {
    color: AppColors.background,
  },
  pressed: {
    opacity: 0.85,
  },
});
