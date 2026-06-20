# UNZE-ID  Plattform-Identität & Verify-Schlüssel

> **Status:** VORSCHLAG (Architektur) · Ergänzt `Entscheidungsregister.md` **UNZE-004**  
> **Verwandt:** `REQUIREMENT_ENGINE.md` (UNZE-005) · `CREDENTIAL_SYSTEM.md` (UNZE-003)

---

# Drei-Schichten-Modell

| Schicht | Frage |
|---------|--------|
| **UNZE-ID** | *Wer* ist dieser Nutzer? |
| **Credentials** | *Welche Qualifikationen* besitzt er? |
| **Requirement-Engine** | *Sind die Voraussetzungen* erfüllt? |

Die UNZE-ID ist der **Verify-Schlüssel**  sie trifft keine Zugangsentscheidung selbst. Das übernimmt die Requirement-Engine nach Identitätsauflösung.

---

# Grundprinzip

Jeder Nutzer besitzt **genau eine dauerhafte UNZE-ID**, dargestellt als QR-/Matrix-Code.

- Eindeutige Identität
- Nicht manipulierbar (Server prüft)
- **Keine sensiblen Daten** im Code
- **Ersetzt keine Anmeldung** (Supabase Auth)

Die persönliche UNZE-ID ist der **universelle Verifizierungsnachweis** vor Ort  Entscheidungen ausschließlich serverseitig, Need-to-know.

---

# Verify-Ablauf

```
Scan (token)
  ? user_id auflösen
  ? evaluate_requirements(user_id, resource_type, resource_id)   [UNZE-005]
  ? Need-to-know-Antwort an Scanner
```

Scanner-Berechtigung (Rolle) separat über Permission-System  Engine prüft den **Gast**.

---

# Abgrenzung

| System | Rolle |
|--------|--------|
| Auth (Supabase) | Login, Session |
| `profiles.id` | Interner PK  nicht im QR |
| Event-Ticket-QR | Ausnahme transferierbare Tickets |
| Requirement-Engine | **Alle** Zugangsentscheidungen |
| Permission-System | Admin/Mod-**Handlungen**, nicht Gast-Zugang |

**Regel:** Keine modulbezogenen Berechtigungssysteme, kein paralleles QR pro Modul.

---

# Technik (Phase 0)

- `unze_public_id` pro Profil
- Payload: `UNZEID:{token}`
- `verify_unze_id(token, resource_type, resource_id, actor_id)` RPC
- Profil-QR-UI, Audit-Log

---

# Verknüpfungen

- `REQUIREMENT_ENGINE.md` (UNZE-005)
- `CREDENTIAL_SYSTEM.md` (UNZE-003)
- `Entscheidungsregister.md`
- `services/events/event-ticket.service.ts`
