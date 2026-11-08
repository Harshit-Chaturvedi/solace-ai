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
import { signup } from "../../src/api/auth.js";
import { getReminders } from "../../src/api/reminders.js";
import { syncReminders } from "../../src/lib/notifications.js";
import { useAuthStore } from "../../src/store/auth.js";
import { ApiError } from "../../src/api/client.js";

export default function SignupScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignup = async () => {
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      await setAuth(res.token, res.user);
      getReminders()
        .then((rems) => {
          if (rems && rems.length > 0) syncReminders(rems);
        })
        .catch(() => {});
      router.replace("/(auth)/profile-setup");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrorMsg("That email already has an account - log in instead?");
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg("Network error - could not sign up. Please try again.");
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
            <SolMascot size={80} expression="happy" />
            <Text variant="h1" center style={styles.title}>
              Welcome to Solace
            </Text>
            <Text
              variant="body"
              color={colors.inkSoft}
              center
              style={styles.subtitle}
            >
              Create your account to start your mindful journey.
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
              label="Your Name"
              placeholder="e.g. Aisha"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

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
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.submitBtn}
            />
          </Card>

          <View style={styles.footer}>
            <Text variant="body" color={colors.inkSoft}>
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)/login")} hitSlop={8}>
              <Text variant="bodyBold" color={colors.primary}>
                Log In
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
