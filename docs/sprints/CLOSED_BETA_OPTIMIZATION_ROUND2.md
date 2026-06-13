# Closed Beta — Test- & Optimierungsrunde (Änderungsbericht)

**Datum:** 2026-06-13  
**Commit:** `2e25bf6`  
**Deployment:** `dpl_Aej6Wt4R38emBq5TeV1H5ykxgb2N`

---

## Durchgeführte Optimierungen

### 1. Community Score
- Kennzahl **text-5xl** mit `/ 100`-Suffix — klarer Fokus
- Fortschrittsbalken **16px** mit Grün-Gradient
- Text vereinfacht („Aktivität und Qualität dieser Community“)
- **`CommunityLevelBadge.tsx` entfernt** — letztes UI-Relikt Bronze/Silber/Gold

**Intern unverändert:** `communityLevel` in DB/Berechnung (nicht sichtbar).

### 2. Mobile Community Navigation
- **Entscheidung: 3×2-Grid auf Mobile** (statt 6 gequetschte Spalten)
- 56px Mindesthöhe, Icons 20px, Schrift 12px
- Desktop/Tablet: weiterhin 6 Tabs in einer Zeile
- Aktiver Tab: Ring + Shadow (stärker auf Mobile)

### 3. Nutzerfeedback
- Join/Leave/Request: Meldungen **oben im Panel** (sofort sichtbar)
- Creator-Anträge: einheitliches `ActionFeedback`
- Event-Buchung: Erfolgsbanner bleibt nach Buchung sichtbar (`justBooked`)

### 4. Event-System (Mobile)
- Ticket-Karte: **QR zentriert oben**, größer (200px) auf Mobile
- Stornierung + Check-In-Feedback bereits vorhanden
- Automatisierte Tests: Join 8/8, Events 10/10

---

## Gesamteindruck — dokumentierte Beobachtungen (Neue Nutzer)

| Kategorie | Befund | Priorität |
|-----------|--------|-----------|
| **Doppelte Info** | Score im Header (klein) + Score-Karte (groß) — bewusst: Header = Schnellinfo, Karte = Detail | Niedrig |
| **Englische Labels** | „Trending“ auf Discover-Karten | Niedrig |
| **Creator-Dashboard** | Label „Dashboard“ etabliert | OK |
| **Community-Freitext** | Tags/Kategorien der Ersteller — **kein System-UI**, unverändert | — |
| **Premium-Flow** | Stripe-Checkout verlässt App kurz — erwartet | Info |
| **Ticket-Storno** | Nur unter `/profile/tickets`, nicht auf Event-Seite | Akzeptiert (Beta) |
| **Leere Bereiche** | Feed/Events ohne Inhalt zeigen Empty-State | OK |
| **DB-Fehler** | Abgefangen via `mapDbError()` | Behoben |

**Keine blockierenden UX-Fehler** für Closed-Beta-Start identifiziert.

---

## Nicht geändert (bewusst)

- Keine neuen Features
- Demo-Daten unverändert
- Community-Ersteller-Freitext (Tags, Kategorien) unberührt
- Backend Level-Berechnung (Bronze→Elite intern)

---

## Tests vor Deploy

```
npm run build
npm run test:join-flow
npm run test:event-tickets
```

---

## Empfehlung iPhone-Test

1. Community-Tabs: 3×2-Grid, Daumenbedienung
2. Join → Meldung oben → Mitgliederzahl
3. Score-Karte: große Zahl, Balken
4. Event-Ticket: QR groß, Stornieren testen
