import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { useColors } from "@/hooks/useColors";

export default function Welcome() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fade, slide, pulse]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: isWeb ? 67 + insets.top : insets.top + 20,
          paddingBottom: isWeb ? 34 + insets.bottom : insets.bottom + 24,
        },
      ]}
    >
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={[colors.primary + "33", "transparent"]}
          style={[styles.glow, { borderRadius: 200 }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Animated.View
          style={[
            styles.iconCircle,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: pulse }],
            },
          ]}
        >
          <Feather name="activity" size={56} color={colors.primaryForeground} />
        </Animated.View>
      </View>

      <Animated.View
        style={{
          opacity: fade,
          transform: [{ translateY: slide }],
          alignItems: "center",
          paddingHorizontal: 28,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 36,
            color: colors.foreground,
            textAlign: "center",
            letterSpacing: -1,
          }}
        >
          Healthy skin starts here.
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: colors.mutedForeground,
            textAlign: "center",
            marginTop: 14,
            lineHeight: 24,
          }}
        >
          Snap a photo of your skin and Lens AI checks for acne, eczema,
          fungal infections, suspicious moles and more — with a tailored
          self-care guide for each.
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: fade,
          transform: [{ translateY: slide }],
          paddingHorizontal: 24,
          gap: 12,
          width: "100%",
          maxWidth: 420,
          alignSelf: "center",
        }}
      >
        <Button
          label="Get started"
          icon="arrow-right"
          onPress={() => router.push("/(auth)/signup")}
          size="lg"
        />
        <Button
          label="I already have an account"
          variant="ghost"
          onPress={() => router.push("/(auth)/login")}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  heroWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5b5bff",
    shadowOpacity: 0.4,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  glow: {
    position: "absolute",
    width: 320,
    height: 320,
  },
});
