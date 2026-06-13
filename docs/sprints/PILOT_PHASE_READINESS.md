# UNZE — Pilotphasen-Vorbereitung

**Datum:** 13. Juni 2026  
**Version:** `0.3.0-beta.1`  
**Production:** https://unze-platform.vercel.app  
**Feature-Freeze:** aktiv

---

## Executive Summary

Die Kernplattform ist **pilotbereit**. In dieser Runde wurden Service-CRUD im Dashboard ergänzt, Verifizierungs-Details und Meldungen erweitert, Community Score für Mobile optimiert und alle Bereiche dokumentiert. Performance: **Ø TTFB 261 ms** (Production, unverändert im grünen Bereich).

| # | Bereich | Status |
|---|---------|--------|
| 1 | Service-System | ✅ CRUD + Tests; Buchung MVP |
| 2 | Stripe E2E | ✅ Dokumentiert (Testmodus) |
| 3 | Rückzahlungen | 📋 Konzept vorbereitet |
| 4 | Verifizierung | ✅ Info-Dialog + Vorbereitung |
| 5 | Plattform-Meldungen | ✅ Minimalversion erweitert |
| 6 | Landingpage / Home | ✅ Hero + Gast-Erlebnis |
| 7 | Community Score | ✅ Mobile optimiert |
| 8 | E-Mail / Auth | ✅ Keine Technik-Begriffe |
| 9 | Performance | ✅ Gemessen, keine Regression |
| 10 | Pilotstart | ✅ Checkliste unten |

---

## 1. Service-System

### Workflow-Status

| Schritt | Creator | Nutzer | Status |
|---------|---------|--------|--------|
| Erstellen | Dashboard → Gruppen / Community bearbeiten | — | ✅ Typ `service`, Preis optional |
| Bearbeiten | Stift-Icon im Gruppen-Manager | — | ✅ **Neu:** Titel, Beschreibung, Preis |
| Anzeigen | — | Community-Tab, Discover, Detailseite | ✅ |
| Buchen | — | ServiceBookingPanel, Slots + Stripe | ⚠️ MVP |
| Deaktivieren | Auge-aus-Icon (`is_public = false`) | — | ✅ **Neu** |
| Löschen | Papierkorb + Bestätigung | — | ✅ Hard Delete |

### Erfolgs- / Fehlermeldungen

- `ActionFeedback` im Gruppen-Manager (erstellt, gespeichert, deaktiviert, gelöscht)
- Buchung: `ACTION_MESSAGES.service.booked` / Server-Fehler ohne Technik-Details
- Kostenlose Buchung: UI-Erfolg — **noch keine DB-Persistenz** (bewusst MVP)

### Mobile

- Service-Detail: Booking-Panel zuerst (`order-1` auf Mobile)
- Slot-Grid: 2 Spalten, volle Breite CTA
- Gruppen-Manager: Touch-Targets, stacked Layout

### Automatisierter Test

```bash
npm run test:services   # 11/11 OK — siehe SERVICE_E2E_REPORT.md
```

### Offene Punkte (post-Pilot)

- `service_bookings`-Tabelle + echte Slot-Verfügbarkeit
- Kostenlose Buchung persistieren
- Stripe Price Sync pro Service (`stripe_price_id`)

---

## 2. Stripe End-to-End

### Was funktioniert (Testmodus)

| Flow | Implementierung | Test |
|------|-----------------|------|
| **Mitgliedschaften** | `createCommunitySubscriptionCheckout` — Monat/Halbjahr/Jahr | ✅ `npm run test:monetization` |
| **Services (kostenpflichtig)** | `createGroupOneTimeCheckout` → `community_payments` | ✅ Webhook `checkout.session.completed` |
| **Event-Tickets** | Kostenlos — DB-Tickets, QR, Check-In | ✅ `npm run test:event-tickets` |
| **Customer Portal** | Abo kündigen / Rechnungen | ✅ `/profile/billing` |
| **Connect** | Creator-Onboarding, 7,7 % Platform Fee | ✅ Dashboard Referrals |
| **Webhook** | 8 Event-Typen, Idempotenz | ✅ `stripe-webhook.service.ts` |

### Testmodus heute

- Env-Keys: `sk_test_`, `pk_test_`, `whsec_`
- Creator-Dashboard zeigt Badge „Testmodus“
- Sandbox-Ledger für Revenue-Share-Vorschau
- Testkarte: `4242 4242 4242 4242`

### Was für Livebetrieb fehlt

1. Live-Keys in Vercel (`sk_live_`, `pk_live_`, Live-Webhook-Secret)
2. Production-Webhook: `https://unze-platform.vercel.app/api/stripe/webhook`
3. Stripe Customer Portal in Live-Account aktivieren
4. Connect Express Accounts für Creator (Live)
5. **Kostenpflichtige Event-Tickets** — nicht implementiert
6. Live Revenue Ledger (aktuell nur Sandbox-Einträge)
7. Manuelle Live-E2E-Checkliste (`docs/sprints/CLOSED_BETA_STRIPE_E2E.md`)

Details: `docs/sprints/STRIPE_MONETIZATION.md`

---

## 3. Rückzahlungen — Konzept (Vorbereitung)

**Verantwortung beim Creator** — UNZE dokumentiert, Stripe verarbeitet.

```
Creator Dashboard
  → Zahlungen / Buchungen (geplant)
  → „Rückzahlung veranlassen“
       ↓
Stripe Refund API (Creator-Connect-Konto)
       ↓
Webhook charge.refunded (bereits implementiert)
       ↓
UNZE: community_payments.status = refunded
      + Audit-Log + optional Nutzer-Benachrichtigung
```

### Bereits vorhanden

- Webhook `handleChargeRefunded` — setzt Payment auf `refunded`, soft-remove Member
- Kein Creator-UI für ausgehende Refunds

### Geplant (Post-Pilot, kein Feature-Freeze-Bruch)

1. Dashboard-Tab „Zahlungen“ mit Liste `community_payments`
2. Button „Rückzahlung“ → `stripe.refunds.create({ charge })`
3. Audit-Eintrag + E-Mail an Nutzer: „Rückzahlung durch [Community] veranlasst“
4. Hinweis: Creator trägt Verantwortung; UNZE ist Vermittler

---

## 4. Verifizierungssystem

### Geplante Typen

| Typ | Technisch | UI |
|-----|-----------|-----|
| Profil verifiziert | `profiles.is_verified` (via Creator-Flow) | ✅ |
| Creator verifiziert | `creator_verification_tier` | ✅ |
| Gewerbe verifiziert | Business-Dokumente in `/verify/creator` | ✅ Backend |
| Community verifiziert | `communities.is_verified` | ✅ |

### Neu: Klick auf grünes Häkchen

`VerificationInfoTrigger` zeigt Modal:

- Verifizierungstyp
- Status: Verifiziert
- Verifiziert am (sofern in DB)
- Geprüft durch UNZE

Eingebunden: Community-Header, Creator-Profil.

### Pilot-Hinweise

- Community-Verifizierung: Review derzeit auch durch Community-Owner möglich → für Pilot **nur UNZE-Admin** einsetzen
- Platform-Admin: `profiles.platform_role = 'platform_admin'`
- Antrag: `/verify/creator` | Community: Dashboard → Verifizierung

---

## 5. Plattform-Meldungen (Minimalversion)

### Meldbar (Pilot)

| Ziel | UI | Dashboard |
|------|-----|-----------|
| Community | Community-Seite | ✅ Moderation |
| Gruppe / Service | Gruppen-Detail (**neu**) | ✅ Moderation |
| Event | Event-Detail (**neu**) | ✅ Moderation |
| Creator | Creator-Profil (**neu**) | ✅ Moderation |
| Nutzer | Enum vorhanden | ⚠️ UI folgt |

### Owner sieht

`/dashboard/community/[slug]/moderation`:

- Offene / erledigte / abgewiesene Meldungen
- Zieltyp auf Deutsch (Gruppe/Service, Event, …)
- Aktionen: Erledigen, Abweisen, Verwarnung/Strike (bei Nutzer-Zielen)

### Migration

```bash
npm run db:migrate:032   # report_target_type + group, event
```

---

## 6. Landingpage / Startseite

| Kriterium | Status |
|-----------|--------|
| Offizielles Hero-Bild | ✅ `public/brand/unze-home-hero.png` |
| Mobile (Zuschnitt, Lesbarkeit) | ✅ Gradient + object-center |
| Communities/Gruppen/Events/Services erklärt | ✅ `HomeValueProps` |
| Keine App-Store-Hinweise | ✅ |
| Keine Technik-Begriffe | ✅ |
| Einheitliche Texte mit Login | ✅ `platform-copy.ts` |

---

## 7. Community Score — Mobile

| Fix | Datei |
|-----|-------|
| Score-Pill kleiner auf Mobile | `CommunityHeader.tsx` |
| Score-Zahl responsive (4xl → 5xl) | `CommunityLevelPanel.tsx` |
| Breakdown-Zeilen mit gap, kein Abschneiden | `CommunityLevelPanel.tsx` |
| Keine Bronze/Silver/Gold-Badges | ✅ (nur numerischer Score) |

---

## 8. E-Mail-Verifizierung

| Flow | Nutzer-Meldung | Technik sichtbar? |
|------|----------------|-------------------|
| Registrierung | „Bestätige deine E-Mail…“ | ❌ Nein |
| Login | „E-Mail oder Passwort falsch“ | ❌ Nein |
| Callback | Fehlercodes → deutsche Texte | ❌ Nein |
| Passwort-Reset | Generische Erfolgs-/Fehlertexte | ❌ Nein |

Implementierung: `lib/auth/user-facing-errors.ts`

**E-Mail-Absender:** Supabase Auth Templates in Dashboard anpassen → Absender „UNZE“, kein Supabase-Branding (manuell in Supabase → Authentication → Email Templates).

---

## 9. Performance

**Production-Messung (13.06.2026):**

| Route | TTFB |
|-------|------|
| Home | 561 ms |
| Discover | 291 ms |
| Community | 175 ms |
| **Ø (7 Routen)** | **261 ms** |

Home First Load JS: **124 kB** (unverändert nach Hero-Image).  
Keine spürbare Verschlechterung durch neue Komponenten.

```bash
node scripts/measure-performance.mjs https://unze-platform.vercel.app
```

---

## 10. Pilotphase — Start-Checkliste

### Deployment

- [ ] `git push origin main` → Vercel Auto-Deploy
- [ ] `npm run db:migrate:032` auf Production-DB
- [ ] Demo-Daten: `npm run seed:demo` (falls nötig)

### Tests vor Einladung

```bash
npm run build
npm run test:e2e-urls
npm run test:join-flow
npm run test:event-tickets
npm run test:services
npm run test:monetization   # Stripe Testmodus
```

### Erste Nutzer einladen

1. Closed-Beta-Tester-Paket: `docs/sprints/CLOSED_BETA_TESTER_PACKAGE.md`
2. Creator-Account + Demo-Communities zeigen
3. Feedback-Kanal definieren (E-Mail / Discord)

### Feedback sammeln

- Startseiten-Eindruck (Gast vs. eingeloggt)
- Service-Buchung (paid + free)
- Mobile Bedienbarkeit
- Verständlichkeit Verifizierung / Score

---

## Geänderte Dateien (diese Runde)

- `components/community/CommunityGroupManager.tsx` — CRUD UI
- `app/community/actions.ts` — update/toggle/delete + Meldungen
- `components/verification/VerificationInfoTrigger.tsx`
- `components/governance/ReportDialog` — wired auf Gruppe/Event/Creator
- `database/migrations/032_report_group_event_targets.sql`
- `docs/sprints/PILOT_PHASE_READINESS.md` (dieses Dokument)

---

*Feature-Freeze bleibt aktiv. Fokus: Qualität, Stabilität, UX, Monetarisierung, Verifizierung, Pilotnutzer.*
