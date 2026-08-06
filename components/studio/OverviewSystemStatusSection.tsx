import type { SystemStatusItem } from "@/lib/studio/overview-extras";
import { SECTION_THEMES } from "@/lib/studio/overview-colors";

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-400"}`}
      aria-hidden
    />
  );
}

export function OverviewSystemStatusSection({ items }: { items: SystemStatusItem[] }) {
  const allOk = items.every((item) => item.ok);

  return (
    <section
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${SECTION_THEMES.system}`}
    >
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-900">System-Status</h2>
        <p className="text-xs text-gray-500">
          {allOk ? "Alle Dienste bereit" : "Mindestens ein Dienst prüfen"}
        </p>
      </div>
      <ul className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded-xl border px-4 py-3 ${
              item.ok
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-amber-200 bg-amber-50/60"
            }`}
          >
            <div className="flex items-center gap-2">
              <StatusDot ok={item.ok} />
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
            </div>
            <p className="mt-1 text-xs text-gray-500">{item.hint}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
