/** Parse German price strings from BUSINESS_PRICING (e.g. "ab 1.290 €", "49,90 €") */

export function parseGermanEuroToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.]/g, "");
  if (!cleaned) return 0;

  if (cleaned.includes(".") && cleaned.includes(",")) {
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    return Math.round(parseFloat(normalized) * 100);
  }

  if (cleaned.includes(",")) {
    return Math.round(parseFloat(cleaned.replace(",", ".")) * 100);
  }

  if (cleaned.includes(".")) {
    const parts = cleaned.split(".");
    if (parts.length === 2 && parts[1].length === 3) {
      return Math.round(parseInt(parts.join(""), 10) * 100);
    }
    return Math.round(parseFloat(cleaned) * 100);
  }

  return Math.round(parseFloat(cleaned) * 100);
}

export function formatEuroCents(cents: number, options?: { netto?: boolean }): string {
  const formatted = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
  return options?.netto ? `${formatted} netto` : formatted;
}

export function formatEuroRange(minCents: number, maxCents: number): string {
  if (minCents === maxCents) return formatEuroCents(minCents);
  return `${formatEuroCents(minCents)} – ${formatEuroCents(maxCents)}`;
}
