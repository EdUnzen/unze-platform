# Phase 1.4 — Kündigungs- und Entfernungslogik

**Datum:** 2026-06-13  
**Referenz:** Roadmap Phase 1 — Stabilität  
**Status:** Abgeschlossen (Kern-Flow)

---

## Ziel

Creator sollen bei Kündigung, Abo-Ende oder freiwilligem Austritt informiert werden und Mitglieder über eine **„Zu entfernen"**-Queue aus externen Kanälen (WhatsApp, Discord, Telegram) entfernen können. Mitgliedschaft wird per **Soft-Delete** beendet — Historie bleibt erhalten.

---

## Umgesetzte Änderungen

| # | Maßnahme | Datei(en) |
|---|----------|-----------|
| 1 | Tabelle `community_member_removal_tasks` + RPC `soft_remove_community_member_by_user` | `database/migrations/029_community_member_removal_tasks.sql` |
| 2 | Removal-Task Repository & Service | `services/lifecycle/removal-task.repository.ts`, `removal-task.service.ts` |
| 3 | Membership-Sync: Soft-Remove + Queue statt Hard-Delete | `services/monetization/membership-sync.service.ts` |
| 4 | Stripe-Webhook übergibt `cancelAtPeriodEnd` + `currentPeriodEnd` | `stripe-webhook.service.ts` |
| 5 | Community verlassen → Soft-Remove + Queue `user_left` | `member.repository.ts`, `member.service.ts` |
| 6 | Creator entfernt Mitglied → Soft-Remove (kein Hard-Delete) | `member.service.ts`, `app/dashboard/actions.ts` |
| 7 | Dashboard „Zu entfernen"-Panel + Bestätigung | `PendingRemovalPanel.tsx`, `removal-actions.ts`, `members/page.tsx` |
| 8 | Badge auf Overview & Quick-Nav | `DashboardAttentionPanel.tsx`, `DashboardQuickNav.tsx`, `page.tsx` |
| 9 | Migration-Script | `scripts/apply-migration-029.mjs`, `npm run db:migrate:029` |

---

## Flow

```
Abo gekündigt (cancel_at_period_end)
  → Mitglied bleibt bis Periodenende aktiv
  → Queue: subscription_canceling + Creator-Benachrichtigung

Abo beendet (canceled / unpaid / inactive)
  → Soft-Remove in community_members
  → Queue: subscription_ended + Creator-Benachrichtigung

Nutzer verlässt Community
  → Soft-Remove
  → Queue: user_left + Creator-Benachrichtigung

Creator bestätigt in „Zu entfernen"
  → Task status = confirmed
  → Audit-Log
  → (Mitglied war ggf. bereits soft-deleted)
```

---

## Migration anwenden

```bash
npm run db:migrate:029
```

Voraussetzung: `SUPABASE_DB_PASSWORD` und `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`.

---

## Tests

| Check | Ergebnis |
|-------|----------|
| `npm run validate:quick` | ✅ |
| `npm run build` | ✅ |
| Manueller Flow | Nach Deploy + Migration |

### Manueller E2E-Test

1. Migration 029 auf Supabase anwenden
2. Premium-Mitglied kündigt Abo (Stripe Customer Portal)
3. Creator-Dashboard: Badge „Zu entfernen", Panel auf Mitglieder-Seite
4. Creator bestätigt Entfernung
5. Mitglied verlässt Community freiwillig → erneut in Queue
6. Abo-Ende nach Kündigung → Soft-Remove, kein Hard-Delete in DB

---

## Offene Punkte / Folge-Phasen

| Punkt | Phase |
|-------|-------|
| Passwort vergessen | 1.5 |
| Aggregiertes Creator Task Center | 2.x |
| `is_community_member()` SQL ignoriert `deleted_at` | Backlog |

---

## Nächster Schritt

**Phase 1.5 — Passwort vergessen** (`resetPasswordForEmail` + Login-UI)
