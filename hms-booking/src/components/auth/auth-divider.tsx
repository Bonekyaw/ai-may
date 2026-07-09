import { StyleSheet, Text, View } from "react-native";

import { AppColors, Spacing } from "@/constants/theme";

export function AuthDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text allowFontScaling={false} style={styles.text}>
        Or continue with
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
