# Performance Sprint — 2026-06-04

Basis-URL Prod (vor Deploy dieser Runde): `https://unze-platform.vercel.app`  
Messung: `npm run measure:perf -- https://unze-platform.vercel.app` (TTFB = Zeit bis erste Response-Bytes, kein LCP im Node-Skript).

## Vorher (Prod, 2026-06-04)

| Route | TTFB |
|-------|------|
| Home | 465 ms |
| Discover | 409 ms |
| Discover Events | 207 ms |
| Profil | 253 ms |
| Community | 250 ms |
| Community Feed | 217 ms |
| Community Members | 183 ms |
| **Ø (7 OK)** | **283 ms** |

## Änderungen (diese Runde)

- Discover: Migration-Banner in `Suspense`, kein blockierender Schema-Probe vor Content.
- Discover: parallele Viewer-Enrichment + Engagement-Merge.
- Profil: `getCurrentProfile`, Notifications, `hasManagedCommunities` parallel.
- Community: Level-Persist nur auf Tab „Übersicht“.
- Schema-Probe-Cache: 60s → 300s.

## Nachher

Nach Deploy erneut messen:

```bash
npm run measure:perf -- https://unze-platform.vercel.app
```

Werte unten eintragen:

| Route | TTFB nachher |
|-------|----------------|
| Home | |
| Discover | |
| Discover Events | |
| Profil | |
| Community | |
| Community Feed | |
| Community Members | |
| **Ø** | |

## Community-Erstellung

- Admin-Fallback für `communities`-Insert wenn Session-Insert fehlschlägt.
- Robuste Spalten-Fallbacks (`focus_tags`, `banner_url`).
- `npm run verify:community-create` vor Deploy.

## Mobile

Manuell auf iPhone: Discover scrollen, Community-Tabs wechseln, Profil öffnen — wahrgenommene Latenz vs. vorher notieren.
