# UNZE  Performance-Audit (Juni 2026)

Stand: 2026-06-20 · **Vercel Deploy ausstehend** (Messung nach Deploy wiederholen)

## Symptom

Startseite fühlt sich ~2 Sekunden langsam an (PWA / Browser auf dem Handy).

## Messung Production (`https://unze-platform.vercel.app`)

| Route | TTFB (warm) | Anmerkung |
|-------|-------------|-----------|
| **Home `/`** | **497828 ms** | deutlich langsamer als Rest |
| Discover | ~172189 ms | OK |
| Discover Events | ~998 ms | noch verbesserbar |
| Profil | ~217 ms | OK |
| Community | ~181254 ms | OK |

**Erstes Mess-Home (kalt):** 3485 ms  Vercel Cold Start + alte Home-Logik.

Die wahrgenommenen **~2 s** setzen sich zusammen aus:

1. **Server TTFB** (~0,50,8 s warm, bis ~3,5 s kalt)
2. **JS-Bundle + Hydration** (~0,30,6 s)
3. **Hero-Bild + Fonts** (~0,20,4 s)
4. **Erstbesuch-Onboarding** (Dialog nach 800 ms  optional wahrnehmbar)

---

## Hauptursachen Home (vor Fix)

| Ursache | Impact |
|---------|--------|
| Layout blockierte auf **3 Extra-DB-Queries** (Unread, Dashboard, Owner) | jede Seite wartet |
| Home lud **6+ Supabase-Queries** serialisiert (Events nach Communities) | Member-TTFB |
| Gast-Home rief `getDiscoverCommunities()` mit **Viewer-Enrichment** auf | unnötige Auth/Engagement |
| PWA-Warmcache wurde **geschrieben, aber nicht zum First Paint genutzt** | verpasste Chance |
| Service Worker: **Network-first** auf `/` | kein sofortiger Replay-Start |
| Prefetch erst nach **Idle / 2,5 s** | zu spät für PWA |

---

## Umgesetzte Maßnahmen (dieser Stand)

### A. Schnellerer Server-Start

- **PlatformShell:** nur noch `getCurrentUser()` serverseitig
- Badges/Creator-Icons: **Client-Hydration** via `localStorage` + `/api/pwa/shell`
- **Home streaming:** `Suspense` + `HomeMemberContent` / `HomeGuestContent`
- **Gast-Discover:** `getDiscoverCommunitiesPreview()` ohne Session-Enrichment
- **`app/loading.tsx`:** sofortiges Skeleton statt leerer Screen

### B. PWA  Daten auf dem Handy

| Speicher | Inhalt | TTL |
|----------|--------|-----|
| `localStorage` `unze:pwa:shell:v1` | Unread, Dashboard, Owner | 15 min / **4 h PWA** |
| `localStorage` `unze:pwa:prefetch:v1` | Profil, Notifications, Communities | 15 min / **4 h PWA** |
| `localStorage` `unze:pwa:home:v1` | Community-Namen, Anträge, Events | **4 h** |
| `localStorage` `unze:pwa:visited-slugs:v1` | zuletzt besuchte Communities | 8 Slugs |
| **Service Worker v4** | Shell HTML **Stale-While-Revalidate**, Assets cache-first, Hero-Bilder precache |  |

### C. PWA-Verhalten

- **Installierte App:** Prefetch + Shell-API **sofort** (nicht erst Idle)
- **Browser-Tab:** Prefetch nach Idle (~1,2 s)
- Wiederholter App-Start: SW liefert **gecachte Home-HTML** sofort, Netz aktualisiert im Hintergrund

---

## Testplan (manuell)

### Mess-Skript

```bash
npm run measure:perf https://unze-platform.vercel.app
```

### PWA auf dem Handy

1. App installieren ? einmal einloggen ? Home vollständig laden
2. App **komplett schließen** (nicht nur minimieren)
3. Erneut öffnen  Erwartung: **Shell + Skeleton < 300 ms**, Inhalt folgt
4. Zweiter Besuch offline (Flugmodus): Home-HTML aus SW, gecachte Badges aus localStorage

### Chrome DevTools (Remote Debugging)

- **Network:** TTFB von `/` dokumentieren
- **Application ? Cache Storage:** `unze-shell-v4` enthält `/`
- **Application ? Local Storage:** `unze:pwa:shell:v1` gesetzt

---

## Offen / nächste Schritte

| Prio | Thema |
|------|--------|
| P1 | **Deploy** + erneute Production-Messung |
| P1 | Discover Events TTFB (~1 s)  Cache prüfen |
| P2 | HomeMember: Events-Query parallelisieren (RPC by user) |
| P2 | `HomePwaWarmStart` UI  gecachte Community-Namen während Suspense |
| P3 | Vercel Region / Supabase Region Nähe prüfen |

---

## Deploy-Hinweis

**Kein Vercel-Deploy in diesem Schritt**  wie vereinbart erst nach Performance-Review + erneutem Test.

Nach Deploy: `npm run measure:perf` und Handy-PWA-Test wiederholen.
