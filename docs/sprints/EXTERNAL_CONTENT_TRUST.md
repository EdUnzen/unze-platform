# Externe Inhalte, Vertrauen & Moderation

## Prinzip

UNZE bleibt **Meta-Layer** — kein TikTok-/YouTube-/Discord-Ersatz.

- **Kein Re-Upload** fremder urheberrechtlich geschützter Medien
- **Embed / Link / Vorschau** von der Originalplattform
- **Community-Owner** verantwortlich für externe Inhalte
- **UNZE** moderiert bei Meldungen (Reports, Sperren)

## Bestehende Systeme (beibehalten)

| System | Status |
|--------|--------|
| `ReportDialog` + `report.service` | Erweitert (neue Meldegründe) |
| Dashboard `/moderation` | Unverändert |
| `ExternalLinkTrustNotice` | Erweitert (`compact`) |
| Community `external_url` | Unverändert |
| Rollen/Permissions (`manage_reports`, `ban_members`) | Unverändert |

## Neu / Ergänzt

### Externe Content-Auflösung
`lib/external/resolve-external-content.ts`

- Erkennt YouTube, TikTok, Instagram, Facebook, Discord, Telegram, WhatsApp, Webseiten
- **iframe-Embed** nur für YouTube/TikTok (offizielle Embed-URLs)
- Sonst **Link-Vorschaukarte** mit Plattform-Icon

### Feed-Darstellung
`components/external/ExternalContentCard.tsx`

- Plattform-Icon + Host
- Vorschau (Thumbnail oder Embed auf Detailseite)
- „Original auf [Plattform] öffnen“
- Trust-Hinweis auf Detailseite

### Composer-Policy
- Feld **Externer Link** getrennt von eigenen Bild-URLs
- YouTube/TikTok-Links werden **nicht** in `media[]` gespeichert
- `ExternalContentPolicyNotice` — kein Re-Upload

### Meldegründe
`lib/constants/reports.ts`

- Urheberrecht / Rechteverletzung
- Externer Scam-Link

### Post-Detail
- Beitrag melden (`ReportDialog`)
- Moderations-Hinweis

## Metadaten (keine Migration nötig)

Posts nutzen `metadata` JSONB:

```json
{
  "externalUrl": "https://youtube.com/...",
  "externalPlatform": "youtube",
  "contentSource": "external_embed"
}
```

## Demo-Seed

Clip-Post nutzt YouTube-Embed statt Fake-Video-URL in `media[]`.
