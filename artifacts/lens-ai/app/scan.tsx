import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAnalyzeImage } from "@workspace/api-client-react";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card } from "@/components/ui";
import { useHistory } from "@/contexts/HistoryContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useColors } from "@/hooks/useColors";
import { CONDITION_LABEL } from "@/lib/skin";

type BodyArea = "general" | "face" | "scalp" | "body" | "hands" | "feet";

const AREA_LABEL: Record<BodyArea, string> = {
  general: "Skin scanner",
  face: "Face scanner",
  scalp: "Scalp scanner",
  body: "Body scanner",
  hands: "Hand scanner",
  feet: "Feet scanner",
};

const AREA_HINT: Record<BodyArea, string> = {
  general: "Photograph the area of skin you'd like checked.",
  face: "Center the affected area. Use bright, even light.",
  scalp: "Part the hair to expose the scalp area clearly.",
  body: "Get close enough that the area fills most of the frame.",
  hands: "Lay the hand flat. Avoid heavy shadows.",
  feet: "Clean and dry the area first for the best read.",
};

export default function ScanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ bodyArea?: string }>();
  const initialArea = (params.bodyArea as BodyArea) || "general";
  const [bodyArea, setBodyArea] = useState<BodyArea>(initialArea);
  void setBodyArea;

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<"image/jpeg" | "image/png" | "image/webp">(
    "image/jpeg",
  );
  const [error, setError] = useState<string | null>(null);

  const { add } = useHistory();
  const { add: addNotification } = useNotifications();
  const analyze = useAnalyzeImage();

  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  useEffect(() => {
    if (analyze.isPending) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.15,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [analyze.isPending, pulse]);

  const pickImage = async (source: "camera" | "library") => {
    setError(null);
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError("Camera permission was denied. You can pick a photo instead.");
          return;
        }
        const r = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
          exif: false,
        });
        if (r.canceled || !r.assets?.[0]) return;
        const asset = r.assets[0];
        if (!asset.base64) {
          setError("Could not read the captured image.");
          return;
        }
        setImageUri(asset.uri);
        setImageBase64(asset.base64);
        setImageMime(guessMime(asset.uri, asset.mimeType));
      } else {
        const r = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
          exif: false,
        });
        if (r.canceled || !r.assets?.[0]) return;
        const asset = r.assets[0];
        if (!asset.base64) {
          setError("Could not read the selected image.");
          return;
        }
        setImageUri(asset.uri);
        setImageBase64(asset.base64);
        setImageMime(guessMime(asset.uri, asset.mimeType));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load image");
    }
  };

  const onAnalyze = async () => {
    if (!imageBase64 || !imageUri) return;
    setError(null);
    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      const result = await analyze.mutateAsync({
        data: {
          imageBase64,
          mimeType: imageMime,
          bodyArea,
        },
      });
      const entry = await add({
        imageUri,
        result,
        bodyArea,
      });
      void addNotification({
        kind: "scan",
        title: result.title,
        body: result.infectionPresent
          ? `${CONDITION_LABEL[result.condition]} · ${Math.round(
              result.confidence * 100,
            )}% confidence.`
          : `No infection detected with ${Math.round(
              result.confidence * 100,
            )}% confidence.`,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          result.urgency === "urgent"
            ? Haptics.NotificationFeedbackType.Warning
            : Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }
      router.replace(`/result/${entry.id}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not analyze the image. Please try again.",
      );
    }
  };

  const reset = () => {
    setImageUri(null);
    setImageBase64(null);
    setError(null);
  };

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 + insets.top : insets.top + 12;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
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
          <Feather name="x" size={20} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              color: colors.foreground,
              fontSize: 16,
            }}
          >
            {AREA_LABEL[bodyArea]}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View
        style={{
          flex: 1,
          opacity: fade,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
          gap: 16,
        }}
      >
        {/* Image preview area */}
        <View
          style={{
            flex: 1,
            borderRadius: 24,
            overflow: "hidden",
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} />
              {analyze.isPending ? (
                <LinearGradient
                  colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.7)"]}
                  style={StyleSheet.absoluteFill}
                >
                  <View style={styles.pendingBox}>
                    <Animated.View
                      style={[
                        styles.pendingIcon,
                        { backgroundColor: colors.primary, transform: [{ scale: pulse }] },
                      ]}
                    >
                      <ActivityIndicator color={colors.primaryForeground} />
                    </Animated.View>
                    <Text style={styles.pendingTitle}>Analyzing skin…</Text>
                    <Text style={styles.pendingSub}>
                      Lens AI is checking for signs of common conditions.
                    </Text>
                  </View>
                </LinearGradient>
              ) : null}
            </>
          ) : (
            <View style={styles.emptyBox}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="camera" size={32} color={colors.accentForeground} />
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: colors.foreground,
                  textAlign: "center",
                }}
              >
                {AREA_LABEL[bodyArea]}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  color: colors.mutedForeground,
                  fontSize: 13,
                  textAlign: "center",
                  paddingHorizontal: 30,
                  lineHeight: 19,
                }}
              >
                {AREA_HINT[bodyArea]}
              </Text>
            </View>
          )}
        </View>

        {error ? (
          <Card
            padding={12}
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              borderColor: colors.destructive,
            }}
          >
            <Feather name="alert-circle" size={18} color={colors.destructive} />
            <Text
              style={{
                color: colors.destructive,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                flex: 1,
              }}
            >
              {error}
            </Text>
          </Card>
        ) : null}

        {/* Actions */}
        {!imageUri ? (
          <View style={{ gap: 10 }}>
            <Button
              label="Take a photo"
              icon="camera"
              onPress={() => void pickImage("camera")}
              size="lg"
            />
            <Button
              label="Choose from library"
              icon="image"
              variant="ghost"
              onPress={() => void pickImage("library")}
            />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <Button
              label={analyze.isPending ? "Analyzing…" : "Check this skin"}
              icon="cpu"
              onPress={onAnalyze}
              loading={analyze.isPending}
              size="lg"
            />
            <Button
              label="Choose another"
              icon="refresh-ccw"
              variant="ghost"
              onPress={reset}
              disabled={analyze.isPending}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function guessMime(
  uri: string,
  mimeType?: string | null,
): "image/jpeg" | "image/png" | "image/webp" {
  if (mimeType === "image/png") return "image/png";
  if (mimeType === "image/webp") return "image/webp";
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") return "image/jpeg";
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 30,
  },
  pendingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 30,
  },
  pendingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingTitle: {
    color: "#ffffff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
  },
  pendingSub: {
    color: "#ffffff",
    opacity: 0.8,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
});
