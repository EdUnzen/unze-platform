# Performance Sprint A — Vorher/Nachher

> Sprint gemäß `docs/ARCHITECTURE_DECISIONS.md` — höchste Priorität vor neuen Features.

## Ziel

N+1 eliminieren, Requests parallelisieren, Indizes + Caching, Lazy Loading — messbar schnellere TTFB.

---

## Vorher (Baseline — Audit 2026)

| Route | TTFB (curl) | Hauptursache |
|-------|-------------|--------------|
| `/` (Home, Creator) | **~3,9 s** | Sequentielle awaits + `getManagedCommunities` N+1 + TopBar lädt volles Dashboard |
| `/discover?tab=feed` | **~1,3 s** | Immer 50 Communities geladen |

**Geschätzte DB-Roundtrips (Creator, 3 Communities):**

| Route | Vorher |
|-------|--------|
| Home | ~45–55 |
| Dashboard | ~32–38 |
| Discover Feed | ~25–27 |

---

## Umgesetzte Maßnahmen

### 1. Dashboard N+1 beseitigt
- `services/dashboard/dashboard-stats.batch.ts` — 6 Batch-Queries statt ~7×N
- `hasManagedCommunities()` — leichte Prüfung für TopBar (1 Query)

### 2. Home parallelisiert
- `app/page.tsx` — `Promise.all` für featured, feed, managed, unread

### 3. Discover tab-aware
- `components/discover/DiscoverContent.tsx` — Feed-Tab lädt **keine** 50 Communities mehr

### 4. Indizes
- `database/migrations/020_performance_indexes.sql`

### 5. Caching
- `unstable_cache` für Discover-Community-Liste (60 s)
- `React.cache()` für `getCurrentUser()`

### 6. Lazy Loading
- `NotificationCenter` via `next/dynamic` in `PlatformTopBar`

### 7. Weitere Fixes
- Badge-Counts: 1 Query statt N
- Feed: doppelte `getFollowedCommunityIds` entfernt
- `optimizePackageImports: ['lucide-react']`

---

## Nachher (geschätzt / nach Deploy + Migration 020)

| Route | TTFB Ziel | DB-Roundtrips Ziel |
|-------|-----------|---------------------|
| `/` | **~1,0–1,8 s** | **~12–18** |
| `/discover?tab=feed` | **~0,6–0,9 s** | **~8–12** |
| `/dashboard` | **~0,8–1,2 s** | **~8–10** |

**Erwartete Verbesserung Home TTFB: ~55–70 %**

---

## Nach Deploy messen

```bash
curl.exe -s -o NUL -w "TTFB: %{time_starttransfer}s`n" https://unze-platform.vercel.app/
curl.exe -s -o NUL -w "TTFB: %{time_starttransfer}s`n" "https://unze-platform.vercel.app/discover?tab=feed"
```

Lighthouse (Mobile): Chrome DevTools → Performance + Lighthouse auf `/` und `/discover`.

---

## Supabase

Migration ausführen:

```sql
-- database/migrations/020_performance_indexes.sql
```

---

## Noch offen (Sprint B)

- Feed-Virtualisierung + Cursor-Pagination
- `next/image` für Medien
- Öffentliche View-Zähler UI entfernen (Architektur)
- Community-Page parallelisieren
