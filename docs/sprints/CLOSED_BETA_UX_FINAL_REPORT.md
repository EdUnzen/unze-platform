# UNZE — Finaler UX- und Startseiten-Statusbericht

**Datum:** 13. Juni 2026  
**Version:** `0.3.0-beta.1`  
**Feature-Freeze:** aktiv — nur Qualität, UX, Stabilität

---

## Zusammenfassung

Die Closed-Beta wurde um ein professionelles Startseiten-Erlebnis, einheitliche Plattform-Texte, Auth-Fehler-Sanitisierung und Service-Tests ergänzt. Build und alle automatisierten Tests sind grün.

| Bereich | Status |
| --- | --- |
| Home-Hero (offizielles Designbild) | ✅ Umgesetzt |
| Gast-Startseite (Community-Fokus) | ✅ Umgesetzt |
| Landing ↔ App (Farben, Texte) | ✅ Abgestimmt |
| Service-Modul (DB + URLs) | ✅ Getestet |
| Auth / Verifizierung (Nutzer-Meldungen) | ✅ Bereinigt |
| Build | ✅ Erfolgreich |
| Deployment | ✅ Siehe unten |

---

## 1. Neues Startbild (Home-Hero)

**Asset:** `public/brand/unze-home-hero.png` (aus `01_DESIGN_SYSTEM/ff025ab4-…png`)

**Umsetzung:**
- Neue Komponente `components/home/HomeHero.tsx` mit Next.js `Image`, Priorität für LCP
- Gradient-Overlay (`from-black/85`) für Lesbarkeit von Text und Buttons
- `object-cover object-center` — UNZE-Logo bleibt auf Mobile zentriert, kein harter Zuschnitt der Mitte
- Varianten: `guest` (Anmelden + Registrieren) und `member` (Discover-CTA)
- Ersetzt Unsplash-Stockfoto für eingeloggte Nutzer

**Mobile:** Min-Höhe 220px (sm: 260px, md: 300px), Buttons mit ausreichend Touch-Target, Text über dunklem Overlay.

---

## 2. Home für nicht eingeloggte Nutzer

**Vorher:** Leere Gradient-Karte + kurzer Text + Community-Liste ohne Kontext.

**Nachher:**
- Hero mit Plattform-Bild und klaren CTAs
- `HomeValueProps` — 4 Säulen (Communities, Gruppen, Events, Services) mit Icons und Deep-Links zu Discover
- Discover-Communities und Service-Vorschau aus der DB
- Abschluss-CTA „Bereit für dein Community-Netzwerk?“

**Ziel erreicht:** Nutzer verstehen vor dem Login, was UNZE ist und wofür Communities hier organisiert werden.

---

## 3. Landingpage ↔ App Abstimmung

**Einheitliche Texte:** `lib/constants/platform-copy.ts`
- `PLATFORM_TAGLINE`, `PLATFORM_DESCRIPTION`, `HOME_VALUE_PROPS`
- Verwendet in: Startseite (`app/page.tsx`), Login (`app/auth/login/page.tsx`), Hero

**Design:** Grün `#1DB872`, helle Karten, gleiche Typografie — konsistent mit Design System V1.

---

## 4. Service-System — Testlauf

**Script:** `npm run test:services` → `docs/sprints/SERVICE_E2E_REPORT.md`

| Schritt | Ergebnis |
| --- | --- |
| Demo-Services in DB (Einzelcoaching, Meta Ads Audit) | ✅ |
| Discover-Query (`group_type = service`) | ✅ |
| Service deaktivieren / reaktivieren | ✅ |
| Service bearbeiten (Beschreibung) | ✅ |
| Discover Services URL | ✅ HTTP 200 |
| Service-Detailseite | ✅ HTTP 200 |

**Hinweis:** Demo-Services wurden via `npm run seed:demo` ergänzt (bestehende Demo-Daten unverändert gelassen).

**Creator-Flows (manuell / Dashboard):** Erstellen, Bearbeiten, Deaktivieren über bestehendes Dashboard — unverändert, DB-Tests bestätigen CRUD auf Gruppenebene.

**Mobile:** Service-Karten nutzen bestehendes Discover-Layout (horizontal scroll, Touch-Targets).

---

## 5. Verifizierung / Auth

**Neu:** `lib/auth/user-facing-errors.ts` — `mapAuthError()`, `authNotConfiguredMessage()`

**Bereinigt in:**
- `app/auth/actions.ts` (Login, Registrierung, OAuth)
- `app/auth/password-actions.ts` (Reset, Update)
- `app/auth/callback/route.ts` (keine rohen Supabase-Messages in URL)
- `app/auth/login/page.tsx`, `forgot-password`, `reset-password`

**Nutzer sehen nicht mehr:** Supabase, Vercel, API, Datenbankfehler — nur professionelle UNZE-Meldungen.

| Flow | Status |
| --- | --- |
| Registrierung | ✅ Freundliche Erfolgs-/Fehlermeldungen |
| Login | ✅ „E-Mail oder Passwort falsch“ statt Raw-Error |
| E-Mail-Verifizierung | ✅ Callback ohne Technik-Details |
| Passwort-Reset | ✅ Sanitisierte Meldungen |

---

## 6. Automatisierte Tests

| Test | Ergebnis |
| --- | --- |
| `npm run typecheck` | ✅ |
| `npm run lint` | ✅ (bestehende Demo-Warnungen) |
| `npm run build` | ✅ |
| `npm run test:join-flow` | ✅ 8/8 |
| `npm run test:event-tickets` | ✅ 10/10 |
| `npm run test:services` | ✅ 11/11 |
| `npm run test:e2e-urls` | ✅ 13/13 (inkl. Discover Services) |

---

## 7. Bekannte Einschränkungen (Beta)

- Kostenlose Service-Buchung (`confirmFreeServiceBookingAction`) bestätigt UI-seitig — Persistenz folgt in späterem Sprint
- Ticket-Storno nur unter `/profile/tickets` (akzeptiert für Beta)
- „Trending“-Label auf Discover-Karten noch Englisch (niedrige Priorität)

---

## 8. Deployment

**Production:** https://unze-platform.vercel.app  
**Commit:** siehe Git-Tag nach Push

---

## Geänderte / neue Dateien (Kern)

- `public/brand/unze-home-hero.png`
- `components/home/HomeHero.tsx`, `HomeValueProps.tsx`, `HomeHub.tsx`
- `lib/constants/platform-copy.ts`, `lib/auth/user-facing-errors.ts`
- `app/page.tsx`, Auth-Dateien unter `app/auth/`
- `scripts/test-service-e2e.mjs`, `npm run test:services`

---

*Feature-Freeze bleibt aktiv — Fokus: Qualität, Stabilität, UX, Mobile, Service-Modul, Startseiten-Erlebnis.*
