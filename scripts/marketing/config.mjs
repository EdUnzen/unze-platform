import { join } from "path";

export const root = process.cwd();
export const base = process.env.E2E_BASE_URL ?? "https://unze-platform.vercel.app";
export const demoEmail = process.env.DEMO_EMAIL ?? "edubek89@icloud.com";
export const demoPassword = process.env.DEMO_PASSWORD ?? "UnzeDemo2026!";

export const dirs = {
  raw: join(root, "docs", "marketing", "raw-screens"),
  output: join(root, "docs", "marketing", "output"),
  engine: join(root, "docs", "marketing", "engine"),
  animations: join(root, "docs", "marketing", "animations"),
};

/** App-Captures fuer Marketing-Mockups */
export const CAPTURE_ROUTES = [
  { id: "home", path: "/", auth: false },
  { id: "discover", path: "/discover", auth: false },
  { id: "discover-events", path: "/discover?tab=events", auth: false },
  { id: "discover-services", path: "/discover?tab=services", auth: false },
  { id: "community-gaming", path: "/community/rocket-league-ssl", auth: false },
  { id: "community-business", path: "/community/business-circle-dach", auth: false },
  { id: "community-education", path: "/community/mathe-meister", auth: false },
  { id: "community-photo", path: "/community/lens-masters-guild", auth: false },
  { id: "community-fitness", path: "/community/fit-squad-dach", auth: false },
  { id: "community-code", path: "/community/code-craft-academy", auth: false },
  { id: "community-creator", path: "/community/creator-lounge", auth: false },
  { id: "dashboard", path: "/dashboard", auth: true },
  { id: "members", path: "/dashboard/community/rocket-league-ssl/members", auth: true },
  { id: "events-dash", path: "/dashboard/community/rocket-league-ssl/events", auth: true },
  { id: "scanner", path: "/dashboard/community/rocket-league-ssl/scanner", auth: true },
  { id: "auszeichnungen", path: "/dashboard/community/rocket-league-ssl/auszeichnungen", auth: true },
  { id: "monetization", path: "/dashboard/community/rocket-league-ssl/monetization", auth: true },
  { id: "crowd-partner", path: "/dashboard/crowd-partner", auth: true },
  { id: "profile-awards", path: "/profile/auszeichnungen", auth: true },
  { id: "profile-id", path: "/profile/id", auth: true },
  { id: "create-community", path: "/create/community", auth: true },
];

/** TikTok / Reels Story (7 Slides) - immer echte App, keine Textfolien */
export const TIKTOK_STORY = [
  {
    id: "tiktok-01-problem",
    layout: "immersive",
    screen: "members",
    message: "Discord verwaltet deine Community nicht.",
    accent: "rose",
  },
  {
    id: "tiktok-02-solution",
    layout: "immersive",
    screen: "home",
    message: "UNZE.",
    accent: "emerald",
  },
  {
    id: "tiktok-03-features",
    layout: "immersive-chips",
    screen: "discover",
    chips: ["Communities", "Gruppen", "Events", "Services", "Auszeichnungen", "Verifizierung"],
    accent: "violet",
  },
  {
    id: "tiktok-04-dashboard",
    layout: "immersive",
    screen: "dashboard",
    message: "Creator Dashboard",
    accent: "blue",
  },
  {
    id: "tiktok-05-monetization",
    layout: "immersive",
    screen: "monetization",
    message: "Monetarisierung",
    accent: "amber",
  },
  {
    id: "tiktok-06-crowd",
    layout: "immersive",
    screen: "crowd-partner",
    message: "Crowd Partner",
    accent: "cyan",
  },
  {
    id: "tiktok-07-cta",
    layout: "immersive-cta",
    screen: "create-community",
    cta: "Werde jetzt Creator der Beta.",
    accent: "emerald",
  },
];

/** Eine Botschaft pro Grafik */
export const FEATURE_ADS = [
  { id: "feat-community", screen: "community-gaming", message: "Community erstellen", accent: "emerald" },
  { id: "feat-members", screen: "members", message: "Mitglieder verwalten", accent: "blue" },
  { id: "feat-events", screen: "events-dash", message: "Events organisieren", accent: "violet" },
  { id: "feat-services", screen: "discover-services", message: "Services verkaufen", accent: "amber" },
  { id: "feat-awards", screen: "auszeichnungen", message: "Auszeichnungen vergeben", accent: "rose" },
  { id: "feat-certificates", screen: "profile-awards", message: "Zertifikate sammeln", accent: "cyan" },
  { id: "feat-monetization", screen: "monetization", message: "Monetarisierung", accent: "amber" },
  { id: "feat-crowd", screen: "crowd-partner", message: "Crowd Partner", accent: "violet" },
  { id: "feat-dashboard", screen: "dashboard", message: "Creator Dashboard", accent: "blue" },
  { id: "feat-verification", screen: "profile-id", message: "Verifizierung", accent: "emerald" },
  { id: "feat-growth", screen: "discover", message: "Community-Wachstum", accent: "emerald" },
];

/** Creator-Beta Kampagne */
export const CREATOR_CAMPAIGN = [
  {
    id: "creator-01-hook",
    layout: "immersive",
    screen: "create-community",
    message: "Werde einer der ersten Creator",
    accent: "emerald",
  },
  {
    id: "creator-02-network",
    layout: "immersive",
    screen: "discover",
    message: "Fr\u00fch starten. Netzwerk wachsen.",
    accent: "violet",
  },
  {
    id: "creator-03-crowd",
    layout: "immersive",
    screen: "crowd-partner",
    message: "Crowd Partner",
    accent: "cyan",
  },
  {
    id: "creator-04-cta",
    layout: "immersive-cta",
    screen: "create-community",
    cta: "Creator Beta \u2014 jetzt beitreten",
    accent: "emerald",
  },
];

export const SOCIAL_EXPORTS = [
  { id: "hero-landing", layout: "hero", screen: "discover", width: 1920, height: 1080 },
  { id: "website-header", layout: "header", screen: "discover", width: 1920, height: 640 },
  { id: "creator-beta-banner", layout: "hero-compact", screen: "create-community", width: 1920, height: 900 },
  { id: "linkedin-creator", layout: "wide-product", screen: "dashboard", width: 1200, height: 627 },
  { id: "facebook-creator", layout: "wide-product", screen: "community-gaming", width: 1200, height: 630 },
  { id: "instagram-feed", layout: "square-product", screen: "community-photo", width: 1080, height: 1080 },
  { id: "youtube-shorts-cover", layout: "product", screen: "home", width: 1080, height: 1920, message: "UNZE Creator Beta" },
  { id: "press-kit-hero", layout: "wide-product", screen: "community-gaming", width: 1920, height: 1080 },
];

export const ANIMATIONS = [
  { id: "anim-community-growth", file: "community-growth.html", durationMs: 7000 },
  { id: "anim-members-counter", file: "members-counter.html", durationMs: 6000 },
  { id: "anim-verification", file: "verification.html", durationMs: 5500 },
  { id: "anim-awards", file: "awards-showcase.html", durationMs: 6000 },
  { id: "anim-events", file: "events-pulse.html", durationMs: 5500 },
  { id: "anim-dashboard", file: "dashboard-reveal.html", durationMs: 6500 },
  { id: "anim-monetization", file: "monetization-flow.html", durationMs: 6000 },
  { id: "anim-crowd-partner", file: "crowd-partner.html", durationMs: 6500 },
];

/** Live-Demo-Metriken (Supabase patch) */
export const DEMO_STATS = {
  "rocket-league-ssl": {
    title: "Rocket League Deutschland",
    member_count: 12400,
    rating_avg: 4.9,
    review_count: 1847,
    is_trending: true,
  },
  "mathe-meister": {
    title: "Mathe Akademie",
    member_count: 4900,
    rating_avg: 4.8,
    review_count: 612,
    is_trending: true,
  },
  "business-circle-dach": {
    title: "Business Creator Club",
    member_count: 2300,
    rating_avg: 4.7,
    review_count: 289,
  },
  "lens-masters-guild": {
    title: "Fotografie Deutschland",
    member_count: 8400,
    rating_avg: 4.95,
    review_count: 1243,
    is_trending: true,
  },
  "street-photography-europe": {
    title: "Street Photography Europe",
    member_count: 5600,
    rating_avg: 4.85,
    review_count: 478,
    is_trending: true,
  },
  "fit-squad-dach": {
    title: "Fitness Community",
    member_count: 3800,
    rating_avg: 4.8,
    review_count: 356,
  },
  "handwerk-meister": {
    title: "Handwerker Netzwerk",
    member_count: 2900,
    rating_avg: 4.6,
    review_count: 198,
  },
  "code-craft-academy": {
    title: "Programmier Community",
    member_count: 7200,
    rating_avg: 4.9,
    review_count: 891,
    is_trending: true,
  },
  "creator-lounge": {
    title: "Creator Lounge",
    member_count: 4100,
    rating_avg: 4.85,
    review_count: 524,
    is_trending: true,
  },
};

/** Alle Slides die Raw-Screens brauchen */
export function allRequiredScreens() {
  const ids = new Set();
  for (const r of CAPTURE_ROUTES) ids.add(r.id);
  for (const s of [...TIKTOK_STORY, ...FEATURE_ADS, ...CREATOR_CAMPAIGN]) {
    if (s.screen) ids.add(s.screen);
  }
  for (const e of SOCIAL_EXPORTS) {
    if (e.screen) ids.add(e.screen);
  }
  return [...ids];
}

export function allRequiredOutputs() {
  const outputs = [];
  for (const s of TIKTOK_STORY) {
    outputs.push({ path: join(dirs.output, "tiktok", `${s.id}.png`), slide: s, requiresApp: true });
    outputs.push({ path: join(dirs.output, "reels", `${s.id}.png`), slide: s, requiresApp: true });
    outputs.push({ path: join(dirs.output, "youtube-shorts", `${s.id}.png`), slide: s, requiresApp: true });
    outputs.push({ path: join(dirs.output, "instagram", "stories", `${s.id}.png`), slide: s, requiresApp: true });
  }
  for (const f of FEATURE_ADS) {
    outputs.push({ path: join(dirs.output, "features", `${f.id}.png`), slide: f });
    outputs.push({ path: join(dirs.output, "carousel", `${f.id}.png`), slide: f });
  }
  for (const c of CREATOR_CAMPAIGN) {
    outputs.push({ path: join(dirs.output, "creator-beta", `${c.id}.png`), slide: c });
  }
  for (const e of SOCIAL_EXPORTS) {
    outputs.push({ path: join(dirs.output, e.id + ".png"), export: e });
  }
  for (const a of ANIMATIONS) {
    outputs.push({ path: join(dirs.output, "animations", `${a.id}.webm`), animation: a });
    outputs.push({ path: join(dirs.output, "animations", `${a.id}.webp`), animation: a, optional: true });
    outputs.push({ path: join(dirs.output, "animations", `${a.id}.gif`), animation: a, optional: true });
  }
  return outputs;
}
