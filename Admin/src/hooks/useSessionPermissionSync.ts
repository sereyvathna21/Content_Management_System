import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function useSessionPermissionSync() {
  const { data: session, update } = useSession();

  // 1. Coarse interval sync: refresh every 5 minutes (300,000ms)
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      update();
    }, 300000); 

    return () => clearInterval(interval);
  }, [session, update]);

  // 2. Explicit trigger mechanism (Call this function manually after writing changes)
  const triggerImmediateSync = async () => {
    if (session) {
      await update();
    }
  };

  return { triggerImmediateSync };
}
