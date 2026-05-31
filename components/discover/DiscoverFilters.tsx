"use client";

import { COMMUNITY_CATEGORIES } from "@/lib/constants/community";
import { getDiscoverSearchPlaceholder } from "@/lib/discover/search";
import { cn } from "@/lib/utils/cn";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export function DiscoverSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const query = searchParams.get("q") ?? "";
  const tab = searchParams.get("tab") ?? "communities";

  const updateQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="relative mb-4" data-testid="discover-search">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-unze-ink-muted"
        aria-hidden
      />
      <input
        type="search"
        defaultValue={query}
        key={`${tab}-${query}`}
        placeholder={getDiscoverSearchPlaceholder(tab)}
        aria-label="Inhalte suchen"
        disabled={pending}
        onChange={(e) => updateQuery(e.target.value)}
        className="w-full rounded-2xl border border-unze-border bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-unze-green/30"
      />
    </div>
  );
}

export function DiscoverCategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "Alle";

  const categories = ["Alle", ...COMMUNITY_CATEGORIES];

  function setCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "Alle") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className="-mx-1 mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      data-testid="discover-categories"
      role="listbox"
      aria-label="Kategorien"
    >
      {categories.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            type="button"
            role="option"
            aria-selected={isActive}
            onClick={() => setCategory(cat)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
              isActive
                ? "bg-unze-green text-white shadow-sm"
                : "border border-unze-border bg-white text-unze-ink-secondary",
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
