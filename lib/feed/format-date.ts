export function formatFeedRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Gerade eben";
  if (diffHours < 24) return `Vor ${diffHours} Std.`;
  if (diffHours < 48) return "Gestern";
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  });
}
