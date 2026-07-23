import { StyleSheet, Text, View } from "react-native";

import { AppColors, Spacing } from "@/constants/theme";
import { useLocale } from "@/i18n/locale-context";

export function AuthDivider() {
  const { t } = useLocale();

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text allowFontScaling={false} style={styles.text}>
        {t("orContinueWith")}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.border,
  },
  text: {
    color: AppColors.textSecondary,
    fontSize: 12,
  },
});
