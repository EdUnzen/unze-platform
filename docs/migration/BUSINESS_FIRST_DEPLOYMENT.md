# UNZE Business � Erstes Deployment (Testphase)

Stand: Juni 2026  
Status: **Bereit f�r Build & Test-Deployment**

---

## 1. Anfrageworkflow (verbindlich)

```
Kunde (Business-Landingpage)
  ? POST /api/business/inquiries/quick
  ? business.inquiries (Referenz z. B. UB-2026-0001)
  ? studio.inquiries (Status: neue_anfrage)
  ? E-Mail an Admin (BUSINESS_NOTIFY_EMAIL)
  ? Bearbeitung ausschlie�lich im UNZE Studio
```

| Schritt | System | Hinweis |
|---------|--------|---------|
| Formular | `/business` | Keine Studio-UI auf der Landing |
| Speicherung | `business` + `studio` Schema | Gleiche Supabase-DB |
| Referenz-ID | `UB-{Jahr}-{0001}` | Automatisch via `business.next_reference_id()` |
| Admin-Mail | `lib/business/notify.ts` | Nur Benachrichtigung � **kein** Ersatz f�r Studio |
| Bearbeitung | `/studio/app` | Nach Login unter `/admin` |

---

## 2. Automatische Antworten (deaktiviert)

- **Keine** globale automatische E-Mail-Antwort an Kunden
- Erfolgsseite: `/business/anfrage/erfolg` � Hinweis auf pers�nliche R�ckmeldung
- Sp�tere Auto-Antworten nur f�r echte Business-Projektanfragen, getrennt vom Support

---

## 3. Corsa ? Studio (Trennung)

| System | Rolle |
|--------|--------|
| **Corsa** | Entwicklung, Analyse, Dokumentation |
| **UNZE Studio** | Operativ: Kunden, Projekte, Angebote, Rechnungen, Vertr�ge, Servicepakete |

**Live-Kundendaten** werden ausschlie�lich im Studio verarbeitet � nicht in Corsa-Dokumenten oder Chat-Kontexten als System of Record.

---

## 4. Deployment-Schritte

### 4.1 Datenbank (einmalig, Produktion)

```bash
npm run db:migrate:040
```

Erstellt Schemas: `business`, `studio`, `studio_auth`.

### 4.2 Umgebungsvariablen (Vercel Production)

| Variable | Pflicht | Beschreibung |
|----------|---------|--------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Ja | Business/Studio Schreibzugriff |
| `BUSINESS_NOTIFY_EMAIL` | Ja | Admin-Benachrichtigung bei neuer Anfrage |
| `RESEND_API_KEY` | Optional | E-Mail-Versand (sonst Server-Log) |
| `BUSINESS_EMAIL_FROM` | Optional | Absender f�r Resend |
| `NEXT_PUBLIC_MARKETING_URL` | Ja | `https://www.unze.app` |
| `NEXT_PUBLIC_APP_URL` | Ja | `https://www.unzeconnect.app` |

### 4.3 Build lokal

```bash
npm run validate:quick
npm run build
```

### 4.4 Deploy

```bash
vercel --prod
```

### 4.5 Nach Deploy verifizieren

```bash
npm run verify:business -- --url=https://www.unze.app
npm run verify:domain
```

---

## 5. Testphase-Checkliste

- [ ] `/business` l�dt (Hero, Services, FAQ, Formular, Community-Suche)
- [ ] `/studio` leitet zu `/business` um
- [ ] Community-Suche liefert �ffentliche Ergebnisse
- [ ] Test-Anfrage erzeugt `UB-2026-xxxx` in Studio
- [ ] Admin erh�lt E-Mail (oder Log-Eintrag ohne Resend)
- [ ] **Keine** Auto-Antwort an Kunden-E-Mail
- [ ] `/admin` Login ? `/studio/app` mit Anfragenliste
- [ ] Erster Login = Super Admin (`studio_auth.users`)
- [ ] Connect (`unzeconnect.app`) unver�ndert funktionsf�hig

### Studio-Login (erster Super Admin)

1. Supabase Auth-Konto anlegen (falls noch nicht vorhanden)
2. `https://www.unze.app/admin` �ffnen
3. Anmelden � erster Nutzer wird `super_admin`
4. Weitere Nutzer manuell in `studio_auth.users` eintragen (sp�ter UI)

---

## 6. Neue Dateien (�berblick)

| Bereich | Pfad |
|---------|------|
| Migration | `database/migrations/040_business_studio_schemas.sql` |
| Business API | `app/api/business/inquiries/quick/route.ts` |
| Studio Auth | `app/api/studio/auth/login`, `logout` |
| Landing | `app/business/page.tsx`, `components/business/*` |
| Studio UI (MVP) | `app/admin/page.tsx`, `app/studio/app/page.tsx` |
| Services | `lib/business/*`, `lib/studio/auth.ts` |

---

## 7. Referenzen

- `docs/THREE_PRODUCT_ARCHITECTURE.md`
- `docs/migration/UNZE_BUSINESS_LANDING_IMPLEMENTATION_PLAN.md`
