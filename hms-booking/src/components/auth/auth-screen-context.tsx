import { createContext, useContext } from "react";
import type { View } from "react-native";

type AuthScreenContextValue = {
  scrollToInput: (view: View) => void;
};

export const AuthScreenContext = createContext<AuthScreenContextValue | null>(
  null,
);

export function useAuthScreenScroll() {
  return useContext(AuthScreenContext);
}
