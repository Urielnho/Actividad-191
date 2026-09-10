import { useLocalSearchParams, router } from "expo-router";
import { Alert, Image, Text, View } from "react-native";
import { useState } from "react";
import * as Sharing from "expo-sharing";
import { useFiles } from "../../hooks/useFiles";
import { useSecurity } from "../../context/SecurityContext";
import { useProtectedAccess } from "../../hooks/useProtectedAccess";
import { resolveFile } from "../../services/fileService";
import { categories } from "../../types/models";
import { errorMessage, formatDate, formatSize } from "../../utils/format";
import { ProtectedGate } from "../../components/ProtectedGate";
import { VideoPreview } from "../../components/VideoPreview";
import {
  Button,
  EmptyState,
  Header,
  Icon,
  Screen,
  SecurityBadge,
  styles,
} from "../../components/ui";
export default function FileDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { files, projects, folders, isProtected, removeFile, protectFile } =
    useFiles();
  const { verify, isLocked } = useSecurity();
  const file = files.find((f) => f.id === id);
  const access = useProtectedAccess(id, file ? isProtected(file) : true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  let uri = "";
  let exists = false;
  if (file && access.allowed && !file.demo) {
    try {
      const local = resolveFile(file.uri);
      exists = local.exists;
      uri = local.uri;
    } catch {
      exists = false;
    }
  }
  async function open() {
    if (!file || !access.allowed || isLocked) return;
    setBusy(true);
    try {
      if (!exists)
        throw new Error(
          "El archivo no está disponible en el almacenamiento local.",
        );
      if (!(await Sharing.isAvailableAsync()))
        throw new Error(
          "No hay un visor externo disponible en este dispositivo.",
        );
      await Sharing.shareAsync(uri, {
        mimeType: file.mimeType,
        dialogTitle: "Abrir archivo con…",
      });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function toggle() {
    if (!file || !access.allowed) return;
    if (await verify("Cambiar protección del archivo")) {
      try {
        protectFile(id, !file.protected);
      } catch (e) {
        setError(errorMessage(e));
      }
    }
  }
  function confirmDelete() {
    Alert.alert(
      "Eliminar archivo",
      "Se eliminará la copia de WorkSafe. El original del dispositivo no se modifica.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            if (isLocked || !access.allowed) return;
            try {
              removeFile(id);
              router.back();
            } catch (e) {
              setError(errorMessage(e));
            }
          },
        },
      ],
    );
  }
  return (
    <Screen>
      <Header title="Detalle de archivo" back />
      {!file ? (
        <EmptyState title="Archivo no encontrado" />
      ) : !access.allowed ? (
        <ProtectedGate {...access} />
      ) : (
        <>
          {file.demo ? (
            <View style={styles.card}>
              <Icon name="document-text-outline" size={54} />
              <Text style={styles.label}>Archivo de ejemplo</Text>
              <Text style={styles.muted}>
                Este ejemplo no contiene un archivo real. Agrega tus propios
                archivos desde el botón +.
              </Text>
            </View>
          ) : !exists ? (
            <Text style={styles.error}>
              La copia local no existe. Puedes eliminar este registro e importar
              el original nuevamente.
            </Text>
          ) : file.type === "image" ? (
            <Image
              source={{ uri }}
              resizeMode="contain"
              style={{
                width: "100%",
                height: 300,
                borderRadius: 20,
                backgroundColor: "#E8ECF1",
              }}
            />
          ) : file.type === "video" ? (
            <VideoPreview uri={uri} />
          ) : (
            <View style={[styles.card, { alignItems: "center", padding: 40 }]}>
              <Icon name="document-text-outline" size={60} />
              <Text style={styles.muted}>
                Abre el documento con una aplicación compatible.
              </Text>
            </View>
          )}
          <Text style={styles.title}>{file.name}</Text>
          <SecurityBadge protected={isProtected(file)} />
          <View style={styles.card}>
            {[
              ["Tipo", file.mimeType || file.type],
              ["Tamaño", formatSize(file.size)],
              ["Fecha", formatDate(file.createdAt)],
              ["Categoría", categories[file.category]],
              [
                "Proyecto",
                projects.find((p) => p.id === file.projectId)?.name ||
                  "Sin proyecto",
              ],
              [
                "Carpeta",
                folders.find((f) => f.id === file.folderId)?.name ||
                  "Sin carpeta",
              ],
              ["Empresa", file.company || "No especificada"],
              ["Descripción", file.description || "Sin descripción"],
            ].map(([label, value]) => (
              <View key={label} style={{ gap: 3 }}>
                <Text style={styles.small}>{label}</Text>
                <Text style={styles.label}>{value}</Text>
              </View>
            ))}
          </View>
          <Button
            title="Abrir en otra aplicación"
            icon="open-outline"
            disabled={file.demo || !exists || busy}
            onPress={() => void open()}
          />
          {!file.demo && (
            <Text style={styles.muted}>
              Se abrirá el selector del sistema. Las copias que exportes quedan
              fuera de WorkSafe.
            </Text>
          )}
          <Button
            title={
              file.protected ? "Desproteger archivo" : "Proteger con biometría"
            }
            secondary
            icon="lock-closed-outline"
            onPress={() => void toggle()}
          />
          {folders.find((f) => f.id === file.folderId)?.protected && (
            <Text style={styles.muted}>
              La carpeta también protege este archivo, aunque desactives su
              protección individual.
            </Text>
          )}
          <Button
            title="Eliminar archivo"
            secondary
            icon="trash-outline"
            onPress={confirmDelete}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
        </>
      )}
    </Screen>
  );
}
