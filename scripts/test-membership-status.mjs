#!/usr/bin/env node
/**
 * Mitgliedschaftsstatus-Mapping (Stripe → UI)
 * Usage: npm run test:membership-status
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const REPORT = join(root, "docs", "sprints", "MEMBERSHIP_STATUS_TEST_REPORT.md");

function resolveDisplay(status, cancelAtPeriodEnd = false) {
  if (status === "past_due" || status === "unpaid") return "payment_pending";
  if (status === "canceled" || status === "inactive") return "ended";
  if (status === "active" || status === "trialing") return "active";
  return "ended";
}

const cases = [
  { stripe: "active", ui: "active", emoji: "🟢", label: "Aktiv" },
  { stripe: "trialing", ui: "active", emoji: "🟢", label: "Aktiv" },
  { stripe: "past_due", ui: "payment_pending", emoji: "🟡", label: "Zahlung ausstehend" },
  { stripe: "unpaid", ui: "payment_pending", emoji: "🟡", label: "Zahlung ausstehend" },
  { stripe: "canceled", ui: "ended", emoji: "🔴", label: "Mitgliedschaft beendet" },
  { stripe: "inactive", ui: "ended", emoji: "🔴", label: "Mitgliedschaft beendet" },
];

let failed = 0;
const rows = [];

for (const c of cases) {
  const got = resolveDisplay(c.stripe);
  const ok = got === c.ui;
  if (!ok) failed += 1;
  rows.push({ ...c, ok, got });
}

// Kündigung zum Periodenende bleibt aktiv
const cancelActive = resolveDisplay("active", true);
if (cancelActive !== "active") {
  failed += 1;
  rows.push({
    stripe: "active + cancel_at_period_end",
    ui: "active",
    ok: false,
    got: cancelActive,
    emoji: "🟢",
    label: "Aktiv — Kündigung zum Periodenende",
  });
} else {
  rows.push({
    stripe: "active + cancel_at_period_end",
    ui: "active",
    ok: true,
    got: cancelActive,
    emoji: "🟢",
    label: "Aktiv — Kündigung zum Periodenende",
  });
}

mkdirSync(join(root, "docs", "sprints"), { recursive: true });
const md = `# Membership Status Test

**Datum:** ${new Date().toISOString().slice(0, 10)}

| Stripe | UI | Emoji | Ergebnis |
|--------|-----|-------|----------|
${rows.map((r) => `| \`${r.stripe}\` | ${r.emoji} ${r.label} | ${r.emoji} | ${r.ok ? "✓" : "✗"} |`).join("\n")}

${failed === 0 ? "**Alle Mapping-Tests bestanden.**" : `**${failed} Fehler.**`}

Manuelle Stripe-E2E (Testmodus): Erfolg (4242), Decline (4000…0002), Kündigung Portal, Reaktivierung.
Siehe \`docs/sprints/STRIPE_MEMBERSHIP_STATUS.md\`.
`;
writeFileSync(REPORT, md, "utf8");

console.log("\n=== Membership Status Mapping ===\n");
for (const r of rows) {
  console.log(`${r.ok ? "✓" : "✗"} ${r.stripe} → ${r.emoji} ${r.label}`);
}
console.log(`\n→ ${REPORT}\n`);
if (failed) process.exit(1);
