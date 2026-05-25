"use client";

import type { JoinApplicationStatus } from "@/types/access";

const APP_PREFIX = "unze-demo-app-";
const MEMBER_PREFIX = "unze-demo-member-";
const NOTIF_KEY = "unze-demo-notifications";

export interface DemoApplicationState {
  id: string;
  communityId: string;
  communitySlug: string;
  communityTitle: string;
  status: JoinApplicationStatus;
  createdAt: string;
  systemMessage?: string;
  rejectionReason?: string;
  answersSummary?: string;
}

export interface DemoMemberState {
  communityId: string;
  communitySlug: string;
  joinedAt: string;
}

export interface DemoNotificationEntry {
  id: string;
  category: "application" | "moderation" | "invite" | "community_event" | "system";
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getDemoApplication(slug: string): DemoApplicationState | null {
  if (typeof window === "undefined") return null;
  return safeParse(localStorage.getItem(`${APP_PREFIX}${slug}`), null);
}

export function setDemoApplication(slug: string, state: DemoApplicationState | null) {
  if (typeof window === "undefined") return;
  if (!state) {
    localStorage.removeItem(`${APP_PREFIX}${slug}`);
    return;
  }
  localStorage.setItem(`${APP_PREFIX}${slug}`, JSON.stringify(state));
}

export function getDemoMember(slug: string): DemoMemberState | null {
  if (typeof window === "undefined") return null;
  return safeParse(localStorage.getItem(`${MEMBER_PREFIX}${slug}`), null);
}

export function setDemoMember(slug: string, state: DemoMemberState | null) {
  if (typeof window === "undefined") return;
  if (!state) {
    localStorage.removeItem(`${MEMBER_PREFIX}${slug}`);
    return;
  }
  localStorage.setItem(`${MEMBER_PREFIX}${slug}`, JSON.stringify(state));
}

export function getDemoNotifications(): DemoNotificationEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(NOTIF_KEY), []);
}

export function pushDemoNotification(entry: Omit<DemoNotificationEntry, "id" | "readAt">) {
  if (typeof window === "undefined") return;
  const existing = getDemoNotifications();
  const next: DemoNotificationEntry = {
    ...entry,
    id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    readAt: null,
  };
  localStorage.setItem(NOTIF_KEY, JSON.stringify([next, ...existing].slice(0, 50)));
  window.dispatchEvent(new CustomEvent("unze-demo-notifications-updated"));
}

export function markDemoNotificationRead(id: string) {
  if (typeof window === "undefined") return;
  const items = getDemoNotifications().map((n) =>
    n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
  );
  localStorage.setItem(NOTIF_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("unze-demo-notifications-updated"));
}

export function markAllDemoNotificationsRead() {
  if (typeof window === "undefined") return;
  const now = new Date().toISOString();
  const items = getDemoNotifications().map((n) => ({ ...n, readAt: n.readAt ?? now }));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("unze-demo-notifications-updated"));
}

export function clearDemoSession(slug?: string) {
  if (typeof window === "undefined") return;
  if (slug) {
    localStorage.removeItem(`${APP_PREFIX}${slug}`);
    localStorage.removeItem(`${MEMBER_PREFIX}${slug}`);
  } else {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(APP_PREFIX) || k.startsWith(MEMBER_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(NOTIF_KEY);
  }
  window.dispatchEvent(new CustomEvent("unze-demo-notifications-updated"));
}
