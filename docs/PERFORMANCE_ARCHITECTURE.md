# UNZE — Performance-Architektur

> Normale Nutzer laden nur Consumer-Bereiche. Creator-Tools erst bei `/dashboard/*`.

## Nutzerbereiche

### Normale Nutzer (sofort)

| Route | Daten |
|-------|--------|
| `/` | Mitgliedschaften, Follows, Events, Anträge |
| `/discover` | Gecachte Liste + Viewer-Kontext |
| `/community/[slug]` | Gecachte Community + Tabs |
| `/profile` | Profil (Request-Cache) |
| `/notifications` | Benachrichtigungen |

**Shell (ein Request):** `getPlatformShellContext()` — User, unread-Badge, `showDashboard` (boolean, keine Community-Liste).

### Creator (nur bei Öffnen)

| Route | Lazy / isoliert |
|-------|------------------|
| `/dashboard` | `getManagedCommunities` |
| `/dashboard/referrals` | Stripe, Referral, Ledger — `ReferralsPanelsLazy` |
| `/dashboard/community/[slug]/*` | Moderation, Monetarisierung, Analytics |
| Governance-Counts | `getCachedDashboardPendingCounts` (30s) |

TopBar-Dashboard-Link und +-Menü „Dashboard“ nur wenn `showDashboard === true`.

## Caching

| Daten | Mechanismus | TTL |
|-------|-------------|-----|
| Discover-Liste | `unstable_cache` | 60s |
| Community by slug | `unstable_cache` pro slug/user | 30s |
| Dashboard Pending | `unstable_cache` pro community | 30s |
| Profil | React `cache()` pro Request | Request |
| Unread count | React `cache()` pro Request | Request |

Bilder: `next/image` + SW-Cache für statische Assets unter `/icons`, Banner-URLs via Supabase `remotePatterns`.

## PWA (installiert)

1. `PwaBootstrap` registriert `/sw.js`
2. Im Idle: `GET /api/pwa/prefetch` → localStorage (`unze:pwa:prefetch:v1`)
3. Letzte Communities: `CommunityVisitTracker` → Prefetch beim nächsten Start

Prefetch enthält **keine** Stripe-/Referral-/Governance-Daten.

## Messen

```bash
npm run build
npm run measure:perf   # falls konfiguriert
```

Ziel: Home/Discover First Load ohne Creator-Chunks; Dashboard-Route eigene JS-Segmente.
