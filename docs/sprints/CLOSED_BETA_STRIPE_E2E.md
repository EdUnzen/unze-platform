# Closed Beta — Stripe E2E Verifikation

**Datum:** 2026-06-13  
**Production:** https://unze-platform.vercel.app  
**Status:** Code verifiziert ✅ · Live-E2E manuell nach Deploy

---

## Implementierte Kette (Code-Review)

| Schritt | Implementierung | Datei(en) |
|---------|-----------------|-----------|
| 1. Kauf / Checkout | Stripe Checkout Session + Metadata | `checkout.service.ts` |
| 2. Erfolgreiche Zahlung | Webhook `checkout.session.completed` | `stripe-webhook.service.ts` |
| 3. Subscription upsert | `upsertSubscriptionFromStripe` | `subscription.repository.ts` |
| 4. Auto-Freischaltung | `syncMembershipForSubscription` → INSERT member | `membership-sync.service.ts` |
| 5. Premium-Join | `hasActiveCommunitySubscription` in Join-Check | `access.service.ts` |
| 6. Kündigung | `cancel_at_period_end` → Removal-Queue | `membership-sync.service.ts` |
| 7. Abo-Ende | Soft-Remove + Queue `subscription_ended` | `membership-sync.service.ts` |
| 8. Berechtigung entzogen | `is_community_member()` + `deleted_at IS NULL` | Migration 030 |
| 9. Rückerstattung | `charge.refunded` → Payment refunded + Soft-Remove | `stripe-webhook.service.ts` |

---

## Webhook-Events (Stripe Dashboard)

```
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
charge.refunded
account.updated
```

---

## Manueller E2E-Testplan (nach Deploy)

### A — Neukauf Premium

1. Premium-Community öffnen (Testmodus)
2. Abo abschließen (Stripe Testkarte `4242 4242 4242 4242`)
3. Webhook empfangen (Stripe CLI oder Dashboard)
4. Prüfen: `/profile/billing` zeigt aktives Abo
5. Prüfen: Community-Beitritt ohne Blockade
6. Prüfen: `community_members` Eintrag vorhanden

### B — Kündigung

1. Stripe Customer Portal → Abo kündigen (Periodenende)
2. Webhook `customer.subscription.updated`
3. Creator-Dashboard: „Zu entfernen" Badge + Panel
4. Mitglied hat Zugang bis Periodenende

### C — Abo-Ende

1. Nach Periodenende oder `subscription.deleted` Webhook
2. `community_members.deleted_at` gesetzt (Soft-Delete)
3. Nutzer erscheint nicht mehr als aktives Mitglied
4. Removal-Task in Creator-Dashboard

### D — Rückerstattung

1. Refund in Stripe Dashboard auslösen
2. Webhook `charge.refunded`
3. Payment-Status `refunded`
4. Membership soft-deleted + Removal-Task

---

## Automatisierte Checks

| Script | Ergebnis |
|--------|----------|
| `npm run check:stripe` | Konfiguration prüfen |
| `npm run test:monetization` | Sandbox-Flow (lokal) |
| `npm run test:stabilization` | 13 OK, 1 Teilweise (Monetarisierung E2E) |

---

## Offene Live-Verifikation

- [ ] Vollständiger Durchlauf A–D in Production mit Stripe Testmodus
- [ ] `charge.refunded` in Production-Webhook registriert
- [ ] Creator-Benachrichtigung bei `invoice.payment_failed` (P1 Backlog)

---

## Ergebnis

**Code-Stand:** Launchblocker für Stripe-Lifecycle implementiert.  
**Production-E2E:** Manuell nach Deploy durchspielen (Checkliste oben).
