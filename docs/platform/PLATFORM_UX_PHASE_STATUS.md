# Bereich B � Plattform: Status & Empfehlungen

Stand: Juni 2026  
Live: https://www.unzeconnect.app  
Architektur: getrennt von Marketing (`www.unze.app`)

---

## Erledigt (Codebase vorhanden & funktional)

| Bereich | Status | Hinweise |
|---------|--------|----------|
| Login / Registrierung | ? | `/auth/login`, `/auth/signup`, Passwort-Reset |
| Dashboard | ? | Creator-Hub, Community-�bersicht |
| Discover | ? | `/discover` � Communities, Events |
| Communities | ? | Beitritt, Premium, Gruppen, Posts |
| Gruppen | ? | Community-Gruppen mit Slugs |
| Events | ? | Erstellung, Tickets, Check-in-Credentials |
| Services | ? | Buchbare Services in Communities |
| Bewertungen | ? | Reviews auf Communities |
| Community-Badges / Bewertung | ? | Nur echte Connect-Daten auf Marketing (UNZE-007; kein Marketing-Score) |
| Rollen | ? | Creator, Moderator, Admin � Dashboard-Rollen |
| Creator | ? | Dashboard, Verifizierung, Monetarisierung |
| Moderatoren | ? | Moderation, Mitglieder, Rollen |
| Administratoren | ? | Community-Settings, Audit |
| Auszeichnungen | ? | Vergeben, Profil-Ansicht, Collections |
| Zertifikate | ? | Credentials-System, Requirement Engine |
| QR / UNZE-ID | ? | `/profile/id`, Scanner im Dashboard |
| Crowd Partner | ? | `/dashboard/crowd-partner`, Referral-Panel |
| Stripe | ? | Monetarisierung, Billing-Profil |
| Benachrichtigungen | ? | `/notifications` |
| Profile | ? | Hub, Auszeichnungen, Tickets, Settings |
| Einstellungen | ? | `/profile/settings` |
| Requirement Engine | ? | Migration 036 � Credential-Gates f�r Zugang |

---

## Offen / L�cken

| Priorit�t | Bereich | Gap |
|-----------|---------|-----|
| **Hoch** | Profil-Sichtbarkeit Auszeichnungen | Nutzer kann Sichtbarkeit noch nicht pro Auszeichnung steuern � Konzept in `AWARD_VISIBILITY_PERMISSIONS.md`, Schema fehlt |
| **Hoch** | Profil UX | Toggle UI f�r �ffentliche Auszeichnungen |
| **Hoch** | Manuelle E2E-Regression | Vollst�ndiger Durchlauf aller Bereiche in Production mit Test-Accounts |
| Mittel | Community-Badge �Stark wachsend" | Heuristik in Backend + Anzeige Plattform |
| Mittel | Rollen-Pflichtsichtbarkeit | `visibility_locked` bei Moderator/Coach noch nicht implementiert |
| Mittel | Discover UX | Feinschliff Filter, Ladezust�nde, Mobile |
| Mittel | Benachrichtigungen | Push/PWA-Integration pr�fen |
| Niedrig | Profil-Datenexport | DSGVO-Export f�r Auszeichnungen |
| Niedrig | Studio MVP | Nur Inquiry-Liste � kein Projektmanagement |

---

## Berechtigungskonzept Auszeichnungen

Siehe: [`docs/platform/AWARD_VISIBILITY_PERMISSIONS.md`](./AWARD_VISIBILITY_PERMISSIONS.md)

Kernregeln:
- Auszeichnungen geh�ren dem Nutzer
- Nutzer w�hlt �ffentliche Sichtbarkeit (Default: privat � **noch umzusetzen**)
- �ffentliche Rollen (Creator, Moderator, Coach) ? rollenrelevante Qualifikationen verpflichtend sichtbar
- Zugangsvoraussetzungen pr�fen **Besitz**, nicht **Profil-Sichtbarkeit**

---

## Test-Checkliste (manuell)

```
[ ] Login / Logout / Session-Refresh
[ ] Registrierung + E-Mail-Verifizierung
[ ] Community beitreten (�ffentlich / Premium / mit Credential-Gate)
[ ] Gruppe �ffnen + Beitritt mit Voraussetzung
[ ] Event erstellen + Ticket kaufen (Stripe Test)
[ ] Service buchen
[ ] Bewertung abgeben
[ ] Auszeichnung vergeben + im Profil sichtbar
[ ] UNZE-ID QR scannen (Scanner)
[ ] Crowd Partner Link teilen
[ ] Benachrichtigung empfangen
[ ] Creator-Dashboard Statistiken
[ ] Moderator: Mitglied entfernen / Rolle �ndern
[ ] Admin: Community-Settings speichern
```

Automatisierung vorhanden:
```bash
npm run test:beta-e2e      # Route-Smoke
npm run test:phase0-smoke  # UNZE-ID, Credentials
```

---

## Performance

- Landing und Plattform getrennte Shells (`SiteShell`, `middleware`)
- Marketing l�dt keine Auth-/Dashboard-Bundles
- Plattform: bestehende Caches (`discover-events-cache`, `data-cache`) unver�ndert
- **Keine Performance-Regression** durch Landing-�nderungen (separate Routes/Domains)

---

## Empfehlungen (Priorisierung)

### Sprint 1 � Profil & Vertrauen
1. Migration: `user_credentials.is_public`, `visibility_locked`
2. UI: Sichtbarkeits-Toggle auf `/profile/auszeichnungen`
3. Public Profile filtert nach Sichtbarkeit

### Sprint 2 � Qualit�tssicherung
4. Production E2E mit Creator-/Member-Testaccounts dokumentieren
5. Discover + Dashboard Mobile-Pass
6. Badge �Stark wachsend" Backend

### Sprint 3 � Rollen & Gates
7. Rollen-Pflichtsichtbarkeit implementieren
8. Creator: Voraussetzungen f�r Gruppen/Events/Services UI vereinfachen
9. Benachrichtigungen Push audit

### Sprint 4 � Polish
10. Profil-Datenexport
11. Studio Projektmanagement MVP
12. Performance-Profiling Discover unter Last

---

## Gemeinsame Priorisierung (A + B)

| Rang | Aufgabe | Bereich |
|------|---------|---------|
| 1 | Auszeichnungen-Sichtbarkeit (Schema + UI) | B |
| 2 | Brand-Bilder Landing | A |
| 3 | Production E2E-Regression dokumentieren | B |
| 4 | Event/Service-Karten Marketing-Detail | A |
| 5 | `/events`, `/services` Redirect | A |
| 6 | Rollen-Pflichtsichtbarkeit | B |
| 7 | Lighthouse + Scroll-Animationen | A |
| 8 | Badge �Stark wachsend" | A + B |
