# Profil & Favoriten — Bestandsaufnahme (Teststand)

> Stand nach Phase 1 + 2 · Keine neue Architektur geplant

---

## 1. Navigation — Favoriten

| Element | Status |
|---------|--------|
| Bottom-Nav Label | **Favoriten** (zuvor „Folge ich“) |
| Route | `/favorites` |
| Inhalt | Communities · Gruppen · Dienstleistungen · Events |

### Datenquellen Favoriten

| Typ | Mechanismus | Tabelle / Service |
|-----|-------------|-------------------|
| **Communities** | Explizit folgen | `follows` (`target_type = community`) → `getFollowedCommunities()` |
| **Gruppen** | Explizit folgen | `follows` (`target_type = group`) → `getFollowedGroups()`, Filter `group_type ≠ service` |
| **Dienstleistungen** | Explizit folgen (Gruppe vom Typ service) | `getFollowedGroups()`, Filter `group_type = service` |
| **Events** | Abgeleitet (kein Event-Follow) | `community_events` für IDs gefolgter Communities → `getUpcomingEventsForCommunities()` |

**Hinweis Events:** Es gibt noch **kein** `event_follows`. Events in Favoriten = kommende Termine aus Communities/Gruppen, denen der Nutzer folgt. Ein dediziertes Event-Follow wäre eine kleine additive Migration (`follows` erweitern oder `target_type = event`), **nicht** nötig für MVP-Test.

---

## 2. Profil — Meine Bewertungen

| Aspekt | Status |
|--------|--------|
| **UI auf `/profile`** | ❌ Nicht vorhanden |
| **Datenbank** | ✅ `community_reviews`, `group_reviews` (Migration 022) |
| **Service** | ⚠️ Teilweise — Lesen/Schreiben pro Entity, **kein** „Reviews by author“ |
| **Dashboard** | ❌ Kein Übersichts-Tab |

### Einfach ergänzbar?

**Ja.** Eine Query reicht:

```sql
SELECT * FROM community_reviews WHERE author_id = auth.uid()
UNION ALL … group_reviews …
```

Neue Funktion `getMyReviews(userId)` in `services/reviews/` + Sektion auf Profil oder `/profile/reviews`. **Keine neue Architektur.**

---

## 3. Profil — Meine Kommentare

| Aspekt | Status |
|--------|--------|
| **UI auf `/profile`** | ❌ Nicht vorhanden |
| **Bewertungs-Kommentare** | ✅ Tabelle `review_comments` (`author_id`) |
| **Post-Kommentare (Feed)** | ⚠️ Tabelle `comments` existiert, Feed **deaktiviert** |
| **Service** | ❌ Kein `getMyReviewComments()` |

### Einfach ergänzbar?

**Ja.** `SELECT * FROM review_comments WHERE author_id = …` + Join für Review-Kontext. Optional Post-Kommentare ausblenden (Feed aus). **Keine neue Architektur.**

---

## 4. Profil — Meine Rollen

| Aspekt | Status |
|--------|--------|
| **UI auf `/profile`** | ❌ Keine Rollen-Übersicht |
| **Creator-Badge** | ⚠️ Nur `profiles.is_creator` → Label „Creator“ |
| **Community-Rollen** | ✅ `community_members.role` (creator, admin, expert, moderator, member, verified_member) |
| **Bereits geladen** | ✅ `getMyMemberCommunities()` in Home-Service (nicht Profil) |
| **Dashboard** | ✅ Rollen pro Community unter `/dashboard/community/[slug]/roles` |

### Einfach ergänzbar?

**Ja.** `getMyMemberCommunities()` existiert bereits — auf Profil anzeigen mit `ROLE_LABELS` aus `lib/constants/dashboard.ts`. Gruppierung: Creator / Admin / Experte / Coach / Mitglied. **Keine neue Architektur.**

---

## 5. Profil — Was heute existiert (`/profile`)

| Bereich | Vorhanden |
|---------|-----------|
| Avatar, Name, Bio | ✅ (Settings unter `/profile/settings`) |
| Creator-Badge | ✅ (`is_creator`) |
| Links | Profil bearbeiten, Benachrichtigungen, Creator-Verifizierung, Verifizierungs-Status, Dashboard |
| Meine Bewertungen | ❌ |
| Meine Kommentare | ❌ |
| Meine Rollen | ❌ |
| Plattform-Verknüpfungen (Discord, …) | ❌ (nur Community-Ebene: `community_platform_links`) |

---

## 6. Empfehlung für Testphase

1. **Migrationen 021 + 022** in Supabase (Discover/Favoriten/Events/Bewertungen)
2. Test-Checkliste aus Phase-1-Dokument durchgehen
3. **Erst danach** Profil-Sektionen (Bewertungen, Kommentare, Rollen) — je ~0,5 Sprint, additive Queries

**Bewusst zurückgestellt:** Event-Follow, Profil-Plattform-Links, eigene Profil-Subroutes.
