import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export interface BiometricInfo {
  available: boolean;
  enrolled: boolean;
  label: string;
  kind: "face" | "fingerprint" | "iris" | "none";
  level: number;
  reason?: string;
}
export function getBiometricType(
  types: LocalAuthentication.AuthenticationType[],
) {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION))
    return {
      kind: "face" as const,
      label: Platform.OS === "ios" ? "Face ID" : "Reconocimiento facial",
    };
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT))
    return {
      kind: "fingerprint" as const,
      label: Platform.OS === "ios" ? "Touch ID" : "Huella",
    };
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS))
    return { kind: "iris" as const, label: "Iris" };
  return { kind: "none" as const, label: "Biometría" };
}
export async function checkBiometricAvailability(): Promise<BiometricInfo> {
  if (Platform.OS === "web")
    return {
      available: false,
      enrolled: false,
      label: "Biometría",
      kind: "none",
      level: 0,
      reason: "La biometría requiere un dispositivo iOS o Android.",
    };
  const [hardware, enrolled, types, level] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
    LocalAuthentication.getEnrolledLevelAsync(),
  ]);
  const type = getBiometricType(types);
  const iosPasscodeAvailable =
    Platform.OS === "ios" && level > 0;
  const available = hardware || iosPasscodeAvailable;
  const reason = !available
      ? "Este dispositivo no dispone de biometría compatible."
      : !enrolled
        ? "Registra tu rostro o huella en la configuración del dispositivo."
        : undefined;
  return { ...type, available, enrolled, level, reason };
}
const messages: Record<string, string> = {
  user_cancel: "Autenticación cancelada.",
  app_cancel: "La autenticación fue interrumpida.",
  system_cancel: "El sistema canceló la autenticación. Vuelve a intentarlo.",
  authentication_failed:
    "No se pudo verificar tu identidad. Inténtalo nuevamente.",
  lockout:
    "Biometría bloqueada por demasiados intentos. Desbloquea tu dispositivo y vuelve a intentar.",
  not_enrolled: "No hay biometría registrada en el dispositivo.",
  not_available: "La biometría no está disponible.",
  passcode_not_set: "Configura un código de bloqueo en tu dispositivo.",
  user_fallback: "WorkSafe requiere autenticación biométrica.",
  timeout: "Se agotó el tiempo. Inténtalo de nuevo.",
  unable_to_process: "El sistema no pudo procesar la biometría.",
  invalid_context: "La sesión biométrica expiró. Inténtalo nuevamente.",
  no_space: "El sistema no tiene recursos suficientes.",
};
let pending = false;
export async function authenticateUser(
  prompt = "Desbloquear WorkSafe",
): Promise<{ success: boolean; message?: string }> {
  if (pending)
    return { success: false, message: "Hay una autenticación en curso." };
  pending = true;
  try {
    const info = await checkBiometricAvailability();
    if (!info.available || !info.enrolled)
      return {
        success: false,
        message: info.reason || "Biometría no disponible.",
      };
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      cancelLabel: "Cancelar",
      fallbackLabel: Platform.OS === "ios" ? "Usar código" : "",
      disableDeviceFallback: Platform.OS !== "ios",
      biometricsSecurityLevel: "weak",
    });
    return result.success === true
      ? { success: true }
      : {
          success: false,
          message:
            messages[result.error] ||
            "Error del sistema al autenticar. Inténtalo nuevamente.",
        };
  } catch {
    return {
      success: false,
      message: "No se pudo consultar la biometría del dispositivo.",
    };
  } finally {
    pending = false;
  }
}
