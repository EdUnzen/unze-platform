/**
 * Environment-Validierung — docs/setup/ENVIRONMENT_SECRETS_SYSTEM.md
 */

export type SupabaseEnvIssue = {
  ok: false;
  message: string;
  hint: string;
};

export type SupabaseEnvResult = { ok: true } | SupabaseEnvIssue;

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
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
        "Kopiere den vollständigen Publishable Key (anon) aus Supabase → Project Settings → API. Kein ... am Ende.",
    };
  }

  if (!url.startsWith("https://") || !url.includes("supabase.co")) {
    return {
      ok: false,
      message: "NEXT_PUBLIC_SUPABASE_URL ist ungültig",
      hint: "Format: https://<project-ref>.supabase.co",
    };
  }

  const jwtParts = key.split(".");
  if (jwtParts.length !== 3 || !key.startsWith("eyJ")) {
    return {
      ok: false,
      message: "NEXT_PUBLIC_SUPABASE_ANON_KEY ist kein gültiger JWT",
      hint: "Der Key muss mit eyJ beginnen und drei durch Punkte getrennte Segmente haben.",
    };
  }

  if (key.length < 150) {
    return {
      ok: false,
      message: "NEXT_PUBLIC_SUPABASE_ANON_KEY wirkt abgeschnitten",
      hint: "Der Publishable Key ist deutlich länger — vollständig aus dem Supabase Dashboard kopieren.",
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
  return readEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";
}

/** Für Logs / Health-Check — gibt Hinweis bei Invalid API key */
export function getSupabaseEnvHint(): string | null {
  const check = validateSupabaseEnv();
  if (check.ok) return null;
  return `${check.message}. ${check.hint}`;
}
