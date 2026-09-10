import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Category,
  WorkFile,
  WorkFolder,
  WorkProject,
  categories,
} from "../types/models";
import { useFiles } from "../hooks/useFiles";
import { formatDate, formatSize } from "../utils/format";
import { Icon, IconName, SecurityBadge, palette, styles } from "./ui";
export const categoryIcons: Record<Category, IconName> = {
  contracts: "briefcase-outline",
  documents: "document-text-outline",
  images: "image-outline",
  videos: "videocam-outline",
  evidence: "layers-outline",
};
export function CategoryCard({
  name,
  count,
  icon,
  onPress,
}: {
  name: string;
  count: number;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.card, { width: "48%", gap: 16 }]}
    >
      <Icon name={icon} color={palette.blue} size={25} />
      <View>
        <Text style={styles.label}>{name}</Text>
        <Text style={styles.muted}>{count} archivos</Text>
      </View>
    </Pressable>
  );
}
export function FileCard({ file }: { file: WorkFile }) {
  const { projects, isProtected } = useFiles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: "/file/[id]", params: { id: file.id } })
      }
      style={[styles.card, styles.row]}
    >
      <View style={[styles.iconButton, { backgroundColor: palette.bg }]}>
        <Icon name={categoryIcons[file.category]} color={palette.blue} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text numberOfLines={1} style={styles.label}>
          {file.name}
        </Text>
        <Text style={styles.muted}>
          {categories[file.category]} · {formatSize(file.size)}
        </Text>
        <Text numberOfLines={1} style={styles.small}>
          {projects.find((p) => p.id === file.projectId)?.name ||
            "Sin proyecto"}{" "}
          · {formatDate(file.createdAt)}
        </Text>
        {file.company && <Text style={styles.small}>{file.company}</Text>}
        {file.demo && <Text style={styles.small}>Ejemplo</Text>}
      </View>
      <SecurityBadge protected={isProtected(file)} />
    </Pressable>
  );
}
export function ProjectCard({ project }: { project: WorkProject }) {
  const { files } = useFiles();
  const list = files.filter((f) => f.projectId === project.id);
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/project/[id]", params: { id: project.id } })
      }
      style={styles.card}
    >
      <View style={styles.row}>
        <Icon name="cube-outline" color={palette.blue} />
        <Text style={[styles.sectionTitle, { flex: 1 }]}>{project.name}</Text>
        <Icon name="chevron-forward" size={18} />
      </View>
      <Text style={styles.muted}>{project.description}</Text>
      <Text style={styles.small}>
        {list.length} archivos ·{" "}
        {list.filter((f) => f.category === "evidence").length} evidencias
      </Text>
      <Text style={styles.muted}>
        Actualizado {formatDate(project.updatedAt)}
        {project.demo ? " · Ejemplo" : ""}
      </Text>
    </Pressable>
  );
}
export function ProtectedFolderCard({
  folder,
  onPress,
}: {
  folder: WorkFolder;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.card, styles.row]}>
      <Icon name="folder-outline" size={28} color={palette.blue} />
      <Text style={[styles.label, { flex: 1 }]}>{folder.name}</Text>
      <SecurityBadge protected={folder.protected} />
      <Icon name="chevron-forward" size={16} />
    </Pressable>
  );
}
