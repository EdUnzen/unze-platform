# Creator Beta - Kampagnen-Leitfaden

## Botschaft

UNZE ist eine professionelle Plattform für Communities, Events, Auszeichnungen und Creator-Wachstum. Das Produkt selbst ist die Werbung.

**Kernversprechen:** Deine Community. Ein Ort. - Je früher Creator starten, desto stärker das Netzwerk.

## Zielgruppe

- Gaming- und Nischen-Communities
- Business- und Netzwerk-Gruppen
- Bildungsanbieter und Kurs-Creator
- Event-Veranstalter mit Ticket- und Check-in-Flow

## Story-Sequenz (8 Bilder)

Verwende die generierten Assets aus `docs/marketing/output/` in dieser Reihenfolge:

| # | Asset | Screen | Text |
|---|-------|--------|------|
| 1 | `story/story-01-hook.png` | Home | Sei einer der ersten Creator auf UNZE. |
| 2 | `story/story-02-community.png` | Community Gaming | Community erstellen |
| 3 | `story/story-03-members.png` | Mitglieder-Dashboard | Mitglieder verwalten |
| 4 | `story/story-04-events.png` | Events-Dashboard | Events veranstalten |
| 5 | `story/story-05-awards.png` | Auszeichnungen | Auszeichnungen vergeben |
| 6 | `story/story-06-certificates.png` | Profil Auszeichnungen | Zertifikate sammeln |
| 7 | `story/story-07-crowd.png` | Crowd Partner | Crowd Partner aktivieren |
| 8 | `story/story-08-grow.png` | Discover | Wachse mit der Plattform |

Pfeil-Story für Carousel/Reels: Bild 1 -> 2 -> ... -> 8.

## Kanäle

| Kanal | Asset-Ordner / Datei |
|-------|----------------------|
| TikTok / Reels / Stories | `output/story/` oder `output/reels/` (9:16) |
| Instagram Carousel | `output/carousel/` (1:1) |
| LinkedIn | `output/linkedin-creator.png` |
| Facebook | `output/facebook-creator.png` |
| Landingpage Hero | `output/hero-landing.png` |
| Presse | `output/press-community.png` |

## Demo-Communities (Live)

- **Gaming:** Rocket League SSL - 2.384 Mitglieder, 4,9 Sterne
- **Business:** Business Circle DACH - 1.156 Mitglieder, Services und Projekte
- **Bildung:** Mathe Meister - Kurse, Auszeichnungen, Zertifikate

URL: https://unze-platform.vercel.app

## Hashtags (Vorschlag)

`#UNZE #CreatorBeta #CommunityPlattform #GamingCommunity #CreatorEconomy #Events #Auszeichnungen`

## CTA

- Primär: Community erstellen -> `/create/community`
- Sekundär: Discover öffnen -> `/discover`
- Beta: Early Creator - begrenzte Plätze, persönliches Onboarding

## Regenerierung

```bash
npm run marketing:build
```

Vor jeder Veröffentlichung muss `npm run marketing:validate` grün sein.

## Nicht erlaubt

- Platzhalter-Layouts oder grüne Dummy-Screens
- Encoding-Fehler in Texten
- Onboarding, Pop-ups oder Tutorials in Screenshots
- Fragezeichen, Debug- oder Entwickler-Texte
