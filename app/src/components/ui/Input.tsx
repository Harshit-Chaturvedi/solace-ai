import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "../../theme/index.js";
import { Text } from "./Text.js";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  secureTextEntry,
  containerStyle,
  style,
  ...rest
}: InputProps) {
  const [isSecure, setIsSecure] = useState(Boolean(secureTextEntry));
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text variant="small" color={colors.inkSoft} style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          Boolean(error) && styles.errorBorder,
        ]}
      >
        <TextInput
          placeholderTextColor={colors.inkSoft}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, style]}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            style={styles.secureToggle}
            hitSlop={8}
          >
            <Text variant="caption" color={colors.primary}>
              {isSecure ? "Show" : "Hide"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    paddingHorizontal: spacing.base,
  },
  focused: {
    borderColor: colors.primary,
  },
  errorBorder: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.ink,
  },
  secureToggle: {
    paddingLeft: spacing.sm,
    paddingVertical: spacing.xs,
  },
  errorText: {
    marginTop: spacing.xs,
  },
});
