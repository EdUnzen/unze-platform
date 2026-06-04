# UNZE — Finaler UX-/Design-/Stabilitäts-Sprint (2026-06-04)

## Test-URLs

| Umgebung | URL |
|----------|-----|
| **Production** | https://unze-platform.vercel.app |
| Discover | https://unze-platform.vercel.app/discover |
| Community erstellen | https://unze-platform.vercel.app/create/community |
| Profil | https://unze-platform.vercel.app/profile |
| Demo-Community | https://unze-platform.vercel.app/community/rocket-league-ssl |

## Erledigte Punkte

| # | Thema | Status |
|---|--------|--------|
| 1 | Community-Erstellung: Admin-Insert-Fallback, Login-Check in Action, Creator-Membership, Dashboard-Zugang via `creator_id` | ✓ Code |
| 2 | Banner: immer Bild (Kategorie-Fallback, Fehler-Fallback in `CommunityCoverVisual`) | ✓ |
| 3 | Discover-Karten: Banner ~50 % höher (`h-[10.5rem]` / `sm:h-44`) | ✓ |
| 4 | Level: „Bronze-Level“ … „Elite-Level“, Icons/Farben je Stufe | ✓ |
| 5 | Community-Tabs: Icons, 3×2-Grid Mobile ohne Horizontal-Scroll | ✓ |
| 6 | Fokus-Tags: farbige Chips (`focus-tag-styles.ts`) | ✓ |
| 7 | Plattform-Icons: aktiv farbig, inaktiv grau, größer auf Mobile | ✓ |
| 8 | Creator-Karte: Avatar-Ring, Verifizierung, Initialen-Fallback | ✓ |
| 9 | Profil: Avatar höher im grünen Banner, stärkerer Schatten | ✓ |
| 10 | Performance: Discover parallel, Engagement ohne doppelten User-Call, Profil parallel | ✓ |
| 11 | Build + Typecheck + E2E-URLs + `verify:community-create` | ✓ (automatisiert) |

## Offene Punkte (manuell / Umgebung)

| Punkt | Hinweis |
|-------|---------|
| Community-Erstellung auf Prod | Einmal **eingeloggt** auf `/create/community` testen; bei Fehler `SUPABASE_SERVICE_ROLE_KEY` in Vercel Production prüfen |
| LCP / iPhone-Feel | TTFB-Messung ≠ LCP; optional Lighthouse Mobile auf Prod |
| 95 % Design-Pixel-Match | Bewusst nicht 1:1 — UX/Performance-Vorrang laut Architektur-Regel |

## Performance (TTFB, `npm run measure:perf`)

Vor Sprint (Prod): Ø **283 ms** (7 Routen).  
Nach letztem Deploy variabel (Cold Start); erneut messen nach diesem Deploy.

Strukturelle Optimierungen in dieser Runde:

- Discover: kein blockierender Migration-Probe vor Content
- `enrichCommunitiesWithEngagement(communities, viewerId)` — ein Auth-Call
- Community Level-Persist nur Tab „Übersicht“

## Release-Kandidat (RC)

**Empfehlung: RC-1 (Beta)** — bereit für eingeschränkte Nutzer, wenn:

1. Community-Erstellung auf Prod mit realem Login **einmal** bestätigt ist  
2. `SUPABASE_SERVICE_ROLE_KEY` auf Vercel Production gesetzt ist  
3. Kurzer Mobile-Check: Discover, Tabs, Profil, Create  

**Nicht RC-blockierend:** absolute Design-Pixel-Parität, LCP &lt; 2.5s auf allen Routen (separater Performance-Follow-up).

## Automatisierte Checks (vor Deploy)

```bash
npm run typecheck
npm run build
npm run verify:community-create
npm run test:e2e-urls
npm run measure:perf -- https://unze-platform.vercel.app
```
