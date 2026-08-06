import type {
  CommunityAccessStatus,
  CommunityAccessMode,
  JoinApprovalMode,
} from "@/types/access";
import type { CommunityVisibility } from "@/types/database";

export interface CommunityAccessPreset {
  accessMode: CommunityAccessMode;
  visibility: CommunityVisibility;
  accessStatus: CommunityAccessStatus;
  joinApprovalMode: JoinApprovalMode;
  admissionsPaused: boolean;
  label: string;
  description: string;
}

/** Creator-Presets — steuern visibility, access_status und join-Logik */
export const COMMUNITY_ACCESS_MODE_PRESETS: CommunityAccessPreset[] = [
  {
    accessMode: "open",
    visibility: "public",
    accessStatus: "open",
    joinApprovalMode: "auto_accept",
    admissionsPaused: false,
    label: "Offene Community",
    description: "Öffentlich sichtbar, Beitritt nach Beitrittslogik.",
  },
  {
    accessMode: "private",
    visibility: "private",
    accessStatus: "open",
    joinApprovalMode: "manual_review",
    admissionsPaused: false,
    label: "Private Community",
    description: "Nur für Mitglieder sichtbar, Bewerbung mit Creator-Freigabe.",
  },
  {
    accessMode: "closed",
    visibility: "private",
    accessStatus: "closed",
    joinApprovalMode: "auto_reject",
    admissionsPaused: false,
    label: "Geschlossene Community",
    description: "Keine neuen Beitritte — nur per Einladung möglich.",
  },
  {
    accessMode: "invite_only",
    visibility: "private",
    accessStatus: "invite_only",
    joinApprovalMode: "auto_reject",
    admissionsPaused: false,
    label: "Nur mit Einladung",
    description: "Beitritt ausschließlich über Einladungslinks.",
  },
  {
    accessMode: "premium",
    visibility: "premium",
    accessStatus: "open",
    joinApprovalMode: "manual_review",
    admissionsPaused: false,
    label: "Kostenpflichtig (vorbereitet)",
    description: "Premium-Sichtbarkeit, Stripe-Abo folgt.",
  },
];

export function getAccessPreset(
  mode: CommunityAccessMode,
): CommunityAccessPreset {
  return (
    COMMUNITY_ACCESS_MODE_PRESETS.find((p) => p.accessMode === mode) ??
    COMMUNITY_ACCESS_MODE_PRESETS[0]
  );
}

export function resolveAccessModeFromCommunity(input: {
  accessMode?: CommunityAccessMode | null;
  visibility: CommunityVisibility;
  accessStatus: CommunityAccessStatus;
}): CommunityAccessMode {
  if (input.accessMode) return input.accessMode;

  if (input.visibility === "premium") return "premium";
  if (input.accessStatus === "invite_only") return "invite_only";
  if (input.accessStatus === "closed") return "closed";
  if (input.visibility === "private") return "private";
  return "open";
}
