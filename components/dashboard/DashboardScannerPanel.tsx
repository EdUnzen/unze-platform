"use client";

import { checkInEventTicketAction } from "@/app/event-ticket-actions";
import { verifyUnzeIdAction } from "@/app/unze-id-actions";
import { QrCodeScanner } from "@/components/scanner/QrCodeScanner";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { ACTION_MESSAGES } from "@/lib/constants/action-messages";
import { parseScannedPayload } from "@/lib/unze-id/parse-scan";
import { cn } from "@/lib/utils/cn";
import type { UnzeVerifyResultCode } from "@/types/requirement-engine";
import { CheckCircle2, IdCard, ScanLine, Ticket, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

interface DashboardScannerPanelProps {
  slug: string;
  communityId: string;
  communityTitle: string;
}

type ScanResult =
  | { kind: "ticket"; ok: true; message: string }
  | { kind: "unze_id"; ok: boolean; message: string; code?: UnzeVerifyResultCode }
  | { kind: "error"; message: string };

function buildCheckInMessage(rewards?: {
  credentialName: string | null;
  groupName: string | null;
}): string {
  const segments: string[] = [String(ACTION_MESSAGES.event.checkedIn)];
  if (rewards?.credentialName) {
    segments.push(`Auszeichnung vergeben: ${rewards.credentialName}.`);
  }
  if (rewards?.groupName) {
    segments.push(`Gruppe freigeschaltet: ${rewards.groupName}.`);
  }
  return segments.join(" ");
}

const VERIFY_LABELS: Record<UnzeVerifyResultCode, string> = {
  allowed: "Zugang best\u00e4tigt \u2014 UNZE-ID verifiziert.",
  denied: "Zugang abgelehnt \u2014 Voraussetzungen nicht erf\u00fcllt.",
  identity_not_found: "UNZE-ID nicht erkannt.",
  scanner_not_authorized: "Keine Berechtigung zum Scannen.",
};

export function DashboardScannerPanel({
  slug,
  communityId,
  communityTitle,
}: DashboardScannerPanelProps) {
  const [manualCode, setManualCode] = useState("");
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const processPayload = useCallback(
    (raw: string) => {
      const parsed = parseScannedPayload(raw);
      if (!parsed) {
        setLastResult({ kind: "error", message: "Leerer oder ung\u00fcltiger Code." });
        return;
      }

      startTransition(async () => {
        if (parsed.type === "unze_id") {
          const result = await verifyUnzeIdAction(parsed.token, "community", communityId);
          if (result.error || !("allowed" in result)) {
            setLastResult({ kind: "error", message: result.error ?? "Verify fehlgeschlagen" });
            return;
          }
          const code = result.resultCode ?? (result.allowed ? "allowed" : "denied");
          setLastResult({
            kind: "unze_id",
            ok: Boolean(result.allowed),
            message: VERIFY_LABELS[code] ?? VERIFY_LABELS.denied,
            code,
          });
        } else {
          const result = await checkInEventTicketAction(slug, parsed.code);
          if (result.error) {
            setLastResult({ kind: "error", message: result.error });
            return;
          }
          setLastResult({
            kind: "ticket",
            ok: true,
            message: buildCheckInMessage(result.rewards),
          });
          setManualCode("");
        }
        router.refresh();
      });
    },
    [communityId, slug, router],
  );

  return (
    <div className="space-y-4" data-testid="dashboard-scanner-panel">
      <section className="rounded-3xl bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-unze-green" aria-hidden />
          <div>
            <h2 className="text-sm font-bold text-unze-ink">Scanner</h2>
            <p className="text-xs text-unze-ink-secondary">
              {communityTitle} {"\u2014"} erkennt UNZE-ID & Event-Tickets automatisch
            </p>
          </div>
        </div>

        <QrCodeScanner onScan={processPayload} paused={pending} />

        <form
          className="mt-4 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            processPayload(manualCode);
          }}
        >
          <label htmlFor="scanner-manual" className="text-xs font-medium text-unze-ink-secondary">
            Code manuell eingeben
          </label>
          <input
            id="scanner-manual"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="UNZE-ID oder Ticket-Code"
            autoComplete="off"
            className="w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2.5 font-mono text-sm outline-none focus:border-unze-green"
          />
          <button
            type="submit"
            disabled={pending || !manualCode.trim()}
            className="w-full rounded-xl bg-unze-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Pr\u00fcfe\u2026" : "Code pr\u00fcfen"}
          </button>
        </form>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-unze-border bg-unze-surface-muted/50 p-3">
          <IdCard className="mb-2 h-5 w-5 text-unze-green" aria-hidden />
          <p className="text-xs font-semibold text-unze-ink">UNZE-ID</p>
          <p className="mt-1 text-[11px] leading-relaxed text-unze-ink-secondary">
            {"Pers\u00f6nlicher Verify-Code \u2014 Zugang wird serverseitig gepr\u00fcft."}
          </p>
        </div>
        <div className="rounded-2xl border border-unze-border bg-unze-surface-muted/50 p-3">
          <Ticket className="mb-2 h-5 w-5 text-unze-green" aria-hidden />
          <p className="text-xs font-semibold text-unze-ink">Event-Ticket</p>
          <p className="mt-1 text-[11px] leading-relaxed text-unze-ink-secondary">
            {"Einmaliger Check-in-Code f\u00fcr ein gebuchtes Event."}
          </p>
        </div>
      </section>

      {lastResult && (
        <ActionFeedback
          variant={
            lastResult.kind === "error" || (lastResult.kind === "unze_id" && !lastResult.ok)
              ? "error"
              : "success"
          }
          className={cn(
            "flex items-start gap-2 rounded-2xl p-4",
            lastResult.kind !== "error" &&
              lastResult.kind === "unze_id" &&
              lastResult.ok &&
              "border-unze-green/30 bg-unze-green-muted text-unze-green-dark",
          )}
        >
          {lastResult.kind !== "error" &&
          (lastResult.kind === "ticket" ||
            (lastResult.kind === "unze_id" && lastResult.ok)) ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          <span className="text-sm">{lastResult.message}</span>
        </ActionFeedback>
      )}
    </div>
  );
}
