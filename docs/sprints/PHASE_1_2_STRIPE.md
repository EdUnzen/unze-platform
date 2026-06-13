# Phase 1.2 — Stripe & Monetarisierung

**Datum:** 2026-06-13  
**Referenz:** `Optimierung und Finalisierung/03_Stripe_und_Monetarisierung.pdf`  
**Status:** Abgeschlossen (Kern-Lifecycle)

---

## Umgesetzte Änderungen

| # | Maßnahme | Datei(en) |
|---|----------|-----------|
| 1 | **Premium-Join:** Aktives Abo hebt Blockade auf | `access.repository.ts`, `access.service.ts`, `subscription.repository.ts` |
| 2 | **Auto-Join:** Webhook legt `community_members` an | `membership-sync.service.ts`, `stripe-webhook.service.ts` |
| 3 | **Membership-Sync:** Abo-Ende entfernt Mitgliedschaft | `membership-sync.service.ts` (canceled/unpaid/inactive; `past_due` = Kulanz) |
| 4 | **Checkout-Metadata** auf Session + Subscription | `checkout.service.ts` |
| 5 | **Webhook-Robustheit:** Fehler → HTTP 500, kein „processed" bei Fehler | `stripe-webhook.service.ts` |
| 6 | **Invoice-Idempotency:** Kein doppeltes `community_payments` pro Invoice | `payment.repository.ts` |
| 7 | **Refund-Handler:** `charge.refunded` → Status `refunded` | `stripe-webhook.service.ts`, `payment.repository.ts` |
| 8 | **Checkout-Abbruch UI** + Fehler im Subscribe-Panel | `SubscribeCommunityPanel.tsx`, `CommunityJoinPanel.tsx`, `page.tsx` |

---

## Flow nach Fix

```
Nutzer → Abo abschließen (Stripe Checkout)
  → Webhook checkout.session.completed
  → subscriptions upsert (active/trialing)
  → syncMembershipForSubscription → community_members INSERT
  → resolveJoinBlockReason sieht hasActiveSubscription → kein Block
  → Nutzer kann beitreten (oder ist bereits Mitglied)

Abo endet / canceled / unpaid
  → Webhook customer.subscription.deleted|updated
  → syncMembershipForSubscription → community_members DELETE (nicht Creator)
```

---

## Tests

| Check | Ergebnis |
|-------|----------|
| `npm run validate:quick` | ✅ |
| `npm run build` | ✅ |
| Stripe E2E live | ⚠️ Manuell nach Deploy (`npm run test:monetization`) |

### Manueller E2E-Test (nach Deploy)

1. Premium-Community öffnen → Abo abschließen (Stripe Test)
2. Webhook empfangen (Stripe CLI oder Dashboard)
3. Prüfen: `/profile/billing` zeigt Abo
4. Prüfen: Community-Seite — kein „Abo erforderlich", Beitritt möglich oder bereits Mitglied
5. Kündigung im Customer Portal → nach Periodenende/deleted: kein Member mehr

---

## Stripe Dashboard — Webhook-Events

Folgende Events müssen aktiv sein (ggf. `charge.refunded` hinzufügen):

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `charge.refunded` **(neu)**
- `account.updated`

---

## Gefundene / offene Punkte

| Punkt | Status | Phase |
|-------|--------|-------|
| „Zu entfernen"-Queue für Creator | Offen | 1.4 |
| Soft-Remove statt Hard-Delete bei Revoke | Offen | 1.4 |
| Creator-Benachrichtigung bei Kündigung | Offen | 1.4 |
| Passwort vergessen | Offen | 1.5 |
| Renewal-Ledger auf `invoice.paid` | Offen | später |
| `cancel_at_period_end`: Zugang bis Periodenende | ✅ (Stripe status bleibt active) |
| Refund → Subscription/Membership anpassen | Teilweise (payment status only) |

---

## Nächster Schritt

**Phase 1.3 / 1.4 — Membership Lifecycle & Kündigungslogik**

- „Zu entfernen"-Queue im Creator-Dashboard
- Soft-Remove + Historie
- Creator-Tasks bei Kündigung/Leave

Oder direkt **Phase 1.5 — Passwort vergessen**, falls Lifecycle-Queue priorisiert werden soll.
