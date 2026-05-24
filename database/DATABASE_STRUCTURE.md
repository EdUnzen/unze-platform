# DATABASE STRUCTURE

# Grundprinzip

UNZE verwendet ein modulares Datenbanksystem.

Die Datenbank muss:
- skalierbar
- modular
- sicher
- performant

sein.

Geplantes Backend:
- Supabase

---

# Hauptsysteme

Die Datenbank verwaltet:

- Nutzer
- Communities
- Rollen
- Beiträge
- Kommentare
- Badges
- Mitgliedschaften
- Monetarisierung
- Events
- Plattform-Integrationen
- Notifications

---

# Haupttabellen

## users
Speichert:
- Nutzerprofile
- Basisdaten
- Einstellungen
- Reputation
- Plattformlinks

---

## communities
Speichert:
- Community-Daten
- Creator
- Kategorien
- Sichtbarkeit
- Monetarisierung
- Plattformtypen

---

## community_members
Speichert:
- Mitgliedschaften
- Rollen
- Community-Zugehörigkeiten

---

## posts
Speichert:
- Beiträge
- Feed-Inhalte
- Community-Posts
- Creator-Posts

---

## comments
Speichert:
- Kommentare
- Antworten
- Interaktionen

---

## roles
Speichert:
- Rollen
- Community-Rechte
- Spezialrollen

---

## badges
Speichert:
- Badges
- Verifizierungen
- Community-Auszeichnungen

---

## events
Speichert:
- Community-Events
- Termine
- Aktivitäten

---

## notifications
Speichert:
- Benachrichtigungen
- Interaktionen
- Community-Aktivitäten

---

## subscriptions
Speichert:
- Mitgliedschaften
- Premium-Zugänge
- Monetarisierungen

---

# Architekturprinzip

Alle Systeme sollen:
- modular
- unabhängig
- erweiterbar

sein.

---

# Sicherheitsprinzip

Kritische Daten:
- Rollen
- Monetarisierung
- Rechte
- Mitgliedschaften

benötigen:
- sichere Zugriffsregeln
- Rechteprüfung
- geschützte APIs

---

# Supabase-Prinzip

Geplante Nutzung:
- Auth
- Database
- Realtime
- Storage
- Policies

---

# API-Prinzip

Frontend kommuniziert über:
- sichere APIs
- modulare Services
- getrennte Systeme

---

# Skalierungsprinzip

Die Datenbank muss:
- große Communitys
- viele Nutzer
- hohe Aktivität
- viele Beiträge

unterstützen können.

---

# Mobile First

Backend-Systeme müssen:
- schnell
- performant
- mobil optimiert

arbeiten.

---

# Zukunftsprinzip

Spätere Erweiterungen:
- AI-Systeme
- intelligente Empfehlungen
- Analytics
- Community-Matching
- Creator-Systeme
- Plattform-Synchronisation

---

# Ziel

Die Datenbank soll das stabile Fundament
für ein skalierbares universelles Community-System bilden.