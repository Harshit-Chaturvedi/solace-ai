import React from "react";
import { StyleSheet, View } from "react-native";
import { Screen, Text, Button } from "../../src/components/ui/index.js";
import { SolMascot } from "../../src/components/Sol/index.js";
import { colors, spacing } from "../../src/theme/index.js";
import { useAuthStore } from "../../src/store/auth.js";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <SolMascot size={110} expression="happy" moodTint={user?.avatarColor} />
        <Text variant="h1" center style={styles.greeting}>
          Welcome, {user?.name || "Friend"}
        </Text>
        <Text variant="body" color={colors.inkSoft} center style={styles.subtitle}>
          Your gentle wellness companion
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  greeting: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xxl,
  },
  btn: {
    width: "100%",
  },
});
