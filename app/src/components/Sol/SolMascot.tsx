import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../../theme/index.js";
import {
  MascotFacialFeatures,
  type SolExpression,
} from "./MascotFacialFeatures.js";

export type { SolExpression };

export interface SolMascotProps {
  size?: number;
  expression?: SolExpression;
  breathing?: boolean;
  moodTint?: string;
}

export function SolMascot({
  size = 120,
  expression = "calm",
  breathing = true,
  moodTint,
}: SolMascotProps) {
  const breathScale = useSharedValue(1);
  const eyeBlink = useSharedValue(1);

  useEffect(() => {
    if (breathing) {
      breathScale.value = withRepeat(
        withSequence(
          withTiming(1.04, {
            duration: 1750,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1.0, {
            duration: 1750,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      );
    } else {
      breathScale.value = withTiming(1, { duration: 300 });
    }
  }, [breathing, breathScale]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const triggerBlink = () => {
      eyeBlink.value = withSequence(
        withTiming(0.1, { duration: 80 }),
        withTiming(1, { duration: 80 }),
      );
      const nextDelay = 3000 + Math.random() * 3000;
      timeoutId = setTimeout(triggerBlink, nextDelay);
    };

    timeoutId = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(timeoutId);
  }, [eyeBlink]);

  const animatedBodyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  const bodyBaseColor = moodTint ?? colors.primary;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.body, animatedBodyStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient
              id="solGradient"
              cx="40%"
              cy="35%"
              rx="60%"
              ry="60%"
              fx="40%"
              fy="35%"
            >
              <Stop offset="0%" stopColor={colors.primarySoft} stopOpacity="0.9" />
              <Stop offset="80%" stopColor={bodyBaseColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.ink} stopOpacity="0.15" />
            </RadialGradient>
          </Defs>

          {/* Rounded blob body */}
          <Path
            d="M 50 10 C 78 10, 92 28, 92 52 C 92 78, 76 92, 50 92 C 24 92, 8 78, 8 52 C 8 28, 22 10, 50 10 Z"
            fill="url(#solGradient)"
          />

          {/* Soft rosy cheeks */}
          <Circle cx="26" cy="58" r="6" fill={colors.peach} opacity="0.65" />
          <Circle cx="74" cy="58" r="6" fill={colors.peach} opacity="0.65" />

          {/* Facial features (eyes, mouth, eyebrows) */}
          <MascotFacialFeatures expression={expression} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
