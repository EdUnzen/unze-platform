import type { CommunityVisibility, PlatformType } from "@/types/database";

export const COMMUNITY_CATEGORIES = [
  "Gaming",
  "Business",
  "Technologie",
  "Fitness",
  "Finanzen",
  "Bildung",
  "Sport",
  "Musik",
  "Creator",
  "Coaching",
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
  hint: string;
}[] = [
  {
    value: "public",
    label: "Öffentlich",
    description: "Jeder kann die Community finden und kostenlos beitreten.",
    hint: "Ideal zum Start — keine Zahlung nötig.",
  },
  {
    value: "private",
    label: "Privat",
    description: "Nicht öffentlich sichtbar. Beitritt nur auf Einladung oder nach Freigabe.",
    hint: "Erscheint nicht in Discover, Suche oder Verzeichnis.",
  },
  {
    value: "hidden",
    label: "Intern",
    description:
      "Community existiert auf UNZE, ist aber nicht öffentlich auffindbar. Direkter Link funktioniert — ideal für Discord, TikTok oder Firmen.",
    hint: "Nicht in Discover oder Verzeichnis — nur per URL teilen.",
  },
  {
    value: "premium",
    label: "Premium (vorbereitet)",
    description:
      "Community startet kostenlos. Du kannst später im Dashboard auf kostenpflichtigen Zugang umstellen.",
    hint: "Mitglieder werden vorher informiert — keine automatische Abbuchung.",
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
