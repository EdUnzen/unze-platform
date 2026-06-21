# Supabase Production Review — UNZE Beta

Stand: Finalisierung vor oeffentlicher Beta. Scope: RLS, Auth, Storage, RPC, DSGVO, Ops.

## Zusammenfassung

| Bereich | Status | Risiko |
|---------|--------|--------|
| RLS Community-Scope | Gut | P2 — einzelne Tabellen nur SELECT fuer authenticated |
| Requirement/Credential CRUD | Behoben (037) | war P1 |
| Service Role Key | Server-only | P1 wenn in Client/Repo leaked |
| RPC SECURITY DEFINER | Ueblich | P2 — regelmaessig pruefen |
| Storage | Bucket-Policies pruefen | P2 |
| Realtime | Nicht produktiv genutzt | OK |
| Rate Limiting | Vercel/Supabase Default | P2 — API-Routen manuell |
| Audit Logs | `unze_id_verifications`, Platform Events | P3 — erweiterbar |
| Backups | Supabase Pro Dashboard | Ops — verifizieren |
| DSGVO | Need-to-know Scanner | Gut |

## Row Level Security

### Staerken
- `community_members` respektiert `deleted_at` (Migration 030)
- `can_manage_community` / `can_moderate_community` zentral
- `user_credentials`: own + manage scope
- `event_tickets`: own + manage

### Behoben in 037
- `requirement_sets`, `requirement_nodes`, `credential_collections`: INSERT/UPDATE/DELETE fuer authenticated + WITH CHECK

### Offen / P2
- `requirement_sets_select`: USING (TRUE) — lesbar fuer alle Auth-User (OK fuer Engine, keine Secrets)
- `credentials_select_community`: USING (TRUE) — Credential-Namen oeffentlich lesbar (bewusst fuer UI)
- Empfehlung: Keine PII in `credentials.description` ohne Freigabe

## Authentifizierung
- Supabase Auth + Middleware Session
- Passwort-Reset implementiert (Sprint 1)
- `profiles` RLS aus 002 — unveraendert pruefen bei Beta

## Service Keys
- `SUPABASE_SERVICE_ROLE_KEY` nur in:
  - `lib/supabase/admin.ts`
  - Stripe Webhook, Owner Center, Removal Tasks, Referral Ledger
- **Nie** in `NEXT_PUBLIC_*` oder Client Components
- Vercel: Secret Scope Production + Preview getrennt halten

## RPC-Funktionen (SECURITY DEFINER)
| RPC | Zweck | Risiko |
|-----|-------|--------|
| `evaluate_requirements` | Engine | OK — read-only eval |
| `grant_credential` | Vergabe | OK — moderate check / event_check_in |
| `check_in_event_ticket` | Check-in | OK — manage community |
| `verify_unze_id` | Scanner | OK — Need-to-know |
| `resolve_unze_public_id` | Identity | OK — UUID only |

Empfehlung: Keine neuen DEFINER-RPCs ohne Permission-Guard.

## Storage
- Proof/Banner Uploads ueber Server Actions
- Admin Client fuer Storage — pruefen Bucket policies in Supabase Dashboard:
  - `avatars`, `banners`, `proofs` — public read nur wo noetig
  - Upload nur authenticated + path prefix user id

## Indizes & Performance
- Bestehend: Migration 020, Event/Ticket Indizes
- Empfehlung Beta: `EXPLAIN ANALYZE` auf:
  - `community_members` by community_id
  - `user_credentials` by user_id
  - `requirement_sets` by resource

## Realtime
- Nicht aktiv in Production UI — kein Beta-Blocker

## DSGVO
- Scanner: `allowed | denied` ohne Credential-Liste (verify_unze_id)
- Profil: Auszeichnungen visibility `public | private | archived`
- Audit: `unze_id_verifications` — Retention Policy in Supabase festlegen (90 Tage Vorschlag)

## Backups & Ops
- [ ] Supabase Point-in-Time Recovery aktiviert (Pro)
- [ ] Vercel Deployment Protection fuer Preview
- [ ] `.env.local` nie committen

## Rate Limiting
- Kein app-seitiges Rate Limit auf Server Actions — P2 fuer Post-Beta
- Stripe Webhook: Signaturpruefung vorhanden

## Naechste Schritte Post-Beta
1. Storage Bucket Policy Audit im Supabase UI dokumentieren
2. Optional: `rate-limit` Middleware fuer `/auth/login`
3. Audit-Log Retention Job
4. Penetration Test auf RPC-Injection (parameterized — aktuell OK)

## Migrationen Beta-Finalisierung
- `038_beta_finalization.sql`: `credentials.category`, `evaluate_requirements.satisfied[]`
- Anwenden: `npm run db:migrate:038`
