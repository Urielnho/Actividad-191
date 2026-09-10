import { useState } from "react";
import { Text, View } from "react-native";
import { useFiles } from "../../hooks/useFiles";
import { ProjectCard } from "../../components/cards";
import {
  Button,
  EmptyState,
  Field,
  Header,
  Screen,
  styles,
} from "../../components/ui";
import { errorMessage } from "../../utils/format";
export default function Projects() {
  const { projects, addProject } = useFiles();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  function save() {
    try {
      addProject(name, description);
      setCreating(false);
      setName("");
      setDescription("");
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <Screen>
      <Header title="Proyectos" subtitle="Cada proyecto, en orden." />
      <Button
        title={creating ? "Cancelar" : "Nuevo proyecto"}
        icon={creating ? "close" : "add"}
        onPress={() => setCreating(!creating)}
      />
      {creating && (
        <View style={styles.card}>
          <Field
            label="Nombre del proyecto"
            maxLength={100}
            value={name}
            onChangeText={setName}
          />
          <Field
            label="Descripción"
            multiline
            maxLength={1000}
            value={description}
            onChangeText={setDescription}
          />
          <Button
            title="Crear proyecto"
            disabled={!name.trim()}
            onPress={save}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
      )}
      {projects.length ? (
        projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))
      ) : (
        <EmptyState
          title="Tu próximo proyecto"
          description="Crea un proyecto para reunir sus documentos y evidencias."
        />
      )}
    </Screen>
  );
}
