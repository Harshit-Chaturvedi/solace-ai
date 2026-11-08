import React, { useEffect } from "react";
import { Platform } from "react-native";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  useFonts,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { OfflineBanner } from "../src/components/ui/OfflineBanner.js";
import { getReminders } from "../src/api/reminders.js";
import { syncReminders } from "../src/lib/notifications.js";
import { useAuthStore } from "../src/store/auth.js";
import { pendingLink } from "../src/lib/pendingLink.js";
import { queryClient } from "../src/lib/queryClient.js";

SplashScreen.preventAutoHideAsync().catch(() => {});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  const authStatus = useAuthStore((s) => s.status);
  const syncedRef = React.useRef(false);

  useEffect(() => {
    if (authStatus === "authenticated" && !syncedRef.current) {
      syncedRef.current = true;
      getReminders()
        .then((rems) => {
          if (rems && rems.length > 0) {
            syncReminders(rems);
          }
        })
        .catch(() => {});
    } else if (authStatus !== "authenticated") {
      syncedRef.current = false;
    }
  }, [authStatus]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const handleNotificationResponse = (
      response: Notifications.NotificationResponse | null
    ) => {
      const url = response?.notification?.request?.content?.data?.url;
      if (typeof url === "string" && url.length > 0) {
        Notifications.clearLastNotificationResponse();
        const auth = useAuthStore.getState();
        if (auth.status !== "authenticated" || pendingLink.isSplashActive()) {
          pendingLink.set(url);
        } else {
          router.push(url as any); // expo-router route
        }
      }
    };

    // Cold start / sync check (getLastNotificationResponseAsync)
    try {
      const initialResponse = Notifications.getLastNotificationResponse();
      if (initialResponse) {
        handleNotificationResponse(initialResponse);
      }
    } catch {
      // non-blocking
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      subscription.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <QueryClientProvider client={queryClient}>
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)/index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/signup" />
          <Stack.Screen name="(auth)/profile-setup" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
