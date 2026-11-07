import React, { useState } from "react";
import { Modal, View, StyleSheet, TextInput } from "react-native";
import { Text } from "../ui/Text.js";
import { Button } from "../ui/Button.js";
import { colors } from "../../theme/colors.js";
import { spacing, radius } from "../../theme/spacing.js";
import { haptics } from "../../lib/haptics.js";

interface CustomReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; time: string; body: string }) => void;
}

export function CustomReminderModal({
  visible,
  onClose,
  onSave,
}: CustomReminderModalProps): React.JSX.Element {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [body, setBody] = useState("A gentle pause for yourself.");

  const handleSave = () => {
    if (!title.trim()) return;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const formattedTime = timeRegex.test(time.trim()) ? time.trim() : "09:00";
    haptics.select();
    onSave({
      title: title.trim(),
      time: formattedTime,
      body: body.trim() || "A gentle pause for yourself.",
    });
    setTitle("");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text variant="h3" color={colors.ink} style={styles.header}>
            New Reminder
          </Text>
          <Text variant="caption" color={colors.inkSoft} style={styles.label}>
            TITLE
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Afternoon stretch"
            placeholderTextColor={colors.inkSoft}
            style={styles.input}
          />
          <Text variant="caption" color={colors.inkSoft} style={styles.label}>
            TIME (24-hour HH:MM)
          </Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="09:00"
            placeholderTextColor={colors.inkSoft}
            style={styles.input}
          />
          <View style={styles.buttonRow}>
            <Button title="Cancel" variant="secondary" onPress={onClose} style={styles.btn} />
            <Button title="Create" variant="primary" onPress={handleSave} style={styles.btn} />
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
  header: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.ink,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  btn: {
    minWidth: 80,
  },
});
