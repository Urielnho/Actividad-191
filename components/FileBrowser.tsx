import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useFiles } from "../hooks/useFiles";
import { Category, categories } from "../types/models";
import { resolveFile } from "../services/fileService";
import { formatDate } from "../utils/format";
import { FileCard } from "./cards";
import {
  Button,
  Chip,
  EmptyState,
  FloatingActionButton,
  Header,
  Icon,
  Loading,
  Screen,
  SearchBar,
  SecurityBadge,
  styles,
} from "./ui";
export function FileBrowser({
  title = "Archivos",
  category,
  projectId,
  folderId,
  back = false,
  gallery = false,
}: {
  title?: string;
  category?: Category;
  projectId?: string;
  folderId?: string;
  back?: boolean;
  gallery?: boolean;
}) {
  const { files, projects, isProtected, loading, error, retry } = useFiles();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Category | "all">(category || "all");
  const [order, setOrder] = useState<"new" | "name" | "size">("new");
  const [secureOnly, setSecureOnly] = useState(false);
  const list = files
    .filter(
      (f) =>
        (!category || f.category === category) &&
        (filter === "all" || f.category === filter) &&
        (!projectId || f.projectId === projectId) &&
        (!folderId || f.folderId === folderId) &&
        (!secureOnly || isProtected(f)) &&
        `${f.name} ${f.description} ${f.company || ""}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
    )
    .sort((a, b) =>
      order === "name"
        ? a.name.localeCompare(b.name)
        : order === "size"
          ? b.size - a.size
          : b.createdAt.localeCompare(a.createdAt),
    );
  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Header
          title={title}
          subtitle="Todo lo importante, a la mano."
          back={back}
        />
        <SearchBar value={search} onChangeText={setSearch} />
        {!category && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <Chip
              title="Todos"
              selected={filter === "all"}
              onPress={() => setFilter("all")}
            />
            {Object.entries(categories).map(([key, label]) => (
              <Chip
                key={key}
                title={label}
                selected={filter === key}
                onPress={() => setFilter(key as Category)}
              />
            ))}
          </ScrollView>
        )}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Chip
            title={
              order === "new"
                ? "↓ Recientes"
                : order === "name"
                  ? "A–Z Nombre"
                  : "↓ Tamaño"
            }
            onPress={() =>
              setOrder(
                order === "new" ? "name" : order === "name" ? "size" : "new",
              )
            }
          />
          <Chip
            title="Protegidos"
            selected={secureOnly}
            onPress={() => setSecureOnly(!secureOnly)}
          />
          {!back && (
            <Chip title="Carpetas" onPress={() => router.push("/folders")} />
          )}
        </View>
        <Text style={styles.muted}>{list.length} archivos</Text>
        {loading ? (
          <Loading />
        ) : error ? (
          <>
            <Text style={styles.error}>{error}</Text>
            <Button title="Reintentar" onPress={() => void retry()} />
          </>
        ) : !list.length ? (
          <EmptyState
            title="No hay archivos aquí"
            description="Agrega contenido o prueba con otro filtro."
          />
        ) : gallery ? (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {list.map((file) => (
              <Pressable
                key={file.id}
                onPress={() =>
                  router.push({
                    pathname: "/file/[id]",
                    params: { id: file.id },
                  })
                }
                style={[styles.card, { width: "48%", padding: 12 }]}
              >
                {!isProtected(file) && !file.demo && file.type === "image" ? (
                  <Image
                    source={{ uri: resolveFile(file.uri).uri }}
                    style={{ width: "100%", height: 135, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      height: 135,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#EDF1F6",
                      borderRadius: 12,
                    }}
                  >
                    <Icon
                      size={38}
                      name={
                        isProtected(file)
                          ? "lock-closed-outline"
                          : file.type === "video"
                            ? "videocam-outline"
                            : "image-outline"
                      }
                    />
                  </View>
                )}
                <Text numberOfLines={2} style={styles.label}>
                  {file.name}
                </Text>
                <Text style={styles.small}>
                  {formatDate(file.createdAt)} ·{" "}
                  {projects.find((p) => p.id === file.projectId)?.name ||
                    "Sin proyecto"}
                </Text>
                <Text numberOfLines={2} style={styles.muted}>
                  {file.description}
                </Text>
                <SecurityBadge protected={isProtected(file)} />
                {file.demo && (
                  <Text style={styles.small}>Ejemplo</Text>
                )}
              </Pressable>
            ))}
          </View>
        ) : (
          list.map((file) => <FileCard key={file.id} file={file} />)
        )}
      </Screen>
      <FloatingActionButton />
    </View>
  );
}
