import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/components/ui";
import {
  type Notification,
  useNotifications,
} from "@/contexts/NotificationsContext";
import { useColors } from "@/hooks/useColors";

function ago(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ts).toLocaleDateString();
}

const ICON_MAP: Record<Notification["kind"], keyof typeof Feather.glyphMap> = {
  scan: "zap",
  tip: "info",
  system: "bell",
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, markRead, markAllRead, remove, clear } =
    useNotifications();
  const isWeb = Platform.OS === "web";

  const onClear = () => {
    if (notifications.length === 0) return;
    Alert.alert("Clear all updates?", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => void clear(),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const accent =
      item.kind === "tip"
        ? colors.warning
        : item.kind === "scan"
          ? colors.primary
          : colors.accentForeground;

    return (
      <Pressable
        onPress={() => !item.read && void markRead(item.id)}
        onLongPress={() => {
          Alert.alert("Delete?", item.title, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => void remove(item.id),
            },
          ]);
        }}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <Card
          padding={14}
          style={{
            flexDirection: "row",
            gap: 12,
            borderColor: item.read ? colors.border : colors.primary + "55",
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: accent + "1f",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name={ICON_MAP[item.kind]} size={18} color={accent} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontFamily: "Inter_600SemiBold",
                  color: colors.foreground,
                  fontSize: 15,
                }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                }}
              >
                {ago(item.createdAt)}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                fontSize: 13,
                lineHeight: 18,
              }}
            >
              {item.body}
            </Text>
          </View>
          {!item.read ? (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.primary,
                alignSelf: "flex-start",
                marginTop: 6,
              }}
            />
          ) : null}
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
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 28,
            color: colors.foreground,
            letterSpacing: -0.6,
            flex: 1,
          }}
        >
          Updates
        </Text>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {notifications.some((n) => !n.read) ? (
            <Pressable
              onPress={() => void markAllRead()}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, padding: 8 }]}
            >
              <Feather name="check" size={20} color={colors.primary} />
            </Pressable>
          ) : null}
          {notifications.length > 0 ? (
            <Pressable
              onPress={onClear}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, padding: 8 }]}
            >
              <Feather name="trash-2" size={20} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: isWeb ? 84 + 24 : insets.bottom + 100,
          gap: 10,
        }}
        scrollEnabled={notifications.length > 0}
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
              <Feather name="bell" size={26} color={colors.mutedForeground} />
            </View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                color: colors.foreground,
                fontSize: 16,
              }}
            >
              All caught up
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                color: colors.mutedForeground,
                fontSize: 13,
              }}
            >
              You'll see scan results and tips here.
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
    flexDirection: "row",
    alignItems: "center",
  },
});
