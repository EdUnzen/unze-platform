"use client";

import {
  AppNutzenButton,
  useMarketingAppEntryGate,
} from "@/components/landing/marketing/MarketingAppEntryGate";
import { CTA_APP_USE } from "@/lib/constants/cta-copy";
import type { CommunityGroup } from "@/types/community";
import { useState } from "react";

export function MarketingGroupPreviewList({
  communitySlug,
  groups,
}: {
  communitySlug: string;
  groups: CommunityGroup[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { requestAppEntry, gate } = useMarketingAppEntryGate();
  const selected = groups.find((g) => g.id === selectedId) ?? null;

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.slice(0, 9).map((group) => (
          <li key={group.id}>
            <button
              type="button"
              onClick={() => setSelectedId(group.id)}
              className="flex h-full w-full flex-col rounded-xl border border-gray-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#00C853]/25 hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900">{group.title}</h3>
              {group.description ? (
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                  {group.description}
                </p>
              ) : null}
              <span className="mt-3 text-xs font-medium text-[#00C853]">Details ansehen</span>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="presentation"
          onClick={() => setSelectedId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[#00C853]">
              Öffentliche Gruppen-Vorschau
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-gray-900">
              {selected.title}
            </h3>
            {selected.description ? (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{selected.description}</p>
            ) : (
              <p className="mt-3 text-sm text-gray-500">Keine weitere öffentliche Beschreibung.</p>
            )}
            <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Um beizutreten oder die Gruppe in der App zu nutzen, brauchst du UNZE Connect und eine
              Anmeldung.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() =>
                  requestAppEntry({
                    tone: "group",
                    returnTo: `/community/${communitySlug}/group/${selected.slug}`,
                  })
                }
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[#00C853] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00b34a]"
              >
                {CTA_APP_USE}
              </button>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {gate}
    </>
  );
}

export function MarketingAppNutzenCta({
  className,
  returnTo,
}: {
  className?: string;
  returnTo?: string;
}) {
  return (
    <AppNutzenButton
      returnTo={returnTo}
      className={
        className ??
        "inline-flex rounded-full bg-[#00C853] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00b34a]"
      }
    />
  );
}
