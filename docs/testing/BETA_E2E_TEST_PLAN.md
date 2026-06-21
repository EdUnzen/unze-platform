# UNZE Beta — End-to-End Testplan

Stand: Finalisierung vor oeffentlicher Beta. Ergaenzt `npm run test:beta` (automatischer Smoke).

## Rollen simulieren

| Rolle | Account | Kernpfade |
|-------|---------|-----------|
| Gast | ausgeloggt | `/`, `/discover`, Community-Seite, Join-Hinweis |
| Nutzer | registriert, kein Mitglied | Login, Profil, Tickets, UNZE-ID QR |
| Mitglied | `member` | Community-Feed, Gruppe, Event-Ticket buchen |
| Moderator | `moderator` | Antraege, Scanner, Auszeichnung vergeben |
| Administrator | `admin` | Zugang, Rechte, Events, Mitglieder |
| Creator | `creator` | Dashboard, Crowd Partner, Monetarisierung |

## Pflicht-Szenarien

### Community & Struktur
- [ ] Community erstellen (`/create/community`)
- [ ] Gruppe anlegen (Dashboard Groups)
- [ ] Event anlegen (Dashboard Events)
- [ ] Banner/Settings speichern

### Zugang & Requirements
- [ ] Beitrittsmodus (offen/privat/geschlossen)
- [ ] Pflicht-Plattform-IDs (gruppiert)
- [ ] Requirement-Set: Pflicht + UND/ODER
- [ ] Mitglieder-Vorschau: erfuellt / fehlt (Community-Join)
- [ ] Scanner: UNZE-ID + Ticket

### Auszeichnungen
- [ ] Sammlung anlegen
- [ ] Auszeichnung an Mitglied vergeben
- [ ] Profil `/profile/auszeichnungen` pruefen
- [ ] Kategorie-Label sichtbar

### Crowd Partner
- [ ] Seite `/dashboard/crowd-partner` — 3-Schritte-Erklaerung
- [ ] Partner verknuepfen (Sandbox)
- [ ] Kein Referral-Wording in UI

### Monetarisierung (Stripe Test)
- [ ] Checkout Sandbox
- [ ] Webhook Ledger
- [ ] Kuendigung / Rejoin

### Governance
- [ ] Rollenwechsel Mitgliederliste
- [ ] Granulare Rechte Override
- [ ] Beitrittsantrag annehmen/ablehnen

## Automatisierung

```bash
npm run check:utf8
npm run build
npm run test:phase0
npm run test:beta
npm run test:event-tickets   # falls konfiguriert
```

## Abnahmekriterium Beta

- Alle Pflicht-Szenarien ohne Blocker
- Supabase Review: keine offenen P0/P1 (siehe `docs/security/SUPABASE_BETA_REVIEW.md`)
- Keine Mojibake in UI (UTF-8 CI gruen)
