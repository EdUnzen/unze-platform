# Optimierung und Finalisierung — Bearbeitungsstand

**Datum:** 2026-06-13  
**Quelle:** `C:\Users\GBT B450M-S2H\Desktop\UNZE\UNZE APP\Optimierung und Finalisierung`  
**Codebase:** `UNZE/` (Production: https://unze-platform.vercel.app)  
**Methodik:** Abgleich aller 8 PDF-Dokumente mit Code, Sprint-Docs und automatisierten Checks

---

## Ordner-Inhalt (Referenz)

| Datei | Thema | Roadmap-Phase |
|-------|--------|---------------|
| `UNZE_Optimierung_und_Finalisierung.pdf` | Master-Prioritäten P1–P5 | Gesamt |
| `02_Performance_und_Skalierung.pdf` | Performance & Skalierung | Phase 1.1 |
| `03_Stripe_und_Monetarisierung.pdf` | Stripe, Lifecycle, Premium | Phase 1.2–1.5 |
| `04_Creator_Dashboard_und_Verwaltungslogik.pdf` | Creator-Verwaltung | Phase 2 |
| `05_Event_Ticket_System_v1.pdf` | Event-Tickets & Check-In | Phase 4 |
| `06_Rechte_Rollen_und_Datenschutz.pdf` | Rollen, Least-Privilege, Datenschutz | Phase 2 |
| `07_Closed_Beta_Checkliste.pdf` | Release-Check vor Beta | Phase 5 |
| `08_UNZE_Roadmap_Sprintplanung.pdf` | Sprint 1–4 + Langfristziel | Querschnitt |

---

## 1. Abgeschlossen

Punkte, deren **Kern-Implementierung im Code vorliegt** und durch Build/Typecheck abgesichert ist. Manuelle Production-E2E-Tests sind separat vermerkt.

### Phase 1.1 — Performance (Quick Wins)

**Referenz:** `02_Performance_und_Skalierung.pdf` (Teilmenge)  
**Dokument:** `docs/sprints/PHASE_1_1_PERFORMANCE.md`

| Punkt | Status |
|-------|--------|
| Review-Kommentare N+1 → Batch-Load | ✅ |
| Activity-Stats SQL COUNT statt Row-Scan | ✅ |
| Referral-Enrichment batchen | ✅ |
| Discover-Cache (`revalidateTag`) bei Mutationen | ✅ |
| Gruppen-Zählung per SQL COUNT | ✅ |

### Phase 1.2 — Stripe & Monetarisierung (Kern)

**Referenz:** `03_Stripe_und_Monetarisierung.pdf` (Teilmenge)  
**Dokument:** `docs/sprints/PHASE_1_2_STRIPE.md`

| Punkt | Status |
|-------|--------|
| Premium-Join Bug (Abo hebt Join-Blockade auf) | ✅ |
| Auto-Join nach Stripe-Checkout (Webhook → `community_members`) | ✅ |
| Membership ↔ Subscription Sync | ✅ |
| Webhook-Robustheit (Fehler → 500, Idempotency) | ✅ |
| Checkout-Metadata Session + Subscription | ✅ |
| Invoice-Idempotency (`community_payments`) | ✅ |
| Refund-Handler `charge.refunded` (Payment-Status) | ✅ |
| Checkout-Abbruch / Fehler-UI | ✅ |
| Profil-Billing / Stripe Customer Portal | ✅ (bestehend) |
| Creator-Finanzübersicht (Umsatz, Abos, Kündigungs-Zähler) | ✅ (bestehend) |

### Phase 1.4 — Kündigungs- & Entfernungslogik

**Referenz:** Master P1 „Kündigungslogik“, Doc 03 Lifecycle, Doc 04 „Zu entfernende Mitglieder"  
**Dokument:** `docs/sprints/PHASE_1_4_CANCELLATION.md`

| Punkt | Status |
|-------|--------|
| Tabelle `community_member_removal_tasks` + Migration 029 | ✅ (Code) |
| Queue bei Kündigung / Abo-Ende / Austritt | ✅ |
| Soft-Remove statt Hard-Delete | ✅ |
| Creator-Benachrichtigung bei neuen Removal-Tasks | ✅ |
| Dashboard „Zu entfernen"-Panel + Bestätigung | ✅ |
| Badge auf Overview & Quick-Nav | ✅ |

### Bereits vor Phase 1 vorhanden (Beta-Basis)

| Bereich | Referenz-Dokument(e) | Nachweis |
|---------|----------------------|----------|
| Registrierung, Login, OAuth (Google/Apple) | 07 | `AuthForm`, Supabase Auth |
| Community erstellen / bearbeiten / entdecken | 07 | Discover, Create-Flow |
| Bewerbungsverwaltung | 04, 07 | `/dashboard/.../requests` |
| Mitgliederverwaltung (Rollen, Entfernen, Restrictions) | 04 | `/dashboard/.../members` |
| Events (Anlegen, Detailseite, Discover) | 04, 05 (ohne Tickets) | Event-Services, Event-Detail |
| Services & Buchungsflow (MVP) | 04 | ServiceBookingPanel |
| Referral-Dashboard (Basis) | 04, 08 Sprint 3 | `/dashboard/referrals` |
| Moderation, Strikes, Audit | 04, 06 | Governance-Panels |
| RLS, Rollenmodell, Plattform-Admin (DB-Ebene) | 06 | Migrationen, `is_platform_admin` |
| Share-Menü (WhatsApp/Telegram Link teilen) | Master P5 (Teil) | `ShareMenu.tsx` |
| Stabilisierungs-Audit (13/14 OK) | 07 | `docs/sprints/STABILIZATION_STATUS_REPORT.md` |
| Build & Typecheck | 07 | `npm run validate:quick`, `npm run build` ✅ |

---

## 2. Teilweise umgesetzt

Punkte mit **begonnener oder grundlegender** Umsetzung — Kern fehlt, Production-Verifikation ausstehend, oder Scope des PDFs nicht vollständig abgedeckt.

### 02 — Performance und Skalierung

| Punkt aus PDF | Stand | Was fehlt |
|---------------|-------|-----------|
| Discover optimieren | Cache-Invalidierung ✅ | Dashboard-Perf, Lazy-Loading, Bildoptimierung (`next/image`) |
| Dashboard optimieren | Attention-Panel ✅ | Keine gezielte Dashboard-Performance-Analyse |
| Datenbankabfragen optimieren | Quick Wins ✅ | Engagement Read-then-Write, Notification Fan-out |
| Caching verbessern | Discover-Tag ✅ | Kein breites Cache-Konzept, PWA Offline-Shell fehlt |
| Re-Renders reduzieren | — | Nicht systematisch analysiert/optimiert |
| Feed-Virtualisierung | — | Nicht implementiert |
| Mobile Performance (Safari/Android) | TTFB ~253 ms Prod | Keine formalen Mobile-Testprotokolle |
| Skalierungstests (10/100/1000 Communities) | — | Nicht durchgeführt |
| Doppelte Requests / Endlosschleifen | Checkpoint identifiziert | Kein vollständiger Fix-Lauf |
| Zielwerte (<3 s, PWA stabil) | Build OK | Kein Lighthouse CI / dokumentierter Mobile-Pass |

**Dokument:** `PHASE_1_1_PERFORMANCE.md` listet offene Restpunkte explizit.

### 03 — Stripe und Monetarisierung

| Punkt aus PDF | Stand | Was fehlt |
|---------------|-------|-----------|
| Membership Lifecycle gesamt | Sync + Queue ✅ | **Migration 029 in Prod**, Live-E2E unverifiziert |
| Rückerstattung → Mitgliedschaft prüfen | Payment → `refunded` ✅ | Kein automatisches Abo-/Membership-Revoke bei Refund |
| Zahlungsfehler → Creator informieren | Webhook sync `past_due` ✅ | Keine dedizierte Creator-Benachrichtigung bei `invoice.payment_failed` |
| Stripe E2E / Signatur / Fehlerszenarien | Code + Docs | Manueller Live-Test (`test:monetization`) ausstehend |
| Creator-Übersicht Kündigungen | Zähler + Abonnenten-Tabelle ✅ | Keine dedizierte **Kündigungsübersicht**-Seite mit Detail-Liste |
| Webhook `charge.refunded` in Stripe Dashboard | Code bereit | Event ggf. noch nicht in Prod-Webhook registriert |

### 04 — Creator Dashboard und Verwaltungslogik

| Punkt aus PDF | Stand | Was fehlt |
|---------------|-------|-----------|
| Offene Bewerbungen | ✅ Attention + Requests | — |
| Aktive Mitglieder | ✅ | — |
| Kündigungen | ⚠️ Stats + Removal-Queue | Aggregierte Kündigungs-Ansicht, kein Task-Center |
| Zu entfernende Mitglieder | ✅ Panel (1.4) | Prod-Migration + E2E |
| Referral-Übersicht | ✅ Basis-Dashboard | Sprint 3: „Referral-System **fertigstellen**" |
| Services / Events | ✅ CRUD + Dashboard | — |
| **Task-Center** (aggregiert) | ⚠️ Attention-Panel | Kein zentrales Inbox/Task-Center |
| **Freischaltungscenter** (WhatsApp/Discord/Telegram) | ⚠️ Plattform-Links auf Community | Kein dediziertes Freischaltungs-UI für externe Kanäle |
| Member-only Links | ⚠️ Invite-Links in DB | Kein Freischaltungscenter laut Doc 04 |
| Creator Transfer | — | Nicht implementiert |

### 06 — Rechte, Rollen und Datenschutz

| Punkt aus PDF | Stand | Was fehlt |
|---------------|-------|-----------|
| Rollenmodell Community | ✅ creator/moderator/member/… | — |
| Creator-Rechte | ✅ Permission Engine | — |
| Plattformadmin (UNZE) | ✅ DB + Verification | Kein vollständiges Plattform-Admin-UI für alle Doc-06-Aufgaben |
| Least-Privilege | ✅ RLS-Basis | `is_community_member()` ignoriert `deleted_at` → Soft-Deleted können RLS-seitig noch als Member gelten |
| Datenschutz-Audit | Architektur-Docs | Kein formaler Abschluss-Audit laut Doc 06 |

### 07 — Closed Beta Checkliste

| Bereich | Stand | Was fehlt |
|---------|-------|-----------|
| Nutzer-Test (Registrierung … Kündigung) | Funktional größtenteils ✅ | **Formale Checkliste nicht abgearbeitet/dokumentiert** |
| Creator-Test | Funktional größtenteils ✅ | Task-Center/Freischaltung fehlen |
| Monetarisierung E2E | Code ✅ | Live-Stripe-Durchlauf + Dokumentation |
| Performance Mobile/Desktop | TTFB gemessen | Kein abschließender Beta-Performance-Report |
| Abschlussbewertung (Beta bereit?) | Checkpoint-Berichte | **Keine aktuelle Go/No-Go-Bewertung nach Phase 1.4** |

### 08 — Roadmap Sprintplanung

| Sprint | Stand |
|--------|-------|
| Sprint 1 — Kritische Blocker | ~75 % (Passwort fehlt, E2E offen) |
| Sprint 2 — Creator Betrieb | ~25 % (Einzelpanels, kein Task-/Freischaltungscenter) |
| Sprint 3 — Wachstum | ~15 % (Share-Menü, kein Open Graph) |
| Sprint 4 — Erweiterungen | ~5 % (Events ohne Tickets, kein Push/Analytics) |

### Master-PDF Priorität 2–5 (Querschnitt)

| Priorität | Thema | Stand |
|-----------|-------|-------|
| P2 Performance | Siehe Doc 02 | Quick Wins ✅, Rest offen |
| P3 Community Betrieb | Siehe Doc 04 | Basis ✅, Task-Center ❌ |
| P4 Event Ticket v1 | Siehe Doc 05 | **Nicht begonnen** (Events ohne QR/Tickets) |
| P5 Sharing & Open Graph | — | Share-Links ✅, **OG-Previews ❌** (kein `generateMetadata` auf Community-Routen) |

---

## 3. Offen

Punkte aus dem Ordner, die **noch nicht substantiell bearbeitet** wurden.

### Phase 1 — Stabilität (Sprint 1 Rest)

| Punkt | Quelle |
|-------|--------|
| **Passwort vergessen** (`resetPasswordForEmail` + Login-UI) | Master P1, Doc 08 Sprint 1, Doc 07 |
| Stripe Live-E2E (Zahlung, Kündigung, Ablauf, Refund) dokumentiert | Doc 03, 07 |
| Migration 029 in Production anwenden | Phase 1.4 |
| `is_community_member()` — `deleted_at` berücksichtigen | Backlog 1.4 |

### Phase 2 — Verwaltung (Doc 04, 06, Sprint 2)

| Punkt | Quelle |
|-------|--------|
| Creator Task-Center (aggregierte offene Aufgaben) | Doc 04, 08 |
| Freischaltungscenter (WhatsApp / Discord / Telegram) | Doc 04, 08 |
| Member-only Links als Freischaltungs-Flow | Doc 04, 08 |
| Creator Transfer (Community-Übergabe) | Doc 04 |
| Plattform-Admin-Oberfläche (Communities sperren/löschen, Meldungen) | Doc 06 |
| Formaler Datenschutz-/Rechte-Audit | Doc 06 |

### Phase 3 — Wachstum (Master P5, Sprint 3)

| Punkt | Quelle |
|-------|--------|
| Open Graph / Sharing-Previews (WhatsApp, Discord, Telegram, Facebook, LinkedIn) | Master P5, Doc 08 |
| Referral-System fertigstellen | Doc 08 Sprint 3 |
| Community-Wachstum (Sharing-Optimierung über Link-Teilen hinaus) | Doc 08 |

### Phase 4 — Erweiterungen (Doc 05, Sprint 4)

| Punkt | Quelle |
|-------|--------|
| Event-Ticket-System v1 (Buchung, Profil-Ticket, QR) | Doc 05 |
| Check-In (Scan, einmalig, Status „Eingecheckt") | Doc 05 |
| Event-Dashboard-Statistiken (Teilnehmer, Check-In-Rate) | Doc 05 |
| Push-Benachrichtigungen | Doc 08 Sprint 4 |
| Analytics | Doc 08 Sprint 4 |

### Phase 5 — Release (Doc 07)

| Punkt | Quelle |
|-------|--------|
| Closed-Beta-Checkliste vollständig abarbeiten & signieren | Doc 07 |
| Mobile Safari / Android Browser Testprotokoll | Doc 02, 07 |
| Lighthouse CI / Performance-Budget | Doc 02 |
| Go/No-Go für öffentlichen Launch | Doc 07, 08 |

### Performance — nicht angegangen (Doc 02)

- Feed-Virtualisierung  
- Systematische Re-Render-Reduktion  
- Bildoptimierung (`next/image`, Upload-Resize)  
- PWA Offline-Shell  
- Skalierungstests 10 / 100 / 1.000 Communities  

---

## Prioritätenliste

### P0 — Blockiert Beta / Launch

| # | Aufgabe | Quelle | Begründung |
|---|---------|--------|------------|
| 1 | **Migration 029** in Supabase anwenden | 1.4 | Removal-Queue funktioniert ohne DB nicht |
| 2 | **Passwort vergessen** implementieren | Master P1, Doc 07/08 | Login-Recovery fehlt komplett — Beta-Blocker laut Checkliste |
| 3 | **Stripe Live-E2E** (Zahlung → Join → Kündigung → Ablauf) dokumentieren | Doc 03, 07 | Monetarisierung nur code-seitig verifiziert |
| 4 | **`is_community_member()` + `deleted_at`** fixen | 1.4 Backlog | Soft-Deleted behalten ggf. Zugriff über RLS |
| 5 | **Refund → Membership/Subscription** klären & implementieren | Doc 03 | Refund setzt nur Payment-Status, nicht Membership |
| 6 | **Closed-Beta Go/No-Go** nach P0-Fixes | Doc 07 | Formale Bewertung fehlt |

### P1 — Sollte vor Beta erledigt werden

| # | Aufgabe | Quelle |
|---|---------|--------|
| 1 | Creator-Benachrichtigung bei **Zahlungsfehler** | Doc 03 |
| 2 | **Kündigungsübersicht** im Creator-Dashboard (nicht nur Zähler) | Doc 03, 04 |
| 3 | Stripe Webhook **`charge.refunded`** in Production registrieren | Doc 03 |
| 4 | Performance: **`next/image`**, kritische Re-Render/Doppel-Requests | Doc 02 |
| 5 | Mobile-Testprotokoll (Safari + Android) dokumentieren | Doc 02, 07 |
| 6 | Beta-Checkliste Doc 07 ** Punkt für Punkt** abhaken | Doc 07 |

### P2 — Kann nach Beta erfolgen

| # | Aufgabe | Quelle |
|---|---------|--------|
| 1 | Creator **Task-Center** (aggregiert) | Doc 04, Sprint 2 |
| 2 | **Freischaltungscenter** + Member-only Links UI | Doc 04, Sprint 2 |
| 3 | **Open Graph** / Sharing-Previews | Master P5, Sprint 3 |
| 4 | Referral-System **fertigstellen** | Sprint 3 |
| 5 | **Event-Ticket-System v1** (QR, Check-In) | Doc 05, Sprint 4 |
| 6 | Feed-Virtualisierung | Doc 02 |
| 7 | Creator Transfer | Doc 04 |
| 8 | Push-Benachrichtigungen, Analytics | Sprint 4 |
| 9 | Skalierungstests 100/1000 Communities | Doc 02 |
| 10 | Lighthouse CI, PWA Offline-Shell | Doc 02, 05 |
| 11 | Plattform-Admin-UI (Vollumfang Doc 06) | Doc 06 |

---

## Sprint-Dokumente (erledigt vs. offen)

| Dokument | Status |
|----------|--------|
| `docs/sprints/PHASE_1_1_PERFORMANCE.md` | ✅ Erledigt (Quick Wins) |
| `docs/sprints/PHASE_1_2_STRIPE.md` | ✅ Erledigt (Kern; E2E offen) |
| `docs/sprints/PHASE_1_4_CANCELLATION.md` | ✅ Erledigt (Code; Migration/E2E offen) |
| `PHASE_1_3_*` | — Nicht als separates Sprint-Doc (in 1.2/1.4 aufgegangen) |
| `PHASE_1_5_*` | ❌ Noch nicht erstellt |
| `PHASE_2_*` … `PHASE_5_*` | ❌ Noch nicht begonnen |

---

## Empfohlene Reihenfolge (ohne neue Features)

1. Migration 029 anwenden + Removal-Flow manuell testen  
2. Phase 1.5 Passwort vergessen  
3. Stripe E2E + Beta-Checkliste Doc 07  
4. P0-Fix `is_community_member` / Refund-Membership  
5. Erst danach Phase 2 (Task-Center, Freischaltungscenter)

---

## Kurzfassung

| Kategorie | Anteil (geschätzt) |
|-----------|-------------------|
| **Abgeschlossen** | Sprint 1 Kern (~70 %): Performance-Quick-Wins, Stripe-Lifecycle, Removal-Queue |
| **Teilweise** | Performance-Rest, Creator-Dashboard-Erweiterungen, Beta-Checkliste, E2E-Verifikation |
| **Offen** | Passwort vergessen, Task-Center, Freischaltungscenter, Open Graph, Event-Tickets, Release-Audit |

**Für Closed Beta (kostenlose Communities):** Plattform ist weitgehend nutzbar.  
**Für Launch mit Premium:** P0-Punkte (Migration 029, Passwort, Stripe-E2E, RLS-Fix) sind Voraussetzung.
