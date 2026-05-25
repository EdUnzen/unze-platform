/** Server-sichere Filterlogik für Discover (kein "use client"). */

export function filterDiscoverCommunities<
  T extends {
    title: string;
    description: string;
    category: string;
    tags: string[];
  },
>(items: T[], query: string, category: string): T[] {
  let result = items;

  if (category && category !== "Alle") {
    result = result.filter((c) => c.category === category);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  return result;
}
