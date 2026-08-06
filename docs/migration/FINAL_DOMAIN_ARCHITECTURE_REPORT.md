# UNZE - Abschlussbericht Domain, Routing, Landingpage & Performance

Stand: 20. Juni 2026  
Deployment: Production live (`dpl_BAjE5Wmhm2rjTTmfxdTqMmMMEAfg`)  
Verify: `npm run verify:domain` - **alle Checks bestanden**

---

## 1. Domain-Status (produktiv geprueft)

| Domain | Anzeige | Typ | Redirects |
|--------|---------|-----|-----------|
| **www.unze.app** | Landingpage (Hero, Verzeichnis, Events, Services) | Marketing | `/discover`, `/dashboard`, `/auth/*` -> www.unzeconnect.app |
| **unze.app** | - | Apex | 308 -> www.unze.app |
| **www.unzeconnect.app** | Plattform (Discover, Login, Dashboard) | App | `/communities`, `/events`, Legal -> www.unze.app |
| **unzeconnect.app** | - | Apex | 308 -> www.unzeconnect.app |
| **unze-platform.vercel.app** | Intern | Vercel-Alias | 308 -> www.unzeconnect.app (nicht im sichtbaren Marketing-HTML) |

### Env (Production, Vercel)

```
NEXT_PUBLIC_MARKETING_URL=https://www.unze.app
NEXT_PUBLIC_APP_URL=https://www.unzeconnect.app
```

---

## 2. Routing-Uebersicht

### Landingpage (www.unze.app)

| Route | Inhalt |
|-------|--------|
| `/` | Startseite mit Hero, Community-/Event-/Service-Vorschau, Creator-Bereich, Vorteile, CTA |
| `/communities` | Oeffentliches Community-Verzeichnis |
| `/community/[slug]` | Read-only Vorschau (Banner, Bewertungen, Events, Services, Auszeichnungen) |
| `/events` | Oeffentliche Events |
| `/services` | Oeffentliche Services |
| `/studio` | UNZE Studio / Business |
| `/impressum`, `/datenschutz`, `/kontakt`, `/business`, `/agb` | Legal |
| `/verzeichnis` | 308 -> `/communities` |

### Plattform (www.unzeconnect.app)

| Route | Inhalt |
|-------|--------|
| `/` | App-Home |
| `/discover` | Discover |
| `/auth/login` | Login / Registrierung |
| `/dashboard` | Creator Dashboard |
| `/profile` | Profil |
| `/community/[slug]` | Volle Community (Tabs, Join, Feed) |
| `/dashboard/crowd-partner` | Crowd Partner |
| Stripe, QR, Auszeichnungen, Zertifikate | unveraendert auf Plattform |

---

## 3. API-Trennung

### Oeffentlich (Landingpage)

| Endpunkt | Cache | Daten |
|----------|-------|-------|
| `GET /api/public/communities` | 60s | Verzeichnis, optional Stats |
| `GET /api/public/communities/[slug]` | 60s | Community-Vorschau |
| `GET /api/public/events` | 60s | Oeffentliche Events |
| `GET /api/public/services` | 60s | Oeffentliche Services |

Marketing-Seiten laden ueber `lib/marketing/public-client.ts` (API-first, Fallback fuer Build).

Backend-Layer: `lib/marketing/public-directory.service.ts` (nur oeffentliche Supabase-Queries).

### Geschuetzt (Plattform)

Alle anderen APIs, Server Actions, Dashboard, Stripe, Auth - Session + RLS.

---

## 4. Bundle-Trennung & Performance

### Massnahmen

| Massnahme | Wirkung |
|-----------|---------|
| Dynamic Import `MarketingShell` / `PlatformShell` | Getrennte Shell-Bundles |
| Dynamic Import `LandingPage` / `PlatformHome` | Startseite host-spezifisch |
| Dynamic Import `CommunityPlatformPage` | Marketing laedt keine 580-Zeilen-App-Community |
| Suspense + Lazy Events/Services auf Landing | Below-the-fold Code-Splitting |
| Keine Dashboard/Stripe/PWA-Imports in Marketing | Audit bestanden |
| ISR `revalidate = 60` | Caching oeffentlicher Seiten |

### Build-Ergebnisse (Production)

| Route | Page JS | First Load JS |
|-------|---------|---------------|
| `/` (Landing) | 2.15 kB | **136 kB** |
| `/communities` | 199 B | **111 kB** |
| `/events`, `/services` | ~195 B | **103-106 kB** |
| `/discover` (App) | 4.38 kB | **133 kB** |
| `/community/[slug]` (App) | 19.5 kB | 153 kB |

Shared JS: 102 kB. Middleware: 91 kB.

**Fazit:** Landing-Routen deutlich leichter als App-Routen. Keine Vermischung im Import-Audit.

---

## 5. Datenbank

- Bestehende Supabase-Produktions-DB - **unveraendert**
- Keine neuen Tabellen, keine Migration, keine Daten geloescht
- Landing: RLS + oeffentliche Queries (visibility public/premium, is_public)

---

## 6. Landingpage-Verbesserungen (Manus-Basis)

Objektive Ergaenzungen ohne Design-Bruch:

- Live-Stats im Hero (Communities, Mitglieder aus oeffentlicher API)
- Event- und Service-Vorschau auf Startseite
- Creator-Bereich mit Dashboard-Ansprache
- Community-Vorschau mit Verifizierung, Bewertungen, Auszeichnungen, PWA-Hinweis
- Navigation: Communities, Events, Services, UNZE Studio

---

## 7. Qualitaetspruefung

| Check | Ergebnis |
|-------|----------|
| `npm run typecheck` | Bestanden |
| `npm run check:utf8` | Bestanden |
| `npm run build` | Bestanden |
| `npm run audit:architecture` | Bestanden (keine verbotenen Marketing-Imports) |
| `npm run verify:domain` | **16/16 Routen + 7/7 Redirects bestanden** |
| Manus/CDN im App-Code | Keine (nur Migrations-Archiv) |
| vercel.app im Marketing-HTML | Keine (nach Env-Fix) |

### Cross-Domain-Redirects (live)

- www.unze.app/discover -> www.unzeconnect.app/discover
- www.unze.app/dashboard -> www.unzeconnect.app/dashboard
- www.unzeconnect.app/communities -> www.unze.app/communities
- unze.app -> www.unze.app
- unzeconnect.app -> www.unzeconnect.app
- unze-platform.vercel.app -> www.unzeconnect.app

---

## 8. Manus-Abhaengigkeiten

| Bereich | Status |
|---------|--------|
| Runtime (Live-Seiten) | Keine - Assets unter `/public/landing/` |
| CDN cloudfront.net | Nur in `public/landing-migration/` Archiv |
| Manus-Scripts | Nur Migrationstools (`scripts/migrate-manus-assets.mjs`) |

---

## 9. Optimierungsvorschlaege (optional, spaeter)

1. **Lighthouse CI** in GitHub/Vercel fuer Landing + Discover bei jedem Deploy
2. **Marketing-Manifest** separat (`scope: www.unze.app`) - aktuell Plattform-Manifest auf unzeconnect.app
3. **Edge-Caching** fuer `/api/public/*` via Vercel CDN Headers (bereits Cache-Control gesetzt)
4. **Kategorie-Filter** auf `/communities` clientseitig aktivieren (Tags derzeit nur visuell)

---

## 10. Relevante Dateien & Scripts

```
lib/constants/site.ts
middleware.ts
lib/marketing/public-client.ts
lib/marketing/public-directory.service.ts
app/api/public/*
components/community/CommunityPlatformPage.tsx
components/layout/SiteShell.tsx
scripts/verify-domain-production.mjs
scripts/audit-architecture.mjs
docs/migration/DOMAIN_VERIFICATION_REPORT.json
docs/migration/ARCHITECTURE_AUDIT_REPORT.json
```

### Befehle

```bash
npm run verify:domain
npm run audit:architecture
```

---

## Ziel erreicht

| Kriterium | Status |
|-----------|--------|
| Domain-Trennung live | Ja |
| Landing read-only + API | Ja |
| Performance-Code-Splitting | Ja |
| Deploy + Produktionstest | Ja |
| DB unveraendert | Ja |
| Manus entfernt (Runtime) | Ja |
