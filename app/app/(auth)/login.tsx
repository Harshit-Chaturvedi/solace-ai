import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen, Text, Button, Card, Input } from "../../src/components/ui/index.js";
import { SolMascot } from "../../src/components/Sol/index.js";
import { colors, spacing } from "../../src/theme/index.js";
import { login } from "../../src/api/auth.js";
import { getReminders } from "../../src/api/reminders.js";
import { syncReminders } from "../../src/lib/notifications.js";
import { useAuthStore } from "../../src/store/auth.js";
import { ApiError } from "../../src/api/client.js";

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter your email address");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const res = await login({
        email: email.trim(),
        password,
      });
      await setAuth(res.token, res.user);
      getReminders()
        .then((rems) => {
          if (rems && rems.length > 0) syncReminders(rems);
        })
        .catch(() => {});

      if (res.user.onboardingDone) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/profile-setup");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorMsg("Invalid email or password. Please try again.");
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg("Network error - could not sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <SolMascot size={80} expression="calm" />
            <Text variant="h1" center style={styles.title}>
              Welcome Back
            </Text>
            <Text
              variant="body"
              color={colors.inkSoft}
              center
              style={styles.subtitle}
            >
              Sign in to continue your mindful moments.
            </Text>
          </View>

          <Card style={styles.card}>
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Text variant="small" color={colors.danger} center>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Log In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitBtn}
            />
          </Card>

          <View style={styles.footer}>
            <Text variant="body" color={colors.inkSoft}>
              Don&apos;t have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/signup")} hitSlop={8}>
              <Text variant="bodyBold" color={colors.primary}>
                Sign Up
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.xl,
    paddingBottom: 40,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    width: "100%",
    paddingHorizontal: spacing.sm,
  },
  card: {
    marginBottom: spacing.xl,
  },
  errorBanner: {
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
});
