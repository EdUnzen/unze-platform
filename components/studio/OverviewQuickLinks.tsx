import { STUDIO_QUICK_LINKS } from "@/lib/studio/overview-extras";
import Link from "next/link";

export function OverviewQuickLinks() {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold text-gray-900">Schnellzugriff</h2>
      <p className="mt-0.5 text-xs text-gray-500">Business, Leads & Studio-Aktionen</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {STUDIO_QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-800 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
