import { join } from "path";

export const root = process.cwd();
export const base = process.env.E2E_BASE_URL ?? "https://unze-platform.vercel.app";
export const demoEmail = process.env.DEMO_EMAIL ?? "edubek89@icloud.com";
export const demoPassword = process.env.DEMO_PASSWORD ?? "UnzeDemo2026!";

export const dirs = {
  raw: join(root, "docs", "marketing", "raw-screens"),
  output: join(root, "docs", "marketing", "output"),
  engine: join(root, "docs", "marketing", "engine"),
};

/** Reine App-Captures (Viewport, kein Full-Page) - Basis fuer Mockups */
export const CAPTURE_ROUTES = [
  { id: "home", path: "/", auth: false },
  { id: "discover", path: "/discover", auth: false },
  { id: "discover-events", path: "/discover?tab=events", auth: false },
  { id: "community-gaming", path: "/community/rocket-league-ssl", auth: false },
  { id: "community-business", path: "/community/business-circle-dach", auth: false },
  { id: "community-education", path: "/community/mathe-meister", auth: false },
  { id: "dashboard", path: "/dashboard", auth: true },
  { id: "members", path: "/dashboard/community/rocket-league-ssl/members", auth: true },
  { id: "requests", path: "/dashboard/community/rocket-league-ssl/requests", auth: true },
  { id: "events-dash", path: "/dashboard/community/rocket-league-ssl/events", auth: true },
  { id: "scanner", path: "/dashboard/community/rocket-league-ssl/scanner", auth: true },
  { id: "auszeichnungen", path: "/dashboard/community/rocket-league-ssl/auszeichnungen", auth: true },
  { id: "monetization", path: "/dashboard/community/rocket-league-ssl/monetization", auth: true },
  { id: "crowd-partner", path: "/dashboard/crowd-partner", auth: true },
  { id: "profile-awards", path: "/profile/auszeichnungen", auth: true },
  { id: "profile-tickets", path: "/profile/tickets", auth: true },
  { id: "create-community", path: "/create/community", auth: true },
];

/** 8-teilige Creator-Story - mind. 70 % echte UI */
export const CREATOR_STORY = [
  {
    id: "story-01-hook",
    screen: "home",
    headline: "Sei einer der ersten Creator auf UNZE.",
    subline: "Deine Community. Ein Ort.",
    format: "story",
  },
  {
    id: "story-02-community",
    screen: "community-gaming",
    headline: "Community erstellen",
    subline: "Marke, Struktur, Vertrauen.",
    format: "story",
  },
  {
    id: "story-03-members",
    screen: "members",
    headline: "Mitglieder verwalten",
    subline: "Rollen, Antr\u00e4ge, \u00dcbersicht.",
    format: "story",
  },
  {
    id: "story-04-events",
    screen: "events-dash",
    headline: "Events veranstalten",
    subline: "Tickets, Check-in, QR.",
    format: "story",
  },
  {
    id: "story-05-awards",
    screen: "auszeichnungen",
    headline: "Auszeichnungen vergeben",
    subline: "Sichtbarer Erfolg f\u00fcr Mitglieder.",
    format: "story",
  },
  {
    id: "story-06-certificates",
    screen: "profile-awards",
    headline: "Zertifikate sammeln",
    subline: "Qualifikationen & Nachweise.",
    format: "story",
  },
  {
    id: "story-07-crowd",
    screen: "crowd-partner",
    headline: "Crowd Partner aktivieren",
    subline: "Creator empfehlen. Gemeinsam wachsen.",
    format: "story",
  },
  {
    id: "story-08-grow",
    screen: "discover",
    headline: "Wachse mit der Plattform",
    subline: "Je fr\u00fcher du startest, desto st\u00e4rker dein Netzwerk.",
    format: "story",
  },
];

export const SOCIAL_EXPORTS = [
  { id: "hero-landing", screens: ["discover", "dashboard"], layout: "hero", width: 1920, height: 1080 },
  { id: "linkedin-creator", screen: "dashboard", layout: "wide", width: 1200, height: 627 },
  { id: "facebook-creator", screen: "community-gaming", layout: "wide", width: 1200, height: 630 },
  { id: "press-community", screen: "community-gaming", layout: "wide", width: 1920, height: 1080 },
];

export const DEMO_STATS = {
  "rocket-league-ssl": {
    member_count: 2384,
    rating_avg: 4.9,
    review_count: 312,
    group_target: 12,
    event_target: 8,
    credential_target: 8,
  },
  "business-circle-dach": {
    member_count: 1156,
    rating_avg: 4.7,
    review_count: 89,
    group_target: 6,
    event_target: 4,
  },
  "mathe-meister": {
    member_count: 2000,
    rating_avg: 4.8,
    review_count: 214,
    group_target: 8,
    event_target: 5,
    credential_target: 10,
  },
};
