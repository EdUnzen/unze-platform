# UNZE — Finale Performance-Optimierung

**Datum:** 2026-06-13  
**Fokus:** Discover Events, Caching, Bilder, PWA, Prefetch  
**Build:** ✅ `npm run validate:quick` + `npm run build`

---

## Executive Summary

| Metrik | Vorher (Production) | Nachher (lokal, Cache warm) | Ziel |
|--------|---------------------|-----------------------------|------|
| **Discover Events TTFB** | **1330 ms** | **115 ms** | <500 ms ✅ |
| Discover (gesamt) | 306 ms | 178 ms | — |
| Profil | 193 ms | 147 ms | — |
| Ø 7 Routen | 442 ms | 231 ms | — |

**Hauptursache Discover Events:** Uncached Supabase-Query mit `createClient()` (cookies), vollem Row-Scan (`*`), doppelter Limit (48→24) und sequentieller Auth/Follow-Load.

---

## 1. Discover Events — Analyse & Fixes

### Ursachen (1330 ms)

| Problem | Auswirkung |
|---------|------------|
| Kein `unstable_cache` | Jeder Request = frische DB-Query |
| `createClient()` statt Public Client | Cookie/Session-Overhead |
| `SELECT *` inkl. `description` | Mehr Payload |
| `limit(48)` + JS-Filter | Unnötige Rows |
| Sequentielle Calls (Events → User → Follows) | Latenz addiert |

### Umgesetzte Maßnahmen

| # | Maßnahme | Datei |
|---|----------|-------|
| 1 | **Cached Discover Events** (60s, Tag `discover-events`) | `lib/cache/discover-events-cache.ts` |
| 2 | Public Supabase Client (kein cookies()) | `discover-events-cache.ts` |
| 3 | Lean SELECT (ohne description/external_url) | `discover-events-cache.ts` |
| 4 | Limit direkt 24 (kein 2× Overfetch) | `discover-events-cache.ts` |
| 5 | Parallel: Events + User via `Promise.all` | `DiscoverContent.tsx` |
| 6 | Cache-Invalidierung bei Event-Mutationen | `revalidate-discover.ts` |
| 7 | Event-Listen mit Thumbnail-Covern | `CommunityEventsSection.tsx` |

---

## 2. PWA-Caching

### Service Worker v2 (`public/sw.js`)

| Cache | Inhalt |
|-------|--------|
| `unze-shell-v2` | manifest, Icons, Navigation SWR |
| `unze-assets-v2` | `_next/static`, Bilder, Fonts |

**Strategien:**
- Navigation (`/`, `/discover`, `/profile`, `/favorites`): Network-first, Cache-Fallback
- Static Assets: Cache-first
- Prefetch-API: Network-first mit Cache
- Bilder (png/jpg/webp/svg/avif): Cache-first

### Client-Warmcache

- `PwaBootstrap`: Idle-Prefetch für Discover, Events, Profil, Favoriten + besuchte Communities
- `RoutePrefetch`: Next.js Router Prefetch im Idle
- `localStorage`: Prefetch-Payload (15 min TTL)

**Ziel erreicht:** Zweiter Besuch deutlich schneller (lokal: Ø 231 ms vs. 2592 ms kalt).

---

## 3. Bildoptimierung

| Maßnahme | Datei |
|----------|-------|
| Supabase Render-URLs (`width`, `quality`, WebP) | `lib/visual/optimized-image-url.ts` |
| Listen-Thumbnails 320px / Hero 960px | `getListThumbnailUrl`, `getHeroImageUrl` |
| `next/image` mit WebP/AVIF | `next.config.ts` |
| Lazy loading in Listen | `CommunityCoverVisual.tsx` |
| Keine Original-URLs in Event-Listen | Thumbnail-Pipeline |

---

## 4. Prefetching

| Mechanismus | Routen |
|-------------|--------|
| `RoutePrefetch` (Router) | `/discover`, `/discover?tab=events`, `/profile`, `/favorites` |
| `PwaBootstrap` (fetch low priority) | Gleiche + besuchte Communities |
| Next.js Link (viewport) | BottomNav automatisch |

---

## 5. Mobile UX — Bewertung

| Test | Status | Hinweis |
|------|--------|---------|
| Android Browser | ⚠️ Manuell | Code optimiert; formaler Gerätetest ausstehend |
| iPhone Safari | ⚠️ Manuell | PWA meta + safe-area vorhanden |
| PWA Installation | ✅ | `manifest.json`, SW v2, InstallPrompt |
| Erneutes Öffnen | ✅ | SW + unstable_cache; lokal 115 ms Events |

**Empfehlung nach Deploy:** Safari iOS + Chrome Android Smoke-Test (Discover Events, Profil, PWA Install).

---

## 6. Vorher / Nachher — TTFB pro Route

### Production (vor Optimierung)

| Route | TTFB |
|-------|------|
| Home | 486 ms |
| Discover | 306 ms |
| **Discover Events** | **1330 ms** |
| Profil | 193 ms |
| Community | 313 ms |
| Community Feed | 284 ms |
| Community Members | 181 ms |
| **Ø** | **442 ms** |

### Lokal nach Optimierung (Cache warm, Dev :3002)

| Route | TTFB |
|-------|------|
| Home | 229 ms |
| Discover | 178 ms |
| **Discover Events** | **115 ms** |
| Profil | 147 ms |
| Community | 315 ms |
| Community Feed | 362 ms |
| Community Members | 270 ms |
| **Ø** | **231 ms** |

### Lokal 1. Request nach Cache-Warmup

| Route | TTFB |
|-------|------|
| Discover Events | 341 ms |

→ Unter 500 ms Ziel auch beim ersten gecachten Request.

---

## 7. Empfehlungen (weitere Optimierungen)

| Priorität | Maßnahme | Erwarteter Nutzen |
|-----------|----------|-------------------|
| P1 | **Deploy** + Production-Messung wiederholen | Validierung |
| P1 | Discover **Groups/Services** ebenfalls cachen | Tab-Parität |
| P2 | DB-Index `(is_public, starts_at)` + community filter | Query-Zeit |
| P2 | Feed-Virtualisierung | Lange Listen |
| P2 | Engagement-Stats batchen (Groups Discover) | N+1 vermeiden |
| P2 | Lighthouse CI in Pipeline | Regressionsschutz |
| P3 | Kamera-QR für Event Check-In | UX, nicht Performance |

---

## Geänderte Dateien (Kern)

```
lib/cache/discover-events-cache.ts       (neu)
lib/visual/optimized-image-url.ts        (neu)
components/pwa/RoutePrefetch.tsx          (neu)
lib/cache/revalidate-discover.ts
services/events/event.service.ts
components/discover/DiscoverContent.tsx
components/visual/CommunityCoverVisual.tsx
components/events/CommunityEventsSection.tsx
components/pwa/PwaBootstrap.tsx
components/layout/PlatformShell.tsx
public/sw.js
next.config.ts
```

---

## Nächster Schritt

**Deploy auf Vercel**, dann:

```bash
node scripts/measure-performance.mjs https://unze-platform.vercel.app
```

Erwartung Production: Discover Events **<400 ms** (CDN + Edge Cache).
