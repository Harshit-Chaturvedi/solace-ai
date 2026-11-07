import React, { useState, useEffect } from "react";
import { Modal, View, StyleSheet, TextInput } from "react-native";
import { Text } from "../ui/Text.js";
import { Button } from "../ui/Button.js";
import { colors } from "../../theme/colors.js";
import { spacing, radius } from "../../theme/spacing.js";
import { haptics } from "../../lib/haptics.js";

interface RenameModalProps {
  visible: boolean;
  initialTitle: string;
  onClose: () => void;
  onSave: (newTitle: string) => void;
}

export function RenameModal({
  visible,
  initialTitle,
  onClose,
  onSave,
}: RenameModalProps): React.JSX.Element {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, visible]);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    haptics.select();
    onSave(trimmed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text variant="h3" color={colors.ink} style={styles.title}>
            Rename Chat
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Conversation title"
            placeholderTextColor={colors.inkSoft}
            style={styles.input}
            autoFocus
            selectTextOnFocus
          />
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={styles.btn}
            />
            <Button
              title="Save"
              variant="primary"
              onPress={handleSave}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.screenPadding,
  },
  dialog: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.ink,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  btn: {
    minWidth: 80,
  },
});
