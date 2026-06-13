# Event Ticket System V1 — Closed Beta

**Datum:** 2026-06-13  
**Referenz:** `Optimierung und Finalisierung/05_Event_Ticket_System_v1.pdf`  
**Status:** Abgeschlossen (V1 Scope)

---

## Scope V1

Ticket → QR → Check-In → Verwendet. Keine Sitzplätze, NFC, Mehrtages-Logik.

---

## Umgesetzte Funktionen

| Funktion | Status |
|----------|--------|
| Event buchen | ✅ Button auf Event-Detailseite |
| Ticket dem Profil zuordnen | ✅ `event_tickets.user_id` |
| Ticket im Profil sichtbar | ✅ `/profile/tickets` |
| QR-Code erzeugen | ✅ `EventTicketQr` (qrcode) |
| QR Check-In | ✅ Code-Eingabe im Creator-Dashboard |
| Status „genutzt" | ✅ RPC setzt `status = used` |
| Mehrfachnutzung verhindern | ✅ `check_in_event_ticket` RPC |
| Event-Statistik Dashboard | ✅ Tickets / Eingecheckt / Offen |

---

## Dateien

| Bereich | Datei(en) |
|---------|-----------|
| Migration | `database/migrations/031_event_tickets_v1.sql` |
| Types | `types/event-ticket.ts` |
| Service | `services/events/event-ticket.repository.ts`, `event-ticket.service.ts` |
| Actions | `app/event-ticket-actions.ts` |
| UI Nutzer | `EventBookTicketButton`, `EventTicketCard`, `EventTicketQr` |
| UI Creator | `EventCheckInPanel`, `EventDashboardCheckIns` |
| Profil | `app/profile/tickets/page.tsx` |

---

## Flow

```
Nutzer → Event-Detail → „Ticket buchen"
  → event_tickets INSERT (ticket_code unique)
  → Profil /profile/tickets → QR anzeigen

Creator → Dashboard /events → Ticket-Code eingeben
  → check_in_event_ticket RPC
  → status = used, checked_in_at gesetzt
  → Zweiter Scan → Fehler „bereits verwendet"
```

---

## Migration

```bash
npm run db:migrate:031
```

---

## Tests

| Check | Ergebnis |
|-------|----------|
| `npm run build` | ✅ |
| Migration 031 Prod | ✅ |

### Manueller Test

1. Event-Detail → Ticket buchen
2. `/profile/tickets` → QR sichtbar
3. Creator Dashboard → Code eingeben → Check-In OK
4. Gleichen Code erneut → Fehler
5. Stats: Eingecheckt +1

---

## V1-Grenzen (bewusst)

- Kein Kamera-QR-Scanner (nur Code-Eingabe)
- Keine kostenpflichtigen Event-Tickets (Stripe)
- Keine Sitzplatz-/Kapazitätslimits
