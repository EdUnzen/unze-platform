# UNZE Platform Beta — User Journey (Demo)

Simulierte Test-Daten für die erste sichtbare Plattform-Beta ohne vollständigen Produktivbetrieb.

## Voraussetzungen

- `npm run dev` starten
- **Ohne Supabase** → Demo-Modus aktiv (automatisch)
- **Mit Supabase** → `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local` für Mock-Daten
- Für Bewerbungsflow: Account anlegen / anmelden

## Design-Referenz → UNZE-Struktur

| Referenz (Inspiration) | UNZE-Umsetzung |
|------------------------|----------------|
| Landingpage: Suche + Kategorien | `/discover` — SearchBar + Category-Pills |
| Community-Ansicht: Hero + Meta-Grid + Sidebar | `/community/[slug]` — Header, Details, Auf einen Blick, Join |
| App-Feed: Tabs + Cards | Discover Tabs: Communities / Feed / Trends / Neu / Creator |

## Vollständiger Demo-Flow

### 1. User entdeckt Community

1. Startseite `/` → **Discover** oder **Trending Communities**
2. `/discover` — Suche testen (z.B. „Fitness“)
3. Kategorie-Filter (z.B. Finanzen → Immobilien Investment Club)
4. Tab **Trends** / **Neu** / **Creator**

### 2. Community öffnen

Empfohlene Test-Communities:

| Slug | Szenario |
|------|----------|
| `creator-hub` | Manuelle Prüfung, Regeln, Warteliste |
| `fitness-mindset` | Privat, Alter + Upload-Felder |
| `immobilien-invest` | Premium, Nachweis-Upload, 79 € |
| `gaming-legends` | Sofort-Beitritt (auto_accept) |
| `dev-builders` | Pausiert / Warteliste |
| `elite-network` | Nur Einladung |

Sichtbar auf Detailseite:

- Header mit Sichtbarkeit, Verifikation, Premium
- Meta-Grid (Kategorie, Plattform, Beitritt, …)
- Regeln, Creator-Profil, Gruppen
- Sidebar: Auf einen Blick + Join-Panel

### 3. Bewerbung simulieren

1. Anmelden (Login erforderlich)
2. **Bewerbung starten** → Pflichtfelder ausfüllen
3. Upload-Felder: Dateiname wird simuliert (kein echter Storage im Demo)
4. **Absenden** → Status-Badge: Offen / Warteliste
5. **Benachrichtigungen** `/notifications` — „Bewerbung eingereicht“

### 4. Creator simulieren (Demo-Panel)

Auf der Community-Seite nach Bewerbung:

- **Annehmen** → Mitgliedschaft aktiv + Notification
- **Ablehnen** → Status Abgelehnt + Notification

### 5. Notifications prüfen

`/notifications` zeigt:

- Seed-Demo: Bewerbung, Warteliste, Einladung, Verifikation, Community geschlossen
- Live-Demo: Events aus Bewerbungsflow (localStorage)

Klickbare Deep Links → Community / Dashboard (wenn Supabase + Rolle)

### 6. Mit Supabase (optional)

- Migrationen `001`–`013` ausführen
- Echte Communities erstellen → volles Creator-Dashboard
- Siehe `docs/testing/COMMUNITY_E2E_FLOW.md`

## data-testid Referenz

| Element | testid |
|---------|--------|
| Discover-Suche | `discover-search` |
| Kategorien | `discover-categories` |
| Demo Join CTA | `demo-join-cta` |
| Bewerbung absenden | `demo-submit-application` |
| Creator annehmen | `demo-creator-accept` |
| Notification Center | `notification-center` |

## Validierung

```bash
npm run validate
```
