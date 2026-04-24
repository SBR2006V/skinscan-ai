import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
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

import { Card, ConfidenceRing } from "@/components/ui";
import { useHistory } from "@/contexts/HistoryContext";
import { useColors } from "@/hooks/useColors";
import {
  CONDITION_ICON,
  CONDITION_LABEL,
  severityColor,
  severityLabel,
  urgencyColor,
  urgencyLabel,
} from "@/lib/skin";

export default function ResultScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, remove } = useHistory();
  const isWeb = Platform.OS === "web";

  const entry = getById(id ?? "");

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  if (!entry) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text style={{ color: colors.mutedForeground }}>Scan not found.</Text>
      </View>
    );
  }

  const { result, imageUri, createdAt } = entry;
  const ringValue = Math.max(0, Math.min(1, result.confidence));
  const sevColor = severityColor(result.severity, colors);
  const urgColor = urgencyColor(result.urgency, colors);
  const condIcon = CONDITION_ICON[result.condition];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image */}
        <View style={{ height: 320, width: "100%", backgroundColor: colors.muted }}>
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.5)"]}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.headerControls,
              { paddingTop: isWeb ? 67 + insets.top : insets.top + 8 },
            ]}
          >
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.iconBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="chevron-left" size={22} color="#ffffff" />
            </Pressable>
            <Pressable
              onPress={() => {
                void remove(entry.id);
                router.back();
              }}
              style={({ pressed }) => [
                styles.iconBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="trash-2" size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        <Animated.View
          style={{
            opacity: fade,
            transform: [{ translateY: slide }],
            padding: 20,
            gap: 16,
            marginTop: -32,
          }}
        >
          {/* Title card */}
          <Card padding={20}>
            <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
              <View style={{ flex: 1, gap: 8 }}>
                <View
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: sevColor + "1f",
                      borderColor: sevColor + "55",
                    },
                  ]}
                >
                  <Feather name={condIcon} size={11} color={sevColor} />
                  <Text
                    style={{
                      color: sevColor,
                      fontFamily: "Inter_700Bold",
                      fontSize: 11,
                      letterSpacing: 0.4,
                    }}
                  >
                    {CONDITION_LABEL[result.condition].toUpperCase()}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 24,
                    color: colors.foreground,
                    letterSpacing: -0.5,
                  }}
                >
                  {result.title}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    color: colors.mutedForeground,
                    fontSize: 12,
                  }}
                >
                  Scanned {new Date(createdAt).toLocaleString()}
                </Text>
              </View>
              <ConfidenceRing value={ringValue} size={92} />
            </View>
          </Card>

          {/* Severity + Urgency */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Card style={{ flex: 1 }} padding={14}>
              <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>
                SEVERITY
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: sevColor,
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    color: colors.foreground,
                    fontSize: 16,
                  }}
                >
                  {severityLabel(result.severity)}
                </Text>
              </View>
            </Card>
            <Card style={{ flex: 1 }} padding={14}>
              <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>
                NEXT STEP
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: urgColor,
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    color: colors.foreground,
                    fontSize: 14,
                    flex: 1,
                  }}
                  numberOfLines={2}
                >
                  {urgencyLabel(result.urgency)}
                </Text>
              </View>
            </Card>
          </View>

          {/* Urgent banner */}
          {result.urgency === "urgent" ? (
            <Card
              padding={14}
              style={{
                flexDirection: "row",
                gap: 10,
                alignItems: "flex-start",
                backgroundColor: colors.destructive + "12",
                borderColor: colors.destructive + "55",
              }}
            >
              <Feather name="alert-octagon" size={20} color={colors.destructive} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    color: colors.destructive,
                    fontSize: 14,
                    marginBottom: 2,
                  }}
                >
                  Please get this evaluated soon
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    color: colors.foreground,
                    fontSize: 13,
                    lineHeight: 18,
                  }}
                >
                  Lens AI flagged this as a higher-priority finding. Book a
                  visit with a dermatologist for an in-person assessment.
                </Text>
              </View>
            </Card>
          ) : null}

          {/* Summary */}
          <Card padding={18}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              WHAT WE SEE
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                color: colors.foreground,
                fontSize: 15,
                lineHeight: 22,
                marginTop: 8,
              }}
            >
              {result.summary}
            </Text>
          </Card>

          {/* Symptoms */}
          {result.symptoms.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {result.symptoms.map((s) => (
                <View
                  key={s}
                  style={[
                    styles.tag,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.secondaryForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                    }}
                  >
                    {s}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Details */}
          {result.details.length > 0 ? (
            <Card padding={0}>
              <View style={{ padding: 18, paddingBottom: 6 }}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                  OBSERVATIONS
                </Text>
              </View>
              {result.details.map((d, i) => (
                <View key={`${d.label}-${i}`}>
                  <View style={styles.detailRow}>
                    <Text
                      style={{
                        flex: 1,
                        color: colors.mutedForeground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 13,
                      }}
                    >
                      {d.label}
                    </Text>
                    <Text
                      style={{
                        flex: 1.4,
                        color: colors.foreground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 13,
                        textAlign: "right",
                      }}
                    >
                      {d.value}
                    </Text>
                  </View>
                  {i < result.details.length - 1 ? (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: colors.border,
                        marginHorizontal: 18,
                      }}
                    />
                  ) : null}
                </View>
              ))}
              <View style={{ height: 8 }} />
            </Card>
          ) : null}

          {/* Health guide overview */}
          {result.healthGuide.overview ? (
            <Card padding={18}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <Feather name="book-open" size={14} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  HEALTH GUIDE
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  color: colors.foreground,
                  fontSize: 14,
                  lineHeight: 21,
                  marginTop: 6,
                }}
              >
                {result.healthGuide.overview}
              </Text>
            </Card>
          ) : null}

          {/* Do's */}
          {result.healthGuide.dos.length > 0 ? (
            <BulletCard
              title="DO"
              items={result.healthGuide.dos}
              icon="check"
              color={colors.success}
            />
          ) : null}

          {/* Don'ts */}
          {result.healthGuide.donts.length > 0 ? (
            <BulletCard
              title="DON'T"
              items={result.healthGuide.donts}
              icon="x"
              color={colors.destructive}
            />
          ) : null}

          {/* When to see a doctor */}
          {result.healthGuide.whenToSeeDoctor.length > 0 ? (
            <BulletCard
              title="SEE A DOCTOR IF"
              items={result.healthGuide.whenToSeeDoctor}
              icon="user-plus"
              color={colors.warning}
              borderTint
            />
          ) : null}

          {/* Disclaimer */}
          <Card
            padding={14}
            style={{
              backgroundColor: colors.muted,
              borderColor: colors.border,
              flexDirection: "row",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text
              style={{
                flex: 1,
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                fontSize: 11,
                lineHeight: 16,
              }}
            >
              {result.disclaimer}
            </Text>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function BulletCard({
  title,
  items,
  icon,
  color,
  borderTint,
}: {
  title: string;
  items: string[];
  icon: keyof typeof Feather.glyphMap;
  color: string;
  borderTint?: boolean;
}) {
  const colors = useColors();
  return (
    <Card
      padding={18}
      style={borderTint ? { borderColor: color + "55" } : undefined}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <Feather name={icon} size={14} color={color} />
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 11,
            letterSpacing: 1.2,
            color,
          }}
        >
          {title}
        </Text>
      </View>
      <View style={{ gap: 10, marginTop: 10 }}>
        {items.map((s, i) => (
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
                color: colors.foreground,
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                lineHeight: 21,
              }}
            >
              {s}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  categoryPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
  },
  miniLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
});
