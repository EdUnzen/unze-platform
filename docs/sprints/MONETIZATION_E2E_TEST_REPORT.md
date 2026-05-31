# Monetization E2E Testbericht

**Datum:** 2026-05-31  
**Umgebung:** https://unze-platform.vercel.app  
**Supabase:** https://zzbjvcwmdrnuzzlepfja.supabase.co  
**Stripe Testmodus:** konfiguriert

---

## Zusammenfassung

| Status | Anzahl |
|--------|--------|
| Funktioniert | 12 |
| Teilweise | 1 |
| Fehlerhaft | 0 |

---

## Funktioniert

- **Migration 021** — platform_feature_flags aktiv
  - URL: Supabase
- **Migration 022** — Events & Reviews aktiv
  - URL: Supabase
- **Migration 024** — Tabellen und Preis-Spalten vorhanden
  - URL: Supabase
- **Stripe Verbindung** — Testmodus API + Customer Portal aktiv
  - URL: Stripe Dashboard
- **Discover Events** — HTTP 200
  - URL: https://unze-platform.vercel.app/discover?tab=events
- **Nutzer Abos** — HTTP 200
  - URL: https://unze-platform.vercel.app/profile/billing
- **Dashboard** — HTTP 200
  - URL: https://unze-platform.vercel.app/dashboard
- **Community Detail** — HTTP 200
  - URL: https://unze-platform.vercel.app/community/rocket-league-ssl
- **Creator Finanzen** — HTTP 200
  - URL: https://unze-platform.vercel.app/dashboard/community/rocket-league-ssl/monetization
- **Creator Events** — HTTP 200
  - URL: https://unze-platform.vercel.app/dashboard/community/rocket-league-ssl/events
- **Webhook Route** — Endpoint erreichbar (HTTP 400 ohne Signatur)
  - URL: https://unze-platform.vercel.app/api/stripe/webhook
- **Production Build** — next build erfolgreich
  - URL: npm run build


## Teilweise

- **Billing-Daten** — Keine Abos/Zahlungen in DB — E2E-Zahlungstest noch nicht durchgeführt
  - URL: Supabase subscriptions / community_payments


## Fehlerhaft

_Keine Einträge._


---

## Manuelle E2E-Schritte (nach Migration + Stripe)

1. Creator: Community + Gruppe + Dienstleistung + Event anlegen
2. Preise im Dashboard → Monetarisierung speichern
3. Nutzer: Monats-/Halbjahres-/Jahres-Abo + Einmalzahlung (Testkarte 4242…)
4. Kündigung über Stripe Customer Portal
5. Prüfen: `/profile/billing`, Creator-Dashboard Finanzen, Umsatz, Rechnungen

Siehe auch: `docs/sprints/STRIPE_MONETIZATION.md`

---

_Automatisch generiert via `npm run test:monetization`_
