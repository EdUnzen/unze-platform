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
    id: "gaming-3",
    label: "Controller",
    imageUrl:
      "https://images.unsplash.com/photo-1493711662062-fa541f87f42e?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-indigo-600/90 via-violet-800/80 to-slate-900/75",
    categories: ["Gaming"],
  },
  {
    id: "gaming-4",
    label: "Streaming",
    imageUrl:
      "https://images.unsplash.com/photo-1614680376573-df3480f94c88?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-fuchsia-600/85 via-purple-700/75 to-black/70",
    categories: ["Gaming"],
  },
  {
    id: "gaming-5",
    label: "LAN Party",
    imageUrl:
      "https://images.unsplash.com/photo-1538481199705-c710c4eaa166?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-blue-700/85 via-indigo-800/75 to-slate-900/70",
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
    id: "business-3",
    label: "Meeting",
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-slate-600/90 via-gray-800/80 to-zinc-900/75",
    categories: ["Business"],
  },
  {
    id: "business-4",
    label: "Startup",
    imageUrl:
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-neutral-700/85 via-stone-800/75 to-black/70",
    categories: ["Business"],
  },
  {
    id: "finanzen-1",
    label: "Finanzen",
    imageUrl:
      "https://images.unsplash.com/photo-1611974789855-9c27a303c0e4?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-amber-600/85 via-yellow-700/75 to-stone-900/70",
    categories: ["Finanzen"],
  },
  {
    id: "finanzen-2",
    label: "Invest",
    imageUrl:
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-yellow-600/80 via-amber-700/70 to-neutral-900/75",
    categories: ["Finanzen"],
  },
  {
    id: "finanzen-3",
    label: "Trading",
    imageUrl:
      "https://images.unsplash.com/photo-1618044733300-947205409aee?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-emerald-700/80 via-teal-800/70 to-slate-900/75",
    categories: ["Finanzen"],
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
    id: "sport-2",
    label: "Stadion",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-blue-600/85 via-indigo-700/75 to-slate-900/70",
    categories: ["Sport"],
  },
  {
    id: "sport-3",
    label: "Laufen",
    imageUrl:
      "https://images.unsplash.com/photo-1476480862128-209bfaa8e098?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-orange-500/85 via-red-600/75 to-rose-900/70",
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
    id: "fitness-3",
    label: "Gym",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-e14bbe5d3a88?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-red-600/85 via-rose-700/75 to-stone-900/70",
    categories: ["Fitness"],
  },
  {
    id: "fitness-4",
    label: "Yoga",
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-teal-500/85 via-cyan-600/75 to-emerald-900/70",
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
    id: "tech-3",
    label: "Code",
    imageUrl:
      "https://images.unsplash.com/photo-1461740680684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-cyan-600/85 via-blue-700/75 to-indigo-900/70",
    categories: ["Technologie"],
  },
  {
    id: "tech-4",
    label: "KI & Data",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-violet-600/85 via-purple-700/75 to-slate-900/70",
    categories: ["Technologie"],
  },
  {
    id: "tech-5",
    label: "Hardware",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-slate-600/90 via-gray-700/80 to-zinc-900/75",
    categories: ["Technologie"],
  },
  {
    id: "bildung-1",
    label: "Lernen",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-indigo-500/85 via-blue-600/75 to-slate-800/70",
    categories: ["Bildung"],
  },
  {
    id: "bildung-2",
    label: "Campus",
    imageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-blue-600/85 via-teal-700/75 to-cyan-900/70",
    categories: ["Bildung"],
  },
  {
    id: "musik-1",
    label: "Live Musik",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-pink-600/85 via-purple-700/75 to-indigo-900/70",
    categories: ["Musik"],
  },
  {
    id: "musik-2",
    label: "Studio",
    imageUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-violet-600/85 via-fuchsia-700/75 to-black/70",
    categories: ["Musik"],
  },
  {
    id: "musik-3",
    label: "DJ",
    imageUrl:
      "https://images.unsplash.com/photo-1571266028245-e68f8570c9e8?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-fuchsia-500/85 via-purple-600/75 to-slate-900/70",
    categories: ["Musik"],
  },
  {
    id: "musik-4",
    label: "Konzert",
    imageUrl:
      "https://images.unsplash.com/photo-1459747816165-9bf043268e97?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-rose-600/85 via-red-700/75 to-zinc-900/70",
    categories: ["Musik"],
  },
  {
    id: "creator-1",
    label: "Creator Space",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-orange-500/85 via-amber-600/75 to-rose-800/70",
    categories: ["Creator"],
  },
  {
    id: "creator-2",
    label: "Content",
    imageUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-amber-500/85 via-orange-600/75 to-stone-900/70",
    categories: ["Creator"],
  },
  {
    id: "creator-3",
    label: "Kamera",
    imageUrl:
      "https://images.unsplash.com/photo-1478737270239-2f02e77f8787?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-stone-600/85 via-neutral-700/75 to-black/70",
    categories: ["Creator"],
  },
  {
    id: "creator-4",
    label: "Brand",
    imageUrl:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-teal-500/85 via-emerald-600/75 to-cyan-900/70",
    categories: ["Creator"],
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
  {
    id: "general-3",
    label: "UNZE Connect",
    imageUrl:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-emerald-500/90 via-unze-green to-teal-800/75",
    categories: ["Allgemein"],
  },
  {
    id: "general-4",
    label: "Community Hub",
    imageUrl:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-green-600/85 via-emerald-700/75 to-teal-900/70",
    categories: ["Allgemein"],
  },
  {
    id: "general-5",
    label: "Willkommen",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-teal-500/90 via-cyan-600/80 to-emerald-800/75",
    categories: ["Allgemein"],
  },
];

const presetById = new Map(BANNER_PRESETS.map((p) => [p.id, p]));

export function getBannerPresetById(id: string | null | undefined): BannerPreset | null {
  if (!id) return null;
  return presetById.get(id) ?? null;
}

export function normalizeBannerCategory(category: string): string {
  return category;
}

export function getDefaultBannerPresetForCategory(category: string): BannerPreset {
  const forCategory = BANNER_PRESETS.find((p) => p.categories.includes(category));
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
