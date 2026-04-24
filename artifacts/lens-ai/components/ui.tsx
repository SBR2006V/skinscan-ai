import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type IconName = keyof typeof Feather.glyphMap;

type ButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "md" | "lg";
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  iconRight,
  loading,
  disabled,
  fullWidth = true,
  size = "md",
}: ButtonProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "destructive"
        ? colors.destructive
        : variant === "secondary"
          ? colors.secondary
          : "transparent";
  const fg =
    variant === "primary"
      ? colors.primaryForeground
      : variant === "destructive"
        ? colors.destructiveForeground
        : variant === "secondary"
          ? colors.secondaryForeground
          : colors.foreground;
  const borderColor = variant === "ghost" ? colors.border : "transparent";
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handlePress = async () => {
    if (isDisabled) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    await onPress();
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        fullWidth && { alignSelf: "stretch" },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: bg,
            borderColor,
            borderWidth: variant === "ghost" ? 1 : 0,
            opacity: isDisabled ? 0.5 : pressed ? 0.92 : 1,
            paddingVertical: size === "lg" ? 18 : 14,
            borderRadius: colors.radius,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <View style={styles.buttonInner}>
            {icon ? (
              <Feather name={icon} size={size === "lg" ? 20 : 18} color={fg} />
            ) : null}
            <Text
              style={[
                styles.buttonLabel,
                {
                  color: fg,
                  fontSize: size === "lg" ? 17 : 16,
                  fontFamily: "Inter_600SemiBold",
                },
              ]}
            >
              {label}
            </Text>
            {iconRight ? (
              <Feather name={iconRight} size={size === "lg" ? 20 : 18} color={fg} />
            ) : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

type InputProps = TextInputProps & {
  label?: string;
  icon?: IconName;
  error?: string | null;
};

export function Input({
  label,
  icon,
  error,
  style: _style,
  ...rest
}: InputProps) {
  const colors = useColors();
  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 13,
            color: colors.mutedForeground,
            marginLeft: 2,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderWidth: 1,
          borderColor: error ? colors.destructive : colors.border,
          paddingHorizontal: 14,
          minHeight: 52,
        }}
      >
        {icon ? (
          <Feather
            name={icon}
            size={18}
            color={colors.mutedForeground}
            style={{ marginRight: 10 }}
          />
        ) : null}
        <TextInput
          {...rest}
          placeholderTextColor={colors.mutedForeground}
          style={{
            flex: 1,
            color: colors.foreground,
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            paddingVertical: 12,
          }}
        />
      </View>
      {error ? (
        <Text
          style={{
            color: colors.destructive,
            fontSize: 12,
            marginLeft: 2,
            fontFamily: "Inter_500Medium",
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function Card({
  children,
  style,
  padding = 16,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          padding,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Skeleton({
  width,
  height,
  radius = 8,
  style,
}: {
  width?: number | "100%";
  height: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.muted,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ConfidenceRing({
  value,
  size = 84,
  strokeWidth = 8,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const colors = useColors();
  const animated = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = React.useState(0);

  useEffect(() => {
    const id = animated.addListener(({ value: v }) => setDisplayed(v));
    Animated.timing(animated, {
      toValue: value,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animated.removeListener(id);
  }, [animated, value]);

  const pct = Math.round(displayed * 100);
  const ringColor =
    value >= 0.85
      ? colors.success
      : value >= 0.6
        ? colors.primary
        : colors.warning;

  // SVG-free ring: outer + inner overlap to show progress
  const rotation = displayed * 360;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: colors.muted,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: ringColor,
          borderRightColor: rotation < 90 ? "transparent" : ringColor,
          borderBottomColor: rotation < 180 ? "transparent" : ringColor,
          borderLeftColor: rotation < 270 ? "transparent" : ringColor,
          transform: [{ rotate: `${rotation - 90}deg` }],
          opacity: 0.95,
        }}
      />
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: size * 0.28,
          color: colors.foreground,
        }}
      >
        {pct}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          color: colors.mutedForeground,
          letterSpacing: 0.5,
          marginTop: -2,
        }}
      >
        % CONFIDENCE
      </Text>
    </View>
  );
}

export function Avatar({
  name,
  color,
  size = 44,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "#ffffff",
          fontFamily: "Inter_600SemiBold",
          fontSize: size * 0.38,
        }}
      >
        {initials || "?"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonLabel: {
    textAlign: "center",
  },
});
