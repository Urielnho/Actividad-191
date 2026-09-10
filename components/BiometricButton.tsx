import { useSecurity } from "../context/SecurityContext";
import { Button } from "./ui";
export function BiometricButton() {
  const s = useSecurity();
  const label =
    s.biometricType.label === "Huella"
      ? "huella"
      : s.biometricType.label === "Biometría"
        ? "biometría"
        : s.biometricType.label;
  return (
    <Button
      title={
        s.authenticating
          ? "Verificando…"
          : s.checkingBiometrics
            ? "Detectando biometría…"
            : `Acceder con ${label}`
      }
      icon={
        s.biometricType.kind === "face"
          ? "scan-outline"
          : "finger-print-outline"
      }
      disabled={s.authenticating || s.checkingBiometrics}
      onPress={() => void s.authenticate()}
    />
  );
}
