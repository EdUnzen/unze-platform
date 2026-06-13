# Phase 1.1 — Performance & Skalierung

**Datum:** 2026-06-13  
**Referenz:** `Optimierung und Finalisierung/02_Performance_und_Skalierung.pdf`  
**Status:** Abgeschlossen (Quick Wins)

---

## Umgesetzte Änderungen

| # | Maßnahme | Datei(en) | Nutzen |
|---|----------|-----------|--------|
| 1 | Review-Kommentare batch-laden (kein N+1) | `services/reviews/review.repository.ts`, `review.service.ts` | 1 Query statt bis 20 pro Reviews-Sektion |
| 2 | Activity-Stats: SQL `count` + `head: true` | `services/platform/activity-stats.service.ts` | Korrekte Zählung ohne 5000-Row-Scan |
| 3 | Referral-Enrichment batchen | `services/referral/referral.service.ts` | 1 Profil-Query statt N |
| 4 | Discover-Cache invalidieren | `lib/cache/revalidate-discover.ts` + 7 Action-Dateien | `revalidateTag("discover")` bei Mutationen |
| 5 | Gruppen-Zählung per SQL COUNT | `services/community/community-counts.ts` | Kein Row-Fetch für group_type |

---

## Tests

| Check | Ergebnis |
|-------|----------|
| `npm run validate:quick` | ✅ Pass |
| `npm run build` | ✅ Pass (11.1s compile) |
| Production TTFB (nach Deploy ausstehend) | Lokal Build OK |

**Hinweis:** Production-Messung vor Deploy weiterhin Baseline (~253 ms Ø). Nach Deploy erneut `npm run measure-performance` ausführen.

---

## Gefundene Probleme (bestehend, nicht in 1.1)

- Feed-Virtualisierung fehlt (lange Listen)
- Kein `next/image` für Cover-Bilder
- Engagement-Counter Read-then-Write (2 Queries/View)
- Notification Fan-out pro Empfänger
- PWA ohne Offline-Shell
- Migrationen 025–028 in Prod manuell verifizieren

---

## Offene Punkte (Phase 1.1 Rest / später)

| Punkt | Priorität | Phase |
|-------|-----------|-------|
| Feed-Virtualisierung | Mittel | 1.1 optional / später |
| `next/image` + Upload-Resize | Mittel | später |
| RPC für batch post counts (1 Query statt N head) | Niedrig | bei >100 Communities |
| Lighthouse CI + Bundle-Budget | Niedrig | Phase 5 |
| Atomic increment für Engagement | Mittel | später |

---

## Nächster Schritt

**Phase 1.2 — Stripe & Monetarisierung** (`03_Stripe_und_Monetarisierung.pdf`)

1. Premium-Join Bug (Subscription-Check in `resolveJoinBlockReason`)
2. Auto-Join nach Checkout-Webhook
3. Webhook Metadata + Fehlerbehandlung + Idempotency
4. Refund-Handler
