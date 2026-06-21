# UNZE Beta Release Candidate 1 (RC1) — Abschlussbericht

**Version:** `0.3.0-rc.1`  
**Datum:** 21. Juni 2026  
**Production:** https://unze-platform.vercel.app  
**Status:** ? Keine kritischen Blocker — bereit für geschlossene Beta

---

## Executive Summary

UNZE RC1 fokussiert auf Stabilität, Konsistenz und Beta-Qualität ohne neue Großmodule. Das Auszeichnungssystem (`credentials`) bleibt das zentrale System; Zertifikate und Qualifikationen sind Kategorien bzw. abgeschlossene Sammlungen — kein paralleles System.

| Bereich | Status | Kritisch |
|---------|--------|----------|
| Architektur | ? Stabil | — |
| Automatisierte Tests | ? 12/12 Requirement, 15/15 Beta, 22/22 Phase0, Tickets, Join | — |
| Auszeichnungen & Zertifikate | ? Ein System | — |
| Requirement-Engine | ? Phase 1 produktiv | — |
| Ticket Check-In | ? Inkl. Reward-Feedback (039) | — |
| Supabase | ? Review dokumentiert | P2 offen |
| UX/UI | ? UTF-8, Profil-Historie | — |
| Stripe/Monetization | ?? Manuell | Nicht RC1-blockierend |

---

## 1. Architektur

- **Next.js 15 App Router** mit Server Actions, Middleware-Session
- **Supabase** als Auth, DB, Storage; RPC für sicherheitskritische Flows
- **Einheitliches Credential-Modell:** `badges` ? `credentials` (Migration 036, gleiche IDs)
- **Requirement-Engine Phase 1:** SQL-Predicates (credential, membership, premium, role, ticket, collection, verification)
- **Event-Rewards:** Post-Check-in via `apply_event_check_in_rewards`
- **Kein zweites Zertifikats-System:** `category = certificate` + `credential_collections` als Sammel-Qualifikation

---

## 2. Performance

| Metrik | Wert |
|--------|------|
| Production Build | ? Erfolgreich (~40s) |
| Shared First Load JS | ~103 kB |
| Community-Seite | ~153 kB First Load |
| Middleware | 90.6 kB |

Empfehlung Beta: `EXPLAIN ANALYZE` auf `community_members`, `user_credentials`, `requirement_sets` bei >1k Nutzer.

---

## 3. Sicherheit

Siehe `docs/security/SUPABASE_BETA_REVIEW.md`.

**Stärken:**
- RLS community-scoped, `can_manage_community` zentral
- Scanner: Need-to-know (`verify_unze_id` ohne Credential-Liste)
- Service Role nur server-side
- SECURITY DEFINER RPCs mit Permission-Guards

**Offen (P2, nicht RC1-blockierend):**
- Storage-Bucket-Policies manuell im Dashboard verifizieren
- Rate Limiting für API-Routen
- Audit-Log Retention (90 Tage Vorschlag)

---

## 4. Datenbank & Supabase

**Migrationen angewendet:** 001–039 (039: Check-In JSONB + Rewards-Feedback)

| Tabelle / RPC | Zweck |
|---------------|-------|
| `credentials` + `category` | Auszeichnungen inkl. Zertifikat-Typ |
| `user_credentials` | Vergabe-Historie mit `source_type` |
| `credential_collections` | Sammel-Qualifikationen |
| `requirement_sets` / `requirement_nodes` | UND/ODER, Pflicht/Empfehlung |
| `check_in_event_ticket` | Returns `{ ticketId, rewards }` |
| `evaluate_requirements` | `fulfilled`, `severity`, `satisfied[]`, `missing[]` |

**Indizes:** Event/Ticket, user_credentials, requirement_sets — aus Migrationen 020, 035, 036.

---

## 5. Stripe

- Checkout, Webhook, Customer Portal implementiert
- **`npm run test:monetization`:** Erfordert lokalen Dev-Server (localhost:3002) — **7 UI-Fetches fehlgeschlagen** (kein Server)
- **RC1-Entscheidung:** Monetization-E2E als **manuelle Beta-Checkliste** (Stripe Testkarte 4242…)

---

## 6. Requirement-Engine

**Automatisiert (`npm run test:requirements`):** 12/12 OK

| Kombination | Getestet |
|-------------|----------|
| UND | membership + role ? |
| ODER | premium \| membership ? |
| Pflicht (`severity=required`) | ? |
| Empfehlung (`severity=recommended`) | ? |
| Rollen | member leaf ? |
| Tickets | via Event-E2E ? |
| Premium | leaf eval ? |
| Mitgliedschaft | leaf eval ? |
| Auszeichnungen (credential) | leaf eval ? |
| Sammlungen (collection) | leaf eval ? |

---

## 7. Tickets & Check-In

**Automatisiert (`npm run test:event-tickets`):** 11/11 OK

| Schritt | Status |
|---------|--------|
| Ticket buchen | ? |
| Profil (DB) | ? |
| Stornieren | ? |
| Creator Check-In (Scan/Code) | ? |
| Mehrfachnutzung blockiert | ? |
| Statistik | ? |
| Post-Check-in Rewards (RPC) | ? Migration 039 |
| Scanner UI Feedback | ? Auszeichnung + Gruppe im Erfolgstext |

---

## 8. Rollen & Berechtigungen

- Community-Rollen: creator, admin, moderator, member
- Granulare Rechte: Accordion-Gruppen (`display-groups.ts`)
- Scanner: `manage_members` erforderlich
- Auszeichnung vergeben: Moderator+ via `MemberListClient`

Manuelle Rollen-Simulation (Phasen A–F): Checkliste in `docs/testing/BETA_E2E_TEST_PLAN.md` — für geschlossene Beta mit Testaccounts durchführen.

---

## 9. Auszeichnungen & Zertifikate

**Ein System — `credentials`:**

| Feature | RC1 |
|---------|-----|
| Speichern & Anzeige Profil | ? |
| Historie: Datum, Community, Verleiher | ? |
| Beschreibung | ? |
| Kategorie-Label (Zertifikat, Event, …) | ? |
| Quelle (`source_type`) | ? |
| Sammel-Qualifikation (Collection complete) | ? als Zertifikat-Eintrag |
| Requirement-Zugang via credential/collection | ? getestet |

Kein paralleles Zertifikats-Modul — `category: certificate` + abgeschlossene `credential_collections`.

---

## 10. UX / UI

| Punkt | Status |
|-------|--------|
| UTF-8 / Umlaute | ? `npm run check:utf8` grün |
| Leere Zustände Profil-Auszeichnungen | ? mit CTA Discover |
| Banner-Auswahl | ? neutrale Presets (Sprint 2) |
| Beitrittsanträge | ? vereinfachte Tabs |
| Plattform-ID-Auswahl | ? gruppiert |
| Granulare Rechte | ? Accordion |
| Scanner Hilfetexte | ? Encoding-Fix |
| Einheitliche Texte | ? Crowd Partner, Auszeichnungen |

---

## 11. Mobile & Desktop

- Responsive Layouts (Tailwind, page-padding)
- PWA-Shell Routes (`/api/pwa/*`)
- QR-Scanner für UNZE-ID & Tickets (Dashboard)
- Build: 29 Routen, keine Build-Fehler

Manuelle Geräte-Tests empfohlen: iOS Safari PWA, Android Chrome Scanner.

---

## 12. Testplan Phasen A–F

| Phase | Inhalt | Automatisiert | Manuell |
|-------|--------|---------------|---------|
| A | Gast-Routen | ? HTTP Smoke | UI Walkthrough |
| B | Auth & Profil | ? Redirects | Login-Flow |
| C | Community & Join | ? DB E2E | UI Join |
| D | Requirements & Scanner | ? RPC + 039 | Live Scan |
| E | Auszeichnungen | ? DB | Profil UI |
| F | Creator & Monetization | Teilweise | Stripe Sandbox |

**Automatisierte Gesamtübersicht:**

```
npm run test:phase0      ? 22/22 OK
npm run test:beta        ? 15/15 OK
npm run test:event-tickets ? 11/11 OK
npm run test:join-flow   ? OK
npm run test:requirements ? 12/12 OK
npm run validate:quick   ? OK
npm run build            ? OK
```

---

## 13. Bekannte Restpunkte (nicht kritisch)

1. **Monetization E2E:** Nur mit lokalem Dev-Server + Stripe — manuelle Beta-Checkliste
2. **Manuelle Rollen-Simulation A–F:** Testaccounts in geschlossener Beta
3. **Supabase P2:** Storage-Policies, Rate Limits, Audit Retention
4. **Kurs-/Produkt-Auszeichnungen:** Kategorien vorbereitet, Features geplant
5. **ESLint Warnings:** Unbenutzte Demo-Parameter (kein Runtime-Risiko)

---

## 14. RC1 Freigabe

**Entscheidung:** UNZE **Beta Release Candidate 1** (`0.3.0-rc.1`) — **freigegeben** für geschlossene Beta.

Nach Deploy: Smoke-Test Live-Version, dann ausschließlich Nutzerfeedback und Bugfixes — keine neuen Features bis Beta-Abschluss.

---

_Erstellt im Rahmen der UNZE-Beta-Finalisierung. Automatisierte Reports: `docs/testing/REQUIREMENT_COMBINATIONS_REPORT.md`, `docs/sprints/EVENT_TICKET_E2E_REPORT.md`._
