import { isTrackableAnalyticsPath } from "@/lib/studio/site-analytics-paths";
import { createAdminClient } from "@/lib/supabase/admin";

export type PathAnalytics = {
  visitors: number;
  pageviews: number;
};

export { isTrackableAnalyticsPath } from "@/lib/studio/site-analytics-paths";

export async function recordPageView(input: {
  path: string;
  visitorId: string;
  referrer?: string | null;
}): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const path = input.path.slice(0, 500);
  const visitorId = input.visitorId.slice(0, 64);
  if (!path.startsWith("/") || !isTrackableAnalyticsPath(path)) return false;

  const { error } = await admin.schema("studio").from("page_views").insert({
    path,
    visitor_id: visitorId,
    referrer: input.referrer?.slice(0, 500) ?? null,
  });

  if (error && process.env.NODE_ENV === "development") {
    console.error("[site-analytics] insert failed:", error.message);
  }

  return !error;
}

export async function fetchPathAnalytics(
  pathPrefix: string,
  periodDays = 30,
): Promise<PathAnalytics | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  try {
    const { data, error } = await admin.schema("studio").rpc("path_analytics", {
      path_prefix: pathPrefix,
      period_days: periodDays,
    });

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[site-analytics] rpc failed:", error.message);
      }
      return null;
    }

    if (!data) return null;

    const row = data as { visitors?: number | string; pageviews?: number | string };
    return {
      visitors: Number(row.visitors ?? 0),
      pageviews: Number(row.pageviews ?? 0),
    };
  } catch {
    return null;
  }
}

export function isSiteAnalyticsAvailable(): boolean {
  return Boolean(createAdminClient());
}
