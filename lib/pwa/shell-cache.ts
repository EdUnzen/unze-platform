/** Client-seitiger Shell-Warmcache (Badges, Creator-Flags). */

import { PWA_CACHE_KEYS } from "@/lib/pwa/client-cache";

export type PwaShellSnapshot = {
  fetchedAt: string;
  unreadCount: number;
  showDashboard: boolean;
  showOwnerCenter: boolean;
};

const SHELL_KEY = PWA_CACHE_KEYS.shell;

/** PWA: l�nger g�ltig � normale Tabs: 15 Min. */
const TTL_MS_BROWSER = 15 * 60 * 1000;
const TTL_MS_STANDALONE = 4 * 60 * 60 * 1000;

export function readPwaShellCache(standalone = false): PwaShellSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SHELL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PwaShellSnapshot;
    const ttl = standalone ? TTL_MS_STANDALONE : TTL_MS_BROWSER;
    const age = Date.now() - new Date(parsed.fetchedAt).getTime();
    if (age > ttl) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePwaShellCache(snapshot: Omit<PwaShellSnapshot, "fetchedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PwaShellSnapshot = {
      ...snapshot,
      fetchedAt: new Date().toISOString(),
    };
    localStorage.setItem(SHELL_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}
