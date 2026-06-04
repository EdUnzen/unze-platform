# UNZE Release Candidate – Finaler Sprint (Juni 2026)

## Erledigt

### P1 – Community-Erstellung
- Admin-Upsert Profil vor Insert (`ensureUserProfile`)
- Doppelte Creator-Mitgliedschaft nach erfolgreichem Create
- Fehler bei fehlender Mitgliedschaft (kein „halber“ Erfolg)
- Verify-Script: OK

### P1 – Creator Dashboard
- Communities als `creator_id` auch ohne Member-Zeile in Liste
- Auto-Backfill Creator-Mitgliedschaft beim Dashboard-Zugriff
- Activity-Feed: unbekannte Event-Typen crashen nicht mehr
- Pending-Counts im Layout abgesichert (try/catch)

### Sichtbarkeit
- Öffentlich / Privat / Intern (`hidden`) / Premium (startet kostenlos)
- Discover-Regeln + Dashboard-Sichtbarkeitskarte

### Referral
- Ein Empfehlungsgeber pro Creator, nicht änderbar
- Beliebig viele geworbene Creator (kein MLM)
- Suche: getrennte `ilike`-Queries, Creator-Filter
- Benachrichtigung an Referrer bei neuer Zuordnung
- Bereich „Meine Referrals“ im Dashboard

### Events
- Eventbild-Upload + Vorschau
- Fallback: Community-Banner → Standard-Event-Banner

### UX
- Benachrichtigungs-Einstellungen (Profil, Push vorbereitet)
- Erfolgsbanner (`ActionSuccessBanner`) für Events
- Home: positive Formulierung, Hero-Bild
- Bewertungen, Level-Badges, Discover, Mobile-Tabs (vorheriger Sprint)

## Offen / Live-Test nötig

| Punkt | Aktion |
|--------|--------|
| Community Create auf Prod | Eingeloggt testen |
| Dashboard Community öffnen | Nach Deploy testen |
| Migration 028 | `npm run db:migrate:028` |
| Vercel `SUPABASE_SERVICE_ROLE_KEY` | Production prüfen |
| Push-Benachrichtigungen | UI da, Versand folgt |
| Stripe Live / Einmalzahlung | Vorbereitet, nicht live |
| Erfolgs-Toasts überall | Komponente da, schrittweise einbauen |

## Tests

| Check | Ergebnis |
|--------|----------|
| `npm run typecheck` | ✅ |
| `npm run build` | ✅ |
| `npm run verify:community-create` | ✅ |

## Release-Status

**Release Candidate** — https://unze-platform.vercel.app

Nach erfolgreichem Live-Test Community erstellen + Dashboard öffnen: **RC freigegeben für erste Communities**.
