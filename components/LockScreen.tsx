import React, { useState } from "react";
import { Text, View } from "react-native";
import { useSecurity } from "../context/SecurityContext";
import { BiometricButton } from "./BiometricButton";
import { Button, Chip, Icon, Screen, Section, palette, styles } from "./ui";
import { demoLibrary } from "../utils/demo";
export default function LockScreen() {
  const security = useSecurity();
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState("Inicio");
  if (preview)
    return (
      <Screen>
        <View style={styles.row}>
          <Icon name="shield-half-outline" />
          <Text style={styles.title}>WorkSafe</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Explora WorkSafe</Text>
          <Text style={styles.muted}>
            Espacio de demostración con contenido de ejemplo.
          </Text>
          <Button
            title="Ir a mi espacio"
            secondary
            onPress={() => setPreview(false)}
          />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {["Inicio", "Proyectos", "Archivos", "Configuración"].map((t) => (
            <Chip
              key={t}
              title={t}
              selected={tab === t}
              onPress={() => setTab(t)}
            />
          ))}
        </View>
        {tab === "Inicio" && (
          <View style={styles.hero}>
            <Text style={{ color: "white", fontSize: 28, fontWeight: "700" }}>
              Tu trabajo.{"\n"}En un solo lugar.
            </Text>
            <Text style={{ color: "#CCD5E2" }}>
              Organizado, local y siempre contigo.
            </Text>
            <Icon name="shield-checkmark-outline" color="white" size={44} />
          </View>
        )}
        <Section
          title={
            tab === "Configuración"
              ? "Seguridad del dispositivo"
              : tab === "Proyectos"
                ? "Tus proyectos"
                : "Tu espacio de trabajo"
          }
        >
          {tab === "Configuración" ? (
            <View style={styles.card}>
              <Text style={styles.label}>{security.biometricType.label}</Text>
              <Text style={styles.muted}>
                {security.biometricType.reason ||
                  "La autenticación se realiza desde la pantalla de bloqueo."}
              </Text>
            </View>
          ) : tab === "Proyectos" ? (
            demoLibrary.projects.map((p) => (
              <View key={p.id} style={styles.card}>
                <Icon name="cube-outline" />
                <Text style={styles.sectionTitle}>{p.name}</Text>
                <Text style={styles.muted}>{p.description}</Text>
                <Text style={styles.small}>Ejemplo</Text>
              </View>
            ))
          ) : (
            demoLibrary.files.map((f) => (
              <View key={f.id} style={styles.card}>
                <Icon name="document-text-outline" />
                <Text style={styles.label}>{f.name}</Text>
                <Text style={styles.muted}>{f.description}</Text>
                <Text style={styles.small}>Ejemplo</Text>
              </View>
            ))
          )}
        </Section>
      </Screen>
    );
  return (
    <Screen>
      <View style={{ alignItems: "center", paddingTop: 38, gap: 22 }}>
        <View
          style={[
            styles.iconButton,
            {
              width: 68,
              height: 68,
              borderRadius: 22,
              backgroundColor: palette.ink,
            },
          ]}
        >
          <Icon name="shield-checkmark" size={34} color="white" />
        </View>
        <Text style={[styles.title, { fontSize: 40 }]}>WorkSafe</Text>
        <Text
          style={[
            styles.muted,
            {
              textAlign: "center",
              maxWidth: 250,
              fontSize: 16,
              lineHeight: 24,
            },
          ]}
        >
          Tus archivos de trabajo protegidos y organizados
        </Text>
        <View
          style={[
            styles.card,
            {
              alignItems: "center",
              width: "100%",
              paddingVertical: 38,
              marginTop: 18,
              gap: 22,
            },
          ]}
        >
          <View
            style={[
              styles.row,
              { backgroundColor: "#EDF2F8", padding: 8, borderRadius: 20 },
            ]}
          >
            <Icon name="lock-closed" size={12} color={palette.blue} />
            <Text style={styles.small}>ESPACIO PROTEGIDO</Text>
          </View>
          <Icon
            name={
              security.biometricType.kind === "face"
                ? "scan-outline"
                : "finger-print-outline"
            }
            size={80}
            color={palette.blue}
          />
          <Text style={styles.sectionTitle}>Tu trabajo, solo para ti</Text>
          <Text style={[styles.muted, { textAlign: "center" }]}>
            Verifica tu identidad para entrar{"\n"}a tu espacio de trabajo.
          </Text>
          <View style={{ width: "100%" }}>
            <BiometricButton />
          </View>
          {security.biometricType.reason && (
            <Text style={[styles.muted, { textAlign: "center" }]}>
              {security.biometricType.reason}
            </Text>
          )}
          {!!security.error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {security.error}
            </Text>
          )}
        </View>
        <Button
          title="Reintentar"
          secondary
          onPress={() => void security.refresh()}
        />
        <Button
          title="Explorar WorkSafe"
          secondary
          onPress={() => setPreview(true)}
        />
        <View style={styles.row}>
          <Icon name="phone-portrait-outline" size={15} color={palette.muted} />
          <Text style={styles.muted}>En tu dispositivo. Bajo tu control.</Text>
        </View>
      </View>
    </Screen>
  );
}
