/**
 * Feinere Schätzungsregeln — Branche, Komplexität, Integrationsdichte.
 * Zum Testen und Kalibrieren; Faktoren erscheinen transparent im Studio.
 */

export const INDUSTRY_MULTIPLIERS: Record<string, number> = {
  "Handwerk & Bau": 1.04,
  "Logistik & Transport": 1.07,
  Dienstleistung: 1,
  "Einzelhandel & E-Commerce": 1.06,
  "Beratung & Agentur": 1.03,
  "Gesundheit & Pflege": 1.12,
  "IT & Technologie": 1.1,
  Sonstige: 1,
};

export const COMPLEXITY_KEYWORDS = [
  { pattern: /schnittstelle|integration|api|webhook/i, boost: 0.08, label: "Schnittstellen/API" },
  { pattern: /migration|bestandssystem|legacy/i, boost: 0.1, label: "Migration/Legacy" },
  { pattern: /mehrere standorte|filialen|franchise/i, boost: 0.07, label: "Multi-Standort" },
  { pattern: /dsgvo|compliance|audit|zertifiz/i, boost: 0.06, label: "Compliance" },
  { pattern: /ki|automatisi|workflow|prozess/i, boost: 0.05, label: "Automatisierung/KI" },
  { pattern: /mobile app|ios|android|pwa/i, boost: 0.09, label: "Mobile/PWA" },
] as const;

const INTEGRATION_MODULES = new Set(["integrations", "portal", "automation", "ai"]);

export function getIndustryMultiplier(industry?: string): { multiplier: number; label: string | null } {
  if (!industry) return { multiplier: 1, label: null };
  const multiplier = INDUSTRY_MULTIPLIERS[industry] ?? 1;
  if (multiplier === 1) return { multiplier: 1, label: null };
  return { multiplier, label: `Branche: ${industry}` };
}

export function scoreMessageComplexity(message?: string | null): {
  multiplier: number;
  factors: string[];
} {
  if (!message?.trim()) return { multiplier: 1, factors: [] };

  const factors: string[] = [];
  let boost = 0;

  const len = message.trim().length;
  if (len >= 400) {
    boost += 0.06;
    factors.push("Ausführliche Projektbeschreibung (+6 %)");
  } else if (len >= 200) {
    boost += 0.03;
    factors.push("Detaillierte Beschreibung (+3 %)");
  }

  for (const rule of COMPLEXITY_KEYWORDS) {
    if (rule.pattern.test(message)) {
      boost += rule.boost;
      factors.push(`${rule.label} (+${Math.round(rule.boost * 100)} %)`);
    }
  }

  const capped = Math.min(boost, 0.25);
  return { multiplier: 1 + capped, factors };
}

export function scoreIntegrationDensity(modules?: string[]): {
  multiplier: number;
  label: string | null;
} {
  if (!modules?.length) return { multiplier: 1, label: null };

  const integrationCount = modules.filter((m) => INTEGRATION_MODULES.has(m)).length;
  if (integrationCount >= 3) {
    return { multiplier: 1.1, label: "Hohe Integrationsdichte (+10 %)" };
  }
  if (integrationCount === 2) {
    return { multiplier: 1.05, label: "Mehrere Integrationen (+5 %)" };
  }
  return { multiplier: 1, label: null };
}

export function scoreModuleCount(modules?: string[]): {
  tierBoost: number;
  label: string | null;
} {
  const count = modules?.length ?? 0;
  if (count >= 8) return { tierBoost: 1, label: "Sehr viele Module (Enterprise-Nähe)" };
  if (count >= 5) return { tierBoost: 0, label: null };
  return { tierBoost: 0, label: null };
}
