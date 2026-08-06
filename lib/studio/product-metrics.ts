import { listStudioClients } from "@/lib/studio/clients";
import { listStudioInquiries } from "@/lib/studio/inquiries";
import {
  STUDIO_PRODUCTS,
  STUDIO_PRODUCT_STATUS_LABELS,
  type StudioProductDefinition,
  type StudioProductId,
} from "@/lib/studio/products";
import {
  fetchPathAnalytics,
  isSiteAnalyticsAvailable,
} from "@/lib/studio/site-analytics";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProductMetricRow = {
  label: string;
  value: string;
  hint?: string;
};

export type ProductOverviewCard = {
  id: StudioProductId;
  name: string;
  tagline: string;
  status: StudioProductDefinition["status"];
  statusLabel: string;
  url?: string;
  metrics: ProductMetricRow[];
};

type ConnectDbStats = {
  users: number;
  communities: number;
  events: number;
};

async function fetchConnectDbStats(): Promise<ConnectDbStats | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  try {
    const [users, communities, events] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("communities").select("*", { count: "exact", head: true }),
      admin.from("community_events").select("*", { count: "exact", head: true }),
    ]);

    return {
      users: users.count ?? 0,
      communities: communities.count ?? 0,
      events: events.count ?? 0,
    };
  } catch {
    return null;
  }
}

function formatCount(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("de-DE");
}

async function countInquiriesLast30Days(): Promise<number> {
  const inquiries = await listStudioInquiries(200);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return inquiries.filter((i) => new Date(i.createdAt) >= cutoff).length;
}

async function buildBusinessProduct(leads30d: number, clientCount: number): Promise<ProductOverviewCard> {
  const def = STUDIO_PRODUCTS.find((p) => p.id === "unze-business")!;
  const traffic = def.analyticsPathPrefix
    ? await fetchPathAnalytics(def.analyticsPathPrefix)
    : null;

  const metrics: ProductMetricRow[] = [
    { label: "Leads (30 Tage)", value: formatCount(leads30d) },
    { label: "Kunden (Studio)", value: formatCount(clientCount) },
  ];

  if (traffic) {
    metrics.push(
      {
        label: "Besucher (30 Tage)",
        value: formatCount(traffic.visitors),
        hint: def.analyticsPathPrefix,
      },
      {
        label: "Seitenaufrufe (30 Tage)",
        value: formatCount(traffic.pageviews),
      },
    );
  } else if (isSiteAnalyticsAvailable()) {
    metrics.push({
      label: "Web-Traffic",
      value: "0",
      hint: "Sammelt sich ab dem ersten Besuch",
    });
  }

  return {
    id: def.id,
    name: def.name,
    tagline: def.tagline,
    status: def.status,
    statusLabel: STUDIO_PRODUCT_STATUS_LABELS[def.status],
    url: def.url,
    metrics,
  };
}

async function buildConnectProduct(connectStats: ConnectDbStats | null): Promise<ProductOverviewCard> {
  const def = STUDIO_PRODUCTS.find((p) => p.id === "unze-connect")!;

  const metrics: ProductMetricRow[] = [];

  if (connectStats) {
    metrics.push(
      {
        label: "Registrierte User",
        value: formatCount(connectStats.users),
        hint: "Lokale Supabase · überwiegend Demo/Test",
      },
      { label: "Communities", value: formatCount(connectStats.communities) },
      { label: "Events", value: formatCount(connectStats.events) },
    );
  } else {
    metrics.push({
      label: "Plattform-Daten",
      value: "—",
      hint: "Connect-DB — nur zur Info, kein Web-Tracking",
    });
  }

  return {
    id: def.id,
    name: def.name,
    tagline: def.tagline,
    status: def.status,
    statusLabel: STUDIO_PRODUCT_STATUS_LABELS[def.status],
    url: def.url,
    metrics,
  };
}

function buildOrganizerProduct(): ProductOverviewCard {
  const def = STUDIO_PRODUCTS.find((p) => p.id === "my-organizer-ai")!;
  return {
    id: def.id,
    name: def.name,
    tagline: def.tagline,
    status: def.status,
    statusLabel: STUDIO_PRODUCT_STATUS_LABELS[def.status],
    metrics: [{ label: "Status", value: "Entwicklung", hint: "Noch keine Live-Kennzahlen" }],
  };
}

export async function getStudioProductOverviews(): Promise<{
  products: ProductOverviewCard[];
  analyticsConnected: boolean;
  analyticsSource: string;
}> {
  try {
    const [connectStats, leads30d, clients] = await Promise.all([
      fetchConnectDbStats(),
      countInquiriesLast30Days(),
      listStudioClients(500),
    ]);

    const products = await Promise.all([
      buildBusinessProduct(leads30d, clients.length),
      buildConnectProduct(connectStats),
      Promise.resolve(buildOrganizerProduct()),
    ]);

    return {
      products,
      analyticsConnected: isSiteAnalyticsAvailable(),
      analyticsSource: "UNZE Business (/business)",
    };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[product-metrics]", err);
    }

    return {
      products: [],
      analyticsConnected: false,
      analyticsSource: "UNZE Business (/business)",
    };
  }
}
