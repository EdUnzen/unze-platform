"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { canManageAccess } from "@/lib/permissions/community.permissions";
import {
  deleteCredentialCollection,
  getCredentialCollections,
  saveCredentialCollection,
} from "@/services/credentials/credential-collection.service";
import {
  deleteRequirementSet,
  getRequirementResources,
  getRequirementSet,
  saveRequirementSet,
} from "@/services/requirements/requirement-set.service";
import { getCommunityBadges } from "@/services/badges/badge.service";
import type {
  RequirementRuleInput,
  RequirementSetView,
} from "@/types/requirement-dashboard";
import type {
  RequirementPredicateType,
  RequirementResourceType,
  RequirementSeverity,
} from "@/types/requirement-engine";
import { revalidatePath } from "next/cache";

async function requireRequirementManager(slug: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" as const, ctx: null };

  const { community, canAccess } = await getDashboardCommunityAccess(slug, user.id);
  if (!canAccess || !community) {
    return { error: "Kein Zugriff" as const, ctx: null };
  }

  if (!canManageAccess(community.viewerRole)) {
    return { error: "Keine Berechtigung" as const, ctx: null };
  }

  return { error: null, ctx: { user, community } };
}

function parseRulesFromForm(formData: FormData): RequirementRuleInput[] {
  const raw = String(formData.get("rulesJson") ?? "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as RequirementRuleInput[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r) => r?.predicateType);
  } catch {
    return [];
  }
}

export async function loadRequirementDashboardData(slug: string) {
  const check = await requireRequirementManager(slug);
  if (check.error || !check.ctx) return null;

  const { community } = check.ctx;
  const [resources, collections, credentials] = await Promise.all([
    getRequirementResources(community.id, community.title),
    getCredentialCollections(community.id),
    getCommunityBadges(community.id),
  ]);

  const sets: Record<string, RequirementSetView | null> = {};
  for (const resource of resources) {
    const key = `${resource.type}:${resource.id}`;
    sets[key] = await getRequirementSet(resource.type, resource.id);
  }

  return {
    community,
    resources,
    sets,
    collections,
    credentials: credentials.map((c) => ({ id: c.id, name: c.name })),
    canManage: true,
  };
}

export async function saveRequirementSetAction(
  slug: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const check = await requireRequirementManager(slug);
  if (check.error || !check.ctx) return { error: check.error ?? "Kein Zugriff" };

  const resourceType = String(formData.get("resourceType") ?? "") as RequirementResourceType;
  const resourceId = String(formData.get("resourceId") ?? "").trim();
  const severity = String(formData.get("severity") ?? "none") as RequirementSeverity;
  const rootOperator = String(formData.get("rootOperator") ?? "AND") as "AND" | "OR";
  const label = String(formData.get("label") ?? "").trim() || null;
  const rules = parseRulesFromForm(formData);

  if (!resourceType || !resourceId) {
    return { error: "Ressource fehlt" };
  }

  const result = await saveRequirementSet({
    communityId: check.ctx.community.id,
    resourceType,
    resourceId,
    severity,
    label,
    rootOperator,
    rules,
  });

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/access`);
  return { success: true };
}

export async function deleteRequirementSetAction(
  slug: string,
  setId: string,
): Promise<{ error?: string; success?: boolean }> {
  const check = await requireRequirementManager(slug);
  if (check.error || !check.ctx) return { error: check.error ?? "Kein Zugriff" };

  const result = await deleteRequirementSet(setId);
  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/access`);
  return { success: true };
}

export async function saveCredentialCollectionAction(
  slug: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const check = await requireRequirementManager(slug);
  if (check.error || !check.ctx) return { error: check.error ?? "Kein Zugriff" };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const collectionId = String(formData.get("collectionId") ?? "").trim() || undefined;
  const credentialIds = formData.getAll("credentialIds") as string[];

  if (!name) return { error: "Name erforderlich" };

  const result = await saveCredentialCollection({
    communityId: check.ctx.community.id,
    name,
    description,
    credentialIds,
    collectionId,
  });

  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/auszeichnungen`);
  revalidatePath(`/dashboard/community/${slug}/access`);
  return { success: true };
}

export async function deleteCredentialCollectionAction(
  slug: string,
  collectionId: string,
): Promise<{ error?: string; success?: boolean }> {
  const check = await requireRequirementManager(slug);
  if (check.error || !check.ctx) return { error: check.error ?? "Kein Zugriff" };

  const result = await deleteCredentialCollection(collectionId);
  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/community/${slug}/auszeichnungen`);
  revalidatePath(`/dashboard/community/${slug}/access`);
  return { success: true };
}

export type { RequirementPredicateType };
