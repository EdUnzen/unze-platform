import type { ProjectInquiryAnswers } from "@/lib/business/inquiry-email";
import { formatEuroCents } from "@/lib/business/pricing-utils";
import {
  ASPIRATION_HOURLY_CENTS,
  INTERNAL_HOURLY_RATE_CENTS,
  TARGET_EFFECTIVE_HOURLY_CENTS,
  TIER_HOUR_ESTIMATES,
  type BriefingReadiness,
} from "@/lib/constants/business-pricing-mastermind";
import { projectTierToIndex } from "@/lib/constants/business-inquiry-config";

export type MastermindResult = {
  estimatedHoursMin: number;
  estimatedHoursSuggested: number;
  estimatedHoursMax: number;
  internalHourlyRateCents: number;
  internalCostAtListRateCents: number;
  effectiveHourlyCents: number;
  targetEffectiveHourlyCents: number;
  aspirationHourlyCents: number;
  marginStatus: "good" | "ok" | "tight";
  briefingScore: number;
  briefingComplete: boolean;
  briefingFactors: string[];
  planningNotes: string[];
};

function resolveCategoryAndTier(answers: ProjectInquiryAnswers): {
  categoryId: string;
  tierIndex: number;
} {
  const tier = answers.projectTier ? projectTierToIndex(answers.projectTier) : 0;

  if (answers.projectType === "website") {
    if (answers.websiteScope === "landing") return { categoryId: "landingpages", tierIndex: tier };
    if (answers.websiteScope === "shop") return { categoryId: "websites", tierIndex: Math.max(tier, 2) };
    return { categoryId: "websites", tierIndex: tier };
  }
  if (answers.projectType === "business_core") {
    return { categoryId: "business-core", tierIndex: tier || 1 };
  }
  if (answers.projectType === "webapp") return { categoryId: "webapps", tierIndex: tier };
  if (answers.projectType === "service") return { categoryId: "service", tierIndex: tier };
  return { categoryId: "landingpages", tierIndex: tier };
}

function scoreBriefing(briefing?: BriefingReadiness): {
  score: number;
  complete: boolean;
  factors: string[];
  hourMultiplier: number;
} {
  if (!briefing) {
    return {
      score: 0,
      complete: false,
      factors: ["Briefing-Status unbekannt — Material vor Start anfordern"],
      hourMultiplier: 1.15,
    };
  }

  const checks = [
    { key: "hasLogo", label: "Logo", weight: 20 },
    { key: "hasTexts", label: "Texte", weight: 25 },
    { key: "hasImages", label: "Bilder", weight: 20 },
    { key: "hasLegalTexts", label: "Impressum/Datenschutz", weight: 15 },
    { key: "hasReference", label: "Referenz-Template", weight: 20 },
  ] as const;

  let score = 0;
  const factors: string[] = [];
  const missing: string[] = [];

  for (const check of checks) {
    if (briefing[check.key]) {
      score += check.weight;
    } else {
      missing.push(check.label);
    }
  }

  if (missing.length) {
    factors.push(`Material fehlt: ${missing.join(", ")} (+Zeit/Risiko)`);
  } else {
    factors.push("Briefing vollständig — Planung optimal (-10 % Zeit)");
  }

  const complete = missing.length === 0;
  const hourMultiplier = complete ? 0.9 : 1 + missing.length * 0.06;

  return { score, complete, factors, hourMultiplier: Math.min(hourMultiplier, 1.35) };
}

export function computeMastermind(
  answers: ProjectInquiryAnswers,
  suggestedPriceCents: number,
): MastermindResult {
  const { categoryId, tierIndex } = resolveCategoryAndTier(answers);
  const tierHours =
    TIER_HOUR_ESTIMATES[categoryId]?.[tierIndex] ??
    TIER_HOUR_ESTIMATES.landingpages[0];

  const infraCount = answers.infrastructure?.length ?? 0;
  const infraAddon = infraCount * 0.75;

  const briefing = scoreBriefing(answers.briefing);

  let minH = tierHours.min + infraAddon * 0.5;
  let sugH = tierHours.suggested + infraAddon;
  let maxH = tierHours.max + infraAddon * 1.2;

  minH *= briefing.hourMultiplier;
  sugH *= briefing.hourMultiplier;
  maxH *= briefing.hourMultiplier;

  minH = Math.round(minH * 10) / 10;
  sugH = Math.round(sugH * 10) / 10;
  maxH = Math.round(maxH * 10) / 10;

  const internalCostAtListRateCents = Math.round(sugH * INTERNAL_HOURLY_RATE_CENTS);
  const effectiveHourlyCents = sugH > 0 ? Math.round(suggestedPriceCents / sugH) : 0;

  let marginStatus: MastermindResult["marginStatus"] = "good";
  if (effectiveHourlyCents < TARGET_EFFECTIVE_HOURLY_CENTS) marginStatus = "tight";
  else if (effectiveHourlyCents < TARGET_EFFECTIVE_HOURLY_CENTS * 1.15) marginStatus = "ok";

  const planningNotes: string[] = [
    `Kategorie ${categoryId}, Stufe ${tierIndex + 1}: ${sugH} h netto (Spanne ${minH}–${maxH} h)`,
    `Interner Listenwert: ${formatEuroCents(internalCostAtListRateCents)} bei ${formatEuroCents(INTERNAL_HOURLY_RATE_CENTS)}/h`,
    `Effektiv bei Angebotspreis: ${formatEuroCents(effectiveHourlyCents)}/h (Ziel ≥ ${formatEuroCents(TARGET_EFFECTIVE_HOURLY_CENTS)}/h)`,
  ];

  if (marginStatus === "tight") {
    planningNotes.push(
      "Engpass: Briefing muss vollständig sein, Scope strikt einhalten, Korrekturen begrenzen.",
    );
  }

  if (effectiveHourlyCents >= ASPIRATION_HOURLY_CENTS) {
    planningNotes.push("Effektive Rate über Langfrist-Richtwert — Premium-Scope prüfen.");
  }

  return {
    estimatedHoursMin: minH,
    estimatedHoursSuggested: sugH,
    estimatedHoursMax: maxH,
    internalHourlyRateCents: INTERNAL_HOURLY_RATE_CENTS,
    internalCostAtListRateCents,
    effectiveHourlyCents,
    targetEffectiveHourlyCents: TARGET_EFFECTIVE_HOURLY_CENTS,
    aspirationHourlyCents: ASPIRATION_HOURLY_CENTS,
    marginStatus,
    briefingScore: briefing.score,
    briefingComplete: briefing.complete,
    briefingFactors: briefing.factors,
    planningNotes,
  };
}

const MARGIN_STATUS_LABELS: Record<MastermindResult["marginStatus"], string> = {
  good: "Gut",
  ok: "OK",
  tight: "Eng",
};

export function formatMastermindSummary(mm: MastermindResult): string {
  return [
    `Stunden (netto): ${mm.estimatedHoursMin}–${mm.estimatedHoursMax} h (Mitte ${mm.estimatedHoursSuggested} h)`,
    `Intern @ ${formatEuroCents(mm.internalHourlyRateCents)}/h: ${formatEuroCents(mm.internalCostAtListRateCents)}`,
    `Effektiv: ${formatEuroCents(mm.effectiveHourlyCents)}/h (Ziel ≥ ${formatEuroCents(mm.targetEffectiveHourlyCents)}/h)`,
    `Briefing: ${mm.briefingScore}% · ${mm.briefingComplete ? "vollständig" : "unvollständig"} · ${MARGIN_STATUS_LABELS[mm.marginStatus]}`,
    ...mm.planningNotes.map((note) => `→ ${note}`),
  ].join("\n");
}

export function formatBriefingStatusLines(
  briefing?: BriefingReadiness,
): string[] {
  return [
    `Logo:            ${briefing?.hasLogo ? "Ja" : "Nein / folgt"}`,
    `Texte:           ${briefing?.hasTexts ? "Ja" : "Nein / folgt"}`,
    `Bilder:          ${briefing?.hasImages ? "Ja" : "Nein / folgt"}`,
    `Rechtstexte:     ${briefing?.hasLegalTexts ? "Ja" : "Nein / folgt"}`,
    `Referenz:        ${briefing?.hasReference ? "Ja" : "Nein / folgt"}`,
    `Hinweise:        ${briefing?.materialNotes ?? "—"}`,
    `Dateien:         ${briefing?.uploadedFileNames?.join(", ") ?? "—"}`,
  ];
}
