#!/usr/bin/env node
/** Erzeugt database/parts/part1-3.sql für schrittweisen SQL-Editor-Import */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const root = process.cwd();
const bundle = join(root, "database", "BUNDLE_all_migrations.sql");
if (!existsSync(bundle)) {
  console.error("Zuerst: npm run db:bundle");
  process.exit(1);
}

const content = readFileSync(bundle, "utf8");
const sections = content.split(/^-- ========== /m).filter(Boolean);

const partsDir = join(root, "database", "parts");
mkdirSync(partsDir, { recursive: true });

const chunks = [[], [], []];
sections.forEach((sec, i) => {
  chunks[Math.min(Math.floor((i / sections.length) * 3), 2)].push(
    "-- ========== " + sec,
  );
});

chunks.forEach((chunk, i) => {
  const out = join(partsDir, `part${i + 1}.sql`);
  writeFileSync(
    out,
    `-- UNZE Migration Part ${i + 1}/3\n-- Nacheinander part1 → part2 → part3 ausführen\n\n${chunk.join("\n")}`,
    "utf8",
  );
  console.log(`✓ ${out}`);
});
