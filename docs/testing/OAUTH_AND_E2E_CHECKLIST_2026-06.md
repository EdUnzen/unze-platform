# OAuth (Vercel + Supabase) & manueller E2E-Testplan

**Stand:** Juni 2026  
**Produktion:** https://unze-platform.vercel.app  
**Supabase-Projekt:** `zzbjvcwmdrnuzzlepfja`  
**Scope:** Setup + manuelle Tests — keine neuen App-Features.

---

## Teil A — Vercel Environment Variables

In **Vercel → Project → Settings → Environment Variables** (Production + Preview empfohlen):

| Variable | Pflicht | Wert / Hinweis |
|----------|---------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Ja | `https://zzbjvcwmdrnuzzlepfja.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ja | Vollständiger anon/publishable Key aus Supabase → API (nicht abschneiden) |
| `NEXT_PUBLIC_APP_URL` | Ja | **`https://unze-platform.vercel.app`** (ohne trailing slash) |
| `SUPABASE_SERVICE_ROLE_KEY` | Empfohlen | Service-Role JWT — Fallback bei Creator-Mitgliedschaft nach Community-Erstellung |
| `SUPABASE_DB_PASSWORD` | Nur Build/Migrate | Nicht für Runtime nötig; nur lokal/CI für `npm run db:migrate:*` |

Optional (nicht für Login/Community-Create):

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, … — Monetarisierung
- `NEXT_PUBLIC_DEMO_MODE` — **nicht** `true` auf Produktion setzen

**Nach Änderungen:** Redeploy (Deployments → … → Redeploy).

**Schnellcheck lokal:**

```bash
npm run check:supabase
npm run check:migrations
```

---

## Teil B — Supabase Authentication

Dashboard: [Supabase → Authentication](https://supabase.com/dashboard/project/zzbjvcwmdrnuzzlepfja/auth/providers)

### B1 — URL-Konfiguration (Authentication → URL Configuration)

| Feld | Wert |
|------|------|
| **Site URL** | `https://unze-platform.vercel.app` |
| **Redirect URLs** (jeweils eine Zeile) | `https://unze-platform.vercel.app/auth/callback` |
| | `https://unze-platform.vercel.app/**` (optional, Wildcard) |
| **Lokal** (zusätzlich) | `http://localhost:3002/auth/callback` |

Die App baut OAuth-Redirects so:

`{NEXT_PUBLIC_APP_URL}/auth/callback?next={zielpfad}`

→ `NEXT_PUBLIC_APP_URL` und Supabase Redirect URLs **müssen dieselbe Origin** haben.

### B2 — E-Mail (Anmelden / Registrieren)

| Punkt | Einstellung |
|-------|-------------|
| Email provider | Aktiviert |
| Confirm email | Wie gewünscht (mit Bestätigung: Nutzer klickt Link → `/auth/callback`) |
| E-Mail-Template (optional) | Confirm-Link: `{{ .SiteURL }}/auth/callback?next=/` |

### B3 — Google OAuth

1. **Supabase:** Authentication → Providers → **Google** → Enable  
2. **Google Cloud Console:** OAuth 2.0 Client (Web application)  
   - Authorized redirect URI:  
     `https://zzbjvcwmdrnuzzlepfja.supabase.co/auth/v1/callback`  
3. Client ID + Secret in Supabase eintragen  
4. Speichern

### B4 — Apple OAuth

1. **Supabase:** Authentication → Providers → **Apple** → Enable  
2. **Apple Developer:** Services ID, Key, Team ID, Bundle ID nach [Supabase Apple-Doku](https://supabase.com/docs/guides/auth/social-login/auth-apple)  
3. Return URL bei Apple: `https://zzbjvcwmdrnuzzlepfja.supabase.co/auth/v1/callback`  
4. Credentials in Supabase speichern

### B5 — Häufige OAuth-Fehler

| Symptom | Ursache | Fix |
|---------|---------|-----|
| Redirect zu Login mit `auth_callback_failed` | Redirect URL passt nicht | B1 prüfen + `NEXT_PUBLIC_APP_URL` |
| „OAuth konnte nicht gestartet werden“ | Provider deaktiviert / falsche Keys | B3/B4 |
| Nach Google: leere Seite / falsche Domain | `NEXT_PUBLIC_APP_URL` noch localhost auf Vercel | Vercel-Env + Redeploy |
| Apple funktioniert nur auf iOS/Safari | Apple-Regeln / Domain-Verifikation | Apple Services ID + Supabase-Doku |

**Code-Pfad (Referenz):** `signInWithOAuthAction` → `app/auth/actions.ts` → Callback `app/auth/callback/route.ts`

---

## Teil C — Manueller Testplan: Login → Community erstellen

**Gerät:** iPhone (Safari) + optional Desktop Chrome  
**Ziel:** Release-Kandidat-Stabilität, kein Design-Review.

### Vorbereitung

- [ ] Vercel-Env Teil A erledigt, Prod-Deploy aktuell (`main`)
- [ ] Supabase Migrationen: `npm run check:migrations` → alle ✓
- [ ] Optional: `npm run db:migrate:026` und `npm run db:migrate:027` (falls noch nicht)
- [ ] Test-Account: eigene E-Mail oder Google-Account

### C1 — Gast / Routing (2 Min)

| # | Schritt | Erwartung | ✓ |
|---|---------|-----------|---|
| 1 | https://unze-platform.vercel.app öffnen | Home lädt, Bottom-Nav sichtbar | |
| 2 | **Discover** tippen | Seite „Discover“, Tabs/Communities laden (kein roter Fehler) | |
| 3 | Tabs **Gruppen**, **Events**, **Dienstleistungen** | Inhalt oder leerer Empty-State, kein Crash | |
| 4 | **Profil** (ohne Login) | Hinweis „Melde dich an“ / Gast-Ansicht | |
| 5 | **+** → Community erstellen (ohne Login) | Redirect zu Login mit `?next=/create/community` | |

### C2 — E-Mail Login / Registrierung (5 Min)

| # | Schritt | Erwartung | ✓ |
|---|---------|-----------|---|
| 6 | `/auth/login` — Tab **Anmelden** | Grüner aktiver Tab, Google/Apple-Buttons sichtbar | |
| 7 | Mit bestehendem Account anmelden | Redirect zu Home oder `next`-URL | |
| 8 | Tab **Registrieren**, neuer Account | Erfolgsmeldung E-Mail-Bestätigung **oder** direkter Login | |
| 9 | (falls E-Mail-Bestätigung) Link in Mail öffnen | Landet auf App, `verified=1`, Login möglich | |

### C3 — OAuth (5 Min, nach Teil B)

| # | Schritt | Erwartung | ✓ |
|---|---------|-----------|---|
| 10 | **Mit Google anmelden** | Google-Consent → zurück zur App, eingeloggt | |
| 11 | Ausloggen (Profil) → **Mit Apple anmelden** | Apple-Flow → eingeloggt (oder dokumentierter Apple-Blocker) | |
| 12 | Login mit `?next=/create/community` | Nach OAuth direkt auf Community-Erstellen | |

### C4 — Community erstellen (10 Min, kritisch)

| # | Schritt | Erwartung | ✓ |
|---|---------|-----------|---|
| 13 | `/create/community` | Formular 3 Sektionen (Design / Basis / Einstellungen) | |
| 14 | **Fokus:** `Coaching, Events` tippen (iPhone-Komma) | Komma bleibt sichtbar bis Absenden | |
| 15 | **Tags:** `Test, Beta` | ebenso | |
| 16 | Titel + auto-Slug, Kategorie, Sichtbarkeit **öffentlich** | Slug-Vorschau `unze.app/community/…` | |
| 17 | **Community erstellen** submit | Kein Fehlerbanner; Redirect zu `/dashboard/community/{slug}/access?welcome=1` | |
| 18 | Access-Dashboard | Creator-Bereich sichtbar, kein Redirect zurück zu `/dashboard` ohne Rechte | |
| 19 | Öffentliche Seite `/community/{slug}` | Community erreichbar | |
| 20 | **Discover** → neue Community in Liste (ggf. nach kurzer Zeit) | Sichtbar oder Empty-State mit Erklärung | |

**Bei Fehler „Migration 026“ / Creator-Mitgliedschaft:**

```bash
npm run db:migrate:026
npm run db:migrate:027
```

Vercel: `SUPABASE_SERVICE_ROLE_KEY` setzen und redeployen.

### C5 — Hauptseiten eingeloggt (5 Min)

| # | Schritt | Erwartung | ✓ |
|---|---------|-----------|---|
| 21 | **Home** | „Mein UNZE“ / gefolgte Communities oder sinnvoller Empty-State | |
| 22 | Demo-Community `rocket-league-ssl` | Tabs Gruppen/Services/Events/Feed laden | |
| 23 | **Profil** | Avatar/Header zentriert, Menüpunkte klickbar | |
| 24 | **Favoriten** | Seite lädt ohne Server-Fehler | |

### C6 — Performance subjektiv (2 Min)

| # | Beobachtung | OK? |
|---|-------------|-----|
| 25 | Discover fühlt sich nach erstem Besuch < 1 s an | |
| 26 | Community-Detail Tab-Wechsel ohne lange weiße Fläche | |
| 27 | Kein dauerhaftes „Etwas ist schiefgelaufen“ (`app/error`) | |

---

## Teil D — Automatisierte Kurztests (Terminal)

```bash
# Produktion
npm run test:e2e-urls -- https://unze-platform.vercel.app
npm run measure:perf -- https://unze-platform.vercel.app

# Schema
npm run check:migrations
npm run migrate:demo
```

**Erwartung E2E:** alle Routen HTTP 200 (Shell; RSC-Inhalt im Browser prüfen).

---

## Teil E — Ergebnis dokumentieren

Nach dem Durchlauf in `RELEASE_CANDIDATE_STATUS_2026-06.md` ergänzen oder hier Notizen:

| Bereich | Status | Notiz |
|---------|--------|-------|
| OAuth Google | ✓ / ✗ | |
| OAuth Apple | ✓ / ✗ | |
| E-Mail Login | ✓ / ✗ | |
| Community Create | ✓ / ✗ | Slug: ________ |
| Discover Mobile | ✓ / ✗ | |
| Release-Stufe | Beta / Release | |

**Release-Stufe anheben auf „Release bereit“ nur wenn:** C4 (17–18) stabil, OAuth mind. ein Provider ✓, keine kritischen Server-Fehler auf C1–C5.

---

## Referenzen

- `docs/testing/RELEASE_CANDIDATE_STATUS_2026-06.md`
- `docs/setup/ENVIRONMENT_SECRETS_SYSTEM.md`
- `docs/testing/DEMO_PLATFORM_TEST.md` (lokal Port 3002)
