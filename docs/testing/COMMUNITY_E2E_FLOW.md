# UNZE — End-to-End Community Flow (Manueller Testplan)

Dieser Testplan validiert den vollständigen Community-Join-Flow ohne neue Systeme.
Voraussetzung: Supabase-Migrationen `006`–`013` ausgeführt, `.env.local` konfiguriert.

## Test-Accounts vorbereiten

| Rolle | Zweck |
|-------|--------|
| **User A** | Bewerber / neues Mitglied |
| **User B (Creator)** | Community-Ersteller |
| **User C (Moderator)** | Optional — Antragsprüfung |

---

## 1. User Journey — Registrierung bis Bewerbung

### 1.1 Registrierung & Login
- [ ] `/auth/login` → Tab **Registrieren** → Konto anlegen
- [ ] E-Mail bestätigen (Supabase)
- [ ] Login mit `?next=/community/{slug}` leitet nach Login zurück zur Community

### 1.2 Community entdecken
- [ ] `/discover` → öffentliche Community sichtbar
- [ ] Community-Detailseite `/community/{slug}` öffnet sich

### 1.3 Beitrittsantrag (private Community)
Creator konfiguriert unter **Dashboard → Zugang**:
- Modus: **Privat**
- Freigabe: **Manuelle Prüfung**
- Pflichtfragen + Altersprüfung + Nachweise aktivieren

User A:
- [ ] **Bewerben** öffnet Formular
- [ ] Pflichtfelder ohne Ausfüllen → Fehlermeldung
- [ ] Geburtsdatum unter Mindestalter → abgelehnt
- [ ] Upload (Altersnachweis/Identität) → erfolgreich
- [ ] Antrag senden → Status „Offen“ + Bestätigung

**data-testid:** `join-application-form`, `join-application-submit`

---

## 2. Creator-/Moderator-Flow

Dashboard → **Anträge** (`/dashboard/community/{slug}/requests`):

- [ ] Antrag sichtbar mit Status-Badge
- [ ] **Antworten** (Text, Plattform-IDs, Geburtsdatum) sichtbar
- [ ] **Nachweise** über Proof-Viewer abrufbar (nur Moderator)
- [ ] **Annehmen** → User wird Mitglied, Notification an User A
- [ ] **Ablehnen** mit individuellem Text → User erhält Nachricht
- [ ] **Warteliste** → Status „Warteliste“

**data-testid:** `join-request-{id}`, `join-request-accept-{id}`, `join-request-reject-{id}`

---

## 3. Community Lifecycle

| Szenario | Erwartung |
|----------|-----------|
| **Offen + Auto-Accept** | Direktbeitritt ohne Antrag |
| **Privat + Manual Review** | Antrag → pending |
| **Geschlossen** | Block-Hinweis, kein Beitritt |
| **Warteliste aktiv + Limit voll** | Antrag → waitlisted (nicht blockiert) |
| **Auto-Reject bei Limit** | Antrag → rejected + Notification |
| **Mitgliederlimit** | Anzeige im Join-Panel |

---

## 4. Rollenfluss

| Rolle | Test |
|-------|------|
| `member` | Nach Annahme Standardrolle |
| `moderator` | Kann Anträge prüfen |
| `creator` | Voller Dashboard-Zugriff |
| `verified_member` | Über Rollen-Tab zuweisbar |
| `banned` | Join blockiert, Restrictions sichtbar |
| `pending` | Antragsstatus, kein Mitgliedschafts-Zugriff |

---

## 5. Sicherheitslogik

- [ ] Nicht-Mitglied: kein Dashboard-Zugriff auf fremde Community
- [ ] Bewerber: eigene Nachweise sichtbar, fremde nicht
- [ ] Moderator: Nachweise via Signed URL
- [ ] Gebannt: `checkUserJoinRestriction` blockiert Beitritt
- [ ] Upload: nur authentifiziert, Pfad `{communityId}/{userId}/...`
- [ ] RLS: Antworten/Nachweise nur Applicant + Mod

---

## 6. Notification Flow

Nach jedem Schritt `/notifications` prüfen:

- [ ] Bewerbung eingereicht (User A)
- [ ] Neuer Antrag (Creator/Mod)
- [ ] Angenommen / Abgelehnt / Warteliste
- [ ] Wartelisten-Promotion (manuell im Dashboard)
- [ ] Community geschlossen (Lifecycle-Aktion)

---

## 7. Dashboard UX

- [ ] Creator-Hub: offene Anträge pro Community
- [ ] Overview: Attention-Panel + Activity-Feed
- [ ] Tab **Anträge** mit Badge-Zähler
- [ ] Mobile: Tabs horizontal scrollbar, Buttons stacked
- [ ] Erfolgsmeldungen nach Annehmen/Ablehnen
- [ ] Listen aktualisieren ohne Hard-Refresh (`router.refresh`)

---

## Schnellstart lokal

```bash
npm run dev
# In zweitem Browser/Profil: Creator vs. Bewerber testen
npm run validate
```

## Bekannte Grenzen (bewusst)

- Stripe/Premium-Join: vorbereitet, nicht aktiv
- Auto-Promotion bei Member-Leave: DB-Trigger, Notification nur bei manuellem Promote in App
- Mock-Communities in Discover wenn DB leer
