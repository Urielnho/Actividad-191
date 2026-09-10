import { Text, View } from "react-native";
import { router } from "expo-router";
import { useFiles } from "../../hooks/useFiles";
import { CategoryCard, FileCard } from "../../components/cards";
import {
  Button,
  EmptyState,
  FloatingActionButton,
  Header,
  Icon,
  Loading,
  Screen,
  Section,
  styles,
} from "../../components/ui";
export default function Home() {
  const { files, loading, error, retry } = useFiles();
  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Header title="WorkSafe" subtitle="TU ESPACIO DE TRABAJO" />
        <Text style={styles.muted}>
          Hola, bienvenido a tu espacio de trabajo
        </Text>
        <View style={styles.hero}>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <Text style={{ color: "#D4DEEC", fontSize: 11, letterSpacing: 2 }}>
              ORDEN PARA TU DÍA
            </Text>
            <Icon name="shield-checkmark-outline" color="#D4DEEC" />
          </View>
          <Text
            style={{
              color: "white",
              fontSize: 30,
              fontWeight: "700",
              letterSpacing: -1,
            }}
          >
            Tu trabajo.{"\n"}En un solo lugar.
          </Text>
          <Text style={{ color: "#BCC9DB", lineHeight: 20 }}>
            {files.filter((f) => !f.demo).length} archivos guardados en
            tu dispositivo
          </Text>
        </View>
        {loading ? (
          <Loading />
        ) : error ? (
          <>
            <Text style={styles.error}>{error}</Text>
            <Button title="Reintentar" onPress={() => void retry()} />
          </>
        ) : (
          <>
            <Section title="Acceso rápido">
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <CategoryCard
                  name="Contratos"
                  icon="briefcase-outline"
                  count={files.filter((f) => f.category === "contracts").length}
                  onPress={() => router.push("/contracts")}
                />
                <CategoryCard
                  name="Proyectos"
                  icon="cube-outline"
                  count={files.filter((f) => f.projectId).length}
                  onPress={() => router.push("/(tabs)/projects")}
                />
                <CategoryCard
                  name="Evidencias"
                  icon="layers-outline"
                  count={files.filter((f) => f.category === "evidence").length}
                  onPress={() => router.push("/evidence")}
                />
                <CategoryCard
                  name="Documentos"
                  icon="document-text-outline"
                  count={files.filter((f) => f.category === "documents").length}
                  onPress={() => router.push("/documents")}
                />
              </View>
            </Section>
            <Button
              title="Mis carpetas"
              secondary
              icon="folder-outline"
              onPress={() => router.push("/folders")}
            />
            <Section title="Archivos recientes">
              {files.length ? (
                [...files]
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .slice(0, 5)
                  .map((file) => <FileCard key={file.id} file={file} />)
              ) : (
                <EmptyState />
              )}
            </Section>
          </>
        )}
      </Screen>
      <FloatingActionButton />
    </View>
  );
}
