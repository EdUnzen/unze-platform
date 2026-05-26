# Teilen & Engagement-Metriken

**Migration:** `database/migrations/016_community_engagement_metrics.sql`  
(additiv — keine bestehenden Daten löschen)

## Features

### ShareMenu (`components/share/ShareMenu.tsx`)
- Link kopieren
- Native Share API (Mobile)
- WhatsApp, Telegram, X/Twitter
- Zählt Shares in `communities.share_count` / `community_groups.share_count`

### CardEngagementStrip
Max. **2 Pills** pro Card — priorisiert:
1. Trending
2. Wochen-Aufrufe (≥ 500)
3. Share-Count (≥ 20)
4. Netzwerk-Follows („X aus deinem Netzwerk folgen“)
5. Aktivitäts-Label

### Datenquellen
| Metrik | Quelle |
|--------|--------|
| Aufrufe/Woche | DB `view_count_weekly` + Demo-Fallback |
| Shares | DB `share_count` + Demo-Fallback |
| Netzwerk | Peers aus gemeinsamen Communities die folgen |
| Trending | `communities.is_trending` |

## Setup

```bash
# Supabase SQL Editor
database/migrations/016_community_engagement_metrics.sql

npm run seed:demo
```

## Verifikation

- Discover → Community-Card → Share-Button oben rechts
- Gruppen-Card → Share mit `?group=` Link
- Community-Detail → Header Share + Aufrufe/Shares
