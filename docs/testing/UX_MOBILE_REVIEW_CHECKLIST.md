# UNZE  Mobile UX-Review-Checkliste

Stand: Juni 2026 · **10 Kern-Screens** · vor Pilot / nach größeren UI-Änderungen

## Vorbereitung

| Feld | Wert |
|------|------|
| Tester | |
| Datum | |
| Gerät(e) | z. B. iPhone 14, Pixel 7 |
| Browser | Safari / Chrome |
| PWA installiert? | ja / nein |
| Account | Gast / Member / Creator |
| Build | Production / Preview / Local |

**Regel:** Jeder Screen mindestens auf **einem iPhone (Safari)** und **einem Android (Chrome)** prüfen. Touch-Ziele ? 44px, Safe-Area unten beachten.

**Legende:** ? OK · ?? Kleinere Probleme · ? Blocker

---

## 1. Start / Home (Gast)

**Route:** `/` (ausgeloggt)

| # | Prüfpunkt | iOS | Android | Notiz |
|---|-----------|-----|---------|-------|
| 1.1 | Hero-Motiv sichtbar, Text im unteren Bereich lesbar | | | |
| 1.2 | CTAs Anmelden / Registrieren ? 48px, gut erreichbar | | | |
| 1.3 | Kein abgeschnittener Inhalt unter Bottom-Nav | | | |
| 1.4 | Scroll flüssig, kein horizontales Overflow | | | |
| 1.5 | Demo-Communities klar als Demo erkennbar (falls sichtbar) | | | |

---

## 2. Discover

**Route:** `/discover`

| # | Prüfpunkt | iOS | Android | Notiz |
|---|-----------|-----|---------|-------|
| 2.1 | Tabs / Filter bedienbar mit Daumen | | | |
| 2.2 | Community-Karte: Plattform sofort erkennbar | | | |
| 2.3 | Swipe / Scroll ohne Ruckeln | | | |
| 2.4 | Share öffnet Bottom-Sheet (Mobile), nicht abgeschnitten | | | |
| 2.5 | Leerer Zustand verständlich (Filter / keine Treffer) | | | |

---

## 3. Community-Detail

**Route:** `/community/[slug]` (eine Demo + eine echte Community)

| # | Prüfpunkt | iOS | Android | Notiz |
|---|-----------|-----|---------|-------|
| 3.1 | Banner, Name, Beschreibung ohne Layout-Bruch | | | |
| 3.2 | Plattform-Icons / externe Links erkennbar | | | |
| 3.3 | Beitritt / Bewerbung / Premium-Flow startet klar | | | |
| 3.4 | Feed lädt; Post-Typen unterscheidbar | | | |
| 3.5 | Zurück-Navigation ohne Dead-End | | | |

---

## 4. Login / Registrierung

**Route:** `/auth/login`

| # | Prüfpunkt | iOS | Android | Notiz |
|---|-----------|-----|---------|-------|
| 4.1 | Logo und Formular zentriert, keine Tastatur-Überlagerung kritisch | | | |
| 4.2 | Fehlermeldungen verständlich (falsches Passwort, etc.) | | | |
| 4.3 | OAuth-Buttons sichtbar und klickbar | | | |
| 4.4 | Passwort vergessen / Reset erreichbar | | | |
| 4.5 | Nach Login: Redirect zum `next`-Parameter funktioniert | | | |

---

## 5. Profil-Hub

**Route:** `/profile`

| # | Prüfpunkt | iOS | Android | Notiz |
|---|-----------|-----|---------|-------|
| 5.1 | Avatar groß genug, Cover proportional | | | |
| 5.2 | Statistik-Grid lesbar (Mitglied seit, Communities, Events) | | | |
| 5.3 | Hub-Kacheln (Profil, Tickets, UNZE-ID, Abos) ? 88px, Chevron/Feedback | | | |
| 5.4 | Benachrichtigungs-Badge korrekt | | | |
| 5.5 | Abmelden erreichbar und bestätigt sich sinnvoll | | | |

---

## 6. UNZE-ID

**Route:** `/profile/id`

| # | Prüfpunkt | iOS | Android | Notiz |
|---|-----------|-----|---------|-------|
| 6.1 | QR-Code lädt vollständig (kein dauerhaftes QR ) | | | |
| 6.2 | So funktioniert's in 3 Schritten verständlich | | | |
| 6.3 | Unterschied UNZE-ID vs. Event-Ticket klar | | | |
| 6.4 | Kopieren-Button funktioniert | | | |
| 6.5 | Zurück zum Profil ohne Navigations-Loop | | | |

---

## 7. Event-Tickets

**Route:** `/profile/tickets`

| # | Prüfpunkt | iOS | Android | Notiz |
|---|-----------|-----|---------|-------|
| 7.1 | Ticket-QR unterscheidbar von UNZE-ID (Kontext / Label) | | | |
| 7.2 | Leerer Zustand mit CTA Events entdecken | | | |
| 7.3 | Event-Infos (Datum, Ort) lesbar | | | |
| 7.4 | Stornieren / Status-Anzeige verständlich | | | |

---

## 8. Erstellen (+)

**Route:** Bottom-Nav Erstellen ? Community / Beitrag / Event

| # | Prüfpunkt | iOS | Android | Notiz |
|---|-----------|-----|---------|-------|
| 8.1 | Plus-Button öffnet Menü / Flow zuverlässig | | | |
| 8.2 | Formulare auf kleinem Screen bedienbar | | | |
| 8.3 | Pflichtfelder und Validierung klar | | | |
| 8.4 | Erfolg / Fehler-Feedback sichtbar | | | |
| 8.5 | Nach Erstellung sinnvoller Redirect | | | |

---

## 9. Creator-Dashboard

**Route:** `/dashboard/community/[slug]` (Creator-Account)

| # | Prüfpunkt | iOS | Android | Notiz |
|---|-----------|-----|---------|-------|
| 9.1 | 6 Hauptkategorien als Grid  eine Ebene sichtbar | | | |
| 9.2 | Klick auf Kategorie ? Unterkarten erscheinen | | | |
| 9.3 | Unterkarten ? 56px, aktiver Zustand erkennbar | | | |
| 9.4 | Rollen-Badges in Mitgliederliste lesbar | | | |
| 9.5 | Keine doppelte / verwirrende Navigation | | | |

---

## 10. PWA & System

**Kontext:** Installierter Homescreen oder Zum Home-Bildschirm

| # | Prüfpunkt | iOS | Android | Notiz |
|---|-----------|-----|---------|-------|
| 10.1 | App-Icon und Splash wirken korrekt | | | |
| 10.2 | Safe-Area unten (Notch / Home-Indicator) | | | |
| 10.3 | Bottom-Nav fixiert, Inhalt nicht verdeckt | | | |
| 10.4 | Offline / langsames Netz: sinnvolle Meldung, kein White Screen | | | |
| 10.5 | Deep-Link (z. B. `/community/`) öffnet in PWA | | | |

---

## Querschnitt (alle Screens)

| Thema | OK? | Notiz |
|-------|-----|-------|
| Einheitliche Fehlermeldungen (kein rohes JSON) | | |
| Grün `#1DB872` konsistent, keine lila Hauptfarbe | | |
| Touch-Feedback (`active:scale`) spürbar | | |
| Fokus / Screenreader: kritische Buttons benannt | | |
| Keine horizontalen Scroll-Bugs | | |

---

## Abschluss

**Blocker (?):**

**Wichtige Fixes (??):**

**Freigabe-Empfehlung:** Pilot ja / nein / mit Vorbehalt

**Nächste Schritte:**

---

## Referenzen

- Design-System: `.cursor/rules/unze-design-system-v1.mdc`
- Pilot-UX-Runde: `docs/testing/UX_PILOT_FINAL_ROUND.md`
- PWA / Automatisierung: `docs/testing/AUTOMATED_VALIDATION_AND_PWA_INSTALL_SYSTEM.md`
- UNZE-ID Architektur: `architecture/modules/UNZE_ID_SYSTEM.md`
