# AI WORKFLOW SYSTEM

> **Verbindliche Architektur:** `docs/ARCHITECTURE_DECISIONS.md` · Cursor-Rule: `.cursor/rules/unze-architecture.mdc`

# Grundprinzip

UNZE wird mit einem KI-gestützten Entwicklungsworkflow aufgebaut.

Genutzte Systeme:
- Cursor
- ChatGPT
- Corsa
- zukünftige AI-Agenten

---

# Ziel

Der Workflow soll:
- strukturiert
- nachvollziehbar
- skalierbar
- sicher

sein.

Keine:
- chaotischen KI-Änderungen
- unkontrollierten Codegenerierungen
- ungeprüften Schnelländerungen

---

# Rollen der Systeme

## ChatGPT
Dient für:
- Architektur
- Produktlogik
- Systemdesign
- Strategie
- UX-Ideen
- Dokumentation

---

## Cursor
Dient für:
- Entwicklung
- Komponentenbau
- Codegenerierung
- Refactoring
- Projektstruktur

---

## GitHub
Dient für:
- Versionskontrolle
- Änderungsverfolgung
- Branches
- Sicherung

---

## Vercel
Dient für:
- Deployments
- Preview Builds
- Production Releases

---

## Supabase
Dient für:
- Backend
- Auth
- Database
- Policies
- Storage

---

# Entwicklungsprinzip

Neue Systeme werden:
1. dokumentiert
2. strukturiert
3. geplant
4. erst danach entwickelt

---

# Architekturprinzip

KI-Systeme sollen:
- vorhandene Dokumentation lesen
- bestehende Architektur respektieren
- modulare Systeme erweitern

Nicht:
- chaotisch überschreiben
- bestehende Strukturen zerstören
- unkontrollierte Änderungen erzeugen

---

# Dokumentationsprinzip

Wichtige Systeme werden dokumentiert:
- Architektur
- Datenbank
- APIs
- Komponenten
- Rollen
- Community-Systeme

---

# Sicherheitsprinzip

Kritische Bereiche:
- Auth
- Monetarisierung
- Permissions
- Creator-Rechte

dürfen NICHT blind durch KI geändert werden.

---

# Entwicklungsworkflow

Geplanter Ablauf:

Idee
→ Dokumentation
→ Architektur
→ Komponentenplanung
→ Entwicklung
→ Testing
→ Deployment

---

# Testing-Prinzip

KI-generierter Code muss:
- geprüft
- getestet
- validiert

werden.

Keine:
- direkten ungeprüften Live-Deployments

---

# Mobile First

Alle Systeme müssen:
- mobil optimiert
- performant
- touchfreundlich

entwickelt werden.

---

# Zukunftsprinzip

Spätere Erweiterungen:
- automatisierte AI-Workflows
- intelligente Komponenten-Erkennung
- automatische Qualitätsprüfungen
- modulare AI-Entwicklung

---

# Ziel

Das AI-Workflow-System soll ermöglichen,
UNZE strukturiert und professionell
mit KI-Unterstützung zu entwickeln,
ohne chaotische Entwicklungsprozesse.