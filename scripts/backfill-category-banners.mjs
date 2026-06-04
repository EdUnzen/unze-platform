#!/usr/bin/env node
/**
 * Setzt banner_url für Communities ohne Bild (Kategorie-Standard).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(resolve(__dirname, "..", f), "utf8");
      for (const line of raw.split("\n")) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m && !process.env[m[1].trim()]) {
          process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      /* ignore */
    }
  }
}

const PRESETS = {
  Gaming: "https://images.unsplash.com/photo-1542751110-368ab147d270?auto=format&fit=crop&w=1200&q=80",
  Business: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  Finanzen: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  Fitness: "https://images.unsplash.com/photo-1571017023315-0ce1092a0c8e?auto=format&fit=crop&w=1200&q=80",
  Sport: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
  Technologie: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  Allgemein: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
};

function urlForCategory(category) {
  return PRESETS[category] ?? PRESETS.Allgemein;
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY erforderlich");
  process.exit(1);
}

const admin = createClient(url, key);

const { data: rows, error } = await admin
  .from("communities")
  .select("id, slug, category, banner_url")
  .or("banner_url.is.null,banner_url.eq.");

if (error) {
  console.error(error.message);
  process.exit(1);
}

let updated = 0;
for (const row of rows ?? []) {
  const bannerUrl = urlForCategory(row.category ?? "Allgemein");
  const { error: upErr } = await admin
    .from("communities")
    .update({ banner_url: bannerUrl })
    .eq("id", row.id);
  if (!upErr) {
    updated += 1;
    console.log(`✓ ${row.slug} → ${row.category}`);
  }
}

console.log(`\n${updated} Communities mit Standard-Banner aktualisiert.`);
