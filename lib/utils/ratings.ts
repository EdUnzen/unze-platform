/** Bewertungen nur anzeigen, wenn mindestens eine existiert. */
export function hasReviews(reviewCount: number | undefined | null): boolean {
  return (reviewCount ?? 0) > 0;
}

/** Durchschnitt aus geladenen Bewertungen (für konsistente Panel-Anzeige). */
export function averageRatingFromValues(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, value) => acc + value, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
