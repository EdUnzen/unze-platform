# UNZE — Universelles Netzwerk

Mobile-first PWA Community- und Creator-Plattform.

## Stack

- Next.js 15 · React 19 · Tailwind CSS
- Supabase (geplant) · Vercel · GitHub

## Entwicklung

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) (am besten mit mobilem Viewport).

## Validierung

Nach jeder größeren Änderung:

```bash
npm run validate
```

Schnellprüfung (ohne Build):

```bash
npm run validate:quick
```

## Projektstruktur

| Ordner | Zweck |
|--------|--------|
| `app/` | Next.js App Router |
| `components/` | UI-Komponenten (navigation, community, pwa, …) |
| `services/` | Domänen-Services |
| `architecture/` | Systemarchitektur (Quelle der Wahrheit) |
| `docs/` | Setup, Testing, Design |
| `database/` | Supabase-Schema & Policies (Dokumentation) |

## Supabase Setup

1. `.env.example` → `.env.local` kopieren
2. Migrationen in Supabase SQL Editor ausführen (`database/migrations/`)
3. Auth Redirect: `http://localhost:3000/auth/callback`

Details: [database/README.md](database/README.md)

## Phase 2 — Status

- [x] Next.js + Tailwind + TypeScript
- [x] Mobile Shell + Bottom Navigation + Plus-Menü
- [x] Community Cards (modern, card-basiert)
- [x] Discover mit Tabs + Feed aus DB
- [x] PWA Manifest + Install-Prompt (Android / iOS)
- [x] Validierungsskript
- [x] Supabase Schema, RLS, Services
- [x] Auth (E-Mail), Profile, Follow-System
- [x] Stripe-Vorbereitung (`subscriptions`-Tabelle)
- [x] Push-Vorbereitung (`push_subscriptions`, `notifications`)
- [x] Creator Dashboard (Hub, Mitglieder, Gruppen, Rollen, Badges, Monetarisierung)
- [ ] Stripe-Integration (Phase 4)
- [ ] Web Push aktivieren
