export const colors = {
  bg: "#FBF8F4",
  surface: "#FFFFFF",
  ink: "#2E2A47",
  inkSoft: "#5E5A73",
  primary: "#7C6FD6",
  primaryStrong: "#5B4EC2",
  primarySoft: "#ECE8FF",
  mint: "#9ED9C3",
  mintText: "#2E7D63",
  peach: "#FFC9A8",
  peachText: "#A8552A",
  sky: "#A9CBF2",
  danger: "#E07A7A",
  dangerText: "#B3403F",
  dangerStrong: "#C2413F",
  mood: {
    great: "#7FD1A8",
    good: "#A9CBF2",
    okay: "#F5D58A",
    low: "#F2B38B",
    awful: "#C9A2D8",
  },
  gradients: {
    dawn: ["#FFE7D6", "#ECE8FF"] as const,
    dusk: ["#ECE8FF", "#CFE8F5"] as const,
  },
};

export type MoodKey = keyof typeof colors.mood;
