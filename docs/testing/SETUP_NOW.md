# UNZE — Sofort-Setup (Schema + Demo-Daten)

## Diagnose

Wenn Discover/Feed leer sind, prüfe:

```bash
npm run verify:demo
```

**HTTP 404 auf Tabellen** = Migrationen wurden noch nicht ausgeführt.  
Auth funktioniert, aber **keine `communities`/`posts`-Tabellen** → App lädt nichts.

---

## Schritt 1 — Schema anlegen (einmalig)

### Option A: Supabase SQL Editor (empfohlen)

1. [Supabase Dashboard](https://supabase.com/dashboard) → dein Projekt → **SQL Editor**
2. Datei öffnen: `database/BUNDLE_all_migrations.sql`
3. Gesamten Inhalt einfügen → **Run**
4. Danach: **Settings → API → Reload schema** (falls nötig)

### Option B: CLI mit DB-URL

In `.env.local`:

```env
SUPABASE_DB_URL=postgresql://postgres.[ref]:[DEIN-DB-PASSWORT]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

```bash
npm run db:migrate
```

---

## Schritt 2 — Service Role Key

In `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Settings → API → service_role (secret)
```

Dev-Server neu starten.

---

## Schritt 3 — Demo-Seed

```bash
npm run seed:demo
npm run verify:demo
```

Erwartung nach erfolgreichem Seed:

| Tabelle | ca. |
|---------|-----|
| communities | 3 |
| posts | 6 |
| community_members | 10+ |
| comments | 7 |
| post_likes | 6+ |
| community_join_applications | 1 |

---

## Schritt 4 — App testen

```
http://localhost:3002/discover
http://localhost:3002/community/rocket-league-ssl
http://localhost:3002/dashboard
```

**Demo-Login:**
- E-Mail: `edubek89@icloud.com`
- Passwort: `UnzeDemo2026!`

---

## Alles in einem

```bash
npm run setup:demo
```

(Voraussetzung: `SUPABASE_DB_URL` oder manuelles SQL + `SUPABASE_SERVICE_ROLE_KEY`)
