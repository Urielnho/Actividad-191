import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import * as ScreenCapture from "expo-screen-capture";
import { SecurityProvider, useSecurity } from "../context/SecurityContext";
import { LibraryProvider } from "../context/LibraryContext";
import LockScreen from "../components/LockScreen";
import { palette } from "../components/ui";
function Gate() {
  const { isLocked } = useSecurity();
  const [privacyReady, setReady] = useState(Platform.OS === "web");
  const [privacyError, setPrivacyError] = useState("");
  useEffect(() => {
    if (Platform.OS === "web") return;
    void (async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync("worksafe");
        if (Platform.OS === "ios")
          await ScreenCapture.enableAppSwitcherProtectionAsync(1);
        setReady(true);
      } catch {
        setPrivacyError(
          "No se pudo activar la protección de pantalla. Reinicia WorkSafe o utiliza un Development Build.",
        );
      }
    })();
  }, []);
  const covered = isLocked || !privacyReady;
  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <View
        style={{ flex: 1, opacity: covered ? 0 : 1 }}
        pointerEvents={covered ? "none" : "auto"}
        accessibilityElementsHidden={covered}
        importantForAccessibility={covered ? "no-hide-descendants" : "auto"}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.bg },
          }}
        />
      </View>
      {covered && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}
        >
          {privacyError ? (
            <Text style={{ margin: 40 }}>{privacyError}</Text>
          ) : (
            <LockScreen />
          )}
        </View>
      )}
      <StatusBar style="dark" />
    </View>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SecurityProvider>
        <LibraryProvider>
          <Gate />
        </LibraryProvider>
      </SecurityProvider>
    </SafeAreaProvider>
  );
}
