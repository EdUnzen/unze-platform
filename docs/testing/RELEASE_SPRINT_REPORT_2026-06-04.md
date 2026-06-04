# UNZE — Release-Sprint Abschlussbericht (2026-06-04)

## Test-URL

**Production:** https://unze-platform.vercel.app

| Bereich | URL |
|---------|-----|
| Community erstellen | https://unze-platform.vercel.app/create/community |
| Discover | https://unze-platform.vercel.app/discover |
| Profil | https://unze-platform.vercel.app/profile |
| Demo-Community | https://unze-platform.vercel.app/community/rocket-league-ssl |

---

## Erledigte Punkte

| # | Anforderung | Status |
|---|-------------|--------|
| 1 | Community-Erstellung: `ensureUserProfile` (FK-Fix), Admin-Fallback, Creator-Member, Redirect | ✓ |
| 2 | 3–5 Standardbanner pro Hauptkategorie (40+ Presets) | ✓ |
| 3 | Banner-Upload (multipart, iPhone/Android/Desktop) | ✓ |
| 4 | Kein Community ohne Bild (Kategorie-Fallback + Bild-Fehler-Fallback) | ✓ |
| 5 | Discover-Karten: große Banner (~50 % höher) | ✓ (vorherige Runde) |
| 6 | Bewertungen oben im Header + Discover-Karten (immer sichtbar) | ✓ |
| 7 | Level als Auszeichnung (Bronze-Level … Elite-Level + Icons) | ✓ |
| 8 | Fokus-Tags farbig | ✓ |
| 9 | Plattform-Icons aktiv/grau | ✓ |
| 10 | Profil-Avatar im Banner verankert | ✓ |
| 11 | Tabs 3×2-Grid ohne Horizontal-Scroll + Icons | ✓ |
| 12 | Nutzerfreundliche Fehlermeldungen (`user-messages.ts`) | ✓ |
| 13 | Slug automatisch aus Titel (kein manuelles Feld beim Erstellen) | ✓ |
| 14 | Performance: parallele Loads, ein Auth-Call für Engagement | ✓ |

---

## Build & Tests

| Check | Ergebnis |
|-------|----------|
| `npm run typecheck` | ✓ |
| `npm run build` | ✓ |
| `npm run verify:community-create` | ✓ |
| `npm run test:e2e-urls` (12 Routen) | ✓ |

---

## Offene Punkte

1. **Community-Erstellung auf Prod** — einmal mit echtem Login testen (FK-Fix setzt voraus, dass `profiles`-Zeile existiert).
2. **Vercel:** `SUPABASE_SERVICE_ROLE_KEY` in Production muss gesetzt sein.
3. **Banner-Upload:** Supabase-Bucket `unze-public-media` muss auf Prod existieren und beschreibbar sein.
4. **LCP / subjektive Geschwindigkeit** — TTFB variiert durch Cold Starts; separates Lighthouse-Mobile optional.

---

## Release Candidate

**Empfehlung: RC-1 (geschlossene Beta)**

Freigabe nach manuellem Check:

- [ ] Community erstellen (Mobile + Desktop)
- [ ] Banner-Upload oder Standardbanner
- [ ] Discover + Community-Detail + Profil

**Nicht blockierend:** 95 % Pixel-Match zu Design-Screenshots.
