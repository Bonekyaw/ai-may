import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppColors, Spacing } from "@/constants/theme";

type AuthFooterLinkProps = {
  message: string;
  linkLabel: string;
  onPress: () => void;
};

export function AuthFooterLink({ message, linkLabel, onPress }: AuthFooterLinkProps) {
  return (
    <View style={styles.container}>
      <Text allowFontScaling={false} style={styles.message}>
        {message}{" "}
      </Text>
      <Pressable onPress={onPress}>
        <Text allowFontScaling={false} style={styles.link}>
          {linkLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.two,
  },
  message: {
    color: AppColors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: AppColors.text,
    fontSize: 14,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
