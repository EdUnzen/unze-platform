#!/usr/bin/env node
/**
 * Misst TTFB für zentrale Routen.
 * Usage: node scripts/measure-performance.mjs [baseUrl]
 */
const base =
  process.argv[2] ??
  process.env.E2E_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3002";

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/discover", label: "Discover" },
  { path: "/discover?tab=events", label: "Discover Events" },
  { path: "/profile", label: "Profil" },
  { path: "/community/rocket-league-ssl", label: "Community" },
  { path: "/community/rocket-league-ssl?tab=feed", label: "Community Feed" },
  { path: "/community/rocket-league-ssl?tab=members", label: "Community Members" },
];

async function measure(path) {
  const url = `${base.replace(/\/$/, "")}${path}`;
  const start = performance.now();
  const res = await fetch(url, { redirect: "follow" });
  const ttfb = performance.now() - start;
  return { url, status: res.status, ttfbMs: Math.round(ttfb) };
}

async function main() {
  console.log(`\n=== UNZE Performance (${base}) ===\n`);
  const results = [];
  for (const route of ROUTES) {
    try {
      const r = await measure(route.path);
      results.push({ ...route, ...r });
      console.log(`${r.status === 200 ? "✓" : "✗"} ${route.label}: ${r.ttfbMs} ms (HTTP ${r.status})`);
    } catch (e) {
      console.log(`✗ ${route.label}: ${e.message}`);
    }
  }
  const ok = results.filter((r) => r.status === 200);
  if (ok.length) {
    const avg = Math.round(ok.reduce((s, r) => s + r.ttfbMs, 0) / ok.length);
    console.log(`\nØ TTFB (${ok.length} OK): ${avg} ms\n`);
  }
}

main();
