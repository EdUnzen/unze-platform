#!/usr/bin/env node
import { readFileSync } from "fs";
import pg from "pg";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t[0] === "#") continue;
  const i = t.indexOf("=");
  if (i < 0) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const ref = env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1];
const conn = `postgresql://postgres:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@db.${ref}.supabase.co:5432/postgres`;

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });
await client.connect();

const current = await client.query(`
  SELECT setconfig FROM pg_db_role_setting
  WHERE setrole = 'authenticator'::regrole
`);
console.log("Current authenticator config:", current.rows);

const sql = `
  GRANT USAGE ON SCHEMA business TO anon, authenticated, service_role;
  GRANT USAGE ON SCHEMA studio TO anon, authenticated, service_role;
  GRANT USAGE ON SCHEMA studio_auth TO anon, authenticated, service_role;

  GRANT ALL ON ALL TABLES IN SCHEMA business TO service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA studio TO service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA studio_auth TO service_role;

  GRANT ALL ON ALL SEQUENCES IN SCHEMA business TO service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA studio TO service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA studio_auth TO service_role;

  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA business TO service_role;

  ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, business, studio, studio_auth';
  NOTIFY pgrst, 'reload config';
  NOTIFY pgrst, 'reload schema';
`;

await client.query(sql);
console.log("✓ Schemas exposed via pgrst.db_schemas");

const after = await client.query(`
  SELECT setconfig FROM pg_db_role_setting
  WHERE setrole = 'authenticator'::regrole
`);
console.log("Updated config:", after.rows);

await client.end();
