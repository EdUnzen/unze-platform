import { Building2, Mail, MapPin, Phone, Search, Stethoscope, Truck } from "lucide-react";
import { PreviewShell, StatusPill } from "./shared";
import type { IndustryId } from "@/lib/constants/business-industry-scenarios";
import { INDUSTRY_META } from "@/lib/constants/business-industry-scenarios";

type CustomerRow = {
  name: string;
  subtitle: string;
  detail: string;
  metric: string;
  metricLabel: string;
  status: "Aktiv" | "Offen" | "Neu";
  initials: string;
  color: string;
};

const CUSTOMERS_BY_INDUSTRY: Record<IndustryId, CustomerRow[]> = {
  umzug: [
    {
      name: "Weber Logistik GmbH",
      subtitle: "Firmenumzug · Mainz",
      detail: "Ansprechpartner: K. Weber · 3 frühere Aufträge",
      metric: "€ 24.800",
      metricLabel: "Umsatz YTD",
      status: "Aktiv",
      initials: "WL",
      color: "from-emerald-500 to-teal-600",
    },
    {
      name: "Familie Müller",
      subtitle: "Privatumzug · Koblenz → Neuwied",
      detail: "Angebot AN-092 offen · 78 m³ · 3. Etage",
      metric: "AN-092",
      metricLabel: "Angebot",
      status: "Offen",
      initials: "FM",
      color: "from-blue-500 to-indigo-600",
    },
    {
      name: "Schmidt & Partner",
      subtitle: "Büroumzug · 12 Arbeitsplätze",
      detail: "Letzter Auftrag: Jan 2026 · Lagerung aktiv",
      metric: "€ 9.450",
      metricLabel: "Umsatz YTD",
      status: "Neu",
      initials: "SP",
      color: "from-violet-500 to-purple-600",
    },
    {
      name: "Rhein Immobilien AG",
      subtitle: "Mehrere Standorte",
      detail: "Rahmenvertrag · 6 Umzüge geplant",
      metric: "6",
      metricLabel: "Aufträge",
      status: "Aktiv",
      initials: "RI",
      color: "from-cyan-500 to-teal-600",
    },
  ],
  reinigung: [
    {
      name: "Bürocenter Neuwied",
      subtitle: "Facility · 2.400 m²",
      detail: "Ansprechpartner: H. Brandt · Vertrag bis 12/2027",
      metric: "12/Wo",
      metricLabel: "Einsätze",
      status: "Aktiv",
      initials: "BN",
      color: "from-sky-500 to-blue-600",
    },
    {
      name: "Praxis Dr. Klein",
      subtitle: "Unterhaltsreinigung · Koblenz",
      detail: "Mo–Fr 06:30 · Qualitätsprotokoll aktiv",
      metric: "€ 8.160",
      metricLabel: "Umsatz YTD",
      status: "Aktiv",
      initials: "PK",
      color: "from-cyan-500 to-teal-600",
    },
    {
      name: "Wohnanlage Park Süd",
      subtitle: "Hausmeister & Grünpflege",
      detail: "Störungsdienst · 24 Objekteinheiten",
      metric: "24",
      metricLabel: "Einheiten",
      status: "Offen",
      initials: "WP",
      color: "from-indigo-500 to-violet-600",
    },
    {
      name: "Hotel Rheinblick",
      subtitle: "Grund- & Unterhaltsreinigung",
      detail: "SLA 98% · Verlängerung in Prüfung",
      metric: "€ 50.400",
      metricLabel: "Umsatz YTD",
      status: "Offen",
      initials: "HR",
      color: "from-blue-600 to-indigo-700",
    },
  ],
  handwerk: [
    {
      name: "Neubau Müller",
      subtitle: "Fliesen & Sanitär · Neuwied",
      detail: "Baustelle aktiv · Abnahme 24.03.",
      metric: "€ 12.400",
      metricLabel: "Auftragswert",
      status: "Aktiv",
      initials: "NM",
      color: "from-amber-500 to-orange-600",
    },
    {
      name: "Gewerbe Park Andernach",
      subtitle: "Sanierung Bäder",
      detail: "Angebot AN-044 versendet",
      metric: "AN-044",
      metricLabel: "Angebot",
      status: "Offen",
      initials: "GP",
      color: "from-orange-500 to-red-500",
    },
    {
      name: "Wartung Schmidt",
      subtitle: "Wiederkehrend · Koblenz",
      detail: "Jährliche Wartung · Termin 15.04.",
      metric: "€ 420",
      metricLabel: "Auftrag",
      status: "Neu",
      initials: "WS",
      color: "from-yellow-500 to-amber-600",
    },
  ],
  arztpraxis: [
    {
      name: "Petra Schneider",
      subtitle: "GKV · Geb. 1978",
      detail: "Letzter Besuch: 12.02.2026 · Recall fällig",
      metric: "15.03.",
      metricLabel: "Nächster Termin",
      status: "Aktiv",
      initials: "PS",
      color: "from-teal-500 to-cyan-600",
    },
    {
      name: "Thomas Weber",
      subtitle: "PKV · Hausarzt",
      detail: "Akte vollständig · Befund 08.03. hochgeladen",
      metric: "Dr. Hartmann",
      metricLabel: "Behandler",
      status: "Aktiv",
      initials: "TW",
      color: "from-emerald-500 to-teal-600",
    },
    {
      name: "Maria Klein",
      subtitle: "GKV · Ersttermin",
      detail: "Online gebucht · Anamnese offen",
      metric: "Neu",
      metricLabel: "Status",
      status: "Neu",
      initials: "MK",
      color: "from-blue-500 to-indigo-600",
    },
    {
      name: "Familie Hoffmann",
      subtitle: "3 Patienten verknüpft",
      detail: "Kinder: 2 · Recall Impfung",
      metric: "4",
      metricLabel: "Akten",
      status: "Offen",
      initials: "FH",
      color: "from-violet-500 to-purple-600",
    },
  ],
};

function listTitle(industry: IndustryId): string {
  if (industry === "arztpraxis") return "Patienten";
  return "Kunden";
}

function IndustryIcon({ industry }: { industry: IndustryId }) {
  if (industry === "umzug") return <Truck className="h-3 w-3 text-gray-400" />;
  if (industry === "arztpraxis") return <Stethoscope className="h-3 w-3 text-gray-400" />;
  return <Building2 className="h-3 w-3 text-gray-400" />;
}

export function CustomersPreview({
  compact = false,
  bare = false,
  industry = "umzug",
}: {
  compact?: boolean;
  industry?: IndustryId;
  bare?: boolean;
}) {
  const meta = INDUSTRY_META[industry];
  const customers = CUSTOMERS_BY_INDUSTRY[industry];
  const title = listTitle(industry);

  if (compact) {
    return (
      <PreviewShell bare={bare} title={title}>
        <div className="space-y-1.5 p-2">
          {customers.slice(0, 3).map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2 rounded-lg bg-white p-1.5 ring-1 ring-gray-100"
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${c.color} text-[7px] font-bold text-white`}
              >
                {c.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[8px] font-semibold text-gray-800">{c.name}</p>
                <p className="text-[6px] text-gray-400">{c.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell bare={bare} title={`${meta.company} — ${title}`}>
      <div className="flex h-full flex-col bg-[#f4f6f9]">
        <div className={`bg-gradient-to-r ${meta.accent} px-4 py-2.5 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[11px] font-bold">{title}</h2>
              <p className="text-[7px] text-white/75">
                {customers.length * 31} Einträge · Filter: Aktiv & Offen
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-white/20 px-2.5 py-1 text-[8px] font-semibold backdrop-blur-sm"
            >
              + {industry === "arztpraxis" ? "Patient" : "Kunde"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-3">
          <div className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 shadow-sm ring-1 ring-gray-100">
            <Search className="h-3 w-3 text-gray-400" />
            <span className="text-[8px] text-gray-400">
              {industry === "arztpraxis"
                ? "Name, Versicherung oder Geburtsdatum…"
                : "Name, Ort oder Ansprechpartner…"}
            </span>
          </div>

          <div className="mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-1.5 text-[6px] font-semibold uppercase tracking-wide text-gray-400">
              <span>{title}</span>
              <span className="hidden sm:inline">Details</span>
              <span className="text-right">Kennzahl</span>
            </div>

            <div className="divide-y divide-gray-50">
              {customers.map((c) => (
                <article
                  key={c.name}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2 transition hover:bg-[#00C853]/[0.03]"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-[9px] font-bold text-white shadow-sm`}
                    >
                      {c.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-[9px] font-semibold text-gray-900">{c.name}</p>
                        <StatusPill
                          tone={
                            c.status === "Aktiv" ? "green" : c.status === "Offen" ? "amber" : "gray"
                          }
                        >
                          {c.status}
                        </StatusPill>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-[7px] text-gray-500">
                        <IndustryIcon industry={industry} />
                        {c.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="hidden max-w-[120px] text-[6px] leading-snug text-gray-500 sm:block">
                    {c.detail}
                  </p>

                  <div className="text-right">
                    <p className="text-[9px] font-bold text-gray-900">{c.metric}</p>
                    <p className="text-[6px] text-gray-400">{c.metricLabel}</p>
                    <div className="mt-1 flex justify-end gap-1">
                      <Mail className="h-2.5 w-2.5 text-gray-300" />
                      <Phone className="h-2.5 w-2.5 text-gray-300" />
                      <MapPin className="h-2.5 w-2.5 text-gray-300" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}
