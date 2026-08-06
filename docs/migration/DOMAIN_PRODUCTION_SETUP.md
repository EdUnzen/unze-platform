# Domain-Produktion � www.unze.app

**Grundregel:** Nur Routing und URLs. Die bestehende Supabase-Produktionsdatenbank bleibt unveraendert.

---

## Ziel

```
www.unze.app
  ??? /              Landingpage (Marketing)
  ??? /discover      Plattform-Einstieg
  ??? /auth/*        Login
  ??? /dashboard/*   Creator Dashboard
  ??? /impressum �   Legal

unzeconnect.app          ? 308 ? www.unze.app/discover
unze-platform.vercel.app ? 308 ? www.unze.app/*
unze.app                 ? 308 ? www.unze.app/*
```

---

## Schritt 1 � Vercel Domain

1. Vercel Dashboard ? Projekt **unze-platform**
2. **Settings ? Domains**
3. Hinzufuegen:
   - `www.unze.app` (Primary)
   - `unze.app` (Redirect auf www � auch in `vercel.json`)
4. Optional behalten: `unze-platform.vercel.app` (Redirect in `vercel.json`)

---

## Schritt 2 � DNS (Domain-Registrar)

| Record | Name | Ziel |
|--------|------|------|
| CNAME | www | `cname.vercel-dns.com` |
| A oder ALIAS | @ | Vercel Apex (laut Vercel-Anleitung) |

SSL wird automatisch von Vercel ausgestellt (Let's Encrypt).

**Manus trennen:** Altes DNS/Manus-Deployment von `unze.app` entfernen, sobald Vercel validiert ist.

---

## Schritt 3 � Environment Variables (Vercel)

**Keine neue Supabase-Instanz.** Nur URL-Variablen anpassen:

| Variable | Wert |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | *(unveraendert � bestehendes Projekt)* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(unveraendert)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(unveraendert)* |
| `NEXT_PUBLIC_APP_URL` | `https://www.unze.app` |
| `NEXT_PUBLIC_MARKETING_URL` | `https://www.unze.app` |

Sync aus `.env.local`:

```bash
npm run sync:vercel-env
```

Oder manuell in Vercel ? Settings ? Environment Variables.

---

## Schritt 4 � Supabase Auth (Dashboard, keine DB-Migration)

Supabase ? **Authentication ? URL Configuration**:

| Feld | Wert |
|------|------|
| Site URL | `https://www.unze.app` |
| Redirect URLs | `https://www.unze.app/auth/callback` |
| | `https://www.unze.app/**` |

**Wichtig:** Nur Auth-URLs im Supabase-Dashboard � keine Tabellen, keine neue DB.

---

## Schritt 5 � Deploy

```bash
git push
# oder
npx vercel deploy --prod
```

---

## Schritt 6 � Abschlusspruefung

```bash
npm run verify:domain
# explizit gegen Production:
E2E_BASE_URL=https://www.unze.app npm run verify:domain
```

Report: `docs/migration/DOMAIN_VERIFICATION_REPORT.json`

### Manuelle Checkliste

- [ ] www.unze.app zeigt Landingpage auf `/`
- [ ] App-Einstieg `/discover` funktioniert
- [ ] Login / OAuth Callback
- [ ] Profile, Communities, Gruppen, Events, Services
- [ ] Auszeichnungen, Zertifikate, UNZE-ID / QR
- [ ] Creator Dashboard, Crowd Partner
- [ ] Keine unzeconnect.app Links sichtbar
- [ ] unze-platform.vercel.app leitet weiter
- [ ] Gleiche Supabase-Projekt-Ref wie vorher

---

## Ersetzte Link-Typen

| Bereich | Mechanismus |
|---------|-------------|
| Share-Links | `getAppUrl()` ? www.unze.app |
| Invite-Links | `getAppBaseUrl()` |
| Community-Slug-Vorschau | www.unze.app/community/� |
| OG / Canonical | `metadataBase`, sitemap |
| PWA Manifest | `scope` + `id` ? www.unze.app |
| Marketing-Pipeline | `E2E_BASE_URL` Default www.unze.app |
| Legacy-Domains | `vercel.json` + `middleware.ts` |

---

## Manus endgueltig trennen

Erst wenn `npm run verify:domain` gruen ist:

1. Manus-Deployment deaktivieren
2. DNS von Manus entfernen
3. unzeconnect.app auf Redirect belassen oder Domain abmelden

Siehe auch: [MANUS_MIGRATION_REPORT.md](./MANUS_MIGRATION_REPORT.md)
