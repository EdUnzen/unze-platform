/** URL-freundlichen Slug aus Titel erzeugen */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function isValidCommunitySlug(slug: string): boolean {
  return /^[a-z0-9-]{3,60}$/.test(slug);
}

export function isValidGroupSlug(slug: string): boolean {
  return /^[a-z0-9-]{2,40}$/.test(slug);
}

export function parseTagsInput(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);
}
