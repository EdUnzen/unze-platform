# Phase 1 — Plattform-Umstellung (Feed deaktiviert)

> **Status:** Implementiert · Migrationen 021 + 022 in Supabase ausführen

## Entscheidungen (freigegeben)

| Thema | Entscheidung |
|-------|--------------|
| Events | Eigene Tabelle `community_events` |
| Gruppen-Follow | `follows.target_type = 'group'` |
| Experte/Coach | Enum `expert` + UI-Label |
| Dienstleistungen | `community_groups.group_type = 'service'` |
| Feed | Deaktiviert (Flags + UI), Tabellen bleiben |

## Migrationen

1. `database/migrations/021_platform_feature_flags.sql`
2. `database/migrations/022_platform_core_entities.sql`

## App-Flags

- `NEXT_PUBLIC_FEED_ENABLED` — Standard: **nicht gesetzt = false**
- DB-Backup: `platform_feature_flags.feed_posts = false`

## UI-Änderungen

| Bereich | Vorher | Nachher |
|---------|--------|---------|
| Home | Feed + Trending | Verwaltungs-Hub |
| Discover | 6 Tabs inkl. Feed/Creator | Communities · Gruppen · Events · Dienstleistungen |
| Community | Feed-Section | Events + Plattform-Links |
| Plus-Menü | Beitrag erstellen | Entfernt |
| `/create/post`, `/post/[id]` | Aktiv | Redirect → Discover |

## Navigation (neu)

```
[ Home ]  [ Discover ]  [ + ]  [ Folge ich ]  [ Profil ]
```

- **Home** — Meine Communities, Gruppen, Events, Anträge, Benachrichtigungen
- **Discover** — Communities · Gruppen · Events · Dienstleistungen
- **Folge ich** — Gefolgte Communities (ehem. Favoriten)
- **Profil** — unverändert

## Nächste Phase

- Gruppen-Detailseite `/community/[slug]/group/[groupSlug]`
- Bewertungs-UI an `community_reviews` / `group_reviews` anbinden
- Swipe-Modus auf Discover-Entity-Cards verlagern
- Event-Erstellung im Dashboard
