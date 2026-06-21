"use client";

import {
  readPwaShellCache,
  writePwaShellCache,
  type PwaShellSnapshot,
} from "@/lib/pwa/shell-cache";
import { isStandalonePwa } from "@/lib/pwa/is-standalone";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ShellState = {
  unreadCount: number;
  showDashboard: boolean;
  showOwnerCenter: boolean;
  ready: boolean;
};

const ShellContext = createContext<ShellState>({
  unreadCount: 0,
  showDashboard: false,
  showOwnerCenter: false,
  ready: false,
});

export function useShellState() {
  return useContext(ShellContext);
}

interface ShellHydratorProps {
  userId: string | null;
  /** SSR fallback; replaced after hydration when client cache is fresher. */
  serverShell?: {
    unreadCount: number;
    showDashboard: boolean;
    showOwnerCenter: boolean;
  };
  children: ReactNode;
}

function mergeShell(
  cached: PwaShellSnapshot | null,
  server?: ShellHydratorProps["serverShell"],
): ShellState {
  if (cached) {
    return {
      unreadCount: cached.unreadCount,
      showDashboard: cached.showDashboard,
      showOwnerCenter: cached.showOwnerCenter,
      ready: true,
    };
  }
  if (server) {
    return { ...server, ready: true };
  }
  return {
    unreadCount: 0,
    showDashboard: false,
    showOwnerCenter: false,
    ready: false,
  };
}

export function ShellHydrator({ userId, serverShell, children }: ShellHydratorProps) {
  const [shell, setShell] = useState<ShellState>(() => {
    if (typeof window !== "undefined") {
      const cached = readPwaShellCache(isStandalonePwa());
      if (cached) return mergeShell(cached);
    }
    return mergeShell(null, serverShell);
  });

  useEffect(() => {
    const standalone = isStandalonePwa();
    const cached = readPwaShellCache(standalone);
    if (cached) {
      setShell(mergeShell(cached));
    } else if (serverShell) {
      writePwaShellCache(serverShell);
    }

    if (!userId) return;

    let active = true;
    fetch("/api/pwa/shell", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const next: PwaShellSnapshot = {
          fetchedAt: data.fetchedAt ?? new Date().toISOString(),
          unreadCount: data.unreadCount ?? 0,
          showDashboard: Boolean(data.showDashboard),
          showOwnerCenter: Boolean(data.showOwnerCenter),
        };
        writePwaShellCache(next);
        setShell({
          unreadCount: next.unreadCount,
          showDashboard: next.showDashboard,
          showOwnerCenter: next.showOwnerCenter,
          ready: true,
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [userId, serverShell]);

  return <ShellContext.Provider value={shell}>{children}</ShellContext.Provider>;
}
