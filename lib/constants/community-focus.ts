/** Fokus-Vorschläge je Community-Kategorie (Orientierung, keine Pflicht) */
export const FOCUS_PRESETS: Record<string, string[]> = {
  Gaming: ["Coaching", "Analyse", "Turniere", "Community"],
  Business: ["Netzwerk", "Investments", "Beratung", "Events"],
  Finanzen: ["Investments", "Netzwerk", "Finanzierung", "Marktanalyse"],
  Fitness: ["Coaching", "Ernährung", "Community", "Events"],
  Technologie: ["Mentoring", "Projekte", "Netzwerk", "Support"],
  Bildung: ["Kurse", "Mentoring", "Community", "Ressourcen"],
  Lifestyle: ["Community", "Events", "Netzwerk", "Inspiration"],
  Kreativität: ["Projekte", "Feedback", "Collabs", "Events"],
  Allgemein: ["Community", "Netzwerk", "Events", "Support"],
};

export const DEFAULT_FOCUS_OPTIONS = [
  "Coaching",
  "Community",
  "Events",
  "Netzwerk",
  "Analyse",
  "Support",
];

export function getFocusOptionsForCategory(category: string): string[] {
  return FOCUS_PRESETS[category] ?? DEFAULT_FOCUS_OPTIONS;
}
