"use client";

import {
  deleteRequirementSetAction,
  saveRequirementSetAction,
} from "@/app/dashboard/requirement-actions";
import { ActionFeedback } from "@/components/ui/ActionFeedback";
import { RequirementCreatorPreview } from "@/components/requirements/RequirementCreatorPreview";
import { RequirementHelpBox } from "@/components/requirements/RequirementHelpBox";
import {
  REQUIREMENT_OPERATOR_OPTIONS,
  REQUIREMENT_PREDICATE_OPTIONS,
  REQUIREMENT_ROLE_OPTIONS,
  REQUIREMENT_SEVERITY_OPTIONS,
} from "@/lib/constants/requirement-rules";
import type {
  RequirementResourceOption,
  RequirementRuleInput,
  RequirementSetView,
} from "@/types/requirement-dashboard";
import type { RequirementPredicateType } from "@/types/requirement-engine";
import { cn } from "@/lib/utils/cn";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useActionState } from "react";

const inputClass =
  "w-full rounded-xl border border-unze-border bg-unze-surface-muted px-3 py-2 text-sm outline-none focus:border-unze-green";

interface RefOption {
  id: string;
  label: string;
}

interface RequirementRulesPanelProps {
  slug: string;
  resources: RequirementResourceOption[];
  sets: Record<string, RequirementSetView | null>;
  credentials: RefOption[];
  collections: RefOption[];
  events: RefOption[];
  canManage: boolean;
}

function emptyRule(): RequirementRuleInput {
  return { predicateType: "membership", predicateRefId: null, predicateValue: null };
}

function setKey(type: string, id: string) {
  return `${type}:${id}`;
}

export function RequirementRulesPanel({
  slug,
  resources,
  sets,
  credentials,
  collections,
  events,
  canManage,
}: RequirementRulesPanelProps) {
  const [selectedKey, setSelectedKey] = useState(
    resources[0] ? setKey(resources[0].type, resources[0].id) : "",
  );
  const selectedResource = useMemo(
    () => resources.find((r) => setKey(r.type, r.id) === selectedKey) ?? resources[0],
    [resources, selectedKey],
  );

  const currentSet = selectedResource
    ? sets[setKey(selectedResource.type, selectedResource.id)] ?? null
    : null;

  const [severity, setSeverity] = useState(currentSet?.severity ?? "none");
  const [rootOperator, setRootOperator] = useState<"AND" | "OR">(
    currentSet?.rootOperator ?? "AND",
  );
  const [rules, setRules] = useState<RequirementRuleInput[]>(
    currentSet?.rules.length
      ? currentSet.rules.map((r) => ({
          predicateType: r.predicateType,
          predicateRefId: r.predicateRefId,
          predicateValue: r.predicateValue,
        }))
      : [emptyRule()],
  );
  const [label, setLabel] = useState(currentSet?.label ?? "");

  const [saveState, saveAction, savePending] = useActionState(
    saveRequirementSetAction.bind(null, slug),
    null,
  );
  const [deletePending, startDelete] = useTransition();

  if (!canManage) {
    return (
      <p className="text-sm text-unze-ink-muted">
        Keine Berechtigung f{"ü"}r Zugangsvoraussetzungen.
      </p>
    );
  }

  if (resources.length === 0) {
    return null;
  }

  const handleResourceChange = (key: string) => {
    setSelectedKey(key);
    const resource = resources.find((r) => setKey(r.type, r.id) === key);
    if (!resource) return;
    const nextSet = sets[key] ?? null;
    setSeverity(nextSet?.severity ?? "none");
    setRootOperator(nextSet?.rootOperator ?? "AND");
    setRules(
      nextSet?.rules.length
        ? nextSet.rules.map((r) => ({
            predicateType: r.predicateType,
            predicateRefId: r.predicateRefId,
            predicateValue: r.predicateValue,
          }))
        : [emptyRule()],
    );
    setLabel(nextSet?.label ?? "");
  };

  const updateRule = (index: number, patch: Partial<RequirementRuleInput>) => {
    setRules((prev) =>
      prev.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)),
    );
  };

  const predicateMeta = (type: RequirementPredicateType) =>
    REQUIREMENT_PREDICATE_OPTIONS.find((p) => p.value === type);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-card">
      <h3 className="mb-1 text-sm font-semibold text-unze-ink">
        Zugangsvoraussetzungen
      </h3>
      <p className="mb-3 text-xs text-unze-ink-secondary">
        {"Lege fest, wer Zugang erhält. Gilt für Beitritt, Scanner und Buchungen."}
      </p>

      <RequirementHelpBox />

      {currentSet && currentSet.severity !== "none" && currentSet.rules.length > 0 && (
        <div className="my-4">
          <RequirementCreatorPreview
            title="Gespeicherte Regeln (live)"
            severity={currentSet.severity}
            rootOperator={currentSet.rootOperator}
            rules={currentSet.rules.map((r) => ({
              predicateType: r.predicateType,
              predicateRefId: r.predicateRefId,
              predicateValue: r.predicateValue,
            }))}
            credentials={credentials}
            collections={collections}
            events={events}
          />
        </div>
      )}

      {(severity !== "none" && rules.some((r) => r.predicateType)) && (
        <div className="my-4">
          <RequirementCreatorPreview
            title="Entwurf (vor dem Speichern)"
            severity={severity}
            rootOperator={rootOperator}
            rules={rules}
            credentials={credentials}
            collections={collections}
            events={events}
          />
        </div>
      )}

      <form action={saveAction} className="mt-4 space-y-4">
        <input type="hidden" name="resourceType" value={selectedResource?.type ?? ""} />
        <input type="hidden" name="resourceId" value={selectedResource?.id ?? ""} />
        <input type="hidden" name="rulesJson" value={JSON.stringify(rules)} />

        <label className="block text-xs">
          <span className="mb-1 block font-medium text-unze-ink">Ressource</span>
          <select
            value={selectedKey}
            onChange={(e) => handleResourceChange(e.target.value)}
            className={inputClass}
          >
            {resources.map((resource) => (
              <option key={setKey(resource.type, resource.id)} value={setKey(resource.type, resource.id)}>
                {resource.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-unze-ink">Schweregrad</span>
            <select
              name="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as typeof severity)}
              className={inputClass}
            >
              {REQUIREMENT_SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {severity === "required" && (
              <span className="mt-1 block text-[10px] text-unze-ink-muted">
                Pflicht: ohne Erf{"ü"}llung kein Zugang.
              </span>
            )}
            {severity === "recommended" && (
              <span className="mt-1 block text-[10px] text-unze-ink-muted">
                {"Empfohlen: Hinweis für Mitglieder, Zugang bleibt möglich."}
              </span>
            )}
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-unze-ink">Kombination</span>
            <select
              name="rootOperator"
              value={rootOperator}
              onChange={(e) => setRootOperator(e.target.value as "AND" | "OR")}
              className={inputClass}
              disabled={rules.length <= 1}
            >
              {REQUIREMENT_OPERATOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {rules.length > 1 && rootOperator === "AND" && (
              <span className="mt-1 block text-[10px] text-unze-ink-muted">
                UND: alle Regeln m{"ü"}ssen erf{"ü"}llt sein.
              </span>
            )}
            {rules.length > 1 && rootOperator === "OR" && (
              <span className="mt-1 block text-[10px] text-unze-ink-muted">
                ODER: mindestens eine Regel reicht.
              </span>
            )}
          </label>
        </div>

        <label className="block text-xs">
          <span className="mb-1 block font-medium text-unze-ink">Bezeichnung (optional)</span>
          <input
            name="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
            placeholder="z. B. VIP-Zugang"
          />
        </label>

        {severity !== "none" && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-unze-ink">Regeln</p>
            {rules.map((rule, index) => {
              const meta = predicateMeta(rule.predicateType);
              return (
                <div
                  key={index}
                  className="rounded-xl border border-unze-border/70 bg-unze-surface-muted/30 p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-xs">
                      <span className="mb-1 block text-unze-ink-muted">Pr{"ä"}dikat</span>
                      <select
                        value={rule.predicateType}
                        onChange={(e) =>
                          updateRule(index, {
                            predicateType: e.target.value as RequirementPredicateType,
                            predicateRefId: null,
                            predicateValue: null,
                          })
                        }
                        className={inputClass}
                      >
                        {REQUIREMENT_PREDICATE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    {meta?.needsRef === "credential" && (
                      <label className="block text-xs">
                        <span className="mb-1 block text-unze-ink-muted">Auszeichnung</span>
                        <select
                          value={rule.predicateRefId ?? ""}
                          onChange={(e) =>
                            updateRule(index, {
                              predicateRefId: e.target.value || null,
                            })
                          }
                          className={inputClass}
                        >
                          <option value="">Ausw{"ä"}hlen</option>
                          {credentials.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    {meta?.needsRef === "collection" && (
                      <label className="block text-xs">
                        <span className="mb-1 block text-unze-ink-muted">Sammlung</span>
                        <select
                          value={rule.predicateRefId ?? ""}
                          onChange={(e) =>
                            updateRule(index, {
                              predicateRefId: e.target.value || null,
                            })
                          }
                          className={inputClass}
                        >
                          <option value="">Ausw{"ä"}hlen</option>
                          {collections.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    {meta?.needsRef === "event" && (
                      <label className="block text-xs">
                        <span className="mb-1 block text-unze-ink-muted">Event</span>
                        <select
                          value={rule.predicateRefId ?? ""}
                          onChange={(e) =>
                            updateRule(index, {
                              predicateRefId: e.target.value || null,
                            })
                          }
                          className={inputClass}
                        >
                          <option value="">Aktuelles Event</option>
                          {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    {meta?.needsRef === "role" && (
                      <label className="block text-xs">
                        <span className="mb-1 block text-unze-ink-muted">Mindest-Rolle</span>
                        <select
                          value={rule.predicateValue ?? "member"}
                          onChange={(e) =>
                            updateRule(index, { predicateValue: e.target.value })
                          }
                          className={inputClass}
                        >
                          {REQUIREMENT_ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>

                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRules((prev) => prev.filter((_, i) => i !== index))}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Regel entfernen
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setRules((prev) => [...prev, emptyRule()])}
              className="inline-flex items-center gap-1 rounded-xl border border-unze-border px-3 py-2 text-xs font-medium text-unze-ink"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Regel hinzuf{"ü"}gen
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={savePending}
            className={cn(
              "rounded-xl bg-unze-green px-4 py-2.5 text-sm font-semibold text-white",
              savePending && "opacity-60",
            )}
          >
            {savePending ? "Speichern…" : "Voraussetzungen speichern"}
          </button>

          {currentSet?.id && (
            <button
              type="button"
              disabled={deletePending}
              onClick={() =>
                startDelete(async () => {
                  await deleteRequirementSetAction(slug, currentSet.id);
                })
              }
              className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700"
            >
              Zur{"ü"}cksetzen
            </button>
          )}
        </div>

        {saveState?.error && <ActionFeedback variant="error">{saveState.error}</ActionFeedback>}
        {saveState?.success && (
          <ActionFeedback variant="success">Zugangsvoraussetzungen gespeichert</ActionFeedback>
        )}
      </form>
    </section>
  );
}
