import { Text } from "react-native";
import { Button, EmptyState, styles } from "./ui";
export function ProtectedGate({
  request,
  authenticating,
  error,
}: {
  request: () => Promise<void>;
  authenticating: boolean;
  error: string;
}) {
  return (
    <>
      <EmptyState
        title="Contenido protegido"
        description="Verifica tu identidad para consultar este contenido."
      />
      <Button
        title={authenticating ? "Verificando…" : "Verificar identidad"}
        icon="finger-print-outline"
        disabled={authenticating}
        onPress={() => void request()}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </>
  );
}
