/** Deterministische Visual-Varianten aus Slugs/IDs — konsistent, kein Zufalls-Chaos */

export function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickVariant(seed: string, count: number): number {
  if (count <= 1) return 0;
  return hashString(seed) % count;
}

export const AVATAR_GRADIENTS = [
  "from-emerald-400 via-unze-green to-teal-700",
  "from-teal-400 via-cyan-500 to-blue-600",
  "from-violet-400 via-purple-500 to-indigo-700",
  "from-rose-400 via-pink-500 to-fuchsia-700",
  "from-amber-400 via-orange-500 to-red-600",
  "from-lime-400 via-unze-green to-emerald-700",
  "from-sky-400 via-blue-500 to-indigo-600",
  "from-fuchsia-400 via-violet-500 to-purple-700",
] as const;

export type PatternVariant = "network" | "orbit" | "mesh" | "cluster";

export const PATTERN_VARIANTS: PatternVariant[] = [
  "network",
  "orbit",
  "mesh",
  "cluster",
];

export function avatarGradientForSeed(seed: string): string {
  return AVATAR_GRADIENTS[pickVariant(seed, AVATAR_GRADIENTS.length)];
}

export function patternVariantForSeed(seed: string): PatternVariant {
  return PATTERN_VARIANTS[pickVariant(seed, PATTERN_VARIANTS.length)];
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
}
