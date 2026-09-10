import React from "react";
import {
  ActivityIndicator,
  ColorValue,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useSecurity } from "../context/SecurityContext";
export const palette = {
  ink: "#111C2D",
  muted: "#788291",
  blue: "#233E66",
  bg: "#F5F6F8",
  line: "#E5E8ED",
  white: "#FFFFFF",
};
export type IconName = React.ComponentProps<typeof Ionicons>["name"];
export const Icon = ({
  name,
  size = 22,
  color = palette.ink,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
}) => <Ionicons name={name} size={size} color={color} />;
export function Button({
  title,
  onPress,
  secondary,
  disabled,
  icon,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 },
      ]}
    >
      {icon && <Icon name={icon} color={secondary ? palette.ink : "white"} />}
      <Text style={[styles.buttonText, secondary && { color: palette.ink }]}>
        {title}
      </Text>
    </Pressable>
  );
}
export function Header({
  title,
  subtitle,
  back = false,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  const { lock } = useSecurity();
  return (
    <View style={styles.header}>
      {back && (
        <Pressable
          accessibilityLabel="Regresar"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/(tabs)/home")
          }
          style={styles.iconButton}
        >
          <Icon name="arrow-back" />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.muted}>{subtitle}</Text>}
      </View>
      <Pressable
        onPress={lock}
        accessibilityLabel="Bloquear WorkSafe"
        style={styles.iconButton}
      >
        <Icon name="lock-closed-outline" />
      </Pressable>
    </View>
  );
}
export function Screen({ children }: React.PropsWithChildren) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Section({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) {
  return (
    <View style={{ gap: 12, marginTop: 24 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
export function EmptyState({
  title = "Todo empieza aquí",
  description = "Agrega tu primer archivo para mantener tu trabajo organizado.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <View style={styles.empty}>
      <Icon name="file-tray-outline" size={38} color={palette.muted} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={[styles.muted, { textAlign: "center" }]}>{description}</Text>
    </View>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.muted}
        {...props}
        style={[
          styles.input,
          props.multiline && { minHeight: 88, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function SearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={[styles.input, styles.row]}>
      <Icon name="search-outline" color={palette.muted} />
      <TextInput
        accessibilityLabel="Buscar archivos"
        placeholder="Buscar archivos…"
        placeholderTextColor={palette.muted}
        value={value}
        onChangeText={onChangeText}
        style={{ flex: 1, color: palette.ink, minHeight: 28 }}
      />
    </View>
  );
}
export function Chip({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected && { backgroundColor: palette.ink, borderColor: palette.ink },
      ]}
    >
      <Text
        style={{ color: selected ? "white" : palette.muted, fontWeight: "600" }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function SecurityBadge({ protected: secure }: { protected: boolean }) {
  return (
    <View style={styles.row}>
      <Icon
        name={secure ? "lock-closed" : "shield-checkmark-outline"}
        size={12}
        color={palette.blue}
      />
      <Text style={styles.small}>{secure ? "Protegido" : "Local"}</Text>
    </View>
  );
}
export function FloatingActionButton() {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      accessibilityLabel="Agregar archivo"
      onPress={() => router.push("/add-file")}
      style={[styles.fab, { bottom: Math.max(24, insets.bottom + 12) }]}
    >
      <Icon name="add" size={30} color="white" />
    </Pressable>
  );
}
export function Loading() {
  return (
    <View style={styles.empty}>
      <ActivityIndicator color={palette.blue} />
      <Text style={styles.muted}>Cargando tu espacio…</Text>
    </View>
  );
}
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: {
    padding: 22,
    paddingBottom: 110,
    gap: 16,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.ink,
    letterSpacing: -1,
  },
  muted: { fontSize: 13, lineHeight: 20, color: palette.muted },
  small: { fontSize: 11, color: palette.blue },
  label: { fontSize: 13, fontWeight: "600", color: palette.ink },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.ink,
    letterSpacing: -0.4,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: palette.line,
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    minHeight: 52,
    backgroundColor: palette.ink,
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
  secondary: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: palette.line,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "white",
    padding: 14,
    color: palette.ink,
    fontSize: 15,
  },
  chip: {
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "white",
  },
  empty: { padding: 32, gap: 14, alignItems: "center" },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: palette.ink,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    boxShadow: "0 6px 18px #111c2d30",
  },
  error: { color: "#A32E37", lineHeight: 20, fontSize: 13 },
  hero: {
    backgroundColor: palette.ink,
    borderRadius: 24,
    padding: 24,
    gap: 15,
  },
});
