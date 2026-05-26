# Sprint 2 — Feed-Interaktion, Social Proof & Dynamik

**Status:** abgeschlossen (deploybar)  
**Basis:** Sprint 1 (GroupCards, Discover-Gruppen, Demo-Labeling)

## Ziele

- Plattform lebendiger, moderner und vertrauenswürdiger
- Feed-Interaktion (Likes, Kommentare) auf bestehendem Schema
- Swipe-Feed-Vorbereitung (Discover)
- DB-basierte Aktivitätsindikatoren
- Badge-System vervollständigen
- Reviews vorbereiten (Types, keine Migration)

## Lieferumfang

### Feed & Interaktion
| Feature | Dateien |
|---------|---------|
| Angereicherter Feed (Autor, Community, Like-Status) | `services/feed/feed.service.ts` |
| Like-Toggle | `services/feed/like.*`, `components/feed/PostLikeButton.tsx` |
| Kommentare lesen/schreiben | `services/comments/*`, `CommentList`, `CommentForm` |
| Post-Detailseite | `app/post/[id]/page.tsx` |
| Feed-Cards (memo) | `components/feed/FeedPostCard.tsx` |
| Discover: Liste/Swipe-Umschalter | `components/feed/FeedDiscoverView.tsx` |

### Discover & Community
| Feature | Dateien |
|---------|---------|
| Wöchentliche Post-Aktivität pro Community | `services/platform/activity-stats.service.ts` |
| GroupCards: Demo-Label + DB-Fallback | `CommunityGroupCard.tsx` |
| Social-Proof-Leiste | `components/social/SocialProofBar.tsx`, `CommunitySocialProof.tsx` |
| Community-Feed auf Detailseite | `app/community/[slug]/page.tsx` |
| Home: „Aktuell im Netzwerk“ | `app/page.tsx` |

### Badges
| Feature | Dateien |
|---------|---------|
| `grantBadgeToMember` → `user_badges` | `services/badges/badge.repository.ts` |
| Dashboard-Action | `app/dashboard/actions.ts` → `grantBadgeAction` |
| Visuelle Badge-Chips | `components/badges/UserBadgeChip.tsx` |
| Demo-Seed: 4 Badges + Grants | `scripts/seed-demo-platform.mjs` |

### Dashboard
| Feature | Dateien |
|---------|---------|
| ActivityFeed mit Domain-Icons | `components/dashboard/ActivityFeed.tsx` |
| BadgeManager aktualisiert | `components/dashboard/BadgeManager.tsx` |

### Performance
- `React.memo` auf `CommunityCard`, `CommunityGroupCard`, `FeedPostCard`
- Keine zusätzlichen DB-Migrationen

## Nicht enthalten (Sprint 3+)

- Vollständiges Review-Submit-System (nur `types/review.ts` vorbereitet)
- TikTok-Vollbild-Swipe mit Gesten-Bibliothek
- Algorithmischer Discover-Feed
- Stripe / Monetarisierung

## Verifikation

```bash
npm run build
npm run seed:demo      # Badges + Posts
npm run verify:demo
E2E_BASE_URL=https://unze-platform.vercel.app node scripts/test-e2e-urls.mjs
```

## Manuelle Checks

- [ ] Discover → Feed → Swipe-Ansicht
- [ ] Post öffnen → Like + Kommentar (eingeloggt)
- [ ] Community-Seite → Feed-Sektion + Social Proof
- [ ] Home → „Aktuell im Netzwerk“
- [ ] Dashboard → Badges sichtbar nach Seed
