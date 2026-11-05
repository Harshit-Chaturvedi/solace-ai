export const typography = {
  fonts: {
    heading: "Fraunces_600SemiBold",
    headingBold: "Fraunces_700Bold",
    body: "Nunito_400Regular",
    bodyMedium: "Nunito_600SemiBold",
    bodyBold: "Nunito_700Bold",
  },
  sizes: {
    display: 34,
    h1: 28,
    h2: 22,
    h3: 18,
    body: 16,
    small: 14,
    caption: 12,
  },
  lineHeights: {
    display: 44,
    h1: 36,
    h2: 30,
    h3: 24,
    body: 22,
    small: 20,
    caption: 16,
  },
};

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodyMedium"
  | "bodyBold"
  | "small"
  | "caption";
