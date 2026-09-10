import { Platform, Switch, Text, View } from "react-native";
import { useSecurity } from "../../context/SecurityContext";
import { Button, Header, Screen, Section, styles } from "../../components/ui";
export default function Settings() {
  const s = useSecurity();
  return (
    <Screen>
      <Header title="Configuración" subtitle="Tu espacio, bajo tu control." />
      <Section title="Seguridad">
        <View style={styles.card}>
          {[
            [
              "Sistema",
              Platform.OS === "ios"
                ? "iOS"
                : Platform.OS === "android"
                  ? "Android"
                  : "Navegador",
            ],
            ["Biometría detectada", s.biometricType.label],
            [
              "Estado",
              s.biometricAvailable && s.biometricEnrolled
                ? "Disponible"
                : "No disponible",
            ],
            ["Biometría registrada", s.biometricEnrolled ? "Sí" : "No"],
          ].map(([label, value]) => (
            <View key={label} style={{ gap: 4 }}>
              <Text style={styles.small}>{label}</Text>
              <Text style={styles.label}>{value}</Text>
            </View>
          ))}
          {s.biometricType.reason && (
            <Text style={styles.muted}>{s.biometricType.reason}</Text>
          )}
        </View>
        <Button
          title="Bloquear WorkSafe"
          icon="lock-closed-outline"
          onPress={s.lock}
        />
        <Button
          title="Comprobar disponibilidad"
          secondary
          onPress={() => void s.refresh()}
        />
        <View style={styles.card}>
          {[
            "Bloquear al salir de la aplicación",
            "Solicitar biometría en archivos protegidos",
          ].map((label) => (
            <View style={styles.row} key={label}>
              <Text style={[styles.label, { flex: 1 }]}>{label}</Text>
              <Switch accessibilityLabel={label} value disabled />
            </View>
          ))}
          <Text style={styles.muted}>
            Estas protecciones permanecen activas para mantener seguro tu
            espacio.
          </Text>
        </View>
      </Section>
      <Section title="Acerca de WorkSafe">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>WorkSafe</Text>
          <Text style={styles.small}>Versión 1.0.0</Text>
          <Text style={styles.muted}>
            WorkSafe protege el acceso utilizando la autenticación biométrica
            proporcionada por tu dispositivo.
          </Text>
          <Text style={styles.muted}>
            Tus archivos permanecen en tu dispositivo. WorkSafe nunca guarda tus
            huellas ni información facial.
          </Text>
          <Text style={styles.muted}>
            La protección controla el acceso dentro de la aplicación; no es
            cifrado individual de archivos. Desinstalar WorkSafe elimina su
            almacenamiento local.
          </Text>
        </View>
      </Section>
    </Screen>
  );
}
