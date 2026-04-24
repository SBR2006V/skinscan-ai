import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function SignUp() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, signInWithGoogle } = useAuth();
  const isWeb = Platform.OS === "web";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signUp(name, email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const Container = isWeb ? ScrollView : KeyboardAwareScrollView;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          { paddingTop: isWeb ? 67 + insets.top : insets.top + 8 },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="chevron-left" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <Container
        contentContainerStyle={{
          padding: 24,
          paddingBottom: isWeb ? 34 + insets.bottom : insets.bottom + 40,
          gap: 24,
        }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 32,
              color: colors.foreground,
              letterSpacing: -0.8,
            }}
          >
            Create your account
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: colors.mutedForeground,
            }}
          >
            Free, fast and works on every device.
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          <Input
            label="Name"
            icon="user"
            placeholder="Your name"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Email"
            icon="mail"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            icon="lock"
            placeholder="At least 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={error}
          />
        </View>

        <Button
          label="Create account"
          onPress={onSubmit}
          loading={loading}
          disabled={!name || !email || !password}
          size="lg"
        />

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_500Medium" }}>
            OR
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <Button
          label="Continue with Google"
          icon="chrome"
          variant="ghost"
          onPress={onGoogle}
          loading={googleLoading}
        />

        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
            Already a member?
          </Text>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
              Sign in
            </Text>
          </Pressable>
        </View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
});
