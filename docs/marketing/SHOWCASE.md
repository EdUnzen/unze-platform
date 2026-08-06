# Marketing Showcase — Screenshot-Overload-System

> **SSOT-Katalog:** `showcase-catalog.json` · **Studio-UI:** `/studio/app/marketing`  
> **Ausgabe:** `raw-screens/showcase/{category}/{id}[-desktop|-ipad].png`

---

## Was ist das?

Ein einheitliches System, um **Marketing-Screenshots** für alle UNZE-Bereiche zu erfassen und zu organisieren:

| Kategorie | Inhalt |
|-----------|--------|
| **business** | unze.app/business — Hub, Analyse, Preise, Webseiten |
| **template** | Business Core, Branchenlösungen |
| **connect** | Community-App — Discover, Dashboard, Communities |
| **studio** | Internes Cockpit — Übersicht, Leads, Angebote, Kunden |

Nicht alles muss fertig sein — der Katalog markiert, was **bereit** ist und was noch fehlt.

---

## Schnellstart

```bash
# Dev-Server muss laufen (Port 3000)
cd "Desktop/UNZE/UNZE APP/UNZE"

# Alle lokalen Showcase-Screens (Business + Connect + Studio)
npm run marketing:capture:overload

# Nur Business
npm run marketing:capture:business

# Nur Studio (STUDIO_PASSWORD setzen!)
$env:STUDIO_PASSWORD="dein-passwort"
npm run marketing:capture:studio

# Einzelnes Item
node scripts/marketing/capture-showcase.mjs --id=business-start
```

**Studio-Login:** `STUDIO_EMAIL` (Default: `support@unze.app`) + `STUDIO_PASSWORD`  
**Connect-Login:** `DEMO_EMAIL` / `DEMO_PASSWORD` (wie bisherige Marketing-Pipeline)

---

## Werbevideos (Slideshow)

Aus Showcase-Screenshots automatisch **Reels/Shorts** (9:16) oder **LinkedIn** (16:9):

```bash
# 1. Screenshots (falls noch leer)
npm run marketing:capture:overload

# 2. Videos rendern
npm run marketing:video:slideshow        # alle Slideshows
npm run marketing:video:business         # nur Business-Reel
npm run marketing:video:studio           # nur Studio-Reel
npm run marketing:video:connect          # nur Connect-Reel

# Alles in einem Schritt:
npm run marketing:video:all
```

**Ausgabe:** `docs/marketing/output/videos/`  
Dateien: `business-reel.webm` (+ `.mp4` wenn ffmpeg installiert)

Konfiguration: `showcase-slideshows.json`

---

## Wo liegen die Bilder?

| Was | Pfad (im UNZE-App-Ordner) |
|-----|---------------------------|
| **Showcase-Screenshots** | `docs/marketing/raw-screens/showcase/` |
| **Werbevideos** | `docs/marketing/output/videos/` |
| **Connect Mockups** | `docs/marketing/output/tiktok/`, `features/` |
| **Connect Roh-Screens** | `docs/marketing/raw-screens/marketing/` |
| **Studio-Checkliste** | `/studio/app/marketing` (nur Navigation, keine Dateien) |

Der Explorer-Pfad auf deinem PC:
`Desktop\UNZE\UNZE APP\UNZE\docs\marketing\raw-screens\showcase\`

---

## npm Scripts

| Script | Beschreibung |
|--------|--------------|
| `marketing:capture:showcase` | Alle Items aus dem Katalog (gefiltert) |
| `marketing:capture:business` | Nur `business` + `template` |
| `marketing:capture:connect` | Nur `connect` |
| `marketing:capture:studio` | Nur `studio` |
| `marketing:capture:overload` | Alle lokalen Items (`base: local`) |
| `marketing:capture` | Legacy Connect-Pipeline (21 Routen, Graphics-Pack) |

---

## Ausgabe-Ordner

```
docs/marketing/
├── showcase-catalog.json          ← SSOT (IDs, Routen, eBay-Pakete)
├── raw-screens/
│   ├── showcase/                  ← NEU: Business + Studio + Connect
│   │   ├── business/
│   │   ├── connect/
│   │   ├── studio/
│   │   ├── template/
│   │   └── manifest.json
│   └── marketing/                 ← Legacy Connect-Captures
├── screenshots/                   ← Portfolio (marketing:capture)
└── output/                        ← Composites, eBay-Export
    └── ebay/P-K01/                ← Manuelle Ablage für eBay-Bilder
```

---

## Studio-Benutzerführung

Im Studio unter **Marketing** (`/studio/app/marketing`):

- Checkliste aller Screens mit Priorität und Status
- Direktlinks mit `?marketing=1` (keine Overlays)
- Copy-Buttons für npm-Befehle und URLs
- Zuordnung zu eBay-Publish-Paketen (T01, P-K01, …)

---

## Katalog erweitern

1. Eintrag in `showcase-catalog.json` anlegen
2. `id`, `route`, `category`, `viewports`, `publishPaket` setzen
3. `npm run marketing:capture:showcase -- --id=neue-id` testen
4. CORSA `marketing-showcase-index.md` aktualisieren (Publish-Paket-Verknüpfung)

---

## Verknüpfung CORSA Publish-Pakete

| Publish-Paket | Showcase-IDs (Beispiele) |
|---------------|--------------------------|
| **P-K01 / T01** | `business-start`, `business-webseiten` |
| **P-K02** | `business-analyse`, `business-core` |
| **B01** | `connect-home`, `connect-discover`, `connect-dashboard` |
| **M01–M05** | Studio-Übersicht, Business-Preise, Connect-Features |

Details: `CORSA Master Standard/PROJEKTE/UNZE_Studio/Connections/marketing-showcase-index.md`

---

## Hinweise

- **Kein `npm run build` während `npm run dev` läuft** (`.next`-Korruption)
- Glanzwerk-Demo (Port 3100) ist separat — siehe `publish-paket-P-K01.md`
- Legacy Connect-Grafiken: weiterhin `npm run marketing:capture` + `marketing:build`
