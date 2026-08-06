# UX Phase 2 - Abschlussbericht

Stand: Juni 2026  
Deployment: https://www.unze.app

## Ziel

Die oeffentliche Marketing-Oberflaeche von UNZE auf produktionsreifes Enterprise-Niveau bringen - ohne Architekturaenderungen an Connect, Business und Studio.

---

## Verbesserte Bereiche

### Landingpage (`/`)

- **Hero neu zentriert**: Fokus auf Marketing, nicht App/Dashboard
- **Community-Suche als zentrales Element**: Google-aehnliche Suchleiste direkt im Hero mit Live-Ergebnissen
- **9 Kategorie-Chips**: Bildung, Business, Entertainment, Fitness, Gaming, Handwerk, Musik, Fotografie, Technik
- Doppeltes Community-Grid entfernt (Suche + schlanker Teaser-Link zum Verzeichnis)
- Alle CTAs "App nutzen" verweisen auf UNZE Connect (`getAppEntryPath`), nicht mehr auf `/discover` in der Marketing-Navigation
- Typografie, Abstaende und Hero-Bild beibehalten/verfeinert

### Navigation & Footer

- Oeffentliche Nav: **Communities**, **UNZE Business**, **App nutzen** (Button)
- **Discover** aus Marketing-Navigation und CTAs entfernt
- **Events/Services** nicht in der Landing-Nav (bleiben Plattform-Pfade auf Connect)
- Footer "App nutzen" verlinkt korrekt auf die Plattform-Domain
- Keine doppelten Header/Footer auf Marketing-Seiten (weiterhin eine `MarketingShell`)

### Community-Verzeichnis (`/communities`)

- Gleiche Suchkomponente wie Landing, mit bis zu 48 Ergebnissen
- Kategorie-Filter integriert
- CTAs: App nutzen + Projekt anfragen

### Community-Detailseiten (`/community/[slug]` auf Marketing-Domain)

- **UX-Redesign**:
  - Banner rein visuell (kein Text-Overlap)
  - Titel, Badges, Beschreibung und Stats **unter** dem Banner
  - Kein `-mt-8`-Overlap mehr
  - Stat-Kacheln in klarem 4er-Grid
  - Inhaltssektionen in weissen Cards auf grauem Hintergrund
- **Discover-Button entfernt** aus `MarketingCtaBar`
- CTAs: "Community oeffnen" (Connect) + "Projekt anfragen" (Business)
- **Leere Sektionen** zeigen erklaerende Platzhalter statt zu verschwinden (Events, Gruppen, Services, Auszeichnungen, Bewertungen)
- Aktivitaetsstatus-Badge (Live / Oeffentlich gelistet)

### UNZE Business (`/business`)

- Deutsche Texte in `business-copy.ts` korrigiert (Umlaute via Unicode-Escapes)
- FAQ ohne oeffentliche Erwaehnung von UNZE Studio

### Interne Bereiche (Studio/Admin)

- **`StudioShell`**: Admin und Studio ohne Marketing-Header/Footer
- `/admin`: oeffentlich nur "Admin-Zugang", kein Studio-Branding in der Marketing-Nav
- Studio bleibt nicht indexiert (`robots: noindex`)

### Community-Karten & Bilder

- Weiterhin: `CommunityVisualBanner` + Kategorie-Presets - **keine leeren Karten**
- Showcase-Fallback bei fehlenden Live-Daten

### Texte

- Marketing- und Business-Copy auf korrektes Deutsch (Umlaute, Gedankenstriche)
- Technische UTF-8-Kompatibilitaet fuer Windows-Builds (Unicode-Escapes in `.ts`-Copy-Dateien)

---

## Behobene UX-Probleme

| Problem | Loesung |
|---------|---------|
| Statistiken ueberlappten Banner | Stats unter Banner, kein negatives Margin |
| Discover an falscher Stelle (Marketing) | Entfernt; App-CTA fuehrt zu Connect |
| Community-Suche nicht prominent | Zentrale Hero-Suche auf Landing + Verzeichnis |
| Leere/fehlende Community-Inhalte wirkten unfertig | Platzhalter-Sektionen mit klarer App-Hinweis |
| Doppelte Community-Listen auf Landing | Eine Live-Suche, kompakter Verzeichnis-Link |
| Studio in oeffentlicher Marketing-Shell | Eigene interne Shell fuer Admin/Studio |
| ASCII-Umlaute (ermoeglichen, oeffnen) | Korrekte deutsche Texte in Copy-Dateien |
| MarketingCtaBar mit Discover | Nur App/Community oeffnen + Business |

---

## Designentscheidungen

1. **Eine Suchkomponente** (`LandingCommunitySearch`) fuer Landing und Verzeichnis - Wiederverwendung statt paralleler Loesung
2. **Kategorie-Aliases** fuer flexible Zuordnung zu DB-Kategorien (z. B. Technik -> Technologie)
3. **Marketing vs. Plattform**: Landing zeigt nur oeffentliche Read-only-Daten; alle Aktionen verlinken auf Connect oder Business
4. **Visuelle Hierarchie Community-Seite**: Banner -> Meta -> Stats -> CTAs -> Inhaltsbloecke
5. **Showcase-Daten** nur wenn API leer - nie leere Grids
6. **Performance**: Lazy-loaded Search auf `/communities`, bestehende API ohne Doppelabfragen auf Landing-Stats

---

## Architektur (unveraendert)

- UNZE Connect: Plattform (`unzeconnect.app`)
- UNZE Business: Marketing/Anfragen (`unze.app/business`)
- UNZE Studio: intern (`/admin`, `/studio/app`)
- Eine Supabase-DB, read-only Public API fuer Marketing

---

## Offene Punkte (naechste Phasen)

1. **Plattform-UI (Connect)**: Discover, Dashboard, Community-App-Oberflaeche - eigene UX-Phase auf Connect-Domain
2. **Events/Services-Routen** auf Marketing (`/events`, `/services`): optional Redirect auf `/communities` oder Entfernung
3. **Feinjustierung Kategorie-Mapping** wenn neue DB-Kategorien hinzukommen
4. **Animierte Micro-Interactions** (dezent) fuer Hero und Karten-Hover - bei Bedarf mit CSS-only
5. **Echte Community-Bilder** in Produktion: je mehr Live-Communities, desto weniger Showcase-Fallback
6. **Business E-Mail-Benachrichtigung**: `BUSINESS_NOTIFY_EMAIL` + `RESEND_API_KEY` in Vercel
7. **Studio MVP**: vollstaendige Projektverwaltung (aktuell Anfragen-Liste)
8. **UTF-8 Build-Pipeline**: optional `.editorconfig` / CI-Check fuer reine UTF-8-Dateien

---

## Verifikation

Nach Deployment ausfuehren:

```bash
npm run verify:domain
npm run verify:business
```

Erwartung: Landing mit Hero-Titel "Communities, die professionell wirken", Suche sichtbar, Connect-Home ohne Marketing-Redirect.
