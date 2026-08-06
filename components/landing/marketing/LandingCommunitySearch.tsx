"use client";

import { CommunityDirectoryCard } from "@/components/landing/marketing/CommunityDirectoryCard";
import { LANDING_SEARCH_CATEGORIES } from "@/lib/constants/landing-copy";
import type { PublicCommunityCard } from "@/lib/marketing/public-directory.service";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const CATEGORY_ALIASES: Record<string, string[]> = {
  Bildung: ["bildung", "education", "lernen", "coaching"],
  Business: ["business", "finanzen", "unternehmen"],
  Entertainment: ["entertainment", "lifestyle", "unterhaltung"],
  Fitness: ["fitness", "wellness", "sport", "health"],
  Gaming: ["gaming", "esports", "spiele"],
  Handwerk: ["handwerk", "craft", "diy"],
  Musik: ["musik", "music", "audio"],
  Fotografie: ["fotografie", "foto", "photo", "kreativ"],
  Technik: ["technik", "technologie", "tech", "it"],
  Sport: ["sport", "sports", "athletik", "running"],
};

function matchesCategory(community: PublicCommunityCard, category: string): boolean {
  const cat = community.category.toLowerCase();
  const aliases = CATEGORY_ALIASES[category] ?? [category.toLowerCase()];
  return aliases.some((a) => cat.includes(a));
}

interface LandingCommunitySearchProps {
  resultLimit?: number;
  initialQuery?: string;
  compact?: boolean;
  cardSize?: "default" | "large";
  className?: string;
}

export function LandingCommunitySearch({
  resultLimit = 6,
  initialQuery = "",
  compact = false,
  cardSize = "default",
  className = "",
}: LandingCommunitySearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<PublicCommunityCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(Math.max(resultLimit, 12)) });
      if (q.trim()) params.set("search", q.trim());
      const res = await fetch(`/api/public/communities?${params}`);
      const json = (await res.json()) as { communities?: PublicCommunityCard[] };
      setResults(json.communities ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [resultLimit]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchCommunities(query);
    }, 280);
    return () => clearTimeout(t);
  }, [query, fetchCommunities]);

  const filtered = useMemo(() => {
    let items = results;
    if (activeCategory) {
      items = items.filter((c) => matchesCategory(c, activeCategory));
    }
    return items.slice(0, resultLimit);
  }, [results, activeCategory, resultLimit]);

  const showGrid = !compact;

  return (
    <div className={className}>
      <div className="relative mx-auto max-w-2xl">
        <Search
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) setActiveCategory(null);
          }}
          placeholder="Finde deine Community ..."
          aria-label="Community suchen"
          className="w-full rounded-full border border-gray-200 bg-white py-4 pl-14 pr-6 text-base shadow-lg shadow-gray-900/5 ring-1 ring-black/[0.03] transition placeholder:text-gray-400 focus:border-[#00C853]/40 focus:outline-none focus:ring-2 focus:ring-[#00C853]/20"
        />
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {LANDING_SEARCH_CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(active ? null : cat);
                setQuery("");
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-[#00C853] text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-[#00C853]/40 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {showGrid ? (
        <div className="mt-10 transition-opacity duration-300">
          {loading ? (
            <p className="text-center text-sm text-gray-500">Communities werden geladen…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              {query.trim() || activeCategory
                ? "Keine Communities in dieser Kategorie gefunden."
                : "Noch keine öffentlichen Communities – werde einer der ersten Creator in der Beta."}
            </p>
          ) : (
            <div
              className={`grid ${
                cardSize === "large" ? "gap-7 sm:grid-cols-2 lg:grid-cols-3" : "gap-6 sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {filtered.map((c) => (
                <CommunityDirectoryCard key={c.id} community={c} size={cardSize} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
