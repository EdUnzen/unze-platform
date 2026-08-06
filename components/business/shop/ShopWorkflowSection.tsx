import {
  SHOP_MASTER_WORKFLOW,
  SHOP_CATEGORY_WORKFLOWS,
  SHOP_WORKFLOW_AUTOMATION_LABEL,
  SHOP_WORKFLOW_CATEGORY_ORDER,
  type ShopWorkflowAutomation,
  type ShopWorkflowStep,
} from "@/lib/constants/business-shop-workflows";
import { cn } from "@/lib/utils/cn";
import { Bot, Clock, Handshake, User } from "lucide-react";

function AutomationBadge({ automation }: { automation: ShopWorkflowAutomation }) {
  const styles: Record<ShopWorkflowAutomation, string> = {
    active: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
    planned: "bg-amber-50 text-amber-900 ring-amber-200/80",
    manual: "bg-slate-100 text-slate-700 ring-slate-200/80",
    partner: "bg-sky-50 text-sky-800 ring-sky-200/80",
  };

  const Icon =
    automation === "active"
      ? Bot
      : automation === "planned"
        ? Clock
        : automation === "partner"
          ? Handshake
          : User;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
        styles[automation],
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {SHOP_WORKFLOW_AUTOMATION_LABEL[automation]}
    </span>
  );
}

function WorkflowStepsList({ steps, compact = false }: { steps: ShopWorkflowStep[]; compact?: boolean }) {
  return (
    <ol className={cn("space-y-3", !compact && "md:space-y-0 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-5")}>
      {steps.map((item) => (
        <li
          key={item.step}
          className={cn(
            "rounded-xl border border-gray-200 bg-white p-4 shadow-sm",
            compact && "md:col-span-1",
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-[family-name:var(--font-display)] text-xl font-bold text-gray-300">
              {item.step}
            </span>
            <AutomationBadge automation={item.automation} />
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-900">{item.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{item.text}</p>
          {item.automationNote ? (
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">{item.automationNote}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/** Gemeinsamer Kunden-Workflow — am Seitenende, standardmäßig eingeklappt */
export function ShopWorkflowSection() {
  return (
    <section id="shop-workflow" className="scroll-mt-36 border-t border-gray-100 bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <details className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <summary className="cursor-pointer list-none px-5 py-4 marker:content-none md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Ablauf & Zusammenarbeit
                </p>
                <p className="font-[family-name:var(--font-display)] text-base font-bold text-gray-900 md:text-lg">
                  {SHOP_MASTER_WORKFLOW.title}
                </p>
                <p className="mt-1 text-sm text-gray-600">{SHOP_MASTER_WORKFLOW.summary}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-gray-500 group-open:hidden">
                Anzeigen
              </span>
              <span className="hidden shrink-0 text-xs font-semibold text-gray-500 group-open:inline">
                Ausblenden
              </span>
            </div>
          </summary>

          <div className="border-t border-gray-100 px-5 pb-5 pt-4 md:px-6">
            <WorkflowStepsList steps={SHOP_MASTER_WORKFLOW.steps} compact />

            <div className="mt-8 space-y-4">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-gray-900">
                  Ablauf nach Leistungsart
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Der Rahmen bleibt gleich — Details hängen von der gebuchten Kategorie ab.
                </p>
              </div>

              <div className="space-y-3">
                {SHOP_WORKFLOW_CATEGORY_ORDER.filter((id) => SHOP_CATEGORY_WORKFLOWS[id]).map((categoryId) => {
                  const flow = SHOP_CATEGORY_WORKFLOWS[categoryId]!;
                  return (
                    <details
                      key={categoryId}
                      className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                    >
                      <summary className="cursor-pointer list-none px-4 py-3 marker:content-none">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                              {categoryId}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">{flow.title}</p>
                          </div>
                          <span className="text-[10px] text-gray-400">Details</span>
                        </div>
                      </summary>
                      <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                        <p className="mb-3 text-xs text-gray-600">{flow.summary}</p>
                        <WorkflowStepsList steps={flow.steps} compact />
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-gray-500">
              <strong className="font-semibold text-gray-700">Automatisierung geplant</strong> bedeutet:
              Der Ablauf ist definiert, die technische Anbindung folgt — bis dahin übernehmen wir die
              Schritte persönlich.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}

export function ShopProductWorkflowSteps({ steps }: { steps: ShopWorkflowStep[] }) {
  return (
    <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {steps.map((item) => (
        <li
          key={item.step}
          className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-gray-300">
              {item.step}
            </span>
            <AutomationBadge automation={item.automation} />
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-900">{item.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{item.text}</p>
          {item.automationNote ? (
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">{item.automationNote}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
