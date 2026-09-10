import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { useFiles } from "../hooks/useFiles";
import { useSecurity } from "../context/SecurityContext";
import { ProtectedFolderCard } from "../components/cards";
import { Button, Field, Header, Screen, styles } from "../components/ui";
import { errorMessage } from "../utils/format";
export default function Folders() {
  const { folders, addFolder } = useFiles();
  const { verify, error: biometricError } = useSecurity();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [protectedValue, setProtected] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      if (protectedValue && !(await verify("Proteger nueva carpeta"))) return;
      addFolder(name, protectedValue);
      setName("");
      setCreating(false);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen>
      <Header title="Carpetas" subtitle="Un lugar para cada cosa." back />
      <Button
        title={creating ? "Cancelar" : "Crear carpeta"}
        icon="folder-open-outline"
        onPress={() => setCreating(!creating)}
      />
      {creating && (
        <View style={styles.card}>
          <Field
            label="Nombre de carpeta"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
          <View style={styles.row}>
            <Text style={[styles.label, { flex: 1 }]}>
              Proteger con biometría
            </Text>
            <Switch
              accessibilityLabel="Proteger carpeta"
              value={protectedValue}
              onValueChange={setProtected}
            />
          </View>
          <Button
            title="Guardar carpeta"
            disabled={!name.trim() || busy}
            onPress={() => void save()}
          />
        </View>
      )}
      {!!(error || biometricError) && (
        <Text style={styles.error}>{error || biometricError}</Text>
      )}
      {folders.map((folder) => (
        <ProtectedFolderCard
          key={folder.id}
          folder={folder}
          onPress={() =>
            router.push({ pathname: "/folder/[id]", params: { id: folder.id } })
          }
        />
      ))}
    </Screen>
  );
}
