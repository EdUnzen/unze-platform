/**
 * Standard-Banner pro Kategorie (Unsplash) + vorgefertigte Presets.
 * Eigenes Upload-Feld: banner_url in DB (Formular erweiterbar).
 */

export type BannerPreset = {
  id: string;
  label: string;
  imageUrl: string;
  gradient: string;
  /** Leer = für alle Kategorien wählbar */
  categories: string[];
};

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: "gaming-1",
    label: "Gaming Arena",
    imageUrl:
      "https://images.unsplash.com/photo-1542751110-368ab147d270?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-violet-600/90 via-indigo-700/80 to-slate-900/75",
    categories: ["Gaming"],
  },
  {
    id: "gaming-2",
    label: "Esports",
    imageUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-purple-600/85 via-fuchsia-700/75 to-zinc-900/70",
    categories: ["Gaming"],
  },
  {
    id: "business-1",
    label: "Business Modern",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-slate-700/90 via-slate-800/80 to-zinc-900/75",
    categories: ["Business", "Finanzen"],
  },
  {
    id: "business-2",
    label: "Team & Netzwerk",
    imageUrl:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-blue-700/85 via-slate-800/75 to-neutral-900/70",
    categories: ["Business", "Finanzen"],
  },
  {
    id: "sport-1",
    label: "Sport",
    imageUrl:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-sky-600/90 via-blue-700/80 to-indigo-900/75",
    categories: ["Sport"],
  },
  {
    id: "fitness-1",
    label: "Sport & Fitness",
    imageUrl:
      "https://images.unsplash.com/photo-1571017023315-0ce1092a0c8e?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-emerald-600/90 via-teal-700/80 to-cyan-900/75",
    categories: ["Fitness"],
  },
  {
    id: "fitness-2",
    label: "Training",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeacbf84?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-green-600/85 via-emerald-700/75 to-teal-900/70",
    categories: ["Fitness"],
  },
  {
    id: "tech-1",
    label: "Technologie",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-cyan-600/85 via-blue-700/75 to-indigo-900/70",
    categories: ["Technologie"],
  },
  {
    id: "tech-2",
    label: "Innovation",
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-sky-600/85 via-indigo-700/75 to-slate-900/70",
    categories: ["Technologie", "Bildung"],
  },
  {
    id: "creative-1",
    label: "Kreativ",
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-rose-500/85 via-orange-600/75 to-amber-800/70",
    categories: ["Kreativität", "Lifestyle"],
  },
  {
    id: "lifestyle-1",
    label: "Lifestyle",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-amber-500/85 via-orange-600/75 to-rose-800/70",
    categories: ["Lifestyle"],
  },
  {
    id: "general-1",
    label: "Community",
    imageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-emerald-500/90 via-teal-600/80 to-cyan-700/70",
    categories: ["Allgemein", "Bildung"],
  },
  {
    id: "general-2",
    label: "Netzwerk",
    imageUrl:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-neutral-600/85 via-stone-700/75 to-neutral-800/70",
    categories: ["Allgemein"],
  },
];

const presetById = new Map(BANNER_PRESETS.map((p) => [p.id, p]));

export function getBannerPresetById(id: string | null | undefined): BannerPreset | null {
  if (!id) return null;
  return presetById.get(id) ?? null;
}

const CATEGORY_BANNER_ALIASES: Record<string, string> = {
  Sport: "Fitness",
};

export function normalizeBannerCategory(category: string): string {
  return CATEGORY_BANNER_ALIASES[category] ?? category;
}

export function getDefaultBannerPresetForCategory(category: string): BannerPreset {
  const normalized = normalizeBannerCategory(category);
  const forCategory = BANNER_PRESETS.find((p) =>
    p.categories.includes(normalized),
  );
  return forCategory ?? presetById.get("general-1")!;
}

export function getBannerPresetsForCategory(category: string): BannerPreset[] {
  const specific = BANNER_PRESETS.filter((p) => p.categories.includes(category));
  const general = BANNER_PRESETS.filter((p) => p.categories.includes("Allgemein"));
  const seen = new Set<string>();
  const merged: BannerPreset[] = [];
  for (const p of [...specific, ...general]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    merged.push(p);
  }
  return merged.length > 0 ? merged : [getDefaultBannerPresetForCategory(category)];
}

export function resolveBannerFromPresetOrUrl(input: {
  bannerUrl?: string | null;
  bannerPresetId?: string | null;
  bannerGradient?: string | null;
  category: string;
}): { imageUrl: string; gradient: string; presetId: string } {
  if (input.bannerUrl?.trim()) {
    const preset = getDefaultBannerPresetForCategory(input.category);
    return {
      imageUrl: input.bannerUrl.trim(),
      gradient: input.bannerGradient?.trim() || preset.gradient,
      presetId: input.bannerPresetId ?? preset.id,
    };
  }

  const preset =
    getBannerPresetById(input.bannerPresetId) ??
    getDefaultBannerPresetForCategory(input.category);

  return {
    imageUrl: preset.imageUrl,
    gradient: input.bannerGradient?.trim() || preset.gradient,
    presetId: preset.id,
  };
}
