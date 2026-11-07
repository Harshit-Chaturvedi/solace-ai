import React from "react";
import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";
import { colors, typography, type TypographyVariant } from "../../theme/index.js";

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  center?: boolean;
}

export function Text({
  variant = "body",
  color = colors.ink,
  center = false,
  style,
  children,
  ...rest
}: TextProps) {
  const defaultMaxFontScale =
    variant === "display" || variant === "h1" || variant === "h2" || variant === "h3"
      ? 1.2
      : undefined;

  return (
    <RNText
      maxFontSizeMultiplier={rest.maxFontSizeMultiplier ?? defaultMaxFontScale}
      style={[
        styles.base,
        variantStyles[variant],
        { color },
        center && styles.center,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.ink,
  },
  center: {
    textAlign: "center",
  },
});

const variantStyles = StyleSheet.create({
  display: {
    fontFamily: typography.fonts.headingBold,
    fontSize: typography.sizes.display,
    lineHeight: typography.lineHeights.display,
  },
  h1: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h1,
    lineHeight: typography.lineHeights.h1,
  },
  h2: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h2,
    lineHeight: typography.lineHeights.h2,
  },
  h3: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h3,
    lineHeight: typography.lineHeights.h3,
  },
  body: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  bodyMedium: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  bodyBold: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
  },
  small: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    lineHeight: typography.lineHeights.small,
  },
  caption: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
  },
});
