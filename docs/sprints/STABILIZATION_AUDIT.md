# UNZE — Stabilisierung & Test-Audit (Phase 1)

> Keine neuen Kernfunktionen. Fokus: Fehlerbehebung, Konsistenz, manuelles Testing.
> Stand nach Stabilisierungs-Sprint.

## Behobene Probleme

### 1. Creator-Profil

| Vorher | Nachher |
|--------|---------|
| Creator-Karte auf Community-Seite nicht klickbar | Link zu `/creator/[username]` |
| Kein öffentliches Creator-Profil | Route `app/creator/[username]/page.tsx` |
| Link „Mehr Creator“ → `/discover?tab=creators` (404/Redirect) | Link → `/discover` |
| `CreatorCard` → Community-Suche statt Profil | Link → `/creator/[username]` |

**Profil zeigt:** Avatar, Beschreibung (Headline), Verifizierung, Communities, Gruppen/Dienstleistungen.

### 2. Bewertungslogik

**Ursache:** Getrennte Datenquellen — DB-Aggregate (`rating_avg`/`review_count`) vs. tatsächliche Review-Zeilen; Demo-Seed setzte fake 4.8/24 ohne Review-Einträge; Gruppen erbten Community-Bewertungen.

**Fixes:**

- `lib/utils/ratings.ts` + `components/ui/RatingSummary.tsx` — Stern nur bei `reviewCount > 0`
- `EntityReviewsSection` — Durchschnitt aus geladenen Reviews (konsistent mit Liste)
- `mapDiscoverGroupRow` — keine Community-Rating-Fallbacks mehr
- `CommunityGroupSection` — eigene Gruppen-Bewertungen
- Demo-Seed — Default `rating_avg: 0`, `review_count: 0`

**Bestehende Demo-Daten in Supabase korrigieren (optional):**

```sql
UPDATE public.communities
SET rating_avg = 0, review_count = 0
WHERE slug LIKE 'demo-%'
  AND NOT EXISTS (
    SELECT 1 FROM public.community_reviews r WHERE r.community_id = communities.id
  );
```

---

## Test-Checkliste

### Navigation

| Link | Route | Status |
|------|-------|--------|
| Home | `/` | ✅ implementiert |
| Discover | `/discover` | ✅ (500 behoben) |
| Erstellen (+) | Plus-Menü → Community/Dashboard | ✅ |
| Favoriten | `/favorites` | ✅ |
| Profil | `/profile` | ✅ |

### Discover (Migrationen 021 + 022)

| Tab | Abhängigkeit | Fallback |
|-----|--------------|----------|
| Communities | Kern-Schema | — |
| Gruppen | `group_type` (022) | Legacy-Query ohne Typ-Filter |
| Events | `community_events` (022) | Leere Liste |
| Dienstleistungen | `group_type = service` (022) | Leere Liste |

Warnbanner auf `/discover` wenn 021/022 fehlen.

### Community-Seite

| Element | Datei/Komponente |
|---------|------------------|
| Coverbild | `CommunityHeader` + `CommunityCoverVisual` |
| Plattform-Links | `CommunityPlatformLinksSection` |
| Details | Beschreibung, Social Proof |
| Gruppenliste | `CommunityGroupSection` |
| Bewertungen | `EntityReviewsSection` |
| Antrag stellen | `CommunityJoinPanel` |
| Favorit setzen | `FollowCommunityButton` |
| Creator (klickbar) | `CreatorProfileCard` → `/creator/[username]` |

### Gruppen-Seite

| Element | Status |
|---------|--------|
| Beschreibung | ✅ |
| Preis | ✅ (wenn `price_cents` gesetzt) |
| Dienstleistungs-Badge | ✅ (`group_type = service`) |
| Bewertungen | ✅ (konsistent) |
| Folgen/Entfolgen | ✅ `FollowGroupButton` |

### Favoriten

| Sektion | Quelle |
|---------|--------|
| Communities | `follows.target_type = community` |
| Gruppen | `follows.target_type = group` |
| Dienstleistungen | Gefolgte Gruppen mit `group_type = service` |
| Events | Abgeleitet aus gefolgten Communities (kein Event-Follow) |

### Profil — nur prüfen, nicht erweitern

Später geplant (nicht gebaut): Meine Bewertungen, Kommentare, Rollen, Abos, Rechnungen.

Siehe `docs/sprints/PROFILE_AND_FAVORITES_AUDIT.md`.

---

## Stripe — Dokumentation (Ist-Stand)

### Implementiert

| Feature | Datei | Beschreibung |
|---------|-------|--------------|
| Stripe Connect (Express) | `services/monetization/stripe-connect.service.ts` | Creator-Onboarding |
| Sandbox Checkout (Einmalzahlung) | `createSandboxCheckoutSession` | `mode: payment` |
| Webhook | `app/api/stripe/webhook/route.ts` | Nur `checkout.session.completed` → Referral-Ledger |
| Connect-UI | `components/referral/StripeConnectPanel.tsx` | Dashboard → Referrals |
| Schema | `subscriptions`-Tabelle | Vorbereitet, wenig genutzt |

### Nicht implementiert (bewusst zurückgestellt)

| Feature | Status |
|---------|--------|
| Einmalzahlung (Produkt-Checkout für Mitglieder) | Nur Sandbox-Demo für Creator |
| Monatlich / Halbjährlich / Jährlich | Kein Subscription-Checkout |
| Kündigung über Stripe Customer Portal | Kein Portal-Link, kein Webhook für `customer.subscription.deleted` |
| UNZE zeigt Kündigungsstatus | Schema-Felder existieren, UI fehlt |
| Dashboard: Kündigungen sichtbar | Nicht angebunden |

### Kündigungs-Flow (Zielbild vs. Realität)

**Ziel:** Nutzer kündigt → Stripe verwaltet → UNZE zeigt Status + Enddatum → Creator sieht im Dashboard.

**Aktuell:** Nur Checkout-Abbruch-Redirect (`/dashboard/referrals?checkout=cancel`). Echte Abo-Kündigungen werden nicht verarbeitet.

### Nächste Stripe-Schritte (nach Stabilisierung)

1. Stripe Products/Prices für Gruppen/Dienstleistungen
2. Checkout `mode: subscription` mit Intervallen (month, quarter, semiannual, year)
3. Webhooks: `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
4. Stripe Customer Portal Link im Nutzerprofil
5. Dashboard: Abonnenten, Kündigungen, Umsatz aus Webhook-Daten

---

## Creator-Dashboard — Darstellbarkeit (Readiness)

| Metrik | Daten vorhanden? | UI vorhanden? |
|--------|------------------|---------------|
| Mitglieder (aktiv/neu) | ✅ `community_members` | ✅ Members-Seite |
| Offene Anträge | ✅ `community_join_applications` | ✅ Requests-Seite |
| Gruppen + Mitglieder pro Gruppe | ✅ `community_groups` | ✅ Groups-Seite |
| Kündigungen | ⚠️ Schema only | ❌ |
| Event-Teilnehmer/Umsätze | ⚠️ Events ja, Umsätze nein | Teilweise |
| Dienstleistungs-Buchungen | ❌ | ❌ |
| Monatlicher Umsatz | ⚠️ `revenue_share_ledger` (Sandbox) | Referrals-Seite |
| Stripe-Status | ✅ Connect-Account-Feld | ✅ StripeConnectPanel |

**Fazit:** Verwaltung (Mitglieder, Anträge, Gruppen, Rollen) ist nutzbar. Monetarisierungs-Metriken warten auf Stripe-Abo-Integration.

---

## Manuelle Test-Reihenfolge

1. Navigation — alle 5 Bereiche durchklicken
2. Discover — 4 Tabs, Suche, Kategorie-Filter
3. Community öffnen — Creator-Karte klicken → Profil
4. Bewertung abgeben (eingeloggt) — prüfen ob Stern erscheint
5. Gruppe folgen → Favoriten prüfen
6. Creator-Dashboard — Mitglieder, Anträge, Gruppen
7. Stripe Sandbox (optional) — Connect + Test-Checkout

---

## Verwandte Dokumente

- `docs/PLATFORM_STRUCTURE_PHASE1.md`
- `docs/sprints/PROFILE_AND_FAVORITES_AUDIT.md`
- `docs/sprints/PHASE1_PLATFORM_PIVOT.md`
