# UNZE - Analyse- und Vorbereitungsphase (vor finaler Landingpage)

Stand: Juni 2026  
Status: **Abgeschlossen � ersetzt durch `docs/THREE_PRODUCT_ARCHITECTURE.md` f�r Produktgrenzen**

Die Analysephase ist beendet. Die Drei-Produkte-Architektur ist freigegeben. Umsetzung erfolgt gem�ss Implementation Plan.

---

## 1. Bestaetigter technischer Stand (unveraendert lassen)

| Bereich | Status |
|---------|--------|
| www.unze.app | Landingpage, read-only, oeffentliche API |
| www.unzeconnect.app | Volle Plattform |
| Routing / Cross-Domain | Live, verifiziert |
| Performance-Trennung | Dynamic Imports, getrennte Shells/Bundles |
| Supabase | Eine Produktions-DB, keine Schema-Aenderung fuer Landing |

**Regel fuer alle kuenftigen Landing-Arbeiten:** Keine Dashboard-, Creator-, Stripe- oder Auth-Logik auf der Marketing-Domain. Nur `/api/public/*` bzw. `lib/marketing/*`.

---

## 2. Offene Design-/Produktarbeit (spaeter, nicht jetzt)

Folgende Bereiche sind bewusst **Platzhalter/Grundlage** und sollen spaeter hochwertig ueberarbeitet werden:

- Community-Verzeichnis (`/communities`)
- Community-Detailvorschau (`/community/[slug]`)
- Events (`/events`)
- Services (`/services`)
- Studio/Business-Bereich
- Suche & Filter
- Karten, Bilder, Hero, Statistiken, UX

**Aktuelle Anweisung:** Noch nicht mit Umsetzung beginnen.

---

## 3. Auszeichnungen & Zertifikate (Konzept-Korrektur)

### Fachlich korrekt

- **Auszeichnungen/Zertifikate gehoeren den Nutzern** (Empfaenger)
- **Communities vergeben** sie (Issuer-Kontext)
- Landingpage darf nur kommunizieren: *�In dieser Community kann man Auszeichnungen/Zertifikate erwerben�*
- **Nicht** darstellen als Community-Besitz oder Community-Asset-Liste ohne Nutzerbezug

### Aktueller Code (Hinweis fuer spaetere Ueberarbeitung)

`MarketingCommunityPreview` zeigt derzeit oeffentliche Badge-/Credential-Namen der Community (Aggregat �X verliehen�). Das ist als **Teaser** vertretbar, muss aber in der finalen UX klar formuliert werden:

- Formulierung: �Mitglieder koennen Auszeichnungen erhalten�
- Keine User-Profile, keine Einzelvergabe-Listen auf der Landingpage
- Keine Dashboard-Verwaltungs-UI

---

## 4. Namensanalyse: UNZE Studio vs. UNZE Business

### Kurzfassung (vorlaeufig, keine Entscheidung)

| Kriterium | UNZE Business | UNZE Studio |
|-----------|---------------|-------------|
| B2B / Unternehmenskunden | **Stark** - etabliert, klar | Schwaecher - klingt eher kreativ |
| Agentur / Projektanfragen | Gut | Gut bis sehr gut |
| Webseiten & Hosting | Gut | Neutral bis gut |
| KI-Loesungen | Neutral | **Stark** - �Studio� impliziert Produktion/Werkstatt |
| Servicepakete | **Stark** | Mittel |
| Vertrauen / Serioesitaet (DACH B2B) | **Hoeher** | Moderner, weniger formal |
| Abgrenzung zur Community-Plattform | Klar | Klar |
| Manus-Historie | Urspruenglich �UNZE Business� | Neu eingefuehrt |

### Detailbewertung

**UNZE Business**

- Pro: Sofort verstaendlich fuer Unternehmen, Einkauf, Hosting-Vertraege, SLAs
- Pro: Passt zu �Servicepakete�, �Projektanfrage�, �Unternehmenskunden�
- Contra: Kann mit �Business-Communities� auf der Plattform verwechselt werden (Kategorie vs. Produktlinie)
- Contra: Weniger emotional/modern fuer Creator-nahe Agenturleistungen

**UNZE Studio**

- Pro: Modern, hochwertig, passt zu Webdesign, Branding, KI-Content, �Wir bauen etwas�
- Pro: Emotionaler, weniger �Software-B2B�
- Contra: Fuer reines Hosting/Enterprise weniger praezise
- Contra: Doppeldeutig (Studio als Produkt vs. Creator-Studio)

### Alternative Namensoptionen (nur zur Diskussion)

| Name | Einschaetzung |
|------|----------------|
| **UNZE Business** | B2B-Standard, Hosting, Pakete |
| **UNZE Studio** | Agentur, Design, KI, kreative Services |
| **UNZE Solutions** | Enterprise/IT, breiter, weniger emotional |
| **UNZE Agency** | Klar agentur, weniger Plattform-Brand-Fit |
| **UNZE Pro** | Upsell zur Plattform, nicht ideal fuer externe Kunden |
| **Zwei Markenlinien** | Business (Hosting/Pakete) + Studio (Agentur/KI) unter einem Dach |

### Vorlaeufige Empfehlung (entscheidungsoffen)

- Wenn **ein** Name fuer alles: **UNZE Business** fuer Gesamt-B2B (Hosting, Pakete, Unternehmen); **UNZE Studio** als Unterbereich fuer Agentur/KI/Design.
- Wenn **emotionale Landing** + Creator: Studio staerker im Hero, Business im Footer/Enterprise-Bereich.
- **Entscheidung erst nach** dem naechsten ChatGPT-Referenz-Chat (Business-Anforderungen).

### Aktueller Code-Konflikt (nur dokumentiert)

- `/business` - UNZE Business (Manus-Original, Community-Monetarisierung-Fokus im Copy)
- `/studio` - UNZE Studio (neu, verweist auf Business-Features)
- Navigation/Footer: �UNZE Studio�
- **Keine Aenderung jetzt** - Konsolidierung in der Konzeptphase.

---

## 5. Zielbild Landingpage (spaeter)

Emotional, vertrauenswuerdig, hochwertig - nicht nur Informationsliste.

| Dimension | Heute (Grundlage) | Spaeter |
|-----------|-------------------|---------|
| Hero | Manus-aehnlich, funktional | Groesser, emotionaler, staerkere Value Prop |
| Communities | Einfache Karten | Grossere Visuals, Filter, Suche |
| Detailseiten | Read-only Teaser | Storytelling, Social Proof, klare CTAs |
| Events/Services | Listen | Rich Cards, Kategorien, Featured |
| Business | Zwei Routen, unklar | Eine klare B2B-Story nach Namensentscheidung |
| Creator | Abschnitt vorhanden | Eigene Sektion mit Dashboard-Ansprache (Link only) |
| Vertrauen | Legal, Verifizierung | Cases, Zahlen, Testimonials (oeffentlich) |

---

## 6. Architektur-Constraints ( fuer jede kuenftige Phase)

```
Landing (unze.app)                    Plattform (unzeconnect.app)
----------------                      ---------------------------
/api/public/*                         Volle API + Actions
lib/marketing/public-client.ts        services/*, dashboard/*
MarketingShell                        PlatformShell + PWA
ISR revalidate 60                     Session, Stripe, Creator
Kein Bundle-Mix                       Kein Marketing-Font/Shell
```

---

## 7. Naechste Schritte (Workflow)

1. **Warten** auf weiteren ChatGPT-Referenz-Chat (Business-Konzept)
2. **Gesamtkonzept** zusammenfuehren: Manus-Basis + neue Anforderungen + Namensentscheidung
3. **Prioritaeten** festlegen (z. B. Verzeichnis vor Studio vor Suche)
4. **Finale Empfehlung** dokumentieren
5. **Erst dann** Umsetzung in Phasen (Design ? Komponenten ? Seiten ? QA)

---

## 8. Was in dieser Phase bewusst nicht passiert

- Keine finalen Designentscheidungen
- Keine Landingpage-Neuimplementierung
- Keine Business-Datenbank
- Keine Aenderung an Plattform-Performance-Architektur
- Keine Umbenennung Studio/Business im Code

---

## 9. Referenz-Dateien (Ist-Zustand)

```
docs/migration/FINAL_DOMAIN_ARCHITECTURE_REPORT.md
docs/migration/ARCHITECTURE_LANDING_PLATFORM_SPLIT.md
lib/marketing/public-client.ts
lib/marketing/public-directory.service.ts
app/api/public/*
components/landing/*
app/studio/page.tsx
app/business/page.tsx
```

## 10. Externe Referenz: ChatGPT Unzer Business Strategie

**Link:** https://chatgpt.com/share/6a37ec03-d05c-83eb-bfbf-abd303604e09

**Status:** Ausgewertet - siehe CHATGPT_BUSINESS_STRATEGIE_ANALYSE.md

**Kernaussage:** Drei getrennte Marken - UNZE Connect (Plattform), UNZE Business (oeffentlicher Agentur-Vertrieb), UNZE Studio (intern, nie oeffentlich).

**Konflikt mit Ist-Stand:** Oeffentliche Route /studio und Nav UNZE Studio widersprechen dem Chat.

**Noch keine Entscheidung / keine Umsetzung.**

