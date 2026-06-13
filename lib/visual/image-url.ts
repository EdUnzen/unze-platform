/** Gültige http(s)-Bild-URL — leere oder kaputte Werte werden ignoriert */
export function isUsableImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
