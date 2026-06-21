"use client";

import {
  PLATFORM_FEE_LABEL,
  REFERRER_SHARE_LABEL,
} from "@/lib/constants/revenue";
import { formatEuro } from "@/lib/revenue/calculate-split";
import type { RevenueLedgerEntry } from "@/types/referral";
import { Coins, Receipt } from "lucide-react";

interface RevenueOverviewPanelProps {
  ledger: RevenueLedgerEntry[];
  userId: string;
}

export function RevenueOverviewPanel({ ledger, userId }: RevenueOverviewPanelProps) {
  const asCreator = ledger.filter((e) => e.creatorUserId === userId);
  const asReferrer = ledger.filter((e) => e.referrerUserId === userId);

  const creatorTotal = asCreator.reduce((sum, e) => sum + e.grossAmountCents, 0);
  const referrerTotal = asReferrer.reduce((sum, e) => sum + e.referrerShareCents, 0);

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Coins className="h-5 w-5 text-unze-green" aria-hidden />
        <h2 className="text-base font-semibold text-unze-ink">Revenue Share</h2>
      </div>

      <p className="mb-4 text-sm text-unze-ink-secondary">
        Netto-basiert: {PLATFORM_FEE_LABEL}, dann {REFERRER_SHARE_LABEL}. Sandbox-Einträge
        sind Vorschau — keine Live-Abrechnung.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <StatChip label="Creator (Brutto Sandbox)" value={formatEuro(creatorTotal)} />
        <StatChip label="Crowd-Partner-Anteil" value={formatEuro(referrerTotal)} highlight />
      </div>

      {ledger.length === 0 ? (
        <p className="rounded-2xl bg-unze-surface-muted/50 p-4 text-sm text-unze-ink-muted">
          Noch keine Buchungen. Sandbox-Checkout oder Demo-Seed erzeugen Beispieldaten.
        </p>
      ) : (
        <ul className="space-y-2">
          {ledger.map((entry) => (
            <li
              key={entry.id}
              className="rounded-2xl border border-unze-border p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-unze-ink">
                    {entry.creatorUserId === userId ? "Creator-Einnahme" : "Crowd-Partner-Anteil"}
                  </p>
                  <p className="text-xs text-unze-ink-muted">
                    {new Date(entry.createdAt).toLocaleDateString("de-DE")} ·{" "}
                    {entry.ledgerStatus}
                  </p>
                </div>
                <p className="font-semibold text-unze-ink">
                  {formatEuro(
                    entry.creatorUserId === userId
                      ? entry.grossAmountCents - entry.platformFeeCents - entry.referrerShareCents
                      : entry.referrerShareCents,
                  )}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-unze-ink-muted">
                <span>Brutto {formatEuro(entry.grossAmountCents)}</span>
                <span>Plattform {formatEuro(entry.platformFeeCents)}</span>
                {entry.referrerShareCents > 0 && (
                  <span>Crowd Partner {formatEuro(entry.referrerShareCents)}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatChip({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl bg-unze-green-muted/50 p-3"
          : "rounded-2xl bg-unze-surface-muted/40 p-3"
      }
    >
      <div className="mb-1 flex items-center gap-1">
        <Receipt className="h-3.5 w-3.5 text-unze-ink-muted" aria-hidden />
        <p className="text-[10px] font-medium uppercase tracking-wide text-unze-ink-muted">
          {label}
        </p>
      </div>
      <p className="text-lg font-semibold text-unze-ink">{value}</p>
    </div>
  );
}
