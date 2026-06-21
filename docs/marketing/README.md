# UNZE Marketing - Creator Beta

Marketing basiert auf **echten App-Screenshots** in hochwertigen Device-Mockups - keine Platzhalter, keine grünen Dummy-Screens.

## Pipeline

```bash
# Komplett (Demo-Stats -> Capture -> Mockups -> Validierung)
npm run marketing:build

# Einzelne Schritte
npm run marketing:capture    # App-Screens -> docs/marketing/raw-screens/
npm run marketing:render     # Mockups -> docs/marketing/output/
npm run marketing:validate   # Qualitäts-Gate (Encoding, Platzhalter, grüne Screens)
```

**Umgebung:** `E2E_BASE_URL` (Standard: Production), `DEMO_EMAIL` / `DEMO_PASSWORD` für Dashboard-Routen.

## Ausgabe

| Ordner | Format | Verwendung |
|--------|--------|------------|
| `output/story/` | 1080x1920 | Instagram Stories, TikTok, Reels |
| `output/reels/` | 1080x1920 | Reels / Shorts (9:16) |
| `output/carousel/` | 1080x1080 | Instagram Carousel |
| `output/hero-landing.png` | 1920x1080 | Landingpage Hero |
| `output/linkedin-creator.png` | 1200x627 | LinkedIn |
| `output/facebook-creator.png` | 1200x630 | Facebook |
| `output/press-community.png` | 1920x1080 | Presse |

## 8-Slide Creator-Story

1. Sei einer der ersten Creator auf UNZE.
2. Community erstellen
3. Mitglieder verwalten
4. Events veranstalten
5. Auszeichnungen vergeben
6. Zertifikate sammeln
7. Crowd Partner aktivieren
8. Wachse mit der Plattform

Jede Grafik: **mind. 70 % echte UNZE-Oberfläche**, kurzer Erklärungstext.

## Qualitätsregeln (automatisch)

Freigabe blockiert bei:

- Encoding-Fehlern (Mojibake)
- Platzhalter- oder Debug-Text in Compositor-Templates
- Dominant grünen Bildflächen (alte Dummy-Mockups)
- Fehlenden Raw-Screens oder Output-Dateien

## Demo-Daten

Gaming-Community `rocket-league-ssl`: 2.384 Mitglieder, 4,9 Sterne
Business `business-circle-dach`: 1.156 Mitglieder
Bildung `mathe-meister`: 2.000 Mitglieder

Login für Captures: `edubek89@icloud.com` / `UnzeDemo2026!`

## Architektur

- `scripts/marketing/capture-screens.mjs` - Playwright, Onboarding aus
- `scripts/marketing/render-composite.mjs` - Compositor mit echten PNGs
- `docs/marketing/engine/compositor-*.html` - Apple/Stripe-inspirierte Mockups
- `scripts/marketing/validate-marketing.mjs` - Qualitäts-Gate
