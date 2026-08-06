import type { StudioTierScope } from "@/lib/constants/business-pricing";

type PricingTierScopePublicProps = {
  scope: StudioTierScope;
  compact?: boolean;
};

export function PricingTierScopePublic({ scope, compact = false }: PricingTierScopePublicProps) {
  return (
    <div className={compact ? "mt-4 space-y-3 border-t border-gray-100 pt-4 text-xs" : "mt-5 space-y-4 text-sm"}>
      <p className="leading-relaxed text-gray-700">{scope.summary}</p>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">Enthalten</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-gray-700">
          {scope.included.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">Nicht enthalten</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-gray-600">
          {scope.notIncluded.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        <span>
          <strong className="text-gray-800">Zeitrahmen:</strong> {scope.timeframe}
        </span>
        <span>
          <strong className="text-gray-800">Korrekturen:</strong> {scope.revisions}
        </span>
      </div>
    </div>
  );
}
