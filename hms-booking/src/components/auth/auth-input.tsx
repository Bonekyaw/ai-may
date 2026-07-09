import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { useAuthScreenScroll } from "@/components/auth/auth-screen-context";
import { AppColors, Spacing } from "@/constants/theme";

type AuthInputProps = TextInputProps & {
  label: string;
  labelRight?: React.ReactNode;
};

export function AuthInput({
  label,
  labelRight,
  style,
  secureTextEntry,
  onFocus,
  ...props
}: AuthInputProps) {
  const containerRef = useRef<View>(null);
  const authScreen = useAuthScreenScroll();
  const [isSecure, setIsSecure] = useState(Boolean(secureTextEntry));
  const showPasswordToggle = Boolean(secureTextEntry);

  return (
    <View ref={containerRef} style={styles.container}>
      <View style={styles.labelRow}>
        <Text allowFontScaling={false} style={styles.label}>
          {label}
        </Text>
        {labelRight}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          allowFontScaling={false}
          placeholderTextColor={AppColors.textSecondary}
          style={[
            styles.input,
            showPasswordToggle && styles.inputWithToggle,
            style,
          ]}
          secureTextEntry={showPasswordToggle ? isSecure : secureTextEntry}
          onFocus={(event) => {
            onFocus?.(event);
            if (containerRef.current) {
              authScreen?.scrollToInput(containerRef.current);
            }
          }}
          {...props}
        />

        {showPasswordToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSecure ? "Show password" : "Hide password"}
            hitSlop={8}
            onPress={() => setIsSecure((value) => !value)}
            style={styles.toggleButton}
          >
            <SymbolView
              name={{
                ios: isSecure ? "eye" : "eye.slash",
                android: isSecure ? "visibility" : "visibility_off",
                web: isSecure ? "visibility" : "visibility_off",
              }}
              size={20}
              tintColor={AppColors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: AppColors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.background,
    paddingHorizontal: Spacing.three,
    color: AppColors.text,
    fontSize: 16,
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  toggleButton: {
    position: "absolute",
    right: Spacing.two,
    height: 44,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
