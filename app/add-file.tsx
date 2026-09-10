import { useState } from "react";
import { Alert, Switch, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useFiles } from "../hooks/useFiles";
import { useSecurity } from "../context/SecurityContext";
import { Category, WorkFile, categories } from "../types/models";
import { Button, Chip, Field, Header, Screen, styles } from "../components/ui";
import { errorMessage } from "../utils/format";
type Selected = {
  uri: string;
  name: string;
  mimeType?: string;
  type: WorkFile["type"];
};
export default function AddFile() {
  const params = useLocalSearchParams<{
    projectId?: string;
    folderId?: string;
  }>();
  const { projects, folders, addFile } = useFiles();
  const { verify, isLocked, error: biometricError } = useSecurity();
  const [selected, setSelected] = useState<Selected | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState<Category>("documents");
  const [projectId, setProjectId] = useState(params.projectId);
  const [folderId, setFolderId] = useState(params.folderId);
  const [protectedValue, setProtected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function pick(kind: "camera" | "image" | "video" | "document") {
    setBusy(true);
    setError("");
    try {
      let picked: Selected;
      if (kind === "document") {
        const result = await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: true,
          multiple: false,
        });
        if (result.canceled) return;
        const asset = result.assets[0];
        const type = asset.mimeType?.startsWith("image/")
          ? "image"
          : asset.mimeType?.startsWith("video/")
            ? "video"
            : "document";
        picked = {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType,
          type,
        };
        setCategory(
          type === "image"
            ? "images"
            : type === "video"
              ? "videos"
              : "documents",
        );
      } else {
        if (kind === "camera") {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted)
            throw new Error(
              "Permite el acceso a la cámara desde los ajustes del dispositivo para tomar fotografías.",
            );
        }
        const options: ImagePicker.ImagePickerOptions = {
          mediaTypes: kind === "video" ? ["videos"] : ["images"],
          quality: 1,
          allowsMultipleSelection: false,
        };
        const result =
          kind === "camera"
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync(options);
        if (result.canceled) return;
        const asset = result.assets[0];
        const video = asset.type === "video";
        picked = {
          uri: asset.uri,
          name:
            asset.fileName ||
            `Evidencia-${Date.now()}.${video ? "mp4" : "jpg"}`,
          mimeType: asset.mimeType || (video ? "video/mp4" : "image/jpeg"),
          type: video ? "video" : "image",
        };
        setCategory(
          kind === "camera" ? "evidence" : video ? "videos" : "images",
        );
      }
      setSelected(picked);
      setName(picked.name);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!selected || isLocked || busy || !name.trim()) return;
    setBusy(true);
    setError("");
    try {
      if (
        (protectedValue || folders.find((f) => f.id === folderId)?.protected) &&
        !(await verify("Guardar contenido protegido"))
      )
        return;
      const extension = selected.name.match(/\.[a-zA-Z0-9]{1,10}$/)?.[0] || "";
      const finalName =
        extension && !name.toLowerCase().endsWith(extension.toLowerCase())
          ? `${name.trim()}${extension}`
          : name.trim();
      await addFile({
        ...selected,
        name: finalName,
        description: description.trim(),
        company: company.trim(),
        type: category === "contracts" ? "contract" : selected.type,
        category,
        projectId,
        folderId,
        protected: protectedValue,
      });
      Alert.alert(
        "Guardado",
        "El archivo ya está en tu espacio local de WorkSafe.",
      );
      router.replace("/(tabs)/files");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const validCategories = (Object.keys(categories) as Category[]).filter(
    (c) =>
      c === "documents" ||
      (c === "contracts" && selected?.type === "document") ||
      (c === "images" && selected?.type === "image") ||
      (c === "videos" && selected?.type === "video") ||
      (c === "evidence" &&
        (selected?.type === "image" || selected?.type === "video")),
  );
  return (
    <Screen>
      <Header
        title="Agregar a WorkSafe"
        subtitle="Guarda lo que importa."
        back
      />
      <View style={styles.card}>
        <Button
          title="Tomar fotografía"
          secondary
          icon="camera-outline"
          disabled={busy}
          onPress={() => void pick("camera")}
        />
        <Button
          title="Seleccionar fotografía"
          secondary
          icon="image-outline"
          disabled={busy}
          onPress={() => void pick("image")}
        />
        <Button
          title="Seleccionar video"
          secondary
          icon="videocam-outline"
          disabled={busy}
          onPress={() => void pick("video")}
        />
        <Button
          title="Seleccionar documento"
          secondary
          icon="document-attach-outline"
          disabled={busy}
          onPress={() => void pick("document")}
        />
      </View>
      {selected && (
        <>
          <Text style={styles.small}>
            ARCHIVO SELECCIONADO · {selected.name}
          </Text>
          <Field
            label="Nombre"
            value={name}
            onChangeText={setName}
            maxLength={160}
          />
          <Field
            label="Descripción"
            multiline
            value={description}
            onChangeText={setDescription}
            maxLength={2000}
          />
          <Text style={styles.label}>Categoría</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {validCategories.map((c) => (
              <Chip
                key={c}
                title={categories[c]}
                selected={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </View>
          {category === "contracts" && (
            <Field
              label="Empresa"
              value={company}
              onChangeText={setCompany}
              maxLength={120}
            />
          )}
          <Text style={styles.label}>Proyecto</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Chip
              title="Sin proyecto"
              selected={!projectId}
              onPress={() => setProjectId(undefined)}
            />
            {projects.map((p) => (
              <Chip
                key={p.id}
                title={p.name}
                selected={projectId === p.id}
                onPress={() => setProjectId(p.id)}
              />
            ))}
          </View>
          <Text style={styles.label}>Carpeta</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Chip
              title="Sin carpeta"
              selected={!folderId}
              onPress={() => setFolderId(undefined)}
            />
            {folders.map((f) => (
              <Chip
                key={f.id}
                title={`${f.protected ? "🔒 " : ""}${f.name}`}
                selected={folderId === f.id}
                onPress={() => setFolderId(f.id)}
              />
            ))}
          </View>
          <View style={[styles.card, styles.row]}>
            <Text style={[styles.label, { flex: 1 }]}>
              Protegido con biometría
            </Text>
            <Switch
              accessibilityLabel="Proteger archivo con biometría"
              value={protectedValue}
              onValueChange={setProtected}
            />
          </View>
          <Button
            title={busy ? "Guardando…" : "Guardar en WorkSafe"}
            disabled={busy || !name.trim()}
            icon="checkmark"
            onPress={() => void save()}
          />
        </>
      )}
      {!!(error || biometricError) && (
        <Text style={styles.error}>{error || biometricError}</Text>
      )}
      <Text style={styles.muted}>
        WorkSafe copia el archivo a su almacenamiento privado. Al regresar del
        selector puede solicitarte desbloquear la aplicación.
      </Text>
    </Screen>
  );
}
