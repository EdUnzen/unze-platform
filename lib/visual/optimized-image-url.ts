/**
 * Supabase Storage Render-URLs für Listen-Thumbnails (WebP, resized).
 * Keine Originalbilder in Cards/Feeds.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  width = 480,
  quality = 75,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname.includes("/storage/v1/object/public/")
    ) {
      const renderPath = parsed.pathname.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/",
      );
      return `${parsed.origin}${renderPath}?width=${width}&quality=${quality}&resize=cover`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

/** Kleine Vorschaubilder für Event-/Community-Listen */
export function getListThumbnailUrl(url: string | null | undefined): string | null {
  return getOptimizedImageUrl(url, 320, 70);
}

/** Hero-/Detail-Ansichten */
export function getHeroImageUrl(url: string | null | undefined): string | null {
  return getOptimizedImageUrl(url, 960, 80);
}
