import { router, useLocalSearchParams } from "expo-router";
import { Alert, Text } from "react-native";
import { useFiles } from "../../hooks/useFiles";
import { useProtectedAccess } from "../../hooks/useProtectedAccess";
import { useSecurity } from "../../context/SecurityContext";
import { ProtectedGate } from "../../components/ProtectedGate";
import { FileCard } from "../../components/cards";
import {
  Button,
  EmptyState,
  Header,
  Screen,
  styles,
} from "../../components/ui";
import { errorMessage } from "../../utils/format";
export default function FolderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { folders, files, protectFolder } = useFiles();
  const { verify } = useSecurity();
  const folder = folders.find((f) => f.id === id);
  const access = useProtectedAccess(id, folder?.protected ?? true);
  async function toggle() {
    if (!folder) return;
    if (await verify("Cambiar protección de carpeta")) {
      try {
        protectFolder(id, !folder.protected);
      } catch (e) {
        Alert.alert("No se pudo guardar", errorMessage(e));
      }
    }
  }
  return (
    <Screen>
      <Header title="Carpeta" back />
      {!folder ? (
        <EmptyState title="Carpeta no encontrada" />
      ) : !access.allowed ? (
        <ProtectedGate {...access} />
      ) : (
        <>
          <Text style={styles.title}>{folder.name}</Text>
          <Button
            title="Agregar archivo aquí"
            icon="add"
            onPress={() =>
              router.push({ pathname: "/add-file", params: { folderId: id } })
            }
          />
          <Button
            title={
              folder.protected ? "Desproteger carpeta" : "Proteger carpeta"
            }
            secondary
            onPress={() => void toggle()}
          />
          {files.filter((f) => f.folderId === id).length ? (
            files
              .filter((f) => f.folderId === id)
              .map((file) => <FileCard key={file.id} file={file} />)
          ) : (
            <EmptyState />
          )}
        </>
      )}
    </Screen>
  );
}
