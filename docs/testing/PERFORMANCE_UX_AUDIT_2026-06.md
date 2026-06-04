# UNZE — Performance- & UX-Audit (Juni 2026)

Referenz: `01_Designsystem/`, `.cursor/rules/unze-design-system-v1.mdc`, `docs/ARCHITECTURE_DECISIONS.md`

**Demo-Daten:** Alle Demo-Communities, -Gruppen, -Services und -Events bleiben erhalten (`lib/constants/demo.ts`, `npm run seed:demo`).

---

## Test-URLs (lokal)

| Seite | URL |
|-------|-----|
| Home | http://localhost:3002/ |
| Discover | http://localhost:3002/discover |
| Discover Events | http://localhost:3002/discover?tab=events |
| Discover Services | http://localhost:3002/discover?tab=services |
| Gaming (Demo) | http://localhost:3002/community/rocket-league-ssl |
| Business (Demo) | http://localhost:3002/community/business-circle-dach |
| Creator (Demo) | http://localhost:3002/community/creator-lounge |
| Community Feed-Tab | http://localhost:3002/community/rocket-league-ssl?tab=feed |
| Gruppen-Tab | http://localhost:3002/community/rocket-league-ssl?tab=groups |

**Produktion (falls deployt):** `NEXT_PUBLIC_APP_URL` aus Vercel (z. B. `https://unze-platform.vercel.app`).

**Screenshots:** `docs/testing/screenshots/` (erzeugt mit `npm run screenshots:demo` bei laufendem Dev-Server).

---

## 1. Datenbank

### Gefundene Probleme

| Problem | Priorität | Nutzen |
|---------|-----------|--------|
| Community-Detail lud bei jedem Tab Gruppen, Events, Feed, Plattform-Links, Showcase parallel | **Hoch** | −40–60 % DB-Roundtrips auf Feed/Members/Events-Tabs |
| `resolveCommunityLevel` doppelte Abfrage zu `community_groups` / `community_events` | **Hoch** | 2 Queries weniger pro Community-Page |
| `getFollowedEventIds()` lud **alle** Event-Follows des Users global | **Mittel** | Skaliert mit User-Aktivität, nicht mit angezeigten Events |
| `getCommunityBySlug` rief `enrichCommunitiesWithEngagement` → extra `getCurrentUser` + Network-Follow-Query ohne UI-Nutzen | **Mittel** | 2 Queries weniger pro Detailseite |
| `fetchCommunityBySlugFromDb`: Membership, Follow, Group-Count sequentiell | **Niedrig** | ~1 Roundtrip gespart |
| `persistCommunityLevel` bei jedem Pageview | **Niedrig** | Unnötige Writes; jetzt nur bei Level-Änderung |
| Migration `025_community_level_focus.sql` nicht in `BUNDLE_021_024.sql` | **Mittel** | Level/Focus/role_title in Prod fehlend ohne manuelles SQL |

### Bereits gut / vorhanden

- `020_performance_indexes.sql` (Posts, Follows, Members, …)
- `022_platform_core_entities.sql` (Events, Reviews, Gruppen-Typen)
- `idx_communities_level` in Migration 025
- Discover Feed-Tab lädt keine 50 Communities mehr (Sprint A)
- Dashboard-Batch-Stats, `React.cache()` für User

### Empfohlene Optimierungen (offen)

| Empfehlung | Priorität | Geschätzter Nutzen |
|------------|-----------|-------------------|
| `025` in `BUNDLE_all_migrations.sql` / Bundle-Script aufnehmen | Hoch | Stabile Level/Focus in allen Umgebungen |
| Level-Neuberechnung als geplanter Job (Cron/Edge), nicht nur On-Demand | Mittel | Weniger Write-Last auf `communities` |
| `getPlatformMigrationStatus` auf Discover cachen (60s) | Mittel | 6 Schema-Probes seltener |
| Event-Detail-Route mit gezielten Queries | Mittel | Bessere UX + weniger Discover-Umwege |
| Composite-Index `follows(follower_id, target_type, target_event_id)` falls Event-Follows wachsen | Niedrig | Schnellere scoped Follow-Queries |

---

## 2. Frontend

### Gefundene Probleme

| Problem | Priorität | Nutzen |
|---------|-----------|--------|
| Community-Page: kein tab-bewusstes Laden | **Hoch** | **Umgesetzt** in dieser Runde |
| `buildGroupCardEngagement` als `async` ohne I/O → künstliche Microtasks | Niedrig | **Umgesetzt** (sync) |
| `FeedPostList` / schwere Sektionen nicht per `dynamic()` auf Community-Page | Mittel | Kleineres initiales JS |
| `CommunityGroupSection` noch mit Engagement-Mapping (Legacy-Pfade) | Niedrig | Nur wo Komponente noch genutzt wird |
| Discover: Migration-Banner + 3× Suspense pro Request | Niedrig | Akzeptabel für Dev-Hinweise |

### Bereits gut

- `NotificationCenter` via `next/dynamic`
- `optimizePackageImports: ['lucide-react']`
- Community-Tabs ohne N+1 Engagement (`mapGroupToDiscoverCard`)
- Mobile-first Community-Page, Bottom-Nav

### Empfohlene Optimierungen (offen)

| Empfehlung | Priorität | Nutzen |
|------------|-----------|--------|
| Feed-Tab als Client-Island mit `dynamic(…, { ssr: false })` optional | Mittel | Schnellerer Tab-Wechsel |
| `React.memo` auf `CommunityCard` / `FeedPostCard` bei Listen > 20 | Niedrig | Weniger Re-Renders beim Scrollen |
| Route-Level `loading.tsx` für Community/Discover | Mittel | Wahrgenommene Geschwindigkeit |

---

## 3. Bilder & Medien

| Problem | Priorität | Status |
|---------|-----------|--------|
| Cover-Bilder ohne `loading` / `decoding` | Mittel | **Umgesetzt** (`hero` = eager, Karten = lazy) |
| Kein `next/image` (kein automatisches Resize/WebP) | Mittel | Offen — Supabase-URLs + Gradient-Fallback |
| Große Banner-Uploads ohne Server-Resize | Mittel | Offen |
| Externe Plattform-Icons ohne Dimensionen | Niedrig | CLS-Risiko gering (kleine Icons) |

**Empfehlung:** `next/image` für Community/Group-Cover mit `sizes` und `priority` auf Hero; Upload-Pipeline max. 1200px Breite.

---

## 4. Mobile Performance

| Bereich | Befund | Priorität |
|---------|--------|-----------|
| Ladezeit Community (Feed-Tab) | Nach Tab-Optimierung deutlich weniger Queries | — |
| Scroll | `page-padding`, Cards, Bottom-Nav — flüssig; lange Feed-Listen noch ohne Virtualisierung | Mittel |
| Navigation | Bottom-Nav, Zurück zu Discover — konsistent | — |
| Community-Tabs | URL `?tab=` — sharebar, kein Full-Reload nötig (RSC) | — |
| Gruppen/Service-Seiten | Service: Booking-Block oben (mobile) | — |
| Events | Follow scoped; Event-Detail-Seite fehlt noch | Hoch (UX) |

**Messung nach Deploy:**

```bash
curl.exe -s -o NUL -w "TTFB: %{time_starttransfer}s\n" http://localhost:3002/community/rocket-league-ssl?tab=feed
npm run test:e2e-urls
```

Lighthouse Mobile: `/`, `/discover`, `/community/rocket-league-ssl`.

---

## 5. UX-Analyse

| Thema | Befund | Empfehlung | Priorität |
|-------|--------|------------|-----------|
| Community-Übersicht | Tabs trennen Inhalte klar (Designsystem) | Event-Vorschau auf Overview optional | Niedrig |
| Event buchen / Details | Keine dedizierte Event-Route | `/community/[slug]/event/[id]` | **Hoch** |
| Service-Buchung | Gruppen-Seite zeigt Preis, keine Slot-Auswahl | Buchungsflow + Kalender | **Hoch** |
| Beitritt | Join-Panel nur auf Overview | OK — vermeidet Redundanz | — |
| Discover → Community | 1 Klick | OK | — |
| Dashboard vs. öffentliche Seite | Manage-Button nur für Berechtigte | OK | — |
| Feed vs. Social | Nur erlaubte Post-Typen | Kommunizieren in Empty States | Niedrig |
| Swipe auf Entity-Cards | Feed ja, Discover horizontal teilweise | Designsystem-Swipe auf Cards | Mittel |
| Öffentliche Follower-Zahlen | Spec: verboten; Mockups zeigen teils anders | Spec befolgen | — |

---

## 6. Umgesetzt in dieser Runde (Performance)

1. Tab-bewusstes Laden auf `app/community/[slug]/page.tsx`
2. `fetchCommunityEntityCounts` + Level aus vorhandenen Daten (kein Doppel-Query)
3. `getFollowedEventIdsAmong` (Community, Gruppe, Discover Events)
4. Entfernung unnötiger Engagement-Enrichment auf `getCommunityBySlug`
5. Parallele Membership/Follow/Group-Count in `fetchCommunityBySlugFromDb`
6. `persistCommunityLevel` nur bei Level/Score-Änderung
7. Sync `buildGroupCardEngagement` + Discover-Gruppen-Mapping
8. Cover-Bilder: lazy/eager nach `overlay`

---

## 7. Offene Punkte (priorisiert)

### Hoch

- Event-Detailseite (Mockup)
- Service-Buchungsflow (Zeitslots)
- Migration 025 in Supabase ausführen / Bundle erweitern
- Screenshots in CI oder manuell nach jedem Release

### Mittel

- `next/image` für Cover
- Discover Migration-Status cachen
- `loading.tsx` + optional dynamic Feed
- Community Overview: Mini-Event-Liste (1–2 Klicks sparen)
- Horizontales Swipe auf Discover-Cards

### Niedrig

- Feed-Virtualisierung bei > 50 Posts
- Composite-Index Event-Follows
- CommunityGroupSection deprecaten wo ungenutzt

---

## 8. Demo-Daten

Unverändert erhalten und erweiterbar:

- **Seed-Slugs:** `rocket-league-ssl`, `business-circle-dach`, `creator-lounge`
- **Mock-Slugs:** `creator-hub`, `fitness-mindset`, … (siehe `lib/constants/demo.ts`)
- **Befehle:** `npm run seed:demo`, `npm run migrate:demo`

---

## 9. Screenshots

Ordner: `docs/testing/screenshots/`

| Datei | Route |
|-------|-------|
| `01-home.png` | `/` |
| `02-discover.png` | `/discover` |
| `03-community-rocket-league.png` | `/community/rocket-league-ssl` |
| `04-community-business.png` | `/community/business-circle-dach` |
| `05-community-creator.png` | `/community/creator-lounge` |
| `06-community-feed-tab.png` | `?tab=feed` |
| `07-discover-events.png` | `/discover?tab=events` |

Erzeugen: Dev-Server starten, dann `npm run screenshots:demo`.

---

## 10. Performance-Sprint (Juni 2026 — Runde 2)

### Engpässe (vor Umsetzung)

| Bereich | Engpass | Auswirkung |
|---------|---------|------------|
| Discover | `getPlatformMigrationStatus` bei jedem Request (6 Probes) | +6 DB-Roundtrips / Discover-Load |
| Community | `getCommunityActivityStats` lud **alle** Post-Zeilen | Hohe Payload + CPU bei vielen Posts |
| Community Overview | Feed-Limit 20, Anzeige nur 3 | 17 unnötige Post-Rows |
| Community Members | Activity-Stats trotz Tab ohne Nutzung | 2+ Count-Queries |
| Bilder | Cover nur `<img>`, kein `next/image` | Kein WebP/Resize für Supabase-URLs |
| UX wahrgenommen | Keine `loading.tsx` auf Discover/Community/Profil | Leerer Screen bis RSC fertig |

### Umgesetzte Optimierungen

| # | Maßnahme | Geschätzter Nutzen |
|---|----------|-------------------|
| 1 | Migration-Status `unstable_cache` (60s) | Discover −6 Queries/Minute pro User |
| 2 | Activity-Stats: `count` + `head: true` statt Full-Scan | Community −90 %+ Post-Payload |
| 3 | Overview-Feed: Limit 5 statt 20 | −75 % Post-Query auf Overview |
| 4 | Members-Tab: keine Activity-Stats | −2 Count-Queries |
| 5 | `next/image` für Supabase/Unsplash-Cover | Kleinere Bild-Bytes, bessere LCP |
| 6 | `loading.tsx` Discover / Community / Profil | Bessere wahrgenommene Ladezeit |
| 7 | `FeedPostList` dynamic import (Code-Split) | Kleineres initiales JS auf Feed-Tab |
| 8 | `npm run measure:perf` | Reproduzierbare TTFB-Messung |

### Messung

```bash
npm run measure:perf
npm run measure:perf https://unze-platform.vercel.app
npm run test:e2e-urls
```

### Noch offen (ohne neue Features)

| Punkt | Priorität |
|-------|-----------|
| Feed-Virtualisierung > 50 Posts | Niedrig |
| Level-Berechnung als Cron statt On-Demand | Mittel |
| Upload-Resize Banner max. 1200px | Mittel |
| Lighthouse CI im Release | Niedrig |
| Horizontales Swipe Discover-Cards | UX/Mittel |
