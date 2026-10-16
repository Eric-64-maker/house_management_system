import { ConvexReactClient } from "convex/react";

const url = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!url) {
  throw new Error(
    "EXPO_PUBLIC_CONVEX_URL is missing. Add it to .env.local (run `npx convex dev` to get the URL), then restart Expo with `npx expo start -c`."
  );
}

export const convex = new ConvexReactClient(url, {
  // React Native has no window focus/unsaved-changes prompts
  unsavedChangesWarning: false,
});
