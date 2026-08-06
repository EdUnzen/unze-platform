# Berechtigungskonzept: Auszeichnungen & Profil-Sichtbarkeit

Stand: Juni 2026  
Geltungsbereich: UNZE Connect (`www.unzeconnect.app`)

## Grundprinzip

| Konzept | Besitzer | Vergeber | Steuerung |
|---------|----------|----------|-----------|
| **Auszeichnungen & Zertifikate** | Nutzer | Community (Creator/Moderator) | Nutzer w�hlt �ffentliche Sichtbarkeit |
| **Community-Badges** | Plattform (UNZE) | Automatisch | Kein Nutzer-/Creator-Einfluss |

Auszeichnungen und Zertifikate sind **pers�nliche Qualifikationen**. Sie werden in `user_credentials` gespeichert und bleiben dem Nutzer zugeordnet � auch wenn er eine Community verl�sst (sofern nicht widerrufen).

Community-Badges (`isVerified`, `isTrending` etc.) sind **Community-Metadaten** und werden ausschlie�lich durch UNZE-Logik vergeben.

---

## Sichtbarkeitsstufen (Auszeichnungen)

### Stufe 1 � Privat (Standard f�r neue Auszeichnungen)

- Auszeichnung ist im Profil des Nutzers sichtbar (eigene Ansicht).
- Nicht auf �ffentlichem Profil, nicht in Community-Mitgliederlisten.
- Gilt f�r alle Kategorien au�er rollenbedingter Pflichtsichtbarkeit.

### Stufe 2 � �ffentlich (Nutzerentscheidung)

- Nutzer aktiviert Sichtbarkeit pro Auszeichnung in **Profil ? Auszeichnungen ? Sichtbarkeit**.
- Erscheint auf �ffentlichem Profil (`/creator/[username]`) und optional in Mitgliederlisten.
- Nutzer kann jederzeit deaktivieren.

### Stufe 3 � Rollenbedingt verpflichtend

Wenn ein Nutzer eine **�ffentliche Rolle** innehat, k�nnen rollenrelevante Qualifikationen **nicht ausgeblendet** werden:

| Rolle | Pflicht sichtbar |
|-------|------------------|
| Creator (verifiziert) | Creator-Verifizierung, ggf. Branchen-Zertifikate wenn von UNZE definiert |
| Moderator | Moderator-Badge der Community, ggf. Moderator-Schulungszertifikat |
| Coach / Trainer | Coach-Zertifikate, die f�r die Rolle vorausgesetzt wurden |

**Begr�ndung:** �ffentliche Rollen erzeugen Vertrauen gegen�ber Mitgliedern. Relevante Qualifikationen m�ssen nachvollziehbar sein.

### Stufe 4 � Systemintern (nie �ffentlich)

- Widerrufene Auszeichnungen (`revoked_at IS NOT NULL`)
- Abgelaufene tempor�re Auszeichnungen (nach Ablauf)
- Entw�rfe / ausstehende Verifikationen

---

## Datenschutz & DSGVO

- Nutzer exportiert Auszeichnungen �ber Profil-Datenexport (geplant).
- L�schung: Widerruf durch Community oder Nutzer-Anfrage; Community kann vergeben, nicht �besitzen�.
- Keine Weitergabe an Dritte au�erhalb der Plattform.

---

## Technische Umsetzung (Roadmap)

### Phase 1 � Schema (offen)

```sql
ALTER TABLE public.user_credentials
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.user_credentials
  ADD COLUMN IF NOT EXISTS visibility_locked BOOLEAN NOT NULL DEFAULT FALSE;

-- visibility_locked = TRUE wenn Rolle Pflichtsichtbarkeit erzwingt
```

### Phase 2 � API & UI (offen)

- `PATCH /api/profile/credentials/[id]/visibility` � Nutzer toggelt `is_public`
- Profil-Auszeichnungsseite: Toggle pro Eintrag + Hinweis bei `visibility_locked`
- `fetchUserAwardsForProfile(userId, viewerId)` � filtert nach Sichtbarkeit und Viewer-Kontext

### Phase 3 � Rollen-Engine (offen)

- Bei Rollenvergabe: relevante Credentials mit `visibility_locked = TRUE` setzen
- Bei Rollenentzug: Lock aufheben, Nutzer entscheidet erneut

### Phase 4 � Zugangsvoraussetzungen (teilweise vorhanden)

- Requirement Engine (`036_requirement_engine_phase1.sql`) pr�ft Credentials unabh�ngig von Profil-Sichtbarkeit
- Zugang zu Community/Gruppe/Event/Service: Credential muss **besessen** werden, nicht **�ffentlich sichtbar**

---

## Abgrenzung Community-Badges

Community-Badges werden **nicht** in `user_credentials` gespeichert. Sie leben in Community-Metadaten und Marketing-API:

- `isVerified` � manuelle UNZE-Verifizierung
- `isTrending` � Aktivit�ts-/Wachstumsheuristik

Creator k�nnen Community-Badges weder kaufen noch manuell setzen.

---

## Offene Entscheidungen

1. Default `is_public`: `FALSE` (empfohlen) vs. `TRUE` f�r Community-Awards
2. Mitgliederliste: nur �ffentliche Auszeichnungen oder gar keine?
3. Creator-Profil: alle rollenrelevanten oder nur Top-3?

Empfehlung: Default privat, Mitgliederliste max. 3 �ffentliche Auszeichnungen, Creator-Profil alle Pflicht- plus vom Nutzer freigegebene.
