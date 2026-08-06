"use client";

import { formatEuroCents, formatEuroRange } from "@/lib/business/pricing-utils";
import type { ProjectEstimate } from "@/lib/business/project-estimate.service";

type InquiryEstimatePreviewProps = {
  estimate: ProjectEstimate | null;
  compact?: boolean;
};

export function InquiryEstimatePreview({ estimate, compact = false }: InquiryEstimatePreviewProps) {
  if (!estimate) return null;

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
          : "rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
        Automatische Orientierung
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
        {formatEuroRange(estimate.minCents, estimate.maxCents)}
      </p>
      <p className="mt-1 text-sm text-gray-600">
        Mitte: {formatEuroCents(estimate.suggestedCents)} · Basis: {estimate.baseCategory} —{" "}
        {estimate.baseTier}
      </p>

      {estimate.lineItems.length > 1 ? (
        <ul className="mt-3 space-y-1 border-t border-emerald-100 pt-3 text-xs text-gray-700">
          {estimate.lineItems.map((item) => (
            <li key={item.label} className="flex justify-between gap-3">
              <span>{item.label}</span>
              <span className={item.amountCents < 0 ? "font-medium text-emerald-700" : "font-medium"}>
                {item.amountCents < 0 ? "−" : "+"}
                {formatEuroCents(Math.abs(item.amountCents))}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs text-gray-500">{estimate.disclaimer}</p>
    </div>
  );
}
