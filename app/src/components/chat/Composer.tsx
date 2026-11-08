import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../theme/colors.js";
import { spacing, radius } from "../../theme/spacing.js";
import { typography } from "../../theme/typography.js";
import { haptics } from "../../lib/haptics.js";

interface ComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function Composer({
  onSend,
  disabled = false,
  placeholder = "Message Sol...",
}: ComposerProps): React.JSX.Element {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    const trimmed = text.trim();
    setText("");
    haptics.tap();
    onSend(trimmed);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.inkSoft}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          editable={!disabled}
        />
        <TouchableOpacity
          style={[styles.sendButton, canSend ? styles.sendButtonActive : styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M22 2L11 13"
              stroke={canSend ? colors.surface : colors.inkSoft}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke={canSend ? colors.surface : colors.inkSoft}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.primarySoft,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.xs : 2,
    minHeight: 46,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    color: colors.ink,
    maxHeight: 100,
    paddingTop: Platform.OS === "ios" ? 8 : 6,
    paddingBottom: Platform.OS === "ios" ? 8 : 6,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.xs,
    marginBottom: 4,
  },
  sendButtonActive: {
    backgroundColor: colors.primaryStrong,
  },
  sendButtonDisabled: {
    backgroundColor: colors.primarySoft,
  },
});
