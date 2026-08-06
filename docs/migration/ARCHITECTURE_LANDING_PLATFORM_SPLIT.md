# Architektur: Landingpage und Plattform

Stand: Juni 2026

## Grundprinzip

| Domain | Rolle |
|--------|--------|
| **www.unze.app** | Oeffentliche Landingpage (Marketing, SEO, Verzeichnis, Legal, Business) |
| **www.unzeconnect.app** | UNZE-Plattform (Communities, Dashboard, Stripe, Schreibzugriff) |

Beide laufen im **gleichen Next.js-Projekt** auf Vercel. Die Trennung erfolgt ueber Host-Erkennung in `middleware.ts` und `lib/constants/site.ts`.

Die **Supabase-Produktionsdatenbank bleibt unveraendert**. Es werden keine Tabellen verschoben.

## Datenfluss

```
www.unze.app          read-only  ???  Supabase (public/premium sichtbare Daten)
www.unzeconnect.app   read/write ???  Supabase (voller Zugriff via RLS + Auth)
```

### Landingpage darf lesen

- Community-Name, Beschreibung, Banner, Mitgliederanzahl
- Verifizierungsstatus, Bewertungen
- Oeffentliche Events und Services
- Oeffentliche Statistiken (Discover-Vorschau)

### Landingpage darf nicht

- Dashboard, Zahlungen, Admin, interne Mitgliederdaten
- Schreibvorgaenge jeder Art

Implementierung: `lib/marketing/public-directory.service.ts`

## Routing

### Marketing-Host (`www.unze.app`)

Erlaubte Pfade:

- `/` � Landingpage
- `/verzeichnis` � Community-Verzeichnis
- `/community/[slug]` � Read-only Vorschau (`MarketingCommunityPreview`)
- `/impressum`, `/datenschutz`, `/kontakt`, `/business`, `/agb`

Plattform-Pfade (`/discover`, `/auth/*`, `/dashboard/*`, �) werden per Middleware nach **www.unzeconnect.app** umgeleitet.

### Plattform-Host (`www.unzeconnect.app`)

- Volle App-Logik inkl. `/community/[slug]` mit Tabs, Join, Dashboard
- Legal-/Business-Pfade werden nach **www.unze.app** umgeleitet

## Links

Marketing-Komponenten nutzen `MarketingLink` / `platformUrl()` fuer CTAs zur Plattform:

- App nutzen ? `https://www.unzeconnect.app/discover`
- Login/Register ? `https://www.unzeconnect.app/auth/login`
- Community beitreten ? `https://www.unzeconnect.app/community/[slug]`

## Umgebungsvariablen (Production)

```
NEXT_PUBLIC_MARKETING_URL=https://www.unze.app
NEXT_PUBLIC_APP_URL=https://www.unzeconnect.app
```

Sync: `node scripts/sync-vercel-env.mjs`

## Vercel-Domains

Beide Domains am gleichen Vercel-Projekt:

- `www.unze.app` + `unze.app` ? Marketing
- `www.unzeconnect.app` + `unzeconnect.app` ? Plattform

`vercel.json` leitet Apex-Domains auf www-Subdomains um.

## Business-Bereich

`/business` auf der Landingpage. Eigene Datenstruktur spaeter � **kein Einfluss** auf Plattform-DB.

## Verifikation

```bash
npm run verify:domain              # beide Domains
npm run verify:domain -- --marketing
npm run verify:domain -- --platform
```

Report: `docs/migration/DOMAIN_VERIFICATION_REPORT.json`

## Relevante Dateien

- `lib/constants/site.ts` � Host-Erkennung, URL-Helfer
- `middleware.ts` � Cross-Domain-Redirects, Site-Header
- `lib/marketing/public-directory.service.ts` � Read-only API
- `components/landing/MarketingCommunityPreview.tsx` � Community-Vorschau
- `app/verzeichnis/page.tsx` � Verzeichnis
- `components/landing/MarketingLink.tsx` � Plattform-Links
