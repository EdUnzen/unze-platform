# UNZE — Echter E2E-Flow (Supabase)

Produktionsnahe Plattform-Basis mit echter Auth, Membership, Storage und Creator-Dashboard.

**Schnellstart:** [LOCAL_PLATFORM_TEST.md](./LOCAL_PLATFORM_TEST.md) — Checkliste für den ersten lokalen Test.

## 1. Supabase vorbereiten

### Environment (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # vollständiger Key aus Dashboard
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # optional, für Admin-Signed-URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=false        # wichtig: echte Daten
```

Vor dem Test: `npm run check:supabase`

### Migrationen (Reihenfolge)

Im Supabase SQL Editor nacheinander ausführen:

`001` → `002` → `004` → `005` → `006` → `007` → `008` → `009` → `010` → `011` → `012` → `013` → **`014_platform_integrity.sql`**

Migration `014` stellt sicher:

- Creator ist immer `community_members`-Eintrag mit Rolle `creator`
- `member_count` ist synchron

### Auth (Supabase Dashboard)

- **Authentication → Providers → Email** aktivieren
- Für lokale Tests: **Confirm email** deaktivieren (sofortige Session nach Registrierung)
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/auth/callback`

### Storage

Migration `011` + `012` erstellen Buckets:

| Bucket | Sichtbarkeit |
|--------|--------------|
| `community-join-proofs` | privat, Signed URLs |
| `unze-public-media` | öffentlich |
| `unze-private-media` | privat |
| `unze-verification-private` | privat |

## 2. E2E User Journey

### Schritt 1 — Registrierung

1. `/auth/login` → Tab **Registrieren**
2. E-Mail + Passwort (min. 8 Zeichen) + Anzeigename
3. Bei deaktivierter E-Mail-Bestätigung: direkter Redirect
4. Profil wird via `handle_new_user` Trigger angelegt

### Schritt 2 — Community erstellen (Creator)

1. `/create/community` — nur mit Session (Middleware-geschützt)
2. Community anlegen → Redirect zu `/dashboard/community/{slug}/access?welcome=1`
3. **Zugang** konfigurieren:
   - Join-Modus: `Manuelle Prüfung`
   - Warteliste aktivieren
   - Mitgliederlimit setzen
   - Regeln + Pflichtfragen (optional Upload-Felder)

### Schritt 3 — User bewirbt sich

1. Zweiter Account registrieren (Inkognito)
2. `/discover` → Community öffnen
3. **Bewerbung starten** → Pflichtfelder + ggf. Nachweis-Upload
4. Status auf Community-Seite: **Offen** / **Warteliste**
5. `/notifications` — Bewerbungs-Benachrichtigung

### Schritt 4 — Creator prüft

1. Creator-Account → `/dashboard/community/{slug}/requests`
2. Antrag öffnen → **Antworten** + **Nachweise** (Signed URLs)
3. **Annehmen** oder **Ablehnen**
4. Dashboard-Overview: Pending-Count sinkt

### Schritt 5 — Mitgliedschaft aktiv

1. User-Account → Community-Seite zeigt **Mitglied**
2. User erhält Notification **Antrag angenommen**
3. `/dashboard` (Creator): Mitgliederzahl aktualisiert

## 3. Geschützte Bereiche (Middleware)

Automatischer Redirect zu `/auth/login?next=...`:

- `/dashboard/**`
- `/create/**`
- `/notifications`
- `/verify/**`
- `/profile`

## 4. Rollen & Moderation

| Rolle | Dashboard-Zugriff |
|-------|-------------------|
| `creator` | Vollzugriff |
| `admin` | Verwaltung + Moderation |
| `moderator` | Moderation + Anträge |
| `member` | Kein Dashboard |

Moderationsaktionen werden in `moderation_actions` + `audit_log` persistiert (Migration `010`).

## 5. Troubleshooting

| Problem | Lösung |
|---------|--------|
| Dashboard leer nach Community-Erstellung | Migration `014` ausführen |
| Upload schlägt fehl | Bucket `community-join-proofs` prüfen, RLS `011` |
| Mock-Daten statt echte | `NEXT_PUBLIC_DEMO_MODE=false`, Supabase-Keys prüfen |
| E-Mail-Bestätigung blockiert | Confirm email deaktivieren oder Link aus Mail klicken |
| Creator sieht Anträge nicht | Rolle in `community_members` prüfen |

## 6. Validierung

```bash
npm run validate
```
