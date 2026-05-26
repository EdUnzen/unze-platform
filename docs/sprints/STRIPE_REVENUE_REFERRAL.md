# Stripe Sandbox · Revenue Share · Creator Referral

Modulare Erweiterung — **kein MLM**, optionaler Referral, Netto-basierte Aufteilung.

## Architektur

| Bereich | Dateien |
|---------|---------|
| Migration | `database/migrations/019_creator_referral_revenue.sql` |
| Gebühren | `lib/constants/revenue.ts`, `lib/revenue/calculate-split.ts` |
| Stripe | `lib/stripe/config.ts`, `lib/stripe/server.ts`, `services/monetization/stripe-connect.service.ts` |
| Referral | `services/referral/*`, `app/dashboard/referral-actions.ts` |
| UI | `app/dashboard/referrals/page.tsx`, `components/referral/*` |
| Webhook | `app/api/stripe/webhook/route.ts` |

## Gebührenlogik (Sandbox-Schätzung)

1. **Stripe-Gebühr** (~2,9 % + 0,30 €) vom Brutto
2. **Plattformgebühr** 7,7 % vom Betrag nach Stripe
3. **Referral-Anteil** 11 % vom Netto-Plattformanteil (nur bei aktivem Referral)

Keine Ebenen, keine Downline — ein optionaler werbender Creator pro geworbenem Creator.

## Creator Referral

- **Optional** — Creator muss niemanden angeben
- Ein Eintrag pro `referred_user_id` (unique)
- Konflikt wenn ein anderer Referrer beansprucht wird → Status `conflict`, manuelle Prüfung

## Stripe Sandbox

`.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Lokal Webhook:

```bash
stripe listen --forward-to localhost:3002/api/stripe/webhook
```

Ohne Keys: UI zeigt Hinweis, App bleibt funktionsfähig.

## Dashboard

- `/dashboard/referrals` — Stripe Connect, Referral verknüpfen, Revenue-Übersicht
- Link auch im Dashboard-Hub und unter Community → Monetarisierung

## Demo Seed

Nach Migration 019:

```bash
npm run seed:demo
```

Legt Referral (Leo Creator ← Edu Demo) und Sandbox-Ledger-Einträge an.

## Gewerbliche Hinweise

`CommercialInfoDialog` — Transparenz zu Steuern/Stripe, keine Rechtsberatung.

## Nächste Schritte (nicht in diesem Sprint)

- Live-Abrechnung & automatische Transfers
- Subscription-basierte Premium-Gruppen
- Admin-UI für Referral-Konflikte
