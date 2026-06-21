# UNZE Marketing & Demo — Toolkit

Stand: Creator-Beta Marketing-Phase nach RC1 Deploy.

## Live-Plattform

- **Production:** https://unze-platform.vercel.app
- **Deploy:** Push auf `main` ? Vercel Auto-Deploy

## 1. Demo-Daten

```bash
# Basis-Demo (3 Communities + Feed + Badges)
npm run seed:demo

# Marketing-Erweiterung (6 Vertical-Communities, Events, Zertifikate)
npm run seed:marketing
```

**Demo-Login (Creator):**
- E-Mail: `edubek89@icloud.com`
- Passwort: `UnzeDemo2026!`

### Marketing-Communities (neu)

| Slug | Vertical | Simulierte Größe |
|------|----------|------------------|
| fit-squad-dach | Fitness | 50 |
| code-craft-academy | Programmieren | 500 |
| mathe-meister | Mathematik | 2.000 |
| sound-wave-studio | Musik | 500 |
| handwerk-meister | Handwerk | 2.000 |
| lens-masters-guild | Fotografie | 10.000 |

Plus bestehende Demo-Communities: Gaming, Business, Creator Lounge.

## 2. Screenshot-Portfolio

```bash
# Live (empfohlen)
E2E_BASE_URL=https://unze-platform.vercel.app npm run screenshots:marketing

# Lokal
npm run dev   # Port 3000 oder 3002
E2E_BASE_URL=http://localhost:3000 npm run screenshots:marketing
```

**Output:** `docs/marketing/screenshots/{iphone-14,ipad,desktop}/`

Routen: Home, Discover, Communities, Dashboard, Mitglieder, Anträge, Scanner, Auszeichnungen, Monetarisierung, Profil, Crowd Partner.

## 3. Marketing-Grafiken & Mockups

```bash
npm run marketing:graphics
```

**Output:** `docs/marketing/graphics/`

- Hero Creator Beta (1920×1080)
- Social Stories 9:16 (TikTok, Reels, Shorts)
- LinkedIn / Facebook
- iPhone / Tablet / Desktop Mockups
- Carousel-Slides (Instagram)

Templates bearbeiten: `docs/marketing/templates/*.html`

## 4. Animationen

Öffne im Browser (Screen-Recording für Reels/Shorts):

`docs/marketing/animations/showcase.html`

Enthält CSS-Animationen: Karten, Counter, Auszeichnungen, Zertifikate, Verifizierung, Events, Crowd Partner.

## 5. Creator-Beta Copy

Siehe `CREATOR_BETA_CAMPAIGN.md` — Texte für TikTok, Instagram, LinkedIn, YouTube Shorts.

## 6. Workflow Empfehlung

1. `npm run seed:marketing` auf Production-DB
2. `npm run screenshots:marketing` gegen Live-URL
3. `npm run marketing:graphics`
4. Animation-Showcase aufnehmen
5. Canva/CapCut: Screenshots + Grafiken zu Reels schneiden

## Einheitliches Design

- Primärfarbe: `#22c55e` (UNZE Green)
- Dunkel: `#0c3d2e` ? `#14532d`
- Typografie: System UI / Sans
- Alle Templates nutzen dasselbe Farbschema
