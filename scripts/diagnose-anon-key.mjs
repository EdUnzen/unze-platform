#!/usr/bin/env node
/** Diagnose NEXT_PUBLIC_SUPABASE_ANON_KEY — keine vollständigen Secrets ausgeben */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { validateAnonKey } from "./lib/supabase-anon-key.mjs";

const root = process.cwd();

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return { env, hasBom: raw.charCodeAt(0) === 0xfeff };
}

function analyzeKey(value) {
  if (value === undefined) return { status: "MISSING" };
  const trimmed = value.trim();
  if (!trimmed) return { status: "EMPTY", rawLen: value.length };
  const parts = trimmed.split(".");
  return {
    status: "SET",
    length: trimmed.length,
    prefix: trimmed.slice(0, 14),
    last8: trimmed.slice(-8),
    segmentCount: parts.length,
    startsEyJ: trimmed.startsWith("eyJ"),
    startsSbPublishable: trimmed.startsWith("sb_publishable_"),
    hasEllipsis: trimmed.includes("..."),
    hasPlaceholder: /paste-full|your-anon/i.test(trimmed),
    hasInnerNewline: /[\r\n]/.test(trimmed),
    wrappedInQuotesInFile: value !== trimmed,
  };
}

function validateLikeLibEnv(url, key) {
  const u = url?.trim();
  const k = key?.trim();
  if (!u || !k) return "Supabase-Umgebungsvariablen fehlen";
  if (!u.startsWith("https://") || !u.includes("supabase.co")) {
    return "NEXT_PUBLIC_SUPABASE_URL ist ungültig";
  }
  const keyCheck = validateAnonKey(k);
  if (!keyCheck.ok) return `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${keyCheck.detail}`;
  return "OK";
}

const files = [
  ".env.local",
  ".env",
  ".env.development",
  ".env.development.local",
  ".env.vercel",
];

console.log("\n=== UNZE Anon-Key Diagnose ===\n");

for (const f of files) {
  const parsed = parseEnvFile(join(root, f));
  if (!parsed) {
    console.log(`${f}: (nicht vorhanden)`);
    continue;
  }
  const k = parsed.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const u = parsed.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log(`\n--- ${f} ---`);
  console.log("  UTF-8 BOM:", parsed.hasBom ? "JA (kann Parser stören)" : "nein");
  console.log(
    "  NEXT_PUBLIC_SUPABASE_URL:",
    u ? `${u.slice(0, 28)}… (len=${u.length})` : "FEHLT",
  );
  console.log("  NEXT_PUBLIC_SUPABASE_ANON_KEY:", JSON.stringify(analyzeKey(k), null, 2));
  console.log("  → validateSupabaseEnv():", validateLikeLibEnv(u, k));
}

const local = parseEnvFile(join(root, ".env.local"));
const vercel = parseEnvFile(join(root, ".env.vercel"));

console.log("\n=== Laufzeit (Next.js Dev) ===");
console.log(
  "Next.js lädt automatisch: .env, .env.local, .env.development, .env.development.local",
);
console.log(".env.vercel wird von Next.js NICHT geladen (nur Vercel CLI Export).");
console.log(
  "Falls `vercel dev` genutzt wird, können Vercel-ENVs process.env überschreiben.",
);

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined) {
  console.log("\nprocess.env (aktueller Node-Prozess):");
  console.log(
    "  validateSupabaseEnv():",
    validateLikeLibEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  );
  console.log(
    "  Analyse:",
    JSON.stringify(analyzeKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), null, 2),
  );
} else {
  console.log("\nprocess.env.NEXT_PUBLIC_SUPABASE_ANON_KEY: nicht gesetzt (normal ohne next dev)");
}

console.log("\n=== Wahrscheinliche Ursache ===");
const keyLocal = local?.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const check = validateLikeLibEnv(local?.env.NEXT_PUBLIC_SUPABASE_URL, keyLocal);
if (check === "OK") {
  console.log(".env.local: Format OK — Fehler kommt ggf. von anderem Prozess/Deploy-ENV.");
} else if (keyLocal?.trim().startsWith("sb_publishable_")) {
  console.log(
    "Der Key in .env.local ist das NEUE Supabase-Format (sb_publishable_…).",
  );
  console.log(
    "lib/env.ts akzeptiert nur Legacy-JWT (eyJ… mit 3 Segmenten).",
  );
  console.log(
    "Im Supabase Dashboard unter API Keys den «anon / publishable» JWT (legacy) kopieren,",
  );
  console.log(
    "oder in Project Settings den «anon public» JWT — nicht nur den sb_publishable_ String.",
  );
} else if (!keyLocal?.trim()) {
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local ist LEER oder fehlt.");
  if (vercel && vercel.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "") {
    console.log(
      "Hinweis: .env.vercel enthält explizit NEXT_PUBLIC_SUPABASE_ANON_KEY=\"\" (leer).",
    );
    console.log(
      "Diese Datei überschreibt nicht .env.local bei `next dev`, kann aber zu Verwechslung führen.",
    );
  }
} else {
  console.log(`validateSupabaseEnv auf .env.local: ${check}`);
  const a = analyzeKey(keyLocal);
  if (a.startsSbPublishable) {
    console.log("→ sb_publishable_ Format");
  } else if (a.segmentCount !== 3) {
    console.log(`→ ${a.segmentCount} JWT-Segmente (erwartet: 3)`);
  } else if (!a.startsEyJ) {
    console.log(`→ Prefix "${a.prefix}" statt "eyJ"`);
  }
}

console.log("");
