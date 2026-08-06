# Monetization E2E Testbericht

**Datum:** 2026-06-21  
**Umgebung:** http://localhost:3002  
**Supabase:** https://zzbjvcwmdrnuzzlepfja.supabase.co  
**Stripe Testmodus:** konfiguriert

---

## Zusammenfassung

| Status | Anzahl |
|--------|--------|
| Funktioniert | 5 |
| Teilweise | 1 |
| Fehlerhaft | 7 |

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
- **Production Build** — next build erfolgreich
  - URL: npm run build


## Teilweise

- **Billing-Daten** — Keine Abos/Zahlungen in DB — E2E-Zahlungstest noch nicht durchgeführt
  - URL: Supabase subscriptions / community_payments


## Fehlerhaft

- **Discover Events** — fetch failed
  - URL: http://localhost:3002/discover?tab=events
- **Nutzer Abos** — fetch failed
  - URL: http://localhost:3002/profile/billing
- **Dashboard** — fetch failed
  - URL: http://localhost:3002/dashboard
- **Community Detail** — fetch failed
  - URL: http://localhost:3002/community/rocket-league-ssl
- **Creator Finanzen** — fetch failed
  - URL: http://localhost:3002/dashboard/community/rocket-league-ssl/monetization
- **Creator Events** — fetch failed
  - URL: http://localhost:3002/dashboard/community/rocket-league-ssl/events
- **Stripe Webhook** — fetch failed
  - URL: http://localhost:3002/api/stripe/webhook


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
