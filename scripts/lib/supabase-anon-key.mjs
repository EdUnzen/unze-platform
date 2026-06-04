/** Gleiche Regeln wie lib/env.ts — für Node-Diagnose-Skripte */

export function detectSupabaseAnonKeyFormat(key) {
  const k = (key ?? "").trim();
  if (!k || /\.{2,}/.test(k) || k.includes("your-anon-key")) return null;
  if (k.startsWith("sb_publishable_") && k.length >= 30) return "publishable";
  const parts = k.split(".");
  if (parts.length === 3 && k.startsWith("eyJ") && k.length >= 150) return "legacy_jwt";
  return null;
}

export function validateAnonKey(key) {
  if (!key?.trim()) return { ok: false, detail: "fehlt" };
  if (/\.{2,}/.test(key) || key.includes("your-anon-key")) {
    return { ok: false, detail: "unvollständig/Platzhalter" };
  }
  const format = detectSupabaseAnonKeyFormat(key);
  if (!format) {
    if (key.startsWith("eyJ") && key.length < 150) {
      return { ok: false, detail: "JWT zu kurz — abgeschnitten?" };
    }
    if (key.startsWith("sb_publishable_") && key.length < 30) {
      return { ok: false, detail: "Publishable Key zu kurz" };
    }
    return {
      ok: false,
      detail: "unbekanntes Format (erwartet eyJ… JWT oder sb_publishable_…)",
    };
  }
  return { ok: true, detail: format === "legacy_jwt" ? "Legacy JWT" : "Publishable Key" };
}
