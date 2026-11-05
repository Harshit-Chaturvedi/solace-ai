import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Text, Button } from "../../src/components/ui/index.js";
import { colors, spacing } from "../../src/theme/index.js";
import { useAuthStore } from "../../src/store/auth.js";

export default function ProfileTab() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <Screen style={styles.center}>
      <Text variant="h1" style={styles.title}>
        {user?.name || "Your Profile"}
      </Text>
      <Text variant="body" color={colors.inkSoft} style={styles.subtitle}>
        {user?.email}
      </Text>
      <Button
        title="Sign Out"
        variant="secondary"
        onPress={async () => {
          await logout();
          router.replace("/(auth)/login");
        }}
        style={styles.btn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.xl },
  btn: { width: "100%", maxWidth: 260 },
});
