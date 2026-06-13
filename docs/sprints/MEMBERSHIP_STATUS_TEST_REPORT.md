# Membership Status Test

**Datum:** 2026-06-13

| Stripe | UI | Emoji | Ergebnis |
|--------|-----|-------|----------|
| `active` | 🟢 Aktiv | 🟢 | ✓ |
| `trialing` | 🟢 Aktiv | 🟢 | ✓ |
| `past_due` | 🟡 Zahlung ausstehend | 🟡 | ✓ |
| `unpaid` | 🟡 Zahlung ausstehend | 🟡 | ✓ |
| `canceled` | 🔴 Mitgliedschaft beendet | 🔴 | ✓ |
| `inactive` | 🔴 Mitgliedschaft beendet | 🔴 | ✓ |
| `active + cancel_at_period_end` | 🟢 Aktiv — Kündigung zum Periodenende | 🟢 | ✓ |

**Alle Mapping-Tests bestanden.**

Manuelle Stripe-E2E (Testmodus): Erfolg (4242), Decline (4000…0002), Kündigung Portal, Reaktivierung.
Siehe `docs/sprints/STRIPE_MEMBERSHIP_STATUS.md`.
