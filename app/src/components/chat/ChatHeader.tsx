import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Text } from "../ui/Text.js";
import { SolMascot } from "../Sol/SolMascot.js";
import { colors } from "../../theme/colors.js";
import { spacing } from "../../theme/spacing.js";
import { haptics } from "../../lib/haptics.js";

interface ChatHeaderProps {
  title: string;
  onRename?: () => void;
  onDelete?: () => void;
}

export function ChatHeader({ title, onRename, onDelete }: ChatHeaderProps): React.JSX.Element {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() => {
          haptics.tap();
          router.back();
        }}
        activeOpacity={0.7}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 18L9 12L15 6"
            stroke={colors.ink}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.titleContainer}
        onPress={onRename}
        activeOpacity={onRename ? 0.7 : 1}
      >
        <View style={styles.mascot}>
          <SolMascot size={32} expression="calm" />
        </View>
        <View style={styles.textContainer}>
          <Text
            variant="h3"
            color={colors.ink}
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            maxFontSizeMultiplier={1.2}
          >
            {title}
          </Text>
          <Text variant="caption" color={colors.primary}>
            Sol • AI Companion
          </Text>
        </View>
      </TouchableOpacity>

      {onDelete ? (
        <TouchableOpacity
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 6H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6"
              stroke={colors.inkSoft}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.primarySoft,
  },
  backButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.xs,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  mascot: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  actionButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.xs,
  },
});
