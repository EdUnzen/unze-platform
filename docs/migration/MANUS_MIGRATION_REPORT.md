# UNZE � Manus-Migration Abschlussbericht

Erstellt: 2026-06-21  
Status: **Migration implementiert � Vercel-Domain-Umstellung ausstehend**

---

## Zielarchitektur

| Domain | Rolle |
|--------|--------|
| **www.unze.app** | Offizielle Landingpage + Plattform (Cursor/Next.js) |
| **unzeconnect.app** | Archiviert ? Redirect auf www.unze.app/discover |
| **unze-platform.vercel.app** | Vercel-Deployment-URL (technisch, optional als Alias) |

---

## �bernommene Inhalte (von www.unze.app / Manus)

### Layout & Navigation
- Header: Logo, Communities, UNZE Business, CTA �App nutzen�
- Footer: Plattform-, Rechts-, Kontakt-Links
- Hero, Community-Teaser, �Was ist UNZE?�, Features, CTA

### Texte & SEO
- Titel: �UNZE � Finde deine Community�
- Meta-Description, Open Graph, Twitter Cards
- Rechtstexte: Impressum, Datenschutz (1:1 aus Manus extrahiert)
- AGB (strukturiert �bernommen, Beta-angepasst)
- Kontaktseite (neu � auf Manus war /kontakt 404)

### Assets (lokal, ohne Manus-CDN)
| Datei | Quelle |
|-------|--------|
| `public/landing/unze-logo.png` | Manus CloudFront ? lokal |
| `public/landing/hero-light.webp` | Manus CloudFront ? lokal |
| `public/landing/about-people.webp` | Manus CloudFront ? lokal |
| `public/landing/cta-community.webp` | Manus CloudFront ? lokal |
| `public/landing/favicon.ico` | www.unze.app |
| `public/landing/apple-touch-icon.png` | www.unze.app |

Extraktion: `scripts/extract-manus-landing.mjs`, `scripts/migrate-manus-assets.mjs`  
Rohdaten: `public/landing-migration/extracted/*.json`

---

## Neue Dateien im Cursor-Projekt

### App-Routen
- `app/page.tsx` � Host-basiert: Marketing-Landing vs. Plattform-Home
- `app/impressum/page.tsx`
- `app/datenschutz/page.tsx`
- `app/kontakt/page.tsx`
- `app/business/page.tsx`
- `app/agb/page.tsx`
- `app/robots.ts`, `app/sitemap.ts`

### Komponenten
- `components/landing/MarketingShell.tsx`
- `components/landing/MarketingHeader.tsx`
- `components/landing/MarketingFooter.tsx`
- `components/landing/LandingPage.tsx`
- `components/landing/LegalPage.tsx`
- `components/layout/SiteShell.tsx`

### Konfiguration & Copy
- `lib/constants/site.ts` � Domain-Routing
- `lib/constants/landing-copy.ts`
- `lib/constants/legal-content.ts`
- `middleware.ts` � Legacy-Redirect + Site-Modus
- `vercel.json` � Redirects unzeconnect.app ? unze.app

---

## Ge�nderte Konfigurationen

| Bereich | �nderung |
|---------|----------|
| `app/layout.tsx` | SiteShell statt PlatformShell; metadataBase, OG/Twitter |
| `public/manifest.json` | start_url ? `/discover`, Beschreibung angepasst |
| `vercel.json` | Redirects f�r unze.app, unzeconnect.app |
| Env (empfohlen) | `NEXT_PUBLIC_APP_URL=https://www.unze.app` |
| Env (empfohlen) | `NEXT_PUBLIC_MARKETING_URL=https://www.unze.app` |

---

## Domain-Einstellungen (manuell in Vercel)

Nach Deploy:

1. **Vercel-Projekt** `unze-platform` ? Settings ? Domains  
   - `www.unze.app` hinzuf�gen (Primary)  
   - `unze.app` ? Redirect auf www (in vercel.json)  
   - `unzeconnect.app` ? 308 Redirect auf `/discover` (vercel.json)

2. **DNS** bei Domain-Registrar  
   - `www.unze.app` ? CNAME `cname.vercel-dns.com`  
   - Altes Manus-Deployment von unze.app entfernen

3. **Manus-Projekt** deaktivieren / Domain trennen

4. Env sync: `npm run sync:vercel-env` mit `NEXT_PUBLIC_APP_URL=https://www.unze.app`

---

## Manus-Abh�ngigkeiten � Pr�fung

| Pr�fpunkt | Status |
|-----------|--------|
| Manus Runtime (`manus-runtime` Script) | **Entfernt** � nicht im Cursor-Code |
| Manus CloudFront CDN URLs in App | **Entfernt** � Assets lokal unter `/landing/` |
| Manus API f�r Community-Liste | **Ersetzt** � Supabase `getDiscoverCommunitiesPreview()` |
| Links zu unzeconnect.app | **Ersetzt** � `/discover` und `/auth/login` |
| Builds �ber Manus | **Nicht mehr n�tig** � `npm run build` |
| Deployments �ber Manus | **Nicht mehr n�tig** � Vercel |

### Verbleibende Referenzen (nur Dokumentation/Archiv)

- `roadmap/phase1/PHASE_1_ANALYSIS.md` � historische Erw�hnung
- `public/landing-migration/` � Migrations-Rohdaten (optional l�schen nach Freigabe)
- `_tmp/unze-app.html` � Manus-HTML-Archiv (nicht deployed)

**Fazit:** Keine technische Laufzeit-Abh�ngigkeit zu Manus im produktiven App-Code.

---

## Datenbank

- **Keine neue Datenbank**
- **Kein Schema-Wechsel**
- Bestehende Supabase-Produktions-DB unver�ndert weiterverwendet

---

## Abschluss-Checkliste

- [x] Landingpage in Next.js implementiert
- [x] Legal-Seiten (Impressum, Datenschutz, Kontakt, AGB, Business)
- [x] SEO (metadataBase, OG, robots, sitemap)
- [x] Favicons & Marketing-Assets lokal
- [x] unzeconnect.app Redirect konfiguriert
- [x] Manus-CDN-Abh�ngigkeiten entfernt
- [ ] **www.unze.app auf Vercel-Projekt zeigen lassen** (DNS + Vercel Domains)
- [ ] **Manus-Deployment endg�ltig abschalten**
- [ ] Produktions-Deploy mit Marketing-Modus testen

---

## NPM-Befehle

```bash
npm run migrate:manus-assets   # Assets von unze.app laden
node scripts/extract-manus-landing.mjs  # Inhalte extrahieren
npm run build                  # Production Build
```

---

## App-Einstieg (ersetzt unzeconnect.app)

Alle �App nutzen�-Links zeigen auf:
- `/discover` � Community-Entdeckung
- `/auth/login` � Creator-/Mitglieder-Login
