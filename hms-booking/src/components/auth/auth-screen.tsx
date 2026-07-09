import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AuthScreenContext } from "@/components/auth/auth-screen-context";
import { AppColors, Spacing } from "@/constants/theme";

type AuthScreenProps = {
  children: React.ReactNode;
};

export function AuthScreen({ children }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const lastFocusedInputRef = useRef<View | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollToInput = useCallback((view: View) => {
    lastFocusedInputRef.current = view;

    const runScroll = () => {
      view.measureInWindow((_x, y, _width, height) => {
        const keyboardH = keyboardHeightRef.current;
        if (keyboardH <= 0) {
          return;
        }

        const windowHeight = Dimensions.get("window").height;
        const visibleBottom = windowHeight - keyboardH - Spacing.three;
        const inputBottom = y + height;

        if (inputBottom > visibleBottom) {
          scrollRef.current?.scrollTo({
            y: scrollOffsetRef.current + (inputBottom - visibleBottom),
            animated: true,
          });
        }
      });
    };

    requestAnimationFrame(() => {
      runScroll();
      setTimeout(runScroll, Platform.OS === "android" ? 120 : 60);
      setTimeout(runScroll, Platform.OS === "android" ? 280 : 180);
    });
  }, []);

  useEffect(() => {
    if (keyboardHeight > 0 && lastFocusedInputRef.current) {
      scrollToInput(lastFocusedInputRef.current);
    }
  }, [keyboardHeight, scrollToInput]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      keyboardHeightRef.current = event.endCoordinates.height;
      setKeyboardHeight(event.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
      lastFocusedInputRef.current = null;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <AuthScreenContext.Provider value={{ scrollToInput }}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardHeight > 0 ? styles.scrollContentKeyboardOpen : null,
            {
              paddingBottom:
                Math.max(insets.bottom, Spacing.five) +
                Spacing.six +
                keyboardHeight,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </AuthScreenContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  scrollContentKeyboardOpen: {
    justifyContent: "flex-start",
    paddingTop: Spacing.three,
  },
});
