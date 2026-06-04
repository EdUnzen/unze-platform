# UNZE — Test- & Stabilisierungsphase (Juni 2026)

**Ziel:** Stabilität, Vollständigkeit, Designtreue — **keine neuen Kernsysteme.**  
**Referenz:** `01_Designsystem/` (Screens 13–25 u. a.)  
**Demo-Daten:** erhalten (`npm run seed:demo`, Mocks in `demo-data.ts` — nichts gelöscht)

**Geprüft am:** 2026-06-04  
**Lokal:** http://localhost:3002  
**Supabase:** `zzbjvcwmdrnuzzlepfja`  
**Automatisiert:** `npm run test:e2e-urls`, `npm run check:supabase`, `npm run check:migrations`, `npm run test:stabilization`, `npm run verify:demo`, `npm run migrate:demo`, `npm run build`

---

## Kurzfazit

| Kategorie | Anzahl | Blockiert Release? |
|-----------|--------|-------------------|
| **KRITISCH** | 1 | Ja (OAuth-Setup in Supabase) |
| **MITTEL** | 14 | Teilweise (UX/Design-Lücken) |
| **NIEDRIG** | 11 | Nein (Feinschliff/Performance) |

**Routen (Smoke):** 9/9 HTTP 200 lokal (`test:e2e-urls`).  
**Build:** `npm run build` erfolgreich.  
**Migrationen 021–025:** aktiv. **Migration 026** (Creator-Mitgliedschaft RLS): `npm run db:migrate:026`.

---

## Testmatrix nach Bereich

| Bereich | Route | Route OK | Darstellung | UX / Verknüpfung | Designsystem |
|---------|-------|----------|-------------|------------------|--------------|
| Home | `/` | ✓ | ✓ | ✓ | Tabs/Feed ok; kein Screen-22-Suchleiste |
| Discover | `/discover` | ✓ | ✓ | ✓ | Kategorien-Filter da; keine globale Suche/Swipe-Cards |
| Discover Gruppen/Events/Services | `?tab=` | ✓ | ✓ | ✓ | Events aus DB + Demo-Fallback |
| Community Overview | `/community/rocket-league-ssl` | ✓ | ✓ | ✓ | Level, Fokus, Plattformen, Tabs |
| Community Gruppen | `?tab=groups` | ✓ | ✓ | ✓ | Karten → Gruppenseite |
| Community Services | `?tab=services` | ✓ | ✓ | ✓ | → Service-Detail + Buchung |
| Community Events | `?tab=events` | ✓ | ✓ | ✓ | → Event-Detail |
| Community Feed | `?tab=feed` | ✓ | ✓ | ✓ | Nur erlaubte Post-Typen |
| Community Mitglieder | `?tab=members` | ✓ | ✓ (Mock) | ✓ | Showcase aus Demo; **DB role_title fehlt ohne 025** |
| Gruppe | `/community/…/group/…` | ✓ | ✓ | ✓ | Demo-Fallback für Services |
| Service + Buchung | `…/group/einzelcoaching` | ✓ | ✓ | ◐ | Slots + Stripe; **kein Mockup-14-Info-Grid** |
| Event-Detail | `…/event/demo-ev-rl-1` | ✓ | ✓ | ✓ | Follow, externer Link |
| Login E-Mail | `/auth/login` | ✓ | ✓ | ✓ | Tab Anmelden/Registrieren |
| Google / Apple Login | OAuth-Buttons | ◐ | ✓ UI | ◐ | **Supabase Provider + Redirect nötig** |
| Mobile Navigation | Bottom-Nav | ✓ | ✓ | ✓ | Home, Discover, +, Favoriten, Profil |
| Community Level | Badge/Panel | ✓ | ✓ (Mock) | ✓ | Berechnung ok; **Persistenz DB ohne 025** |
| Community Fokus | Chips | ✓ | ✓ (Mock) | ✓ | **DB-Spalte focus_tags ohne 025** |
| Rollen/Titel | Mitglieder-Tab | ✓ | ✓ (Mock) | ✓ | **role_title in DB ohne 025** |
| VIP/Experten | Showcase-Sektionen | ✓ | ✓ (Mock) | ✓ | Kein öffentliches Expertenprofil (Screen 13) |
| Monetarisierung | Stripe Checkout | ◐ | ✓ UI | ◐ | Schema 024 ok; Keys/E2E manuell |
| Favoriten / Profil | `/favorites`, `/profile` | ✓ | ✓ | ✓ | — |
| Dashboard Creator | `/dashboard` | ✓ | ✓ | ✓ | — |

Legende: ✓ erfüllt · ◐ teilweise / Setup nötig · ✗ fehlt/fehlerhaft

---

## KRITISCH

Funktionen, die ohne Fix blockieren oder nur über Mocks laufen.

### K1 — ~~Migration 025~~ ✓ erledigt (2026-06-04)

Spalten `focus_tags`, `community_level`, `level_score`, `show_member_area`, `role_title` in Supabase aktiv. `npm run migrate:demo` erfolgreich.

### K1b — Community erstellen: Creator-Mitgliedschaft (Migration 026)

**Ursache:** Nach `communities`-Insert fehlte `community_members` mit Rolle `creator`; RLS erlaubte nur `member`/`verified_member` → Redirect auf Dashboard-Access scheiterte.

**Fix (App + DB):**

- `insertCreatorMembershipInDb` + Admin-Fallback in `community.repository.ts`
- RLS-Policy `community_members_insert_creator` → `npm run db:migrate:026`
- Dashboard-Fallback: `creator_id === userId` ohne Member-Zeile
- Mobil: `CommaSeparatedInput` für Fokus/Tags (kein Komma-Stripping beim Tippen)

---

### K2 — Google- / Apple-Login: Supabase-Provider-Konfiguration

**Code:** vorhanden (`OAuthProviderButtons`, `signInWithOAuthAction`).  
**UI:** Buttons auf `/auth/login`.  
**Blocker:** Ohne Aktivierung in Supabase + Redirect-URLs schlägt OAuth fehl (nicht testbar bis Setup).

**Fix:**

- Supabase → Authentication → Providers → Google + Apple aktivieren.
- Redirect: `http://localhost:3002/auth/callback`, Produktions-URL analog.
- Site URL: `NEXT_PUBLIC_APP_URL` (z. B. `http://localhost:3002`).

**Kein App-Code-Blocker**, aber **kritischer Testbereich** aus deiner Liste.

---

## MITTEL

Darstellung, UX, Designtreue, unvollständige Verknüpfungen — App nutzbar, aber nicht mockup-vollständig.

### M1 — Login vs. Referenz Screen 23

| Mockup | Ist-Zustand |
|--------|-------------|
| „Angemeldet bleiben“ | fehlt |
| „Passwort vergessen?“ | fehlt |
| Discord OAuth | fehlt (nur Google + Apple) |
| Branding „CONNECT. BUILD. GROW.“ | Tagline nur teilweise (`showTagline` auf Login) |

### M2 — Service-Buchung vs. Screen 14

| Mockup | Ist-Zustand |
|--------|-------------|
| Info-Grid (Dauer, Plattform, Sprache, Verfügbarkeit) | nur Preis + Slot-Grid |
| Horizontales Datums-Picker-UI | Slot-Buttons (funktional) |
| „Sichere Bezahlung mit Stripe“-Hinweis | nicht prominent |

Funktion: Slots + kostenlos/Stripe — **OK**. Designtreue **teilweise**.

### M3 — Öffentliches VIP-/Experten-Profil (Screen 13)

Keine Route `/expert/…` oder dediziertes Expertenprofil mit Stats-Leiste, Expertise-Tags, aktiven Gruppen/Services wie im Mockup. Mitglieder nur im Community-Tab (Showcase-Liste).

### M4 — Community-Beitritt Premium (Screen 15)

Join-Panel vorhanden; **kein** Abo-Tier-Vergleich (Kostenlos vs. Premium 9,99 €) + gespeicherte Zahlungsmethode wie im Mockup. Stripe-Abo über separates Panel.

### M5 — Discover vs. Screen 22

| Mockup | Ist-Zustand |
|--------|-------------|
| Globale Suchleiste oben | nur Tab-Filter + Kategorie-Chips |
| Horizontales Swipe empfohlener Communities | vertikale/list Cards |
| „Beliebte Gruppen“-Sektion | Discover-Tabs, anderer Aufbau |

### M6 — Verifizierung Screen 24

Route `/verify/creator` existiert; **kein** mehrstufiger Stepper „Typ wählen → Infos → Prüfung → Ergebnis“ wie Mockup.

### M7 — Community erstellen vs. Screen 25

`/community/create` / Form vorhanden; Mockup zeigt ausführlicheres Wizard-Layout (Symbol-Upload, 16:9-Cover, Toggle „Besondere Mitglieder“, Level-Hinweis-Box) — **teilweise** abgedeckt, nicht 1:1.

### M8 — Monetarisierung E2E

- Migration **024** aktiv.
- `npm run check:stripe`: oft Keys fehlen lokal → Checkout nicht End-to-End verifiziert.
- Webhook/Portal: manuell in Stripe Dashboard.

### M9 — Community-Level-Persistenz

Level wird berechnet und angezeigt; **Schreiben in DB** schlägt still fehl ohne Migration 025 (abhängig von K1).

### M10 — Dev-Server: sporadische 500er nach Cache-Korruption

Bei warmem Dev-Server traten `__webpack_modules__[moduleId] is not a function` auf Community-Tabs auf.  
**`npm run build` erfolgreich** → Produktionscode OK.  
**Empfehlung:** `.next` löschen, `npm run dev` neu starten.

### M11 — Vercel `.env.vercel` mit leeren Keys

Datei im Repo enthält `NEXT_PUBLIC_SUPABASE_ANON_KEY=""` — nur CLI-Export, **nicht** von Next geladen; kann bei manueller Nutzung verwirren. Nicht löschen ohne Absprache (kein DB-Impact).

### M12 — Dokumentation / Bundles veraltet

- `BUNDLE_all_migrations.sql` endet bei ~014 (ohne 015–025).
- `BUNDLE_021_024.sql` ohne 025.
- Stabilization-Report „Nächste Schritte“ teils veraltet (021–024 bereits OK).

### M13 — OAuth-Fehlerfeedback

`signInWithOAuthAction` liefert Fehler an Client; UI zeigt Fehler bei OAuth nicht immer sichtbar (nur E-Mail-Formular-Fehlerbereich).

### M14 — Event-Follow auf Discover

Funktioniert; Demo-Events nur wenn DB leer + Demo-Slug (Fallback) — nach Seed aus DB ok.

---

## NIEDRIG

Feinschliff, Performance, optionale Optimierungen.

### N1 — Performance (bereits verbessert, Rest offen)

| Thema | Status |
|-------|--------|
| Community-Tab-Laden (nur nötige Queries) | umgesetzt |
| Event-Follow scoped | umgesetzt |
| `getGroupBySlugs` Demo-Fallback | umgesetzt |
| Anon-Key JWT + `sb_publishable_` | umgesetzt |
| `dynamic()` für FeedPostList | offen |
| `loading.tsx` pro Route | offen |
| Feed-Virtualisierung (>50 Posts) | offen |
| Discover Migration-Banner cachen | offen |

Shared First Load JS: **~103 kB** (Build) — akzeptabel.

### N2 — Bilder / Icons

- Cover: `lazy`/`eager` nach Kontext — umgesetzt.
- `next/image` für Banner: noch `<img>` in Visuals.
- Build listet `icon.png` als 0 B — prüfen, ob `app/icon.png` korrekt eingebunden.

### N3 — Design-Feinschliff

- Einheitliche Section-Header auf allen Community-Tabs (teilweise umgesetzt).
- Swipe-Geste auf Discover-Cards (Architektur-Vorgabe, noch nicht überall).
- Discord als Plattform-Link ja, nicht als Login-Provider.

### N4 — Expertenprofil: keine öffentlichen Follower-Zähler

Spec-konform (Architektur verbietet öffentliche Reichweite); Mockup Screen 13 zeigt Follower — **Spec hat Vorrang**.

### N5 — `test:stabilization` testet Production-URL default

Lokal `E2E_BASE_URL=http://localhost:3002` setzen für lokale Matrix.

### N6 — Horizontal scroll Discover-Cards

`CommunityGroupCard` hat `compact` Modus; nicht überall aktiv.

### N7 — ReportDialog / Melden (Screen 16)

`ReportDialog` vorhanden; kein dedizierter „Meldung“-Flow wie Mockup-16-Layout.

### N8 — Analytics-Dashboard (Screen 20)

Creator-Dashboard hat Bereiche; kein vollständiges Analytics-Mockup.

### N9 — Benachrichtigungen (Screen 21)

`/notifications` Route ok; Inhalt abhängig von DB-Events.

### N10 — Qualitätsstandards / Zugriffslevel (Screens 17–19)

Teilweise in Dashboard-Settings; nicht als öffentliche Screens.

### N11 — SQL Editor „Untitled query“

Wenn Inhalt = `BUNDLE_021_024`: bereits ausgeführt, Editor-Snippet löschbar. Wenn 025: noch ausführen (siehe K1).

---

## Performance-Übersicht (messbar / beobachtet)

| Route | Beobachtung |
|-------|-------------|
| `/discover?tab=feed` | Tab-aware, keine 50 Communities mehr |
| `/community/[slug]?tab=feed` | nur Feed-Posts laden |
| `/community/[slug]?tab=members` | nur Showcase-Members |
| Community-Detail ohne Engagement-N+1 | umgesetzt |
| Supabase REST | `check:supabase` alle Tabellen OK |

**Empfohlene Messung:**

```bash
curl.exe -s -o NUL -w "TTFB: %{time_starttransfer}s\n" http://localhost:3002/community/rocket-league-ssl
```

---

## Demo-Daten — Status

| Check | Ergebnis |
|-------|----------|
| `npm run verify:demo` | ✓ 3 Communities, Posts, Demo-User |
| Demo-Slugs in Code | erhalten |
| `UNZE_DEMO_FORCE_RESET` | nicht verwendet (kein Löschen) |
| Mocks bei fehlender DB | aktiv (`demo-data.ts`) |

---

## Empfohlene Reihenfolge (Stabilisierung, kein Feature-Bau)

1. **K1:** Migration 025 ausführen → `migrate:demo` → `verify:demo`
2. **K2:** Supabase OAuth (Google/Apple) + Redirect testen
3. **M10:** Dev-Cache bereinigen bei 500ern
4. **M8:** Stripe Test-Checkout einmal durchspielen (`check:stripe`)
5. Manuell: Screens 13–25 gegen laufende App (Mobile Viewport 390px)
6. Entscheidung: welche **MITTEL**-Punkte nächster Block (nur Vervollständigung, keine neuen Systeme)

---

## Automatisierung

```bash
npm run test:e2e-urls          # Routen
npm run check:supabase         # DB + REST
npm run check:migrations       # 021–024
npm run migrate:demo           # nach 025
npm run test:stabilization     # Report unter docs/sprints/
npm run diagnose:anon-key      # Env-Key-Format
npm run build                  # Produktions-Build
```

---

## Offen für gemeinsame Entscheidung

Nach Abschluss von **K1 + K2** ist die Plattform **testbar und stabil** für den definierten Kern.  
**MITTEL**-Punkte sind überwiegend **Designtreue und Vervollständigung** bestehender Screens — kein neues Kernsystem.

_Vollständiger automatisierter Scan: `docs/sprints/STABILIZATION_STATUS_REPORT.md`_
