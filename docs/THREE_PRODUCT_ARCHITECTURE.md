# UNZE � Verbindliche Drei-Produkte-Architektur

> **Status:** Freigegeben (Juni 2026)  
> **Vorrang:** Bei Konflikten mit �lteren Dokumenten gilt **dieses Dokument** f�r Produktgrenzen, Business und Studio.  
> **Connect-Plattformdetails:** weiterhin `docs/ARCHITECTURE_DECISIONS.md`

Ab diesem Punkt wird die grundlegende Systemtrennung **nicht mehr diskutiert**. Alle Umsetzung erfolgt innerhalb dieser Architektur.

---

## 1. Die drei Produkte (dauerhaft getrennt)

| Produkt | Rolle | �ffentlich | Domain |
|---------|--------|------------|--------|
| **UNZE Connect** | Plattform f�r Communities, Gruppen, Events, Services, Mitgliedschaften, Auszeichnungen und Plattform-Monetarisierung | Ja | `www.unzeconnect.app` |
| **UNZE Business** | �ffentliche Agentur- und Vertriebsseite f�r Kundenprojekte, digitale L�sungen und Projektanfragen | Ja | `www.unze.app/business` |
| **UNZE Studio** | Internes Produktions- und Betriebssystem | **Niemals** | Eigener gesch�tzter Bereich nach Login |

Die Trennung gilt **logisch und funktional** f�r:

- Frontend-Bundles und Routen
- API-Namespaces
- Daten (Schemas, RLS)
- Authentifizierung (getrennte Nutzerkreise)
- Zahlungslogik
- Sichtbarkeit (�ffentlich vs. intern)

---

## 2. Infrastruktur: Eine Supabase, logische Trennung

**Es wird kein vollst�ndig unabh�ngiges System aufgebaut.** Connect, Business und Studio nutzen die **bestehende Supabase-Produktionsinfrastruktur** mit **logisch getrennten Daten**.

### Verbindliche Regeln

| Regel | Bedeutung |
|-------|-----------|
| **Gemeinsame Infrastruktur** | Connect und Business d�rfen dieselbe technische Basis (Supabase, Vercel-Deployment) nutzen, sofern Daten logisch getrennt sind |
| **Connect-Daten lesend** | Landing und Business erhalten **ausschlie�lich lesenden** Zugriff auf **�ffentliche** Connect-Daten (z. B. Community-Infos f�r Marketing/Suche) |
| **Business/Studio-Daten** | Eigene Schemas `business` und `studio` � Business schreibt **nicht** in Connect-Tabellen |
| **Studio nie �ffentlich** | Studio-Funktionen sind **niemals** ohne Authentifizierung erreichbar |
| **Zahlungen getrennt** | Connect-Stripe und Business-Stripe bleiben vollst�ndig getrennt |
| **Performance** | Business darf Performance oder Funktionalit�t von Connect **nicht beeintr�chtigen** |

### Technische Schichten

```
???????????????????????????????????????????????????????????????
?  Supabase (bestehende Produktions-DB)                        ?
???????????????????????????????????????????????????????????????
?  public / connect     ?  �ffentliche Connect-Daten (RLS)     ?
?  business             ?  Anfragen, Konfigurator, Leads       ?
?  studio               ?  Projekte, Kunden, Angebote, �       ?
?  studio_auth          ?  Studio-Nutzer, Rollen (intern)      ?
???????????????????????????????????????????????????????????????
         ? read-only (public)              ? read/write (service role / Studio session)
         ?                                 ?
   Landing / Business                 UNZE Studio (nach Login)
```

### Was getrennt bleibt (trotz gemeinsamer Infrastruktur)

| Bereich | Connect | Business | Studio |
|---------|---------|----------|--------|
| Frontend-Bundle | Plattform | `components/business/*` | Gesch�tzte Studio-UI |
| API | Plattform-Routen | `/api/business/*`, `/api/public/*` (read) | `/api/studio/*` (auth) |
| Daten | `public` (Connect) | Schema `business` | Schema `studio` |
| Auth | Connect-Endnutzer | Keine Session f�r Anfrageformular n�tig | **Eigener Studio-Login** |
| Zahlungen | Stripe Connect | Stripe Business | Buchhaltungsanbindung |
| Sichtbarkeit | �ffentliche Plattform | �ffentliche Landing | Nur nach Login |

Connect bleibt ein eigenst�ndiges Produkt.  
Business bleibt eine eigenst�ndige Agentur.  
Studio bleibt das interne Betriebssystem.

---

## 3. �ffentliche Landing vs. Studio (Datentrennung)

Die �ffentliche Landingpage (Connect-Marketing und UNZE Business) bleibt **vollst�ndig** vom internen Studio getrennt.

| Auf der Landing (�ffentlich) | Nur im Studio (intern) |
|------------------------------|-------------------------|
| Marketing-Texte, Leistungen, Pakete | Kundenakten |
| Community-Suche (�ffentliche Connect-Daten) | Projektanalysen |
| Community-Teaser, Events-Vorschau | Angebote, Rechnungen |
| Projektanfrage-Formular (Eingabe) | Vertr�ge, Hosting, Deployments |
| Statische Plattform-Features | Kundenhistorie, Umsatz |

**Regel:** Projekt-, Kunden- und Verwaltungsdaten existieren ausschlie�lich im Studio. Die Landing zeigt sie nicht an und l�dt keine Studio-Komponenten.

---

## 4. Community-Suche (Business-Landing)

Auf der UNZE Business-Landingpage wird eine **Suchfunktion f�r Communities** erg�nzt.

| Aspekt | Festlegung |
|--------|------------|
| **Zweck** | Marketing und Entdeckung � zeigt, welche Plattformen existieren und was umsetzbar ist |
| **Datenquelle** | �ffentliche Connect-Daten (gleiche Quelle wie `/api/public/communities`) |
| **Zugriff** | **Nur lesend** � keine Schreib-, Admin- oder Studio-Operationen |
| **Anzeige** | Name, Beschreibung, Kategorie, ggf. Teaser-Stats � keine internen oder privaten Felder |
| **Technik** | `BusinessCommunitySearch` + Erweiterung `/api/public/communities?search=` |
| **Performance** | Eigenes lazy-loaded Bundle; gecachte API; kein Plattform-Dashboard-Import |

Die Suche dient **nicht** der Community-Verwaltung, sondern der **Vermarktung** von Connect als umsetzbare Plattform.

---

## 5. Studio-Zugang und Admin-Login

### Zugang

- Der **Admin-Bereich** wird �ber einen **separaten Login** ge�ffnet
- Nach erfolgreicher Anmeldung gelangt der Nutzer **direkt in UNZE Studio**
- Studio-Routen sind **ausschlie�lich nach Authentifizierung** erreichbar
- Kein �ffentlicher Link zu Studio-Funktionen; `/studio` auf der Marketing-Domain wird entfernt/redirectet

### Rollen (Studio-Auth, getrennt von Connect-Auth)

| Rolle | Phase | Rechte (Beispiel) |
|-------|-------|-------------------|
| **Super Admin** | Erster registrierter Studio-Nutzer (automatisch) | Vollzugriff, Rollenverwaltung |
| Administrator | Sp�ter | System, Nutzer, Einstellungen |
| Projektmanager | Sp�ter | Projekte, Angebote, Kunden |
| Entwickler | Sp�ter | Aufgaben, Deployments, Technik |
| Designer | Sp�ter | Dokumente, UI-Projekte |
| Buchhaltung | Sp�ter | Rechnungen, Zahlungen |

**Erster Studio-Nutzer = Super Admin** (Bootstrap-Regel). Weitere Rollen werden schrittweise erg�nzt.

### Auth-Trennung

- Connect-Auth: Plattform-Endnutzer (`www.unzeconnect.app`)
- Studio-Auth: Interne Mitarbeiter (`studio_users` / separates Auth-Profil)
- Kein gemeinsamer Login-Flow; Studio-Session berechtigt nicht zu Connect-Admin und umgekehrt

---

## 6. Standardisierter Projektworkflow

```
Anfrage
  ?
Projektanalyse
  ?
Modulerkennung
  ?
Komplexit�tsbewertung
  ?
Preisbereich
  ?
Projektphasen
  ?
automatisch vorbereiteter Angebotsentwurf
  ?
Projektanlage
  ?
manuelle Pr�fung
  ?
Angebot
  ?
Anzahlung
  ?
Entwicklung
  ?
Schlussrechnung
  ?
�bergabe
  ?
optional Wartungsvertrag
```

Die finale Entscheidung in jedem Schritt bleibt beim Bearbeiter.

---

## 7. Projektanalyse (Kernmodul des Studios)

Die Projektanalyse ist das **zentrale Modul** von UNZE Studio � kein CRM-Feature, sondern Produktionslogik.

### Automatische Erkennung

| Ausgabe | Beschreibung |
|---------|--------------|
| Projektart | Webseite, Plattform, App, KI, � |
| Ben�tigte Module | Aus Modulbibliothek |
| Gesch�tzte Entwicklungszeit | Stundenbereich |
| Preisbereich | Orientierung, kein Festpreis |
| Projektkomplexit�t | Score / Stufe |
| Risiken | Technisch, organisatorisch |
| Wiederverwendbarkeit | Vorhandene Module aus Bibliothek |
| Empfohlene Projektphasen | Meilensteine |
| Offene Fragen | An den Kunden |

Das Studio erstellt daraus automatisch einen **ersten Angebotsentwurf**. Der Bearbeiter pr�ft, passt an und gibt frei.

---

## 8. UNZE Studio (internes Produktionssystem)

UNZE Studio ist **kein klassisches CRM**. Es verwaltet u. a.:

Kunden, Projekte, Angebote, Rechnungen, Vertr�ge, Servicepakete, Projektanalyse, Modulbibliothek, Dokumente, Domains, Hostingverwaltung, Deployments, Aufgaben, Projektstatus, Preisvorlagen, Wissensdatenbank, Kundenhistorie.

### Kundenhistorie (automatisch)

Pro Kunde: Projekte, Angebote, Rechnungen, Wartungsvertr�ge, �nderungsauftr�ge, Kommunikation, Gesamtumsatz, verwendete Module.

---

## 9. Modulbibliothek

Jedes abgeschlossene Projekt **erweitert** den internen Modul-Katalog. Die Projektanalyse schl�gt Wiederverwendung vor.

**Wiederverwendbarkeits-Check (Pflicht):** Ist jede neue Funktion sp�ter f�r **alle** Kunden nutzbar?

---

## 10. Servicepakete und Preislogik

- Servicepakete zentral im Studio; auf der Landing nur marketingseitig
- **Keine starren Preislisten** � Preisempfehlungen und Regelwerke im Studio
- Bearbeiter kann jede Empfehlung anpassen
- Landing zeigt **keine Festpreise**

| Kontext | Stripe |
|---------|--------|
| Connect (Abo, Tickets, Creator) | Stripe Connect |
| Business (Projekt, Wartung) | Stripe Business |

---

## 11. UNZE Business Landingpage

Die Landingpage dient **ausschlie�lich der Vermarktung** plus:

- Digitale L�sungen, Webseiten, Apps, Plattformen, KI, Automatisierung
- Plattform-Bausteine (Zertifikate, Rollen, Events, Stripe) als **Produktmerkmale**
- **Community-Suche** (�ffentliche Connect-Daten, read-only)
- Servicepakete (Inhalte, keine Festpreise)
- Projektanfrage (Formular ? Business-API ? Studio-Ingest)

**Enth�lt nicht:** Studio-UI, interne Analyse, Kunden-/Projektdaten, Rechnungslogik.

Technisch: `components/business/*`, `/api/business/*`, Dynamic Import f�r Formular und Suche.

---

## 12. Auszeichnungen

| System | Rolle |
|--------|--------|
| **UNZE Connect** | Funktional: Vergabe, Verwaltung, Nutzer-Eigentum |
| **UNZE Business** | Marketing: zeigt umsetzbare Plattformfunktionen |

---

## 13. www.unze.app � Koexistenz

| Pfad | Produkt | Hinweis |
|------|---------|---------|
| `/`, `/communities`, `/events`, `/services` | Connect-Marketing | Read-only public API |
| `/business`, `/business/*` | UNZE Business | Inkl. Community-Suche |
| `/admin` oder `/studio/login` | Studio-Login | Nur Auth-Gateway, kein �ffentliches Studio |
| `/studio` (alt) | **Entfernen** | Redirect ? `/business` |

Navigation: Connect-Bereich und Business-Bereich visuell trennen.

---

## 14. Langfristiges Ziel

UNZE Studio entwickelt sich mit jedem abgeschlossenen Projekt weiter � **modulare Produktionsplattform**, keine Sammlung individueller Einzell�sungen.

**Fokus:** Qualit�t, Skalierbarkeit, Wiederverwendbarkeit, saubere Umsetzung innerhalb der freigegebenen Architektur.

---

## 15. Umsetzungsdokumente

| Dokument | Inhalt |
|----------|--------|
| `docs/migration/UNZE_BUSINESS_LANDING_IMPLEMENTATION_PLAN.md` | Seitenstruktur, Komponenten, Schema, Phasen |
| `docs/migration/FINAL_DOMAIN_ARCHITECTURE_REPORT.md` | Domain-Routing |
| `lib/constants/site.ts` | Marketing-/Plattform-Routing |

---

## 16. Implementierungsphasen (�berblick)

| Phase | Fokus |
|-------|--------|
| P0 | DB-Schema `business` / `studio` / `studio_auth` in bestehender Supabase |
| P1 | Business Landing UI + Community-Suche |
| P2 | Schnellanfrage + Business-API |
| P3 | Konfigurator + Regel-Analyse |
| P4 | Studio-Login (Super Admin Bootstrap) + Ingest + Projektanlage |
| P5 | Angebot + Stripe Business |
| P6 | Rechnungen + Servicevertr�ge |
| P7 | Wissensdatenbank + Modul-Lernen |

---

*Freigabe: Juni 2026 � Grundstruktur verbindlich. Erg�nzung: gemeinsame Supabase-Infrastruktur mit logischer Trennung.*
