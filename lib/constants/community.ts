import type { CommunityVisibility, PlatformType } from "@/types/database";

export const COMMUNITY_CATEGORIES = [
  "Gaming",
  "Business",
  "Fitness",
  "Sport",
  "Technologie",
  "Finanzen",
  "Bildung",
  "Lifestyle",
  "Kreativität",
  "Allgemein",
] as const;

export const BANNER_GRADIENTS = [
  {
    id: "emerald",
    label: "Emerald",
    value: "from-emerald-500/90 via-teal-600/80 to-cyan-700/70",
  },
  {
    id: "green",
    label: "Grün",
    value: "from-green-500/85 via-emerald-600/75 to-teal-700/65",
  },
  {
    id: "slate",
    label: "Slate",
    value: "from-slate-700/90 via-slate-800/80 to-zinc-900/75",
  },
  {
    id: "amber",
    label: "Warm",
    value: "from-amber-500/85 via-orange-600/75 to-rose-700/65",
  },
  {
    id: "neutral",
    label: "Neutral",
    value: "from-neutral-600/85 via-stone-700/75 to-neutral-800/70",
  },
] as const;

export const VISIBILITY_OPTIONS: {
  value: CommunityVisibility;
  label: string;
  description: string;
}[] = [
  {
    value: "public",
    label: "Öffentlich",
    description: "Jeder kann die Community finden und beitreten.",
  },
  {
    value: "private",
    label: "Privat",
    description: "Nur Mitglieder sehen Inhalte. Beitritt auf Einladung.",
  },
  {
    value: "premium",
    label: "Premium",
    description: "Sichtbar in Discover, Zugang später kostenpflichtig.",
  },
];

export const PLATFORM_OPTIONS: { value: PlatformType; label: string }[] = [
  { value: "unze", label: "UNZE (intern)" },
  { value: "discord", label: "Discord" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "website", label: "Webseite" },
  { value: "other", label: "Andere / Extern" },
];
