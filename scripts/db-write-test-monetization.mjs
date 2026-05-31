#!/usr/bin/env node
/** DB-Schreibtest für Monetarisierungs-Tabellen (Service Role) */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = { ...process.env, ...loadEnvLocal() };
const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

console.log("\n=== UNZE DB-Schreibtest (Monetarisierung) ===\n");

const { data: comm } = await admin.from("communities").select("id").limit(1).maybeSingle();
const { data: prof } = await admin.from("profiles").select("id").limit(1).maybeSingle();

if (!comm || !prof) {
  console.error("✗ Keine Demo-Daten (communities/profiles)\n");
  process.exit(1);
}

const probeId = `evt_probe_${Date.now()}`;

const subUpsert = await admin.from("subscriptions").upsert(
  {
    user_id: prof.id,
    community_id: comm.id,
    status: "active",
    cancel_at_period_end: false,
    stripe_subscription_id: "sub_probe_test",
  },
  { onConflict: "user_id,community_id" },
);
console.log(
  subUpsert.error
    ? `✗ subscriptions upsert: ${subUpsert.error.message}`
    : "✓ subscriptions upsert (cancel_at_period_end)",
);

const payInsert = await admin.from("community_payments").insert({
  user_id: prof.id,
  community_id: comm.id,
  amount_cents: 100,
  status: "pending",
  stripe_checkout_session_id: "cs_probe_test",
});
console.log(
  payInsert.error
    ? `✗ community_payments insert: ${payInsert.error.message}`
    : "✓ community_payments insert",
);

const whInsert = await admin.from("stripe_webhook_events").upsert({
  event_id: probeId,
  event_type: "test.probe",
});
console.log(
  whInsert.error
    ? `✗ stripe_webhook_events upsert: ${whInsert.error.message}`
    : "✓ stripe_webhook_events upsert",
);

const priceUpdate = await admin
  .from("communities")
  .update({ price_monthly_cents: 999, stripe_price_monthly_id: "price_probe" })
  .eq("id", comm.id);
console.log(
  priceUpdate.error
    ? `✗ communities price update: ${priceUpdate.error.message}`
    : "✓ communities price_monthly_cents / stripe_price_monthly_id",
);

await admin.from("subscriptions").delete().eq("stripe_subscription_id", "sub_probe_test");
await admin.from("community_payments").delete().eq("stripe_checkout_session_id", "cs_probe_test");
await admin.from("stripe_webhook_events").delete().eq("event_id", probeId);
await admin
  .from("communities")
  .update({ price_monthly_cents: null, stripe_price_monthly_id: null })
  .eq("id", comm.id);

const failed =
  subUpsert.error || payInsert.error || whInsert.error || priceUpdate.error;
console.log(failed ? "\n✗ Schreibtest fehlgeschlagen\n" : "\n✓ Schreibtest bestanden\n");
process.exit(failed ? 1 : 0);
