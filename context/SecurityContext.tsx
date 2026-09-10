import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import {
  authenticateUser,
  BiometricInfo,
  checkBiometricAvailability,
} from "../services/biometricService";

interface Security {
  isAuthenticated: boolean;
  isLocked: boolean;
  biometricAvailable: boolean;
  biometricEnrolled: boolean;
  biometricType: BiometricInfo;
  checkingBiometrics: boolean;
  authenticating: boolean;
  error: string;
  authenticate: () => Promise<boolean>;
  unlock: () => Promise<boolean>;
  verify: (prompt?: string) => Promise<boolean>;
  lock: () => void;
  refresh: () => Promise<void>;
  session: number;
  getSession: () => number;
}
const Context = createContext<Security | null>(null);
export function SecurityProvider({ children }: React.PropsWithChildren) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [biometricType, setInfo] = useState<BiometricInfo>({
    available: false,
    enrolled: false,
    kind: "none",
    label: "Biometría",
    level: 0,
  });
  const [checkingBiometrics, setChecking] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(0);
  const backgroundGeneration = useRef(0);
  const sessionRef = useRef(0);
  const authenticatedRef = useRef(false);
  const busy = useRef(false);
  const cover = useCallback(() => {
    sessionRef.current++;
    authenticatedRef.current = false;
    setAuthenticated(false);
    setSession((s) => s + 1);
  }, []);
  const lock = useCallback(() => {
    backgroundGeneration.current++;
    cover();
  }, [cover]);
  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      setInfo(await checkBiometricAvailability());
    } catch {
      setError("No se pudo consultar la biometría. Vuelve a intentar.");
    } finally {
      setChecking(false);
    }
  }, []);
  useEffect(() => {
    void checkBiometricAvailability()
      .then(setInfo)
      .catch(() => setError("No se pudo consultar la biometría."))
      .finally(() => setChecking(false));
    const listener = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        if (state === "background") backgroundGeneration.current++;
        cover();
      } else void refresh();
    });
    return () => listener.remove();
  }, [cover, refresh]);
  const run = useCallback(async (global: boolean, prompt?: string) => {
    if (busy.current || (!global && !authenticatedRef.current)) return false;
    busy.current = true;
    setAuthenticating(true);
    setError("");
    const generation = backgroundGeneration.current;
    try {
      const result = await authenticateUser(prompt);
      // The native iOS biometric sheet can briefly make the app inactive.
      for (
        let i = 0;
        result.success && AppState.currentState !== "active" && i < 10;
        i++
      )
        await new Promise((resolve) => setTimeout(resolve, 80));
      if (!result.success) {
        setError(result.message || "No se pudo autenticar.");
        return false;
      }
      if (
        generation !== backgroundGeneration.current ||
        AppState.currentState !== "active"
      ) {
        setError("La aplicación salió al fondo. Desbloquea WorkSafe de nuevo.");
        return false;
      }
      authenticatedRef.current = true;
      setAuthenticated(true);
      return true;
    } finally {
      busy.current = false;
      setAuthenticating(false);
    }
  }, []);
  const authenticate = useCallback(() => run(true), [run]);
  const verify = useCallback((prompt?: string) => run(false, prompt), [run]);
  return (
    <Context.Provider
      value={{
        isAuthenticated,
        isLocked: !isAuthenticated,
        biometricAvailable: biometricType.available,
        biometricEnrolled: biometricType.enrolled,
        biometricType,
        checkingBiometrics,
        authenticating,
        error,
        authenticate,
        unlock: authenticate,
        verify,
        lock,
        refresh,
        session,
        getSession: () => sessionRef.current,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useSecurity() {
  const value = useContext(Context);
  if (!value) throw new Error("SecurityProvider requerido");
  return value;
}
