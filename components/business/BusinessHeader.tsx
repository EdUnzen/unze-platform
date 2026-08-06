"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BusinessLink } from "@/components/business/BusinessLink";
import { UnzeEcosystemNav } from "@/components/shared/UnzeEcosystemNav";
import {
  BUSINESS_NAV,
  BUSINESS_CTA_HREF,
  BUSINESS_NAV_SECONDARY,
} from "@/lib/constants/business-site";
import { BUSINESS_COPY } from "@/lib/constants/business-copy";
import { CommunityExitLink } from "@/components/business/CommunityExitLink";
import Image from "next/image";

const NAV_LINK =
  "inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-lg px-2.5 text-[13px] font-medium leading-none transition";
const NAV_IDLE = `${NAV_LINK} text-gray-600 hover:bg-gray-50 hover:text-gray-900`;
const NAV_EMPHASIS = `${NAV_LINK} font-semibold text-[#00C853] hover:bg-[#00C853]/5 hover:text-[#00b34a]`;
const NAV_ACTIVE = `${NAV_LINK} bg-gray-100 text-gray-900`;

export function BusinessHeader({ communityExitHref }: { communityExitHref: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/95 backdrop-blur-xl"
      data-unze-business-header
    >
      {/* Zeile 1: Logo · Projekt-CTA · Community/Business (rechts) */}
      <div className="container mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <BusinessLink href="/business" className="flex shrink-0 items-center gap-2">
            <Image
              src="/landing/unze-logo.png"
              alt=""
              width={36}
              height={36}
              className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
              priority
            />
            <span className="hidden whitespace-nowrap font-[family-name:var(--font-display)] text-[15px] font-bold tracking-tight text-gray-900 sm:inline sm:text-base">
              UNZE Business
            </span>
          </BusinessLink>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <BusinessLink
            href={BUSINESS_CTA_HREF}
            className="hidden h-9 items-center rounded-full bg-[#00C853] px-3.5 text-[13px] font-semibold leading-none text-white shadow-sm transition hover:bg-[#00b34a] sm:inline-flex lg:h-10 lg:px-4 lg:text-sm"
          >
            {BUSINESS_COPY.nav.cta}
          </BusinessLink>
          <div className="shrink-0">
            <UnzeEcosystemNav />
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 md:hidden"
            aria-expanded={open}
            aria-label="Menü öffnen"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Zeile 2: Hauptnavigation — ab md immer sichtbar (kein Burger auf Tablet/Desktop) */}
      <nav
        className="hidden border-t border-gray-100 bg-white/80 md:block"
        aria-label="UNZE Business Navigation"
      >
        <div className="container mx-auto flex max-w-7xl items-center gap-0.5 overflow-x-auto px-3 py-1.5 sm:px-4 lg:flex-wrap lg:overflow-visible">
          {BUSINESS_NAV.map((item) => {
            const isActive = pathname === item.href;
            const className = isActive
              ? NAV_ACTIVE
              : "emphasis" in item && item.emphasis
                ? NAV_EMPHASIS
                : NAV_IDLE;
            return (
              <BusinessLink key={item.href} href={item.href} className={className}>
                {item.label}
              </BusinessLink>
            );
          })}
          <span className="mx-1 hidden h-5 w-px shrink-0 bg-gray-200 lg:block" aria-hidden />
          {BUSINESS_NAV_SECONDARY.map((item) => {
            const isActive = pathname === item.href;
            const isKi = item.href.includes("ki-automatisierung");
            return (
              <BusinessLink
                key={item.href}
                href={item.href}
                className={
                  isActive ? NAV_ACTIVE : isKi ? NAV_EMPHASIS : NAV_IDLE
                }
              >
                {item.label}
              </BusinessLink>
            );
          })}
        </div>
      </nav>

      {/* Mobil: Burger-Menü (< md) */}
      {open ? (
        <nav
          className="border-t border-gray-100 bg-white px-4 py-4 md:hidden"
          aria-label="UNZE Business Navigation mobil"
        >
          <CommunityExitLink
            href={communityExitHref}
            onNavigate={() => setOpen(false)}
            className="mb-3 block text-xs font-medium text-gray-500"
          >
            {BUSINESS_COPY.nav.backToCommunity}
          </CommunityExitLink>
          <ul className="space-y-0.5">
            {BUSINESS_NAV.map((item) => (
              <li key={item.href}>
                <BusinessLink
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex h-10 items-center rounded-lg px-3 text-sm font-medium hover:bg-gray-50 ${
                    "emphasis" in item && item.emphasis
                      ? "font-semibold text-[#00C853]"
                      : "text-gray-700"
                  }`}
                >
                  {item.label}
                </BusinessLink>
              </li>
            ))}
            {BUSINESS_NAV_SECONDARY.map((item) => (
              <li key={item.href}>
                <BusinessLink
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex h-10 items-center rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  {item.label}
                </BusinessLink>
              </li>
            ))}
            <li className="pt-2 sm:hidden">
              <BusinessLink
                href={BUSINESS_CTA_HREF}
                onClick={() => setOpen(false)}
                className="flex h-11 items-center justify-center rounded-full bg-[#00C853] text-sm font-semibold text-white"
              >
                {BUSINESS_COPY.nav.cta}
              </BusinessLink>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
