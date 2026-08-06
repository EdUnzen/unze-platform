import Link from "next/link";
import { shopSlugToInquiryHref } from "@/lib/business/inquiry-links";
import {
  SERVICE_PACKAGE_TIERS,
  SERVICE_WITHOUT_PACKAGE,
} from "@/lib/constants/business-service-package-tiers";

/** Paketvergleich — kompakt und übersichtlich */
export function ServicePackageHoursTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Paket
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Preis / Monat
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Inklusive
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Rabatt
              </th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 bg-amber-50/50">
              <td className="px-5 py-4 font-medium text-gray-800">{SERVICE_WITHOUT_PACKAGE.label}</td>
              <td className="px-5 py-4 text-gray-500">—</td>
              <td className="px-5 py-4 text-gray-600">{SERVICE_WITHOUT_PACKAGE.includedHours}</td>
              <td className="px-5 py-4 text-xs text-gray-600">{SERVICE_WITHOUT_PACKAGE.discountLabel}</td>
              <td className="px-5 py-4" />
            </tr>
            {SERVICE_PACKAGE_TIERS.map((tier) => (
              <tr
                key={tier.id}
                className={`border-b border-gray-100 last:border-0 ${tier.highlighted ? "bg-emerald-50/40" : ""}`}
              >
                <td className="px-5 py-4">
                  <span className="font-semibold text-gray-900">{tier.name}</span>
                  {tier.highlighted ? (
                    <span className="ml-2 rounded-full bg-[#00C853]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#007a3d]">
                      Top
                    </span>
                  ) : null}
                </td>
                <td className="px-5 py-4 font-semibold text-gray-900">{tier.priceLabel}</td>
                <td className="px-5 py-4 text-gray-700">{tier.includedHoursLabel}</td>
                <td className="px-5 py-4 text-gray-600">{tier.discountLabel}</td>
                <td className="px-5 py-4">
                  <Link
                    href={shopSlugToInquiryHref(tier.slug)}
                    className="inline-flex rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800"
                  >
                    Anfragen
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-gray-100 px-5 py-3.5 text-xs leading-relaxed text-gray-500">
        Alle Paketpreise sind Orientierung — Inklusiv-Stunden und Rabatte werden verbindlich im Vertrag festgelegt.
      </p>
    </div>
  );
}
