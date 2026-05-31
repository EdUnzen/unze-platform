# Phase 2 — Gruppen-Detail, Follow, Bewertungen

## Implementiert

- **Gruppen-Detailseite:** `/community/[slug]/group/[groupSlug]`
- **Gruppen-Follow:** `FollowGroupButton` + `toggleFollowGroup`
- **Bewertungen:** `EntityReviewsSection` mit Sterne-Rating + Kommentare zu Bewertungen
- **Community-Seite:** Bewertungen live angebunden (Mitglieder können bewerten)
- **Gruppen-Manager:** Typ `group` | `service` + optionaler Preis

## Migrationen (aus Phase 1)

021 + 022 müssen in Supabase aktiv sein.

## Nächste Schritte

- Event-Erstellung im Dashboard
- Swipe-Modus auf Discover-Entity-Cards
- Gruppen-Mitgliedschaft (`group_members`)
