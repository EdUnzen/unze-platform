# Requirement-Engine  Zentralisierte Zugangs- & Berechtigungslogik

> **Status:** VORSCHLAG (Architektur) · Ergänzt `Entscheidungsregister.md` **UNZE-005**  
> **Verwandt:** `CREDENTIAL_SYSTEM.md` (UNZE-003) · `UNZE_ID_SYSTEM.md` (UNZE-004) · `PERMISSION_SYSTEM.md`

---

# Architekturgrundsatz

Die Zugangs- und Berechtigungslogik von UNZE wird **vollständig zentralisiert**.

Es darf **keine modulbezogenen Berechtigungssysteme** geben. Sämtliche Bereiche verwenden dieselbe Requirement-Engine.

**Regel für neue Module:** Niemals eigene Zugangslogik entwickeln  immer diese Engine aufrufen.

---

# Drei-Schichten-Modell

| Schicht | Aufgabe | Bewertet Nutzer? |
|---------|---------|------------------|
| **UNZE-ID** (UNZE-004) | Eindeutige Identität · Verify-Schlüssel (QR) | Nein |
| **Credentials** (UNZE-003) | Qualifikationen, Vergabe, Entzug, Historie | Nein |
| **Requirement-Engine** (UNZE-005) | Prüft, ob definierte Voraussetzungen erfüllt sind | **Nein** |

Die Engine **vergibt keine Punkte**, **berechnet keinen Vertrauenswert** und **trifft keine subjektive Nutzerbewertung**.

Sie prüft ausschließlich **objektive, vordefinierte Voraussetzungen**.

---

# Keine globale Nutzerbewertung für Zugang

UNZE erhält **keinen allgemeinen Vertrauens- oder Reputationswert** für Berechtigungsentscheidungen.

**Nicht** als Zugangskriterium:

- globale Nutzer-Sternebewertungen
- aggregierter Reputation-Score als Gate
- Community-Score als automatische Sperre/Freigabe (ohne explizite Regel)

**Erlaubt** als objektive Requirement-Prädikate:

| Prädikat-Typ | Quelle |
|--------------|--------|
| Credential vorhanden / gültig | `user_credentials` |
| Mitgliedschaft aktiv | `community_members` |
| Premium aktiv | `subscriptions` (Stripe) |
| Verifizierung | `profiles.is_verified`, Creator-Verifizierung |
| Rolle | `community_members.role` (z. B. Moderator) |
| Ticket vorhanden / gültig | `event_tickets` |
| Alter / Regeln akzeptiert | bestehende Join-Felder (`min_age`, `require_rules_consent`) |
| Custom (zukünftig) | explizit registriert  nie implizit pro Modul |

**Hinweis Ist-Code:** `profiles.reputation_score` und `rating_avg` (Community/Gruppe) dienen **Orientierung/Anzeige**  dürfen **nicht** ohne explizite FINAL-Entscheidung in die Engine einfließen.

---

# Ressourcen  modulunabhängig

Anforderungen sind **nicht** an einen Modultyp gebunden.

Jede Ressource kann optionale Zugangsregeln definieren über:

```
resource_type + resource_id  ?  requirement_set_id
```

| `resource_type` (Beispiele) | Bestehend / geplant |
|------------------------------|---------------------|
| `community` | ? `communities` |
| `group` | ? `community_groups` |
| `event` | ? `community_events` |
| `service` | ? Gruppe Typ `service` |
| `course` | ?? zukünftig |
| `product` | ?? zukünftig |
| `tournament` | ?? zukünftig |
| `premium_content` | ?? zukünftig |
| `creator_role` | über Rollen-Prädikat |
| `moderator_role` | über Rollen-Prädikat |

Neue Module registrieren nur einen **`resource_type`**  keine neue Prüflogik.

---

# API (konzeptionell)

## Kernfunktionen

| Funktion | Zweck | Aufrufer |
|----------|-------|----------|
| `evaluate_requirements(user_id, resource_type, resource_id)` | Vollständige Prüfung ? `{ fulfilled, missing[] }` | Join, Event-Buchung, Buchung |
| `check_requirements(...)` | Alias / UI-freundlich (vor Bewerbung) | Community-/Event-Seiten |
| `verify_unze_id(token, resource_type, resource_id, actor_id)` | Identität auflösen + `evaluate_requirements` + Need-to-know | Scanner, Gate |

**Alle Writes und Checks:** Server Action / RPC  nie Client-only.

## Ergebnis

```typescript
type RequirementResult = {
  fulfilled: boolean;
  severity: "none" | "recommended" | "required";
  missing: Array<{ predicate: string; label: string }>; // für UI, nicht für Scanner-Leak
};
```

Bei **Scan (Need-to-know):** Scanner erhält nur `allowed | denied | reason_code`  keine Credential-Liste, keine Cross-Community-Daten.

---

# Regelwerk

Regeln referenzieren **Prädikate**, nicht Modul-Code:

| Logik | Beispiel |
|-------|----------|
| Einzeln | Credential A |
| AND | A und B |
| OR | A oder B |
| Sammlung | Collection Immobilienverwaltung |
| Schweregrad | `none` · `recommended` · `required` |

Speicherung: `requirement_sets` + `requirement_nodes` (Baum)  **eine** Engine, **eine** Evaluierung.

---

# Abgrenzung PERMISSION_SYSTEM vs. Requirement-Engine

| | **Permission-System** | **Requirement-Engine** |
|--|----------------------|------------------------|
| Frage | Darf dieser Nutzer **handeln** (Admin, Mod)? | Darf dieser Nutzer **zugreifen** (Join, Event, Premium)? |
| Basis | Rollen, Community-Scope | Objektive Voraussetzungen |
| Beispiel | `can_manage_community` | Credential SSL + aktive Mitgliedschaft |

Beide sind serverseitig; **keine Überschneidung**  Scanner braucht Permission **und** ruft Engine für den Gast auf.

---

# Integration Ist-Systeme (Erweitern, nicht ersetzen)

| Ist | Migration |
|-----|-----------|
| `access.service.ts` (Join, Approval) | Ruft Engine vor Accept/Reject |
| `event-ticket.service.ts` | Ticket-Prädikat in Engine; Check-in via `verify_unze_id` |
| `join_approval_mode`, Fragen | Kombinierbar mit Requirement-Sets |
| Modul-eigene `if (isMember)` Checks | Schrittweise auf Engine  keine neuen Parallel-Checks |

---

# CORSA / Entwicklungsstandard

- Governance: **Entscheidungsregister UNZE-005**
- Keine CORSA-Duplikation
- RLS: Requirement-Tabellen community-scoped wo zutreffend
- DSGVO: minimale Scanner-Antworten

---

# Phasen

| Phase | Inhalt |
|-------|--------|
| **0** | UNZE-ID + Engine-Skeleton (`evaluate_requirements` Stub) |
| **1** | Prädikate: Mitgliedschaft, Premium, Verifizierung, Ticket |
| **2** | Credential-Prädikate + UI Bewerbungsprüfung |
| **3** | Sammlungen, AND/OR |
| **4** | `verify_unze_id` vollständig |
| **5** | Legacy-Checks in Services konsolidieren |

---

# Verknüpfungen

- `Entscheidungsregister.md` ? UNZE-003, UNZE-004, UNZE-005
- `architecture/modules/CREDENTIAL_SYSTEM.md`
- `architecture/modules/UNZE_ID_SYSTEM.md`
- `architecture/permissions/PERMISSION_SYSTEM.md`
- `services/access/access.service.ts`
