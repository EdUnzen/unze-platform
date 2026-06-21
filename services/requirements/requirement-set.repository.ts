import { createClient } from "@/lib/supabase/server";
import type {
  RequirementPredicateType,
  RequirementResourceType,
  RequirementSeverity,
} from "@/types/requirement-engine";
import type {
  RequirementRuleInput,
  RequirementRuleView,
  RequirementSetView,
} from "@/types/requirement-dashboard";

function mapRuleRow(row: Record<string, unknown>): RequirementRuleView {
  return {
    id: row.id as string,
    predicateType: row.predicate_type as RequirementPredicateType,
    predicateRefId: (row.predicate_ref_id as string) ?? null,
    predicateValue: (row.predicate_value as string) ?? null,
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

function parseSetNodes(
  nodes: Record<string, unknown>[],
): Pick<RequirementSetView, "rootOperator" | "rules"> {
  if (nodes.length === 0) {
    return { rootOperator: "AND", rules: [] };
  }

  const roots = nodes.filter((n) => !n.parent_id);

  if (roots.length === 1) {
    const root = roots[0]!;
    const op = (root.operator as string) ?? "LEAF";
    if (op === "AND" || op === "OR") {
      const children = nodes
        .filter((n) => n.parent_id === root.id)
        .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
        .map(mapRuleRow);
      return { rootOperator: op as "AND" | "OR", rules: children };
    }
    return { rootOperator: "AND", rules: [mapRuleRow(root)] };
  }

  return {
    rootOperator: "AND",
    rules: roots
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map(mapRuleRow),
  };
}

export async function fetchRequirementSetForResource(
  resourceType: RequirementResourceType,
  resourceId: string,
): Promise<RequirementSetView | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: setRow, error } = await supabase
    .from("requirement_sets")
    .select("*")
    .eq("resource_type", resourceType)
    .eq("resource_id", resourceId)
    .maybeSingle();

  if (error || !setRow) {
    if (error) console.error("[requirement-set.repository] fetch set:", error.message);
    return null;
  }

  const { data: nodes, error: nodesError } = await supabase
    .from("requirement_nodes")
    .select("*")
    .eq("set_id", setRow.id)
    .order("sort_order", { ascending: true });

  if (nodesError) {
    console.error("[requirement-set.repository] fetch nodes:", nodesError.message);
    return null;
  }

  const parsed = parseSetNodes((nodes ?? []) as Record<string, unknown>[]);

  return {
    id: setRow.id as string,
    communityId: setRow.community_id as string,
    resourceType: setRow.resource_type as RequirementResourceType,
    resourceId: setRow.resource_id as string,
    severity: setRow.severity as RequirementSeverity,
    label: (setRow.label as string) ?? null,
    isActive: Boolean(setRow.is_active),
    rootOperator: parsed.rootOperator,
    rules: parsed.rules,
  };
}

export async function saveRequirementSetInDb(input: {
  communityId: string;
  resourceType: RequirementResourceType;
  resourceId: string;
  severity: RequirementSeverity;
  label?: string | null;
  rootOperator: "AND" | "OR";
  rules: RequirementRuleInput[];
}): Promise<{ error: string | null; setId?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const existing = await fetchRequirementSetForResource(
    input.resourceType,
    input.resourceId,
  );

  let setId = existing?.id;

  if (setId) {
    const { error } = await supabase
      .from("requirement_sets")
      .update({
        severity: input.severity,
        label: input.label ?? null,
        is_active: input.severity !== "none",
        updated_at: new Date().toISOString(),
      })
      .eq("id", setId);

    if (error) return { error: error.message };

    const { error: deleteError } = await supabase
      .from("requirement_nodes")
      .delete()
      .eq("set_id", setId);

    if (deleteError) return { error: deleteError.message };
  } else {
    const { data, error } = await supabase
      .from("requirement_sets")
      .insert({
        community_id: input.communityId,
        resource_type: input.resourceType,
        resource_id: input.resourceId,
        severity: input.severity,
        label: input.label ?? null,
        is_active: input.severity !== "none",
      })
      .select("id")
      .single();

    if (error || !data) return { error: error?.message ?? "Set konnte nicht erstellt werden" };
    setId = data.id as string;
  }

  if (input.severity === "none" || input.rules.length === 0) {
    return { error: null, setId };
  }

  const activeRules = input.rules.filter((r) => r.predicateType);

  if (activeRules.length === 0) {
    return { error: null, setId };
  }

  if (activeRules.length === 1) {
    const rule = activeRules[0]!;
    const { error } = await supabase.from("requirement_nodes").insert({
      set_id: setId,
      operator: "LEAF",
      predicate_type: rule.predicateType,
      predicate_ref_id: rule.predicateRefId ?? null,
      predicate_value: rule.predicateValue ?? null,
      sort_order: 0,
    });
    if (error) return { error: error.message };
    return { error: null, setId };
  }

  const { data: rootNode, error: rootError } = await supabase
    .from("requirement_nodes")
    .insert({
      set_id: setId,
      operator: input.rootOperator,
      sort_order: 0,
    })
    .select("id")
    .single();

  if (rootError || !rootNode) {
    return { error: rootError?.message ?? "Root-Knoten fehlgeschlagen" };
  }

  const leafRows = activeRules.map((rule, index) => ({
    set_id: setId,
    parent_id: rootNode.id,
    operator: "LEAF",
    predicate_type: rule.predicateType,
    predicate_ref_id: rule.predicateRefId ?? null,
    predicate_value: rule.predicateValue ?? null,
    sort_order: index,
  }));

  const { error: leafError } = await supabase.from("requirement_nodes").insert(leafRows);
  if (leafError) return { error: leafError.message };

  return { error: null, setId };
}

export async function deleteRequirementSetInDb(
  setId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase nicht konfiguriert" };

  const { error } = await supabase.from("requirement_sets").delete().eq("id", setId);
  if (error) return { error: error.message };
  return { error: null };
}
