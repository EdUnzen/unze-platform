import type { CommunityLevel } from "@/lib/constants/community-level";
import type { LucideIcon } from "lucide-react";
import { Crown, Gem, Medal, Shield, Sparkles, Star } from "lucide-react";

/** Bronze-Schild, Silber-Stern, Gold-Medaille, Platin-Kristall, Diamant, Elite-Krone */
export const COMMUNITY_LEVEL_ICONS: Record<CommunityLevel, LucideIcon> = {
  bronze: Shield,
  silver: Star,
  gold: Medal,
  platinum: Sparkles,
  diamond: Gem,
  elite: Crown,
};

export const COMMUNITY_LEVEL_BADGE_STYLES: Record<
  CommunityLevel,
  { pillLight: string; pillDark: string; iconClass: string }
> = {
  bronze: {
    pillLight: "bg-amber-100 text-amber-950 ring-1 ring-amber-300/60",
    pillDark: "bg-amber-500/25 text-amber-50 ring-1 ring-amber-200/40 backdrop-blur-md",
    iconClass: "text-amber-300",
  },
  silver: {
    pillLight: "bg-slate-200 text-slate-900 ring-1 ring-slate-400/50",
    pillDark: "bg-white/25 text-white ring-1 ring-white/35 backdrop-blur-md",
    iconClass: "text-slate-200",
  },
  gold: {
    pillLight: "bg-yellow-100 text-yellow-950 ring-1 ring-yellow-400/60",
    pillDark: "bg-yellow-500/25 text-yellow-50 ring-1 ring-yellow-200/40 backdrop-blur-md",
    iconClass: "text-yellow-300",
  },
  platinum: {
    pillLight: "bg-teal-100 text-teal-950 ring-1 ring-teal-400/50",
    pillDark: "bg-teal-500/25 text-teal-50 ring-1 ring-teal-200/35 backdrop-blur-md",
    iconClass: "text-teal-200",
  },
  diamond: {
    pillLight: "bg-cyan-100 text-cyan-950 ring-1 ring-cyan-400/55",
    pillDark: "bg-cyan-400/25 text-cyan-50 ring-1 ring-cyan-100/40 backdrop-blur-md",
    iconClass: "text-cyan-200",
  },
  elite: {
    pillLight: "bg-violet-100 text-violet-950 ring-1 ring-violet-400/55",
    pillDark: "bg-violet-500/30 text-violet-50 ring-1 ring-violet-200/40 backdrop-blur-md",
    iconClass: "text-violet-200",
  },
};
