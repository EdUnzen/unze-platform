# UNZE Stabilisierungs-Status

**Datum:** 2026-06-13  
**Production:** https://unze-platform.vercel.app  
**Supabase:** https://zzbjvcwmdrnuzzlepfja.supabase.co

---

## Zusammenfassung

| Status | Anzahl |
|--------|--------|
| Funktioniert | 13 |
| Teilweise | 1 |
| Fehlerhaft | 0 |

---

## Detailmatrix

| Bereich | Status | Ursache | Lösungsvorschlag | URL |
|---------|--------|---------|------------------|-----|
| **Migrationen 021–024** | Funktioniert | Alle Tabellen und Spalten vorhanden | — | npm run check:migrations |
| **Discover — Communities** | Funktioniert | Route und Inhalt OK | — | https://unze-platform.vercel.app/discover |
| **Discover — Gruppen** | Funktioniert | Route und Inhalt OK | — | https://unze-platform.vercel.app/discover?tab=groups |
| **Discover — Events** | Funktioniert | Route und Inhalt OK | — | https://unze-platform.vercel.app/discover?tab=events |
| **Discover — Dienstleistungen** | Funktioniert | Route und Inhalt OK | — | https://unze-platform.vercel.app/discover?tab=services |
| **Creator-Profil** | Funktioniert | Route HTTP 200, Kerninhalt vorhanden | — | https://unze-platform.vercel.app/creator/edudemo |
| **Nutzerprofil** | Funktioniert | Route HTTP 200, Kerninhalt vorhanden | — | https://unze-platform.vercel.app/profile |
| **Nutzerprofil — Billing** | Funktioniert | Route HTTP 200, Kerninhalt vorhanden | — | https://unze-platform.vercel.app/profile/billing |
| **Creator-Dashboard** | Funktioniert | Route HTTP 200, Kerninhalt vorhanden | — | https://unze-platform.vercel.app/dashboard |
| **Favoriten** | Funktioniert | Route HTTP 200, Kerninhalt vorhanden | — | https://unze-platform.vercel.app/favorites |
| **Community + Bewertungen** | Funktioniert | Route HTTP 200, Kerninhalt vorhanden | — | https://unze-platform.vercel.app/community/rocket-league-ssl |
| **Community — Events** | Funktioniert | Route HTTP 200, Kerninhalt vorhanden | — | https://unze-platform.vercel.app/community/rocket-league-ssl |
| **Monetarisierung** | Teilweise | Konfiguration vorhanden; E2E-Zahlung manuell testen | docs/sprints/STRIPE_MONETIZATION.md | /profile/billing |
| **Production Build** | Funktioniert | npm run build erfolgreich | — | — |

---

## Migrationen — Ausführung

**Automatisch** (wenn `SUPABASE_DB_URL` in .env.local):

```bash
npm run db:migrate:pending
```

**Manuell** (empfohlen):

1. Supabase → SQL Editor
2. `database/migrations/BUNDLE_021_024.sql` einfügen und ausführen
3. `npm run check:migrations` → alle ✓
4. Optional: `npm run seed:demo`

---

## Nächste Schritte

1. Migrationen 021–024 ausführen (Blocker für Events, Dienstleistungen, Bewertungen, Monetarisierung)
2. `npm run test:stabilization` erneut — Ziel: 0 Fehlerhaft
3. Stripe Testmodus (`npm run check:stripe`) für Monetarisierung
4. Erst danach: Design/UX

---

_Via `npm run test:stabilization` generiert._
