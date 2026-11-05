import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { SolMascot } from "../Sol/SolMascot.js";
import { colors } from "../../theme/colors.js";

interface BreathingCircleProps {
  phase: "inhale" | "hold" | "exhale" | "rest";
  durationSeconds: number;
}

export function BreathingCircle({ phase, durationSeconds }: BreathingCircleProps): React.JSX.Element {
  const scale = useSharedValue(0.7);

  useEffect(() => {
    const ms = Math.max(durationSeconds * 1000, 1000);
    if (phase === "inhale") {
      scale.value = withTiming(1.25, {
        duration: ms,
        easing: Easing.inOut(Easing.quad),
      });
    } else if (phase === "exhale") {
      scale.value = withTiming(0.7, {
        duration: ms,
        easing: Easing.inOut(Easing.quad),
      });
    }
  }, [phase, durationSeconds]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.outerGlow, animatedStyle]} />
      <Animated.View style={[styles.circle, animatedStyle]}>
        <SolMascot size={80} expression="calm" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 30,
  },
  outerGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.mint,
    opacity: 0.35,
  },
  circle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.mint,
  },
});
