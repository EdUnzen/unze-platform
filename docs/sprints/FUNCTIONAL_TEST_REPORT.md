# UNZE — Funktionstest & Stabilisierungs-Abschluss

> Datum: Stabilisierungs-Sprint (Phase 1)  
> Keine neuen Features — Prüfung, Fehlerbehebung, Dokumentation.

---

## Executive Summary

| Kategorie | Status |
|-----------|--------|
| Kern-Navigation & Communities | **Produktionsreif** |
| Gruppen & Dienstleistungen | **Produktionsreif** (Migration 022 empfohlen) |
| Bewertungen | **Produktionsreif** (nach Migration 022 + optional 023) |
| Creator-Profil | **Produktionsreif** |
| Events (Discover) | **Eingeschränkt** — Migration 022 fehlt; Event-Erstellung ohne UI |
| Stripe Abos/Kündigung | **Nicht produktionsreif** — nur Sandbox Einmalzahlung |
| Migrationen 021/022 | **Nicht ausgeführt** auf verbundener Supabase-Instanz |

---

## 1. Migrationen (021 + 022)

### Prüfung

```bash
npm run check:migrations
```

**Ergebnis (verbundene Supabase-Instanz):**

| Check | Status |
|-------|--------|
| Kern-Schema (`communities`) | ✅ |
| 021 — `platform_feature_flags` | ❌ fehlt |
| 021 — `feed_posts` Flag | ❌ fehlt |
| 022 — `community_events` | ❌ fehlt |
| 022 — `group_type` | ❌ fehlt |
| 022 — `community_reviews` | ❌ fehlt |
| 022 — `group_reviews` | ❌ fehlt |

**Production** (`unze-platform.vercel.app/discover`): Gelber Hinweis aktiv → bestätigt fehlende Migrationen.

### Aktion erforderlich (manuell in Supabase SQL Editor)

1. `database/migrations/021_platform_feature_flags.sql`
2. `database/migrations/022_platform_core_entities.sql`
3. Optional: `database/migrations/023_sync_rating_aggregates.sql` (Bewertungs-Zähler bereinigen)

Nach erfolgreicher Ausführung:

- Gelber Discover-Hinweis verschwindet automatisch
- Events-Tab, Dienstleistungen-Typ, Bewertungs-Tabellen funktionieren vollständig

---

## 2. Creator-Profil

| Anforderung | Status |
|-------------|--------|
| Creator-Karte auf Community-Seite klickbar | ✅ `CreatorProfileCard` → `/creator/[username]` oder `/creator/id/[id]` |
| Öffentliches Profil | ✅ |
| Avatar | ✅ |
| Beschreibung | ✅ (Creator-Headline) |
| Communities | ✅ |
| Gruppen | ✅ |
| Verifizierung | ✅ Badge |
| Bewertungen | ✅ `CreatorReviewsSection` (Netzwerk-Bewertungen) |

---

## 3. Bewertungslogik

| Anforderung | Status |
|-------------|--------|
| Durchschnitt = geladene Reviews | ✅ `EntityReviewsSection` berechnet aus Liste |
| Kein Stern bei 0 Reviews | ✅ `RatingSummary` / `hasReviews()` |
| Kein „Noch keine Bewertungen“ + Zähler | ✅ behoben |
| DB-Aggregate nach Submit | ✅ `refreshRatingAggregate()` in Review-Action |
| Demo-Daten bereinigen | ⚠️ `023_sync_rating_aggregates.sql` ausführen |

---

## 4. Vollständiger Funktionstest (Nutzerwege)

Legende: ✅ funktioniert · ⚠️ eingeschränkt · ❌ fehlt / blockiert

| Nutzerweg | Status | Details |
|-----------|--------|---------|
| **Community erstellen** | ✅ | `/create/community` → Dashboard |
| **Gruppe erstellen** | ✅ | Dashboard → Gruppen / Community bearbeiten |
| **Dienstleistung erstellen** | ⚠️ | Als Gruppentyp `service` im Group-Manager; braucht Migration 022 für `group_type` |
| **Event erstellen** | ❌ | Kein UI/API — Events nur via DB/Seed; Discover liest `community_events` |
| **Community folgen** | ✅ | `FollowCommunityButton` → Favoriten |
| **Gruppe folgen** | ⚠️ | UI vorhanden; braucht Migration 022 (`follows.target_type = group`) |
| **Favorit setzen** | ✅ | Communities + Gruppen in `/favorites` |
| **Antrag stellen** | ✅ | Join-Flow je nach Community-Einstellung |
| **Bewertung schreiben** | ⚠️ | UI vorhanden; braucht Migration 022 (Review-Tabellen) |
| **Plattform-Link öffnen** | ✅ | `CommunityPlatformLinksSection` — externe Links |

### Navigation

| Link | Route | HTTP (Production) |
|------|-------|-------------------|
| Home | `/` | ✅ 200 |
| Discover | `/discover` | ✅ 200 |
| Erstellen (+) | Plus-Menü | ✅ |
| Favoriten | `/favorites` | ✅ 200 |
| Profil | `/profile` | ✅ 200 |

### Discover-Tabs

| Tab | Status ohne 022 | Status mit 022 |
|-----|-----------------|----------------|
| Communities | ✅ | ✅ |
| Gruppen | ⚠️ Fallback | ✅ |
| Events | ❌ leer | ✅ |
| Dienstleistungen | ❌ leer | ✅ |

---

## 5. Stripe-Prüfung (nur Dokumentation)

| Modell | Implementiert | Anmerkung |
|--------|---------------|-----------|
| **Einmalzahlung** | ⚠️ Sandbox | `createSandboxCheckoutSession` — Demo für Creator, kein Mitglieder-Checkout |
| **Monatlich** | ❌ | Kein Subscription-Checkout |
| **Halbjährlich** | ❌ | — |
| **Jährlich** | ❌ | — |
| **Kündigung** | ❌ | Kein Customer Portal; Webhook nur `checkout.session.completed` |

### Kündigungslogik (Zielbild)

- **Stripe soll:** Abo verwalten, Kündigung, Enddatum, Rechnungen
- **UNZE soll:** Status anzeigen, Creator-Dashboard informieren
- **Aktuell:** Schema `subscriptions` vorbereitet; keine Webhooks für `customer.subscription.*`; keine Dashboard-Anzeige

**Fazit:** Stripe-Connect + Sandbox-Einmalzahlung testbar. Abo-Modelle und Kündigungen sind **architektonisch vorbereitet**, aber **nicht produktionsreif**.

---

## 6. Creator-Dashboard (Readiness, keine neuen Features)

| Metrik | Darstellbar? |
|--------|--------------|
| Mitglieder | ✅ |
| Offene Anträge | ✅ |
| Gruppen | ✅ |
| Umsatz (Sandbox) | ⚠️ Referrals-Ledger |
| Aktive Abonnenten | ❌ |
| Kündigungen | ❌ |
| Events / Dienstleistungen-Umsatz | ❌ |

---

## Was funktioniert ✅

- Navigation (Home, Discover, Erstellen, Favoriten, Profil)
- Community erstellen, bearbeiten, anzeigen
- Gruppen erstellen (Gruppe + Dienstleistung als Typ)
- Community/Gruppe folgen (Favoriten)
- Join-Anträge
- Bewertungs-UI (nach Migration 022)
- Plattform-Links
- Verifizierung
- Creator-Profil (öffentlich, klickbar)
- Creator-Dashboard: Mitglieder, Anträge, Gruppen, Rollen, Einstellungen
- Discover Communities-Tab
- Konsistente Bewertungsanzeige (Code-Ebene)

---

## Was nicht funktioniert ❌

- **Migrationen 021/022** auf Production-Supabase (blockiert Events, Reviews, Dienstleistungen-Typ)
- **Event erstellen** — kein Creator-UI
- **Stripe Abos** (monatlich, halbjährlich, jährlich)
- **Stripe Kündigung** / Customer Portal
- **Dashboard:** Umsatz-Metriken, Kündigungen, Abonnenten (live)

---

## Gefundene Fehler / Behoben in diesem Sprint

| Fehler | Status |
|--------|--------|
| Discover HTTP 500 (`unstable_cache`) | ✅ behoben (vorheriger Commit) |
| Bewertung 4.8/24 + „Noch keine Bewertungen“ | ✅ behoben |
| Creator-Karte nicht klickbar | ✅ behoben |
| Creator-Profil ohne Bewertungen | ✅ ergänzt |
| Discover zeigt Banner auch bei OK-Migration | ✅ nur bei fehlenden Migrationen |
| `/discover?tab=creators` kaputt | ✅ entfernt |

---

## Produktionsreife Bereiche

| Bereich | Reife |
|---------|-------|
| Community-Verzeichnis & Detail | **Hoch** |
| Gruppen & Dienstleistungen (Anzeige) | **Mittel** (022 nötig) |
| Favoriten | **Hoch** |
| Bewertungen | **Mittel** (022 + 023 nötig) |
| Events | **Niedrig** (022 + Create-UI fehlt) |
| Monetarisierung (Stripe) | **Niedrig** (Sandbox only) |
| Creator-Dashboard Verwaltung | **Hoch** |
| Creator-Dashboard Finanzen | **Niedrig** |

---

## Nächste Schritte (Entscheidung)

1. **Jetzt:** Migrationen 021 + 022 (+ optional 023) in Supabase ausführen
2. **Manuelles Testing** der Nutzerwege nach Migration
3. **Dann entscheiden:** Design-Veredelung · Creator-Dashboard Finanzen · Profil-Erweiterungen · Event-Create-UI · Stripe Abos

---

## Hilfskommandos

```bash
npm run check:migrations    # 021/022 Status
npm run validate            # Typecheck + Lint + Build
npm run test:e2e-urls       # Route Smoke-Test (Dev-Server)
```

Siehe auch: `docs/sprints/STABILIZATION_AUDIT.md`
