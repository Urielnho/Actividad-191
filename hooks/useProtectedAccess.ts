import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useSecurity } from "../context/SecurityContext";
export function useProtectedAccess(id: string, protectedValue: boolean) {
  const { isLocked, verify, authenticating, error, session, getSession } =
    useSecurity();
  const [grant, setGrant] = useState<{
    id: string;
    session: number;
    protectedValue: boolean;
  } | null>(null);
  const focused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      return () => {
        focused.current = false;
        setGrant(null);
      };
    }, []),
  );
  async function request() {
    const success = await verify("Abrir contenido protegido");
    if (success && focused.current)
      setGrant({ id, session: getSession(), protectedValue });
  }
  const granted =
    grant?.id === id &&
    grant.session === session &&
    grant.protectedValue === protectedValue;
  return {
    allowed: !isLocked && (!protectedValue || granted),
    request,
    authenticating,
    error,
  };
}
