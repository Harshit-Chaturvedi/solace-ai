import React, { useRef, useState } from "react";
import {
  Platform,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Screen, Text, Button } from "../../src/components/ui/index.js";
import { SolMascot, type SolExpression } from "../../src/components/Sol/index.js";
import { colors, spacing } from "../../src/theme/index.js";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  expression: SolExpression;
  disclaimer?: string;
}

const slides: Slide[] = [
  {
    id: "1",
    title: "Check in with how you feel",
    subtitle:
      "A safe, judgment-free space to pause and notice your emotional patterns day by day.",
    expression: "calm",
  },
  {
    id: "2",
    title: "Meet Sol, your companion",
    subtitle:
      "An emotionally intelligent companion who listens, remembers what matters, and grows with you.",
    expression: "happy",
  },
  {
    id: "3",
    title: "Small daily rituals",
    subtitle:
      "Breathe, reflect, and find calm with guided rituals tailored to your day.",
    expression: "excited",
    disclaimer:
      "Solace supports wellbeing; it is not a medical or emergency service.",
  },
];

const markOnboardingSeen = () => {
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("onboardingSeen", "true");
      }
    } catch {}
    return;
  }
  SecureStore.setItemAsync("onboardingSeen", "true").catch(() => {});
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
    );
    if (slideIndex !== activeIndex && slideIndex >= 0 && slideIndex < slides.length) {
      setActiveIndex(slideIndex);
    }
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      markOnboardingSeen();
      router.push("/(auth)/signup");
    }
  };

  const handleSkip = () => {
    markOnboardingSeen();
    router.push("/(auth)/signup");
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        {activeIndex < slides.length - 1 ? (
          <Pressable onPress={handleSkip} hitSlop={12}>
            <Text variant="bodyMedium" color={colors.inkSoft}>
              Skip
            </Text>
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH - spacing.screenPadding * 2 }]}>
            <View style={styles.mascotContainer}>
              <SolMascot size={140} expression={item.expression} />
            </View>
            <Text variant="h1" center style={styles.title}>
              {item.title}
            </Text>
            <Text
              variant="body"
              color={colors.inkSoft}
              center
              style={styles.subtitle}
            >
              {item.subtitle}
            </Text>
            {item.disclaimer ? (
              <Text
                variant="caption"
                color={colors.inkSoft}
                center
                style={styles.disclaimer}
              >
                {item.disclaimer}
              </Text>
            ) : null}
          </View>
        )}
      />

      <View style={styles.bottomSection}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Button
          title={activeIndex === slides.length - 1 ? "Get Started" : "Continue"}
          onPress={handleNext}
          style={styles.continueBtn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  spacer: {
    minWidth: 44,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.base,
  },
  mascotContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  subtitle: {
    width: "100%",
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  disclaimer: {
    width: "100%",
    paddingHorizontal: spacing.md,
    opacity: 0.8,
  },
  bottomSection: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.primarySoft,
  },
  continueBtn: {
    width: "100%",
  },
});
