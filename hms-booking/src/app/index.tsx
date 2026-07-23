import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppColors } from "@/constants/theme";

/**
 * Boot screen only. Auth routing is handled in the root layout after
 * NavigationContainer is ready — avoid <Redirect> here (it races with
 * expo-router linking on reload and triggers a React mount warning).
 */
export default function Index() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={AppColors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.background,
  },
});
