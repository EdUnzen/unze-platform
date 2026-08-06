#!/usr/bin/env node
/**
 * Abschlussbericht fuer Beta-Launch Marketing.
 */
import { readFile, writeFile, mkdir, access } from "fs/promises";
import { join } from "path";
import { dirs, allRequiredOutputs, CAPTURE_ROUTES } from "./config.mjs";

const root = process.cwd();
const reportPath = join(root, "docs", "testing", "BETA_LAUNCH_MARKETING_REPORT.md");

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function loadJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

function checkMark(ok) {
  return ok ? "\u2713" : "\u2717";
}

async function main() {
  const preflight = await loadJson(join(dirs.output, "preflight-report.json"));
  const manifest = await loadJson(join(dirs.raw, "manifest.json"));
  const outputs = allRequiredOutputs();

  const marketingMode =
    preflight?.marketingMode === true ||
    manifest?.marketingMode === true;

  const rawScreens = manifest?.files?.length ?? 0;
  const hasOverlays = preflight?.results?.some((r) =>
    r.issues?.some((i) => String(i).includes("Overlay")),
  );

  const requiredOutputs = outputs.filter((o) => !o.optional);
  let assetsReady = 0;
  for (const o of requiredOutputs) {
    if (await fileExists(o.path)) {
      assetsReady++;
      continue;
    }
    if (o.path.endsWith(".webm")) {
      const gifPath = o.path.replace(/\.webm$/, ".gif");
      if (await fileExists(gifPath)) {
        assetsReady++;
      }
    }
  }
  const assetsPct = requiredOutputs.length
    ? Math.round((assetsReady / requiredOutputs.length) * 100)
    : 0;

  const routeChecks = {
    services: preflight?.results?.find((r) => r.id === "discover-services")?.ok ?? false,
    communities: preflight?.results?.find((r) => r.id === "community-gaming")?.ok ?? false,
    events: preflight?.results?.find((r) => r.id === "events-dash")?.ok ?? false,
    creatorDashboard: preflight?.results?.find((r) => r.id === "dashboard")?.ok ?? false,
  };

  const viewports = {
    mobile: manifest?.files?.some((f) => f.viewport === "mobile") ?? false,
    desktop: manifest?.files?.some((f) => f.viewport === "desktop") ?? false,
    ipad: manifest?.files?.some((f) => f.viewport === "ipad") ?? false,
  };

  const allGreen =
    marketingMode &&
    !hasOverlays &&
    Object.values(routeChecks).every(Boolean) &&
    Object.values(viewports).every(Boolean) &&
    assetsPct >= 90;

  const lines = [
    "# UNZE Beta Launch \u2014 Marketing Abschlussbericht",
    "",
    `Erstellt: ${new Date().toISOString()}`,
    "",
    "## Checkliste",
    "",
    `${checkMark(marketingMode)} Marketing-Modus aktiv`,
    `${checkMark(rawScreens > 0 && !hasOverlays)} Screenshots ohne Overlays (${rawScreens} Captures)`,
    `${checkMark(routeChecks.services)} Services funktionieren`,
    `${checkMark(routeChecks.communities)} Communities funktionieren`,
    `${checkMark(routeChecks.events)} Events funktionieren`,
    `${checkMark(routeChecks.creatorDashboard)} Creator Dashboard funktioniert`,
    `${checkMark(viewports.mobile)} Mobile Darstellung gepr\u00fcft`,
    `${checkMark(viewports.desktop)} Desktop gepr\u00fcft`,
    `${checkMark(viewports.ipad)} iPad gepr\u00fcft`,
    `${checkMark(assetsPct >= 90)} Assets ver\u00f6ffentlichungsbereit (${assetsReady}/${requiredOutputs.length}, ${assetsPct}%)`,
    "",
    "## Status",
    "",
    allGreen
      ? "**FREIGABE:** Marketing-Pipeline bereit fuer Beta-Launch."
      : "**HINWEIS:** Einige Pr\u00fcfungen ausstehend oder fehlgeschlagen. Details unten.",
    "",
  ];

  if (preflight) {
    lines.push("## Pre-Flight Routen", "");
    for (const r of preflight.results ?? []) {
      lines.push(`- ${checkMark(r.ok)} \`${r.id}\`${r.issues?.length ? ": " + r.issues.join("; ") : ""}`);
    }
    lines.push("");
  }

  lines.push("## Marketing-Assets", "");
  const assetGroups = [
    ["TikTok / Reels / Shorts", join(dirs.output, "tiktok")],
    ["Instagram Stories", join(dirs.output, "instagram", "stories")],
    ["Feature Ads", join(dirs.output, "features")],
    ["Creator Beta", join(dirs.output, "creator-beta")],
    ["Hero / Header / Presse", dirs.output],
  ];
  for (const [label, dir] of assetGroups) {
    const heroOk = await fileExists(join(dirs.output, "hero-landing.png"));
    lines.push(`- ${label}${label.includes("Hero") ? (heroOk ? " \u2713" : " \u2717") : ""}`);
  }

  lines.push("", "## Captures", "");
  lines.push(`Routen konfiguriert: ${CAPTURE_ROUTES.length}`);
  for (const f of manifest?.files ?? []) {
    lines.push(`- \`${f.id}\` (${f.viewport})`);
  }

  lines.push("", "---", "Automatisch generiert via `scripts/marketing/beta-launch-report.mjs`", "");

  await mkdir(join(root, "docs", "testing"), { recursive: true });
  await writeFile(reportPath, lines.join("\n"), "utf8");
  console.log(`\nAbschlussbericht: ${reportPath}`);
  console.log(allGreen ? "\n\u2713 Alle Checks bestanden" : "\n\u26a0 Einige Checks offen");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
