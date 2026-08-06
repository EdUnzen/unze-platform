#!/usr/bin/env node
/** Sync .env.local Supabase vars → Vercel (Production + Preview) */
import { execSync, spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const PRODUCTION_APP_URL = "https://www.unzeconnect.app";
const PRODUCTION_MARKETING_URL = "https://www.unze.app";

const SYNC_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_MARKETING_URL",
];

function parseEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[trimmed.slice(0, idx).trim()] = value;
  }
  return env;
}

function run(cmd, args, input) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    input,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  return result;
}

function removeEnv(name, envName) {
  run("npx", ["vercel", "env", "rm", name, envName, "--yes"], null);
}

function addEnv(name, value, envName) {
  removeEnv(name, envName);
  const result = run(
    "npx",
    [
      "vercel",
      "env",
      "add",
      name,
      envName,
      "--value",
      value,
      "--yes",
      "--force",
    ],
    null,
  );
  if (result.status !== 0) {
    console.error(`✗ ${name} (${envName}):`, result.stderr?.trim() || result.stdout?.trim());
    process.exit(1);
  }
  console.log(`✓ ${name} → ${envName}`);
}

async function main() {
  console.log("\n=== Sync Supabase Env → Vercel ===\n");

  const local = parseEnv(join(root, ".env.local"));
  if (!local.NEXT_PUBLIC_SUPABASE_URL || !local.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("✗ .env.local fehlt oder unvollständig");
    process.exit(1);
  }

  const values = {
    NEXT_PUBLIC_SUPABASE_URL: local.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: local.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: local.SUPABASE_SERVICE_ROLE_KEY ?? "",
    NEXT_PUBLIC_APP_URL: PRODUCTION_APP_URL,
    NEXT_PUBLIC_MARKETING_URL: PRODUCTION_MARKETING_URL,
  };

  if (!values.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("✗ SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local");
    process.exit(1);
  }

  console.log(`Projekt-Ref: ${values.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1]}`);
  console.log(`APP URL:     ${values.NEXT_PUBLIC_APP_URL}\n`);

  const environments = ["production", "preview"];

  for (const key of SYNC_KEYS) {
    for (const envName of environments) {
      addEnv(key, values[key], envName);
    }
  }

  console.log("\n✓ Environment Variables gesetzt.");
  console.log("→ Starte Redeploy …\n");

  const deploy = execSync("npx vercel deploy --prod --yes", {
    cwd: root,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  const urlMatch = deploy.match(/https:\/\/[^\s]+\.vercel\.app/);
  console.log(deploy);
  if (urlMatch) {
    console.log(`\nProduction URL: ${urlMatch[0]}\n`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
