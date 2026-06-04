# UNZE — Demo-Plattformtest (localhost:3002)

Vollständiger manueller Test mit drei Demo-Communities und Creator-Account.

**Demo-Daten:** `npm run seed:demo` aktualisiert/ergänzt bestehende Demo-Inhalte — löscht sie **nicht** (außer mit `UNZE_DEMO_FORCE_RESET=true`). Nach Schema-Änderungen: Migration 025 + optional `npm run migrate:demo`.

## 1. Supabase Auth konfigurieren

**Authentication → URL Configuration**

| Feld | Wert |
|------|------|
| Site URL | `http://localhost:3002` |
| Redirect URLs | `http://localhost:3002/auth/callback` |
| | `http://localhost:3002/**` |

**Authentication → Providers → Email**

- Email aktiviert
- **Confirm email** aktiviert (für echten Verifizierungsflow)
- Min. Passwortlänge: 8

**E-Mail-Templates (optional anpassen)**

Confirm signup Link nutzt automatisch:
`{{ .SiteURL }}/auth/callback?next=/`

## 2. Environment (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...vollständig
NEXT_PUBLIC_APP_URL=http://localhost:3002
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # für Demo-Seed
```

## 3. Demo-Daten laden

```bash
npm run seed:demo
```

Legt an:

| Community | Slug | Fokus |
|-----------|------|--------|
| Rocket League SSL Coaching | `rocket-league-ssl` | Gaming, Bewerbungsfragen, Warteliste |
| Business Circle DACH | `business-circle-dach` | Netzwerk, Services, Mastermind |
| Creator Lounge | `creator-lounge` | Social Feed, Likes, Kommentare |

Inkl. Feed-Posts, Demo-Mitglieder, offene Bewerbung fürs Dashboard.

## 4. Demo-Creator-Account

| | |
|--|--|
| **E-Mail** | `edubek89@icloud.com` |
| **Passwort** | `UnzeDemo2026!` |

Der Seed legt den Account an (E-Mail bestätigt) **oder** nutzt einen bestehenden Account mit dieser E-Mail.

### Registrierung + E-Mail-Verifizierung testen

1. `/auth/login` → **Registrieren** mit `edubek89@icloud.com`
2. E-Mail öffnen → Bestätigungslink klicken
3. Redirect → App mit `?verified=1`
4. Anmelden → Dashboard + Communities sichtbar

Falls Account bereits per Seed existiert: direkt **Anmelden**.

## 5. Manueller Testplan

### Navigation
- [ ] Home `/` — Trending Cards
- [ ] Discover `/discover` — Tabs Communities / Feed / Trends / Creator / Neu
- [ ] Community Detail `/community/rocket-league-ssl`
- [ ] Favoriten `/favorites`
- [ ] Profil `/profile` → Dashboard-Link
- [ ] Benachrichtigungen `/notifications`
- [ ] Plus-Menü → Community erstellen / Dashboard

### Creator-Dashboard
- [ ] `/dashboard` — 3 Communities mit Stats
- [ ] `/dashboard/community/rocket-league-ssl/requests` — Demo-Bewerbung
- [ ] Bewerbung annehmen/ablehnen
- [ ] `/dashboard/community/rocket-league-ssl/members`
- [ ] `/dashboard/community/business-circle-dach/roles`

### Bewerbungsflow (zweiter Account)
1. Inkognito → `demo.applicant@unze.local` / `UnzeDemo2026!`
2. Oder neuer Account registrieren
3. Gaming-Community → Bewerbung starten
4. Creator prüft im Dashboard

## 6. URLs

```
App:       http://localhost:3002
Discover:  http://localhost:3002/discover
Dashboard: http://localhost:3002/dashboard
Gaming:    http://localhost:3002/community/rocket-league-ssl
Business:  http://localhost:3002/community/business-circle-dach
Social:    http://localhost:3002/community/creator-lounge
```

## 7. Befehle

```bash
npm run check:supabase   # Keys + Tabellen
npm run seed:demo        # Demo-Communities
npm run dev              # Port 3002 (oder freier Port)
npm run validate         # Build-Check
```
