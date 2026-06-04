"use server";

import { getCurrentUser } from "@/services/auth/auth.service";
import { getDashboardCommunityAccess } from "@/services/dashboard/dashboard.service";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function savePremiumTransitionPlanAction(
  slug: string,
  _prev: { error?: string; success?: boolean; message?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Nicht angemeldet" };

  const { community } = await getDashboardCommunityAccess(slug, user.id);
  if (!community || community.viewerRole !== "creator") {
    return { error: "Keine Berechtigung" };
  }

  const dateStr = String(formData.get("scheduledDate") ?? "").trim();
  const notifyMembers = formData.get("notifyMembers") === "on";

  let scheduledAt: string | null = null;
  if (dateStr) {
    scheduledAt = new Date(`${dateStr}T09:00:00.000Z`).toISOString();
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Datenbank nicht verfügbar" };

  const payload: Record<string, unknown> = {
    premium_transition_scheduled_at: scheduledAt,
    premium_transition_notify_members: notifyMembers,
  };

  const { error } = await supabase
    .from("communities")
    .update(payload)
    .eq("id", community.id);

  if (error?.message?.includes("premium_transition")) {
    return {
      error:
        "Migration 028 ausführen (premium_transition). Kontaktiere den Support.",
    };
  }
  if (error) {
    console.error("[premium-transition]", error.message);
    return { error: "Planung konnte nicht gespeichert werden." };
  }

  revalidatePath(`/dashboard/community/${slug}/monetization`);
  return {
    success: true,
    message: scheduledAt
      ? `Premium-Umstellung geplant ab ${new Date(scheduledAt).toLocaleDateString("de-DE")}.`
      : "Premium-Planung gespeichert (ohne festes Datum).",
  };
}
