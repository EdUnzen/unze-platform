/**
 * Environment-Validierung — docs/setup/ENVIRONMENT_SECRETS_SYSTEM.md
 *
 * Supabase API Keys (Stand 2025/26):
 * - Legacy anon JWT: eyJ… (3 Segmente, ~200+ Zeichen)
 * - Neuer Publishable Key: sb_publishable_… (~40+ Zeichen)
 * Beide werden von @supabase/supabase-js als apikey akzeptiert.
 */

export type SupabaseEnvIssue = {
  ok: false;
  message: string;
  hint: string;
};

export type SupabaseEnvResult = { ok: true } | SupabaseEnvIssue;

export type SupabaseAnonKeyFormat = "legacy_jwt" | "publishable";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/** Erkennt gültiges Supabase-Anon-/Publishable-Key-Format (ohne Netzwerk-Test) */
export function detectSupabaseAnonKeyFormat(key: string): SupabaseAnonKeyFormat | null {
  const k = key.trim();
  if (!k || /\.{2,}/.test(k) || k.includes("your-anon-key")) return null;

  if (k.startsWith("sb_publishable_") && k.length >= 30) {
    return "publishable";
  }

  const parts = k.split(".");
  if (parts.length === 3 && k.startsWith("eyJ") && k.length >= 150) {
    return "legacy_jwt";
  }

  return null;
}

/** Prüft URL + Anon Key auf offensichtliche Konfigurationsfehler */
export function validateSupabaseEnv(): SupabaseEnvResult {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !key) {
    return {
      ok: false,
      message: "Supabase-Umgebungsvariablen fehlen",
      hint: "Trage NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local ein.",
    };
  }

  if (/\.{2,}/.test(key) || key.includes("your-anon-key")) {
    return {
      ok: false,
      message: "NEXT_PUBLIC_SUPABASE_ANON_KEY ist unvollständig oder ein Platzhalter",
      hint:
        "Kopiere den vollständigen Key aus Supabase → Project Settings → API (JWT oder Publishable). Kein ... am Ende.",
    };
  }

  if (!url.startsWith("https://") || !url.includes("supabase.co")) {
    return {
      ok: false,
      message: "NEXT_PUBLIC_SUPABASE_URL ist ungültig",
      hint: "Format: https://<project-ref>.supabase.co",
    };
  }

  const format = detectSupabaseAnonKeyFormat(key);
  if (!format) {
    const looksTruncatedJwt = key.startsWith("eyJ") && key.length < 150;
    const looksTruncatedPublishable =
      key.startsWith("sb_publishable_") && key.length < 30;

    if (looksTruncatedJwt || looksTruncatedPublishable) {
      return {
        ok: false,
        message: "NEXT_PUBLIC_SUPABASE_ANON_KEY wirkt abgeschnitten",
        hint: "Den vollständigen Key aus dem Supabase Dashboard kopieren (ohne Leerzeichen/Zeilenumbruch).",
      };
    }

    return {
      ok: false,
      message: "NEXT_PUBLIC_SUPABASE_ANON_KEY hat ein unbekanntes Format",
      hint:
        "Erlaubt: Legacy anon JWT (eyJ…, 3 Segmente) oder Publishable Key (sb_publishable_…) aus Supabase → API.",
    };
  }

  return { ok: true };
}

export function isSupabaseConfigured(): boolean {
  return validateSupabaseEnv().ok;
}

export function getSupabaseUrl(): string {
  const check = validateSupabaseEnv();
  if (!check.ok) throw new Error(check.message);

  return readEnv("NEXT_PUBLIC_SUPABASE_URL")!;
}

export function getSupabaseAnonKey(): string {
  const check = validateSupabaseEnv();
  if (!check.ok) throw new Error(check.message);

  return readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")!;
}

export function getAppUrl(): string {
  const url = readEnv("NEXT_PUBLIC_APP_URL");
  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    return "https://www.unzeconnect.app";
  }
  return "http://localhost:3000";
}

/** Für Logs / Health-Check — gibt Hinweis bei Invalid API key */
export function getSupabaseEnvHint(): string | null {
  const check = validateSupabaseEnv();
  if (check.ok) return null;
  return `${check.message}. ${check.hint}`;
}
