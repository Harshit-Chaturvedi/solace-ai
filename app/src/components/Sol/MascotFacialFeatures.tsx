import React from "react";
import { Circle, G, Path } from "react-native-svg";
import { colors } from "../../theme/index.js";

export type SolExpression =
  | "happy"
  | "calm"
  | "concerned"
  | "thinking"
  | "sleepy"
  | "excited";

export function MascotFacialFeatures({
  expression,
}: {
  expression: SolExpression;
}) {
  switch (expression) {
    case "happy":
      return (
        <G>
          <Path
            d="M 30 46 Q 37 40 44 46"
            stroke={colors.ink}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 56 46 Q 63 40 70 46"
            stroke={colors.ink}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 42 60 Q 50 71 58 60"
            stroke={colors.ink}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    case "calm":
      return (
        <G>
          <Circle cx="37" cy="46" r="4" fill={colors.ink} />
          <Circle cx="63" cy="46" r="4" fill={colors.ink} />
          <Path
            d="M 44 60 Q 50 65 56 60"
            stroke={colors.ink}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    case "concerned":
      return (
        <G>
          <G stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round">
            <Path d="M 28 35 L 42 39" />
            <Path d="M 72 35 L 58 39" />
          </G>
          <Circle cx="37" cy="46" r="4.5" fill={colors.ink} />
          <Circle cx="63" cy="46" r="4.5" fill={colors.ink} />
          <Path
            d="M 43 64 Q 50 58 57 62"
            stroke={colors.ink}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    case "thinking":
      return (
        <G>
          <Circle cx="40" cy="42" r="4" fill={colors.ink} />
          <Circle cx="66" cy="42" r="4" fill={colors.ink} />
          <Path
            d="M 46 62 Q 51 64 55 61"
            stroke={colors.ink}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    case "sleepy":
      return (
        <G>
          <Path
            d="M 30 48 Q 37 54 44 48"
            stroke={colors.ink}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 56 48 Q 63 54 70 48"
            stroke={colors.ink}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 46 62 Q 50 64 54 62"
            stroke={colors.ink}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    case "excited":
      return (
        <G>
          <Circle cx="37" cy="44" r="5.5" fill={colors.ink} />
          <Circle cx="63" cy="44" r="5.5" fill={colors.ink} />
          <Circle cx="39" cy="42" r="1.5" fill={colors.surface} />
          <Circle cx="65" cy="42" r="1.5" fill={colors.surface} />
          <Path d="M 41 58 Q 50 72 59 58 Z" fill={colors.ink} />
        </G>
      );
  }
}
