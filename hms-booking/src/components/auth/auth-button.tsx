import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";

import { AppColors, Spacing } from "@/constants/theme";

type AuthButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "outline";
  loading?: boolean;
};

export function AuthButton({
  title,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...props
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => {
        const resolvedStyle =
          typeof style === "function" ? style({ pressed, hovered: false }) : style;

        return [
          styles.base,
          variant === "primary" ? styles.primary : styles.outline,
          pressed && styles.pressed,
          isDisabled && styles.disabled,
          resolvedStyle,
        ];
      }}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? AppColors.background : AppColors.text}
        />
      ) : (
        <Text
          allowFontScaling={false}
          style={[
            styles.text,
            variant === "primary" ? styles.primaryText : styles.outlineText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },
  primary: {
    backgroundColor: AppColors.text,
  },
  outline: {
    backgroundColor: AppColors.background,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
  },
  primaryText: {
    color: AppColors.background,
  },
  outlineText: {
    color: AppColors.text,
  },
});
