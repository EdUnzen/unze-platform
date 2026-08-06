# Analyse: ChatGPT �Unzer Business Strategie�

**Quelle:** https://chatgpt.com/share/6a37ec03-d05c-83eb-bfbf-abd303604e09  
**Status:** Ausgewertet (Juni 2026) � **keine Umsetzung**, nur Konzept  
**Hinweis:** Titel �Unzer� = Tippfehler; gemeint ist **UNZE**

---

## 1. Kernerkenntnis: Drei-Produkte-Architektur

Der Referenz-Chat definiert eine **klare Dreiteilung** � wichtiger als die bisherige Studio-vs.-Business-Debatte:

| Marke / System | Rolle | �ffentlich? | Domain (Ist/Soll) |
|----------------|-------|-------------|-------------------|
| **UNZE Connect** | Plattformprodukt (Communities, Events, Services, Stripe, Creator) | Ja (App) | www.unzeconnect.app |
| **UNZE Business** | Agentur / Vertrieb / Kundenanfragen / Leistungen | Ja (Landing) | www.unze.app (Business-Bereich) |
| **UNZE Studio** | Internes Betriebs- & Verwaltungssystem | **Nein � niemals �ffentlich** | Separater Login, eigene App sp�ter |

Zitat aus dem Chat:

> UNZE Business ist die Au�enwirkung und der Vertrieb.  
> UNZE Studio ist dein internes Betriebssystem.  
> UNZE Connect ist das eigenst�ndige Plattformprodukt.

**Konsequenz f�r die Namensfrage:** Beide Namen haben **unterschiedliche Rollen** � keine Either/Or-Entscheidung:

- **UNZE Business** = �ffentliche Kunden-Website (Agentur, Hosting-Verwaltung, Projektanfragen)
- **UNZE Studio** = intern (CRM, Projekte, Angebote, Rechnungen) � **nicht** als Marketing-Label auf der Landingpage

---

## 2. Abgleich mit aktuellem technischen Stand

| Referenz-Chat | Aktueller Stand (Cursor/Vercel) | Bewertung |
|---------------|----------------------------------|-----------|
| Connect getrennt | unzeconnect.app = Plattform | Passt |
| Business = �ffentlich | `/business` existiert (Manus-Fokus: Community-Monetarisierung) | **Inhaltlich abweichend** � Chat meint Agentur/Web/KI |
| Studio = intern | `/studio` ist **�ffentliche** Marketing-Seite + Nav-Link | **Widerspruch** � vor finaler Landing kl�ren |
| Landing = Verkauf + Vertrauen | unze.app = Community-Verzeichnis (Connect-Marketing) | **Zwei Landing-Ziele** � siehe Abschnitt 4 |
| Zahlungen Connect vs. Business getrennt | Stripe auf Plattform; Business noch ohne eigenes Zahlungsmodell | Passt langfristig |
| Gleiche DB Connect | Eine Supabase-DB, Marketing read-only | Passt (Business-CRM sp�ter eigene Struktur laut Architekturvorgabe) |

---

## 3. UNZE Business � geplante Landing-Struktur (aus Chat, sp�ter umsetzen)

Fokus laut Chat: **nur verkaufen und Vertrauen schaffen**, nicht das interne Studio erkl�ren.

### Empfohlene Sektionen

1. **Hero** � �Digitale Systeme, die Zeit sparen, Prozesse automatisieren, Gesch�ftsmodelle erm�glichen� + CTAs �Projekt anfragen� / �Leistungen entdecken�
2. **Was wir entwickeln** � Webseiten, Web-Apps, Community-Plattformen, KI/Automatisierung, Unternehmenssysteme, Templates
3. **Unser Ansatz** � individuell, keine Bauk�sten, langfristige Zusammenarbeit
4. **Projektablauf** � Anfrage ? Erstgespr�ch ? Konzept ? Angebot ? Umsetzung ? Test ? �bergabe ? Betreuung
5. **Servicepakete** � Basis / Business / Premium (Wartung, Priorit�t, Stundenkontingent)
6. **Warum UNZE Business** � Planung, Technologie, Skalierung, Betreuung
7. **Anfrageformular** � Schnellanfrage + **Projekt-Konfigurator** (modular, projektart-abh�ngig)
8. **FAQ** � Domain, Wartung, Zahlung, �bernahme bestehender Sites
9. **Kontakt** � WhatsApp, E-Mail, Formular

### Zentrale Botschaft (Mehrwert laut Chat)

> �Wir k�mmern uns um die Technik, damit sich unsere Kunden auf ihr Unternehmen konzentrieren k�nnen.�

Hosting-Kommunikation: UNZE Business **stellt Infrastruktur nicht selbst bereit**, �bernimmt Einrichtung/Verwaltung bei externen Anbietern.

---

## 4. Spannungsfeld: Zwei Landing-Aufgaben auf www.unze.app

**Migration (Ist):** www.unze.app = Connect-Marketing (Community-Verzeichnis, Events, Services-Vorschau)

**Business-Chat (Soll):** www.unze.app = Agentur-Landing (Projektanfragen, Leistungen)

### M�gliche L�sungen (entscheidungsoffen)

| Option | Beschreibung |
|--------|--------------|
| **A � Pfad-Trennung** | `/` + `/communities` = Connect-Schaufenster; `/business` = Agentur (Chat-Struktur) |
| **B � Subdomain sp�ter** | business.unze.app oder studio nur intern |
| **C � Umbrella-Home** | Startseite vereint beide Einstiege (�Community finden� vs. �Projekt anfragen�) |

**Empfehlung (vorl�ufig):** Option A � passt zur bestehenden Architektur und dem Chat. `/studio` in der **�ffentlichen** Navigation durch **UNZE Business** ersetzen, wenn Business-Landing kommt; **UNZE Studio** nur intern kommunizieren.

---

## 5. UNZE Studio (intern � aus Chat, nicht Landing)

Geplante Module (sp�ter, separates Produkt):

- Dashboard, Kunden, Projekte, Aufgaben, Angebote, Rechnungen
- Domains, Hosting, Git, Deployments, Dokumente
- Servicepakete, Wissensdatenbank, Zeiterfassung
- Projekt-Analyse & Angebotsassistent (Preisbereiche, nicht fix)
- Preisvorlagen statt Festpreise
- �Jede Information nur einmal erfassen�

Phasen: MVP ? Komfort ? Integrationen (WhatsApp API sp�ter optional)

**Wichtig:** Separater Login, darf nicht mit Connect verwechselt werden.

---

## 6. Zahlungsstr�me (strikt trennen)

| Strom | System | Beispiele |
|-------|--------|-----------|
| Plattform | UNZE Connect | Community-Abos, Tickets, Creator-Auszahlungen, Plattformgeb�hr |
| Agentur | UNZE Business | Angebote, Anzahlungen, Schlussrechnungen, Wartung, �nderungsauftr�ge |

Keine Vermischung in UI, Stripe-Accounts oder Rechnungslogik.

---

## 7. Erweiterte Produktvision (Chat)

- **UNZE Templates** � wiederverwendbare Bausteine (Corsa)
- **UNZE Labs** � Experimente/Prototypen (optional)
- **Architektur-Freeze** � Grundstruktur festlegen, dann nur Module erg�nzen

---

## 8. Auszeichnungen / Zertifikate (User-Korrektur + Chat)

- Geh�ren **Nutzern**, Community **vergibt**
- Landing (Connect): nur Teaser �In dieser Community kann man Auszeichnungen erwerben�
- Nicht: Community besitzt Zertifikate; keine User-Profile auf Marketing

---

## 9. Priorit�ten f�r sp�tere Umsetzung (Vorschlag, nicht final)

### Phase 0 � Konzept (jetzt)

- [x] Technische Trennung Connect/Landing
- [x] Referenz-Chat auswerten
- [ ] User-Freigabe Drei-Produkte-Modell
- [ ] Kl�rung `/studio` �ffentlich vs. Studio intern
- [ ] Pfad-Strategie unze.app (Connect vs. Business)

### Phase 1 � Business-Landing (nach Freigabe)

- Hero, Leistungen, Ablauf, Pakete, FAQ, Anfrageformular (ohne Studio-Exposure)
- Rechtliches Fundament (AGB-Leistungen, AVV-Hinweise)

### Phase 2 � Connect-Landing Upgrade

- Hochwertigeres Verzeichnis, Suche, Filter, Detailseiten (bestehende Architektur)

### Phase 3 � UNZE Studio (separates Projekt)

- Internes System, eigene Domain/Login, Anbindung Business-Anfragen

---

## 10. Offene Entscheidungen (noch nicht treffen)

1. �ffentliche Route `/studio` umbenennen/entfernen zugunsten `/business`?
2. Startseite `/`: Connect-first, Business-first oder Dual-Hero?
3. Wann Projekt-Konfigurator (eigene DB vs. Formular-Service)?
4. UNZE Labs / Templates auf Landing erw�hnen oder verstecken bis ready?

---

## 11. Performance-Constraints (unver�ndert)

- Landing: nur `lib/marketing/*` + `/api/public/*`
- Kein Studio-, Dashboard-, Stripe-Code im Marketing-Bundle
- Connect-Performance nicht beeintr�chtigen

---

*Bereit f�r n�chsten Referenz-Input oder Freigabe zur Umsetzungsplanung.*
