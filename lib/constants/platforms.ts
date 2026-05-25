import type { PlatformType } from "@/types/community";

export const PLATFORM_LABELS: Record<PlatformType, string> = {
  discord: "Discord",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  facebook: "Facebook",
  unze: "UNZE",
  other: "Extern",
};

export const PLATFORM_COLORS: Record<PlatformType, string> = {
  discord: "bg-[#5865F2]/10 text-[#5865F2]",
  whatsapp: "bg-[#25D366]/10 text-[#128C7E]",
  telegram: "bg-[#0088cc]/10 text-[#0088cc]",
  facebook: "bg-[#1877F2]/10 text-[#1877F2]",
  unze: "bg-unze-green-muted text-unze-green-dark",
  other: "bg-unze-surface-muted text-unze-ink-secondary",
};
