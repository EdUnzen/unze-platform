import { Check } from "lucide-react";
import { PRICE_INCLUDED_ITEMS } from "@/lib/constants/business-pricing-policy";

export function PriceIncludedList({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "mt-4" : "mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5"}>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
        Im Preis enthalten
      </p>
      <ul className={`mt-3 grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-3" : "sm:grid-cols-2 md:grid-cols-3"}`}>
        {PRICE_INCLUDED_ITEMS.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="h-3.5 w-3.5 shrink-0 text-[#00C853]" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
