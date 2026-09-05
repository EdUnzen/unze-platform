/** Mitglieder-/Follower-Zahlen auf Karten — client-sicher, kein Server-Import */
export function formatMemberCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return count.toString();
}

/** Kompakte Zahlen für Cards — de-DE, nicht überladen */

export function formatCompactCount(value: number): string {
  if (value < 1000) return value.toLocaleString("de-DE");
  if (value < 1_000_000) {
    const k = value / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(".0", "")}k`;
  }
  const m = value / 1_000_000;
  return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(".0", "")} Mio.`;
}

export function formatWeeklyViewsLabel(count: number): string {
  return `${formatCompactCount(count)} Aufrufe diese Woche`;
}

export function formatShareCountLabel(count: number): string {
  return `${formatCompactCount(count)}× geteilt`;
}

export function formatNetworkFollowLabel(count: number): string {
  if (count === 1) return "1 aus deinem Netzwerk folgt";
  return `${count} aus deinem Netzwerk folgen`;
}
