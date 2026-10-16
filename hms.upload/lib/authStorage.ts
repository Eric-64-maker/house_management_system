import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Stores the Convex Auth session token securely on the device.
// On web we fall back to the default (localStorage) by returning undefined.
export const authStorage =
  Platform.OS === "web"
    ? undefined
    : {
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      };
