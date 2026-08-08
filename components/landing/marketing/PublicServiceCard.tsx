"use client";

import { MarketingLink } from "@/components/landing/MarketingLink";
import { AppNutzenButton } from "@/components/landing/marketing/MarketingAppEntryGate";
import { CTA_APP_USE } from "@/lib/constants/cta-copy";
import type { PublicServiceCard } from "@/lib/marketing/public-directory.service";
import { ShieldCheck, Wrench } from "lucide-react";

function formatPrice(cents: number | null | undefined) {
  if (!cents) return "Auf Anfrage";
  return `${(cents / 100).toFixed(2).replace(".", ",")} EUR`;
}

export function PublicServiceCardView({ service }: { service: PublicServiceCard }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#00C853]">
            {service.category}
          </p>
          <h3 className="mt-1 font-semibold text-gray-900">{service.title}</h3>
          <MarketingLink
            href={`/community/${service.communitySlug}`}
            className="mt-1 inline-block text-xs text-gray-500 hover:text-[#00C853]"
          >
            {service.communityTitle}
          </MarketingLink>
        </div>
        <Wrench className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-gray-600">{service.description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {service.isVerified ? (
            <span className="inline-flex items-center gap-1 text-[#00C853]">
              <ShieldCheck className="h-3 w-3" aria-hidden />
              Verifiziert
            </span>
          ) : null}
          <span>{formatPrice(service.priceCents)}</span>
        </div>
        <AppNutzenButton
          tone="group"
          returnTo={`/community/${service.communitySlug}/group/${service.slug}`}
          className="rounded-full bg-[#00C853] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#00b34a]"
        >
          {CTA_APP_USE}
        </AppNutzenButton>
      </div>
    </article>
  );
}
