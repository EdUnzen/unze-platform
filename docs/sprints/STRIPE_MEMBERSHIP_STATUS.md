# Stripe — Mitgliedschaftsstatus & Zahlungsübersicht

Dokumentation für Creator und Plattformbetreiber: wie UNZE Stripe-Zahlungen verarbeitet und welche Status in der UI angezeigt werden.

**Kein Finanz-Backoffice** — nur klare Statusinformationen, keine Buchhaltung oder Auszahlungsverwaltung in UNZE.

---

## Anzeige-Status (UI)

| Symbol | Label | Stripe / DB-Status |
|--------|--------|---------------------|
| 🟢 | **Aktiv** | `active`, `trialing` |
| 🟡 | **Zahlung ausstehend** | `past_due`, `unpaid` — z. B. „Zahlung ausstehend seit 7 Tagen“ |
| 🔴 | **Mitgliedschaft beendet** | `canceled`, `inactive` |

Zusätzlich (wenn zutreffend):

- **Aktiv — Kündigung zum Periodenende** (`active` + `cancel_at_period_end`)
- **Letzte erfolgreiche Zahlung** — aus `community_payments` (`subscription_invoice`, `succeeded`)
- **Nächste geplante Zahlung** — `current_period_end` bei aktivem Abo
- **Status geändert** — `subscriptions.updated_at` (Webhook-Sync)

Mapping: `lib/monetization/membership-status.ts`  
Badge-Komponente: `components/billing/MembershipStatusBadge.tsx`

---

## Creator-Ansichten

| Ort | Inhalt |
|-----|--------|
| Dashboard → Übersicht | Kachel **Offene Zahlungen** (nur bei Monetarisierung + Creator), Link zu Monetarisierung |
| Dashboard → Monetarisierung | Panel **⚠️ Mitglieder mit offenen Zahlungen** (`#payment-issues`) |
| Abonnenten-Tabelle | Status-Badge, letzte/nächste Zahlung, Statusänderung |

Panel-Spalten bei offenen Zahlungen:

- Nutzername
- Status (🟡)
- Letzte Zahlung
- Mitgliedschaft läuft aus am (`current_period_end`)

---

## Nutzer-Ansicht

`/profile/billing` — `UserBillingOverview`:

- Farbiger Mitgliedschaftsstatus pro Abo
- Letzte Zahlung, nächste Zahlung / Auslaufdatum
- Zahlungshistorie inkl. fehlgeschlagener Abo-Rechnungen

Kartenaktualisierung / Kündigung: **Stripe Customer Portal**.

---

## Webhook-Events (`/api/stripe/webhook`)

Implementierung: `services/monetization/stripe-webhook.service.ts`  
Idempotenz: `stripe_webhook_events`

| Event | Verhalten |
|-------|-----------|
| `checkout.session.completed` | Abo anlegen/aktualisieren, Membership sync, ggf. Ledger |
| `customer.subscription.created` | Abo upsert + Membership sync |
| `customer.subscription.updated` | Status-Sync (z. B. `past_due`, Kündigung) |
| `customer.subscription.deleted` | Abo `canceled` + Membership entfernen |
| `invoice.paid` | Erfolgreiche Abo-Zahlung in `community_payments` (`succeeded`) |
| `invoice.payment_failed` | Abo-Status sync (`past_due`/`unpaid`), fehlgeschlagene Zahlung in `community_payments` (`failed`) |
| `charge.refunded` | Zahlung `refunded`, Mitglied soft-entfernt |
| `account.updated` | Stripe Connect Onboarding |

### Szenarien

#### Zahlung erfolgreich
1. `invoice.paid` → Zahlungszeile `succeeded`, Abo bleibt/ wird `active`
2. `customer.subscription.updated` kann parallel Perioden aktualisieren

#### Zahlung fehlgeschlagen (1. Versuch)
1. `invoice.payment_failed` → Abo `past_due`, fehlgeschlagene Zahlung gespeichert
2. Mitglied **bleibt** in der Community (Grace Period über Stripe)
3. Creator sieht 🟡 in Monetarisierung

#### Karte abgelaufen / dauerhaft fehlgeschlagen
- Stripe setzt Abo auf `past_due` → später `unpaid` / `canceled`
- Mehrfach fehlgeschlagen: `metadata.attempt_count` an fehlgeschlagener Zahlung; Status über `subscription.updated`
- Bei `unpaid` / `canceled`: Membership-Sync entfernt Mitglied (`membership-sync.service.ts`)

#### Abo gekündigt
- Nutzer kündigt im Portal → `cancel_at_period_end = true`
- Bis Periodenende: 🟢 „Aktiv — Kündigung zum Periodenende“, Removal-Task geplant
- Nach Ende: `canceled` → 🔴, Soft-Remove + „Zu entfernen“-Task

#### Mehrfach fehlgeschlagene Abbuchung
- Wiederholte `invoice.payment_failed`-Events: erste Fehlzahlung wird in DB gespeichert (pro Invoice-ID)
- Abo-Status und `updated_at` werden bei jedem Event aktualisiert
- UI: „Zahlung ausstehend seit X Tagen“ basiert auf letzter Fehlzahlung oder `updated_at`

---

## Membership-Sync

`services/monetization/membership-sync.service.ts`

| Abo-Status | Mitgliedschaft |
|------------|----------------|
| `active`, `trialing` | Mitglied bleibt / wird angelegt |
| `active` + `cancel_at_period_end` | Mitglied bleibt, Removal-Task |
| `past_due` | Mitglied bleibt (Zahlung offen) |
| `canceled`, `unpaid`, `inactive` | Soft-Remove + Removal-Task |

---

## Datenbank

- `subscriptions` — Stripe-Status, Perioden, `updated_at`
- `community_payments` — Einmal- und Abo-Zahlungen (`succeeded` / `failed` / `refunded`)
- Keine separate Audit-Tabelle für Statuswechsel — `subscriptions.updated_at` dient als Proxy

---

## Plattformbetreiber (Owner)

Kein separates Finanzmodul. Owner Center (`/owner`) fokussiert auf Moderation, Verifizierung und Plattform-Maßnahmen.

Aggregierte Zahlungsprobleme plattformweit sind **nicht** im Owner Center — Creator sehen Probleme community-spezifisch unter Monetarisierung.

---

## Test-Hinweise

1. Stripe Testmodus, Webhook auf lokale/staging URL
2. Erfolg: Karte `4242 4242 4242 4242`
3. Fehlschlag: Karte `4000 0000 0000 0002` (decline) oder `4000 0000 0000 0341` (attach then fail)
4. Nach Fehlschlag: Creator → Monetarisierung → Panel „Offene Zahlungen“
5. Nutzer → `/profile/billing` → 🟡 + Hinweis Portal

Siehe auch: `docs/sprints/STRIPE_MONETIZATION.md`, `CLOSED_BETA_STRIPE_E2E.md`
