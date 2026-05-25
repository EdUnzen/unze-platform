#!/usr/bin/env node
/** Erzeugt database/BUNDLE_all_migrations.sql aus database/migrations/ */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const migDir = join(root, "database", "migrations");
const order = [
  "001_initial_schema.sql",
  "002_rls_policies.sql",
  "004_community_groups_discover.sql",
  "005_dashboard_member_access.sql",
  "006_community_access_governance.sql",
  "007_invite_links_approval.sql",
  "008_community_lifecycle.sql",
  "009_join_approval_modes.sql",
  "010_platform_governance.sql",
  "011_storage_proofs.sql",
  "012_verification_system.sql",
  "013_platform_events.sql",
  "014_platform_integrity.sql",
];

const parts = [
  "-- UNZE: Alle Migrationen gebündelt\n-- Im Supabase SQL Editor ausführen (einmalig)\n",
];

for (const file of order) {
  const path = join(migDir, file);
  parts.push(`\n-- ========== ${file} ==========\n`);
  parts.push(readFileSync(path, "utf8"));
  parts.push("\n");
}

const out = join(root, "database", "BUNDLE_all_migrations.sql");
writeFileSync(out, parts.join(""), "utf8");
console.log(`✓ ${out} (${order.length} Migrationen)`);
