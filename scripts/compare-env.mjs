import { existsSync, readFileSync } from "fs";

function parse(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

const local = parse(".env.local");
const vercel = parse(".env.vercel.production");
const keys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
];

for (const k of keys) {
  const l = local[k] ?? "";
  const v = vercel[k] ?? "";
  console.log(`${k}:`);
  console.log(`  local:  ${l ? `set (len=${l.length})` : "MISSING"}`);
  console.log(`  vercel: ${v ? `set (len=${v.length})` : "MISSING"}`);
  console.log(`  match:  ${l === v}`);
  if (k.includes("URL")) {
    const ref = (s) => s.match(/https:\/\/([^.]+)/)?.[1] ?? "?";
    if (l) console.log(`  local ref:  ${ref(l)}`);
    if (v) console.log(`  vercel ref: ${ref(v)}`);
  }
  if (k.includes("ANON") && v) {
    console.log(`  vercel format: ${v.startsWith("eyJ") ? "JWT" : v.startsWith("sb_publishable_") ? "sb_publishable" : "unknown"}`);
  }
}
