import type { TodayActionItem } from "@/lib/studio/overview-extras";
import Link from "next/link";

const KIND_LABELS: Record<TodayActionItem["kind"], string> = {
  lead: "Lead",
  analysis_payment: "Analyse",
  quote_payment: "Zahlung",
  contract: "Vertrag",
  domain: "Domain",
};

const KIND_COLORS: Record<TodayActionItem["kind"], string> = {
  lead: "bg-blue-100 text-blue-800",
  analysis_payment: "bg-orange-100 text-orange-800",
  quote_payment: "bg-violet-100 text-violet-800",
  contract: "bg-amber-100 text-amber-900",
  domain: "bg-rose-100 text-rose-800",
};

function MailtoButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="inline-flex shrink-0 items-center rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 active:bg-emerald-50"
    >
      Anschreiben
    </a>
  );
}

export function OverviewTodaySection({ actions }: { actions: TodayActionItem[] }) {
  return (
    <section className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white shadow-sm">
      <div className="border-b border-emerald-100 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-900">Heute erledigen</h2>
        <p className="text-xs text-gray-500">
          Leads, Zahlungen, Verträge & Domains — sortiert nach Dringlichkeit
        </p>
      </div>
      {actions.length === 0 ? (
        <p className="p-5 text-sm text-gray-500">Alles erledigt — keine offenen Aktionen.</p>
      ) : (
        <ul className="divide-y divide-emerald-100/80">
          {actions.map((action) => (
            <li
              key={action.id}
              className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${KIND_COLORS[action.kind]}`}
                  >
                    {KIND_LABELS[action.kind]}
                  </span>
                  <Link href={action.href} className="text-sm font-semibold text-gray-900 hover:text-emerald-700">
                    {action.title}
                  </Link>
                </div>
                <p className="mt-1 text-xs text-gray-500">{action.subtitle}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={action.href}
                  className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Öffnen
                </Link>
                {action.mailtoHref ? <MailtoButton href={action.mailtoHref} /> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
