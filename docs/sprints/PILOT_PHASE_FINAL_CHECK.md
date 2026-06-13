# UNZE — Letzte Pilotphasen-Prüfung

**Datum:** 13. Juni 2026  
**Version:** `0.3.0-beta.1`  
**Production:** https://unze-platform.vercel.app  
**Commit-Basis:** `ab2c7fa` (+ lokale Verifizierungs-/Hero-Fixes)

---

## Gesamturteil

**Die Kernplattform ist pilotbereit.**

Alle sieben Prüfbereiche erfüllen die Pilot-Anforderungen — mit dokumentierten MVP-Grenzen bei Service-Buchung (Mock-Slots, keine Free-Booking-DB) und Plattform-Verifizierung (community-weit, nicht pro Kanal).

| # | Bereich | Ergebnis | Details |
|---|---------|----------|---------|
| 1 | Verifizierungen | ✅ Pilotbereit | Details-Dialog mit Datum; Gewerbe-Typ; Plattform = Community-Verifizierung |
| 2 | Platzhalter-System | ✅ Pilotbereit | Gradient + Netzwerk-Muster überall; keine leeren Cover-Flächen |
| 3 | Landingpage / Home | ✅ Pilotbereit | Hero-Motiv stärker sichtbar (Overlay + Fokus angepasst) |
| 4 | Service-System | ✅ Pilotbereit (MVP) | CRUD + Tests 11/11; Buchung MVP |
| 5 | Rollen & Owner | ✅ Pilotbereit | Owner geschützt; Rollen korrekt getrennt |
| 6 | Stripe | ✅ Pilotbereit | 🟢/🟡/🔴 implementiert; manueller Stripe-Test empfohlen |
| 7 | Performance | ✅ Keine Regression | Build OK; Mobile-first unverändert |

---

## 1. Verifizierungen

### Creator-Verifizierung

| Kriterium | Status |
|-----------|--------|
| Grüner Haken sichtbar | ✅ Creator-Profil, Discover, Feed (statisch auf Karten) |
| Klick zeigt Details | ✅ `VerificationInfoTrigger` auf Creator-Profil |
| Status gespeichert | ✅ `profiles.creator_verification_status`, `verified_creator_at` |
| Datum sichtbar | ✅ Nach Fix: `verifiedAt` aus DB |
| Typ sichtbar | ✅ „Creator verifiziert“ / „Gewerbe verifiziert“ je nach Tier |

**Fix in dieser Prüfung:** `verified_creator_at` + `creator_verification_tier` werden geladen und an den Dialog übergeben.

### Gewerbe-Verifizierung

| Kriterium | Status |
|-----------|--------|
| Antrag & Review | ✅ `CreatorVerificationForm` Tab Gewerbe |
| DB-Speicherung | ✅ `creator_verification_tier: business` |
| Öffentliche Anzeige | ✅ `kind="business"` im Detail-Dialog |

**Hinweis:** Nach Identity-Verifizierung ist kein Gewerbe-Upgrade im Formular möglich (bewusst für Pilot — post-Pilot).

### Plattform-Verifizierung (Discord, Telegram, WhatsApp, YouTube, TikTok, Instagram, Webseite)

| Kriterium | Status |
|-----------|--------|
| Plattform-Grid | ✅ `OfficialPlatformsGrid` — alle 7 + Facebook |
| Grüner Haken auf verbundenen Kanälen | ✅ Bei verifizierter Community |
| Klick → Details | ✅ Im Plattform-Abschnitt: klickbarer Verifizierungs-Pill |
| Einzelspeicherung pro Kanal | ⚠️ **Nein** — Verifizierung ist **community-weit** (`communities.is_verified`) |

**Pilot-Erläuterung:** UNZE verifiziert die Community als Ganzes. Verbundene Kanäle zeigen den Haken als Vertrauenssignal; der Detail-Dialog erklärt die Community-Verifizierung inkl. Datum.

### Verbleibende Nice-to-haves (post-Pilot)

- Statische Haken auf Discover-Karten durch klickbare Trigger ersetzen
- UI zum Pflegen mehrerer `community_platform_links` (derzeit nur Primärplattform im Formular)
- Dokumenten-Ansicht im Owner Center (`/owner?tab=verifications`)

---

## 2. Platzhalter-System

| Entität | Komponente | Ohne Bild |
|---------|------------|-----------|
| Community | `CommunityCoverVisual` | Kategorie-Gradient + `AbstractNetworkPattern` |
| Gruppe | `GroupCoverVisual` | Gradient + Muster + Users-Icon |
| Service | Wie Gruppe (`group_type: service`) | Gleich |
| Event | `CommunityCoverVisual` + `DEFAULT_EVENT_COVER_URL` | Preset oder Gradient |
| Profil | `UserAvatar` | Seed-Gradient + Initialen |

**Ergebnis:** Keine leeren oder grauen Bildflächen auf Cover-/Avatar-Oberflächen.

**Ausnahmen (akzeptabel für Pilot):**

- Lade-Skeletons (`bg-unze-surface-muted`) — kurzzeitig beim Laden
- Dashboard-Antragslisten: grauer User-Kreis statt `UserAvatar` (nicht leer)
- Fehlgeschlagene Post-Bilder: `PostMediaGallery` ohne Fallback (selten)

---

## 3. Landingpage / Home

| Kriterium | Status |
|-----------|--------|
| Hero-Bild sichtbar | ✅ Overlay reduziert (`from-black/80 via-black/20 to-transparent`) |
| Motiv nicht verdeckt | ✅ `object-[center_30%]` — Logo/Hub oben sichtbar |
| Text-Lesbarkeit | ✅ Text nur unten auf dunklem Scrim |
| Mobile | ✅ 220–300 px Höhe, responsive CTAs |
| Desktop | ✅ `max-w-lg` Mobile-first Shell |

**Hinweis:** Hero-PNG enthält eingebettete Value-Props; `HomeValueProps` darunter ist bewusst redundant für Gäste.

---

## 4. Service-System

**Automatisierter Test:** `npm run test:services` — **11/11 OK** (13.06.2026)

| Schritt | Status | Persistenz |
|---------|--------|------------|
| Erstellen | ✅ | DB `community_groups` |
| Bearbeiten | ✅ | DB |
| Anzeigen | ✅ | Community-Tab, Discover, Detail |
| Buchen | ⚠️ MVP | Paid: Stripe + `community_payments`; Free: nur UI |
| Deaktivieren | ✅ | `is_public = false` |
| Löschen | ✅ | Hard Delete |

**Pilot-Grenzen (dokumentiert):**

- Slots sind deterministische Demo-Slots (`lib/service-booking/slots.ts`)
- Keine `service_bookings`-Tabelle
- Kostenlose Buchung ohne DB-Eintrag

---

## 5. Rollen & Owner

| Rolle | Zugriff | Status |
|-------|---------|--------|
| **Owner** (`platform_role: owner`) | `/owner`, Shield in TopBar | ✅ Server-Guard + Actions geschützt |
| **Creator** | Volles Dashboard inkl. Monetarisierung | ✅ |
| **Moderator** | Overview, Mitglieder, Anträge, Moderation | ✅ Kein Gruppen-Manager |
| **Normaler Nutzer** | Kein Dashboard, kein `/owner` | ✅ Redirect `/` bzw. Login |

**Getestet im Code:**

- `requirePlatformOwner()` in Layout + Page + Actions
- `getDashboardCommunityAccess()` — nur Manager-Rollen
- DB-Trigger gegen Self-Escalation zu `owner`

---

## 6. Stripe — Mitgliedschaftsstatus

| Anzeige | Stripe-Status | Creator-UI |
|---------|---------------|------------|
| 🟢 Aktiv | `active`, `trialing` | Abonnenten-Tabelle + Badge |
| 🟡 Zahlung ausstehend | `past_due`, `unpaid` | Panel „Offene Zahlungen“ + Dashboard-Kachel |
| 🔴 Beendet | `canceled`, `inactive` | Badge + Membership-Sync entfernt Mitglied |

**Webhook:** `invoice.payment_failed` speichert fehlgeschlagene Zahlung + Status-Sync.

**Empfohlener manueller Test vor Live-Zahlungen:**

1. Testkarte `4242…` → 🟢 in Monetarisierung
2. Decline-Karte → 🟡 in `#payment-issues`
3. Portal-Kündigung → Kündigung zum Periodenende, danach 🔴

Dokumentation: `docs/sprints/STRIPE_MEMBERSHIP_STATUS.md`

---

## 7. Performance — Mobile-Abschlusstest

| Route | First Load JS (Build) | Bewertung |
|-------|----------------------|-----------|
| `/` (Home) | ~124 kB | ✅ |
| `/discover` | ~126 kB | ✅ |
| `/community/[slug]` | ~147 kB | ✅ |
| Gruppen/Services Detail | ~128 kB | ✅ |
| Events Detail | ~124 kB | ✅ |
| Dashboard Overview | ~106 kB | ✅ |

**Build:** `npm run typecheck` + `npm run build` — erfolgreich.  
**Keine Bundle-Regression** gegenüber vorherigen Sprint-Builds.

**Manuell auf Gerät prüfen:** Scroll-Performance auf Community-Seite (größtes Bundle) — erwartet flüssig durch Lazy-Panels.

---

## Pilot-Go Checkliste

- [x] Verifizierungen: Haken + klickbare Details (Creator, Community, Plattform-Abschnitt)
- [x] Platzhalter: keine leeren Cover auf Kernseiten
- [x] Home: Hero optimiert
- [x] Services: CRUD getestet (11/11)
- [x] Rollen: Owner/Creator/Moderator/User getrennt
- [x] Stripe: Drei Status implementiert
- [x] Performance: Build ohne Regression

---

## Empfohlene Aktionen vor Pilotstart

1. Lokale Fixes committen + deployen (Verifizierungs-Datum, Hero)
2. Einmaliger Stripe-Testlauf im Testmodus (3 Status)
3. Demo-Community mit verifiziertem Creator + Community für Showcase
4. Pilot-Nutzern MVP-Grenzen bei Service-Buchung kommunizieren

---

## Referenzen

- `docs/sprints/PILOT_PHASE_READINESS.md`
- `docs/sprints/SERVICE_E2E_REPORT.md`
- `docs/sprints/STRIPE_MEMBERSHIP_STATUS.md`
- `docs/sprints/OWNER_CENTER.md`
