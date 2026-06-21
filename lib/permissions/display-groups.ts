import type { PermissionDefinition } from "@/types/governance";

/** UI-Obergruppen fuer granulare Rechte (Logik unveraendert). */
export const PERMISSION_DISPLAY_GROUPS: {
  id: string;
  label: string;
  description: string;
  categories: string[];
}[] = [
  {
    id: "content",
    label: "Content",
    description: "Ansehen, posten, kommentieren",
    categories: ["content"],
  },
  {
    id: "moderation",
    label: "Moderation",
    description: "Inhalte moderieren, Sperren, Meldungen",
    categories: ["moderation"],
  },
  {
    id: "administration",
    label: "Verwaltung",
    description: "Mitglieder, Zugang, Einstellungen, Governance",
    categories: ["access", "members", "settings", "governance", "lifecycle"],
  },
  {
    id: "finance",
    label: "Finanzen",
    description: "Monetarisierung & Stripe",
    categories: ["monetization"],
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  content: "Inhalte",
  moderation: "Moderation",
  access: "Zugang",
  members: "Mitglieder",
  settings: "Einstellungen",
  governance: "Governance",
  lifecycle: "Lifecycle",
  monetization: "Monetarisierung",
};

export function getPermissionsByDisplayGroup(
  byCategory: Record<string, PermissionDefinition[]>,
): {
  group: (typeof PERMISSION_DISPLAY_GROUPS)[number];
  permissions: PermissionDefinition[];
}[] {
  return PERMISSION_DISPLAY_GROUPS.map((group) => {
    const permissions = group.categories.flatMap((cat) => byCategory[cat] ?? []);
    return { group, permissions };
  }).filter((entry) => entry.permissions.length > 0);
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
