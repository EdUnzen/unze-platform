# Sprint 4 — Community Content Posts

**Prinzip:** Ein Hauptfeed, Communities/Gruppen als Kontext — kein TikTok-Klon.

## Schema (Migration 017)

`database/migrations/017_post_content_extensions.sql`

- Neue Post-Typen: `video`, `clip`, `gallery`, `highlight`, `request`
- `group_id`, `media` (JSONB), `metadata` (JSONB)
- `view_count`, `share_count` auf Posts

## Features

### Content-Typen
Text, Bild, Galerie, Video, Clip, Event, Community-News, Highlight, Anfrage/Suche

### Feed-Kontext (`PostContextHeader`)
- Community + Verifizierung + Trend
- Gruppe
- Plattform-Badge
- Autor + Rolle + Verifizierung
- Post-Typ-Badge

### Medien
- `PostMediaGallery` — swipebare Bilderserie
- `PostVideoPreview` — Video/Clip-Vorschau

### Engagement
- Teilen pro Beitrag (`ShareMenu` inline)
- View/Share-Counts (DB + Demo-Seed)
- `PostViewRecorder` auf Detailseite

### Composer
`/create/post` — Typ, Community, Gruppe, Medien-URLs, Event-Felder

## Anwenden

```bash
# Supabase SQL Editor
database/migrations/017_post_content_extensions.sql

npm run seed:demo
npm run build
```

## Nächste Schritte

- Supabase Storage für Uploads
- Trending-Score pro Post
- Gruppen-Feed-Filter
