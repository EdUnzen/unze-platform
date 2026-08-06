import {
  ArrowRight,
  Building2,
  Calendar,
  Clock,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import { getBusinessCoreHeroMedia } from "@/lib/constants/business-core-media";
import {
  WEBSITE_TEMPLATES,
  type WebsitePageId,
  type WebsiteTemplateId,
} from "@/lib/constants/business-website-templates";

function resolveTemplate(industry?: IndustryId) {
  const id: WebsiteTemplateId =
    industry === "reinigung" || industry === "arztpraxis" || industry === "umzug"
      ? industry
      : "umzug";
  return WEBSITE_TEMPLATES[id];
}

function getServiceIcon(industry: WebsiteTemplateId) {
  if (industry === "umzug") return Truck;
  if (industry === "arztpraxis") return HeartPulse;
  return Sparkles;
}

function TemplateHeader({
  t,
  size,
  compactHeader = false,
}: {
  t: ReturnType<typeof resolveTemplate>;
  size: "device" | "gallery";
  compactHeader?: boolean;
}) {
  const logoSize = size === "gallery" ? "h-9 w-9" : "h-7 w-7";
  const iconSize = size === "gallery" ? "h-4 w-4" : "h-3.5 w-3.5";
  const nameClass = size === "gallery" ? "text-xs" : "text-[10px]";
  const tagClass = size === "gallery" ? "text-[9px]" : "text-[7px]";
  const navClass = size === "gallery" ? "text-[10px]" : "text-[8px]";
  const ctaClass = size === "gallery" ? "px-3 py-1.5 text-[10px]" : "px-2.5 py-1 text-[7px]";
  const stackedNav = compactHeader || size === "device";

  const logoBlock = (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className={`flex ${logoSize} shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${t.accent} shadow-sm`}
      >
        {t.id === "umzug" ? (
          <Truck className={`${iconSize} text-white`} strokeWidth={2.5} />
        ) : t.id === "arztpraxis" ? (
          <HeartPulse className={`${iconSize} text-white`} strokeWidth={2.5} />
        ) : (
          <Building2 className={`${iconSize} text-white`} strokeWidth={2.5} />
        )}
      </div>
      <div className="min-w-0">
        <span className={`block truncate font-bold tracking-tight text-gray-900 ${nameClass}`}>
          {t.company}
        </span>
        <span className={`block truncate text-gray-400 ${tagClass}`}>{t.tagline}</span>
      </div>
    </div>
  );

  const ctaButton = (
    <span className={`shrink-0 rounded-full bg-gray-900 font-semibold text-white ${ctaClass}`}>
      Kontakt
    </span>
  );

  const navItems = (
    <>
      {t.nav.map((item) => (
        <span
          key={item}
          className={`shrink-0 whitespace-nowrap font-medium text-gray-500 ${navClass} ${
            stackedNav ? "rounded-md bg-gray-50 px-2 py-0.5" : ""
          }`}
        >
          {item}
        </span>
      ))}
    </>
  );

  if (stackedNav) {
    return (
      <header className="shrink-0 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0 flex-1">{logoBlock}</div>
          {ctaButton}
        </div>
        <nav
          className="flex items-center gap-1.5 overflow-x-auto border-t border-gray-50 px-3 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Demo-Navigation"
        >
          {navItems}
        </nav>
      </header>
    );
  }

  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-white px-4 py-2.5 md:px-5">
      <div className="min-w-0 max-w-[42%] shrink-0">{logoBlock}</div>
      <nav
        className="flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-2"
        aria-label="Demo-Navigation"
      >
        {navItems}
      </nav>
      {ctaButton}
    </header>
  );
}

function HomePage({
  t,
  size,
  card = false,
}: {
  t: ReturnType<typeof resolveTemplate>;
  size: "device" | "gallery";
  card?: boolean;
}) {
  const ServiceIconComp = getServiceIcon(t.id);
  const heroMedia = getBusinessCoreHeroMedia(t.id);
  const heroTitleClass =
    size === "gallery"
      ? "text-lg md:text-xl"
      : "text-[14px] md:text-[16px]";
  const heroSubClass = size === "gallery" ? "text-[11px]" : "text-[8px]";
  const badgeClass = size === "gallery" ? "text-[10px]" : "text-[7px]";
  const ctaClass = size === "gallery" ? "px-4 py-2 text-[11px]" : "px-3 py-1.5 text-[8px]";
  const statValClass = size === "gallery" ? "text-base" : "text-[12px]";
  const statLabelClass = size === "gallery" ? "text-[9px]" : "text-[6px]";
  const cardTitleClass = size === "gallery" ? "text-[11px]" : "text-[8px]";
  const cardDescClass = size === "gallery" ? "text-[9px]" : "text-[6px]";
  const footerClass = size === "gallery" ? "text-[10px]" : "text-[6px]";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <section className={`relative min-h-0 ${card ? "flex-1" : "flex-[1.5]"} overflow-hidden bg-gradient-to-br ${t.accent}`}>
        {heroMedia?.hero ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroMedia.hero}
              alt={heroMedia.heroAlt ?? ""}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/25 to-black/50" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </>
        )}
        <div className="relative z-10 flex h-full flex-col justify-center px-5 py-4 md:px-8 md:py-6">
          <span
            className={`w-fit rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 font-semibold text-white backdrop-blur-sm ${badgeClass}`}
          >
            {t.heroBadge}
          </span>
          <h1
            className={`mt-2.5 max-w-[90%] font-[family-name:var(--font-display)] font-bold leading-snug text-white ${heroTitleClass}`}
          >
            {t.heroTitle}
          </h1>
          <p className={`mt-2 max-w-[85%] leading-relaxed text-white/80 ${heroSubClass}`}>
            {t.heroSubline}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full bg-white font-semibold text-gray-900 shadow-sm ${ctaClass}`}
            >
              {t.primaryCta}
              <ArrowRight className={size === "gallery" ? "h-3.5 w-3.5" : "h-2.5 w-2.5"} />
            </span>
            <span
              className={`rounded-full border border-white/30 font-semibold text-white/90 ${ctaClass}`}
            >
              {t.secondaryCta}
            </span>
          </div>
          {t.id === "arztpraxis" ? (
            <div
              className={`mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-white backdrop-blur-sm ${badgeClass}`}
            >
              <Calendar className={size === "gallery" ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden />
              Nächster freier Termin: Heute, 16:30
            </div>
          ) : null}
        </div>
      </section>

      {card ? null : (
        <>
      <section className="shrink-0 border-t border-gray-100 bg-gray-50/90 px-4 py-2.5 md:px-5 md:py-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          {t.stats.map((s) => (
            <div key={s.label}>
              <p className={`font-[family-name:var(--font-display)] font-bold text-gray-900 ${statValClass}`}>
                {s.val}
              </p>
              <p className={`font-medium uppercase tracking-wide text-gray-400 ${statLabelClass}`}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid shrink-0 grid-cols-3 gap-2 p-3 md:gap-3 md:p-4">
        {t.services.map(({ title, desc }) => (
          <article
            key={title}
            className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm md:p-3"
          >
            <div
              className={`flex items-center justify-center rounded-lg bg-[#00C853]/10 ${size === "gallery" ? "h-8 w-8" : "h-6 w-6"}`}
            >
              <ServiceIconComp
                className={size === "gallery" ? "h-4 w-4 text-[#00C853]" : "h-3 w-3 text-[#00C853]"}
                strokeWidth={2.5}
              />
            </div>
            <h3 className={`mt-1.5 font-bold text-gray-900 ${cardTitleClass}`}>{title}</h3>
            <p className={`mt-0.5 leading-relaxed text-gray-500 ${cardDescClass}`}>{desc}</p>
          </article>
        ))}
      </section>

      <footer className="mt-auto flex shrink-0 items-center justify-between border-t border-gray-100 bg-white px-4 py-2 md:px-5">
        <p className={`flex items-center gap-1 text-gray-500 ${footerClass}`}>
          {t.id === "umzug" ? (
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" aria-hidden />
          ) : (
            <Shield className="h-2.5 w-2.5 text-[#00C853]" aria-hidden />
          )}
          {t.trustLine}
        </p>
      </footer>
        </>
      )}
    </div>
  );
}

function ServicesPage({
  t,
  size,
  card = false,
}: {
  t: ReturnType<typeof resolveTemplate>;
  size: "device" | "gallery";
  card?: boolean;
}) {
  const ServiceIconComp = getServiceIcon(t.id);
  const titleClass = size === "gallery" ? "text-lg" : "text-[13px]";
  const leadClass = size === "gallery" ? "text-[11px]" : "text-[8px]";
  const itemTitleClass = size === "gallery" ? "text-[12px]" : "text-[9px]";
  const itemDescClass = size === "gallery" ? "text-[10px]" : "text-[7px]";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50/80">
      <div className={`shrink-0 border-b border-gray-100 bg-white ${card ? "px-4 py-3" : "px-5 py-4 md:px-6 md:py-5"}`}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00C853]">
          Leistungen
        </p>
        <h1 className={`mt-1 font-[family-name:var(--font-display)] font-bold text-gray-900 ${titleClass}`}>
          {t.id === "umzug"
            ? "Umzugsservice für Privat & Gewerbe"
            : t.id === "arztpraxis"
              ? "Medizinische Leistungen & Sprechzeiten"
              : "Reinigung, Facility & Hausmeister"}
        </h1>
        {card ? null : (
          <p className={`mt-1.5 max-w-xl text-gray-600 ${leadClass}`}>{t.heroSubline}</p>
        )}
      </div>
      <div className={`min-h-0 flex-1 space-y-2 overflow-hidden ${card ? "p-3" : "space-y-2.5 p-4 md:p-5"}`}>
        {t.services.map(({ title, desc }, i) => (
          <article
            key={title}
            className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:p-4"
          >
            <div
              className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.accent} ${size === "gallery" ? "h-10 w-10" : "h-8 w-8"}`}
            >
              <ServiceIconComp className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-bold text-gray-900 ${itemTitleClass}`}>
                {String(i + 1).padStart(2, "0")} · {title}
              </p>
              <p className={`mt-0.5 leading-relaxed text-gray-600 ${itemDescClass}`}>
              {card ? desc.split("—")[0]?.trim() ?? desc : desc}
            </p>
            </div>
          </article>
        ))}
      </div>
      {card ? null : (
        <div className={`border-t border-gray-100 bg-white px-5 py-3 text-gray-500 ${size === "gallery" ? "text-[10px]" : "text-[7px]"}`}>
          {t.trustLine}
        </div>
      )}
    </div>
  );
}

function ContactPage({
  t,
  size,
  card = false,
}: {
  t: ReturnType<typeof resolveTemplate>;
  size: "device" | "gallery";
  card?: boolean;
}) {
  const titleClass = size === "gallery" ? "text-lg" : "text-[13px]";
  const textClass = size === "gallery" ? "text-[11px]" : "text-[8px]";
  const labelClass = size === "gallery" ? "text-[10px]" : "text-[7px]";

  const address =
    t.id === "umzug"
      ? "Industriestr. 12, 60329 Frankfurt"
      : t.id === "arztpraxis"
        ? "Mainzer Landstr. 88, 60327 Frankfurt"
        : "Gewerbepark 4, 65760 Eschborn";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className={`shrink-0 bg-gradient-to-br ${t.accent} ${card ? "px-4 py-3" : "px-5 py-4 md:px-6 md:py-5"}`}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Kontakt</p>
        <h1 className={`mt-1 font-[family-name:var(--font-display)] font-bold text-white ${titleClass}`}>
          {t.primaryCta}
        </h1>
        {card ? null : (
          <p className={`mt-1 text-white/80 ${textClass}`}>Wir melden uns innerhalb von 24 Stunden.</p>
        )}
      </div>
      <div
        className={`grid min-h-0 flex-1 gap-2 overflow-hidden ${card ? "grid-cols-2 p-3" : "grid-cols-2 gap-3 p-4 md:gap-4 md:p-5"}`}
      >
        {card ? (
          [
            { icon: Phone, label: "Telefon", value: "069 · 123 456 78" },
            { icon: Mail, label: "E-Mail", value: "info@" + t.company.split(" ")[0].toLowerCase() + ".de" },
            { icon: MapPin, label: "Standort", value: address },
            { icon: Clock, label: "Erreichbar", value: t.id === "arztpraxis" ? "Mo–Fr 8–18" : "Mo–Sa 7–19" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-2">
              <div className="flex items-center gap-1 text-[#00C853]">
                <Icon className="h-3 w-3" aria-hidden />
                <span className={`font-semibold uppercase tracking-wide ${labelClass}`}>{label}</span>
              </div>
              <p className={`mt-1 font-medium leading-snug text-gray-800 ${textClass}`}>{value}</p>
            </div>
          ))
        ) : (
          <>
            <div className="space-y-2.5">
              {[
                { icon: Phone, label: "Telefon", value: "069 · 123 456 78" },
                { icon: Mail, label: "E-Mail", value: "info@" + t.company.split(" ")[0].toLowerCase() + ".de" },
                { icon: MapPin, label: "Standort", value: address },
                {
                  icon: Clock,
                  label: "Erreichbarkeit",
                  value: t.id === "arztpraxis" ? "Mo–Fr 8–18 Uhr" : "Mo–Sa 7–19 Uhr",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 md:p-3">
                  <div className="flex items-center gap-1.5 text-[#00C853]">
                    <Icon className="h-3 w-3" aria-hidden />
                    <span className={`font-semibold uppercase tracking-wide ${labelClass}`}>{label}</span>
                  </div>
                  <p className={`mt-1 font-medium text-gray-800 ${textClass}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 md:p-4">
              <p className={`font-bold text-gray-900 ${textClass}`}>Kurzanfrage</p>
              <div className="mt-2 space-y-2">
                {["Name", "E-Mail", "Nachricht"].map((field) => (
                  <div
                    key={field}
                    className={`rounded-md border border-gray-200 bg-white px-2 py-1.5 text-gray-400 ${labelClass}`}
                  >
                    {field}
                  </div>
                ))}
              </div>
              <span
                className={`mt-2 inline-block rounded-full bg-gray-900 font-semibold text-white ${size === "gallery" ? "px-3 py-1.5 text-[10px]" : "px-2.5 py-1 text-[7px]"}`}
              >
                Anfrage senden
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Branchenspezifische Website-Vorschau — Referenz-Templates aus Business Core */
export function WebsitePreview({
  compact = false,
  bare = false,
  industry = "umzug",
  page = "home",
  size = "device",
  fit = "full",
}: {
  compact?: boolean;
  bare?: boolean;
  industry?: IndustryId;
  page?: WebsitePageId;
  size?: "device" | "gallery";
  fit?: "full" | "card";
}) {
  const t = resolveTemplate(industry);
  const ServiceIconComp = getServiceIcon(t.id);
  const isCard = fit === "card";
  const resolvedSize = isCard ? "gallery" : size;

  if (compact) {
    return (
      <div className="relative flex h-full flex-col overflow-hidden bg-white">
        <div className={`relative h-[58%] shrink-0 bg-gradient-to-br ${t.accent}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between p-3">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold text-white">{t.company.split(" ")[0]}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[6px] font-semibold text-white">
                {t.primaryCta.split(" ")[0]}
              </span>
            </div>
            <p className="text-[9px] font-bold leading-tight text-white">
              {t.heroTitle.split("—")[0]?.trim()}
            </p>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-1 p-2">
          {t.services.map((s) => (
            <div key={s.title} className="rounded-md border border-gray-100 bg-gray-50 p-1.5">
              <ServiceIconComp className="h-2.5 w-2.5 text-[#00C853]" strokeWidth={2.5} />
              <p className="mt-1 text-[6px] font-semibold leading-tight text-gray-700">{s.title}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <TemplateHeader t={t} size={resolvedSize} compactHeader={isCard} />
      {page === "home" ? (
        <HomePage t={t} size={resolvedSize} card={isCard} />
      ) : page === "services" ? (
        <ServicesPage t={t} size={resolvedSize} card={isCard} />
      ) : (
        <ContactPage t={t} size={resolvedSize} card={isCard} />
      )}
    </div>
  );
}
