import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Button, Card, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useHistory } from "@/contexts/HistoryContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user, updateProfile, signOut } = useAuth();
  const { entries } = useHistory();
  const { notifications } = useNotifications();
  const isWeb = Platform.OS === "web";

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, bio });
      setEditing(false);
    } catch (e) {
      Alert.alert("Could not save", e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = () => {
    Alert.alert("Sign out?", "You'll need to sign back in to use Lens AI.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void signOut();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: isWeb ? 67 + insets.top : insets.top + 16,
        paddingBottom: isWeb ? 84 + 24 : insets.bottom + 100,
        paddingHorizontal: 20,
        gap: 20,
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 28,
          color: colors.foreground,
          letterSpacing: -0.6,
        }}
      >
        Profile
      </Text>

      <Card padding={20}>
        <View style={{ alignItems: "center", gap: 12 }}>
          <Avatar name={user.name} color={user.avatarColor} size={80} />
          {editing ? (
            <View style={{ width: "100%", gap: 12 }}>
              <Input
                label="Name"
                icon="user"
                value={name}
                onChangeText={setName}
              />
              <Input
                label="Bio"
                icon="edit-3"
                placeholder="A little about you"
                value={bio}
                onChangeText={setBio}
                multiline
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Cancel"
                    variant="ghost"
                    onPress={() => {
                      setName(user.name);
                      setBio(user.bio ?? "");
                      setEditing(false);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Save"
                    onPress={onSave}
                    loading={saving}
                    disabled={!name.trim()}
                  />
                </View>
              </View>
            </View>
          ) : (
            <>
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 22,
                    color: colors.foreground,
                  }}
                >
                  {user.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    color: colors.mutedForeground,
                    fontSize: 13,
                  }}
                >
                  {user.email}
                </Text>
                {user.bio ? (
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      color: colors.foreground,
                      fontSize: 14,
                      textAlign: "center",
                      marginTop: 8,
                      lineHeight: 20,
                    }}
                  >
                    {user.bio}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => setEditing(true)}
                style={({ pressed }) => [
                  styles.editBtn,
                  {
                    backgroundColor: colors.secondary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Feather name="edit-2" size={14} color={colors.secondaryForeground} />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    color: colors.secondaryForeground,
                    fontSize: 13,
                  }}
                >
                  Edit profile
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </Card>

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Card style={{ flex: 1 }} padding={16}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 22,
              color: colors.foreground,
            }}
          >
            {entries.length}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              color: colors.mutedForeground,
              fontSize: 12,
            }}
          >
            Total scans
          </Text>
        </Card>
        <Card style={{ flex: 1 }} padding={16}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 22,
              color: colors.foreground,
            }}
          >
            {notifications.filter((n) => !n.read).length}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              color: colors.mutedForeground,
              fontSize: 12,
            }}
          >
            Unread
          </Text>
        </Card>
        <Card style={{ flex: 1 }} padding={16}>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 22,
              color: colors.foreground,
            }}
          >
            {Math.max(
              1,
              Math.floor((Date.now() - user.joinedAt) / (1000 * 60 * 60 * 24)),
            )}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              color: colors.mutedForeground,
              fontSize: 12,
            }}
          >
            Days member
          </Text>
        </Card>
      </View>

      {/* Settings */}
      <Card padding={0}>
        <SettingRow
          icon="moon"
          label="Appearance"
          value={
            colorScheme === "dark" ? "Dark mode" : "Light mode"
          }
          right={
            <Switch
              value={colorScheme === "dark"}
              disabled
              trackColor={{
                true: colors.primary,
                false: colors.muted,
              }}
            />
          }
          hint="Follows your system setting"
        />
        <Divider />
        <SettingRow icon="shield" label="Privacy" value="On-device storage" />
        <Divider />
        <SettingRow
          icon="info"
          label="About Lens AI"
          value="v1.0.0"
        />
      </Card>

      <Button
        label="Sign out"
        icon="log-out"
        variant="ghost"
        onPress={onSignOut}
      />
    </ScrollView>
  );
}

function SettingRow({
  icon,
  label,
  value,
  right,
  hint,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  right?: React.ReactNode;
  hint?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.settingRow}>
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
        <Feather name={icon} size={16} color={colors.accentForeground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 14,
            color: colors.foreground,
          }}
        >
          {label}
        </Text>
        {hint ? (
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 11,
              color: colors.mutedForeground,
              marginTop: 2,
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
      {right ?? (
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            color: colors.mutedForeground,
          }}
        >
          {value}
        </Text>
      )}
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 64,
      }}
    />
  );
}

const styles = StyleSheet.create({
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
