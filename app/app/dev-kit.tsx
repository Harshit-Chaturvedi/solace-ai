import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Screen,
  Text,
  Button,
  Card,
  Input,
  Chip,
  Skeleton,
  EmptyState,
} from "../src/components/ui/index.js";
import {
  SolMascot,
  TypingSol,
  type SolExpression,
} from "../src/components/Sol/index.js";
import { colors, spacing } from "../src/theme/index.js";

const expressions: SolExpression[] = [
  "happy",
  "calm",
  "concerned",
  "thinking",
  "sleepy",
  "excited",
];

export default function DevKitScreen() {
  const [expression, setExpression] = useState<SolExpression>("calm");
  const [breathing, setBreathing] = useState(true);
  const [selectedChip, setSelectedChip] = useState("calm");
  const [inputValue, setInputValue] = useState("");

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" style={styles.sectionTitle}>
          Dev Kit - UI & Mascot
        </Text>
        <Text variant="body" color={colors.inkSoft} style={styles.sectionSubtitle}>
          Design system tokens, interactive Sol mascot, and reusable UI kit.
        </Text>

        {/* Sol Mascot Showcase */}
        <Card style={styles.card}>
          <Text variant="h3" style={styles.cardHeading}>
            Sol Mascot ({expression})
          </Text>
          <View style={styles.mascotCenter}>
            <SolMascot
              size={130}
              expression={expression}
              breathing={breathing}
            />
          </View>
          <View style={styles.chipRow}>
            {expressions.map((exp) => (
              <Chip
                key={exp}
                label={exp}
                selected={expression === exp}
                onPress={() => setExpression(exp)}
                style={styles.chipSpacing}
              />
            ))}
          </View>
          <Button
            title={breathing ? "Pause Breathing" : "Resume Breathing"}
            variant="secondary"
            onPress={() => setBreathing(!breathing)}
            style={styles.btnSpacing}
          />
          <Text variant="small" color={colors.inkSoft} style={styles.subLabel}>
            Typing indicator (TypingSol):
          </Text>
          <View style={styles.typingRow}>
            <TypingSol size={36} />
          </View>
        </Card>

        {/* Typography */}
        <Card style={styles.card}>
          <Text variant="h3" style={styles.cardHeading}>
            Typography Scale
          </Text>
          <Text variant="display">Display Text</Text>
          <Text variant="h1">Heading 1</Text>
          <Text variant="h2">Heading 2</Text>
          <Text variant="h3">Heading 3</Text>
          <Text variant="bodyBold">Body Bold</Text>
          <Text variant="body">Body Regular</Text>
          <Text variant="small" color={colors.inkSoft}>
            Small Text
          </Text>
          <Text variant="caption" color={colors.inkSoft}>
            Caption Text
          </Text>
        </Card>

        {/* Buttons */}
        <Card style={styles.card}>
          <Text variant="h3" style={styles.cardHeading}>
            Buttons
          </Text>
          <Button
            title="Primary Button"
            variant="primary"
            onPress={() => {}}
            style={styles.btnSpacing}
          />
          <Button
            title="Secondary Button"
            variant="secondary"
            onPress={() => {}}
            style={styles.btnSpacing}
          />
          <Button
            title="Ghost Button"
            variant="ghost"
            onPress={() => {}}
            style={styles.btnSpacing}
          />
        </Card>

        {/* Inputs */}
        <Card style={styles.card}>
          <Text variant="h3" style={styles.cardHeading}>
            Inputs
          </Text>
          <Input
            label="Your Name"
            placeholder="e.g. Aisha"
            value={inputValue}
            onChangeText={setInputValue}
          />
          <Input
            label="Password"
            placeholder="Min 8 characters"
            secureTextEntry
          />
        </Card>

        {/* Chips */}
        <Card style={styles.card}>
          <Text variant="h3" style={styles.cardHeading}>
            Chips (Selectable)
          </Text>
          <View style={styles.chipRow}>
            {["calm", "happy", "sleepy", "anxious"].map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={selectedChip === tag}
                onPress={() => setSelectedChip(tag)}
                style={styles.chipSpacing}
              />
            ))}
          </View>
        </Card>

        {/* Skeletons */}
        <Card style={styles.card}>
          <Text variant="h3" style={styles.cardHeading}>
            Skeleton Loading
          </Text>
          <Skeleton height={20} width="80%" style={styles.skeletonSpacing} />
          <Skeleton height={14} width="60%" style={styles.skeletonSpacing} />
        </Card>

        {/* Empty State */}
        <Card style={styles.card}>
          <EmptyState
            title="Quiet Space"
            description="Take a deep breath. Sol will be right here whenever you need."
            actionTitle="Refresh"
            onAction={() => {}}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.base,
  },
  cardHeading: {
    marginBottom: spacing.md,
  },
  mascotCenter: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.md,
  },
  btnSpacing: {
    marginBottom: spacing.sm,
  },
  subLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  typingRow: {
    paddingVertical: spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.sm,
  },
  chipSpacing: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  skeletonSpacing: {
    marginBottom: spacing.sm,
  },
});
