# UNZE Stabilisierungs-Status

**Datum:** 2026-05-31  
**Production:** https://unze-platform.vercel.app  
**Supabase:** https://zzbjvcwmdrnuzzlepfja.supabase.co  
**Build:** `npm run build` ✓  
**Audit:** `npm run test:stabilization`

---

## Zusammenfassung

| Status | Anzahl |
|--------|--------|
| Funktioniert | 7 |
| Teilweise | 5 |
| Fehlerhaft | 2 |

**Hauptblocker:** Migrationen 021, 022, 024 sind in Supabase **nicht ausgeführt**.  
Code und Routen sind stabil — volle Funktionalität erst nach SQL-Ausführung.

---

## 1. Migrationen 021, 022, 023, 024

| | |
|---|---|
| **Status** | **Fehlerhaft** |
| **Ursache** | Tabellen/Spalten fehlen in der verbundenen Supabase-Instanz. `SUPABASE_DB_URL` fehlt lokal → automatische Ausführung nicht möglich. |
| **Lösung** | Supabase → SQL Editor → `database/migrations/BUNDLE_021_024.sql` ausführen. Danach `npm run check:migrations`. |

| Migration | Inhalt | Prüfung |
|-----------|--------|---------|
| **021** | `platform_feature_flags`, Feed-RLS | `platform_feature_flags` Tabelle |
| **022** | `community_events`, `group_type`, Reviews | Events, Dienstleistungen, Bewertungen |
| **023** | Rating-Aggregate bereinigen (Daten) | Optional nach 022; kein Schema |
| **024** | Stripe-Tabellen, Event-Favoriten | Monetarisierung, `community_payments` |

```bash
npm run check:migrations    # 021 + 022 + 024
npm run db:migrate:pending  # nur mit SUPABASE_DB_URL
```

---

## 2. Discover

| Tab | Status | Ursache | Lösung | URL |
|-----|--------|---------|--------|-----|
| Communities | **Funktioniert** | Kern-Schema vorhanden; Demo-Communities laden | — | [/discover](https://unze-platform.vercel.app/discover) |
| Gruppen | **Teilweise** | `group_type` fehlt (022); Legacy-Fallback zeigt Gruppen ohne Typ-Filter | 022 ausführen | [/discover?tab=groups](https://unze-platform.vercel.app/discover?tab=groups) |
| Events | **Teilweise** | `community_events` fehlt; UI zeigt leeren Zustand / Hinweis | 022 ausführen | [/discover?tab=events](https://unze-platform.vercel.app/discover?tab=events) |
| Dienstleistungen | **Teilweise** | `group_type = service` ohne Spalte nicht filterbar | 022 ausführen | [/discover?tab=services](https://unze-platform.vercel.app/discover?tab=services) |

**Code-Fix (Stabilisierung):** Discover lädt nicht mehr fehlerhaft bei fehlenden Tabellen — klare Platzhalter-Meldungen statt leerer Fehler.

---

## 3. Creator-Profil

| | |
|---|---|
| **Status** | **Funktioniert** |
| **Ursache** | — |
| **Lösung** | — |

| Feature | Status |
|---------|--------|
| Route `/creator/[username]` | ✓ |
| Avatar, Headline, Verifizierung | ✓ |
| Communities & Gruppen | ✓ |
| Netzwerk-Bewertungen | ⚠ Teilweise ohne 022 (Review-Tabellen) |

**URL:** https://unze-platform.vercel.app/creator/edudemo

---

## 4. Creator-Dashboard

| | |
|---|---|
| **Status** | **Funktioniert** (Routen & UI) |
| **Ursache** | Dashboard-Tabs (Events, Monetarisierung) benötigen 022/024 für volle Daten |
| **Lösung** | Migrationen ausführen |

| Tab | Status ohne Migrationen |
|-----|-------------------------|
| Übersicht, Mitglieder, Einstellungen | ✓ |
| Events | ⚠ Erstellung speichert nicht ohne `community_events` |
| Monetarisierung | ✗ Finanzdaten ohne 024 |
| Gruppen / Dienstleistungen | ⚠ `group_type` fehlt |

**URL:** https://unze-platform.vercel.app/dashboard

---

## 5. Nutzerprofil

| | |
|---|---|
| **Status** | **Funktioniert** |
| **Ursache** | — |
| **Lösung** | — |

| Bereich | Status | URL |
|---------|--------|-----|
| Profil-Übersicht | ✓ | [/profile](https://unze-platform.vercel.app/profile) |
| Einstellungen | ✓ | `/profile/settings` |
| Abos & Zahlungen | ⚠ UI ✓, Daten erst mit 024 + Stripe | [/profile/billing](https://unze-platform.vercel.app/profile/billing) |

---

## 6. Favoriten

| | |
|---|---|
| **Status** | **Funktioniert** (Community-/Gruppen-Follows) |
| **Ursache** | Event-Favoriten benötigen Migration 024 (`follows.target_event_id`) |
| **Lösung** | 024 ausführen |

**URL:** https://unze-platform.vercel.app/favorites

---

## 7. Bewertungen

| | |
|---|---|
| **Status** | **Teilweise** |
| **Ursache** | `community_reviews` / `group_reviews` fehlen (022). UI (`EntityReviewsSection`, `RatingSummary`) ist implementiert. |
| **Lösung** | 022 ausführen; optional 023 für Demo-Daten-Bereinigung |

| Verhalten | Status |
|-----------|--------|
| Kein Stern bei 0 Reviews | ✓ (Code) |
| Durchschnitt = geladene Reviews | ✓ (Code) |
| Review absenden | ✗ ohne 022 |
| DB-Aggregate sync | ✓ nach Submit (wenn Tabellen da) |

**URL:** https://unze-platform.vercel.app/community/rocket-league-ssl

---

## 8. Event-System

| | |
|---|---|
| **Status** | **Teilweise** |
| **Ursache** | `community_events` Tabelle fehlt (022); Event-Favoriten brauchen 024 |
| **Lösung** | BUNDLE_021_024.sql |

| Feature | Status |
|---------|--------|
| Event erstellen (Dashboard) | ✗ ohne 022 |
| Event-Liste Community/Discover | ⚠ leer / Hinweis |
| Event-Favoriten | ✗ ohne 024 |
| Dashboard-Tab Events | ✓ Route |

---

## 9. Monetarisierung

| | |
|---|---|
| **Status** | **Fehlerhaft** (Runtime) / **Funktioniert** (Code) |
| **Ursache** | Migration 024 nicht ausgeführt; Stripe-Keys fehlen in `.env.local` und Vercel |
| **Lösung** | 024 ausführen → Stripe Testmodus → `npm run check:stripe` |

**Dokumentation:**

- Architektur & Setup: `docs/sprints/STRIPE_MONETIZATION.md`
- E2E-Testplan: `docs/sprints/MONETIZATION_E2E_TEST_REPORT.md`
- Revenue/Referral: `docs/sprints/STRIPE_REVENUE_REFERRAL.md`

| Komponente | Code | Runtime |
|------------|------|---------|
| Abo-Checkout (Monat/Halbjahr/Jahr) | ✓ | ✗ |
| Einmalzahlung Dienstleistung | ✓ | ✗ |
| Stripe Webhook + Sync | ✓ | ✗ |
| Customer Portal / Kündigung | ✓ | ✗ |
| Creator-Finanzdashboard | ✓ | ✗ |

---

## Detailmatrix (automatisiert)

| Bereich | Status | Ursache | Lösungsvorschlag | URL |
|---------|--------|---------|------------------|-----|
| **Migrationen 021–024** | Fehlerhaft | Fehlend: 021, 022, 024 | `BUNDLE_021_024.sql` im SQL Editor | Supabase |
| **Discover — Communities** | Funktioniert | Seite lädt | — | /discover |
| **Discover — Gruppen** | Teilweise | 022 fehlt | 022 ausführen | /discover?tab=groups |
| **Discover — Events** | Teilweise | 022 fehlt | 022 ausführen | /discover?tab=events |
| **Discover — Dienstleistungen** | Teilweise | 022 fehlt | 022 ausführen | /discover?tab=services |
| **Creator-Profil** | Funktioniert | Route OK | — | /creator/edudemo |
| **Nutzerprofil** | Funktioniert | Route OK | — | /profile |
| **Creator-Dashboard** | Funktioniert | Route OK | — | /dashboard |
| **Favoriten** | Funktioniert | Route OK | Event-Fav. nach 024 | /favorites |
| **Bewertungen** | Teilweise | 022 fehlt | 022 ausführen | /community/{slug} |
| **Monetarisierung** | Fehlerhaft | 024 + Stripe fehlen | BUNDLE + Stripe Keys | /profile/billing |
| **Production Build** | Funktioniert | Build OK | — | — |

---

## Deine nächsten Schritte (Reihenfolge)

1. **Supabase SQL Editor:** `database/migrations/BUNDLE_021_024.sql` ausführen  
2. **`npm run check:migrations`** — alle ✓  
3. **`npm run seed:demo`** (optional, Demo-Daten)  
4. **`npm run test:stabilization`** — Ziel: 0 × Fehlerhaft  
5. **Stripe Testmodus** konfigurieren → `npm run check:stripe`  
6. **Manueller E2E** laut `STRIPE_MONETIZATION.md`

Erst wenn Schritte 1–4 grün sind, ist die Plattform **stabil**. Design/UX danach.

---

_Bericht generiert via `npm run test:stabilization`. Code-Änderungen: Discover-Fallbacks, `BUNDLE_021_024.sql`, Audit-Skript._
