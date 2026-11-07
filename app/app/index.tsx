import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Screen, Text } from "../src/components/ui/index.js";
import { SolMascot } from "../src/components/Sol/index.js";
import { colors, spacing } from "../src/theme/index.js";
import { useAuthStore } from "../src/store/auth.js";
import { pendingLink } from "../src/lib/pendingLink.js";

async function checkOnboardingSeen(): Promise<boolean> {
  try {
    if (Platform.OS === "web") {
      return (
        typeof window !== "undefined" &&
        Boolean(window.localStorage.getItem("onboardingSeen"))
      );
    }
    const seen = await SecureStore.getItemAsync("onboardingSeen");
    return Boolean(seen);
  } catch {
    return false;
  }
}

export default function SplashScreen() {
  const router = useRouter();
  const { status, user, hydrate } = useAuthStore();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withTiming(1, { duration: 600 });
    hydrate();

    checkOnboardingSeen()
      .then((seen) => setHasSeenOnboarding(seen))
      .catch(() => {});

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1600);

    const hardCapTimer = setTimeout(() => {
      useAuthStore.setState({ status: "unauthenticated" });
      setMinTimeElapsed(true);
    }, 25000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hardCapTimer);
    };
  }, [hydrate, opacity, scale]);

  useEffect(() => {
    if (!minTimeElapsed || status === "loading") return;

    if (status === "unauthenticated") {
      pendingLink.clear();
      pendingLink.setSplashActive(false);
      if (hasSeenOnboarding) {
        router.replace("/(auth)/login");
      } else {
        router.replace("/(onboarding)");
      }
    } else if (status === "authenticated") {
      if (!user?.onboardingDone) {
        pendingLink.clear();
        pendingLink.setSplashActive(false);
        router.replace("/(auth)/profile-setup");
      } else {
        pendingLink.setSplashActive(false);
        router.replace("/(tabs)/home");
        const pendingUrl = pendingLink.clear();
        if (pendingUrl) {
          router.push(pendingUrl as any); // expo-router route
        }
      }
    }
  }, [minTimeElapsed, status, user, hasSeenOnboarding, router]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Screen gradient={colors.gradients.dawn} style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <SolMascot size={120} expression="happy" breathing />
        <View style={styles.textContainer}>
          <Text variant="display" center style={styles.title}>
            Solace
          </Text>
          <Text
            variant="body"
            color={colors.inkSoft}
            center
            style={styles.subtitle}
          >
            A gentle place for your mind
          </Text>
          {status === "loading" ? (
            <Text
              variant="caption"
              color={colors.primary}
              center
              style={styles.wakingText}
            >
              Waking Sol up...
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  wakingText: {
    marginTop: spacing.xs,
  },
});
