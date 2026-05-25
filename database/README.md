# UNZE Datenbank (Supabase)

## Setup

1. [Supabase-Projekt](https://supabase.com/dashboard) erstellen
2. SQL Editor öffnen
3. Migrationen **in Reihenfolge** ausführen:
   - `migrations/001_initial_schema.sql`
   - `migrations/002_rls_policies.sql`
   - `migrations/004_community_groups_discover.sql`
   - `migrations/005_dashboard_member_access.sql`
   - optional: `migrations/003_seed_dev.sql`
4. `.env.local` aus `.env.example` kopieren und Keys eintragen
5. Auth → URL Configuration: Site URL `http://localhost:3000`, Redirect `http://localhost:3000/auth/callback`

## Struktur

| Tabelle | System |
|---------|--------|
| `profiles` | Auth / Nutzer |
| `creator_profiles` | Creator-System |
| `communities` | Community-System |
| `community_members` | Rollen |
| `follows` | Follow-System |
| `posts` / `comments` | Feed |
| `subscriptions` | Stripe-Vorbereitung |
| `notifications` / `push_subscriptions` | Push-Vorbereitung |
| `badges` / `user_badges` | Badges |

## Rollen (Community)

`creator` → `admin` → `moderator` → `member`

Kritische Rechte nur für `creator` (Löschen, Monetarisierung).

## Policies

Siehe `migrations/002_rls_policies.sql` und `policies/README.md`.
