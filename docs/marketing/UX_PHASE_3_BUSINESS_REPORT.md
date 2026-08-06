# UX Phase 3 - Business Premium & Shell-Fix Abschlussbericht

Stand: Juni 2026
Live: https://www.unze.app/business

## Zusammenfassung der Aenderungen

### Kritischer Fix: Doppelter Header/Footer

**Ursache:** `app/layout.tsx` wickelt alle Seiten in `SiteShell` (MarketingShell). Zusaetzlich nutzten `/business` und `/business/anfrage/erfolg` eine **zweite** `MarketingShell` - doppelte Navigation und doppelter Footer.

**Loesung:**
- `MarketingShell` aus Business-Seiten entfernt
- `SiteShell` erweitert: interne Routen (`/admin`, `/studio/app`) erhalten **keine** Marketing-Navigation
- Middleware setzt `x-unze-pathname` fuer pfadbasierte Shell-Entscheidung

### UNZE Business Premium-Redesign

Neue zentrale Komponente: `components/business/BusinessLandingPage.tsx`

| Bereich | Umsetzung |
|---------|-----------|
| Hero | Dunkler Premium-Hero, emotionale Copy, Geraete-Mockup mit Connect-Vorschau |
| Leistungen | Icon-Karten mit Hover-Lift und Farbwechsel |
| Ablauf | 7-Schritte-Timeline (mobil vertikal, Desktop horizontal) |
| Referenz | UNZE Connect als Live-Demoprojekt + Warum-UNZE-Block |
| Communities | Wiederverwendung `LandingCommunitySearch` |
| Plattform-Funktionen | 6 Feature-Karten mit Icons und Erklaerung |
| Servicepakete | Premium Cards mit Benefits, Highlight "Empfohlen" |
| Kontakt | 2-Spalten: Vorteile links, Formular rechts |
| FAQ | Accordion (einklappbar, nicht dauerhaft offen) |

### Navigation & Trennung

- Marketing-Nav unveraendert minimal: Communities, UNZE Business, App nutzen
- Discover/Events/Services/Studio nicht in oeffentlicher Nav
- Studio intern: `/admin` (Admin-Zugang), `/studio/app` nach Login, `/studio` -> Redirect `/business`

### Communities

- Kategorie **Sport** ergaenzt (10 Kategorien)
- Bild-Pflicht weiterhin via `CommunityVisualBanner` + Presets

### Texte

- `business-copy.ts` vollstaendig mit korrekten Umlauten (Unicode-Escapes)
- Loesungsorientierte, emotionale Headlines

---

## Behobene Fehler

1. **Doppelter Footer/Header** auf `/business` und Erfolgsseite
2. **Marketing-Nav auf Admin/Studio** (SiteShell umwickelte interne Seiten)
3. **Schlichte Business-UI** -> Premium-Agentur-Design
4. **FAQ dauerhaft offen** -> Accordion
5. **Kontaktformular ohne Kontext** -> 2-Spalten-Layout
6. **Plattformfunktionen als Tags** -> Feature-Karten
7. **Prozess als Pill-Buttons** -> Timeline
8. **Fehlende Sport-Kategorie** in Suche

---

## Designentscheidungen

- **Keine neue UI-Bibliothek** - Lucide-Icons + Tailwind (Performance)
- **Lazy Loading** fuer Suche und Formular auf Business-Seite
- **Unsplash nur im Hero-Mockup** (bereits in `remotePatterns`)
- **Wiederverwendung** `LandingCommunitySearch` statt paralleler Business-Suche
- **StudioShell** nur fuer interne Seiten, getrennt von Marketing

---

## UI/UX-Bewertung (neue Version)

| Kriterium | Vorher | Nachher |
|-----------|--------|---------|
| Vertrauen / Premium | 5/10 | 8/10 |
| Emotion / Loesungsverkauf | 4/10 | 8/10 |
| Navigation-Klarheit | 6/10 (Doppel-Footer) | 9/10 |
| Business-Conversion | 6/10 | 8/10 |
| Plattform-Trennung | 8/10 | 9/10 |

**Gesamt:** Die Business-Seite wirkt nun wie eine moderne Digitalagentur-Landingpage mit klarer Trennung zur Connect-Plattform.

---

## Performance

- Business First Load JS: ~124 kB (lazy Suche + Formular)
- Keine Framer-Motion / schwere Animations-Libraries
- CSS-only Hover/Transitions
- Hero-Bild mit `priority`, rest lazy
- Build erfolgreich, Bundle-Groesse stabil

Empfehlung: Lighthouse auf `/business` nach Deploy manuell pruefen (LCP Hero-Bild).

---

## UNZE Studio - Funktionspruefung

| Check | Status |
|-------|--------|
| Route `/studio` | Redirect -> `/business` |
| Route `/admin` | Admin-Zugang, kein Marketing-Header |
| Route `/studio/app` | Interne Shell, Login erforderlich |
| Login API | `/api/studio/auth/login` unveraendert |
| Oeffentliche Nav | Kein Studio-Eintrag |

---

## Offene Punkte

1. Connect-Plattform-UI (Discover, Dashboard) - eigene UX-Phase
2. Community-Detailseiten weiter anreichern (mehr Live-Daten)
3. Eigene Business-Hero-Grafik statt Unsplash (Brand-Asset)
4. `/events`, `/services` auf Marketing optional redirecten
5. Lighthouse-Audit dokumentieren
6. `BUSINESS_NOTIFY_EMAIL` + Resend in Vercel

---

## Geaenderte Dateien (Auswahl)

- `components/layout/SiteShell.tsx`
- `middleware.ts`
- `lib/constants/site.ts`
- `app/business/page.tsx`
- `components/business/BusinessLandingPage.tsx`
- `components/business/BusinessFaqAccordion.tsx`
- `lib/constants/business-copy.ts`
- `lib/constants/landing-copy.ts` (Sport)
- `app/business/anfrage/erfolg/page.tsx`
