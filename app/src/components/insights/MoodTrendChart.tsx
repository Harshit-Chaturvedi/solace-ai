import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { Card, Text } from "../ui/index.js";
import { MoodSeriesPoint } from "../../api/insights.js";
import { colors, spacing } from "../../theme/index.js";

const MOOD_COLOR_MAP: Record<string, string> = {
  great: colors.mood.great,
  good: colors.mood.good,
  okay: colors.mood.okay,
  low: colors.mood.low,
  awful: colors.mood.awful,
};

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface MoodTrendChartProps {
  range: 7 | 30;
  moodSeries: MoodSeriesPoint[];
}

export function MoodTrendChart({ range, moodSeries }: MoodTrendChartProps): React.JSX.Element {
  const now = new Date();
  const axisDays: Array<{
    dateStr: string;
    label: string;
    showLabel: boolean;
    x: number;
  }> = [];

  const leftMargin = 24;
  const usableWidth = 320 - leftMargin * 2;
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = formatYMD(d);
    const idx = range - 1 - i;
    const x = leftMargin + (idx * usableWidth) / Math.max(range - 1, 1);

    let label = `${d.getMonth() + 1}/${d.getDate()}`;
    let showLabel = true;
    if (range === 7) {
      label = weekdays[d.getDay()] || label;
      showLabel = true;
    } else {
      showLabel = idx % 5 === 0 || idx === range - 1;
    }
    axisDays.push({ dateStr, label, showLabel, x });
  }

  const moodByDate = new Map<string, { mood: string; score: number }>();
  for (const m of moodSeries) {
    moodByDate.set(m.date, m);
  }

  const plottedPoints: Array<{ x: number; y: number; mood: string }> = [];
  const chartDays = axisDays.map((ad) => {
    const entry = moodByDate.get(ad.dateStr);
    if (entry) {
      const y = 115 - ((entry.score - 1) * 80) / 4;
      plottedPoints.push({ x: ad.x, y, mood: entry.mood });
      return { ...ad, hasData: true, y, mood: entry.mood };
    }
    return { ...ad, hasData: false, y: 75, mood: "" };
  });

  const polylinePoints = plottedPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <Card style={styles.chartCard}>
      <Text variant="h3" color={colors.ink} style={styles.chartTitle}>
        Mood Trend ({range === 7 ? "Past 7 Days" : "Past 30 Days"})
      </Text>

      <View style={styles.chartContainer}>
        <Svg width="100%" height={155} viewBox="0 0 320 155">
          <Line x1="16" y1="35" x2="304" y2="35" stroke={colors.primarySoft} strokeWidth="1" />
          <Line x1="16" y1="75" x2="304" y2="75" stroke={colors.primarySoft} strokeWidth="1" />
          <Line x1="16" y1="115" x2="304" y2="115" stroke={colors.primarySoft} strokeWidth="1" />

          {plottedPoints.length > 1 ? (
            <Polyline
              points={polylinePoints}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {chartDays.map((d, i) =>
            d.hasData ? (
              <Circle
                key={d.dateStr + i}
                cx={d.x}
                cy={d.y}
                r={5.5}
                fill={MOOD_COLOR_MAP[d.mood] || colors.primary}
                stroke={colors.surface}
                strokeWidth={1.5}
              />
            ) : (
              <Circle
                key={d.dateStr + i}
                cx={d.x}
                cy={75}
                r={3}
                fill={colors.primarySoft}
                opacity={0.6}
              />
            )
          )}

          {chartDays.map((d, i) =>
            d.showLabel ? (
              <SvgText
                key={"lbl" + d.dateStr + i}
                x={d.x}
                y={140}
                fontSize="9"
                fill={colors.inkSoft}
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            ) : null
          )}
        </Svg>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    padding: spacing.md,
  },
  chartTitle: {
    marginBottom: spacing.sm,
    flexShrink: 1,
  },
  chartContainer: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
});
