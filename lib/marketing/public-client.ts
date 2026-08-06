/**
 * Server-seitiger Zugriff auf oeffentliche Marketing-Daten.
 * Primaer: /api/public/* Endpunkte (einheitliche oeffentliche Schicht)
 * Fallback: public-directory.service bei Build/Offline
 */
import "server-only";
import type {
  PublicCommunityCard,
  PublicCommunityPreview,
  PublicDirectoryStats,
  PublicEventCard,
  PublicServiceCard,
} from "@/lib/marketing/public-directory.service";

async function resolveOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_MARKETING_URL) {
    return process.env.NEXT_PUBLIC_MARKETING_URL.replace(/\/$/, "");
  }
  const { headers } = await import("next/headers");
  const host = (await headers()).get("host");
  if (!host) return "http://localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

async function fetchPublic<T>(path: string, fallback: () => Promise<T>): Promise<T> {
  try {
    const origin = await resolveOrigin();
    const res = await fetch(`${origin}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback();
  }
}

export async function fetchPublicCommunities(
  limit = 48,
): Promise<PublicCommunityCard[]> {
  const data = await fetchPublic<{ communities: PublicCommunityCard[] }>(
    `/api/public/communities?limit=${limit}`,
    async () => {
      const { getPublicDirectoryCommunities } = await import(
        "@/lib/marketing/public-directory.service"
      );
      return { communities: await getPublicDirectoryCommunities(limit) };
    },
  );
  return data.communities;
}

export async function fetchPublicDirectoryStats(): Promise<PublicDirectoryStats> {
  const data = await fetchPublic<{
    communities: PublicCommunityCard[];
    stats: PublicDirectoryStats;
  }>(
    `/api/public/communities?limit=100&stats=1`,
    async () => {
      const { getPublicDirectoryCommunities, getPublicDirectoryStats } =
        await import("@/lib/marketing/public-directory.service");
      return {
        communities: await getPublicDirectoryCommunities(100),
        stats: await getPublicDirectoryStats(),
      };
    },
  );
  return data.stats;
}

export async function fetchPublicCommunityPreview(
  slug: string,
): Promise<PublicCommunityPreview | null> {
  try {
    const origin = await resolveOrigin();
    const res = await fetch(`${origin}/api/public/communities/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as PublicCommunityPreview;
  } catch {
    const { getPublicCommunityPreview } = await import(
      "@/lib/marketing/public-directory.service"
    );
    return getPublicCommunityPreview(slug);
  }
}

export async function fetchPublicEvents(limit = 24): Promise<PublicEventCard[]> {
  const data = await fetchPublic<{ events: PublicEventCard[] }>(
    `/api/public/events?limit=${limit}`,
    async () => {
      const { getPublicEventsDirectory } = await import(
        "@/lib/marketing/public-directory.service"
      );
      return { events: await getPublicEventsDirectory(limit) };
    },
  );
  return data.events;
}

export async function fetchPublicServices(limit = 24): Promise<PublicServiceCard[]> {
  const data = await fetchPublic<{ services: PublicServiceCard[] }>(
    `/api/public/services?limit=${limit}`,
    async () => {
      const { getPublicServicesDirectory } = await import(
        "@/lib/marketing/public-directory.service"
      );
      return { services: await getPublicServicesDirectory(limit) };
    },
  );
  return data.services;
}
