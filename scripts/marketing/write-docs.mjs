#!/usr/bin/env node
import { writeFileSync } from "fs";
import { join } from "path";

const root = join(process.cwd(), "docs", "marketing");

const readme = `# UNZE Marketing - Creator Beta

Marketing basiert auf **echten App-Screenshots** in hochwertigen Device-Mockups - keine Platzhalter, keine gr\u00fcnen Dummy-Screens.

## Pipeline

\`\`\`bash
# Komplett (Demo-Stats -> Capture -> Mockups -> Validierung)
npm run marketing:build

# Einzelne Schritte
npm run marketing:capture    # App-Screens -> docs/marketing/raw-screens/
npm run marketing:render     # Mockups -> docs/marketing/output/
npm run marketing:validate   # Qualit\u00e4ts-Gate (Encoding, Platzhalter, gr\u00fcne Screens)
\`\`\`

**Umgebung:** \`E2E_BASE_URL\` (Standard: Production), \`DEMO_EMAIL\` / \`DEMO_PASSWORD\` f\u00fcr Dashboard-Routen.

## Ausgabe

| Ordner | Format | Verwendung |
|--------|--------|------------|
| \`output/story/\` | 1080x1920 | Instagram Stories, TikTok, Reels |
| \`output/reels/\` | 1080x1920 | Reels / Shorts (9:16) |
| \`output/carousel/\` | 1080x1080 | Instagram Carousel |
| \`output/hero-landing.png\` | 1920x1080 | Landingpage Hero |
| \`output/linkedin-creator.png\` | 1200x627 | LinkedIn |
| \`output/facebook-creator.png\` | 1200x630 | Facebook |
| \`output/press-community.png\` | 1920x1080 | Presse |

## 8-Slide Creator-Story

1. Sei einer der ersten Creator auf UNZE.
2. Community erstellen
3. Mitglieder verwalten
4. Events veranstalten
5. Auszeichnungen vergeben
6. Zertifikate sammeln
7. Crowd Partner aktivieren
8. Wachse mit der Plattform

Jede Grafik: **mind. 70 % echte UNZE-Oberfl\u00e4che**, kurzer Erkl\u00e4rungstext.

## Qualit\u00e4tsregeln (automatisch)

Freigabe blockiert bei:

- Encoding-Fehlern (Mojibake)
- Platzhalter- oder Debug-Text in Compositor-Templates
- Dominant gr\u00fcnen Bildfl\u00e4chen (alte Dummy-Mockups)
- Fehlenden Raw-Screens oder Output-Dateien

## Demo-Daten

Gaming-Community \`rocket-league-ssl\`: 2.384 Mitglieder, 4,9 Sterne
Business \`business-circle-dach\`: 1.156 Mitglieder
Bildung \`mathe-meister\`: 2.000 Mitglieder

Login f\u00fcr Captures: \`edubek89@icloud.com\` / \`UnzeDemo2026!\`

## Architektur

- \`scripts/marketing/capture-screens.mjs\` - Playwright, Onboarding aus
- \`scripts/marketing/render-composite.mjs\` - Compositor mit echten PNGs
- \`docs/marketing/engine/compositor-*.html\` - Apple/Stripe-inspirierte Mockups
- \`scripts/marketing/validate-marketing.mjs\` - Qualit\u00e4ts-Gate
`;

const campaign = `# Creator Beta - Kampagnen-Leitfaden

## Botschaft

UNZE ist eine professionelle Plattform f\u00fcr Communities, Events, Auszeichnungen und Creator-Wachstum. Das Produkt selbst ist die Werbung.

**Kernversprechen:** Deine Community. Ein Ort. - Je fr\u00fcher Creator starten, desto st\u00e4rker das Netzwerk.

## Zielgruppe

- Gaming- und Nischen-Communities
- Business- und Netzwerk-Gruppen
- Bildungsanbieter und Kurs-Creator
- Event-Veranstalter mit Ticket- und Check-in-Flow

## Story-Sequenz (8 Bilder)

Verwende die generierten Assets aus \`docs/marketing/output/\` in dieser Reihenfolge:

| # | Asset | Screen | Text |
|---|-------|--------|------|
| 1 | \`story/story-01-hook.png\` | Home | Sei einer der ersten Creator auf UNZE. |
| 2 | \`story/story-02-community.png\` | Community Gaming | Community erstellen |
| 3 | \`story/story-03-members.png\` | Mitglieder-Dashboard | Mitglieder verwalten |
| 4 | \`story/story-04-events.png\` | Events-Dashboard | Events veranstalten |
| 5 | \`story/story-05-awards.png\` | Auszeichnungen | Auszeichnungen vergeben |
| 6 | \`story/story-06-certificates.png\` | Profil Auszeichnungen | Zertifikate sammeln |
| 7 | \`story/story-07-crowd.png\` | Crowd Partner | Crowd Partner aktivieren |
| 8 | \`story/story-08-grow.png\` | Discover | Wachse mit der Plattform |

Pfeil-Story f\u00fcr Carousel/Reels: Bild 1 -> 2 -> ... -> 8.

## Kan\u00e4le

| Kanal | Asset-Ordner / Datei |
|-------|----------------------|
| TikTok / Reels / Stories | \`output/story/\` oder \`output/reels/\` (9:16) |
| Instagram Carousel | \`output/carousel/\` (1:1) |
| LinkedIn | \`output/linkedin-creator.png\` |
| Facebook | \`output/facebook-creator.png\` |
| Landingpage Hero | \`output/hero-landing.png\` |
| Presse | \`output/press-community.png\` |

## Demo-Communities (Live)

- **Gaming:** Rocket League SSL - 2.384 Mitglieder, 4,9 Sterne
- **Business:** Business Circle DACH - 1.156 Mitglieder, Services und Projekte
- **Bildung:** Mathe Meister - Kurse, Auszeichnungen, Zertifikate

URL: https://unze-platform.vercel.app

## Hashtags (Vorschlag)

\`#UNZE #CreatorBeta #CommunityPlattform #GamingCommunity #CreatorEconomy #Events #Auszeichnungen\`

## CTA

- Prim\u00e4r: Community erstellen -> \`/create/community\`
- Sekund\u00e4r: Discover \u00f6ffnen -> \`/discover\`
- Beta: Early Creator - begrenzte Pl\u00e4tze, pers\u00f6nliches Onboarding

## Regenerierung

\`\`\`bash
npm run marketing:build
\`\`\`

Vor jeder Ver\u00f6ffentlichung muss \`npm run marketing:validate\` gr\u00fcn sein.

## Nicht erlaubt

- Platzhalter-Layouts oder gr\u00fcne Dummy-Screens
- Encoding-Fehler in Texten
- Onboarding, Pop-ups oder Tutorials in Screenshots
- Fragezeichen, Debug- oder Entwickler-Texte
`;

writeFileSync(join(root, "README.md"), readme, "utf8");
writeFileSync(join(root, "CREATOR_BETA_CAMPAIGN.md"), campaign, "utf8");
console.log("Marketing-Docs (UTF-8) geschrieben.");
