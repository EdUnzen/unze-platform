# Closed Beta — Pre-Release Prüfbericht

**Datum:** 2026-06-13  
**Version:** `0.3.0-beta.1` (+ UX-Patch)  
**Production:** https://unze-platform.vercel.app

---

## 1. Join-/Leave-System ✅ (automatisiert)

| Fall | Ergebnis |
|------|----------|
| A — Beitritt | ✅ Insert erfolgreich |
| B — Bereits Mitglied | ✅ Duplicate-Key → App: „Mitgliedschaft bereits aktiv.“ |
| C — Verlassen | ✅ Soft-Remove, `deleted_at` gesetzt |
| Rejoin nach Leave | ✅ Reaktivierung, kein DB-Fehler |

**UI (manuell iPhone):** Erfolgsmeldung, Mitgliederzahl, Status „Mitglied“ — bitte live bestätigen.

---

## 2. Benachrichtigungen / Feedback

| Aktion | Status | Komponente |
|--------|--------|------------|
| Community beigetreten | ✅ | `CommunityJoinPanel` |
| Community verlassen | ✅ | `CommunityJoinPanel` + `router.refresh()` |
| Bereits Mitglied | ✅ | `ActionFeedback` info/success |
| Gruppe beigetreten/verlassen | ✅ | `FollowGroupButton` |
| Event gebucht | ✅ | `EventBookTicketButton` |
| Event eingecheckt | ✅ | `EventCheckInPanel` |
| Anfrage gesendet | ✅ | `CommunityJoinPanel` |
| Anfrage genehmigt/abgelehnt | ✅ | `ApplicationReviewList` |
| Community gefolgt/entfolgt | ✅ | `CommunityJoinPanel` |
| Service gebucht | ✅ | `ServiceBookingPanel` |
| **Ticket storniert** | ✅ **neu** | `EventTicketCardClient` |
| Ticket nicht stornierbar | ✅ | Freundliche Fehlermeldungen |
| Event bereits gestartet | ✅ | Stornierung blockiert |

---

## 3. Community Score ✅

| Prüfung | Ergebnis |
|---------|----------|
| Keine Bronze/Silber/Gold-Badges in UI | ✅ |
| Keine „Community-Level“-Texte (Nutzer-UI) | ✅ |
| Community-Karten ohne Level-Badge | ✅ |
| Creator-Header: Score statt Badge | ✅ |
| Große Kennzahl + Fortschrittsbalken | ✅ |

**Backend:** `communityLevel` bleibt intern für Berechnung — nicht sichtbar.

**Bekannt:** „Trending“ auf Discover-Karten (Marketing-Label, kein Level-Badge).

---

## 4. Mobile Tabs ✅ (Code)

- Min-Höhe 52px, kein `truncate`, aktiver Tab mit Ring
- **iPhone:** manuell prüfen

---

## 5. PWA ✅

| Check | Status |
|-------|--------|
| Manifest | ✅ `/manifest.json` |
| Service Worker | ✅ v3 (`unze-shell-v3`) |
| Cache-Bereinigung | ✅ alte v1/v2 gelöscht |
| SW-Update | ✅ `reg.update()` |

**iPhone:** App löschen → neu installieren empfohlen.

---

## 6. Creator-Bereich

Strukturell vorhanden (Dashboard-Routen im Build). **Manuell testen:**
Community/Gruppe/Event/Service erstellen, Anträge, Mitgliederliste.

---

## 7. Sichtprüfung (Code-Scan)

| Thema | Befund |
|-------|--------|
| DB-Fehler an Nutzer | ✅ `mapDbError()` in Join/Ticket-Flows |
| Englische UI-Reste | ⚠️ „Trending“, „Dashboard“ (etablierte Labels) |
| Platzhalter | ✅ keine offensichtlichen Lorem-Texte |
| Demo-Daten | ✅ unverändert |

---

## Automatisierte Tests

```
npm run test:join-flow     → 8/8 ✅
npm run test:event-tickets → 10/10 ✅ (inkl. Stornierung)
npm run build              → ✅
```

---

## Freigabe-Empfehlung

**Bereit für Closed Beta mit Testern** nach kurzem iPhone-Smoke-Test durch Product Owner.

Keine neuen Features — nur Stabilität, Feedback, Mobile UX.
