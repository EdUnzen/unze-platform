import type { ProjectInquiryAnswers } from "@/lib/business/inquiry-email";
import {
  getIndustryMultiplier,
  scoreIntegrationDensity,
  scoreMessageComplexity,
} from "@/lib/business/estimate-rules";
import {
  formatEuroCents,
  formatEuroRange,
  parseGermanEuroToCents,
} from "@/lib/business/pricing-utils";
import {
  INFRASTRUCTURE_ADDON_CENTS,
  INFRASTRUCTURE_LABELS,
  TIER_BUNDLED_INFRASTRUCTURE,
} from "@/lib/constants/business-pricing-estimate-config";
import { PRICING_DISCLAIMER, BUSINESS_PRICING } from "@/lib/constants/business-pricing";
import { INQUIRY_MODULES, projectTierToIndex } from "@/lib/constants/business-inquiry-config";
import { computeMastermind, type MastermindResult } from "@/lib/business/pricing-mastermind.service";

export type EstimateLineItem = {
  label: string;
  amountCents: number;
};

export type ProjectEstimate = {
  minCents: number;
  maxCents: number;
  suggestedCents: number;
  baseCategory: string;
  baseTier: string;
  lineItems: EstimateLineItem[];
  factors: string[];
  disclaimer: string;
  calculatedAt: string;
  /** Studio-intern — Stunden & effektive Rate */
  mastermind?: MastermindResult;
};

const MODULE_ADDON_CENTS: Record<string, number> = {
  dashboard: 0,
  customers: 89000,
  quotes: 89000,
  documents: 89000,
  calendar: 149000,
  employees: 199000,
  automation: 199000,
  ai: 199000,
  integrations: 89000,
  portal: 249000,
};

const BUDGET_RANGES_CENTS: Record<string, { min: number; max: number }> = {
  under_3k: { min: 50000, max: 300000 },
  "3k_10k": { min: 300000, max: 1000000 },
  "10k_25k": { min: 1000000, max: 2500000 },
  "25k_50k": { min: 2500000, max: 5000000 },
  over_50k: { min: 5000000, max: 15000000 },
  flexible: { min: 0, max: Number.MAX_SAFE_INTEGER },
};

const TIMELINE_MULTIPLIER: Record<string, number> = {
  asap: 1.15,
  "1_3m": 1.05,
  "3_6m": 1,
  "6m_plus": 0.95,
  flexible: 1,
};

function tierIndexFromModules(moduleCount: number, defaultIndex: number): number {
  if (moduleCount >= 6) return 2;
  if (moduleCount >= 3) return Math.max(defaultIndex, 1);
  return defaultIndex;
}

function resolveProjectMapping(answers: ProjectInquiryAnswers): {
  categoryId: string;
  tierIndex: number;
} {
  const moduleCount = answers.modules?.length ?? 0;
  const chosenTier = answers.projectTier ? projectTierToIndex(answers.projectTier) : null;

  if (answers.projectType === "website") {
    if (answers.websiteScope === "landing") {
      return {
        categoryId: "landingpages",
        tierIndex: chosenTier ?? 0,
      };
    }
    if (answers.websiteScope === "shop") {
      return {
        categoryId: "websites",
        tierIndex: Math.max(chosenTier ?? 2, 2),
      };
    }
    if (answers.websiteScope === "redesign") {
      return {
        categoryId: "websites",
        tierIndex: chosenTier ?? Math.max(1, tierIndexFromModules(moduleCount, 1)),
      };
    }
    return {
      categoryId: "websites",
      tierIndex: chosenTier ?? tierIndexFromModules(moduleCount, 0),
    };
  }

  const defaults: Record<string, { categoryId: string; defaultTierIndex: number }> = {
    analysis: { categoryId: "modules", defaultTierIndex: 0 },
    business_core: { categoryId: "business-core", defaultTierIndex: 1 },
    webapp: { categoryId: "webapps", defaultTierIndex: 0 },
    ai: { categoryId: "modules", defaultTierIndex: 1 },
    industry: { categoryId: "business-core", defaultTierIndex: 2 },
    service: { categoryId: "service", defaultTierIndex: 0 },
    other: { categoryId: "websites", defaultTierIndex: 0 },
  };

  const mapping = defaults[answers.projectType] ?? defaults.other;
  return {
    categoryId: mapping.categoryId,
    tierIndex: chosenTier ?? tierIndexFromModules(moduleCount, mapping.defaultTierIndex),
  };
}

function getCategoryTierPriceCents(
  categoryId: string,
  tierIndex: number,
): {
  categoryTitle: string;
  tierName: string;
  cents: number;
  isMonthly: boolean;
} {
  const category = BUSINESS_PRICING.find((c) => c.id === categoryId);
  if (!category) {
    return { categoryTitle: "Projekt", tierName: "Basis", cents: 299000, isMonthly: false };
  }
  const tier = category.tiers[Math.min(tierIndex, category.tiers.length - 1)];
  const isMonthly = Boolean(tier.period);
  return {
    categoryTitle: category.title,
    tierName: tier.name,
    cents: parseGermanEuroToCents(tier.price),
    isMonthly,
  };
}

function applyInfrastructurePricing(
  lineItems: EstimateLineItem[],
  factors: string[],
  categoryId: string,
  tierIndex: number,
  selected: string[] | undefined,
): void {
  const picked = new Set(selected ?? []);
  const bundled = TIER_BUNDLED_INFRASTRUCTURE[categoryId]?.[tierIndex] ?? [];

  for (const key of bundled) {
    if (picked.has(key)) continue;
    const credit = INFRASTRUCTURE_ADDON_CENTS[key];
    if (!credit) continue;
    const label = INFRASTRUCTURE_LABELS[key] ?? key;
    lineItems.push({
      label: `Gutschrift: ${label} (nicht benötigt)`,
      amountCents: -credit,
    });
    factors.push(`${label} entfällt (−${formatEuroCents(credit)})`);
  }

  for (const key of picked) {
    if (bundled.includes(key)) continue;
    const addon = INFRASTRUCTURE_ADDON_CENTS[key];
    if (!addon) continue;
    const label = INFRASTRUCTURE_LABELS[key] ?? key;
    lineItems.push({ label: `Zusatz: ${label}`, amountCents: addon });
    factors.push(`Zusatz: ${label} (+${formatEuroCents(addon)})`);
  }
}

export function calculateProjectEstimate(
  answers: ProjectInquiryAnswers,
  options?: { message?: string | null },
): ProjectEstimate {
  const { categoryId, tierIndex } = resolveProjectMapping(answers);
  const base = getCategoryTierPriceCents(categoryId, tierIndex);

  const lineItems: EstimateLineItem[] = [
    {
      label: `${base.categoryTitle} — ${base.tierName}${base.isMonthly ? " (monatl.)" : ""}`,
      amountCents: base.cents,
    },
  ];

  const factors: string[] = [`Basis: ${base.categoryTitle} (${base.tierName})`];

  if (answers.websiteScope === "landing" && answers.projectType === "website") {
    factors.push("Website-Umfang: Landingpage → Landing-Kategorie");
  }

  if (answers.projectType === "ai" && categoryId === "modules") {
    const webappBase = getCategoryTierPriceCents("webapps", 0);
    lineItems.unshift({
      label: `${webappBase.categoryTitle} — ${webappBase.tierName} (Plattform-Basis)`,
      amountCents: webappBase.cents,
    });
    factors.push("KI-Projekt: Web-App-Basis ergänzt");
  }

  for (const mod of answers.modules ?? []) {
    const addon = MODULE_ADDON_CENTS[mod] ?? 89000;
    if (addon <= 0) continue;
    const label = INQUIRY_MODULES.find((m) => m.value === mod)?.label ?? mod;
    lineItems.push({ label: `Modul: ${label}`, amountCents: addon });
    factors.push(`Modul: ${label}`);
  }

  applyInfrastructurePricing(lineItems, factors, categoryId, tierIndex, answers.infrastructure);

  let subtotalCents = lineItems.reduce((sum, item) => sum + item.amountCents, 0);
  const categoryFloor = BUSINESS_PRICING.find((c) => c.id === categoryId);
  const tierFloor = categoryFloor?.tiers[tierIndex];
  if (tierFloor) {
    const floorCents = parseGermanEuroToCents(tierFloor.price);
    if (subtotalCents < floorCents) {
      factors.push(`Mindestpreis Stufe ${tierFloor.name} (${formatEuroCents(floorCents)})`);
      subtotalCents = floorCents;
    }
  }

  const industry = getIndustryMultiplier(answers.industry);
  if (industry.multiplier !== 1) {
    const before = subtotalCents;
    subtotalCents = Math.round(subtotalCents * industry.multiplier);
    factors.push(
      `${industry.label} ×${industry.multiplier.toFixed(2)} (${formatEuroCents(before)} → ${formatEuroCents(subtotalCents)})`,
    );
  }

  const complexity = scoreMessageComplexity(options?.message);
  if (complexity.multiplier !== 1) {
    const before = subtotalCents;
    subtotalCents = Math.round(subtotalCents * complexity.multiplier);
    factors.push(...complexity.factors);
    factors.push(
      `Komplexitätsfaktor ×${complexity.multiplier.toFixed(2)} (${formatEuroCents(before)} → ${formatEuroCents(subtotalCents)})`,
    );
  }

  const integration = scoreIntegrationDensity(answers.modules);
  if (integration.multiplier !== 1) {
    const before = subtotalCents;
    subtotalCents = Math.round(subtotalCents * integration.multiplier);
    factors.push(
      `${integration.label} (${formatEuroCents(before)} → ${formatEuroCents(subtotalCents)})`,
    );
  }

  const timelineMult = TIMELINE_MULTIPLIER[answers.timeline ?? "flexible"] ?? 1;
  if (timelineMult !== 1) {
    const before = subtotalCents;
    subtotalCents = Math.round(subtotalCents * timelineMult);
    factors.push(
      `Zeitrahmen-Faktor ×${timelineMult.toFixed(2)} (${formatEuroCents(before)} → ${formatEuroCents(subtotalCents)})`,
    );
  }

  const budgetRange = BUDGET_RANGES_CENTS[answers.budget ?? "flexible"] ?? BUDGET_RANGES_CENTS.flexible;
  let suggestedCents = subtotalCents;
  if (budgetRange.max < Number.MAX_SAFE_INTEGER) {
    suggestedCents = Math.min(Math.max(subtotalCents, budgetRange.min), budgetRange.max);
    if (suggestedCents !== subtotalCents) {
      factors.push(`An Kunden-Budget angepasst (${formatEuroRange(budgetRange.min, budgetRange.max)})`);
    }
  }

  const spread = Math.round(suggestedCents * 0.12);
  let minCents = Math.max(Math.round(suggestedCents - spread), budgetRange.min || 0);
  let maxCents = Math.min(Math.round(suggestedCents + spread), budgetRange.max);

  if (minCents > maxCents) {
    minCents = suggestedCents;
    maxCents = suggestedCents;
  }

  return {
    minCents,
    maxCents,
    suggestedCents,
    baseCategory: base.categoryTitle,
    baseTier: base.tierName,
    lineItems,
    factors,
    disclaimer: PRICING_DISCLAIMER,
    calculatedAt: new Date().toISOString(),
    mastermind: computeMastermind(answers, suggestedCents),
  };
}

export function formatEstimateSummary(estimate: ProjectEstimate): string {
  return [
    `Grobschätzung: ${formatEuroRange(estimate.minCents, estimate.maxCents)}`,
    `Empfohlen (Mitte): ${formatEuroCents(estimate.suggestedCents)}`,
    `Basis: ${estimate.baseCategory} — ${estimate.baseTier}`,
  ].join("\n");
}
