# Sprint 3 — UX, Dynamik & Discover

**Phase:** 1 von 3 (UX/Dynamics → Trust/Reviews → Referral/Growth)  
**Prinzip:** Modular erweitern, keine Schema-Rewrites, rückwärtskompatibel.

## Ziele

- Dashboard motivierender & KPI-fokussiert
- Cards mit sichtbaren Share-/View-Metriken
- Feed mit Follow + ~12 % Explore-Mix
- Gruppen als Mini-Community-Cards auf Community-Seite
- Vertrauen bei externen Links vorbereiten
- Referral/Plattformgebühr nur als Typen/Konstanten (keine DB)

## Umgesetzt

### Feed & Discover

- `lib/feed/blend-feed.ts` — Interleaving Follow + Explore (~12 %)
- `getBlendedFeedPosts()` / `getPersonalFeedPosts()` in `feed.service.ts`
- Discover Feed-Tab & Home: personalisierter Mix für eingeloggte User
- `FeedDiscoverView`: Swipe standardmäßig auf Mobile, Explore-Anteil-Anzeige
- `FeedPostCard`: Badge „Entdecken“ für `feedSource: "explore"`

### Dashboard

- `DashboardGrowthPanel` — Wachstums-KPIs mit Creator-Messaging
- `DashboardStatGrid` — Aufrufe/Woche, Shares, Beiträge hervorgehoben
- `DashboardCommunityCard` — kompakte View/Share-Metriken

### Cards & Gruppen

- `CardMetricsRow` — Views/Shares in Community- & Gruppen-Cards
- `CommunityGroupSection` — Gruppen als eigene Cards auf Community-Seite
- Share-Pill-Schwelle in `build-pills.ts` auf ≥10 gesenkt

### Vertrauen (Vorbereitung)

- `ExternalLinkTrustNotice` — Haftungshinweis bei externen Links

### Growth/Referral (nur Vorbereitung, keine Migration)

- `types/referral.ts` — Typen für Creator Referral & Growth Snapshots
- `lib/constants/platform.ts` — `PLATFORM_FEE_PERCENT = 7.7`

## Nächste Phase

- Community Reviews (UI + DB-Migration)
- Meldesystem vertiefen
- Referral-Tracking & Share-Attribution

## Test

```bash
npm run build
npm run dev
# Discover → Feed (Swipe auf Mobile)
# Dashboard → Community → Wachstum & KPI-Übersicht
# Community-Seite → Gruppen & externer Link-Hinweis
```
