import type { ProductOverviewCard } from "@/lib/studio/product-metrics";

type ProductOverviewSectionProps = {
  products: ProductOverviewCard[];
  analyticsConnected: boolean;
  analyticsSource: string;
};

const STATUS_COLORS = {
  live: "bg-emerald-50 text-emerald-800",
  beta: "bg-blue-50 text-blue-800",
  development: "bg-gray-100 text-gray-600",
  discontinued: "bg-gray-100 text-gray-500",
} as const;

export function ProductOverviewSection({
  products,
  analyticsConnected,
  analyticsSource,
}: ProductOverviewSectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-gray-900">Produkt-Übersicht</h2>
        <p className="text-xs text-gray-500">
          UNZE Business im Fokus · Connect & Organizer nur zur Info
          {analyticsConnected
            ? ` · Web-Traffic nur ${analyticsSource}`
            : " · Web-Traffic: DB-Verbindung prüfen"}
        </p>
      </div>

      {!products.length ? (
        <p className="p-5 text-sm text-gray-500">
          Produkt-Kennzahlen werden geladen …
        </p>
      ) : (
      <ul className="divide-y divide-gray-100">
        {products.map((product) => (
          <li key={product.id} className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-sm font-semibold text-gray-900 ${
                      product.status === "discontinued"
                        ? "line-through decoration-gray-400 decoration-2"
                        : ""
                    }`}
                  >
                    {product.name}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[product.status]}`}
                  >
                    {product.statusLabel}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{product.tagline}</p>
                {product.url ? (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-emerald-700 underline"
                  >
                    {product.url.replace(/^https:\/\//, "")}
                  </a>
                ) : null}
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {product.metrics.map((metric, index) => (
                <div key={`${product.id}-${metric.label}-${index}`} className="rounded-lg bg-gray-50 px-3 py-2">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    {metric.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-gray-900">{metric.value}</dd>
                  {metric.hint ? <dd className="text-[10px] text-gray-500">{metric.hint}</dd> : null}
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      )}
    </section>
  );
}
