import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
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

    SecureStore.getItemAsync("onboardingSeen")
      .then((seen) => setHasSeenOnboarding(Boolean(seen)))
      .catch(() => {});

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1600);

    return () => clearTimeout(timer);
  }, [hydrate, opacity, scale]);

  useEffect(() => {
    if (!minTimeElapsed || status === "loading") return;

    if (status === "unauthenticated") {
      if (hasSeenOnboarding) {
        router.replace("/(auth)/login");
      } else {
        router.replace("/(onboarding)");
      }
    } else if (status === "authenticated") {
      if (!user?.onboardingDone) {
        router.replace("/(auth)/profile-setup");
      } else {
        router.replace("/(tabs)/home");
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
    maxWidth: 240,
  },
});
