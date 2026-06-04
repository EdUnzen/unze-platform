# UNZE Release Candidate – Abschlussbericht (04.06.2026)

## Erledigt

### 1. Community-Erstellung
- Admin-Client zuerst, User-Client als Fallback (`community.repository.ts`)
- `ensureUserProfile()` vor Insert
- Creator-Mitgliedschaft via Admin (`member.repository.ts`)
- Client-Redirect über `redirectTo` + `router.push()` (kein `redirect()` in `useActionState`)
- Insert-Varianten ohne fehlende Spalten (`access_status`, `monetization_enabled`, `discover_enabled`)
- Nutzerfreundliche Fehlermeldungen

### 2–4. Monetarisierung & Sichtbarkeit
- `visibility-rules.ts`: Discover nur öffentlich/Premium, Privat → `invite_only`, Create immer `monetization_enabled: false`
- Formular: Hinweise pro Option, Discover-Checkbox nur bei öffentlich/Premium, Info „startet kostenlos“
- Migration `028_premium_transition_schedule.sql` + `npm run db:migrate:028`
- Creator-Dashboard: `PremiumTransitionPanel` (geplantes Datum, Mitglieder informieren)

### 5–7. Banner
- 3–5 Presets pro Kategorie (`category-banners.ts`)
- Upload als Hauptweg (`CommunityBannerUpload`, multipart)
- Kategorie-Fallback ohne leere Header (`CommunityCoverVisual`)

### 8–14. UX
- Bewertungen im Header (`RatingSummary` alwaysShow)
- Level-Badges mit Symbolen (`CommunityLevelBadge`)
- Focus-Tags mit Farben (`CommunityFocusChips`)
- Discover-Karten ~50 % höheres Banner
- Mobile Tabs 3×2 Grid mit Icons (`CommunityPageTabs`)
- Profil-Avatar höher im Banner (`ProfileHub`)
- Plattform-Icons: aktiv = farbig

### 15. Performance
- Parallele Enrichment/Profile-Fetches
- Schema-Probe-Cache 300s
- `npm run measure:perf` dokumentiert in `PERFORMANCE_SPRINT_2026-06-04.md`

## Offen / manuell

| Punkt | Aktion |
|--------|--------|
| Migration 028 auf Prod | `npm run db:migrate:028` mit `SUPABASE_DB_PASSWORD` |
| Vercel | `SUPABASE_SERVICE_ROLE_KEY` in Production prüfen |
| Stripe Live | Vorbereitet, keine vollständige Abrechnungslogik |
| Premium-Umstellung Benachrichtigung | UI + DB-Felder; E-Mail/Push später |
| E2E auf Prod | Einmal eingeloggt Community erstellen testen |

## Testergebnis

| Check | Ergebnis |
|--------|----------|
| `npm run typecheck` | ✅ |
| `npm run build` | ✅ |
| `npm run verify:community-create` | ✅ (lokal mit Service Role) |

## Build

- Next.js 15.5.18 – kompiliert ohne Fehler
- Monetization-Route: 5.21 kB (Panel erweitert)

## Release-Status

**Release Candidate** – stabil für Deploy nach Migration 028 + Vercel-Env-Check.

**URL:** https://unze-platform.vercel.app
