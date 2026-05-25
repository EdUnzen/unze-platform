# UNZE — Erster lokaler Plattformtest (echte Supabase-Daten)

Kurzanleitung für den vollständigen Community-Lifecycle mit zwei Test-Accounts.

## Voraussetzungen

```bash
# 1. Health Check
npm run check:supabase

# 2. Dev-Server
npm run dev
```

Öffne **http://localhost:3000**

### `.env.local` (Minimum)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # empfohlen für Nachweis-Signed-URLs
```

### Supabase Dashboard

| Einstellung | Wert |
|-------------|------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |
| Confirm email | **Aus** (lokale Tests) |

### Migrationen

Reihenfolge im SQL Editor: `001` → `002` → `004` → `005` → `006` → `007` → `008` → `009` → `010` → `011` → `012` → `013` → **`014`**

---

## Test-Checkliste

### Phase A — Creator (Account 1)

| # | Aktion | Erwartung |
|---|--------|-----------|
| A1 | `/auth/login` → Registrieren | Session aktiv, Redirect |
| A2 | `/create/community` → Community anlegen | Redirect zu `/dashboard/community/{slug}/access?welcome=1` |
| A3 | Dashboard → **Zugang** | Manuelle Prüfung, Warteliste, Regeln, Fragen |
| A4 | Optional: Upload-Frage hinzufügen | Pflichtfeld in Bewerbung |
| A5 | `/discover` | Eigene Community sichtbar in Cards |
| A6 | `/community/{slug}` | Detail-View, Creator-Profil, **Verwalten**-Button |

### Phase B — Bewerber (Account 2, Inkognito)

| # | Aktion | Erwartung |
|---|--------|-----------|
| B1 | Registrieren (zweiter Account) | Session aktiv |
| B2 | `/discover` → Community öffnen | Card zeigt kein „Mitglied“ |
| B3 | **Bewerbung starten** | Pflichtfelder + ggf. Upload |
| B4 | Antrag absenden | Status **Offen** oder **Warteliste** |
| B5 | `/notifications` | Bewerbungs-Benachrichtigung (Creator) |
| B6 | Community-Card | Badge „Antrag offen“ |

### Phase C — Creator prüft

| # | Aktion | Erwartung |
|---|--------|-----------|
| C1 | `/dashboard/community/{slug}/requests` | Antrag sichtbar |
| C2 | Antworten + Nachweise öffnen | Signed URLs laden |
| C3 | **Annehmen** | Status → angenommen |
| C4 | Dashboard Overview | Pending-Count sinkt, Mitgliederzahl steigt |
| C5 | `/dashboard/community/{slug}/members` | User B als Mitglied |

### Phase D — Mitglied bestätigen

| # | Aktion | Erwartung |
|---|--------|-----------|
| D1 | User B → `/community/{slug}` | **Mitglied**-Status |
| D2 | `/notifications` (User B) | „Antrag angenommen“ |
| D3 | `/favorites` → Community folgen | Card in Favoriten |

### Phase E — Moderation & Lifecycle (optional)

| # | Aktion | Route |
|---|--------|-------|
| E1 | Rolle ändern | `/dashboard/community/{slug}/roles` |
| E2 | Mitglied sperren | `/dashboard/community/{slug}/members` |
| E3 | Community pausieren | `/dashboard/community/{slug}/settings` |
| E4 | Moderationsübersicht | `/dashboard/community/{slug}/moderation` |

---

## Navigation (Mobile-first)

| Bereich | Pfad |
|---------|------|
| Home | `/` |
| Discover | `/discover` |
| Favoriten | `/favorites` |
| Profil + Dashboard-Link | `/profile` |
| Benachrichtigungen | `/notifications` |
| Creator Dashboard | `/dashboard` |
| Plus-Menü | Community / Post / Dashboard |

---

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| `check:supabase` schlägt fehl | Fehlende Migration aus `database/migrations/` ausführen |
| Dashboard leer nach Erstellung | Migration `014_platform_integrity.sql` |
| Upload fehlgeschlagen | Bucket `community-join-proofs` + RLS (`011`) |
| Signed URL leer | `SUPABASE_SERVICE_ROLE_KEY` setzen |
| Keine Communities in Discover | `discover_enabled = true` in Community-Einstellungen |
| Login-Loop | Redirect URL in Supabase Auth prüfen |

---

## Validierung

```bash
npm run validate      # Build + Struktur
npm run check:supabase # DB + Storage
```

Ausführlicher Flow: [REAL_E2E_FLOW.md](./REAL_E2E_FLOW.md)
