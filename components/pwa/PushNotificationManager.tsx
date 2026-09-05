"use client";

import { isPushSupported, subscribeToPush } from "@/lib/push/client";
import { useEffect, useRef } from "react";

interface PushNotificationManagerProps {
  userId: string | null;
}

/**
 * Stellt Push-Abo wieder her, wenn Nutzer Push aktiviert hat aber (noch) kein Geräte-Abo.
 */
export function PushNotificationManager({ userId }: PushNotificationManagerProps) {
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!userId || syncedRef.current || !isPushSupported()) return;

    let cancelled = false;

    async function syncPush() {
      try {
        const res = await fetch("/api/push/status", { credentials: "include" });
        if (!res.ok || cancelled) return;

        const status = (await res.json()) as {
          pushEnabled?: boolean;
          subscribed?: boolean;
          pushConfigured?: boolean;
        };

        if (
          status.pushEnabled &&
          status.pushConfigured &&
          !status.subscribed &&
          Notification.permission === "granted"
        ) {
          await subscribeToPush();
        }
      } catch {
        /* offline */
      } finally {
        if (!cancelled) syncedRef.current = true;
      }
    }

    void syncPush();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
