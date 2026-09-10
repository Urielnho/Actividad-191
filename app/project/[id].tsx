import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { useFiles } from "../../hooks/useFiles";
import { FileCard } from "../../components/cards";
import {
  Button,
  Chip,
  EmptyState,
  Header,
  Screen,
  styles,
} from "../../components/ui";
export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, files } = useFiles();
  const project = projects.find((p) => p.id === id);
  const [filter, setFilter] = useState("Todos");
  const list = files.filter(
    (f) =>
      f.projectId === id &&
      (filter === "Todos" ||
        (filter === "Documentos" &&
          (f.type === "document" || f.type === "contract")) ||
        (filter === "Fotos" && f.type === "image") ||
        (filter === "Videos" && f.type === "video") ||
        (filter === "Evidencias" && f.category === "evidence")),
  );
  return (
    <Screen>
      <Header title={project?.name || "Proyecto"} back />
      {!project ? (
        <EmptyState title="Proyecto no encontrado" />
      ) : (
        <>
          <Text style={styles.muted}>{project.description}</Text>
          {project.demo && (
            <Text style={styles.small}>Proyecto de ejemplo</Text>
          )}
          <Button
            title="Agregar al proyecto"
            icon="add"
            onPress={() =>
              router.push({ pathname: "/add-file", params: { projectId: id } })
            }
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["Todos", "Documentos", "Fotos", "Videos", "Evidencias"].map(
              (label) => (
                <Chip
                  key={label}
                  title={label}
                  selected={filter === label}
                  onPress={() => setFilter(label)}
                />
              ),
            )}
          </View>
          {list.length ? (
            list.map((file) => <FileCard key={file.id} file={file} />)
          ) : (
            <EmptyState />
          )}
        </>
      )}
    </Screen>
  );
}
