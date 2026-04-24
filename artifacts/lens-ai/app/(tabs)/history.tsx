import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/components/ui";
import { type HistoryEntry, useHistory } from "@/contexts/HistoryContext";
import { useColors } from "@/hooks/useColors";
import { CONDITION_LABEL, severityColor } from "@/lib/skin";

function formatDate(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { entries, remove, clear } = useHistory();
  const isWeb = Platform.OS === "web";

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.result.title.toLowerCase().includes(q) ||
        e.result.condition.toLowerCase().includes(q) ||
        CONDITION_LABEL[e.result.condition].toLowerCase().includes(q) ||
        e.result.symptoms.some((s) => s.toLowerCase().includes(q)),
    );
  }, [entries, query]);

  const onClear = () => {
    if (entries.length === 0) return;
    Alert.alert(
      "Clear all history?",
      "This permanently removes all of your scans on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            void clear();
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => {
    const dot = severityColor(item.result.severity, colors);
    return (
      <Pressable
        onPress={() => router.push(`/result/${item.id}`)}
        onLongPress={() => {
          Alert.alert("Delete scan?", item.result.title, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => void remove(item.id),
            },
          ]);
        }}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <Card padding={12} style={{ flexDirection: "row", gap: 12 }}>
          <Image
            source={{ uri: item.imageUri }}
            style={{
              width: 70,
              height: 70,
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
              {item.result.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: dot + "1a",
                    borderColor: dot + "55",
                  },
                ]}
              >
                <Text
                  style={{
                    color: dot,
                    fontSize: 11,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  {CONDITION_LABEL[item.result.condition]}
                </Text>
              </View>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                }}
              >
                {Math.round(item.result.confidence * 100)}%
              </Text>
            </View>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 11,
                fontFamily: "Inter_400Regular",
              }}
            >
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={18}
            color={colors.mutedForeground}
            style={{ alignSelf: "center" }}
          />
        </Card>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          { paddingTop: isWeb ? 67 + insets.top : insets.top + 12 },
        ]}
      >
        <View style={styles.headerTopRow}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 28,
              color: colors.foreground,
              letterSpacing: -0.6,
            }}
          >
            History
          </Text>
          {entries.length > 0 ? (
            <Pressable
              onPress={onClear}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, padding: 8 }]}
            >
              <Feather name="trash-2" size={20} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search scans"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            style={{
              flex: 1,
              color: colors.foreground,
              fontFamily: "Inter_400Regular",
              fontSize: 14,
            }}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: isWeb ? 84 + 24 : insets.bottom + 100,
          gap: 10,
        }}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60, gap: 10 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.muted,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather
                name={query ? "search" : "image"}
                size={26}
                color={colors.mutedForeground}
              />
            </View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                color: colors.foreground,
                fontSize: 16,
              }}
            >
              {query ? "No matches" : "No scans yet"}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                fontSize: 13,
                textAlign: "center",
                paddingHorizontal: 40,
              }}
            >
              {query
                ? "Try a different keyword."
                : "Your past skin checks will live here."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
  },
  tag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
});
