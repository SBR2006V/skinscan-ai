import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Card } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/contexts/HistoryContext";
import { useColors } from "@/hooks/useColors";
import {
  BODY_AREAS,
  CONDITION_SHORT,
  severityColor,
} from "@/lib/skin";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { entries } = useHistory();
  const isWeb = Platform.OS === "web";

  const stats = useMemo(() => {
    const total = entries.length;
    const flagged = entries.filter((e) => e.result.infectionPresent).length;
    const lastScan =
      entries.length > 0
        ? Math.floor((Date.now() - entries[0].createdAt) / (1000 * 60 * 60 * 24))
        : null;
    return { total, flagged, lastScan };
  }, [entries]);

  const recent = entries.slice(0, 4);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: isWeb ? 67 + insets.top : insets.top + 16,
          paddingBottom: isWeb ? 84 + 24 : insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fade }}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: colors.mutedForeground,
                }}
              >
                {greeting}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 26,
                  color: colors.foreground,
                  letterSpacing: -0.6,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {user?.name?.split(" ")[0] ?? "there"}
              </Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/profile")}>
              <Avatar
                name={user?.name ?? "?"}
                color={user?.avatarColor ?? colors.primary}
                size={44}
              />
            </Pressable>
          </View>

          {/* Hero scan card */}
          <Pressable
            onPress={() => router.push("/scan?bodyArea=general")}
            style={({ pressed }) => [
              styles.heroPressable,
              { opacity: pressed ? 0.95 : 1, borderRadius: 24 },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, "#a855f7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.hero, { borderRadius: 24 }]}
            >
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.heroLabel}>SKIN CHECK</Text>
                <Text style={styles.heroTitle}>Scan your skin</Text>
                <Text style={styles.heroSub}>
                  Spot acne, eczema, fungal infections and suspicious moles in
                  seconds.
                </Text>
              </View>
              <View style={styles.heroIcon}>
                <Feather name="camera" size={28} color="#5b5bff" />
              </View>
            </LinearGradient>
          </Pressable>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Card style={styles.statCard} padding={14}>
              <Feather name="activity" size={16} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Scans
              </Text>
            </Card>
            <Card style={styles.statCard} padding={14}>
              <Feather name="alert-circle" size={16} color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stats.flagged}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Flagged
              </Text>
            </Card>
            <Card style={styles.statCard} padding={14}>
              <Feather name="clock" size={16} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stats.lastScan === null
                  ? "—"
                  : stats.lastScan === 0
                    ? "Today"
                    : `${stats.lastScan}d`}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Last scan
              </Text>
            </Card>
          </View>

          {/* Body areas */}
          <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.foreground,
                marginBottom: 12,
              }}
            >
              Choose a body area
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          >
            {BODY_AREAS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => router.push(`/scan?bodyArea=${m.key}`)}
                style={({ pressed }) => [
                  styles.modeChip,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View
                  style={[styles.modeIcon, { backgroundColor: m.color + "1a" }]}
                >
                  <Feather name={m.icon} size={18} color={m.color} />
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: colors.foreground,
                  }}
                >
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Guide entry */}
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Pressable
              onPress={() => router.push("/guide")}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              <Card padding={14} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: colors.primary + "1a",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="book-open" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: colors.foreground,
                      marginBottom: 2,
                    }}
                  >
                    Skin conditions guide
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: colors.mutedForeground,
                      lineHeight: 17,
                    }}
                  >
                    Learn the signs, causes and care for acne, eczema, fungal
                    infections, moles and skin cancer.
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={colors.mutedForeground}
                />
              </Card>
            </Pressable>
          </View>

          {/* Tip card */}
          <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
            <Card padding={14} style={{ flexDirection: "row", gap: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="info" size={16} color={colors.accentForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: colors.foreground,
                    marginBottom: 2,
                  }}
                >
                  Get the best results
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: colors.mutedForeground,
                    lineHeight: 17,
                  }}
                >
                  Use bright, even lighting. Hold the camera 10–20 cm from the
                  area. Keep it in sharp focus.
                </Text>
              </View>
            </Card>
          </View>

          {/* Recent activity */}
          <View
            style={{
              paddingHorizontal: 20,
              marginTop: 24,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: colors.foreground,
              }}
            >
              Recent
            </Text>
            {entries.length > 0 ? (
              <Pressable onPress={() => router.push("/(tabs)/history")}>
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  See all
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 10 }}>
            {recent.length === 0 ? (
              <Card padding={24}>
                <View style={{ alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: colors.muted,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather name="image" size={24} color={colors.mutedForeground} />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      color: colors.foreground,
                      fontSize: 15,
                    }}
                  >
                    No scans yet
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      color: colors.mutedForeground,
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    Tap the scan card above to check your first photo.
                  </Text>
                </View>
              </Card>
            ) : (
              recent.map((entry) => {
                const dot = severityColor(entry.result.severity, colors);
                return (
                  <Pressable
                    key={entry.id}
                    onPress={() => router.push(`/result/${entry.id}`)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                  >
                    <Card padding={12} style={{ flexDirection: "row", gap: 12 }}>
                      <Image
                        source={{ uri: entry.imageUri }}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 12,
                          backgroundColor: colors.muted,
                        }}
                      />
                      <View style={{ flex: 1, justifyContent: "center", gap: 4 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 15,
                            color: colors.foreground,
                          }}
                        >
                          {entry.result.title}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: dot,
                            }}
                          />
                          <Text
                            numberOfLines={1}
                            style={{
                              fontFamily: "Inter_400Regular",
                              fontSize: 12,
                              color: colors.mutedForeground,
                            }}
                          >
                            {CONDITION_SHORT[entry.result.condition]} ·{" "}
                            {Math.round(entry.result.confidence * 100)}%
                          </Text>
                        </View>
                      </View>
                      <Feather
                        name="chevron-right"
                        size={20}
                        color={colors.mutedForeground}
                        style={{ alignSelf: "center" }}
                      />
                    </Card>
                  </Pressable>
                );
              })
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  heroPressable: {
    marginHorizontal: 20,
  },
  hero: {
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    minHeight: 132,
  },
  heroLabel: {
    color: "#ffffff",
    opacity: 0.8,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: "#ffffff",
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  heroSub: {
    color: "#ffffff",
    opacity: 0.85,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    gap: 6,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  modeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  modeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
