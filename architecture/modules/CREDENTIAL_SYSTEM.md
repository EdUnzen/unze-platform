# Credential-System (UNZE-003)  Auszeichnungen & Qualifikationen

> **Status:** VORSCHLAG (Architektur) · Ergänzt `Entscheidungsregister.md` **UNZE-003**  
> **Verwandt:** `REQUIREMENT_ENGINE.md` (UNZE-005) · `UNZE_ID_SYSTEM.md` (UNZE-004)

---

# Einordnung im Drei-Schichten-Modell

| Schicht | Frage |
|-------|--------|
| **UNZE-ID** | *Wer* ist dieser Nutzer? |
| **Credentials** | *Welche Qualifikationen* hat er? |
| **Requirement-Engine** | *Sind die Voraussetzungen* für diese Ressource erfüllt? |

Credentials **speichern und verwalten** Qualifikationen. Die **Requirement-Engine** entscheidet Zugang  getrennte Verantwortlichkeiten.

Siehe `REQUIREMENT_ENGINE.md` für zentralisierte Zugangslogik.

---

# Grundprinzip

Auszeichnungen (Credentials) sind **echte Qualifikationen**  nicht nur Profil-Dekoration.

Sie können als **Prädikate** in der Requirement-Engine verwendet werden (Zugangsvoraussetzung).

UNZE stellt **Infrastruktur**; Creator definieren Inhalt, Vergabe und Regeln.

Kein zentrales UNZE-Qualitätsurteil über Auszeichnungen.

---

# Credentials  Verantwortlichkeiten

| Eigenschaft | Beschreibung |
|-------------|--------------|
| Qualifikation | Beschreibt Leistung, Berechtigung oder Absolvierung |
| Vergabe / Entzug | Creator, Admin, Mod (rollenbasiert) |
| Historie | Wer, wann, optional Begründung |
| Sichtbarkeit | öffentlich / privat / archiviert |
| Gültigkeit | dauerhaft, Ablauf, Erneuerung |

Private Credentials: **nicht** im Profil sichtbar  Engine darf sie **intern** prüfen.

---

# Abgrenzung Badge-System (Ist)

| | **Badges (heute)** | **Credentials (UNZE-003)** |
|--|-------------------|----------------------------|
| Tabellen | `badges`, `user_badges` | `credentials`, `user_credentials`,  |
| Zweck | Community-Status | Qualifikationen, Portfolio, Engine-Prädikate |
| Engine-Anbindung | ? | ? über Credential-Prädikat |

Badges bleiben Phase-0; Credentials neues Schema.

---

# Datenmodell (Vorschlag)

```
credentials
user_credentials
user_credential_history
credential_collections
credential_collection_items
```

Zugangsregeln liegen **nicht** im Credential-Modul  sie liegen in der Requirement-Engine (`requirement_sets`, `requirement_nodes`), referenzieren Credentials als Prädikate.

---

# Sammlungen & Logik

Creator können Auszeichnungen bündeln (z. B. Immobilienverwaltung).

Die Engine referenziert Sammlungen als **ein** Prädikat  keine modulspezifische Logik.

Unterstützte Ausdrücke (Engine): Einzeln, AND, OR, Sammlung  siehe `REQUIREMENT_ENGINE.md`.

---

# Bewerbungsprüfung

Vor Community-Anfrage / Event-Anmeldung:

- ? Voraussetzungen erfüllt  
- ? Folgende Voraussetzungen fehlen  

Via `check_requirements(user_id, resource_type, resource_id)`  Erweiterung von `access.service.ts`.

---

# UNZE-ID (Scan)

Vor Ort: `verify_unze_id` ? Identität auflösen ? `evaluate_requirements`.

Need-to-know-Antwort  keine Credential-Liste an Scanner.

Siehe `UNZE_ID_SYSTEM.md`.

---

# Phasen

| Phase | Inhalt |
|-------|--------|
| **1** | Credential-Schema, Vergabe, Historie, Gültigkeit, Sichtbarkeit |
| **2** | Credential-Prädikate in Requirement-Engine |
| **3** | Sammlungen |
| **4** | UNZE-ID-Scan-Integration |

Phase 0 (Engine-Skeleton + UNZE-ID) siehe `REQUIREMENT_ENGINE.md`.

---

# Verknüpfungen

- `REQUIREMENT_ENGINE.md` (UNZE-005)
- `UNZE_ID_SYSTEM.md` (UNZE-004)
- `Entscheidungsregister.md`
- `services/badges/*` (Ist)
- `services/access/access.service.ts`
