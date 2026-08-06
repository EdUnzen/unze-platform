import {
  getStudioOrderChecklist,
  SHOP_WORKFLOW_AUTOMATION_LABEL,
  type ShopWorkflowAutomation,
} from "@/lib/constants/business-shop-workflows";
import type { ShopProductType } from "@/lib/constants/business-shop-catalog";
import { cn } from "@/lib/utils/cn";

type ShopOrderWorkflowPanelProps = {
  productType: ShopProductType;
  category: string;
  processingTime: string | null;
};

function badgeClass(automation: ShopWorkflowAutomation): string {
  switch (automation) {
    case "active":
      return "bg-emerald-100 text-emerald-800";
    case "planned":
      return "bg-amber-100 text-amber-900";
    case "partner":
      return "bg-sky-100 text-sky-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

/** Interne Checkliste — gleicher Workflow wie Shop, für Studio-Bearbeitung */
export function ShopOrderWorkflowPanel({
  productType,
  category,
  processingTime,
}: ShopOrderWorkflowPanelProps) {
  const steps = getStudioOrderChecklist(productType, category);

  return (
    <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 text-sm">
      <h2 className="font-semibold text-gray-900">Bearbeitungs-Workflow (Studio)</h2>
      <p className="mt-1 text-xs text-gray-600">
        Verbindlicher Ablauf laut Shop-Orchestrierung — einfachster Weg, Automatisierung wo möglich.
        {processingTime ? ` · Ziel: ${processingTime}` : null}
      </p>
      <ol className="mt-4 space-y-3">
        {steps.map((step) => (
          <li key={step.step} className="rounded-lg border border-white/80 bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-gray-400">{step.step}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", badgeClass(step.automation))}>
                {SHOP_WORKFLOW_AUTOMATION_LABEL[step.automation]}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-gray-400">{step.actor}</span>
            </div>
            <p className="mt-1 font-medium text-gray-900">{step.title}</p>
            <p className="mt-1 text-xs text-gray-600">{step.text}</p>
            {step.automationNote ? (
              <p className="mt-1.5 text-[11px] text-gray-500">{step.automationNote}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
