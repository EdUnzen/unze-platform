# UNZE — Verbindliche Architektur & Nächste Entwicklungsphase

> **Vorrang:** Bei Konflikten mit älteren Dokumenten oder Sprint-Planungen gilt **dieses Dokument**.

## Grundprinzip

UNZE ist **keine** Social-Media-Plattform.

UNZE ist eine Plattform für:

- Communities
- Gruppen
- Mitgliedschaften
- Verifizierung
- Organisation
- Monetarisierung

WhatsApp, Discord, Telegram, YouTube und TikTok bleiben die Kommunikations- und Medienplattformen.

UNZE dient als **Verwaltungs-, Organisations- und Monetarisierungsebene** darüber.

---

## Swipe-Modus bleibt Kernbestandteil

Der Swipe-Modus bleibt die **zentrale Entdeckungsoberfläche**.

Nutzer bewegen sich vertikal durch Cards.

Angezeigt werden:

- Communities
- Gruppen
- Events
- Dienstleistungen
- Community-Aktivitäten

Der Fokus liegt auf **Communities und Gruppen**, nicht auf einzelnen Personen.

---

## Folgen-System

Nutzer können:

- Communities folgen
- Gruppen folgen

| Folgt | Sieht |
|-------|--------|
| Ja | Inhalte der Community oder Gruppe |
| Nein | Öffentliche Infos, Vorschauen, Beitrittsmöglichkeiten |

---

## Feed-Vereinfachung

- Kein TikTok-Feed
- Keine Videos
- Keine Livestreams
- Keine Storys

Der Feed dient **ausschließlich** für:

- Ankündigungen
- Events
- Community-Aktivitäten
- Externe Inhalte

---

## Externe Inhalte

UNZE **speichert keine Videos**.

Communitys teilen Inhalte über YouTube, TikTok, Discord, Webseiten und andere externe Plattformen.

Angezeigt werden:

- Titel
- Bild
- Kurzbeschreibung
- Link

Der eigentliche Inhalt bleibt auf der externen Plattform.

---

## Communitys und Gruppen

Communitys und Gruppen stehen im **Mittelpunkt** des Systems.

Jede Community oder Gruppe benötigt:

- Name
- Beschreibung
- Titelbild

---

## Titelbilder

### Option A — Eigenes Bild hochladen

Eigene Bilder bleiben ausdrücklich erwünscht (Individualität, Wiedererkennung).

### Option B — Standardbild auswählen

UNZE stellt einen Standardkatalog bereit (Gaming, Sport, Business, Technik, Bildung, Musik, Fahrzeuge, Community, Netzwerk, … — mindestens 20–30).

**Ohne eigenes Upload:** vor Veröffentlichung muss ein Standardbild gewählt werden.

---

## Bild- und Inhaltssicherheit

Hochgeladene Bilder werden automatisch geprüft auf:

- Pornografie
- Gewalt
- Extremismus
- Illegale Inhalte
- Offensichtlichen Spam

Zusätzlich: Meldesystem.

Beim Erstellen bestätigt der Betreiber Rechte und rechtmäßige Inhalte. **Verantwortung liegt beim Community-/Gruppenbetreiber.**

---

## Rollen und Link-Freigaben

Externe Links dürfen nur veröffentlichen:

- Owner
- Admins
- Autorisierte Moderatoren

Normale Mitglieder: **keine** öffentliche Link-Freigabe.

Externe Links: automatische Prüfung. Nutzer können Inhalte melden.

---

## Öffentliche Reichweitenwerte entfernen

**Nicht weiterentwickeln:**

- Öffentliche Views
- Reichweitenanzeigen
- Impressionen
- Öffentliche Aufrufzähler

**Optional zulässig:** Neu, Aktiv, Beliebt, Verifiziert

---

## Nicht weiterentwickeln

- Video-Hosting & Video-Uploads
- Livestreams
- Story-System
- Messenger-System
- Creator-zentrierte Social-Media-Funktionen
- Öffentliche Reichweitenanzeigen

---

## Nutzer-Dashboard

Jeder Nutzer sieht:

- Seine Communities
- Seine Gruppen
- Seine Mitgliedschaften
- Seine Zahlungen
- Seine Anträge
- Seine Verknüpfungen (Discord, WhatsApp, Telegram, PSN, Epic, …)

---

## PWA

UNZE bleibt eine **Progressive Web App**:

- Homescreen-Unterstützung
- Sichtbares App-Icon
- Standalone-Modus
- Vollständiges Manifest
- Android- und iOS-Unterstützung

Die Anwendung soll sich möglichst wie eine native App anfühlen.

---

## Nächste Entwicklungsphase (höchste Priorität)

**Vor neuen Funktionen:**

1. Dashboard N+1 Queries beseitigen
2. Home- und Discover-Requests parallelisieren
3. Datenbank-Indizes optimieren
4. Caching aktivieren
5. Unnötige Client Components reduzieren
6. Lazy Loading verbessern
7. Performance erneut messen

**Nach Abschluss:**

- Vorher-/Nachher-Bericht
- Lighthouse-Werte dokumentieren
- TTFB dokumentieren
- Datenbank-Verbesserungen dokumentieren

Erst danach neue Funktionen entwickeln.

---

## Zielbild

Schnelle, einfache, skalierbare Plattform — Communities und Gruppen **organisieren, verwalten, verifizieren, monetarisieren**. Kommunikation und Medien bleiben extern.

Alle bestehenden und zukünftigen Entwicklungen sind auf dieses Zielbild auszurichten.
