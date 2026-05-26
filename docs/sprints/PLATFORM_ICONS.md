# Plattform-Icons — Abgleich & Ergänzung

## Bestehende Systeme (unverändert)

| Bereich | Status |
|---------|--------|
| Hauptfeed + Follow/Explore-Mix | Beibehalten |
| Community-/Gruppen-Services | Beibehalten |
| Dashboard KPIs & Growth | Beibehalten |
| Rollen/Creator-Logik | Beibehalten |
| Discover-Tabs | Beibehalten |
| Content-Posts (Sprint 4) | Beibehalten |
| Share/Engagement | Beibehalten |

## Ergänzung: Plattform-Icons

**Migration 018:** `instagram`, `tiktok`, `youtube`, `website` zum `platform_type`-Enum

**Neu:**
- `components/platform/PlatformIcon.tsx` — Marken-Icons (SVG, keine Extra-Deps)
- `PlatformBadge` erweitert um Varianten:
  - `overlay` — auf Bannern (Cards, Header, Dashboard)
  - `footer` — unter Cards
  - `icon` — kompakt im Feed
  - `default` — Pill mit Icon + Label

**Sichtbar in:**
- Community-Cards (Banner + Footer)
- Gruppen-Cards (Banner + Footer)
- Community-Detail (Header, Meta, Sidebar)
- Feed-Posts (`PostContextHeader`)
- Creator-Dashboard-Cards

## Migration

```sql
-- database/migrations/018_platform_types_extend.sql
```

Keine bestehenden Daten gelöscht — `other` und `unze` bleiben gültig.
