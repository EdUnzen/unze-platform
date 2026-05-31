# UNZE — Finalisierte Plattformstruktur (Phase 1)

> Referenzdokument für Navigation, Entitäten und technische Prioritäten.
> Stand: Phase-1-Konsolidierung nach Pivot weg vom Social-Media-Feed.

## Grundprinzip

UNZE ist **keine** Social-Media-Plattform.

UNZE ist ein **Verzeichnis-, Community-, Gruppen-, Bewertungs-, Event- und Monetarisierungssystem** zur Verwaltung, Verifizierung, Bewertung und Monetarisierung von Communities, Gruppen, Events und Dienstleistungen.

## Globale Entscheidungen

| Entfernt / deaktiviert | Beibehalten |
|------------------------|-------------|
| Globaler Feed | Bewertungen & Bewertungs-Kommentare |
| Beiträge, Likes, klassische Social-Mechaniken | Verifizierungen |
| | Plattform-Links (Discord, WhatsApp, Telegram, Website, YouTube, TikTok …) |

**Discover** dient ausschließlich der Entdeckung von Communities, Gruppen, Events und Dienstleistungen.

**Communities** sind die Haupteinheit. **Gruppen** sind die Untereinheit und wichtigste Monetarisierungskomponente.

## Navigation

```
Home | Discover | Erstellen | Favoriten | Profil
```

- **Erstellen** = zentraler Plus-Button (Community, Gruppe, Event …)
- **Favoriten** ersetzt „Folge ich“ und kann enthalten: Communities, Gruppen, Events, Dienstleistungen

## Bereiche

### Home — persönlicher Verwaltungsbereich

- Meine Communities
- Meine Gruppen
- Meine Events
- Benachrichtigungen
- Offene Anträge

### Discover — Entdeckung

Tabs: **Communities | Gruppen | Events | Dienstleistungen** (kein Feed)

### Community-Seite

Coverbild · Beschreibung · Verifizierung · Bewertungen · Bewertungs-Kommentare · Plattformen & Links · Gruppen · Events · Antrag stellen · Favorit setzen

### Gruppen-Seite

Bild · Beschreibung · Preis · Mitgliederzahl · Bewertungen · Bewertungs-Kommentare · Rollen · Antrag stellen · Favorit setzen

## Rollen (einfaches Modell)

| Rolle | Sichtbarkeit |
|-------|--------------|
| Creator | Community & Gruppe |
| Admin | Community & Gruppe |
| Experte / Coach | Community & Gruppe |
| Mitglied | Community & Gruppe |

Der Creator kann Rollen vergeben.

## Events

Eigenes Bild · Beschreibung · Datum/Uhrzeit · optional kostenpflichtig · favorisierbar

Schema: `community_events` (Migration 022)

## Dienstleistungen

Modell über `community_groups.group_type = 'service'`:

- Kostenlos
- Einmalig kostenpflichtig
- Abonnementbasiert

## Monetarisierung

Stripe ist führende Instanz — keine eigene komplexe Zahlungslogik.

| Modell | Status |
|--------|--------|
| Kostenlos | Vorbereitet |
| Einmalzahlung | Vorbereitet |
| Monatlich / Vierteljährlich / Halbjährlich / Jährlich | Stripe-Abos (Anzeige in UNZE) |

Stripe verwaltet: Abonnements, Kündigungen, Rechnungen, Zahlungsstatus, Verlängerungen. UNZE zeigt Informationen an.

### Kündigungen

1. Kündigung → Stripe
2. Stripe verwaltet Subscription
3. UNZE zeigt Status + Enddatum
4. Creator sieht Kündigungen im Dashboard

## Nutzerprofil (Zielbild)

| Bereich | Phase-1-Status |
|---------|----------------|
| Mitgliedschaften | Daten vorhanden, UI teilweise |
| Aktive Abos / Kündigungsstatus / Rechnungen / Stripe-Portal | Stripe-Integration unvollständig |
| Meine Bewertungen | Daten vorhanden, UI fehlt |
| Meine Kommentare | Daten vorhanden, UI fehlt |
| Meine Rollen | Daten vorhanden, UI fehlt |

Siehe auch: `docs/sprints/PROFILE_AND_FAVORITES_AUDIT.md`

## Creator Dashboard (Zielbild)

| Modul | Metriken |
|-------|----------|
| Mitglieder | Aktiv, Neu, Kündigungen |
| Gruppen | Mitglieder pro Gruppe, kostenpflichtige Gruppen |
| Events | Teilnehmer, Umsätze |
| Dienstleistungen | Buchungen, Umsätze |
| Einnahmen | Monatlicher Umsatz, Stripe-Status |
| Anträge | Offen, Genehmigt, Abgelehnt |

## Technische Priorität (Phase 1)

1. **Discover reparieren** — HTTP 500 durch `unstable_cache` + `cookies()` behoben
2. Migrationen **021** (Feature-Flags) und **022** (Events, Gruppen-Typen, Reviews) in Supabase ausführen
3. Manuelles Testing aller Discover-Tabs
4. Erst danach: Profil-Sektionen, Event-Favoriten, Stripe-Dashboard

### Migrationen

```text
database/migrations/021_platform_feature_flags.sql
database/migrations/022_platform_core_entities.sql
```

Alternativ: `database/BUNDLE_all_migrations.sql` (enthält 001–022, ohne 003 seed)

### Discover-Diagnose

- `getPlatformMigrationStatus()` prüft 021/022-Tabellen
- Warnbanner auf `/discover` wenn Migrationen fehlen
- Fallback in Discover-Services wenn `group_type` noch nicht existiert

## Verwandte Dokumente

- `docs/sprints/PHASE1_PLATFORM_PIVOT.md`
- `docs/sprints/PHASE2_GROUPS_REVIEWS.md`
- `docs/sprints/PROFILE_AND_FAVORITES_AUDIT.md`
- `docs/ARCHITECTURE_DECISIONS.md`
