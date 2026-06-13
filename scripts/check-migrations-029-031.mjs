#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const env = { ...process.env };
  for (const f of [join(root, ".env.local"), join(root, ".env.vercel")]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      if (!env[k]) env[k] = t.slice(i + 1).trim();
    }
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const match = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(/https:\/\/([^.]+)\.supabase\.co/);
  const password = env.SUPABASE_DB_PASSWORD;
  if (!password || !match) {
    console.error("✗ SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL erforderlich");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${match[1]}.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const checks = [
    {
      name: "029 community_member_removal_tasks",
      sql: "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_member_removal_tasks') AS ok",
    },
    {
      name: "030 is_community_member deleted_at",
      sql: "SELECT prosrc LIKE '%deleted_at IS NULL%' AS ok FROM pg_proc WHERE proname = 'is_community_member'",
    },
    {
      name: "031 event_tickets",
      sql: "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_tickets') AS ok",
    },
    {
      name: "031 check_in_event_ticket RPC",
      sql: "SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_in_event_ticket') AS ok",
    },
  ];

  let allOk = true;
  for (const { name, sql } of checks) {
    const { rows } = await client.query(sql);
    const ok = rows[0]?.ok === true || rows[0]?.ok === "t";
    console.log(`${ok ? "✓" : "✗"} ${name}`);
    if (!ok) allOk = false;
  }

  await client.end();
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
