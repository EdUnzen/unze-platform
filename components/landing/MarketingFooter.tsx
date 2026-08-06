import Image from "next/image";
import { MarketingLink } from "@/components/landing/MarketingLink";
import { LANDING_FOOTER } from "@/lib/constants/landing-copy";
import { getAppEntryPath } from "@/lib/constants/site";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Image
                src="/landing/unze-logo.png"
                alt="UNZE Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-display text-base font-bold text-gray-900">UNZE</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">{LANDING_FOOTER.tagline}</p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Plattform
            </h4>
            <ul className="space-y-2">
              {LANDING_FOOTER.platform.map((item) => (
                <li key={item.label}>
                  <MarketingLink
                    href={item.href === "__APP__" ? getAppEntryPath() : item.href}
                    className="text-sm text-gray-600 hover:text-[#00C853]"
                  >
                    {item.label}
                  </MarketingLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Rechtliches
            </h4>
            <ul className="space-y-2">
              {LANDING_FOOTER.legal.map((item) => (
                <li key={item.href}>
                  <MarketingLink href={item.href} className="text-sm text-gray-600 hover:text-[#00C853]">
                    {item.label}
                  </MarketingLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Kontakt
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href={`mailto:${LANDING_FOOTER.contact.email}`} className="hover:text-[#00C853]">
                  {LANDING_FOOTER.contact.email}
                </a>
              </li>
              <li>{LANDING_FOOTER.contact.web}</li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
          {LANDING_FOOTER.copyright}
        </p>
      </div>
    </footer>
  );
}
