# UNZE — Pilotstart

**Datum:** 13. Juni 2026  
**Version:** `0.3.0-beta.1`  
**Production:** https://unze-platform.vercel.app

---

## Status: Pilotphase gestartet

Die Kernplattform ist für echte Tester freigegeben.

**Ab jetzt:** Nutzerfeedback, Fehlerbehebung, UX-Optimierung, Stripe-Live-Test.  
**Keine neuen Großmodule** ohne Testergebnisse.

---

## Abschlussrunde — Ergebnisse

| # | Bereich | Ergebnis |
|---|---------|----------|
| 1 | Hero / Home | ✅ Motiv oben frei, Text unten, leichteres Overlay (Gast) |
| 2 | Platzhalter | ✅ Gradient + Muster; Service-Icon; UserAvatar im Dashboard |
| 3 | Verifizierungen | ✅ Dialog mit Typ/Status/Datum/UNZE; Gewerbe getrennt; Migration 034 vorbereitet |
| 4 | Stripe | ✅ Mapping getestet; Webhook-Logik live; manueller Karten-Test empfohlen |
| 5 | Services | ✅ `npm run test:services` — 11/11 |
| 6 | Owner Center | ✅ Nur `platform_role: owner`; Zugriff `@edudemo` |
| 7 | Deploy | ✅ Commit + Push → Vercel |

---

## Owner-Zugriff

Plattform-Owner wird **nur per Datenbank** vergeben — keine E-Mail im Code.

```bash
npm run assign:owner -- edudemo
```

Konto: Demo-Creator (`edubek89@icloud.com` / `@edudemo` in Testumgebung).

Normale Nutzer, Creator und Moderatoren: `/owner` → Redirect.

---

## Erstbesucher-Onboarding

- **Einmalig:** Willkommens-Dialog (Was ist UNZE? → Säulen → Installation)
- **Profil:** „Was ist UNZE?“ und „UNZE installieren“ jederzeit erneut
- **Gast-Startseite:** Button „Was ist UNZE?“
- Speicherung: `localStorage` `unze-onboarding-complete-v1`

---

```bash
npm run test:services           # Service CRUD + Discover
npm run test:membership-status  # 🟢/🟡/🔴 Mapping
npm run test:monetization       # Stripe + Migrationen
npm run test:pilot              # Owner + Routen-Smoke
```

---

## Manuelle Stripe-Checkliste (Testmodus)

1. **Erfolgreiche Zahlung** — Karte `4242 4242 4242 4242` → 🟢 Aktiv
2. **Fehlgeschlagene Zahlung** — `4000 0000 0000 0002` → 🟡 Zahlung ausstehend
3. **Kündigung** — Stripe Customer Portal → Kündigung zum Periodenende
4. **Reaktivierung** — Zahlungsmethode aktualisieren / Abo fortsetzen
5. **Creator-Dashboard** — Monetarisierung → Abonnenten + „Offene Zahlungen“

---

## Service-MVP (Pilot-Hinweis)

- Buchungs-Slots sind Demo-Daten
- Kostenlose Buchung: UI-Erfolg, keine DB-Zeile
- Paid Booking: Stripe + `community_payments`

---

## Migration (optional, post-Pilot)

Kanalweise Plattform-Verifizierung vorbereitet:

```bash
# SQL: database/migrations/034_platform_link_verification_prep.sql
```

---

## Referenzen

- `docs/sprints/PILOT_PHASE_FINAL_CHECK.md`
- `docs/sprints/STRIPE_MEMBERSHIP_STATUS.md`
- `docs/sprints/OWNER_CENTER.md`
- `docs/sprints/SERVICE_E2E_REPORT.md`
