# UNZE — Fertigstellungs-Audit (Juni 2026)

Referenz: `01_Designsystem/`, Design System V1.0-Regel.

**Demo-Daten:** unverändert erhalten (`npm run seed:demo`, `lib/constants/demo.ts`).

---

## Umgesetzt in dieser Runde

### Priorität 1

| Punkt | Status | Details |
|-------|--------|---------|
| Event-Detailseite | ✅ | `/community/[slug]/event/[eventId]` — `EventDetailView`, Demo-Events, Links aus Listen |
| Service-Buchungsflow | ✅ | `ServiceBookingPanel` — Slot-Auswahl, kostenlos reservieren / Stripe |
| Fehler Services öffnen | ✅ | `getGroupBySlugs` Demo-Fallback wie bei Community-Gruppen |
| Stripe-Buchung | ✅ | Metadata `unze_booking_slot_*`, bestehender `createGroupOneTimeCheckout` |

### Priorität 2

| Punkt | Status | Details |
|-------|--------|---------|
| Google Login | ✅ | `signInWithOAuthAction` + UI in `AuthForm` |
| Apple Login | ✅ | wie Google (Supabase Provider in Dashboard aktivieren) |
| UNZE Hauptlogo | ✅ | `UnzeLogo` + `public/brand/unze-logo.png` (aus Designsystem aktualisiert) |
| Favicon / PWA / App Icon | ✅ | `app/icon.png`, `app/apple-icon.png`, `public/icons/*`, `manifest.json` |
| Diamant als Hauptlogo | ✅ | nur Community-Level (`CommunityLevelBadge`), nicht Plattformlogo |

### Priorität 3

| Punkt | Status | Details |
|-------|--------|---------|
| Mitgliederbereich | ✅ | Creator, Moderatoren, Experten, VIPs, Verifizierte — getrennte Sektionen |
| Demo-Showcase erweitert | ✅ | `business-circle-dach`, `creator-lounge` |

### Priorität 4

| Punkt | Status | Details |
|-------|--------|---------|
| Community-Tabs visuell | ✅ | `CommunityTabSectionHeader` auf Gruppen/Services/Events/Feed |
| Events-Tab | ✅ | Empty State + eingebettete Event-Liste |
| Plattformen | ✅ | unverändert auf Overview (`CommunityPlatformLinksSection`) |

---

## Test-URLs (lokal :3002)

| Seite | URL |
|-------|-----|
| Event-Detail (Demo) | http://localhost:3002/community/rocket-league-ssl/event/demo-ev-rl-1 |
| Service + Buchung | http://localhost:3002/community/rocket-league-ssl/group/einzelcoaching |
| Kostenloser Service | http://localhost:3002/community/gaming-legends/group/coaching-open |
| Mitglieder-Tab | http://localhost:3002/community/rocket-league-ssl?tab=members |
| Login + OAuth | http://localhost:3002/auth/login |

```bash
npm run test:e2e-urls
npm run check:stripe
npm run test:monetization   # bei konfiguriertem Stripe
```

---

## Performance / UX / Fehler (Kurz)

| Bereich | Befund | Priorität |
|---------|--------|-----------|
| Community-Page | Tab-Laden + Level ohne Doppel-Query (vorherige Runde) | — |
| Event-Detail | 1 gezielte Query + Demo-Fallback | Niedrig |
| Service-Seite | Demo-Fallback behebt 404 | — |
| OAuth | Erfordert Supabase Google/Apple Provider + Redirect-URLs | **Setup** |
| Stripe | Testmodus + Webhook laut `docs/sprints/STRIPE_MONETIZATION.md` | **Setup** |
| Buchungs-Slots | MVP ohne DB-Persistenz (UI + Stripe-Metadata) | Mittel |
| `next/image` Cover | noch `<img>` auf einigen Visuals | Mittel |
| Migration 025 | in Supabase ausführen falls noch offen | Mittel |

---

## Offene Punkte (keine neuen Kernfeatures)

### Hoch (Setup / Produktion)

1. Supabase: Google & Apple OAuth aktivieren, Redirect `http://localhost:3002/auth/callback`
2. Stripe Webhook + Testzahlung Service durchspielen
3. Migration `025_community_level_focus.sql` in Prod

### Mittel

1. Buchungsslots in DB persistieren (optional Tabelle `service_bookings`)
2. Event-Detail: ICS-Download / Teilen-Button
3. Discover-Events mit Demo-Fallback wenn DB leer
4. Horizontales Swipe auf Discover-Cards (Designsystem)

### Niedrig

1. `CommunityEventsSection` auf Overview-Karte (3 Events) mit Links
2. Prettier/ESLint für doppelte Import-Zeilenumbrüche in `community/[slug]/page.tsx` vereinheitlichen

---

## Screenshots

`docs/testing/screenshots/` — erneuern mit `npm run screenshots:demo` (Dev-Server läuft).

Zusätzlich empfohlen: Event-Detail, Service-Buchung, Mitglieder-Tab.

---

## Supabase OAuth Checkliste

1. Authentication → Providers → Google / Apple aktivieren
2. Site URL: `http://localhost:3002` (bzw. Produktions-URL)
3. Redirect URLs: `http://localhost:3002/auth/callback`, `https://<prod>/auth/callback`
