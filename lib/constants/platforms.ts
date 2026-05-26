import type { PlatformType } from "@/types/community";

export const PLATFORM_LABELS: Record<PlatformType, string> = {
  discord: "Discord",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  website: "Webseite",
  unze: "UNZE",
  other: "Extern",
};

/** Hintergrund + Text für Badge-Pills */
export const PLATFORM_COLORS: Record<PlatformType, string> = {
  discord: "bg-[#5865F2]/12 text-[#5865F2]",
  whatsapp: "bg-[#25D366]/12 text-[#128C7E]",
  telegram: "bg-[#0088cc]/12 text-[#0088cc]",
  facebook: "bg-[#1877F2]/12 text-[#1877F2]",
  instagram: "bg-[#E4405F]/12 text-[#C13584]",
  tiktok: "bg-black/8 text-black",
  youtube: "bg-[#FF0000]/12 text-[#CC0000]",
  website: "bg-slate-500/10 text-slate-700",
  unze: "bg-unze-green-muted text-unze-green-dark",
  other: "bg-unze-surface-muted text-unze-ink-secondary",
};

/** Markenfarbe für Icons */
export const PLATFORM_ICON_COLORS: Record<PlatformType, string> = {
  discord: "#5865F2",
  whatsapp: "#25D366",
  telegram: "#0088cc",
  facebook: "#1877F2",
  instagram: "#E4405F",
  tiktok: "#000000",
  youtube: "#FF0000",
  website: "#64748b",
  unze: "#16a34a",
  other: "#64748b",
};

export const ALL_PLATFORM_TYPES: PlatformType[] = [
  "unze",
  "discord",
  "whatsapp",
  "telegram",
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "website",
  "other",
];
