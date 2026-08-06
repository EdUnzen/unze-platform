import type { CreatorReferral, ReferralSummary } from "@/types/referral";
import { Users } from "lucide-react";

interface MyReferralsDashboardProps {
  summary: ReferralSummary;
}

export function MyReferralsDashboard({ summary }: MyReferralsDashboardProps) {
  const active = summary.referralsMade.filter((r) => r.status === "active");

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-5 w-5 text-unze-green" aria-hidden />
        <h2 className="text-base font-semibold text-unze-ink">Deine Crowd-Partner-Wirkung</h2>
      </div>
      <p className="mb-4 text-xs text-unze-ink-secondary">
        Direkte Empfehlungen nur {"—"} kein Multi-Level. Beteiligung: 11&nbsp;% vom
        Netto-Plattformanteil (nicht von fremden Stripe-Umsätzen).
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Unterstützt" value={String(summary.referralsMade.length)} />
        <Stat label="Aktiv" value={String(active.length)} />
        <Stat label="Konflikte" value={String(summary.conflictCount)} />
      </div>

      {summary.referralsMade.length === 0 ? (
        <p className="rounded-2xl bg-unze-surface-muted/50 px-3 py-4 text-sm text-unze-ink-secondary">
          Noch keine empfohlenen Creator. Teile UNZE {"—"} andere Creator können dich als
          Crowd Partner wählen.
        </p>
      ) : (
        <ul className="space-y-2">
          {summary.referralsMade.map((r) => (
            <ReferralRow key={r.id} referral={r} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-unze-surface-muted/60 py-2">
      <p className="text-lg font-bold text-unze-ink">{value}</p>
      <p className="text-[10px] font-medium text-unze-ink-muted">{label}</p>
    </div>
  );
}

function ReferralRow({ referral }: { referral: CreatorReferral }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-unze-border p-3">
      <div>
        <p className="text-sm font-semibold text-unze-ink">
          {referral.referredDisplayName ?? "Creator"}
        </p>
        <p className="text-xs text-unze-ink-muted">
          seit {new Date(referral.createdAt).toLocaleDateString("de-DE")}
        </p>
      </div>
      <span
        className={
          referral.status === "active"
            ? "text-xs font-semibold text-unze-green-dark"
            : "text-xs font-medium text-unze-ink-muted"
        }
      >
        {referral.status === "active" ? "Aktiv" : referral.status}
      </span>
    </li>
  );
}
