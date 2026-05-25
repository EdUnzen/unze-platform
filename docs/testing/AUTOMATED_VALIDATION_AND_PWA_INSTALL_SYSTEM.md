# AUTOMATED VALIDATION & PWA INSTALL SYSTEM

## Grundprinzip

UNZE soll als PWA funktionieren und sich für Nutzer wie eine App anfühlen.

Das System muss prüfen:
- Mobile Darstellung
- Navigation
- Login
- Community-Flows
- Feed
- Kommentare
- Rollenrechte
- Badge-Vergabe
- Dashboard
- PWA-Installierbarkeit

---

## Automatische Prüfmechanismen

Bei jeder Änderung soll geprüft werden:

- Build funktioniert
- keine TypeScript-Fehler
- keine kaputten Imports
- Mobile Layout funktioniert
- Bottom Navigation funktioniert
- Plus-Button funktioniert
- Community erstellen funktioniert
- Beitrag erstellen funktioniert
- Dashboard öffnet korrekt
- Rollenrechte stimmen
- Badges können vergeben und entzogen werden
- Feed lädt korrekt
- Supabase-Verbindung funktioniert

---

## Test-Ablauf

Nach jeder Änderung:

1. Build ausführen
2. Fehler erkennen
3. Fehler dokumentieren
4. Lösung vorschlagen
5. Fix umsetzen
6. erneut testen
7. erst dann weiterbauen

---

## PWA Installationssystem

UNZE soll Nutzer aktiv darauf hinweisen, dass die App zum Homescreen hinzugefügt werden kann.

Die App soll erkennen:
- Android
- iOS
- Desktop
- bereits installiert
- noch nicht installiert

---

## Android-Verhalten

Auf Android/Chrome kann eine PWA bei erfüllten Kriterien über einen Installationsbutton installiert werden.

Die App soll anzeigen:

„UNZE als App installieren“

Bei Klick:
- Browser-Installationsdialog öffnen
- Nutzer bestätigt
- App wird zum Homescreen hinzugefügt

Voraussetzung:
- gültiges Web App Manifest
- Service Worker
- HTTPS
- installierbare PWA-Struktur

---

## iOS-Verhalten

iOS zeigt normalerweise keinen automatischen Installationsdialog wie Android.

Die App soll deshalb eine klare Anleitung anzeigen:

1. Safari öffnen
2. Teilen-Symbol antippen
3. „Zum Home-Bildschirm“ auswählen
4. „Hinzufügen“ bestätigen

Text für Nutzer:

„UNZE funktioniert wie eine App. Füge UNZE zu deinem Home-Bildschirm hinzu, um sie schneller zu öffnen und im App-Modus zu nutzen.“

---

## Installations-Hinweis

Der Hinweis soll:
- modern aussehen
- nicht nerven
- wegklickbar sein
- später erneut angezeigt werden können
- nach erfolgreicher Installation verschwinden

---

## Mobile-First-Prüfung

Besonders prüfen:
- iPhone Layout
- Android Layout
- Bottom Navigation
- Plus-Menü
- Discover
- Community Cards
- Profil
- Dashboard
- Feed
- Kommentare

---

## Ziel

UNZE soll nicht nur als Webseite funktionieren,
sondern als mobile PWA mit sauberer Installationsführung,
automatischen Tests und stabiler Funktionalitätsprüfung.