#!/usr/bin/env node
/**
 * Prüft Stripe-Konfiguration (Testmodus) und API-Erreichbarkeit.
 * Usage: npm run check:stripe
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

function checkKey(name, value, pattern) {
  if (!value || value.includes("your-") || value.includes("paste")) {
    return { ok: false, msg: "fehlt oder Platzhalter" };
  }
  if (pattern && !pattern.test(value)) {
    return { ok: false, msg: `Format ungültig (erwartet ${pattern})` };
  }
  return { ok: true, msg: "gesetzt" };
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env };
  console.log("\n=== UNZE Stripe Config Check ===\n");

  let failed = 0;

  const secret = checkKey("STRIPE_SECRET_KEY", env.STRIPE_SECRET_KEY, /^sk_test_/);
  const publishable = checkKey(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    /^pk_test_/,
  );
  const webhook = checkKey("STRIPE_WEBHOOK_SECRET", env.STRIPE_WEBHOOK_SECRET, /^whsec_/);
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

  console.log(
    secret.ok ? `✓ STRIPE_SECRET_KEY (${secret.msg})` : `✗ STRIPE_SECRET_KEY — ${secret.msg}`,
  );
  console.log(
    publishable.ok
      ? `✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (${publishable.msg})`
      : `✗ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — ${publishable.msg}`,
  );
  console.log(
    webhook.ok
      ? `✓ STRIPE_WEBHOOK_SECRET (${webhook.msg})`
      : `✗ STRIPE_WEBHOOK_SECRET — ${webhook.msg}`,
  );
  console.log(`  NEXT_PUBLIC_APP_URL: ${appUrl}`);
  console.log(`  Webhook-Endpoint:    ${appUrl}/api/stripe/webhook`);

  if (!secret.ok || !webhook.ok) failed++;

  if (secret.ok) {
    console.log("\n--- Stripe API Probe ---\n");
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(env.STRIPE_SECRET_KEY);
      const account = await stripe.accounts.retrieve();
      console.log(`✓ API erreichbar — Modus: ${account.id ? "Connect/Platform" : "Standard"}`);
      console.log(`  Livemode: ${account.charges_enabled !== undefined ? "Connect-Konto" : "—"}`);

      const products = await stripe.products.list({ limit: 1 });
      console.log(`✓ Products API (${products.data.length >= 0 ? "OK" : "—"})`);

      const configs = await stripe.billingPortal.configurations.list({ limit: 1 });
      if (configs.data.length > 0) {
        console.log("✓ Customer Portal konfiguriert");
      } else {
        console.log("✗ Customer Portal — keine Configuration in Stripe Dashboard");
        console.log("  → Settings → Billing → Customer portal → aktivieren");
        failed++;
      }
    } catch (err) {
      console.log(`✗ Stripe API Fehler: ${err.message}`);
      failed++;
    }
  } else {
    console.log("\n--- Stripe API Probe übersprungen (Secret Key fehlt) ---\n");
    console.log("  Stripe Dashboard → Developers → API keys → Testmodus");
    console.log("  sk_test_… → STRIPE_SECRET_KEY");
    console.log("  pk_test_… → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
    console.log("  Webhook: stripe listen --forward-to localhost:3002/api/stripe/webhook");
    console.log("  whsec_… → STRIPE_WEBHOOK_SECRET\n");
  }

  console.log("");
  if (failed) {
    console.error(`✗ ${failed} Stripe-Prüfung(en) fehlgeschlagen\n`);
    process.exit(1);
  }
  console.log("✓ Stripe-Konfiguration OK\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
