import { UNZE_ID_PAYLOAD_PREFIX } from "@/lib/constants/unze-id";

export type ParsedScanPayload =
  | { type: "unze_id"; token: string }
  | { type: "ticket"; code: string };

/** Erkennt UNZE-ID (UNZEID:) vs. Event-Ticket-Codes aus Kamera/Manuell. */
export function parseScannedPayload(raw: string): ParsedScanPayload | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.toUpperCase().startsWith(UNZE_ID_PAYLOAD_PREFIX.toUpperCase())) {
    const token = trimmed.slice(UNZE_ID_PAYLOAD_PREFIX.length).trim();
    return token ? { type: "unze_id", token } : null;
  }

  return { type: "ticket", code: trimmed.toUpperCase().replace(/\s+/g, "") };
}
