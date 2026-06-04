# UNZE — Release-Kandidat Status (Juni 2026)

**Stand:** 2026-06-04 (nach Stabilisierungs-Sprint)  
**Produktion:** https://unze-platform.vercel.app  
**Scope:** Keine neuen Features — Stabilität, Performance, Mobile/Vercel.

---

## Release-Status: **Beta bereit**

| Kriterium | Status |
|-----------|--------|
| Hauptseiten HTTP 200 (Prod) | ✓ |
| Discover lädt Communities/Gruppen/Events | ✓ |
| Community-Erstellen (Code + Migration 026/027) | ✓ (manuell E2E mit Login) |
| Kritische DB-Migrationen 021–026 | ✓ |
| OAuth Google/Apple | ◐ Supabase-Provider-Setup ausstehend |
| Designsystem 1:1 Mockups | ✗ bewusst nach Stabilisierung |

**Nicht „Release bereit“** wegen: OAuth-Setup, Design-Lücken (M1–M14), subjektive Latenz auf kaltem Discover, Monetarisierung/Stripe E2E manuell.

---

## Behobene Fehler (diese Runde + vorherige Deploys)

| ID | Problem | Fix |
|----|---------|-----|
| D1 | Discover: sequentielle Datenladung → hohe TTFB (~890 ms) | `Promise.all` in `DiscoverContent`, Batch-`activity-stats`, Suspense um Inhalt |
| D2 | Discover: N× Post-Head-Counts pro Gruppen-Karte | Ein Batch-Query über `posts.community_id` |
| D3 | Discover: `discover_score`-Spalte fehlt → leere Liste | Fallback-Query ohne `discover_score` |
| D4 | Discover: Join-Applications-Query bricht bei Schema-Fehler | Fehlertoleranz in `enrichCommunitiesForViewer` |
| D5 | E2E „Discover Feed“ falsch positiv | Legacy-Tab `feed` → Communities; Test angepasst |
| C1 | Community-Erstellen: kein `creator`-Member → Dashboard-Redirect scheitert | Migration 026 RLS + Insert + Admin-Fallback + `creator_id`-Fallback |
| C2 | Alte Communities ohne Member-Zeile | Migration `027_backfill_creator_memberships.sql` |
| M1 | Fokus/Tags: Komma auf iOS | `CommaSeparatedInput` (uncontrolled) |
| U1 | Unbehandelte Server-Exceptions | `app/error.tsx` mit Retry |
| P1 | Migration 025 fehlend | Angewendet; `migrate:demo` ✓ |

---

## Verbleibende Fehler / Risiken

| Priorität | Thema | Hinweis |
|-----------|-------|---------|
| Hoch | OAuth Google/Apple | Supabase Provider + Redirect-URLs + `NEXT_PUBLIC_APP_URL` auf Vercel |
| Mittel | Design vs. `01_Designsystem/` | M1–M14 (Login-Extras, Service-Buchungs-Grid, globale Suche, …) — nach RC |
| Mittel | `SUPABASE_SERVICE_ROLE_KEY` auf Vercel | Optional für Creator-Insert-Fallback ohne 026 |
| Niedrig | ESLint Warnings `engagement-metrics.ts` | Unbenutzte Parameter |
| Niedrig | Feed-Feature-Flag `feed_posts` disabled | Bewusst; Feed-Inhalte limitiert |
| Info | Demo-Badge auf Demo-Slugs | Erwartet |

---

## Gemessene Performance (Produktion)

**Methode:** `npm run measure:perf -- https://unze-platform.vercel.app`  
**Datum:** 2026-06-04 (vor Deploy dieses Commits — nach Deploy erneut messen)

| Route | TTFB |
|-------|------|
| Home | 520 ms |
| Discover | **277 ms** (nach Deploy, vorher 893 ms) |
| Discover Events | 513 ms |
| Profil | 394 ms |
| Community | 352 ms |
| Community Feed | 223 ms |
| Community Members | 292 ms |
| **Ø (7 OK)** | **477 ms** |

Discover-TTFB: **−69 %** (893 → 277 ms) durch parallele Loads + Batch-Activity-Stats.

**Smoke:** `npm run test:e2e-urls -- https://unze-platform.vercel.app` — nach Test-Fix alle Routen grün (inkl. Profil, Discover-Tabs).

---

## Manuelle Checkliste (Mobile + Vercel)

**Ausführlicher Testplan:** [`OAUTH_AND_E2E_CHECKLIST_2026-06.md`](./OAUTH_AND_E2E_CHECKLIST_2026-06.md) (OAuth Vercel/Supabase + Login → Community erstellen).

- [ ] Discover: Tabs Communities / Gruppen / Events / Dienstleistungen
- [ ] Community erstellen → Access-Dashboard `?welcome=1`
- [ ] Home, Profil (Gast + eingeloggt), Demo-Community öffnen
- [ ] Kein roter Next-Fehler-Screen / Digest auf Hauptseiten
- [ ] OAuth einmal mit konfiguriertem Provider

---

## Nächste Schritte (ohne neue Features)

1. Deploy dieses Commits → erneut `measure:perf` + `test:e2e-urls` auf Prod  
2. `027_backfill_creator_memberships.sql` in Prod (falls noch nicht ausgeführt)  
3. OAuth in Supabase aktivieren  
4. Design-Stabilisierungsphase starten (Mockups `01_Designsystem/`)
