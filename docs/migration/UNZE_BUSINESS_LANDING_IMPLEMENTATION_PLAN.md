# UNZE Business Landingpage - Umsetzungsplan (Analyse & Architektur)

Stand: Juni 2026  
Status: **Architektur freigegeben � Umsetzung innerhalb dieser Struktur**  
Master-Dokument: **`docs/THREE_PRODUCT_ARCHITECTURE.md`**

Die grundlegende Systemtrennung ist abgeschlossen und nicht mehr zur Diskussion. Dieser Plan beschreibt die konkrete Umsetzung von UNZE Business und Studio-Anbindung.

---

## 0. Architektur (verbindlich, siehe Master-Dokument)

| Produkt | Rolle | Domain / Zugang |
|---------|--------|-----------------|
| **UNZE Connect** | Plattform: Communities, Events, Services, Mitgliedschaften, Auszeichnungen, Verifizierungen | www.unzeconnect.app |
| **UNZE Business** | Oeffentliche Agentur- & Vertriebsseite, Projektanfragen | www.unze.app/business (und Unterseiten) |
| **UNZE Studio** | Internes Produktionssystem - **niemals oeffentlich** | Geschuetzter Bereich nach separatem Admin-Login (gleiche Infrastruktur, eigene Auth) |

### Infrastruktur (verbindlich)

- **Eine Supabase-Produktions-DB** � keine separate Instanz
- **Logische Trennung:** Schemas `business`, `studio`, `studio_auth` neben Connect-`public`
- Landing/Business: **nur lesend** auf oeffentliche Connect-Daten (`/api/public/*`)
- Business schreibt **nicht** in Connect-Tabellen
- Studio: **nur nach Authentifizierung**; kein oeffentlicher Zugriff auf Studio-Funktionen

### Leitprinzip Wiederverwendbarkeit

> Bei jeder geplanten Funktion pruefen: Ist sie spaeter fuer **alle** Kunden wiederverwendbar?  
> UNZE Studio soll aus jedem abgeschlossenen Projekt lernen und zu einem **modularen Produktionssystem** werden - keine Sammlung individueller Einzelloesungen.

### Auszeichnungen / Zertifikate (geklaert)

| Kontext | Bedeutung |
|---------|-----------|
| **UNZE Connect** | Funktional: Vergabe, Verwaltung, Mitglieder-Eigentum, Community als Issuer |
| **UNZE Business Landing** | Marketing: Produktmerkmal - �Wir entwickeln Plattformen mit Zertifikaten, Rollen, Events �� |
| **Connect-Marketing** (unze.app/communities) | Teaser oeffentlicher Communities - keine Studio-Logik |

Kein Widerspruch: Business **erklaert** Moeglichkeiten; Connect **liefert** sie.

---

## 1. Abgrenzung www.unze.app

Connect-Marketing-Routen bleiben erhalten. Business erhaelt **Community-Suche** (read-only, Marketing):

| Pfad | Produkt | Phase |
|------|---------|-------|
| `/`, `/communities`, `/events`, `/services`, `/community/[slug]` | Connect-Schaufenster | Wartung |
| `/business`, `/business/*` | UNZE Business Landing + Community-Suche | Dieser Plan |
| `/admin` oder `/studio/login` | Studio-Login (Gateway, kein oeffentliches Studio) | P4 |
| `/studio` (alt) | Redirect zu `/business` | Bei Business-Launch |
| Legal (`/impressum`, �) | Gemeinsam | Optional erweitern |

Navigation: Connect-Bereich und Business-Bereich visuell trennen (z. B. �Plattform� vs. �Projekte & Agentur�).

---

## 2. Seitenstruktur (UNZE Business)

### 2.1 Routen

```
/business                          ? Start (Hero, Ueberblick)
/business/leistungen               ? Produktkatalog (optional eigene Seite oder Anker)
/business/ablauf                   ? Projektablauf (optional Anker auf Start)
/business/pakete                   ? Servicepakete
/business/plattform-funktionen     ? Connect-Features als Bausteine (Zertifikate, Events, �)
/business/anfrage                  ? Schnellanfrage + Konfigurator
/business/anfrage/erfolg           ? Bestaetigung nach Absenden
/business/faq
/business/kontakt                  ? oder Anker + mailto/WhatsApp
```

**MVP-Variante (weniger Routen):** Alles auf `/business` als One-Pager mit Ankern; separate Route nur `/business/anfrage` wegen Formular-Komplexitaet.

### 2.2 Sektionen (Inhalt)

| # | Sektion | Ziel |
|---|---------|------|
| 1 | **Hero** | Positionierung + 2 CTAs: �Projekt anfragen�, �Leistungen entdecken� |
| 2 | **Leistungsversprechen** | �Wir kuemmern uns um die Technik �� |
| 3 | **Was wir entwickeln** | Web, Apps, Community-Plattformen, KI, Unternehmenssysteme, Templates |
| 4 | **Community-Suche** | Oeffentliche Connect-Communities durchsuchen (Marketing/Entdeckung, read-only via `/api/public/*`) |
| 5 | **Plattform-Funktionen** (Marketing) | Statische Bausteine: Zertifikate, Rollen, Events, Stripe � plus Live-Teaser aus Suche |
| 6 | **Unser Ansatz** | Individuell, skalierbar, langfristige Betreuung |
| 7 | **Projektablauf** | 8 Schritte: Anfrage bis Betreuung |
| 8 | **Servicepakete** | Basis / Business / Premium (Inhalte, keine Festpreise auf Landing) |
| 9 | **Warum UNZE Business** | Planung, Technologie, Betreuung |
| 10 | **Referenzen / Vertrauen** | Spaeter: Cases; MVP: Prozess + Rechtliches |
| 11 | **FAQ** | Domain, Wartung, Zahlung, Hosting-Hinweis |
| 12 | **Anfrage-CTA** | Link zum Konfigurator |
| 13 | **Kontakt** | E-Mail, WhatsApp (manuell Phase 1), Formular |

### 2.3 SEO & Meta

- `title`: UNZE Business - Digitale Systeme & Plattformentwicklung
- Canonical: `https://www.unze.app/business`
- Kein Index von Studio-Interna; `robots` fuer kuenftige Studio-Domain: noindex

### 2.4 Community-Suche (Business)

| Aspekt | Festlegung |
|--------|------------|
| Komponente | `BusinessCommunitySearch` (lazy-loaded) |
| API | `GET /api/public/communities?search={q}&limit={n}` (Erweiterung bestehender Route) |
| Daten | Nur oeffentliche Connect-Felder (Name, Slug, Beschreibung, Kategorie, Teaser) |
| UX | Suchfeld + Ergebnisliste; Link zur Community-Vorschau `/community/[slug]` |
| Kein Zugriff auf | Private Communities, Mitgliederdaten, Studio-, Projekt- oder Kundendaten |

---

## 3. Komponenten (Frontend)

Eigenes Bundle unter `components/business/` - **getrennt** von `components/landing/` (Connect) und Plattform.

| Komponente | Beschreibung |
|------------|--------------|
| `BusinessShell` | Header/Footer Business-only (oder MarketingShell mit Business-Nav-Variante) |
| `BusinessHero` | Headline, Subline, dual CTA |
| `BusinessValueProp` | Technik-Versprechen |
| `BusinessServiceGrid` | Leistungskarten |
| `BusinessCommunitySearch` | Community-Suche (read-only, lazy-loaded, `/api/public/communities?search=`) |
| `BusinessPlatformFeatures` | Statische Feature-Matrix (Connect-Bausteine als Verkauf) |
| `BusinessProcessSteps` | Timeline Projektablauf |
| `BusinessServicePackages` | 3 Paket-Karten (Inhalt aus CMS/JSON) |
| `BusinessWhyUs` | USP-Liste |
| `BusinessFaq` | Accordion |
| `BusinessContactBar` | E-Mail, WhatsApp, CTA |
| `BusinessInquiryWizard` | **Projekt-Konfigurator** (mehrstufig) |
| `BusinessQuickInquiryForm` | Schnellanfrage (kurz) |
| `BusinessPriceHint` | Hinweis: Preisbereich = Orientierung, kein Festpreis |

**Performance:** Dynamic Import fuer `BusinessInquiryWizard`; keine Plattform-/Studio-Imports.

**Copy-Quelle:** `lib/constants/business-copy.ts` (neu, analog landing-copy).

---

## 4. Datenmodell

### 4.1 Grundsatz (gemeinsame Supabase, logische Trennung)

- **Eine Supabase-Produktions-DB** � bestehende Infrastruktur bleibt
- **Connect (`public`):** Unveraendert fuer Plattform; Business/Studio schreiben **nicht** in Connect-Tabellen
- **Schema `business`:** Anfragen, Konfigurator, Leads, oeffentliche Paket-Metadaten
- **Schema `studio`:** Projekte, Kunden, Angebote, Rechnungen, Module, �
- **Schema `studio_auth`:** Studio-Nutzer, Rollen, Sessions (getrennt von Connect-Auth)
- **RLS:** Studio-Tabellen nur fuer authentifizierte Studio-Rollen; Business-Inquiries via Service Role/API
- **Landing read-only:** Oeffentliche Connect-Daten nur ueber `/api/public/*` (bestehend + `?search=`)

Keine Vermischung von Projekt-/Kunden-/Verwaltungsdaten auf der oeffentlichen Landing.

### 4.2 Entitaeten Business (Landing + API)

```
business_inquiries          -- Rohanfrage (Schnell + Konfigurator)
business_inquiry_answers    -- Modulare Antworten (JSON oder normalisiert)
business_project_types      -- Katalog: Webseite, Community-Plattform, KI, �
business_project_type_questions  -- Fragen pro Typ (modular)
business_service_packages   -- Basis / Business / Premium (Marketing + Studio)
business_module_catalog     -- Wiederverwendbare Bausteine (Login, Stripe, Events, �)
business_module_weights     -- Punktesystem fuer Analyse (Studio)
business_leads              -- Optional: Marketing-Attribution
```

### 4.3 Entitaeten Studio (intern, Anbindung)

```
studio_clients              -- Kundenakte (aus Anfrage befuellt)
studio_client_history       -- Aggregierte Kundenhistorie (Views/Events)
studio_projects             -- Projekt mit Status-Lifecycle
studio_project_analyses     -- Kernmodul: Analyse-Ergebnis
studio_project_phases       -- Empfohlene / genehmigte Phasen
studio_quotes               -- Angebotsentwuerfe + Versionen
studio_quote_line_items
studio_invoices             -- Rechnungen (Anzahlung, Schluss, Wartung)
studio_invoice_payments     -- Stripe Business (eigener Account)
studio_change_orders        -- Aenderungsauftraege
studio_documents            -- PDFs, Vertraege, Uebergaben
studio_service_contracts    -- Laufende Pakete pro Kunde
studio_service_packages     -- Zentrale Paketdefinition (Leistungen, SLAs)
studio_price_templates      -- Preisempfehlungen und Regelwerke (keine Festpreislisten)
studio_price_rules          -- Regelbasierte Empfehlungen
studio_module_library       -- Modulbibliothek (wachsend)
studio_module_reuse_log     -- Wiederverwendung pro Projekt
studio_knowledge_entries    -- Wissensdatenbank aus abgeschlossenen Projekten
studio_domains              -- Kunden-Domains
studio_hosting              -- Hostingverwaltung (externe Anbieter)
studio_deployments          -- Projekt-Deployments
studio_tasks                -- Interne Aufgaben pro Projekt
studio_communications       -- Kommunikationshistorie pro Kunde
studio_client_revenue       -- Gesamtumsatz-Aggregation pro Kunde
```

### 4.3b Entitaeten Studio-Auth (Schema `studio_auth`)

```
studio_users                -- Interne Nutzer (getrennt von Connect profiles)
studio_roles                -- super_admin, administrator, projektmanager, �
studio_user_roles           -- Zuordnung Nutzer ? Rolle
```

Bootstrap: Erster `studio_users`-Eintrag erhaelt automatisch `super_admin`.

### 4.4 Projekt-Status (Studio) � standardisierter Workflow

```
anfrage
  -> projektanalyse
  -> modulerkennung
  -> komplexitaetsbewertung
  -> preisbereich
  -> projektphasen
  -> angebotsentwurf_vorbereitet
  -> projektanlage
  -> manuelle_pruefung
  -> angebot_versendet
  -> angebot_angenommen
  -> anzahlung_eingegangen
  -> entwicklung
  -> schlussrechnung
  -> uebergabe
  -> abgeschlossen
  -> wartungsvertrag_aktiv (optional)
```

### 4.5 Kundenhistorie (automatisch)

Pro `studio_clients` werden verknuepft und aggregiert:

- Projekte, Angebote, Rechnungen, Wartungsvertraege, Aenderungsauftraege
- Kommunikation (`studio_communications`)
- Gesamtumsatz (`studio_client_revenue`)
- Verwendete Module (`studio_module_reuse_log`)

Kein separates CRM � Historie entsteht aus dem Produktionssystem.

### 4.6 Modul-Katalog (Wiederverwendbarkeit)

Jeder Konfigurator-Schritt und jede Analyse mappt auf `business_module_catalog`:

| Modul-ID | Beispiel | Gewicht (Punkte) | Connect-Parallele |
|----------|----------|------------------|-------------------|
| auth_login | Login-System | 10 | Connect Auth |
| community_core | Community | 30 | Connect Communities |
| events | Events | 20 | Connect Events |
| services | Services | 15 | Connect Services |
| credentials | Zertifikate/Auszeichnungen | 15 | Connect Badges |
| stripe_platform | Zahlungen | 20 | Connect Stripe |
| roles | Rollen/Moderation | 15 | Connect Rollen |

Neue Projekte **erweitern** den Katalog; Analyse wird mit der Zeit praeziser.

---

## 5. Anfrageformular

### 5.1 Zwei Einstiege

| Typ | Zielgruppe | Felder |
|-----|------------|--------|
| **Schnellanfrage** | Kleine Projekte | Name, Firma, E-Mail, Kurzbeschreibung, optional Budget-Rahmen |
| **Projekt-Konfigurator** | Groessere Vorhaben | Modulare Fragen je `project_type` |

### 5.2 Konfigurator-Logik

1. Kunde waehlt **Projektart** (Webseite, Community-Plattform, Web-App, KI/Automatisierung, �)
2. Dynamische Fragen (nur relevante Module)
3. Beispiel Community-Plattform:
   - Web-App oder Website?
   - Benutzerkonten? Gruppen? Events? Mitgliedschaften? Zahlungen? Rollen? Zertifikate? Mehrsprachigkeit?
4. Absenden ? Server-seitige **Projektanalyse** (synchron oder async Job)

### 5.3 Ausgabe an Kunde (Landing)

- Bestaetigung: �Anfrage eingegangen�
- Optional: **kein** verbindlicher Preis auf der Seite
- Text: �Wir melden uns mit Einschaetzung und naechsten Schritten�

### 5.4 Ausgabe intern (Studio-Vorbereitung)

JSON-Payload an Studio-Queue:

```json
{
  "inquiryId": "uuid",
  "projectType": "community_platform",
  "answers": { },
  "analysis": {
    "complexityScore": 7.8,
    "estimatedHoursMin": 120,
    "estimatedHoursMax": 160,
    "priceRangeMinEur": 7000,
    "priceRangeMaxEur": 9000,
    "recommendedModules": ["auth_login", "community_core", "events", "credentials"],
    "risks": [],
    "openQuestions": []
  },
  "clientDraft": { "company", "email", "contactName" }
}
```

**Preisbereich = Orientierung** - explizit kein Festpreis, keine rechtsverbindliche Offerte auf der Landing.

### 5.5 API (Business, oeffentlich schreibend)

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/business/inquiries/quick` | POST | Schnellanfrage |
| `/api/business/inquiries/configure` | POST | Konfigurator + Analyse |
| `/api/business/project-types` | GET | Katalog Fragen (Cache) |
| `/api/business/packages` | GET | Servicepakete (Marketing) |
| `/api/public/communities?search=` | GET | Community-Suche (read-only, bestehend erweitern) |

Rate-Limiting, Honeypot, optional Turnstile. **Keine** Connect-Session erforderlich.

---

## 6. Studio-Anbindung

### 6.1 Architektur

```
[Business Landing] --POST--> [Business API] --event--> [Studio Ingest]
                                                      ?
                                            Projektanalyse + Entwuerfe
                                                      ?
                                            [Studio UI - intern only]
```

- Landing ruft **niemals** Studio-UI oder Studio-DB direkt vom Browser auf.
- Ingest: Webhook, Supabase Edge Function, oder Queue (Phase 1: synchroner Server-Call mit Service-Role Studio-Schema).

### 6.2 Kernworkflow (Studio Produktionssystem)

Entspricht dem verbindlichen Workflow in `docs/THREE_PRODUCT_ARCHITECTURE.md`:

```
Anfrage (Business)
  -> Projektanalyse (automatisch)
  -> Modulerkennung + Komplexitaet + Preisbereich + Phasen
  -> Angebotsentwurf (vorbefuellt)
  -> Projektanlage
  -> Manuelle Pruefung durch Bearbeiter
  -> Angebot versenden
  -> Anzahlung (Stripe Business)
  -> Entwicklung
  -> Schlussrechnung
  -> Uebergabe
  -> Optional: Wartungsvertrag
```

Studio ist **kein CRM**: Fokus Produktion, Analyse, Angebote, Lieferung.

### 6.3 Studio-Login und Admin-Zugang

| Aspekt | Festlegung |
|--------|------------|
| Einstieg | `/admin` oder `/studio/login` � separater Login, kein oeffentliches Studio |
| Nach Login | Direkter Redirect in UNZE Studio (`/studio/app` o. a. geschuetzte Route) |
| Erster Nutzer | Automatisch **Super Admin** (Bootstrap in `studio_auth`) |
| Weitere Rollen | Spaeter: Administrator, Projektmanager, Entwickler, Designer, Buchhaltung |
| Auth | Getrennt von Connect-Endnutzer-Auth; Schema `studio_auth` |
| Sicherheit | Alle `/api/studio/*` und Studio-UI nur mit gueltiger Studio-Session |
| Oeffentlich | Keine Studio-Funktionen, keine Projekt-/Kunden-/Verwaltungsdaten auf der Landing |

### 6.4 Login (technisch)

- Separater Auth-Flow (Supabase Auth mit Studio-Rolle oder dedizierte `studio_users`-Tabelle)
- Kein gemeinsamer Login mit Connect-Endnutzern
- Middleware: Studio-Routen blockieren ohne Session; Marketing-Routen laden keine Studio-Komponenten

---

## 7. Servicepakete

### 7.1 Marketing (Landing)

Drei Stufen - **Inhalte**, keine harten Preise auf der Website (optional �ab X EUR� spaeter):

| Paket | Inhalt (Beispiel) |
|-------|-------------------|
| **Basis** | Sicherheitsupdates, kleine Fixes, E-Mail-Support |
| **Business** | Prioritaet, verguenstigte Aenderungen, regelmaessige Inhaltsupdates |
| **Premium** | Hoechste Prioritaet, Beratung, Optimierungen, Stundenkontingent |

Hinweis Hosting: Einrichtung/Verwaltung bei externen Anbietern - UNZE Business stellt nicht die Infrastruktur selbst bereit.

### 7.2 Studio (operativ)

- `studio_service_contracts` verknuepft Kunde + Paket + Konditionen
- Preisvorlagen fuer Aenderungsauftraege je Paketstufe (interne Tabelle)
- Bei Angebotserstellung: Paket-Konditionen automatisch beruecksichtigen

---

## 8. Angebotsworkflow

| Schritt | Ort | Aktion |
|---------|-----|--------|
| 1 | Business Landing | Anfrage + Analyse-Vorlage |
| 2 | Studio | Analyse pruefen, Preisbereich anpassen |
| 3 | Studio | Angebotsentwurf generieren (PDF/HTML) |
| 4 | Studio / E-Mail | Versand an Kunde |
| 5 | Kunde | Annahme (Link oder Unterschrift Phase 2) |
| 6 | Studio | Status ? `angebot_angenommen` |
| 7 | Stripe Business | Anzahlungslink |
| 8 | Studio | Projektstart nach Zahlungseingang |

Angebots-PDF: Firmendaten aus **einmal** erfasster Kundenakte.

---

## 9. Rechnungsworkflow

**Strikt getrennt von UNZE Connect:**

| Typ | System | Stripe |
|-----|--------|--------|
| Anzahlung / Schlussrechnung / Wartung | UNZE Business / Studio | Stripe Business Account |
| Community-Abo / Tickets / Creator | UNZE Connect | Stripe Connect |

Workflow:

1. Meilenstein oder Projektabschluss in Studio
2. Rechnung aus Angebot + Vertrag generieren
3. Zahlungslink (Stripe Checkout Business)
4. Webhook ? `studio_invoice_payments` ? Projektstatus aktualisieren

Keine gemeinsame Rechnungstabelle mit Connect-Mitgliedschaften.

---

## 10. Technische Architektur (Gesamt)

```
www.unze.app (Next.js � gemeinsames Deployment, getrennte Bundles)
??? Connect-Marketing     ?  /api/public/*     ?  Supabase public (read-only)
??? UNZE Business         ?  /api/business/*   ?  Supabase business (write)
?                            /api/public/*     ?  Community-Suche (read-only)
??? Studio-Login          ?  /admin            ?  studio_auth
??? UNZE Studio (intern)  ?  /api/studio/*     ?  Supabase studio (auth required)

www.unzeconnect.app       ?  Volle Connect-Plattform (unveraendert)

Supabase (eine Produktions-DB)
??? public        Connect-Daten
??? business      Anfragen, Konfigurator
??? studio        Projekte, Kunden, Angebote, �
??? studio_auth   Studio-Nutzer, Rollen
```

### Regeln

- Business-Bundle laedt keine Connect-Dashboard- oder Studio-Komponenten
- Connect-Performance unberuehrt (eigenes Bundle, gecachte read-only API)
- Business-API: eigener Namespace, eigenes Caching
- Studio-UI nur nach Login; keine oeffentlichen Studio-Endpunkte
- Zahlungslogik Connect vs. Business strikt getrennt

### Migration Ist ? Soll

| Heute | Soll |
|-------|------|
| `/business` Manus Community-Text | Business Agentur-Landing (dieser Plan) |
| `/studio` oeffentlich | Redirect `/business` oder 404; Studio nur intern |
| Nav �UNZE Studio� | Nav �UNZE Business� oder �Projekte� |
| `BUSINESS_CONTENT` legal | Erweitern um Agentur-Leistungen |

---

## 11. Implementierungsphasen

| Phase | Inhalt | Abhaengigkeit |
|-------|--------|---------------|
| **P0** | DB-Schema `business`/`studio`/`studio_auth` in bestehender Supabase | Architektur freigegeben |
| **P1** | Business Landing UI + Community-Suche | P0 |
| **P2** | Schnellanfrage + API + E-Mail-Benachrichtigung | P1 |
| **P3** | Modul-Katalog + Konfigurator + serverseitige Analyse (Regelwerk) | P2 |
| **P4** | Studio-Login (Super Admin Bootstrap) + Ingest + Projektanlage + Analyse-UI | P3 |
| **P5** | Angebotsentwurf + PDF + Stripe Business Anzahlung | P4 |
| **P6** | Rechnungen + Servicevertraege + Aenderungsauftraege + Kundenhistorie | P5 |
| **P7** | Wissensdatenbank + Modul-Lernen aus abgeschlossenen Projekten | P6 |

**Explizit nicht in P1-P3:** WhatsApp API, KI-Telefon, neue Community-Marketing-Features.

---

## 12. Qualitaetskriterien (Acceptance)

- [ ] Drei Produkte in Doku, UI und URLs konsistent benannt
- [ ] Kein oeffentlicher Studio-Zugang
- [ ] Business-Formular erzeugt analysierbare Studio-Payload
- [ ] Preisbereich nie als Festpreis dargestellt
- [ ] Connect- und Business-Stripe getrennt
- [ ] Plattform-Funktionen (Zertifikate etc.) nur als **Verkaufs-Bausteine** auf Business
- [ ] Lighthouse Business-Seite >= Ist-Connect-Niveau, Bundle getrennt
- [ ] Community-Suche nutzt nur `/api/public/*` (read-only)
- [ ] Studio nur nach Login erreichbar; erster Nutzer = Super Admin
- [ ] Keine Projekt-/Kunden-/Verwaltungsdaten auf oeffentlicher Landing
- [ ] Gleiche Supabase-Infrastruktur, logische Schema-Trennung
- [ ] Jede neue Studio-Funktion: Wiederverwendbarkeits-Check dokumentiert

---

## 13. Offene Detailentscheidungen (nur Umsetzungsdetails, keine Architektur)

1. One-Pager vs. Multi-Page Business?
2. Studio-Login-Pfad: `/admin` vs. `/studio/login`?
3. Studio-UI-Pfad nach Login: `/studio/app` vs. `/admin/dashboard`?
4. Analyse Phase 1: Regelwerk vs. KI-Unterstuetzung (Regelwerk empfohlen fuer P3)?
5. Paketpreise auf Landing: gar nicht vs. �ab �� bei Paketen?

(Hinweis: Separate Supabase-Instanz ist **nicht** vorgesehen � logische Trennung in bestehender DB.)

---

## 14. Referenzen

- **`docs/THREE_PRODUCT_ARCHITECTURE.md`** (verbindlich)
- `docs/migration/CHATGPT_BUSINESS_STRATEGIE_ANALYSE.md`
- `docs/migration/PRE_LANDING_ANALYSIS_PHASE.md`
- `docs/migration/FINAL_DOMAIN_ARCHITECTURE_REPORT.md`
- `lib/constants/site.ts` (Routing-Anpassung `/studio` bei Launch)

---

**Naechster Schritt:** P0 � SQL-Schema `business`/`studio` + Wireframe-Spezifikation `/business`.
