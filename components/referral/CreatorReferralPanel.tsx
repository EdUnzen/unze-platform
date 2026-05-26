"use client";

import {
  claimReferralAction,
  searchCreatorsAction,
} from "@/app/dashboard/referral-actions";
import { cn } from "@/lib/utils/cn";
import type { CreatorReferral, ReferralSummary } from "@/types/referral";
import { AlertTriangle, Link2, Search, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";

interface CreatorReferralPanelProps {
  summary: ReferralSummary;
}

export function CreatorReferralPanel({ summary }: CreatorReferralPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: string; name: string; username: string | null }[]
  >([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const search = () => {
    startTransition(async () => {
      setMessage(null);
      const { creators, error } = await searchCreatorsAction(query);
      if (error) {
        setMessage(error);
        return;
      }
      setResults(creators);
    });
  };

  const claim = (referrerUserId: string) => {
    startTransition(async () => {
      setMessage(null);
      const result = await claimReferralAction(referrerUserId);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      if (result.status === "conflict") {
        setMessage("Referral-Konflikt vorhanden — bitte prüfen.");
      } else {
        setMessage("Creator-Verbindung gespeichert.");
        setQuery("");
        setResults([]);
      }
    });
  };

  return (
    <section className="rounded-3xl bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-unze-green" aria-hidden />
        <h2 className="text-base font-semibold text-unze-ink">Creator Referral</h2>
      </div>
      <p className="mb-4 text-sm text-unze-ink-secondary">
        Optional: Gib an, welcher Creator dich zur Plattform gebracht hat. Kein
        Pflichtfeld — kein Multi-Level-System.
      </p>

      {summary.myReferral ? (
        <MyReferralCard referral={summary.myReferral} />
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-unze-ink-muted"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Creator suchen…"
                className="w-full rounded-2xl border border-unze-border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-unze-green"
              />
            </div>
            <button
              type="button"
              onClick={search}
              disabled={pending || query.trim().length < 2}
              className="rounded-2xl bg-unze-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Suchen
            </button>
          </div>

          {results.length > 0 && (
            <ul className="space-y-2">
              {results.map((creator) => (
                <li
                  key={creator.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-unze-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-unze-ink">{creator.name}</p>
                    {creator.username && (
                      <p className="text-xs text-unze-ink-muted">@{creator.username}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => claim(creator.id)}
                    disabled={pending}
                    className="inline-flex items-center gap-1 rounded-xl bg-unze-green-muted px-3 py-1.5 text-xs font-semibold text-unze-green-dark"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Verknüpfen
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {message && (
        <p
          className={cn(
            "mt-3 text-xs",
            message.includes("Konflikt") ? "text-amber-700" : "text-unze-green-dark",
          )}
        >
          {message}
        </p>
      )}

      {summary.referralsMade.length > 0 && (
        <div className="mt-6 border-t border-unze-border pt-4">
          <h3 className="mb-2 text-sm font-semibold text-unze-ink">
            Von dir verbundene Creator ({summary.activeCount} aktiv)
          </h3>
          <ul className="space-y-2">
            {summary.referralsMade.map((referral) => (
              <ReferredCreatorRow key={referral.id} referral={referral} />
            ))}
          </ul>
        </div>
      )}

      {summary.conflictCount > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {summary.conflictCount} Referral-Konflikt(e) — manuelle Prüfung erforderlich.
            Es wird kein automatischer Missbrauch angenommen.
          </p>
        </div>
      )}
    </section>
  );
}

function MyReferralCard({ referral }: { referral: CreatorReferral }) {
  const isConflict = referral.status === "conflict";

  return (
    <div
      className={cn(
        "rounded-2xl p-3",
        isConflict ? "bg-amber-50" : "bg-unze-green-muted/40",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-unze-ink-muted">
        Angeworben von
      </p>
      <p className="mt-1 text-sm font-semibold text-unze-ink">
        {referral.referrerDisplayName ?? "Creator"}
        {referral.referrerUsername && (
          <span className="ml-1 font-normal text-unze-ink-muted">
            @{referral.referrerUsername}
          </span>
        )}
      </p>
      <p className="mt-1 text-xs text-unze-ink-secondary">
        Status: {referral.status === "active" ? "Revenue Share aktiv" : referral.status}
      </p>
      {isConflict && referral.conflictNote && (
        <p className="mt-2 text-xs text-amber-800">{referral.conflictNote}</p>
      )}
    </div>
  );
}

function ReferredCreatorRow({ referral }: { referral: CreatorReferral }) {
  return (
    <li className="flex items-center justify-between rounded-xl bg-unze-surface-muted/40 px-3 py-2 text-sm">
      <span className="font-medium text-unze-ink">
        {referral.referredDisplayName ?? "Creator"}
      </span>
      <span
        className={cn(
          "text-xs font-medium",
          referral.status === "active" ? "text-unze-green-dark" : "text-unze-ink-muted",
        )}
      >
        {referral.status === "active" ? "Aktiv" : referral.status}
      </span>
    </li>
  );
}
