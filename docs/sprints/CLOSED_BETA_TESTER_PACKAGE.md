# UNZE Closed Beta — Tester-Paket

**Version:** `0.3.0-beta.1`  
**Release-Tag:** `v0.3.0-beta.1`  
**Datum:** 2026-06-13  
**Zielgruppe:** 5–10 Closed-Beta-Tester

---

## Zugang

| | |
|---|---|
| **URL** | https://unze-platform.vercel.app |
| **Registrierung** | E-Mail + Passwort unter `/auth/signup` |
| **Passwort vergessen** | `/auth/forgot-password` |
| **Feedback** | _(Kanal vom Team eintragen — z. B. Discord, E-Mail, Notion-Formular)_ |

---

## Was ihr testen sollt

### 1. Onboarding (alle Tester)

- [ ] Account anlegen und E-Mail bestätigen
- [ ] Profil bearbeiten (`/profile`)
- [ ] Passwort-Reset durchspielen (optional, zweiter Account)
- [ ] Discover durchstöbern (`/discover`, Tab Events)

### 2. Community (Free)

- [ ] Community finden (z. B. **Rocket League SSL**)
- [ ] Beitritt / Feed lesen
- [ ] Gruppe beitreten (falls vorhanden)

### 3. Events & Tickets

- [ ] Event auf Discover oder in Community finden
- [ ] Ticket buchen (Button am Event)
- [ ] Ticket unter **Profil → Meine Tickets** (`/profile/tickets`) mit QR-Code
- [ ] _(Creator-Tester)_ Check-In im Dashboard unter Community → Events

### 4. Premium / Stripe _(optional, Testmodus)_

Stripe läuft im **Testmodus** — echte Zahlungen werden nicht abgebucht.

| Testkarte | Ergebnis |
|-----------|----------|
| `4242 4242 4242 4242` | Erfolgreiche Zahlung |
| Beliebiger CVV, Zukunft als Ablauf | — |

Schritte:

- [ ] Premium-Community beitreten / Abo abschließen
- [ ] Abo unter `/profile/billing` sichtbar
- [ ] Kündigung über Stripe Customer Portal
- [ ] Zugang bis Periodenende, danach Entfernung aus Community

### 5. PWA — Installation auf echtem Gerät

**iPhone (Safari):**

1. https://unze-platform.vercel.app öffnen
2. Teilen → **Zum Home-Bildschirm**
3. App-Icon starten → Vollbild ohne Browser-Leiste
4. Offline: einmal laden, dann Flugmodus → Startseite sollte aus Cache kommen

**Android (Chrome):**

1. URL öffnen
2. Menü → **App installieren** / **Zum Startbildschirm**
3. App starten, Navigation testen
4. Optional: Chrome DevTools → Application → Service Worker prüfen

**Checkliste PWA:**

- [ ] Install-Prompt oder manuelle Installation möglich
- [ ] Icon und Name „UNZE" korrekt
- [ ] Seitenwechsel flüssig (Prefetch aktiv)
- [ ] Nach Reload weiterhin erreichbar

### 6. Creator-Dashboard _(1–2 Tester mit Creator-Rolle)_

- [ ] `/dashboard` — Übersicht
- [ ] Community verwalten, Event anlegen
- [ ] Monetarisierung: Preise setzen (Stripe Connect)
- [ ] „Zu entfernen"-Panel bei gekündigten Abos

---

## Bekannte Einschränkungen (Closed Beta)

| Bereich | Status |
|---------|--------|
| Premium-Zahlungen | Stripe **Testmodus** — kein Live-Geld |
| Erste Live-Zahlung | Noch nicht in DB — manueller Checkout empfohlen |
| Event-Tickets | V1 — Buchung, QR, Check-In; kein PDF-Export |
| Mobile | Playwright-Emulation OK; physische Geräte bitte melden |
| Feature-Freeze | **Keine neuen Features** bis Feedback-Runde 1 |

---

## Demo-Daten (falls vorhanden)

| Ressource | Hinweis |
|-----------|---------|
| Community | `/community/rocket-league-ssl` |
| Creator-Profil | `/creator/edudemo` (wenn Demo-Seed aktiv) |

---

## Feedback-Fragen

Bitte notiert:

1. Was war beim **ersten Besuch** unklar?
2. Wo habt ihr **Fehler** oder langsame Ladezeiten gesehen?
3. Hat **PWA-Installation** auf eurem Gerät funktioniert?
4. Würdet ihr eine **Premium-Community** in Testmodus abschließen?
5. Fehlt euch etwas **Kritisches** für den Alltag?

---

## Technischer Stand (für Team)

| Check | Ergebnis |
|-------|----------|
| Production Build | ✅ |
| Migrationen 021–031 | ✅ |
| `npm run test:monetization` (Prod) | ✅ 12 OK, 1 Teilweise (keine Zahlung in DB) |
| `npm run test:event-tickets` | ✅ Buchung, Check-In, Mehrfachnutzung blockiert |
| Discover Events TTFB (warm) | ~209 ms |
| Git Tag | `v0.3.0-beta.1` |

**Manuell noch durch Tester:** Stripe Checkout mit Testkarte, PWA auf physischem iPhone/Android, QR-Scan am Event.

---

## Nächste Schritte (Team)

1. Tester einladen (5–10 Personen)
2. Feedback-Kanal befüllen und Link an Tester senden
3. **Keine neuen Features** bis Rückmeldungen ausgewertet
4. Nach erster Feedback-Runde: Prioritäten für Beta.2
