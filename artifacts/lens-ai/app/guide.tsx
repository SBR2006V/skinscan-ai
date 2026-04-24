import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import {
  CONDITION_GUIDE,
  CONDITION_ICON,
  type ConditionGuide,
} from "@/lib/skin";

export default function GuideScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: isWeb ? 67 + insets.top : insets.top + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="chevron-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 18,
              color: colors.foreground,
              letterSpacing: -0.4,
            }}
          >
            Skin conditions guide
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: colors.mutedForeground,
              marginTop: 2,
            }}
          >
            Reference for each condition Lens AI checks for
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: isWeb ? 84 + 24 : insets.bottom + 32,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fade,
            transform: [{ translateY: slide }],
            gap: 16,
          }}
        >
          {/* Intro */}
          <Card
            padding={14}
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "flex-start",
              backgroundColor: colors.accent,
              borderColor: "transparent",
            }}
          >
            <Feather name="book-open" size={18} color={colors.accentForeground} />
            <Text
              style={{
                flex: 1,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                lineHeight: 19,
                color: colors.accentForeground,
              }}
            >
              Use this guide to better understand the conditions Lens AI screens
              for. It is informational only — for medical advice, always
              consult a qualified clinician.
            </Text>
          </Card>

          {CONDITION_GUIDE.map((g) => (
            <ConditionGuideCard key={g.key} guide={g} />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function ConditionGuideCard({ guide }: { guide: ConditionGuide }) {
  const colors = useColors();
  const icon = CONDITION_ICON[guide.key];
  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      {/* Header */}
      <View
        style={{
          padding: 18,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: guide.accent + "12",
          borderBottomWidth: 1,
          borderBottomColor: guide.accent + "33",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: guide.accent + "22",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name={icon} size={22} color={guide.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 18,
              color: colors.foreground,
              letterSpacing: -0.3,
            }}
          >
            {guide.name}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              color: colors.mutedForeground,
              marginTop: 2,
            }}
          >
            {guide.tagline}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={{ padding: 18, gap: 16 }}>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            lineHeight: 21,
            color: colors.foreground,
          }}
        >
          {guide.overview}
        </Text>

        <BulletSection
          title="Common signs"
          items={guide.signs}
          color={guide.accent}
        />
        <BulletSection
          title="Causes & triggers"
          items={guide.causes}
          color={guide.accent}
        />
        <BulletSection
          title="Self-care"
          items={guide.selfCare}
          color={colors.success}
        />
        <BulletSection
          title="See a doctor if"
          items={guide.seeDoctor}
          color={colors.warning}
        />
      </View>
    </Card>
  );
}

function BulletSection({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 11,
          letterSpacing: 1.2,
          color,
        }}
      >
        {title.toUpperCase()}
      </Text>
      <View style={{ gap: 8 }}>
        {items.map((item, i) => (
          <View key={i} style={styles.bulletRow}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: color,
                marginTop: 8,
              }}
            />
            <Text
              style={{
                flex: 1,
                fontFamily: "Inter_400Regular",
                fontSize: 13.5,
                lineHeight: 20,
                color: colors.foreground,
              }}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
});
