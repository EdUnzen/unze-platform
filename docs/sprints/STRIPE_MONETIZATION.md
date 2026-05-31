# Stripe-Monetarisierung & Testplan

## Voraussetzungen

### Umgebungsvariablen

| Variable | Zweck |
|----------|--------|
| `STRIPE_SECRET_KEY` | Server-Checkout & Webhooks |
| `STRIPE_WEBHOOK_SECRET` | Signaturprüfung `/api/stripe/webhook` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional (Client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook-Schreibzugriff (Admin-Client) |
| `NEXT_PUBLIC_APP_URL` | Success/Cancel-URLs |

### Datenbank

Migration `024_stripe_monetization_events.sql` ausführen (enthalten in `database/BUNDLE_all_migrations.sql`).

Neue Tabellen/Spalten:

- `communities`: Preise + Stripe Price IDs (monatlich, halbjährlich, jährlich)
- `subscriptions`: `cancel_at_period_end`, optional `group_id`
- `community_payments`: Einmalzahlungen & Abo-Rechnungen
- `stripe_webhook_events`: Idempotenz
- `follows.target_event_id`: Event-Favoriten

### Stripe Dashboard

1. **Webhook** auf `https://<domain>/api/stripe/webhook` mit Events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `account.updated` (Connect)
2. **Customer Portal** aktivieren (Kündigung, Rechnungen).
3. **Stripe Connect** für Creator-Auszahlungen (optional, aber empfohlen).

---

## Funktionsübersicht

| Bereich | Route / Komponente |
|---------|-------------------|
| Abo abschließen | Community-Seite → Join-Panel → `SubscribeCommunityPanel` |
| Einmalzahlung (Dienstleistung) | Gruppen-Seite → `GroupCheckoutButton` |
| Creator-Preise | Dashboard → Monetarisierung → `MonetizationPrepPanel` |
| Creator-Finanzen | Dashboard → Monetarisierung → `CreatorFinanceDashboard` |
| Nutzer-Abos & Zahlungen | `/profile/billing` → Stripe Portal |
| Events | Dashboard → Events → `EventManager` |
| Event-Favoriten | Community / Discover → Herz-Button |

### Abo-Intervalle

- Monatlich (`month`)
- Halbjährlich (`semiannual`, Stripe `interval_count: 6`)
- Jährlich (`year`)
- Einmalzahlung für Dienstleistungs-Gruppen (`group_one_time`)

Kündigungen laufen über **Stripe Customer Portal**; Status wird per Webhook synchronisiert (`cancel_at_period_end`, `canceled_at`).

---

## Manueller End-to-End-Test

### 1. Creator vorbereiten

1. Als Creator anmelden.
2. Community auf `premium` + Monetarisierung aktivieren.
3. Dashboard → **Monetarisierung** → Preise speichern (z. B. 9,99 / 49,99 / 89,99 €).
4. Optional: Stripe Connect verbinden.

### 2. Abo abschließen (Nutzer)

1. Als zweiter Nutzer anmelden.
2. Premium-Community öffnen → **Abo abschließen** (Intervall wählen).
3. Stripe Testkarte `4242 4242 4242 4242` verwenden.
4. Nach Redirect: `/profile/billing?success=1` — Abo erscheint als **Aktiv**.

### 3. Webhook prüfen

- Stripe Dashboard → Webhooks → letzter `checkout.session.completed` = 200.
- Supabase: Zeile in `subscriptions` mit `status = active`.
- Optional: `community_payments` bei Rechnung (`invoice.paid`).

### 4. Mitgliedschaft

- Nutzer sollte Community beitreten können (je nach Access-Logik).
- Creator-Dashboard → Monetarisierung: **Aktive Abos +1**, Abonnenten-Tabelle gefüllt.

### 5. Kündigung

1. Nutzer → `/profile/billing` → **Abo verwalten / kündigen** (Stripe Portal).
2. „Am Periodenende kündigen“ wählen.
3. Webhook `customer.subscription.updated` → `cancel_at_period_end = true`.
4. Profil zeigt **Kündigt zum Periodenende**; Creator sieht **Laufend auslaufend +1**.

### 6. Einmalzahlung (Dienstleistung)

1. Gruppe mit Typ `service` und `price_cents > 0` anlegen.
2. Gruppen-Seite → **Jetzt buchen**.
3. Nach Zahlung: Eintrag unter **Meine Zahlungen**; Creator: **Einmalzahlungen / Dienstleistungen**.

### 7. Events

1. Dashboard → **Events** → Event erstellen.
2. Event erscheint auf Community-Seite und Discover → Tab Events.
3. Herz-Button → Favoriten-Seite zeigt Event.

---

## Bekannte Grenzen

- Abos sind derzeit **Community-weit** (nicht pro Gruppe).
- Webhook-Schreibzugriff erfordert `SUPABASE_SERVICE_ROLE_KEY`.
- Production: Migrationen 021, 022 und 024 müssen in Supabase angewendet sein.
